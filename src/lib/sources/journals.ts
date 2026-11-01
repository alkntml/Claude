/**
 * Dergi önerisi: konuya benzer makalelerin OpenAlex'te gerçekten yayımlandığı dergiler.
 * Yapay zekâ dergi adı üretmez; liste tamamen veri tabanı kayıtlarından çıkarılır.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface JournalSuggestion {
  id: string;            // OpenAlex kaynak kimliği (S123…)
  name: string;
  issn: string | null;
  publisher: string | null;
  isOa: boolean;
  inDoaj: boolean;
  count: number;         // bu konudaki benzer makale sayısı
  examples: { title: string; year: number | null; doi: string | null }[];
  hIndex?: number | null;
  meanCitedness?: number | null;
  homepage?: string | null;
  fromProjectSources?: number;
}

export function aggregateVenues(works: any[]): JournalSuggestion[] {
  const map = new Map<string, JournalSuggestion>();
  for (const w of works) {
    const src = w?.primary_location?.source;
    if (!src?.id || src.type !== "journal" || !src.display_name) continue;
    const id = String(src.id).replace("https://openalex.org/", "");
    const cur: JournalSuggestion = map.get(id) ?? {
      id, name: String(src.display_name), issn: src.issn_l ?? (Array.isArray(src.issn) ? src.issn[0] : null) ?? null,
      publisher: src.host_organization_name ?? null, isOa: !!src.is_oa, inDoaj: !!src.is_in_doaj, count: 0, examples: [],
    };
    cur.count++;
    if (cur.examples.length < 3) cur.examples.push({ title: String(w.display_name ?? w.title ?? ""), year: w.publication_year ?? null, doi: w.doi ? String(w.doi).replace(/^https?:\/\/doi\.org\//, "") : null });
    map.set(id, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** OpenAlex /sources yanıtıyla dergi metriklerini ekler */
export function enrichVenues(list: JournalSuggestion[], sourcesJson: any): JournalSuggestion[] {
  const byId = new Map<string, any>((sourcesJson?.results ?? []).map((s: any) => [String(s.id).replace("https://openalex.org/", ""), s]));
  return list.map((j) => {
    const s = byId.get(j.id);
    if (!s) return j;
    return { ...j, hIndex: s.summary_stats?.h_index ?? null, meanCitedness: s.summary_stats?.["2yr_mean_citedness"] ?? null, homepage: s.homepage_url ?? null, inDoaj: j.inDoaj || !!s.is_in_doaj };
  });
}

/** Proje anahtar kelimelerinden arama ifadesi */
export function journalQuery(project: { title?: string; topic?: string | null; keywords?: string[] | null }): string {
  const kw = (project.keywords ?? []).filter(Boolean).slice(0, 5).join(" ");
  const base = kw || project.topic || project.title || "";
  return base.replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter((w) => w.length > 2).slice(0, 10).join(" ");
}
/* eslint-enable @typescript-eslint/no-explicit-any */
