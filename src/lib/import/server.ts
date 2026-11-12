import "server-only";
/**
 * Belgeden içe aktarma, sunucu tarafı (D87): Word → düğümler, kaynakçadaki kayıtları doğrulayıp projeye ekleme
 * (DOI varsa kayıt otoritesinden künye), metin içi atıfları bu kaynaklara bağlama. Yapay zekâ kullanılmaz; metin
 * yeniden yazılmaz. Kaynak satırı ayrıştırılamıyor veya doğrulanamıyorsa “doğrulanmadı” olarak eklenir ve raporlanır.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeDoi } from "@/lib/citations";
import type { JSONNode } from "@/lib/editor/doc";
import { providerConfig } from "@/lib/env";
import { htmlToNodes } from "./html-doc";
import { fitHeadings, fold, linkCitations, parseReference, splitReferences, type ParsedRef, type RefKey } from "./references";
import { addSourcesToProject, mapLimit, recordToInput } from "@/lib/research";
import { SourceInput } from "@/lib/sources/input";
import { verifySource } from "@/lib/sources/verify";

export interface ImportReport {
  refsTotal: number;
  refsAdded: number;
  refsReused: number;
  refsUnverified: string[];
  linked: number;
  unmatched: string[];
  images: number;
  headings: number;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const MAX_REFS = 150;

/** Belgedeki bir kaynak satırına karşılık gelen proje kaynağı (DOI, başlık ya da ilk yazar + yıl + başlık başı) */
function findExisting(p: ParsedRef, sources: any[]): any | null {
  const doi = normalizeDoi(p.doi);
  if (doi) { const s = sources.find((x) => normalizeDoi(x.doi) === doi); if (s) return s; }
  const ft = fold(p.title);
  if (ft.length > 12) {
    const s = sources.find((x) => { const xt = fold(x.title ?? ""); return xt && (xt === ft || (ft.length > 25 && (xt.startsWith(ft.slice(0, 40)) || ft.startsWith(xt.slice(0, 40))))); });
    if (s) return s;
  }
  return null;
}

/**
 * Kaynakça satırlarını projeye ekler (mevcutlarla eşleştirir, DOI varsa kayıt otoritesinden künye) ve metin içi atıf
 * bağlama anahtarlarını döndürür. Word içe aktarma (tek bölüm) ve tüm çalışmayı içe aktarma (D149) ortak kullanır.
 */
export async function addReferenceLines(db: SupabaseClient, projectId: string, userId: string, lines: string[]): Promise<{ keys: RefKey[]; added: any[]; reused: number; unverified: string[]; total: number }> {
  const parsed = lines.slice(0, MAX_REFS).map(parseReference);
  const { data: before } = await db.from("sources").select("*").eq("project_id", projectId).eq("user_id", userId);
  const existing = before ?? [];
  const reused = new Map<number, any>();
  parsed.forEach((p, i) => { const s = findExisting(p, existing); if (s) reused.set(i, s); });
  const cfg = providerConfig();
  const todo = parsed.map((p, i) => ({ p, i })).filter((x) => !reused.has(x.i));
  const inputs = await mapLimit(todo, 6, async ({ p }) => {
    const doi = normalizeDoi(p.doi);
    if (doi) {
      const v = await verifySource({ title: "", doi, pmid: null, arxivId: null }, cfg).catch(() => null);
      if (v?.record) return recordToInput({ ...v.record, origins: [v.authority ?? "manual"] } as any);
    }
    const safe = SourceInput.safeParse({
      type: "article-journal", title: p.title || p.raw.slice(0, 300), authors: p.authors.map((a) => ({ family: a.family, given: a.given })),
      year: p.year, containerTitle: p.container, doi, origins: ["manual"], relevanceNote: `Belgeden içe aktarıldı: ${p.raw.slice(0, 600)}`,
    });
    return safe.success ? safe.data : null;
  });
  const valid = inputs.filter((x): x is NonNullable<typeof x> => !!x);
  const added = valid.length ? await addSourcesToProject(db, projectId, userId, valid) : { sources: [] as any[] };
  // Her kaynak satırını bir proje kaynağına bağla (yeni eklenen veya mevcut)
  const pool = [...existing, ...added.sources];
  const keys: RefKey[] = [];
  const unverified: string[] = [];
  parsed.forEach((p, i) => {
    const s = reused.get(i) ?? findExisting(p, added.sources) ?? findExisting(p, pool);
    if (!s) return;
    keys.push({ id: s.id, families: p.families.length ? p.families : (s.authors ?? []).map((a: any) => a.family ?? a.literal ?? "").filter(Boolean), year: p.year ?? s.year ?? null, suffix: p.yearSuffix || undefined });
    if (!reused.has(i) && !s.verified) unverified.push(p.raw.slice(0, 160));
  });
  return { keys, added: added.sources, reused: reused.size, unverified: unverified.slice(0, 20), total: parsed.length };
}

/** Word belgesinden düğümler (başlıklar, tablolar, görseller) */
export async function docxToNodes(buffer: Buffer): Promise<{ nodes: JSONNode[]; images: number }> {
  const mammoth = await import("mammoth");
  const html = await mammoth.convertToHtml({ buffer }, { styleMap: ["p[style-name='Title'] => h1:fresh", "p[style-name='Subtitle'] => h2:fresh"] });
  const { nodes, stats } = htmlToNodes(html.value);
  return { nodes, images: stats.images };
}

export async function importDocx(db: SupabaseClient, params: { projectId: string; userId: string; buffer: Buffer; base: number; max: number; dropTitle?: string | null }): Promise<{ nodes: JSONNode[]; sources: any[]; report: ImportReport }> {
  const { nodes: raw, images } = await docxToNodes(params.buffer);
  const { body, refs: lines } = splitReferences(raw);
  const r = await addReferenceLines(db, params.projectId, params.userId, lines);
  // Başlıkları çalışmaya oturt, atıfları bağla
  const dropTitle = params.dropTitle ? fold(params.dropTitle) : null;
  const fitted = fitHeadings(body, { base: params.base, max: params.max, dropTitle: dropTitle ? (t) => fold(t) === dropTitle : undefined });
  const { nodes, report } = linkCitations(fitted, r.keys);
  return {
    nodes,
    sources: r.added,
    report: {
      refsTotal: r.total, refsAdded: r.added.length, refsReused: r.reused, refsUnverified: r.unverified,
      linked: report.linked, unmatched: report.unmatched, images, headings: nodes.filter((n) => n.type === "heading").length,
    },
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
