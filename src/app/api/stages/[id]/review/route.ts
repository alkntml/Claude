import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { makeT } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";
import { loadProjectBundle } from "@/lib/projects";
import { aiStageReview, combine, ruleIssues } from "@/lib/quality/stage-review";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 90;

/** Tamamlanan bölümün kontrolü: kural tabanlı denetim + yapay zekâ incelemesi (limit varsa yalnızca kurallar) */
export const POST = route<Ctx>("stage.review", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: st } = await s.supabase.from("project_stages").select("id, project_id").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!st) throw new ApiError(404, "Bölüm bulunamadı");
  const bundle = await loadProjectBundle(s.supabase, st.project_id, s.user.id);
  const stage = bundle?.stages.find((x) => x.id === id);
  if (!bundle || !stage) throw new ApiError(404, "Bölüm bulunamadı");
  const uiLocale = localeFromRequest(req);
  const rules = ruleIssues(bundle, stage, uiLocale);
  let ai = null;
  let aiError: string | null = null;
  try {
    await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
    ai = await aiStageReview({ planId: s.profile.plan_id, bundle, stage, uiLocale });
    if (ai) await recordUsage(s.user.id, "ai_request", { tokensIn: ai.usage.input, tokensOut: ai.usage.output, costUsd: ai.cost, provider: ai.provider, model: ai.model, meta: { action: "stage_review", projectId: st.project_id } });
  } catch (e) {
    aiError = e instanceof ApiError ? e.message : "Yapay zekâ incelemesi şu anda yapılamadı";
  }
  const T = makeT(uiLocale);
  return json({ review: combine(rules, ai, T), aiError: aiError ? T(aiError) : null });
});
