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
  /** Aylık API maliyet tavanı ($). Pakette yazmıyorsa fiyattan hesaplanır (D52). Kullanıcıya gösterilmez. */
  cost_usd_month?: number | null;
}

/** Ay başı Türkiye saatiyle (UTC+3, yaz saati uygulanmıyor): haklar her ayın 1’inde 00:00’da yenilenir. */
export function monthStart(now = new Date()): string {
  const TR = 3 * 3600_000;
  const tr = new Date(now.getTime() + TR);
  return new Date(Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth(), 1) - TR).toISOString();
}

export async function planLimits(planId: string): Promise<PlanLimits> {
  const { data } = await adminClient().from("plans").select("limits, price_monthly").eq("id", planId).maybeSingle();
  const limits = { ...((data?.limits ?? {}) as PlanLimits) };
  if (limits.cost_usd_month === undefined) {
    // Gelirin (KDV hariç, dolara çevrilmiş) belirlenen payı kadar API maliyetine izin verilir
    const m = await getSetting("billing.margin");
    const price = Number(data?.price_monthly ?? 0);
    limits.cost_usd_month = price > 0 ? costCapUsd(price, m) : null;
  }
  return limits;
}

/** Aylık API maliyet tavanı: fiyat / (1+KDV) / kur × maliyet payı */
export function costCapUsd(priceTry: number, m: { usd_try: number; vat_rate: number; cost_share: number }): number {
  return Math.round((priceTry / (1 + m.vat_rate) / Math.max(1, m.usd_try)) * m.cost_share * 100) / 100;
}

/** Paket limitleri + süresi dolmamış krediler (davet ödülü vb.) */
/** Yönetici (site sahibi) için sınır yoktur: uyarılar, sayaç çubukları ve tarama hakkı hesapları da sınırsız görünür (D82) */
const UNLIMITED: PlanLimits = { ai_requests_month: null, tokens_month: null, source_searches_month: null, projects: null, storage_mb: null, export_formats: ["txt", "md", "docx", "pdf"], cost_usd_month: null };

export async function effectiveLimits(userId: string, planId: string): Promise<PlanLimits> {
  if (await isAdminUser(userId).catch(() => false)) return { ...UNLIMITED };
  const [l, m] = await Promise.all([planLimits(planId), getSetting("billing.margin")]);
  const c = await activeCredits(userId, { ai: l.ai_requests_month, search: l.source_searches_month });
  return {
    ...l,
    // D98: krediyle gelen istekler token sınırına da eklenir (istek başı ~50 bin token; ücretsiz pakette ödül kullanılabilsin)
    tokens_month: l.tokens_month == null ? l.tokens_month : l.tokens_month + c.ai_requests * 50_000,
    // Davet ödülü istekleri maliyet tavanına ortalama istek maliyetiyle eklenir
    cost_usd_month: l.cost_usd_month == null ? l.cost_usd_month : l.cost_usd_month + c.ai_requests * m.avg_request_usd,
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
  /** Bu ayki toplam API maliyeti ($) */
  cost_usd: number;
}

export async function usageSummary(userId: string): Promise<UsageSummary> {
  const db = adminClient();
  const since = monthStart();
  const [totals, projects] = await Promise.all([
    db.rpc("usage_totals", { p_user: userId, p_since: since }),
    db.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "archived"),
  ]);
  const sum: UsageSummary = { ai_requests: 0, tokens: 0, source_searches: 0, exports: 0, projects: projects.count ?? 0, storage_mb: 0, cost_usd: 0 };
  const row = Array.isArray(totals.data) ? totals.data[0] : totals.data;
  if (!totals.error && row) {
    // Toplam veritabanında hesaplanır (D51); satır sınırına takılmaz
    sum.ai_requests = Number(row.ai_requests); sum.tokens = Number(row.tokens); sum.source_searches = Number(row.source_searches); sum.exports = Number(row.exports);
    sum.cost_usd = Number(row.cost_usd ?? 0);
    sum.storage_mb = Math.round((Number(row.storage_bytes) / 1048576) * 10) / 10;
    return sum;
  }
  // Yedek (migration 12 henüz çalıştırılmadıysa): sayfalı okuma — API satır sınırı (1000) yüzünden eksik saymasın
  let bytes = 0;
  for (let from = 0; ; from += 1000) {
    const { data } = await db.from("usage_events").select("kind, quantity, tokens_in, tokens_out, cost_usd").eq("user_id", userId).gte("created_at", since).order("id").range(from, from + 999);
    for (const e of data ?? []) {
      if (e.kind === "ai_request") { sum.ai_requests += e.quantity; sum.tokens += e.tokens_in + e.tokens_out; }
      if (e.kind === "source_search") sum.source_searches += e.quantity;
      if (e.kind === "export") sum.exports += e.quantity;
      sum.cost_usd += Number(e.cost_usd ?? 0);
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

/**
 * İstemciye gönderilecek kullanım/limit: maliyet ve token sayıları gizlenir (D49/D52);
 * yapay zekâ hakkına (istek veya maliyet tavanı) yaklaşıldıysa yalnızca ai_near bayrağı gider.
 */
export function forClient(usage: UsageSummary | null, limits: PlanLimits | Record<string, never>) {
  const l = limits as PlanLimits;
  const ratio = (u: number, lim: number | null | undefined) => (lim ? u / lim : 0);
  const ai_near = !!usage && Math.max(ratio(usage.ai_requests, l.ai_requests_month), ratio(usage.tokens, l.tokens_month), ratio(usage.cost_usd, l.cost_usd_month)) >= 0.8;
  const { cost_usd: _c, tokens: _t, ...u } = usage ?? ({} as UsageSummary);
  const { cost_usd_month: _cm, tokens_month: _tm, ...lim } = l;
  void _c; void _t; void _cm; void _tm;
  return { usage: usage ? { ...u, ai_near } : null, limits: lim };
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
export type LockReason = "ai_requests" | "tokens" | "source_searches" | "cost";

export function lockReasons(limits: PlanLimits, usage: UsageSummary, planId?: string): LockReason[] {
  const out: LockReason[] = [];
  const hit = (u: number, l: number | null | undefined) => l !== null && l !== undefined && u >= l;
  if (hit(usage.ai_requests, limits.ai_requests_month)) out.push("ai_requests");
  if (hit(usage.tokens, limits.tokens_month)) out.push("tokens");
  // Ücretsiz pakette tarama hakkı dolunca yalnızca kaynak tarama kapanır; çalışma kilitlenmez,
  // kullanıcı diğer özellikleri denemeye devam eder (D55)
  if (planId !== "free" && hit(usage.source_searches, limits.source_searches_month)) out.push("source_searches");
  // Maliyet tavanı (D52): gelirin 1/3’ünden fazla API maliyetine izin verilmez; kullanıcıya “yapay zekâ hakkı” olarak görünür
  if (hit(usage.cost_usd ?? 0, limits.cost_usd_month)) out.push("cost");
  return out;
}

export async function setWorkLock(userId: string, locked: boolean) {
  await adminClient().from("profiles").update({ work_locked: locked }).eq("id", userId).neq("work_locked", locked);
}

/**
 * Aylık hak durumu (sayfa yüklemelerinde çağrılır). D81: kullanıcı kendi çalışmasına erişimi hiçbir zaman
 * kaybetmez; hak dolunca yalnızca yapay zekâ ve kaynak tarama durur. Bu yüzden `locked` her zaman false’tur ve
 * eskiden kalmış kilit bayrağı temizlenir; `reasons` yalnızca “hakkınız doldu” uyarısı için döner.
 */
export async function syncWorkLock(userId: string, planId: string, opts: { isAdmin?: boolean; stored?: boolean } = {}): Promise<{ locked: boolean; reasons: LockReason[] }> {
  if (opts.stored) await setWorkLock(userId, false).catch(() => {});
  if (opts.isAdmin) return { locked: false, reasons: [] };
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  return { locked: false, reasons: lockReasons(limits, usage, planId) };
}

/** Yöneticinin tanımladığı “mevcut çalışmayı indir” hakkı (100 TL) geçerli mi? */
export async function hasDownloadPass(userId: string, projectId: string): Promise<boolean> {
  const { count } = await adminClient().from("download_passes").select("id", { count: "exact", head: true })
    .eq("user_id", userId).eq("project_id", projectId).gt("expires_at", new Date().toISOString());
  return (count ?? 0) > 0;
}


/** Pakete bağlı özellik kontrolü (D49): paket yetmiyorsa 402 + yükseltme penceresi için ayrıntı döner. */
export function assertFeature(planId: string, feature: FeatureId) {
  if (!hasFeature(planId, feature)) throw new ApiError(402, "Bu özellik paketinizde yok.", "feature_locked", { feature, plan: FEATURE_MIN_PLAN[feature] });
}

/** İşlem öncesi paket limitlerini kontrol eder; aşılmışsa 402 döner. */
/** Yönetici (site sahibi) mi? Kısa süreli önbellekli (D77: yönetici paket sınırlarına ve kilide tabi değildir; kullanım yine kaydedilir) */
const adminCache = new Map<string, { v: boolean; at: number }>();
export async function isAdminUser(userId: string): Promise<boolean> {
  const c = adminCache.get(userId);
  if (c && Date.now() - c.at < 60_000) return c.v;
  const { data } = await adminClient().from("profiles").select("role").eq("id", userId).maybeSingle();
  const v = data?.role === "admin";
  adminCache.set(userId, { v, at: Date.now() });
  return v;
}

export async function assertWithinLimits(userId: string, planId: string, kind: UsageKind, extra: { bytes?: number; format?: string; projectId?: string; costOnly?: boolean } = {}) {
  if (await isAdminUser(userId).catch(() => false)) return;
  await rateLimit(userId, kind);
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  const over = (used: number, lim: number | null | undefined) => lim !== null && lim !== undefined && used >= lim;
  // D81: hak dolunca çalışma kilitlenmez; yalnızca ilgili işlem (yapay zekâ / kaynak tarama) durur.
  // Görüntüleme, elle düzenleme ve indirme her zaman açıktır.
  if (kind === "ai_request") {
    // costOnly: haktan düşmeyen ucuz işlemler (ör. literatür matrisi, D96) yalnızca maliyet ve token tavanına bakar
    if (!extra.costOnly && over(usage.ai_requests, limits.ai_requests_month)) throw new ApiError(402, "Bu ayki yapay zekâ istek limitinize ulaştınız.", "limit_ai");
    if (over(usage.tokens, limits.tokens_month)) throw new ApiError(402, "Bu ayki token limitinize ulaştınız.", "limit_tokens");
    // Maliyet tavanı (D52) kullanıcıya “yapay zekâ hakkı” olarak görünür
    if (over(usage.cost_usd ?? 0, limits.cost_usd_month)) throw new ApiError(402, "Bu ayki yapay zekâ istek limitinize ulaştınız.", "limit_ai");
  }
  if (kind === "source_search" && over(usage.source_searches, limits.source_searches_month)) throw new ApiError(402, "Bu ayki kaynak tarama limitinize ulaştınız.", "limit_search");
  if (kind === "upload" && limits.storage_mb != null && usage.storage_mb + (extra.bytes ?? 0) / 1048576 > limits.storage_mb) throw new ApiError(402, "Depolama kotanız doldu.", "limit_storage");
  if (kind === "export" && extra.format && limits.export_formats && !limits.export_formats.includes(extra.format)) throw new ApiError(402, `${extra.format.toUpperCase()} dışa aktarma paketinizde yok.`, "limit_export");
}

export async function assertProjectQuota(userId: string, planId: string) {
  if (await isAdminUser(userId).catch(() => false)) return;
  const [limits, usage] = await Promise.all([planLimits(planId), usageSummary(userId)]);
  if (limits.projects != null && usage.projects >= limits.projects) throw new ApiError(402, `Paketiniz en fazla ${limits.projects} aktif projeye izin veriyor.`, "limit_projects");
}

/**
 * Kullanım kaydı. `usage` verilirse token sayıları ondan alınır ve önbellek okuma/yazma tokenları meta.cache’e
 * yazılır (yönetimde önbellek isabeti ve tasarrufu, D94).
 */
export async function recordUsage(userId: string, kind: UsageKind, data: { quantity?: number; tokensIn?: number; tokensOut?: number; usage?: { input: number; output: number; cacheRead?: number; cacheWrite?: number }; costUsd?: number; provider?: string; model?: string; meta?: Record<string, unknown> } = {}) {
  const u = data.usage;
  const cache = u && (u.cacheRead || u.cacheWrite) ? { r: u.cacheRead ?? 0, w: u.cacheWrite ?? 0 } : null;
  await adminClient().from("usage_events").insert({
    user_id: userId, kind, quantity: data.quantity ?? 1, tokens_in: u?.input ?? data.tokensIn ?? 0, tokens_out: u?.output ?? data.tokensOut ?? 0,
    cost_usd: Math.max(0, data.costUsd ?? 0), provider: data.provider ?? null, model: data.model ?? null, meta: { ...(data.meta ?? {}), ...(cache ? { cache } : {}) },
  });
}

export interface UsageWarning { kind: "ai_requests" | "tokens" | "source_searches" | "storage_mb"; used: number; limit: number; pct: number }

/** Paket limitinin %80'ine ulaşılan kalemler (kullanıcıya önceden uyarı göstermek için). */
export async function usageWarnings(userId: string, planId: string, threshold = 0.8): Promise<UsageWarning[]> {
  const [limits, usage] = await Promise.all([effectiveLimits(userId, planId), usageSummary(userId)]);
  const pairs: [UsageWarning["kind"], number, number | null | undefined][] = [
    ["ai_requests", usage.ai_requests, limits.ai_requests_month],
    ["tokens", usage.tokens, limits.tokens_month],
    // Maliyet tavanına yaklaşma da “yapay zekâ hakkı” uyarısı olarak gösterilir (sayı verilmez; D49/D52)
    ["tokens", usage.cost_usd, limits.cost_usd_month],
    ["source_searches", usage.source_searches, limits.source_searches_month],
    ["storage_mb", usage.storage_mb, limits.storage_mb],
  ];
  return pairs
    .filter(([, used, lim]) => lim != null && lim > 0 && used / lim >= threshold)
    .map(([kind, used, lim]) => ({ kind, used, limit: lim as number, pct: Math.min(100, Math.round((used / (lim as number)) * 100)) }));
}
