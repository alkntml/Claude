import "server-only";
/**
 * Literatür haritası (D123, D141): çalışmadaki kaynakların OpenAlex kayıtları (kaynakça listeleri ve konuları dahil)
 * toplu çekilir; atıf, ortak kaynakça ve birlikte atıf ağı kurulur, kümelenir. Ayrıca:
 *  - Eksik temel çalışmalar: kaynaklarınızın en az ikisinin atıf yaptığı ama çalışmanızda olmayan yayınlar.
 *  - Yeni çalışmalar: son yıllarda yayımlanmış ve kaynaklarınızın en az ikisine atıf yapan yayınlar (ileri atıf).
 *  - Konu haritası ve kural tabanlı boşluk analizi.
 * Yalnızca DOI veya OpenAlex kimliği olan kaynaklar haritaya girer. Yapay zekâ kullanılmaz.
 */
import { buildGraph, insights, parseTopic, shortId, topicMap, type Insight, type LitGraph, type OAWork, type OATopic, type TopicRow } from "@/lib/litmap-graph";
import { getJsonRetry } from "@/lib/sources/http";
import { parseOpenAlex } from "@/lib/sources/providers";
import type { SourceRecord } from "@/lib/sources/types";

const SELECT = "id,doi,title,display_name,publication_year,referenced_works,cited_by_count,primary_topic";
/* eslint-disable @typescript-eslint/no-explicit-any */
async function fetchWorks(filter: string, select: string | null, contactEmail?: string | null, extra: Record<string, string> = {}): Promise<any[]> {
  const p = new URLSearchParams({ filter, "per-page": "50", ...extra });
  if (select) p.set("select", select);
  if (contactEmail) p.set("mailto", contactEmail);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 15000);
  try { return ((await getJsonRetry<any>(`https://api.openalex.org/works?${p}`, { signal: ctl.signal })).results ?? []) as any[]; }
  finally { clearTimeout(timer); }
}

export type Suggestion = SourceRecord & { refCount: number; topic?: OATopic | null };
export type NewWork = SourceRecord & { citesMine: number; topic?: OATopic | null };
export interface LitMapData extends LitGraph { suggestions: Suggestion[]; newWorks: NewWork[]; topics: TopicRow[]; insights: Insight[]; mapped: number; unmapped: number; version: 2 }

const toWork = (w: any, sourceId: string): OAWork & { sourceId: string } => ({ id: w.id, doi: w.doi, title: w.display_name ?? w.title ?? "", year: w.publication_year ?? null, referenced_works: w.referenced_works ?? [], cited_by_count: w.cited_by_count ?? 0, topic: parseTopic(w.primary_topic), sourceId });

export async function buildLiteratureMap(sources: { id: string; doi: string | null; openalex_id: string | null }[], contactEmail?: string | null, nowYear = new Date().getFullYear()): Promise<LitMapData> {
  const withDoi = sources.filter((s) => s.doi).slice(0, 150);
  const withOa = sources.filter((s) => !s.doi && s.openalex_id).slice(0, 50);
  const works: (OAWork & { sourceId: string })[] = [];
  const norm = (d: string) => d.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  const chunks: { id: string; doi: string | null }[][] = [];
  for (let i = 0; i < withDoi.length; i += 50) chunks.push(withDoi.slice(i, i + 50));
  const doiRes = await Promise.all(chunks.map((chunk) => fetchWorks(`doi:${chunk.map((s) => norm(s.doi!)).join("|")}`, SELECT, contactEmail).catch(() => [] as any[])));
  doiRes.forEach((res, ci) => { for (const w of res) { const src = chunks[ci].find((s) => w.doi && norm(w.doi) === norm(s.doi!)); if (src && !works.some((x) => x.sourceId === src.id)) works.push(toWork(w, src.id)); } });
  if (withOa.length) {
    const res = await fetchWorks(`openalex_id:${withOa.map((s) => shortId(s.openalex_id!)).join("|")}`, SELECT, contactEmail).catch(() => []);
    for (const w of res) { const src = withOa.find((s) => shortId(s.openalex_id!) === shortId(w.id)); if (src) works.push(toWork(w, src.id)); }
  }

  // İleri atıf: kaynaklarınıza atıf yapan son 6 yılın yayınları (en çok atıf alanlar önce); birlikte atıf ve “yeni çalışmalar” için
  const mineIds = works.map((w) => shortId(w.id));
  const mineSet = new Set(mineIds);
  let citing: any[] = [];
  if (mineIds.length >= 2) {
    const parts: string[][] = [];
    for (let i = 0; i < Math.min(mineIds.length, 100); i += 50) parts.push(mineIds.slice(i, i + 50));
    const res = await Promise.all(parts.map((ids) => fetchWorks(`cites:${ids.join("|")},from_publication_date:${nowYear - 6}-01-01`, SELECT, contactEmail, { "per-page": "200", sort: "cited_by_count:desc" }).catch(() => [] as any[])));
    const seen = new Set<string>();
    citing = res.flat().filter((w) => { const id = shortId(w.id); if (seen.has(id) || mineSet.has(id)) return false; seen.add(id); return true; });
  }

  const graph = buildGraph(works, { citing });
  const newCands = citing
    .map((w) => ({ id: shortId(w.id), citesMine: new Set((w.referenced_works ?? []).map(shortId).filter((r: string) => mineSet.has(r))).size, year: w.publication_year ?? 0 }))
    .filter((x) => x.citesMine >= 2)
    .sort((a, b) => b.citesMine - a.citesMine || b.year - a.year)
    .slice(0, 15);

  // Önerilerin tam kaydı (yazar, dergi, özet) tek istekte
  const wanted = [...graph.candidates.map((c) => c.id), ...newCands.map((c) => c.id)].slice(0, 50);
  const full = wanted.length ? await fetchWorks(`openalex_id:${wanted.join("|")}`, null, contactEmail).catch(() => []) : [];
  const rawById = new Map(full.map((w: any) => [shortId(w.id), w]));
  const recs = parseOpenAlex({ results: full });
  const recById = new Map(recs.filter((r) => r.openalexId).map((r) => [shortId(r.openalexId!), r]));
  const trim = (r: SourceRecord) => ({ ...r, abstract: r.abstract ? r.abstract.slice(0, 1500) : null });
  const suggestions: Suggestion[] = graph.candidates.flatMap((c) => { const r = recById.get(c.id); return r ? [{ ...trim(r), refCount: c.refCount, topic: parseTopic(rawById.get(c.id)?.primary_topic) }] : []; });
  const newWorks: NewWork[] = newCands.flatMap((c) => { const r = recById.get(c.id); return r ? [{ ...trim(r), citesMine: c.citesMine, topic: parseTopic(rawById.get(c.id)?.primary_topic) }] : []; });

  const topics = topicMap(works.map((w) => w.topic), [...suggestions.map((s) => s.topic), ...newWorks.map((s) => s.topic), ...citing.slice(0, 120).map((w) => parseTopic(w.primary_topic))]);
  return { ...graph, suggestions, newWorks, topics, insights: insights(graph, topics, nowYear), mapped: works.length, unmapped: sources.length - works.length, version: 2 };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
