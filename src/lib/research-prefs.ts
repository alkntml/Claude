/**
 * Araştırma tercihleri (D149). Çalışma başında (yeni çalışma sihirbazı) ve sonradan (çalışma ayarları) seçilir;
 * project.context.research içinde tutulur. Saf modül: istemci ve sunucu birlikte kullanır.
 * - mode: veri tabanı taraması “auto” (gerektiğinde kendiliğinden), “ask” (her seferinde izin sor), “off” (yalnızca açık istekte)
 * - yearFrom: bu yıldan eski yayınlar eklenmez; minCitations: en az atıf (atıf sayısı bilinmeyen kayıtlar elenmez)
 * - preprints: ön baskılar (arXiv, bioRxiv, SSRN vb.) eklensin mi
 */
import type { SourceRecord } from "@/lib/sources/types";

export type ResearchMode = "auto" | "ask" | "off";
export interface ResearchPrefs { mode: ResearchMode; yearFrom: number | null; minCitations: number; preprints: boolean }
export const DEFAULT_RESEARCH_PREFS: ResearchPrefs = { mode: "auto", yearFrom: null, minCitations: 0, preprints: true };

export function readResearchPrefs(ctx: unknown): ResearchPrefs {
  const r = (ctx && typeof ctx === "object" ? (ctx as { research?: Partial<ResearchPrefs> }).research : null) ?? {};
  const mode: ResearchMode = r.mode === "ask" || r.mode === "off" ? r.mode : "auto";
  const y = Number(r.yearFrom);
  const yearFrom = Number.isInteger(y) && y >= 1900 && y <= 2100 ? y : null;
  const m = Math.max(0, Math.min(100000, Math.round(Number(r.minCitations) || 0)));
  return { mode, yearFrom, minCitations: m, preprints: r.preprints !== false };
}

const PREPRINT_RE = /\b(arxiv|biorxiv|medrxiv|chemrxiv|psyarxiv|socarxiv|ssrn|research square|preprints?\.org|osf preprints|preprint)\b/i;
export function isPreprint(r: Pick<SourceRecord, "type" | "containerTitle" | "origins" | "arxivId" | "publisher">): boolean {
  if ((r.type as string) === "posted-content") return true;
  if (r.arxivId && !r.containerTitle) return true;
  return PREPRINT_RE.test(`${r.containerTitle ?? ""} ${r.publisher ?? ""}`);
}

/** Tercihlere uymayan sonuçları eler (sıralama değişmez) */
export function filterByPrefs<T extends Pick<SourceRecord, "year" | "citedByCount" | "type" | "containerTitle" | "origins" | "arxivId" | "publisher">>(results: T[], p: ResearchPrefs): T[] {
  return results.filter((r) =>
    (p.yearFrom == null || (r.year ?? 0) >= p.yearFrom)
    && (p.minCitations <= 0 || r.citedByCount == null || r.citedByCount >= p.minCitations)
    && (p.preprints || !isPreprint(r)),
  );
}

/** “Son 5 yıl” gibi hazır seçimler için başlangıç yılı */
export function yearsAgo(n: number, now = new Date()): number { return now.getFullYear() - n; }

/**
 * Konu/istem gücü (sihirbazdaki “Zayıf istem” göstergesi). Yapay zekâsız, sezgisel: uzunluk, değişken/ilişki,
 * örneklem/bağlam ve yöntem ipuçları. Amaç kullanıcıyı daha fazla bağlam yazmaya yönlendirmek.
 */
export function promptStrength(text: string): { level: "empty" | "weak" | "medium" | "strong"; missing: ("length" | "relation" | "context" | "method")[] } {
  const s = text.trim();
  if (!s) return { level: "empty", missing: ["length", "relation", "context", "method"] };
  const words = (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  const low = s.toLocaleLowerCase("tr");
  const has = {
    length: words >= 12,
    relation: /(ilişki|etki|rol|fark|karşılaştır|aracı|düzenleyici|yordayıcı|relationship|effect|impact|role|differen|compar|mediat|moderat|predict|zusammenhang|einfluss|wirkung|vergleich)/u.test(low),
    context: /(öğrenci|öğretmen|hasta|çalışan|kadın|erkek|çocuk|ergen|yetişkin|türkiye|üniversite|okul|hastane|şirket|kurum|il |ülke|students?|teachers?|patients?|employees?|adolescents?|adults?|children|school|universit|hospital|compan|countr|schüler|studierende|patient|unternehmen)/u.test(low),
    method: /(nicel|nitel|karma|anket|ölçek|görüşme|deney|meta-?analiz|sistematik|literatür taraması|vaka|regresyon|quantitative|qualitative|mixed|survey|interview|experiment|systematic|review|case study|regression|quantitativ|qualitativ|befragung|interview)/u.test(low),
  };
  const missing = (Object.keys(has) as (keyof typeof has)[]).filter((k) => !has[k]);
  const score = 4 - missing.length;
  return { level: score >= 4 ? "strong" : score >= 2 ? "medium" : "weak", missing };
}
