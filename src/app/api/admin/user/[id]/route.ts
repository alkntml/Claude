import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { addDays } from "@/lib/admin-users";
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
  const [usage, limits, projects, credits, passes, plan, margin, org] = await Promise.all([
    usageSummary(id),
    effectiveLimits(id, profile.plan_id),
    db.from("projects").select("id, title, work_type, status, updated_at").eq("user_id", id).order("updated_at", { ascending: false }).limit(20),
    db.from("usage_credits").select("kind, amount, reason, expires_at, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
    db.from("download_passes").select("project_id, expires_at, note, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(10),
    db.from("plans").select("name, price_monthly").eq("id", profile.plan_id).maybeSingle(),
    getSetting("billing.margin"),
    db.from("organization_members").select("role, organizations(name, plan_id)").eq("user_id", id).limit(1),
  ]);
  const revenueUsd = plan.data?.price_monthly ? Number(plan.data.price_monthly) / (1 + margin.vat_rate) / Math.max(1, margin.usd_try) : 0;
  return json({
    profile, usage, limits, reasons: lockReasons(limits, usage, profile.plan_id),
    projects: projects.data ?? [], credits: credits.data ?? [], passes: passes.data ?? [], org: org.data?.[0] ?? null,
    plan: plan.data ?? null,
    money: { revenue_try: plan.data ? Math.round(Number(plan.data.price_monthly) / (1 + margin.vat_rate)) : 0, cost_try: Math.round(usage.cost_usd * margin.usd_try), cost_share: revenueUsd ? Math.round((usage.cost_usd / revenueUsd) * 100) : null },
  });
});

const Action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("extend"), days: z.number().int().min(-365).max(3650) }),
  z.object({ action: z.literal("set_expiry"), expiresAt: z.string().datetime({ offset: true }).nullable() }),
  z.object({ action: z.literal("set_plan"), planId: z.string().max(40), days: z.number().int().min(1).max(3650).nullable().default(30) }),
  z.object({ action: z.literal("grant_credits"), aiRequests: z.number().int().min(0).max(100000).default(0), sourceSearches: z.number().int().min(0).max(100000).default(0), days: z.number().int().min(1).max(365).default(30), note: z.string().max(200).default("") }),
]);

/** Yönetici işlemleri: süre uzat / bitiş tarihi / paket ata (süreli) / ek hak ver */
export const POST = route<Ctx>("admin.user.action", async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const b = await parseBody(req, Action);
  const db = adminClient();
  const { data: profile } = await db.from("profiles").select("id, plan_id, plan_expires_at, role").eq("id", id).maybeSingle();
  if (!profile) throw new ApiError(404, "Kullanıcı bulunamadı");
  let update: Record<string, unknown> = {};
  if (b.action === "extend") {
    if (profile.plan_id === "free") throw new ApiError(422, "Ücretsiz pakette süre yok; önce bir paket atayın");
    update = { plan_expires_at: addDays(profile.plan_expires_at, b.days) };
  }
  if (b.action === "set_expiry") update = { plan_expires_at: b.expiresAt };
  if (b.action === "set_plan") {
    const { data: plan } = await db.from("plans").select("id").eq("id", b.planId).maybeSingle();
    if (!plan) throw new ApiError(404, "Paket bulunamadı");
    update = { plan_id: b.planId, plan_expires_at: b.planId === "free" || b.days == null ? null : addDays(null, b.days) };
  }
  if (b.action === "grant_credits") {
    const expires = new Date(Date.now() + b.days * 86400_000).toISOString();
    const rows = [
      ...(b.aiRequests ? [{ user_id: id, kind: "ai_requests", amount: b.aiRequests, reason: `admin:${b.note}`.slice(0, 200), expires_at: expires }] : []),
      ...(b.sourceSearches ? [{ user_id: id, kind: "source_searches", amount: b.sourceSearches, reason: `admin:${b.note}`.slice(0, 200), expires_at: expires }] : []),
    ];
    if (!rows.length) throw new ApiError(422, "En az bir hak miktarı girin");
    const { error } = await db.from("usage_credits").insert(rows);
    if (error) throw error;
  }
  if (Object.keys(update).length) {
    const { error } = await db.from("profiles").update(update).eq("id", id);
    if (error) throw error;
  }
  // Paket/hak değişince kilit hemen yeniden değerlendirilir
  const planId = (update.plan_id as string) ?? profile.plan_id;
  const [limits, usage] = await Promise.all([effectiveLimits(id, planId), usageSummary(id)]);
  await setWorkLock(id, profile.role !== "admin" && lockReasons(limits, usage, planId).length > 0);
  const { data: after } = await db.from("profiles").select("id, plan_id, plan_expires_at, work_locked").eq("id", id).single();
  return json({ ok: true, profile: after });
});
