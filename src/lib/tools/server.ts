import "server-only";
/**
 * Ücretsiz araçların sunucu tarafı (D90): künye bulma (yalnızca kayıt otoriteleri; yapay zekâ yok) ve
 * uydurma kaynak kontrolü (kayıt otoriteleri; satır ayrıştırılamazsa küçük bir yapay zekâ modeliyle ayrıştırma,
 * maliyeti tool_usage’a yazılır).
 */
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { normalizeDoi } from "@/lib/citations";
import { titleSimilarity } from "@/lib/citations/checks";
import { providerConfig } from "@/lib/env";
import { fold, parseReference, type ParsedRef } from "@/lib/import/references";
import { mapLimit } from "@/lib/research";
import { PROVIDERS } from "@/lib/sources/providers";
import type { SourceRecord } from "@/lib/sources/types";
import { verifySource } from "@/lib/sources/verify";

const withTimeout = <T,>(p: (signal: AbortSignal) => Promise<T>, ms = 9000): Promise<T | null> => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  return p(ctrl.signal).catch(() => null).finally(() => clearTimeout(timer));
};

/** Başlık (+ ilk yazar, yıl) ile Crossref ve OpenAlex’te arar; en benzer kaydı benzerliğiyle döndürür */
export async function searchByTitle(title: string, author?: string | null, year?: number | null): Promise<{ record: SourceRecord; similarity: number } | null> {
  const cfg = providerConfig();
  const q = { query: title.slice(0, 300), author: author ?? undefined, limit: 5 };
  const lists = await Promise.all([
    withTimeout((s) => PROVIDERS.crossref.search!(q, cfg, s)),
    withTimeout((s) => PROVIDERS.openalex.search!({ query: title.slice(0, 300), limit: 5 }, cfg, s)),
  ]);
  let best: { record: SourceRecord; similarity: number } | null = null;
  for (const r of lists.flat().filter((x): x is SourceRecord => !!x)) {
    let sim = titleSimilarity(title, r.title);
    if (year && r.year && Math.abs(r.year - year) > 1) sim -= 0.15;
    if (!best || sim > best.similarity) best = { record: r, similarity: Math.round(sim * 100) / 100 };
  }
  return best;
}

/** Künye bul: DOI → kayıt otoritesi; değilse başlıkla arama (yalnızca güçlü eşleşme döner) */
export async function lookupRecord(input: string): Promise<SourceRecord | null> {
  const doi = normalizeDoi(input.match(/10\.\d{4,9}\/\S+/)?.[0]?.replace(/[.,;)\]]+$/, "") ?? input);
  const cfg = providerConfig();
  if (doi) {
    const v = await verifySource({ title: "", doi, pmid: null, arxivId: null }, cfg).catch(() => null);
    return v?.record ?? null;
  }
  const p = parseReference(input);
  const title = p.title.length > 15 ? p.title : input;
  const found = await searchByTitle(title, p.families[0], p.year);
  return found && found.similarity >= 0.8 ? found.record : null;
}

export type CheckStatus = "verified" | "partial" | "mismatch" | "not_found" | "unparsed";
export interface CheckResult {
  input: string;
  status: CheckStatus;
  /** Kullanıcıya gösterilen kısa açıklama */
  note: string;
  found?: { title: string; authors: string; year: number | null; container: string | null; doi: string | null } | null;
}

const authorsShort = (r: SourceRecord) => {
  const f = r.authors.map((a) => a.family ?? a.literal ?? "").filter(Boolean);
  return f.length > 2 ? `${f[0]} vd.` : f.join(", ");
};
const brief = (r: SourceRecord) => ({ title: r.title, authors: authorsShort(r), year: r.year, container: r.containerTitle ?? null, doi: r.doi ?? null });

/** Yazar ve yıl uyumu (künye farkı açıklaması için) */
function differences(p: ParsedRef, r: SourceRecord): string[] {
  const out: string[] = [];
  if (p.year && r.year && Math.abs(p.year - r.year) > 1) out.push(`yıl ${r.year}`);
  const first = p.families[0] ? fold(p.families[0]) : "";
  if (first && r.authors.length && !r.authors.some((a) => fold(a.family ?? a.literal ?? "").includes(first))) out.push(`yazar ${authorsShort(r)}`);
  return out;
}

/** Ayrıştırılamayan satırlar için küçük model (yalnızca alan çıkarma; bilgi üretmez) */
async function aiParse(lines: string[]): Promise<{ parsed: Map<number, ParsedRef>; usage: { input: number; output: number; cacheRead?: number; cacheWrite?: number } | null; cost: number; model: string | null }> {
  const parsed = new Map<number, ParsedRef>();
  if (!lines.length) return { parsed, usage: null, cost: 0, model: null };
  const model = await resolveModel("free", "fast");
  if (!isProviderConfigured(model.provider)) return { parsed, usage: null, cost: 0, model: null };
  const schema = {
    type: "object", additionalProperties: false, required: ["items"],
    properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["n", "title", "authors", "year", "doi"], properties: { n: { type: "integer" }, title: { type: "string" }, authors: { type: "array", items: { type: "string" } }, year: { type: "integer" }, doi: { type: "string" } } } } },
  };
  const res = await complete(model, {
    system: "Kaynakça satırlarından alanları ayıkla. YALNIZCA satırda yazanı al; bilmediğin alanı boş bırak (year için 0, doi için \"\"). Yazarlar için yalnızca soyadlarını ver. Hiçbir bilgi ekleme veya düzeltme.",
    messages: [{ role: "user", content: lines.map((l, i) => `${i + 1}. ${l}`).join("\n") }],
    maxTokens: 2000, effort: "low", jsonSchema: schema,
  });
  try {
    for (const it of (JSON.parse(res.text) as { items: { n: number; title: string; authors: string[]; year: number; doi: string }[] }).items) {
      if (!it.title?.trim()) continue;
      parsed.set(it.n - 1, { raw: lines[it.n - 1] ?? "", families: it.authors ?? [], year: it.year || null, yearSuffix: "", title: it.title.trim(), doi: normalizeDoi(it.doi) || null, authors: (it.authors ?? []).map((a) => ({ family: a })), container: null });
    }
  } catch { /* ayrıştırılamazsa satırlar “okunamadı” kalır */ }
  return { parsed, usage: res.usage, cost: await estimateCost(res.model, res.usage.input, res.usage.output, res.usage), model: res.model };
}

/** Uydurma kaynak kontrolü: her satır için kayıt otoritelerinde var mı? */
export async function fakeCheck(lines: string[]): Promise<{ results: CheckResult[]; ai: { tokensIn: number; tokensOut: number; cost: number; model: string | null } }> {
  const parsed = lines.map(parseReference);
  const weak = parsed.map((p, i) => ({ p, i })).filter(({ p }) => !p.doi && (p.title.length < 12 || !p.year || !p.families.length));
  const ai = await aiParse(weak.map((w) => lines[w.i])).catch(() => ({ parsed: new Map<number, ParsedRef>(), usage: null, cost: 0, model: null }));
  weak.forEach((w, k) => { const r = ai.parsed.get(k); if (r) parsed[w.i] = r; });
  const cfg = providerConfig();

  const results = await mapLimit(parsed, 5, async (p, i): Promise<CheckResult> => {
    const input = lines[i];
    if (p.title.length < 8 && !p.doi) return { input, status: "unparsed", note: "Satırdan başlık okunamadı; kaynağı tam künye olarak yazın." };
    const doi = normalizeDoi(p.doi);
    if (doi) {
      const v = await verifySource({ title: p.title, doi, pmid: null, arxivId: null }, cfg).catch(() => null);
      if (v?.status === "verified" && v.record) {
        const diff = differences(p, v.record);
        return diff.length
          ? { input, status: "partial", note: `DOI doğru yayına ait, ama künyede fark var: kayıtta ${diff.join(", ")}.`, found: brief(v.record) }
          : { input, status: "verified", note: "DOI ve başlık kayıt otoritesiyle uyuşuyor.", found: brief(v.record) };
      }
      if (v?.status === "mismatch" && v.record) return { input, status: "mismatch", note: "Bu DOI başka bir yayına ait. Uydurma veya hatalı DOI olabilir.", found: brief(v.record) };
      // DOI bulunamadı: başlıkla da dene
      const s = await searchByTitle(p.title, p.families[0], p.year);
      if (s && s.similarity >= 0.85) return { input, status: "partial", note: "Yayın bulundu ama yazılan DOI geçersiz; doğru DOI aşağıda.", found: brief(s.record) };
      return { input, status: "not_found", note: "DOI hiçbir kayıt otoritesinde yok ve başlıkla da bulunamadı. Uydurma olabilir." };
    }
    const s = await searchByTitle(p.title, p.families[0], p.year);
    if (s && s.similarity >= 0.85) {
      const diff = differences(p, s.record);
      return diff.length
        ? { input, status: "partial", note: `Yayın bulundu, ama künyede fark var: kayıtta ${diff.join(", ")}.`, found: brief(s.record) }
        : { input, status: "verified", note: "Başlık, yazar ve yıl veri tabanlarındaki kayıtla uyuşuyor.", found: brief(s.record) };
    }
    if (s && s.similarity >= 0.6) return { input, status: "partial", note: "Benzer başlıklı bir yayın var ama birebir uymuyor; künyeyi kontrol edin.", found: brief(s.record) };
    return { input, status: "not_found", note: "Veri tabanlarında bulunamadı. Uydurma olabilir; kitap, tez veya dizinlenmemiş bir dergi de olabilir, elle kontrol edin." };
  });
  return { results, ai: { tokensIn: ai.usage?.input ?? 0, tokensOut: ai.usage?.output ?? 0, cost: ai.cost, model: ai.model } };
}
