import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";
import { z } from "zod";
import { complete, estimateCost, resolveModel, isProviderConfigured } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { normalizeDoi } from "@/lib/citations";
import { missingFields, titleSimilarity } from "@/lib/citations/checks";
import type { CitationItem } from "@/lib/citations/types";
import { providerConfig } from "@/lib/env";
import { enabledProviders } from "@/lib/settings";
import { dedupe, scoreRecord, searchAll } from "@/lib/sources/aggregate";
import { hasOpenAccessCandidate, ingestOpenAccess } from "@/lib/sources/fulltext";
import { SourceInput, toRow } from "@/lib/sources/input";
import type { SourceRecord } from "@/lib/sources/types";
import { verifySource } from "@/lib/sources/verify";
import { adminClient } from "@/lib/supabase/admin";
import { recordUsage } from "@/lib/usage";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Eşzamanlılığı sınırlı map (dış servislere aynı anda çok istek gitmesin) */
export async function mapLimit<T, R>(items: T[], limit: number, fn: (x: T, i: number) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}

/** SourceRecord (arama sonucu) -> SourceInput (ekleme isteği) */
export function recordToInput(r: SourceRecord): z.infer<typeof SourceInput> {
  return {
    type: r.type, title: r.title, authors: r.authors, year: r.year, month: r.month ?? null, containerTitle: r.containerTitle ?? null,
    volume: r.volume ?? null, issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null, doi: r.doi ?? null,
    pmid: r.pmid ?? null, pmcid: r.pmcid ?? null, arxivId: r.arxivId ?? null, isbn: r.isbn ?? null, openalexId: r.openalexId ?? null,
    url: r.url && /^https?:\/\//.test(r.url) ? r.url : null, oaUrl: r.oaUrl && /^https?:\/\//.test(r.oaUrl) ? r.oaUrl : null,
    abstract: r.abstract ?? null, license: r.license ?? null, language: r.language ?? null, origins: r.origins,
  };
}

/**
 * Kaynakları projeye ekler: DOI tekrarlarını ayıklar, kalıcı tanımlayıcıyı doğrular,
 * eksik künyeyi kayıt otoritesinden tamamlar ve açık erişimli tam metinleri arka planda kuyruğa alır.
 */
export async function addSourcesToProject(db: SupabaseClient, projectId: string, userId: string, inputs: z.infer<typeof SourceInput>[], opts: { deferFulltext?: boolean } = {}) {
  const { data: existing } = await db.from("sources").select("doi, title, year").eq("project_id", projectId);
  const have = new Set((existing ?? []).map((x) => x.doi).filter(Boolean));
  const known: { title?: string | null; year?: number | null; doi?: string | null }[] = [...(existing ?? [])];
  const cfg = providerConfig();
  // D169: aynı eser ikinci kez eklenmez (aynı DOI veya aynı yıl + çok benzer başlık)
  const fresh = inputs.filter((b) => {
    const d = normalizeDoi(b.doi);
    if (d && have.has(d)) return false;
    const me = { title: b.title, year: b.year ?? null, doi: d };
    if (known.some((k) => sameWork(k, me))) return false;
    if (d) have.add(d);
    known.push(me);
    return true;
  });
  const rows = await mapLimit(fresh, 8, async (b) => {
      const row = toRow(b);
      const v = await verifySource({ title: row.title, doi: row.doi, pmid: row.pmid, arxivId: row.arxiv_id }, cfg);
      const filled: Record<string, unknown> = {};
      if (v.status === "verified" && v.record) {
        const r = v.record;
        if (!row.container_title && r.containerTitle) filled.container_title = r.containerTitle;
        if (!row.volume && r.volume) filled.volume = r.volume;
        if (!row.issue && r.issue) filled.issue = r.issue;
        if (!row.pages && r.pages) filled.pages = r.pages;
        if (!row.publisher && r.publisher) filled.publisher = r.publisher;
        if (!row.year && r.year) filled.year = r.year;
        if (!row.authors.length && r.authors.length) filled.authors = r.authors;
        // D169: künye eksik kalmasın, tam metin bulunabilsin (kayıt otoritesindeki bilgiyle tamamlanır)
        if (!row.doi && r.doi) filled.doi = normalizeDoi(r.doi);
        if (!row.url && r.url && /^https?:\/\//.test(r.url)) filled.url = r.url;
        if (!row.oa_url && r.oaUrl && /^https?:\/\//.test(r.oaUrl)) filled.oa_url = r.oaUrl;
        if (!row.pmcid && r.pmcid) filled.pmcid = r.pmcid;
        if (!row.arxiv_id && r.arxivId) filled.arxiv_id = r.arxivId;
        if (!row.abstract && r.abstract && r.abstract.trim().length > 40) { filled.abstract = r.abstract; if (row.access_level === "metadata") filled.access_level = "abstract"; }
      }
      const { record: _omit, ...vMeta } = v;
      void _omit;
      return { ...row, ...filled, project_id: projectId, user_id: userId, verified: v.status === "verified", verification: { ...("verification" in row ? (row as any).verification : {}), ...vMeta } };
  });
  if (!rows.length) return { sources: [] as any[], skipped: inputs.length, openAccess: [] as any[] };
  const { data, error } = await db.from("sources").insert(rows, { defaultToNull: false }).select();
  if (error) throw error;
  const oa = (data ?? []).filter(hasOpenAccessCandidate).slice(0, 10);
  if (oa.length) {
    await db.from("sources").update({ fulltext_status: "queued" }).in("id", oa.map((x) => x.id));
    for (const x of oa) x.fulltext_status = "queued";
    // deferFulltext: çağıran taraf tam metinleri hemen okur (ingestWithBudget), aksi hâlde arka planda
    if (!opts.deferFulltext) {
      after(async () => {
        for (const src of oa) await ingestOpenAccess(adminClient(), src, cfg).catch(() => null);
      });
    }
  }
  return { sources: data ?? [], skipped: inputs.length - rows.length, openAccess: oa };
}

/**
 * Açık erişimli tam metinleri paralel okur ve en fazla waitMs kadar bekler (yazımdan önce okunabilsin diye).
 * Süre dolunca bitmeyenler yanıt sonrasında arka planda tamamlanır. Tam metni okunan kaynak kimliklerini döndürür.
 * Kaynaklar çağıranın projesinden yüklenmiş satırlardır; güncelleme kaynak kimliğiyle sınırlıdır.
 */
export async function ingestWithBudget(sources: any[], waitMs: number): Promise<string[]> {
  if (!sources.length) return [];
  const cfg = providerConfig();
  const db = adminClient();
  const done: string[] = [];
  const all = Promise.all(sources.map((src) => ingestOpenAccess(db, src, cfg).then((r) => { if (r.status === "ingested") done.push(src.id); }).catch(() => null)));
  let timer: ReturnType<typeof setTimeout> | undefined;
  await Promise.race([all, new Promise((r) => { timer = setTimeout(r, waitMs); })]);
  if (timer) clearTimeout(timer);
  after(() => all.then(() => undefined));
  return [...done];
}

// ---------------------------------------------------------------------------
// Araştırma planlama
// ---------------------------------------------------------------------------

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["needsSearch", "topicSummary", "concepts", "queries", "plan"],
  properties: {
    needsSearch: { type: "boolean" },
    topicSummary: { type: "string" },
    concepts: { type: "array", items: { type: "string" } },
    queries: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["query", "purpose"], properties: { query: { type: "string" }, purpose: { type: "string" } } },
    },
    plan: { type: "array", items: { type: "string" } },
  },
};

export interface ResearchPlan {
  needsSearch: boolean;
  topicSummary: string;
  concepts: string[];
  queries: { query: string; purpose: string }[];
  plan: string[];
}

const PLANNER_SYSTEM = `Akademik bir kütüphaneci gibi davran. Görevin, akademik veri tabanlarında kaynak araması yapılıp yapılmaması gerektiğine karar vermek ve gerekiyorsa arama sorgularını üretmek. VARSAYILAN KARAR needsSearch = false’tur; arama yalnızca gerçekten gerektiğinde yapılır (gereksiz arama kullanıcının hakkını harcar ve kaynak listesini kalabalıklaştırır).
needsSearch = true yalnızca şu durumlarda: (1) kullanıcı açıkça kaynak/literatür bulunmasını istiyorsa; YA DA (2) görev yeni bir bölüm/alt başlık metni yazmaksa VE ODAK KONU, mevcut kaynakların ele aldığı konulardan belirgin biçimde farklı bir kavram/alt konuysa (ör. robot tasarımından iş gücü etkisine geçmek) ve listedeki kaynakların en fazla 2’si bu odak konuyu anlamca karşılıyorsa; YA DA (3) "kapsam için kaynak az" notu verilmişse.
Kaynak başlıkları farklı dilde (çoğunlukla İngilizce) olabilir: eşleşmeyi kelimeye göre değil ANLAMA göre değerlendir. Aynı alt konuda yazmaya devam ediliyorsa, mevcut kaynaklar konuyu karşılıyorsa veya istek soru, açıklama, plan, dil düzeltmesi ya da biçim ise needsSearch = false.
Sorgular: 2–4 adet, İNGİLİZCE, kısa (2–6 kelime), mevcut kaynakların zaten kapsadığı kavramları tekrarlamadan, istenen alt konuya odaklı; gerekirse 1 Türkçe sorgu ekle. Kaynak, yazar veya eser adı UYDURMA. "plan" alanına bölüm için 3–6 adımlık kısa bir çalışma planı yaz (Türkçe).`;

export async function planResearch(params: { planId: string; project: any; stageTitle?: string | null; request: string; existingTitles: string[]; relevantTitles?: string[]; stageHeadings?: string[]; force?: boolean; focus?: string; scopeLow?: boolean }) {
  const model = await resolveModel(params.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const p = params.project;
  const res = await complete(model, {
    system: PLANNER_SYSTEM,
    messages: [{
      role: "user",
      content: `Proje: ${p.title}\nKonu: ${p.topic || "-"}\nDisiplin: ${p.discipline || "-"}\nBölüm: ${params.stageTitle ?? "genel"}${params.stageHeadings?.length ? `\nBölümdeki mevcut alt başlıklar: ${params.stageHeadings.join(" | ")}` : ""}\nProjedeki toplam kaynak sayısı: ${params.existingTitles.length} (sınır değildir)\n${params.focus ? `ODAK KONU (yazılacak alt başlık): ${params.focus}\n` : ""}Projedeki kaynaklar (${(params.relevantTitles ?? params.existingTitles).length}; başlıklar farklı dilde olabilir):\n${(params.relevantTitles ?? params.existingTitles).slice(0, 40).map((t) => `- ${t}`).join("\n") || "(yok)"}\n\nKullanıcının isteği: ${params.request}${params.scopeLow ? "\n\n(Not: kapsam için kaynak az — çalışma türüne göre projede henüz yeterli kaynak yok.)" : ""}${params.force ? "\n\n(Kullanıcı literatür araştırmasını açıkça istedi: needsSearch = true.)" : ""}`,
    }],
    maxTokens: 1500,
    effort: "low",
    jsonSchema: PLAN_SCHEMA,
  });
  let plan: ResearchPlan;
  try {
    plan = JSON.parse(res.text);
  } catch {
    throw await spentError("Araştırma planı oluşturulamadı", res, model.provider, "research_plan");
  }
  if (params.force) plan.needsSearch = true;
  plan.queries = (plan.queries ?? []).filter((q) => q.query?.trim()).slice(0, 4);
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { plan, usage: res.usage, model: res.model, provider: model.provider, cost };
}

/** Planlanan sorguları etkin veri tabanlarında GERÇEKTEN çalıştırır ve birleştirir. */
export async function executeSearch(queries: { query: string }[], opts: { yearFrom?: number; yearTo?: number; limitPerQuery?: number } = {}) {
  const enabled = await enabledProviders();
  const cfg = providerConfig();
  const runs = await Promise.all(queries.map((q) => searchAll({ query: q.query, yearFrom: opts.yearFrom, yearTo: opts.yearTo, limit: opts.limitPerQuery ?? 10 }, enabled, cfg)));
  const tagged = runs.flatMap((r, i) => r.results.map((rec) => ({ ...rec, foundBy: queries[i].query })));
  const merged = dedupe(tagged).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  return { results: merged, providers: runs.flatMap((r) => r.providers) };
}

/** Kaynakları bir isteğe/bölüme göre sıralar; bu bölümde zaten atıf yapılmış kaynaklar öne alınır. */
export function rankSources<T extends { id: string; title: string; abstract?: string | null; access_level?: string; doi?: string | null }>(sources: T[], query: string, boost: Set<string> = new Set()): T[] {
  return sources
    .map((src) => ({ src, score: scoreRecord({ title: src.title, abstract: src.abstract ?? null, citedByCount: 0, accessLevel: src.access_level, doi: src.doi ?? null } as SourceRecord, query) + (boost.has(src.id) ? 0.5 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.src);
}

/** Aynı eser mi? (aynı DOI veya aynı yıl + çok benzer başlık; kalite kontrolündeki “yinelenen kaynak” kuralıyla aynı ölçüt) */
export function sameWork(a: { title?: string | null; year?: number | null; doi?: string | null }, b: { title?: string | null; year?: number | null; doi?: string | null }): boolean {
  const da = normalizeDoi(a.doi), db = normalizeDoi(b.doi);
  if (da && db) return da === db;
  const sameYear = !a.year || !b.year || a.year === b.year;
  return sameYear && titleSimilarity(a.title ?? "", b.title ?? "") >= 0.85;
}

/** Künyesi kaynakçada eksik görünmeyecek mi? (kalite kontrolündeki “eksik künye” kuralı) */
export function completeRecord(r: SourceRecord): boolean {
  return missingFields({ ...(r as unknown as CitationItem), id: "x", type: (r.type ?? "article-journal") as CitationItem["type"], authors: r.authors ?? [] }).length === 0;
}

/** Tam metni açık erişimle okunabilecek mi? (PDF bağlantısı, PubMed Central veya arXiv) */
export { fullTextLikely, FULLTEXT_SHARE } from "@/lib/sources/fulltext-share";
import { fullTextLikely, pickWithFullTextQuota } from "@/lib/sources/fulltext-share";

/**
 * Asistan için otomatik seçim (D169): önce tam metni okunabilecek, kalıcı tanımlayıcıyla doğrulanabilir ve künyesi eksiksiz
 * kaynaklar; projede zaten olan eserler (DOI veya benzer başlık) ve sonuçlar içindeki tekrarlar elenir. Yeterli doğrulanabilir
 * kaynak varsa tanımlayıcısı olmayan (doğrulanamayacak) kayıtlar hiç eklenmez.
 */
export function pickForAutoAdd(results: (SourceRecord & { foundBy?: string })[], existingDois: Set<string>, max = 8, existingSources: { title?: string | null; year?: number | null; doi?: string | null }[] = []) {
  const usable = results.filter((r) => r.title && r.authors.length && r.year && !(r.doi && existingDois.has(r.doi)) && !existingSources.some((e) => sameWork(e, r)));
  const verifiable = (r: SourceRecord) => !!(r.doi || r.pmid || r.arxivId);
  const quality = (r: SourceRecord) => (r.score ?? 0)
    + (verifiable(r) ? 0.15 : -0.2)
    + (fullTextLikely(r) ? 0.25 : 0)
    + (r.abstract && r.abstract.trim().length > 40 ? 0.1 : 0)
    + (completeRecord(r) ? 0.1 : 0);
  const sorted = usable.sort((a, b) => quality(b) - quality(a));
  const pool = sorted.filter(verifiable).length >= max ? sorted.filter(verifiable) : sorted;
  // D177: eklenen kaynakların en az %60’ı tam metni okunabilecek kaynaklar (lib/sources/fulltext-share.ts)
  return pickWithFullTextQuota(pool, max, fullTextLikely, (r, chosen) => !chosen.some((x) => sameWork(x, r))).map((i) => pool[i]);
}


/** Veri tabanı sağlığı için kayıt biçimi (yönetim → veri kaynağı sağlığı, D92) */
export function providerHealthMeta(providers: { provider: string; ok: boolean; count: number; error?: string }[]) {
  return providers.map((p) => ({ p: p.provider, ok: p.ok, n: p.count, ...(p.ok ? {} : { e: String(p.error ?? "").slice(0, 80) }) }));
}

export async function recordResearchUsage(userId: string, info: { usage: { input: number; output: number }; model: string; provider: string; cost: number }, queries: string[], opts: { countAsRequest?: boolean; providers?: { provider: string; ok: boolean; count: number; error?: string }[] } = {}) {
  await Promise.all([
    // Sohbet içi otomatik karar adımı ayrı bir AI isteği sayılmaz (token ve maliyet yine kaydedilir)
    recordUsage(userId, "ai_request", { quantity: opts.countAsRequest === false ? 0 : 1, usage: info.usage, costUsd: info.cost, provider: info.provider, model: info.model, meta: { action: "research_plan" } }),
    queries.length ? recordUsage(userId, "source_search", { quantity: queries.length, meta: { queries, ...(opts.providers?.length ? { providers: providerHealthMeta(opts.providers) } : {}) } }) : Promise.resolve(),
  ]);
}
/* eslint-enable @typescript-eslint/no-explicit-any */


export { minSourcesFor } from "@/lib/workflows/quick-actions";

// ---------------------------------------------------------------------------
// Otomatik kaynak taraması kararı (D75): her istekte değil, yalnızca gerektiğinde
// ---------------------------------------------------------------------------

/** Yeni metin yazan (iddia içeren) eylemler: yalnızca bunlarda otomatik tarama değerlendirilir */
export const WRITING_ACTIONS = new Set(["draft", "synthesize", "discussion", "fix_claim", "research_questions", "hypotheses", "methodology"]);

/** Kullanıcı açıkça kaynak/literatür istiyor mu? (soru sormak, “araştırma sorusu” demek tetiklemez) */
export function asksForSources(message: string): boolean {
  const m = message.toLocaleLowerCase("tr");
  return /(kaynak|literatür|makale|referans|yayın)\p{L}*\s+(\p{L}+\s+)?(bul|ara|tara|ekle|öner|getir|lazım|gerek)/u.test(m)
    || /(bul|ara|tara|ekle|öner|getir)\p{L}*\s+(\p{L}+\s+)?(kaynak|literatür|makale|referans)/u.test(m)
    || /(literatür|kaynak)\s+tara|yeni kaynak|daha fazla kaynak|kaynak yetersiz|güncel (kaynak|çalışma)/u.test(m)
    || /\b(find|search|look up|add|more)\s+(\w+\s+)?(sources|papers|studies|literature|references)\b/.test(m);
}

/** Yazılacak alt başlık (toplu yazımda mesajda “…” ile gelir), yoksa bölümün son alt başlığı */
export function focusOf(message: string, stageHeadings: string[]): string {
  const q = message.match(/[“"]([^”"]{3,140})[”"]\s*alt başlığ/u);
  return (q?.[1] ?? stageHeadings[stageHeadings.length - 1] ?? "").trim();
}

export type ResearchGate = "skip" | "planner" | "force";

/**
 * Tarama kararı: açık istek → zorunlu; yazım dışı eylem (soru, plan, dil düzeltme…) → atla;
 * aynı odak için yakın zamanda zaten tarandıysa → atla; aksi hâlde planlayıcı (varsayılan: tarama yok) karar verir.
 */
export function researchGate(p: { action: string; message: string; recentlySearchedFocus: boolean }): ResearchGate {
  if (asksForSources(p.message)) return "force";
  // D177: “Kaynakla düzelt” her zaman o iddia için kaynak arar (kütüphanede uygun kaynak olmayabilir)
  if (p.action === "fix_claim") return "force";
  if (!WRITING_ACTIONS.has(p.action)) return "skip";
  if (p.recentlySearchedFocus) return "skip";
  return "planner";
}
