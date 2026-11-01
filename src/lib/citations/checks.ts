import type { CitationItem, ItemType } from "./types";
import { normalizeDoi } from "./util";

const REQUIRED: Record<ItemType, (keyof CitationItem)[]> = {
  "article-journal": ["title", "authors", "year", "containerTitle", "volume", "pages"],
  book: ["title", "authors", "year", "publisher"],
  chapter: ["title", "authors", "year", "containerTitle", "publisher", "pages"],
  "paper-conference": ["title", "authors", "year", "containerTitle"],
  thesis: ["title", "authors", "year", "institution"],
  report: ["title", "authors", "year", "publisher"],
  webpage: ["title", "year", "url"],
  preprint: ["title", "authors", "year"],
  dataset: ["title", "authors", "year"],
  other: ["title", "year"],
};

export const FIELD_LABELS: Partial<Record<keyof CitationItem, string>> = {
  title: "Başlık", authors: "Yazar", year: "Yıl", containerTitle: "Dergi / kitap adı", volume: "Cilt",
  pages: "Sayfa aralığı", publisher: "Yayınevi", institution: "Kurum", url: "URL", doi: "DOI",
};

export function missingFields(it: CitationItem): (keyof CitationItem)[] {
  const req = REQUIRED[it.type] ?? REQUIRED.other;
  const missing = req.filter((k) => {
    const v = it[k];
    if (k === "authors") return !it.authors.length && !(it.editors?.length);
    if (k === "institution") return !it.institution && !it.publisher;
    return v === null || v === undefined || (typeof v === "string" && !v.trim());
  });
  // Dergi makalelerinde DOI veya URL önerilir (APA 7, AMA, IEEE).
  if (it.type === "article-journal" && !it.doi && !it.url) missing.push("doi");
  return missing;
}

function normTitle(s: string): string {
  return s.toLocaleLowerCase("tr").normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

/** Jaccard benzerliği (kelime kümeleri). */
export function titleSimilarity(a: string, b: string): number {
  const A = new Set(normTitle(a).split(" ").filter((w) => w.length > 2));
  const B = new Set(normTitle(b).split(" ").filter((w) => w.length > 2));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / (A.size + B.size - inter);
}

export interface DuplicateGroup {
  ids: string[];
  reason: "doi" | "title";
}

export function findDuplicates(items: CitationItem[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const seen = new Set<string>();
  const byDoi = new Map<string, string[]>();
  for (const it of items) {
    const d = normalizeDoi(it.doi);
    if (!d) continue;
    byDoi.set(d, [...(byDoi.get(d) ?? []), it.id]);
  }
  for (const ids of byDoi.values()) {
    if (ids.length > 1) {
      groups.push({ ids, reason: "doi" });
      ids.forEach((id) => seen.add(id));
    }
  }
  for (let a = 0; a < items.length; a++) {
    if (seen.has(items[a].id)) continue;
    const group = [items[a].id];
    for (let b = a + 1; b < items.length; b++) {
      if (seen.has(items[b].id)) continue;
      const da = normalizeDoi(items[a].doi), db = normalizeDoi(items[b].doi);
      if (da && db && da !== db) continue; // farklı DOI = farklı eser
      const sameYear = !items[a].year || !items[b].year || items[a].year === items[b].year;
      if (sameYear && titleSimilarity(items[a].title, items[b].title) >= 0.85) {
        group.push(items[b].id);
        seen.add(items[b].id);
      }
    }
    if (group.length > 1) {
      seen.add(items[a].id);
      groups.push({ ids: group, reason: "title" });
    }
  }
  return groups;
}

export interface ConsistencyReport {
  /** Metinde atıf yapılmış ama kaynak listesinde bulunmayan (silinmiş) kaynak kimlikleri */
  danglingCitations: string[];
  /** Kaynak listesinde olup metinde hiç atıf yapılmayan kaynaklar */
  uncitedSources: string[];
  /** Metinde elle yazılmış, hiçbir kaynakla eşleşmeyen yazar-tarih atıfları (ör. "(Yılmaz, 2019)") */
  unmatchedManualCitations: string[];
}

/** Elle yazılmış yazar-tarih atıflarını yakalar: (Yılmaz, 2019), (Smith & Jones, 2020, p. 4), Yılmaz (2019) */
const MANUAL_CITE = /\(([^()]*?\p{Lu}[\p{L}'’\-]+[^()]*?,?\s(?:19|20)\d{2}[a-z]?)[^()]*\)|(\p{Lu}[\p{L}'’\-]+(?:\s(?:ve|and|&)\s\p{Lu}[\p{L}'’\-]+|\s(?:vd\.|et al\.))?)\s\(((?:19|20)\d{2}[a-z]?)\)/gu;

export function checkConsistency(params: {
  citedIds: string[];
  sources: CitationItem[];
  plainText: string;
}): ConsistencyReport {
  const sourceIds = new Set(params.sources.map((s) => s.id));
  const cited = new Set(params.citedIds);
  const danglingCitations = [...cited].filter((id) => !sourceIds.has(id));
  const uncitedSources = params.sources.filter((s) => !cited.has(s.id)).map((s) => s.id);

  const families = new Set(
    params.sources.flatMap((s) => s.authors.map((a) => (a.literal ?? a.family ?? "").toLocaleLowerCase("tr"))).filter(Boolean),
  );
  const unmatched: string[] = [];
  for (const m of params.plainText.matchAll(MANUAL_CITE)) {
    const raw = m[0];
    const names = raw.match(/\p{Lu}[\p{L}'’\-]+/gu) ?? [];
    const known = names.some((n) => families.has(n.toLocaleLowerCase("tr")));
    if (!known) unmatched.push(raw);
  }
  return { danglingCitations, uncitedSources, unmatchedManualCitations: [...new Set(unmatched)].slice(0, 50) };
}
