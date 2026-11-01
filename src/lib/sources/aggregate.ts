import { titleSimilarity } from "@/lib/citations/checks";
import { normalizeDoi } from "@/lib/citations/util";
import { PROVIDERS } from "./providers";
import type { ProviderConfig, ProviderResult, SearchQuery, SearchResponse, SourceProviderId, SourceRecord } from "./types";

const PROVIDER_TIMEOUT_MS = 9000;

function filled(r: SourceRecord): number {
  return (["containerTitle", "volume", "issue", "pages", "publisher", "doi", "abstract", "oaUrl", "pmid"] as const)
    .filter((k) => r[k]).length + (r.authors.length ? 1 : 0);
}

/** İki kaydı birleştirir: daha eksiksiz olanı temel alır, eksik alanları diğerinden tamamlar. */
export function mergeRecords(a: SourceRecord, b: SourceRecord): SourceRecord {
  const [base, other] = filled(a) >= filled(b) ? [a, b] : [b, a];
  const out: SourceRecord = { ...base };
  for (const k of Object.keys(other) as (keyof SourceRecord)[]) {
    const v = other[k];
    const cur = out[k];
    if ((cur === null || cur === undefined || cur === "" || (Array.isArray(cur) && cur.length === 0)) && v !== undefined) {
      (out as unknown as Record<string, unknown>)[k] = v;
    }
  }
  // En uzun özeti tercih et (bazı sağlayıcılar kırpılmış özet verir)
  if ((other.abstract?.length ?? 0) > (out.abstract?.length ?? 0)) out.abstract = other.abstract;
  if ((other.citedByCount ?? 0) > (out.citedByCount ?? 0)) out.citedByCount = other.citedByCount;
  out.origins = [...new Set([...a.origins, ...b.origins])];
  const rank = { metadata: 0, abstract: 1, full_text: 2 } as const;
  out.accessLevel = rank[a.accessLevel] >= rank[b.accessLevel] ? a.accessLevel : b.accessLevel;
  if (out.abstract && out.accessLevel === "metadata") out.accessLevel = "abstract";
  return out;
}

export function dedupe(records: SourceRecord[]): SourceRecord[] {
  const out: SourceRecord[] = [];
  const byDoi = new Map<string, number>();
  for (const r of records) {
    if (!r.title) continue;
    const doi = normalizeDoi(r.doi);
    let idx = doi ? byDoi.get(doi) : undefined;
    if (idx === undefined) {
      idx = out.findIndex((o) => {
        const od = normalizeDoi(o.doi);
        if (doi && od && doi !== od) return false;
        const yearOk = !o.year || !r.year || Math.abs(o.year - r.year) <= 1;
        return yearOk && titleSimilarity(o.title, r.title) >= 0.85;
      });
      if (idx === -1) idx = undefined;
    }
    if (idx === undefined) {
      out.push(r);
      if (doi) byDoi.set(doi, out.length - 1);
    } else {
      out[idx] = mergeRecords(out[idx], r);
      const md = normalizeDoi(out[idx].doi);
      if (md) byDoi.set(md, idx);
    }
  }
  return out;
}

function tokens(s: string): string[] {
  return s.toLocaleLowerCase("tr").normalize("NFKD").replace(/[̀-ͯ]/g, "").split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 2);
}

/** Basit, açıklanabilir alaka puanı: başlık/özet terim örtüşmesi + atıf + erişim. */
export function scoreRecord(r: SourceRecord, query: string): number {
  const q = new Set(tokens(query));
  if (!q.size) return 0;
  const title = new Set(tokens(r.title));
  const abs = new Set(tokens(r.abstract ?? ""));
  let tHits = 0, aHits = 0;
  for (const w of q) {
    if (title.has(w)) tHits++;
    if (abs.has(w)) aHits++;
  }
  const coverage = (tHits * 2 + aHits) / (q.size * 3);
  const citations = Math.log10(1 + (r.citedByCount ?? 0)) / 4; // 10.000 atıf ≈ 1
  const access = r.accessLevel === "full_text" ? 0.15 : r.accessLevel === "abstract" ? 0.1 : 0;
  const verifiable = r.doi || r.pmid || r.arxivId ? 0.1 : 0;
  return Math.round((coverage * 0.65 + Math.min(citations, 1) * 0.15 + access + verifiable) * 1000) / 1000;
}

export async function searchAll(
  q: SearchQuery,
  enabled: SourceProviderId[],
  cfg: ProviderConfig,
): Promise<SearchResponse> {
  const wanted = q.turkishOnly ? (["turkiye"] as SourceProviderId[]) : q.providers?.length ? q.providers : enabled;
  const ids = wanted.filter((p) => enabled.includes(p) && PROVIDERS[p]?.search);
  const providers: ProviderResult[] = [];

  const settled = await Promise.all(
    ids.map(async (id) => {
      const p = PROVIDERS[id];
      const reason = p.unavailableReason?.(cfg);
      if (reason) {
        providers.push({ provider: id, ok: false, count: 0, error: reason, ms: 0 });
        return [];
      }
      const started = Date.now();
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), PROVIDER_TIMEOUT_MS);
      try {
        const recs = await p.search!(q, cfg, ctrl.signal);
        providers.push({ provider: id, ok: true, count: recs.length, ms: Date.now() - started });
        return recs;
      } catch (e) {
        const msg = ctrl.signal.aborted ? "zaman aşımı" : e instanceof Error ? e.message : "bilinmeyen hata";
        providers.push({ provider: id, ok: false, count: 0, error: msg, ms: Date.now() - started });
        return [];
      } finally {
        clearTimeout(timer);
      }
    }),
  );

  let results = dedupe(settled.flat());
  if (q.yearFrom) results = results.filter((r) => !r.year || r.year >= q.yearFrom!);
  if (q.yearTo) results = results.filter((r) => !r.year || r.year <= q.yearTo!);
  if (q.openAccessOnly) results = results.filter((r) => r.oaUrl || r.accessLevel === "full_text");
  for (const r of results) r.score = scoreRecord(r, q.query);
  results.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return { results: results.slice(0, q.limit ? q.limit * 2 : 40), providers };
}
