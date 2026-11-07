import "server-only";
/**
 * Literatür haritası (D123): çalışmadaki kaynakların OpenAlex kayıtları (kaynakça listeleri dahil) toplu çekilir,
 * atıf ağı kurulur ve kaynakların ortak atıf yaptığı ama çalışmada olmayan yayınlar önerilir.
 * Yalnızca DOI veya OpenAlex kimliği olan kaynaklar haritaya girer.
 */
import { buildGraph, shortId, type LitGraph, type OAWork } from "@/lib/litmap-graph";
import { getJsonRetry } from "@/lib/sources/http";
import { parseOpenAlex } from "@/lib/sources/providers";
import type { SourceRecord } from "@/lib/sources/types";

const SELECT = "id,doi,title,display_name,publication_year,referenced_works,cited_by_count";
/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchWorks(filter: string, select: string | null, contactEmail?: string | null): Promise<any[]> {
  const p = new URLSearchParams({ filter, "per-page": "50" });
  if (select) p.set("select", select);
  if (contactEmail) p.set("mailto", contactEmail);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try { return ((await getJsonRetry<any>(`https://api.openalex.org/works?${p}`, { signal: ctl.signal })).results ?? []) as any[]; }
  finally { clearTimeout(timer); }
}

export async function buildLiteratureMap(sources: { id: string; doi: string | null; openalex_id: string | null }[], contactEmail?: string | null): Promise<LitGraph & { suggestions: (SourceRecord & { refCount: number })[]; mapped: number; unmapped: number }> {
  const withDoi = sources.filter((s) => s.doi).slice(0, 150);
  const withOa = sources.filter((s) => !s.doi && s.openalex_id).slice(0, 50);
  const works: (OAWork & { sourceId: string })[] = [];
  const norm = (d: string) => d.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  for (let i = 0; i < withDoi.length; i += 50) {
    const chunk = withDoi.slice(i, i + 50);
    const res = await fetchWorks(`doi:${chunk.map((s) => norm(s.doi!)).join("|")}`, SELECT, contactEmail).catch(() => []);
    for (const w of res) {
      const src = chunk.find((s) => w.doi && norm(w.doi) === norm(s.doi!));
      if (src) works.push({ id: w.id, doi: w.doi, title: w.display_name ?? w.title ?? "", year: w.publication_year ?? null, referenced_works: w.referenced_works ?? [], cited_by_count: w.cited_by_count ?? 0, sourceId: src.id });
    }
  }
  if (withOa.length) {
    const res = await fetchWorks(`openalex_id:${withOa.map((s) => shortId(s.openalex_id!)).join("|")}`, SELECT, contactEmail).catch(() => []);
    for (const w of res) {
      const src = withOa.find((s) => shortId(s.openalex_id!) === shortId(w.id));
      if (src) works.push({ id: w.id, doi: w.doi, title: w.display_name ?? w.title ?? "", year: w.publication_year ?? null, referenced_works: w.referenced_works ?? [], cited_by_count: w.cited_by_count ?? 0, sourceId: src.id });
    }
  }
  const graph = buildGraph(works);
  let suggestions: (SourceRecord & { refCount: number })[] = [];
  if (graph.candidates.length) {
    const res = await fetchWorks(`openalex_id:${graph.candidates.map((c) => c.id).join("|")}`, null, contactEmail).catch(() => []);
    const recs = parseOpenAlex({ results: res });
    suggestions = recs.map((r) => ({ ...r, abstract: r.abstract ? r.abstract.slice(0, 1500) : null, refCount: graph.candidates.find((c) => r.openalexId && shortId(r.openalexId) === c.id)?.refCount ?? 0 }))
      .filter((r) => r.refCount > 0).sort((a, b) => b.refCount - a.refCount);
  }
  return { ...graph, suggestions, mapped: works.length, unmapped: sources.length - works.length };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
