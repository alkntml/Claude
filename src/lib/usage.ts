import "server-only";
import { FEATURE_MIN_PLAN, hasFeature, type FeatureId } from "@/lib/features";
import { ApiError } from "@/lib/api";
import { adminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { activeCredits } from "@/lib/growth";

export type UsageKind = "ai_request" | "source_search" | "export" | "upload" | "quality_check";

export interface PlanLimits {
  ai_requests_month?: number | null;
  tokens_month?: number | null;
  source_searches_month?: number | null;
  projects?: number | null;
  storage_mb?: number | null;
  export_formats?: string[];
}

/** Ay başı Türkiye saatiyle (UTC+3, yaz saati uygulanmıyor): haklar her ayın 1’inde 00:00’da yenilenir. */
export function monthStart(now = new Date()): string {
  const TR = 3 * 3600_000;
  const tr = new Date(now.getTime() + TR);
  return new Date(Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth(), 1) - TR).toISOString();
}

export async function planLimits(planId: string): Promise<PlanLimits> {
  const { data } = await adminClient().from("plans").select("limits").eq("id", planId).maybeSingle();
  return (data?.limits ?? {}) as PlanLimits;
}

/** Paket limitleri + süresi dolmamış krediler (davet ödülü vb.) */
export async function effectiveLimits(userId: string, planId: string): Promise<PlanLimits> {
  const [l, c] = await Promise.all([planLimits(planId), activeCredits(userId)]);
  return {
    ...l,
    ai_requests_month: l.ai_requests_month == null ? l.ai_requests_month : l.ai_requests_month + c.ai_requests,
    source_searches_month: l.source_searches_month == null ? l.source_searches_month : l.source_searches_month + c.source_searches,
  };
}

export interface UsageSummary {
  ai_requests: number;
  tokens: number;
  source_searches: number;
  exports: number;
  projects: number;
  storage_mb: number;
}

export async function usageSummary(userId: string): Promise<UsageSummary> {
  const db = adminClient();
  const since = monthStart();
  const [totals, projects] = await Promise.all([
    db.rpc("usage_totals", { p_user: userId, p_since: since }),
    db.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "archived"),
  ]);
  const sum: UsageSummary = { ai_requests: 0, tokens: 0, source_searches: 0, exports: 0, projects: projects.count ?? 0, storage_mb: 0 };
  const row = Array.isArray(totals.data) ? totals.data[0] : totals.data;
  if (!totals.error && row) {
    // Toplam veritabanında hesaplanır (D51); satır sınırına takılmaz
    sum.ai_requests = Number(row.ai_requests); sum.tokens = Number(row.tokens); sum.source_searches = Number(row.source_searches); sum.exports = Number(row.exports);
    sum.storage_mb = Math.round((Number(row.storage_bytes) / 1048576) * 10) / 10;
    return sum;
  }
  // Yedek (migration 12 henüz çalıştırılmadıysa): sayfalı okuma — API satır sınırı (1000) yüzünden eksik saymasın
  let bytes = 0;
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("usage_events").select("kind, quantity, tokens_in, tokens_out").eq("user_id", userId).gte("created_at", since).order("id").range(from, from + 999);
    for (const e of data ?? []) {
      if (e.kind === "ai_request") { sum.ai_requests += e.quantity; sum.tokens += e.tokens_in + e.tokens_out; }
      if (e.kind === "source_search") sum.source_searches += e.quantity;
      if (e.kind === "export") sum.exports += e.quantity;
    }
    if (!data || data.length < 1000) break;
  }
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("files").select("size_bytes").eq("user_id", userId).order("id").range(from, from + 999);
    bytes += (data ?? []).reduce((a, f) => a + Number(f.size_bytes), 0);
    if (!data || data.length < 1000) break;
  }
  sum.storage_mb = Math.round((bytes / 1048576) * 10) / 10;
  return sum;
}

/** Bu ay kalan kaynak tarama hakkı (sınırsızsa null). Çok sorgulu aramalarda limit aşımını önlemek için. */
export async function searchesRemaining(userId: string, planId: string): Promise<number | null> {
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  if (limits.source_searches_month == null) return null;
  return Math.max(0, limits.source_searches_month - usage.source_searches);
}

/** Dakikalık hız sınırı — veritabanı tabanlı olduğu için birden çok sunucu örneğinde de tutarlıdır. */
async function rateLimit(userId: string, kind: UsageKind) {
  const rate = await getSetting("limits.rate");
  const max = kind === "ai_request" ? rate.ai_per_minute : kind === "source_search" ? rate.search_per_minute : 60;
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await adminClient().from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("kind", kind).gte("created_at", since);
  if ((count ?? 0) >= max) throw new ApiError(429, "Çok fazla istek gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.", "rate_limited");
}

/* ---------------------------------------------------------------------
 * Çalışma kilidi (D50): aylık limitlerden biri (yapay zekâ isteği, token, kaynak tarama) dolunca
 * kullanıcının çalışmaları kilitlenir. Bayrak profiles.work_locked’ta tutulur; veritabanı kuralları
 * (RLS) bu bayrakla içerik tablolarına doğrudan erişimi kapatır. Yalnızca sunucu değiştirir.
 * ------------------------------------------------------------------- */
export type LockReason = "ai_requests" | "tokens" | "source_searches";

export function lockReasons(limits: PlanLimits, usage: UsageSummary): LockReason[] {
  const out: LockReason[] = [];
  const hit = (u: number, l: number | null | undefined) => l !== null && l !== undefined && u >= l;
  if (hit(usage.ai_requests, limits.ai_requests_month)) out.push("ai_requests");
  if (hit(usage.tokens, limits.tokens_month)) out.push("tokens");
  if (hit(usage.source_searches, limits.source_searches_month)) out.push("source_searches");
  return out;
}

export async function setWorkLock(userId: string, locked: boolean) {
  await adminClient().from("profiles").update({ work_locked: locked }).eq("id", userId).neq("work_locked", locked);
}

/** Güncel kilit durumunu hesaplar ve bayrağı eşitler (sayfa yüklemelerinde çağrılır). */
export async function syncWorkLock(userId: string, planId: string, opts: { isAdmin?: boolean; stored?: boolean } = {}): Promise<{ locked: boolean; reasons: LockReason[] }> {
  if (opts.isAdmin) return { locked: false, reasons: [] };
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  const reasons = lockReasons(limits, usage);
  const locked = reasons.length > 0;
  if (opts.stored !== locked) await setWorkLock(userId, locked).catch(() => {});
  return { locked, reasons };
}

/** Yöneticinin tanımladığı “mevcut çalışmayı indir” hakkı (100 TL) geçerli mi? */
export async function hasDownloadPass(userId: string, projectId: string): Promise<boolean> {
  const { count } = await adminClient().from("download_passes").select("id", { count: "exact", head: true })
    .eq("user_id", userId).eq("project_id", projectId).gt("expires_at", new Date().toISOString());
  return (count ?? 0) > 0;
}

/** Kilitliyse 402 work_locked fırlatır (limit sayacı olmayan işlemler için). */
export async function assertNotLocked(userId: string, planId: string) {
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  if (lockReasons(limits, usage).length) { await setWorkLock(userId, true).catch(() => {}); throw new ApiError(402, WORK_LOCKED_MESSAGE, "work_locked"); }
}

export const WORK_LOCKED_MESSAGE = "Bu ayki kullanım hakkınız doldu; çalışmalarınız kilitlendi.";

/** Pakete bağlı özellik kontrolü (D49): paket yetmiyorsa 402 + yükseltme penceresi için ayrıntı döner. */
export function assertFeature(planId: string, feature: FeatureId) {
  if (!hasFeature(planId, feature)) throw new ApiError(402, "Bu özellik paketinizde yok.", "feature_locked", { feature, plan: FEATURE_MIN_PLAN[feature] });
}

/** İşlem öncesi paket limitlerini kontrol eder; aşılmışsa 402 döner. */
export async function assertWithinLimits(userId: string, planId: string, kind: UsageKind, extra: { bytes?: number; format?: string; projectId?: string } = {}) {
  await rateLimit(userId, kind);
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  const over = (used: number, lim: number | null | undefined) => lim !== null && lim !== undefined && used >= lim;
  // Aylık limitlerden biri dolduysa tüm çalışma kilitlenir (indirme hakkı tanımlanmış dışa aktarma hariç)
  const reasons = lockReasons(limits, usage);
  if (reasons.length) {
    await setWorkLock(userId, true).catch(() => {});
    const passOk = kind === "export" && extra.projectId ? await hasDownloadPass(userId, extra.projectId) : false;
    if (!passOk) throw new ApiError(402, WORK_LOCKED_MESSAGE, "work_locked", { reasons });
  }
  if (kind === "ai_request") {
    if (over(usage.ai_requests, limits.ai_requests_month)) throw new ApiError(402, "Bu ayki yapay zekâ istek limitinize ulaştınız.", "limit_ai");
    if (over(usage.tokens, limits.tokens_month)) throw new ApiError(402, "Bu ayki token limitinize ulaştınız.", "limit_tokens");
  }
  if (kind === "source_search" && over(usage.source_searches, limits.source_searches_month)) throw new ApiError(402, "Bu ayki kaynak tarama limitinize ulaştınız.", "limit_search");
  if (kind === "upload" && limits.storage_mb != null && usage.storage_mb + (extra.bytes ?? 0) / 1048576 > limits.storage_mb) throw new ApiError(402, "Depolama kotanız doldu.", "limit_storage");
  if (kind === "export" && extra.format && limits.export_formats && !limits.export_formats.includes(extra.format)) throw new ApiError(402, `${extra.format.toUpperCase()} dışa aktarma paketinizde yok.`, "limit_export");
}

export async function assertProjectQuota(userId: string, planId: string) {
  const [limits, usage, eff] = await Promise.all([planLimits(planId), usageSummary(userId), effectiveLimits(userId, planId)]);
  if (lockReasons(eff, usage).length) { await setWorkLock(userId, true).catch(() => {}); throw new ApiError(402, WORK_LOCKED_MESSAGE, "work_locked"); }
  if (limits.projects != null && usage.projects >= limits.projects) throw new ApiError(402, `Paketiniz en fazla ${limits.projects} aktif projeye izin veriyor.`, "limit_projects");
}

export async function recordUsage(userId: string, kind: UsageKind, data: { quantity?: number; tokensIn?: number; tokensOut?: number; costUsd?: number; provider?: string; model?: string; meta?: Record<string, unknown> } = {}) {
  await adminClient().from("usage_events").insert({
    user_id: userId, kind, quantity: data.quantity ?? 1, tokens_in: data.tokensIn ?? 0, tokens_out: data.tokensOut ?? 0,
    cost_usd: data.costUsd ?? 0, provider: data.provider ?? null, model: data.model ?? null, meta: data.meta ?? {},
  });
}

export interface UsageWarning { kind: "ai_requests" | "tokens" | "source_searches" | "storage_mb"; used: number; limit: number; pct: number }

/** Paket limitinin %80'ine ulaşılan kalemler (kullanıcıya önceden uyarı göstermek için). */
export async function usageWarnings(userId: string, planId: string, threshold = 0.8): Promise<UsageWarning[]> {
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  const pairs: [UsageWarning["kind"], number, number | null | undefined][] = [
    ["ai_requests", usage.ai_requests, limits.ai_requests_month],
    ["tokens", usage.tokens, limits.tokens_month],
    ["source_searches", usage.source_searches, limits.source_searches_month],
    ["storage_mb", usage.storage_mb, limits.storage_mb],
  ];
  return pairs
    .filter(([, used, lim]) => lim != null && lim > 0 && used / lim >= threshold)
    .map(([kind, used, lim]) => ({ kind, used, limit: lim as number, pct: Math.min(100, Math.round((used / (lim as number)) * 100)) }));
}
