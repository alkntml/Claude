/**
 * Tez konusu bulma: OpenAlex'ten konuya ait gerçek yayın istatistikleri (yıllık eğilim, alt konular,
 * yükselen alt konular, Türkiye'deki çalışılma düzeyi, son dönemin çok atıf alan çalışmaları).
 * Ayrıştırıcılar saf fonksiyonlardır (fixture testleri); öneriler yalnızca bu verilere dayanır.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface YearCount { year: number; count: number }
export interface Subtopic { id: string; name: string; recent: number; earlier: number; growth: number | null; field?: string }
export interface TopicWork { title: string; year: number | null; cited: number; doi: string | null; venue: string | null }
export interface TopicExploration {
  query: string;
  total: number;
  years: YearCount[];
  trend: { recent3: number; prev3: number; change: number | null };
  subtopics: Subtopic[];
  turkey: { total: number; turkish: number; share: number | null };
  topWorks: TopicWork[];
}

export function parseGroupYears(json: any, fromYear: number, toYear: number): YearCount[] {
  const map = new Map<number, number>();
  for (const g of json?.group_by ?? []) { const y = Number(g.key); if (Number.isInteger(y)) map.set(y, Number(g.count) || 0); }
  const out: YearCount[] = [];
  for (let y = fromYear; y <= toYear; y++) out.push({ year: y, count: map.get(y) ?? 0 });
  return out;
}

export function parseGroupTopics(json: any): Map<string, { name: string; count: number }> {
  const m = new Map<string, { name: string; count: number }>();
  for (const g of json?.group_by ?? []) {
    const id = String(g.key ?? "").replace("https://openalex.org/", "");
    if (!id || !g.key_display_name) continue;
    m.set(id, { name: String(g.key_display_name), count: Number(g.count) || 0 });
  }
  return m;
}

/** Son 3 yıl ile önceki 3 yılın alt konu sayıları karşılaştırılır (büyüme oranı) */
export function mergeSubtopics(recent: Map<string, { name: string; count: number }>, earlier: Map<string, { name: string; count: number }>): Subtopic[] {
  const ids = new Set([...recent.keys(), ...earlier.keys()]);
  return [...ids].map((id) => {
    const r = recent.get(id)?.count ?? 0, e = earlier.get(id)?.count ?? 0;
    return { id, name: recent.get(id)?.name ?? earlier.get(id)!.name, recent: r, earlier: e, growth: e >= 5 ? (r - e) / e : null };
  }).sort((a, b) => b.recent + b.earlier - (a.recent + a.earlier));
}

export function parseWorks(json: any): TopicWork[] {
  return (json?.results ?? []).map((w: any) => ({
    title: String(w.display_name ?? w.title ?? "").trim(),
    year: w.publication_year ?? null,
    cited: Number(w.cited_by_count) || 0,
    doi: w.doi ? String(w.doi).replace(/^https?:\/\/doi\.org\//, "") : null,
    venue: w.primary_location?.source?.display_name ?? null,
  })).filter((w: TopicWork) => w.title);
}

export function trendOf(years: YearCount[], lastFull: number) {
  const sum = (a: number, b: number) => years.filter((y) => y.year >= a && y.year <= b).reduce((s, y) => s + y.count, 0);
  const recent3 = sum(lastFull - 2, lastFull), prev3 = sum(lastFull - 5, lastFull - 3);
  return { recent3, prev3, change: prev3 >= 10 ? (recent3 - prev3) / prev3 : null };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
