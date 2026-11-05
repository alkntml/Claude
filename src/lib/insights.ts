/**
 * Yönetim ekranı için maliyet ve ölçüm özetleri (D90). Saf fonksiyonlar (test edilir); veri sunucuda okunur.
 */
import { ASSISTANT_ACTIONS } from "@/lib/ai/prompts";

const FEATURE_LABEL: Record<string, string> = {
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
};

export const TOOL_LABEL: Record<string, string> = {
  fake_check: "Uydurma kaynak kontrolü",
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
