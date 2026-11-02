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

function monthStart(): string {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
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
  const [events, projects, files] = await Promise.all([
    db.from("usage_events").select("kind, quantity, tokens_in, tokens_out").eq("user_id", userId).gte("created_at", since).limit(20000),
    db.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "archived"),
    db.from("files").select("size_bytes").eq("user_id", userId).limit(10000),
  ]);
  const sum: UsageSummary = { ai_requests: 0, tokens: 0, source_searches: 0, exports: 0, projects: projects.count ?? 0, storage_mb: 0 };
  for (const e of events.data ?? []) {
    if (e.kind === "ai_request") { sum.ai_requests += e.quantity; sum.tokens += e.tokens_in + e.tokens_out; }
    if (e.kind === "source_search") sum.source_searches += e.quantity;
    if (e.kind === "export") sum.exports += e.quantity;
  }
  sum.storage_mb = Math.round(((files.data ?? []).reduce((a, f) => a + Number(f.size_bytes), 0) / 1048576) * 10) / 10;
  return sum;
}

/** Dakikalık hız sınırı — veritabanı tabanlı olduğu için birden çok sunucu örneğinde de tutarlıdır. */
async function rateLimit(userId: string, kind: UsageKind) {
  const rate = await getSetting("limits.rate");
  const max = kind === "ai_request" ? rate.ai_per_minute : kind === "source_search" ? rate.search_per_minute : 60;
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count } = await adminClient().from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("kind", kind).gte("created_at", since);
  if ((count ?? 0) >= max) throw new ApiError(429, "Çok fazla istek gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.", "rate_limited");
}

/** Pakete bağlı özellik kontrolü (D49): paket yetmiyorsa 402 + yükseltme penceresi için ayrıntı döner. */
export function assertFeature(planId: string, feature: FeatureId) {
  if (!hasFeature(planId, feature)) throw new ApiError(402, "Bu özellik paketinizde yok.", "feature_locked", { feature, plan: FEATURE_MIN_PLAN[feature] });
}

/** İşlem öncesi paket limitlerini kontrol eder; aşılmışsa 402 döner. */
export async function assertWithinLimits(userId: string, planId: string, kind: UsageKind, extra: { bytes?: number; format?: string } = {}) {
  await rateLimit(userId, kind);
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  const over = (used: number, lim: number | null | undefined) => lim !== null && lim !== undefined && used >= lim;
  if (kind === "ai_request") {
    if (over(usage.ai_requests, limits.ai_requests_month)) throw new ApiError(402, "Bu ayki yapay zekâ istek limitinize ulaştınız.", "limit_ai");
    if (over(usage.tokens, limits.tokens_month)) throw new ApiError(402, "Bu ayki token limitinize ulaştınız.", "limit_tokens");
  }
  if (kind === "source_search" && over(usage.source_searches, limits.source_searches_month)) throw new ApiError(402, "Bu ayki kaynak tarama limitinize ulaştınız.", "limit_search");
  if (kind === "upload" && limits.storage_mb != null && usage.storage_mb + (extra.bytes ?? 0) / 1048576 > limits.storage_mb) throw new ApiError(402, "Depolama kotanız doldu.", "limit_storage");
  if (kind === "export" && extra.format && limits.export_formats && !limits.export_formats.includes(extra.format)) throw new ApiError(402, `${extra.format.toUpperCase()} dışa aktarma paketinizde yok.`, "limit_export");
}

export async function assertProjectQuota(userId: string, planId: string) {
  const [limits, usage] = await Promise.all([planLimits(planId), usageSummary(userId)]);
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
