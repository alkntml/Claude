import { z } from "zod";
import { userDiscount } from "@/lib/discount-server";
import { INTERNAL_LINK_RE } from "@/lib/notify";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { addDays } from "@/lib/admin-users";
import { SINGLE_PLAN_DAYS, YEARLY_DAYS } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";
import { adminClient } from "@/lib/supabase/admin";
import { effectiveLimits, lockReasons, setWorkLock, usageSummary } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };

/** Yönetim → kullanıcı ayrıntısı: profil, bu ayki kullanım ve maliyet, kilit, projeler, krediler, indirme hakları */
export const GET = route<Ctx>("admin.user", async (_req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const db = adminClient();
  const { data: profile } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) throw new ApiError(404, "Kullanıcı bulunamadı");
  const [usage, limits, projects, credits, plan, margin, org, messages, purchases, legal, requests] = await Promise.all([
    usageSummary(id),
    effectiveLimits(id, profile.plan_id),
    db.from("projects").select("id, title, work_type, status, updated_at").eq("user_id", id).order("updated_at", { ascending: false }).limit(20),
    db.from("usage_credits").select("kind, amount, reason, expires_at, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    db.from("plans").select("name, price_monthly").eq("id", profile.plan_id).maybeSingle(),
    getSetting("billing.margin"),
    db.from("organization_members").select("role, organizations(name, plan_id)").eq("user_id", id).limit(1),
    // D146: bu kullanıcıya gönderilen yönetici mesajları (okundu bilgisiyle)
    db.from("notifications").select("id, data, read_at, created_at").eq("user_id", id).eq("kind", "admin_message").order("created_at", { ascending: false }).limit(30),
    // D109: satın alma kayıtları (tablo yoksa boş döner)
    db.from("plan_purchases").select("plan_id, payer_name, payer_phone, amount_try, note, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    // D154: hukuki belge kabulleri ve bilgilendirmeler (tablo yoksa — migration 39 öncesi — boş) + KVKK veri talepleri
    db.from("legal_acceptances").select("doc, version, kind, source, context, accepted_at").eq("user_id", id).order("accepted_at", { ascending: false }).limit(50).then((r) => r.data ?? [], () => []),
    db.from("data_requests").select("kind, status, created_at, completed_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20).then((r) => r.data ?? [], () => []),
  ]);
  // Tek Proje (D104): paket atandığından beri toplam maliyet ve %40 sınırı
  const single = profile.plan_id === "single"
    ? ((await db.rpc("single_cost_status", { p_user: id })).data?.[0] ?? null) as { cost_usd: number; budget_usd: number; pct: number; started_at: string | null } | null
    : null;
  // D145: kayıtta bağlanan indirim kodu (paket atarken indirimli fiyat gösterilir)
  const discount = await userDiscount(profile);
  const revenueUsd = plan.data?.price_monthly ? Number(plan.data.price_monthly) / (1 + margin.vat_rate) / Math.max(1, margin.usd_try) : 0;
  return json({
    profile, usage, limits, reasons: lockReasons(limits, usage, profile.plan_id),
    projects: projects.data ?? [], credits: credits.data ?? [], org: org.data?.[0] ?? null,
    plan: plan.data ?? null,
    purchases: purchases.data ?? [],
    legal, requests,
    discount,
    messages: messages.data ?? [],
    single,
    money: { revenue_try: plan.data ? Math.round(Number(plan.data.price_monthly) / (1 + margin.vat_rate)) : 0, cost_try: Math.round(usage.cost_usd * margin.usd_try), cost_share: revenueUsd ? Math.round((usage.cost_usd / revenueUsd) * 100) : null },
  });
});

const Action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("extend"), days: z.number().int().min(-365).max(3650) }),
  z.object({ action: z.literal("set_expiry"), expiresAt: z.string().datetime({ offset: true }).nullable() }),
  z.object({
    action: z.literal("set_plan"), planId: z.string().max(40), days: z.number().int().min(1).max(3650).nullable().default(30),
    // D157: ödeme dönemi (yıllıkta 12 aylık hak baştan, 365 gün); Tek Proje her zaman 1 ay
    period: z.enum(["monthly", "yearly"]).default("monthly"),
    // D109: ödeme WhatsApp’tan alındığı için ödeyen kişinin bilgisi paketle birlikte kaydedilir (Tek Proje’de ad zorunlu)
    purchase: z.object({ payerName: z.string().trim().max(200).default(""), payerPhone: z.string().trim().max(40).default(""), amountTry: z.number().min(0).max(1_000_000).nullable().default(null), note: z.string().trim().max(1000).default("") }).optional(),
  }),
  z.object({ action: z.literal("grant_credits"), aiRequests: z.number().int().min(0).max(100000).default(0), sourceSearches: z.number().int().min(0).max(100000).default(0), pages: z.number().int().min(0).max(100000).default(0), days: z.number().int().min(1).max(365).default(30), note: z.string().max(200).default("") }),
  // D146: kullanıcıya özel bildirim (zil simgesindeki kutuya düşer). Bağlantı yalnızca site içi yol olabilir.
  z.object({
    action: z.literal("notify"), title: z.string().trim().min(1).max(120), message: z.string().trim().min(1).max(2000),
    link: z.string().trim().max(300).regex(INTERNAL_LINK_RE, "Bağlantı / ile başlayan site içi bir yol olmalı").or(z.literal("")).default(""),
  }),
]);

/** Yönetici işlemleri: süre uzat / bitiş tarihi / paket ata (süreli) / ek hak ver */
export const POST = route<Ctx>("admin.user.action", async (req, { params }) => {
  const admin = await requireAdmin();
  const { id } = await params;
  const b = await parseBody(req, Action);
  const db = adminClient();
  const { data: profile } = await db.from("profiles").select("id, plan_id, plan_expires_at, role").eq("id", id).maybeSingle();
  if (!profile) throw new ApiError(404, "Kullanıcı bulunamadı");
  let update: Record<string, unknown> = {};
  let periodUpdate: Record<string, unknown> | null = null;
  if (b.action === "extend") {
    if (profile.plan_id === "free") throw new ApiError(422, "Ücretsiz pakette süre yok; önce bir paket atayın");
    if (profile.plan_id === "single" && !profile.plan_expires_at) throw new ApiError(422, "Bu Tek Proje eski koşullarla (süresiz) tanımlandı; süre uzatılamaz");
    update = { plan_expires_at: addDays(profile.plan_expires_at, b.days) };
  }
  if (b.action === "set_expiry") {
    if (profile.plan_id === "single" && !profile.plan_expires_at && b.expiresAt) throw new ApiError(422, "Bu Tek Proje eski koşullarla (süresiz) tanımlandı; bitiş tarihi verilemez");
    update = { plan_expires_at: b.expiresAt };
  }
  if (b.action === "set_plan") {
    const { data: plan } = await db.from("plans").select("id").eq("id", b.planId).maybeSingle();
    if (!plan) throw new ApiError(404, "Paket bulunamadı");
    if (b.planId === "single" && !b.purchase?.payerName) throw new ApiError(422, "Tek Proje atarken ödeyen kişinin adını yazın");
    const pu = b.purchase;
    if (b.planId !== "free" && pu && (pu.payerName || pu.payerPhone || pu.amountTry != null || pu.note)) {
      const { error } = await db.from("plan_purchases").insert({ user_id: id, plan_id: b.planId, payer_name: pu.payerName, payer_phone: pu.payerPhone, amount_try: pu.amountTry, note: pu.note, created_by: admin.user.id });
      if (error) throw new ApiError(500, "Satın alma kaydı yazılamadı (migration 31 çalıştırıldı mı?)");
    }
    // D157: Tek Proje 1 ay; yıllık ödemede 365 gün ve 12 aylık hak baştan; ücretsiz pakette süre yok
    const yearly = b.period === "yearly" && b.planId !== "free" && b.planId !== "single";
    const days = b.planId === "free" ? null : b.planId === "single" ? (b.days ?? SINGLE_PLAN_DAYS) : yearly ? YEARLY_DAYS : b.days;
    update = { plan_id: b.planId, plan_expires_at: days == null ? null : addDays(null, days) };
    periodUpdate = { plan_period: yearly ? "yearly" : "monthly", plan_started_at: new Date().toISOString() };
  }
  if (b.action === "grant_credits") {
    const expires = new Date(Date.now() + b.days * 86400_000).toISOString();
    const rows = [
      ...(b.aiRequests ? [{ user_id: id, kind: "ai_requests", amount: b.aiRequests, reason: `admin:${b.note}`.slice(0, 200), expires_at: expires }] : []),
      ...(b.sourceSearches ? [{ user_id: id, kind: "source_searches", amount: b.sourceSearches, reason: `admin:${b.note}`.slice(0, 200), expires_at: expires }] : []),
      ...(b.pages ? [{ user_id: id, kind: "pages", amount: b.pages, reason: `admin:${b.note}`.slice(0, 200), expires_at: expires }] : []),
    ];
    if (!rows.length) throw new ApiError(422, "En az bir hak miktarı girin");
    const { error } = await db.from("usage_credits").insert(rows);
    if (error) throw error;
  }
  if (b.action === "notify") {
    const { error } = await db.from("notifications").insert({ user_id: id, kind: "admin_message", data: { title: b.title, message: b.message, ...(b.link ? { link: b.link } : {}), by: admin.user.id } });
    if (error) throw new ApiError(500, "Bildirim gönderilemedi (migration 24 çalıştırıldı mı?)");
    return json({ ok: true });
  }
  if (Object.keys(update).length) {
    const { error } = await db.from("profiles").update(update).eq("id", id);
    if (error) throw error;
  }
  if (periodUpdate) {
    const { error } = await db.from("profiles").update(periodUpdate).eq("id", id);
    if (error && periodUpdate.plan_period === "yearly") throw new ApiError(500, "Paket atandı ama yıllık dönem kaydedilemedi (migration 40 çalıştırıldı mı?)");
  }
  // D81: çalışma kilidi kaldırıldı; eskiden kalmış bayrak varsa temizlenir
  await setWorkLock(id, false);
  const { data: after } = await db.from("profiles").select("*").eq("id", id).single();
  return json({ ok: true, profile: after });
});
