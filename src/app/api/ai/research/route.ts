import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { providerConfig } from "@/lib/env";
import { loadProjectBundle } from "@/lib/projects";
import { enabledProviders } from "@/lib/settings";
import { dedupe, searchAll } from "@/lib/sources/aggregate";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

const Schema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid().nullable().optional(),
  request: z.string().trim().min(3).max(4000),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
});

const PLAN_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["topicSummary", "concepts", "queries", "plan"],
  properties: {
    topicSummary: { type: "string" },
    concepts: { type: "array", items: { type: "string" } },
    queries: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["query", "purpose"], properties: { query: { type: "string" }, purpose: { type: "string" } } },
    },
    plan: { type: "array", items: { type: "string" } },
  },
};

interface Plan { topicSummary: string; concepts: string[]; queries: { query: string; purpose: string }[]; plan: string[] }

/**
 * Araştırma planlama: (1) konu analiz edilir ve arama sorguları üretilir (hızlı model, JSON),
 * (2) sorgular etkin akademik veri tabanlarında GERÇEKTEN çalıştırılır, (3) birleştirilmiş sonuçlar
 * kullanıcıya seçim için döner. Kaynaklar kullanıcı onaylamadan projeye eklenmez.
 */
export const POST = route("ai.research", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, Schema);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
  const bundle = await loadProjectBundle(s.supabase, b.projectId, s.user.id);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");
  const stage = b.stageId ? bundle.stages.find((x) => x.id === b.stageId) : null;

  const model = await resolveModel(s.profile.plan_id, "fast");
  if (!isProviderConfigured(model.provider)) throw new ApiError(503, "Yapay zekâ sağlayıcısı yapılandırılmamış", "ai_not_configured");

  const p = bundle.project;
  const res = await complete(model, {
    system: "Akademik bir kütüphaneci gibi davran. Kullanıcının araştırma talebini analiz et ve uluslararası akademik veri tabanlarında (OpenAlex, Crossref, PubMed) kullanılacak 3–5 İNGİLİZCE arama sorgusu üret (gerekirse 1 Türkçe sorgu ekle). Sorgular kısa (2–6 kelime) ve anahtar kavram odaklı olsun. Ayrıca bölüm için 3–6 adımlık bir çalışma planı yaz (Türkçe). Kaynak adı veya yazar UYDURMA.",
    messages: [{ role: "user", content: `Proje: ${p.title}\nKonu: ${p.topic}\nDisiplin: ${p.discipline}\nBölüm: ${stage?.title ?? "genel"}\nTalep: ${b.request}` }],
    maxTokens: 2000,
    effort: "low",
    jsonSchema: PLAN_SCHEMA,
  });
  let plan: Plan;
  try {
    plan = JSON.parse(res.text);
  } catch {
    throw new ApiError(502, "Araştırma planı oluşturulamadı, lütfen tekrar deneyin");
  }
  const queries = plan.queries.slice(0, 5);

  const enabled = await enabledProviders();
  const cfg = providerConfig();
  const runs = await Promise.all(queries.map((q) => searchAll({ query: q.query, yearFrom: b.yearFrom, yearTo: b.yearTo, limit: 10 }, enabled, cfg)));
  const tagged = runs.flatMap((r, i) => r.results.map((rec) => ({ ...rec, foundBy: queries[i].query })));
  const merged = dedupe(tagged).sort((a, b2) => (b2.score ?? 0) - (a.score ?? 0)).slice(0, 30);

  const cost = await estimateCost(res.model, res.usage.input, res.usage.output);
  await Promise.all([
    recordUsage(s.user.id, "ai_request", { tokensIn: res.usage.input, tokensOut: res.usage.output, costUsd: cost, provider: model.provider, model: res.model, meta: { action: "research_plan" } }),
    recordUsage(s.user.id, "source_search", { quantity: queries.length, meta: { queries: queries.map((q) => q.query) } }),
  ]);

  return json({
    plan,
    results: merged,
    providers: runs.flatMap((r) => r.providers),
  });
});
