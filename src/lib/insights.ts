/**
 * Yönetim ekranı için maliyet ve ölçüm özetleri (D90). Saf fonksiyonlar (test edilir); veri sunucuda okunur.
 */
import { ASSISTANT_ACTIONS } from "@/lib/ai/prompts";
import { cacheSavings, resolvePrice } from "@/lib/ai/cost";

const FEATURE_LABEL: Record<string, string> = {
  survey_ai: "Anket: yapay zekâ",
  help: "Asistan: kullanım sorusu",
  quality_review: "Kalite kontrol (yapay zekâ jürisi)",
  stage_review: "Bölüm tamamlama kontrolü",
  research_plan: "Kaynak taraması kararı",
  evidence_check: "Kaynakta doğrulama",
  literature_matrix: "Literatür matrisi",
  memory_learn: "Hafızaya belgeden öğren",
  presentation: "Savunma sunumu",
  titles: "Başlık önerileri",
  topic_ideas: "Konu bulma",
  guideline: "Kılavuzdan bölüm önerisi",
  defense: "Savunma provası",
  survey_generate: "Anket: yapay zekâ taslağı",
  blueprint: "Kurgu",
  source_ask: "Kaynağa sor",
};

export const TOOL_LABEL: Record<string, string> = {
  fake_check: "Uydurma kaynak kontrolü",
  consensus: "Araştırmalar ne diyor?",
  bibliography: "Kaynakça oluşturucu",
  convert: "Atıf stili dönüştürücü",
  sample_size: "Örneklem hesaplayıcı",
  alpha: "Cronbach alfa",
  survey_builder: "Anket oluşturucu (ücretsiz)",
};

/** usage_events.meta.action → okunur özellik adı */
export function featureLabel(action: string | undefined | null): string {
  if (!action) return "Diğer";
  if (action in ASSISTANT_ACTIONS) return `Asistan: ${ASSISTANT_ACTIONS[action as keyof typeof ASSISTANT_ACTIONS].label}`;
  if (FEATURE_LABEL[action]) return FEATURE_LABEL[action];
  if (action.startsWith("survey")) return "Anket: yapay zekâ";
  if (action.startsWith("blueprint")) return "Kurgu";
  if (action.startsWith("defense")) return "Savunma provası";
  if (action.startsWith("translate_")) return "Dil ve çeviri: çeviri";
  if (action.startsWith("proofread_")) return "Dil ve çeviri: dil denetimi";
  return action;
}

export interface CostRow { cost_usd: number | string; meta?: { action?: string } | null; tokens_in?: number; tokens_out?: number }

/** Özelliğe göre maliyet ve çağrı sayısı */
export function costByFeature(rows: CostRow[]): { label: string; value: number; calls: number }[] {
  const m = new Map<string, { value: number; calls: number }>();
  for (const r of rows) {
    const c = Number(r.cost_usd) || 0;
    if (c <= 0 && !(r.tokens_in || r.tokens_out)) continue;
    const k = featureLabel(r.meta?.action);
    const cur = m.get(k) ?? { value: 0, calls: 0 };
    cur.value += c; cur.calls++;
    m.set(k, cur);
  }
  return [...m.entries()].map(([label, v]) => ({ label, value: Math.round(v.value * 10000) / 10000, calls: v.calls })).sort((a, b) => b.value - a.value);
}

export interface PageRow { path: string; visitor: string | null; referrer: string | null; utm_source: string | null; device: string | null; created_at: string }

/** Ziyaret özetleri: günlük görüntüleme ve tekil ziyaretçi, en çok görülen sayfalar, kaynaklar, cihazlar */
export function trafficSummary(rows: PageRow[], days: string[]) {
  const byDay = new Map<string, { views: number; visitors: Set<string> }>();
  for (const d of days) byDay.set(d, { views: 0, visitors: new Set() });
  const pages = new Map<string, number>(), sources = new Map<string, number>(), devices = new Map<string, number>();
  const allVisitors = new Set<string>();
  for (const r of rows) {
    const day = r.created_at.slice(0, 10);
    const b = byDay.get(day) ?? { views: 0, visitors: new Set<string>() };
    b.views++;
    if (r.visitor) { b.visitors.add(r.visitor); allVisitors.add(`${day}|${r.visitor}`); }
    byDay.set(day, b);
    pages.set(r.path, (pages.get(r.path) ?? 0) + 1);
    const src = r.utm_source ? `${r.utm_source} (kampanya)` : r.referrer ?? "Doğrudan / yer imi";
    sources.set(src, (sources.get(src) ?? 0) + 1);
    devices.set(r.device ?? "desktop", (devices.get(r.device ?? "desktop") ?? 0) + 1);
  }
  const DEVICE: Record<string, string> = { mobile: "Telefon", tablet: "Tablet", desktop: "Bilgisayar" };
  const toList = (m: Map<string, number>) => [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  return {
    byDay: [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, views: v.views, visitors: v.visitors.size })),
    views: rows.length,
    visitors: allVisitors.size,
    pages: toList(pages),
    sources: toList(sources),
    devices: toList(devices).map((d) => ({ ...d, label: DEVICE[d.label] ?? d.label })),
  };
}

/** Bugünden geriye `n` günün tarihleri (YYYY-AA-GG) */
export function lastDays(n: number, now = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => new Date(now.getTime() - (n - 1 - i) * 86400_000).toISOString().slice(0, 10));
}

export interface CostEvent { kind: string; quantity: number; tokens_in: number; tokens_out: number; cost_usd: number | string; model: string | null; meta?: { cache?: { r?: number; w?: number }; failed?: boolean; partial?: boolean } | Record<string, unknown> | null }

/**
 * Maliyet sağlığı (D94): ortalama istek maliyeti, önbellek isabeti ve tasarrufu, yarım kalan/başarısız çağrıların
 * maliyeti ve fiyatı tanımlı olmayan modeller. `pricing` yönetici ayarındaki fiyat tablosudur.
 */
export function costHealth(events: CostEvent[], pricing: Record<string, { in: number; out: number }>) {
  let aiCost = 0, requests = 0, inputTokens = 0, readTokens = 0, writeTokens = 0, savings = 0, failed = 0, partial = 0;
  const unpriced = new Set<string>();
  for (const e of events) {
    const cost = Number(e.cost_usd) || 0;
    if (!e.model || !(cost > 0 || e.tokens_in + e.tokens_out > 0)) continue;
    aiCost += cost;
    if (e.kind === "ai_request") requests += e.quantity;
    const { price, match } = resolvePrice(e.model, pricing);
    if (match !== "exact" && match !== "alias") unpriced.add(e.model);
    inputTokens += e.tokens_in;
    const c = e.meta?.cache as { r?: number; w?: number } | undefined;
    if (c) {
      readTokens += c.r ?? 0; writeTokens += c.w ?? 0;
      savings += cacheSavings(price, e.tokens_in, e.tokens_out, { cacheRead: c.r ?? 0, cacheWrite: c.w ?? 0 });
    }
    if (e.meta?.failed) failed += cost;
    if (e.meta?.partial) partial += cost;
  }
  const r4 = (v: number) => Math.round(v * 10000) / 10000;
  return {
    aiCost: r4(aiCost),
    requests,
    avgRequestUsd: requests ? r4(aiCost / requests) : null,
    cache: { inputTokens, readTokens, writeTokens, hitRate: inputTokens ? Math.round((readTokens / inputTokens) * 1000) / 10 : 0, savingsUsd: r4(savings) },
    failedUsd: r4(failed),
    partialUsd: r4(partial),
    unpriced: [...unpriced],
  };
}

/** Ay sonu maliyet tahmini: bu ayki harcama, geçen gün sayısına göre ayın tamamına yayılır (Türkiye saati) */
export function monthProjection(spent: number, now = new Date()) {
  const tr = new Date(now.getTime() + 3 * 3600_000);
  const day = tr.getUTCDate() - 1 + (tr.getUTCHours() * 60 + tr.getUTCMinutes()) / 1440;
  const days = new Date(Date.UTC(tr.getUTCFullYear(), tr.getUTCMonth() + 1, 0)).getUTCDate();
  return day > 0.25 ? Math.round((spent / day) * days * 100) / 100 : null;
}

/* ---------------- Ürün analitiği (D125) ---------------- */
export interface FunnelStep { key: string; label: string; count: number; rate: number }
/**
 * Aktivasyon hunisi: dönemde kaydolan kullanıcılar → çalışma açtı → en az 300 kelime yazdı → yapay zekâ kullandı →
 * dışa aktardı → en az iki farklı gün geri geldi. Oranlar kayıt sayısına göredir.
 */
export function activationFunnel(o: { users: string[]; projectUsers: Set<string>; words: Map<string, number>; aiUsers: Set<string>; exportUsers: Set<string>; activeDays: Map<string, Set<string>> }): FunnelStep[] {
  const n = o.users.length;
  const steps: [string, string, (u: string) => boolean][] = [
    ["signup", "Kaydoldu", () => true],
    ["project", "Çalışma açtı", (u) => o.projectUsers.has(u)],
    ["wrote", "En az 300 kelime yazdı", (u) => (o.words.get(u) ?? 0) >= 300],
    ["ai", "Yapay zekâ kullandı", (u) => o.aiUsers.has(u)],
    ["export", "Dışa aktardı", (u) => o.exportUsers.has(u)],
    ["return", "İki farklı günde kullandı", (u) => (o.activeDays.get(u)?.size ?? 0) >= 2],
  ];
  return steps.map(([key, label, f]) => { const c = o.users.filter(f).length; return { key, label, count: c, rate: n ? Math.round((c / n) * 1000) / 10 : 0 }; });
}

/** Yapay zekâ güvenilirliği: model başına çağrı, hata oranı, medyan ve %95 süre (ms) */
export function aiReliability(rows: { model: string; ms: number; ttft_ms: number | null; ok: boolean; error: string | null }[]) {
  const pct = (xs: number[], p: number) => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]; };
  const by = new Map<string, typeof rows>();
  for (const r of rows) { if (!by.has(r.model)) by.set(r.model, []); by.get(r.model)!.push(r); }
  const models = [...by.entries()].map(([model, rs]) => ({
    model, calls: rs.length, errors: rs.filter((r) => !r.ok && r.error !== "aborted").length,
    errorRate: Math.round((rs.filter((r) => !r.ok && r.error !== "aborted").length / rs.length) * 1000) / 10,
    p50: pct(rs.filter((r) => r.ok).map((r) => r.ms), 50), p95: pct(rs.filter((r) => r.ok).map((r) => r.ms), 95),
    ttft50: pct(rs.filter((r) => r.ok && r.ttft_ms != null).map((r) => r.ttft_ms!), 50),
  })).sort((a, b) => b.calls - a.calls);
  const errs = new Map<string, number>();
  for (const r of rows) if (!r.ok && r.error && r.error !== "aborted") errs.set(r.error, (errs.get(r.error) ?? 0) + 1);
  const total = rows.length, failed = rows.filter((r) => !r.ok && r.error !== "aborted").length;
  return { total, failed, errorRate: total ? Math.round((failed / total) * 1000) / 10 : 0, models, topErrors: [...errs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([error, count]) => ({ error, count })) };
}
