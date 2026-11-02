import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { loadProjectBundle } from "@/lib/projects";
import { executeSearch, planResearch, recordResearchUsage } from "@/lib/research";
import { assertWithinLimits, searchesRemaining } from "@/lib/usage";

export const maxDuration = 120;

const Schema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid().nullable().optional(),
  request: z.string().trim().min(3).max(4000),
  yearFrom: z.number().int().optional(),
  yearTo: z.number().int().optional(),
});

/**
 * Araştırma planlama: konu analiz edilir, sorgular üretilir, etkin akademik veri tabanlarında GERÇEKTEN
 * çalıştırılır ve sonuçlar kullanıcıya seçim için döner (bu uç noktada kaynaklar otomatik eklenmez).
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

  const planned = await planResearch({ planId: s.profile.plan_id, project: bundle.project, stageTitle: stage?.title, request: b.request, existingTitles: bundle.sources.map((x) => x.title), force: true });
  // Kalan tarama hakkından fazla sorgu çalıştırılmaz (sayaç limiti aşmasın; D51)
  const left = await searchesRemaining(s.user.id, s.profile.plan_id);
  if (left != null) planned.plan.queries = planned.plan.queries.slice(0, Math.max(1, left));
  const { results, providers } = await executeSearch(planned.plan.queries, { yearFrom: b.yearFrom, yearTo: b.yearTo });
  await recordResearchUsage(s.user.id, planned, planned.plan.queries.map((q) => q.query));
  return json({ plan: planned.plan, results: results.slice(0, 30), providers });
});
