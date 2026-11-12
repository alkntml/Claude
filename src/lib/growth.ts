import "server-only";
import { sharesDevice } from "@/lib/devices";
import { isDisposableEmail } from "@/lib/disposable-email";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSetting } from "@/lib/settings";
import { adminClient } from "@/lib/supabase/admin";
import { WORDS_PER_PAGE } from "@/lib/pages";

/* Kurumsal lisans, kullanım kredileri ve davet ödülü (sunucu) */

export interface OrgInfo { id: string; name: string; plan_id: string; role: "admin" | "member"; seats: number | null; active: boolean; expires_at: string | null }

/** Kullanıcının etkin kurum üyeliği (kurum pasif veya süresi dolmuşsa null). Tablo yoksa (migration çalıştırılmadıysa) null. */
export async function activeOrg(db: SupabaseClient, userId: string): Promise<OrgInfo | null> {
  try {
    const { data, error } = await db.from("organization_members").select("role, organizations(id, name, plan_id, seats, active, expires_at)").eq("user_id", userId).maybeSingle();
    if (error || !data) return null;
    const o = (Array.isArray(data.organizations) ? data.organizations[0] : data.organizations) as Omit<OrgInfo, "role"> | null;
    if (!o || !o.active || (o.expires_at && new Date(o.expires_at) < new Date())) return null;
    return { ...o, role: data.role as OrgInfo["role"] };
  } catch {
    return null;
  }
}

/** Davet ödülü (D98): Ücretsiz paketin aylık haklarına eşittir; paket değişirse ödül de değişir */
export async function referralReward(): Promise<{ ai_requests: number; source_searches: number; pages: number }> {
  try {
    const { data } = await adminClient().from("plans").select("limits").eq("id", "free").maybeSingle();
    const l = (data?.limits ?? {}) as { ai_requests_month?: number | null; source_searches_month?: number | null; pages_month?: number | null };
    return { ai_requests: Number(l.ai_requests_month) || 10, source_searches: Number(l.source_searches_month) || 7, pages: Number(l.pages_month) || 5 };
  } catch {
    return { ai_requests: 10, source_searches: 7, pages: 5 };
  }
}

export interface CreditRow { kind: string; amount: number; created_at: string; expires_at: string | null }
/** Türkiye saatine göre ay anahtarı (sayaçlarla aynı dönem) */
export const trMonth = (d: Date | string) => { const x = new Date(new Date(d).getTime() + 3 * 3600_000); return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`; };

/**
 * Kredi bakiyesi (D98): krediler tek seferliktir. Her ay, paketin aylık hakkını aşan kullanım krediden düşer;
 * kalan bakiye bu ayki sınıra eklenir (önceden 60 gün geçerli kredi aktif olduğu her ay yeniden sayılıyordu).
 * Saf fonksiyon (test edilir). `base` null ise sınırsızdır, kredi gerekmez.
 */
export function creditPool(credits: CreditRow[], usageByMonth: Record<string, { ai: number; search: number; pages?: number }>, base: { ai: number | null | undefined; search: number | null | undefined; pages?: number | null }, now = new Date()): { ai_requests: number; source_searches: number; pages: number } {
  const nowMs = now.getTime();
  const current = trMonth(now);
  const calc = (kind: "ai_requests" | "source_searches" | "pages", key: "ai" | "search" | "pages", lim: number | null | undefined) => {
    const rows = credits.filter((c) => c.kind === kind && c.amount > 0);
    if (!rows.length || lim == null) return 0;
    const months = [...new Set(rows.map((c) => trMonth(c.created_at)))].sort();
    let pool = 0;
    // Geçmiş aylar: o aya kadar verilen krediler, aylık hakkı aşan kullanımla tükenir
    for (let m = months[0]; m < current; m = nextMonth(m)) {
      pool += rows.filter((c) => trMonth(c.created_at) === m).reduce((a, c) => a + c.amount, 0);
      pool -= Math.min(pool, Math.max(0, (usageByMonth[m]?.[key] ?? 0) - lim));
    }
    pool += rows.filter((c) => trMonth(c.created_at) === current).reduce((a, c) => a + c.amount, 0);
    // Süresi dolan kredinin kalanı kullanılamaz
    const live = rows.filter((c) => !c.expires_at || new Date(c.expires_at).getTime() >= nowMs).reduce((a, c) => a + c.amount, 0);
    return Math.max(0, Math.min(pool, live));
  };
  // Sayfa kredisi (D145): pakette sayfa sınırı yoksa (undefined/null) gerekmez
  return { ai_requests: calc("ai_requests", "ai", base.ai), source_searches: calc("source_searches", "search", base.search), pages: calc("pages", "pages", base.pages) };
}

function nextMonth(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return mo === 12 ? `${y + 1}-01` : `${y}-${String(mo + 1).padStart(2, "0")}`;
}

/** Bu ay kullanılabilecek kredi (aylık sınıra eklenir). `base`: paketin aylık hakları */
export async function activeCredits(userId: string, base: { ai: number | null | undefined; search: number | null | undefined; pages?: number | null } = { ai: 0, search: 0, pages: 0 }): Promise<{ ai_requests: number; source_searches: number; pages: number }> {
  try {
    const db = adminClient();
    const { data } = await db.from("usage_credits").select("kind, amount, created_at, expires_at").eq("user_id", userId);
    const now = Date.now();
    const rows = ((data ?? []) as CreditRow[]).filter((c) => !c.expires_at || new Date(c.expires_at).getTime() >= now - 100 * 86_400_000);
    if (!rows.some((c) => !c.expires_at || new Date(c.expires_at).getTime() >= now)) return { ai_requests: 0, source_searches: 0, pages: 0 };
    // Krediler verildiği aydan bu yana aylık kullanım
    const first = rows.map((c) => c.created_at).sort()[0];
    const [y, m] = trMonth(first).split("-").map(Number);
    const since = new Date(Date.UTC(y, m - 1, 1) - 3 * 3600_000).toISOString();
    const usage: Record<string, { ai: number; search: number; pages: number }> = {};
    for (let from = 0; from < 50000; from += 1000) {
      const { data: ev } = await db.from("usage_events").select("kind, quantity, created_at, words:meta->words").eq("user_id", userId).in("kind", ["ai_request", "source_search"]).gte("created_at", since).order("id").range(from, from + 999);
      for (const e of ev ?? []) {
        const k = trMonth(e.created_at as string);
        usage[k] ??= { ai: 0, search: 0, pages: 0 };
        if (e.kind === "ai_request") { usage[k].ai += Number(e.quantity) || 0; usage[k].pages += (Number((e as { words?: unknown }).words) || 0) / WORDS_PER_PAGE; }
        else usage[k].search += Number(e.quantity) || 0;
      }
      if (!ev || ev.length < 1000) break;
    }
    return creditPool(rows, usage, base);
  } catch {
    return { ai_requests: 0, source_searches: 0, pages: 0 };
  }
}

/**
 * Sosyal girişle (Google/Apple) yeni açılan hesaba davet kodunu bağlar. Kayıt formundaki gibi
 * kullanıcı meta verisi taşınamadığından kod geri dönüş adresinden gelir. Yalnızca yeni hesaplarda
 * (15 dk) ve henüz davet eden atanmamışsa; kendi kendini davet geçersiz.
 */
export async function attachReferral(userId: string, code: string, createdAt: string | undefined): Promise<void> {
  const clean = code.replace(/[^A-Za-z0-9]/g, "").slice(0, 16).toUpperCase();
  if (!clean || !createdAt || Date.now() - new Date(createdAt).getTime() > 15 * 60_000) return;
  const db = adminClient();
  const { data: inviter } = await db.from("profiles").select("id").eq("referral_code", clean).maybeSingle();
  if (!inviter || inviter.id === userId) return;
  await db.from("profiles").update({ referred_by: inviter.id }).eq("id", userId).is("referred_by", null);
}

/**
 * Davet ödülü (D99, D106): yalnızca davet edene, davet edilen kişi e-postasını doğruladığında bir kez verilir;
 * tek kullanımlık e-posta adresleri ve davet edenin cihazından açılan hesaplar ödül kazandırmaz.
 * Asıl iş veritabanı tetikleyicisinde (migration 29); bu fonksiyon cihaz bilgisi kayıtta olmayan hesaplar (sosyal giriş)
 * için ilk girişte aynı kuralla çalışır. Aynı davet için çift ödül olmaz (referral_rewarded_at önce işaretlenir).
 */
export async function grantReferralReward(userId: string, device?: string | null): Promise<boolean> {
  const cfg = await getSetting("referral");
  if (!cfg.enabled) return false;
  const db = adminClient();
  try {
    const { data: p } = await db.from("profiles").select("id, referred_by, referral_rewarded_at").eq("id", userId).maybeSingle();
    if (!p?.referred_by || p.referral_rewarded_at || p.referred_by === userId) return false;
    // D106: e-posta doğrulanmadan karar verilmez (sonraki girişte veya doğrulama tetikleyicisinde yeniden denenir)
    const { data: au } = await db.auth.admin.getUserById(userId);
    if (!au?.user?.email_confirmed_at) return false;
    const { data: claimed } = await db.from("profiles").update({ referral_rewarded_at: new Date().toISOString() }).eq("id", userId).is("referral_rewarded_at", null).select("id");
    if (!claimed?.length) return false;
    if (isDisposableEmail(au.user.email)) {
      await db.from("notifications").insert({ user_id: p.referred_by, kind: "referral_disposable_email", data: {} }).then(() => undefined, () => undefined);
      return true;
    }
    // D101: davet edenin kullandığı bir cihazdan açılan hesap için ödül verilmez
    if (await sharesDevice(p.referred_by, userId, device).catch(() => false)) {
      await db.from("notifications").insert({ user_id: p.referred_by, kind: "referral_same_device", data: {} }).then(() => undefined, () => undefined);
      return true;
    }
    const reward = await referralReward();
    const TR = 3 * 3600_000; const tr = new Date(Date.now() + TR);
    const monthStart = new Date(Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth(), 1) - TR).toISOString();
    const { count } = await db.from("usage_credits").select("id", { count: "exact", head: true }).eq("user_id", p.referred_by).eq("reason", "referral_inviter").eq("kind", "ai_requests").gte("created_at", monthStart);
    if ((count ?? 0) >= cfg.monthly_cap) {
      await db.from("notifications").insert({ user_id: p.referred_by, kind: "referral_cap", data: { cap: cfg.monthly_cap } }).then(() => undefined, () => undefined);
      return true;
    }
    const expires = new Date(Date.now() + cfg.valid_days * 86_400_000).toISOString();
    await db.from("usage_credits").insert([
      { user_id: p.referred_by, kind: "ai_requests", amount: reward.ai_requests, reason: "referral_inviter", expires_at: expires },
      { user_id: p.referred_by, kind: "source_searches", amount: reward.source_searches, reason: "referral_inviter", expires_at: expires },
      // D145: Ücretsiz paketin sayfa hakkı kadar sayfa (migration 38 yoksa bu satır reddedilir; diğerleri ayrı eklenir)
    ]);
    await db.from("usage_credits").insert({ user_id: p.referred_by, kind: "pages", amount: reward.pages, reason: "referral_inviter", expires_at: expires }).then(() => undefined, () => undefined);
    // Bildirim kutusu (D100); tablo yoksa sessizce atlanır
    await db.from("notifications").insert({ user_id: p.referred_by, kind: "referral_reward", data: { ai: reward.ai_requests, ss: reward.source_searches, pg: reward.pages, days: cfg.valid_days } }).then(() => undefined, () => undefined);
    return true;
  } catch {
    return false;
  }
}
