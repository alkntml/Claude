import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";
import { z } from "zod";
import { complete, estimateCost, resolveModel, isProviderConfigured } from "@/lib/ai/registry";
import { normalizeDoi } from "@/lib/citations";
import { providerConfig } from "@/lib/env";
import { enabledProviders } from "@/lib/settings";
import { dedupe, searchAll } from "@/lib/sources/aggregate";
import { hasOpenAccessCandidate, ingestOpenAccess } from "@/lib/sources/fulltext";
import { SourceInput, toRow } from "@/lib/sources/input";
import type { SourceRecord } from "@/lib/sources/types";
import { verifySource } from "@/lib/sources/verify";
import { adminClient } from "@/lib/supabase/admin";
import { recordUsage } from "@/lib/usage";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
export async function addSourcesToProject(db: SupabaseClient, projectId: string, userId: string, inputs: z.infer<typeof SourceInput>[]) {
  const { data: existing } = await db.from("sources").select("doi").eq("project_id", projectId).not("doi", "is", null);
  const have = new Set((existing ?? []).map((x) => x.doi));
  const cfg = providerConfig();
  const fresh = inputs.filter((b) => {
    const d = normalizeDoi(b.doi);
    if (!d) return true;
    if (have.has(d)) return false;
    have.add(d);
    return true;
  });
  const rows = await Promise.all(
    fresh.map(async (b) => {
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
      }
      const { record: _omit, ...vMeta } = v;
      void _omit;
      return { ...row, ...filled, project_id: projectId, user_id: userId, verified: v.status === "verified", verification: { ...("verification" in row ? (row as any).verification : {}), ...vMeta } };
    }),
  );
  if (!rows.length) return { sources: [] as any[], skipped: inputs.length };
  const { data, error } = await db.from("sources").insert(rows).select();
  if (error) throw error;
  const oa = (data ?? []).filter(hasOpenAccessCandidate).slice(0, 10);
  if (oa.length) {
    await db.from("sources").update({ fulltext_status: "queued" }).in("id", oa.map((x) => x.id));
    for (const x of oa) x.fulltext_status = "queued";
    after(async () => {
      for (const src of oa) await ingestOpenAccess(adminClient(), src, cfg).catch(() => null);
    });
  }
  return { sources: data ?? [], skipped: inputs.length - rows.length };
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

const PLANNER_SYSTEM = `Akademik bir kütüphaneci gibi davran. Görevin, akademik veri tabanlarında (OpenAlex, Crossref, PubMed) kaynak araması yapılıp yapılmaması gerektiğine karar vermek ve gerekiyorsa arama sorgularını üretmek.
needsSearch = true olmalı, eğer: kullanıcı açıkça kaynak/literatür/makale/çalışma/referans bulunmasını veya araştırılmasını istiyorsa; YA DA görev bilimsel iddia içeren bir metin yazmayı gerektiriyor ve projedeki mevcut kaynaklar konu için yetersizse (genellikle 5'ten az ilgili kaynak).
needsSearch = false olmalı, eğer: kullanıcı yalnızca soru soruyor, plan istiyor, dil düzeltmesi istiyor veya mevcut kaynaklar yeterliyse.
Sorgular: 2–4 adet, İNGİLİZCE, kısa (2–6 kelime), anahtar kavram odaklı; gerekirse 1 Türkçe sorgu ekle. Kaynak, yazar veya eser adı UYDURMA. "plan" alanına bölüm için 3–6 adımlık kısa bir çalışma planı yaz (Türkçe).`;

export async function planResearch(params: { planId: string; project: any; stageTitle?: string | null; request: string; existingTitles: string[]; force?: boolean }) {
  const model = await resolveModel(params.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const p = params.project;
  const res = await complete(model, {
    system: PLANNER_SYSTEM,
    messages: [{
      role: "user",
      content: `Proje: ${p.title}\nKonu: ${p.topic || "-"}\nDisiplin: ${p.discipline || "-"}\nBölüm: ${params.stageTitle ?? "genel"}\nProjedeki mevcut kaynaklar (${params.existingTitles.length}):\n${params.existingTitles.slice(0, 30).map((t) => `- ${t}`).join("\n") || "(yok)"}\n\nKullanıcının isteği: ${params.request}${params.force ? "\n\n(Kullanıcı literatür araştırmasını açıkça başlattı: needsSearch = true.)" : ""}`,
    }],
    maxTokens: 1500,
    effort: "low",
    jsonSchema: PLAN_SCHEMA,
  });
  let plan: ResearchPlan;
  try {
    plan = JSON.parse(res.text);
  } catch {
    throw new Error("Araştırma planı oluşturulamadı");
  }
  if (params.force) plan.needsSearch = true;
  plan.queries = (plan.queries ?? []).filter((q) => q.query?.trim()).slice(0, 4);
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output);
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

/** Asistan için otomatik seçim: doğrulanabilir (DOI/PMID/arXiv) ve özeti olan kaynakları öne alır. */
export function pickForAutoAdd(results: (SourceRecord & { foundBy?: string })[], existingDois: Set<string>, max = 8) {
  const usable = results.filter((r) => r.title && r.authors.length && r.year && !(r.doi && existingDois.has(r.doi)));
  const quality = (r: SourceRecord) => (r.score ?? 0) + (r.doi || r.pmid || r.arxivId ? 0.15 : 0) + (r.abstract ? 0.1 : 0);
  return usable.sort((a, b) => quality(b) - quality(a)).slice(0, max);
}

export async function recordResearchUsage(userId: string, info: { usage: { input: number; output: number }; model: string; provider: string; cost: number }, queries: string[], opts: { countAsRequest?: boolean } = {}) {
  await Promise.all([
    // Sohbet içi otomatik karar adımı ayrı bir AI isteği sayılmaz (token ve maliyet yine kaydedilir)
    recordUsage(userId, "ai_request", { quantity: opts.countAsRequest === false ? 0 : 1, tokensIn: info.usage.input, tokensOut: info.usage.output, costUsd: info.cost, provider: info.provider, model: info.model, meta: { action: "research_plan" } }),
    queries.length ? recordUsage(userId, "source_search", { quantity: queries.length, meta: { queries } }) : Promise.resolve(),
  ]);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
