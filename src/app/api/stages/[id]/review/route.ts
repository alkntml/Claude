import { AiSpentError, ApiError, json, recordAiSpent, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { makeT } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";
import { loadProjectBundle } from "@/lib/projects";
import { aiStageReview, combine, ruleIssues } from "@/lib/quality/stage-review";
import { adminClient } from "@/lib/supabase/admin";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

const DAILY_AI_REVIEWS = 40;

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
  // Ücretsiz ve Basic pakette bölüm kontrolü aylık yapay zekâ hakkından düşmez (quality_check olarak kaydedilir, maliyet yönetim panelinde görünür);
  // diğer paketlerde normal yapay zekâ isteği sayılır. Tüm paketlerde en ekonomik model (fast) kullanılır.
  const exempt = s.profile.plan_id === "basic" || s.profile.plan_id === "free";
  try {
    if (exempt) {
      await assertWithinLimits(s.user.id, s.profile.plan_id, "quality_check");
      const since = new Date(Date.now() - 86_400_000).toISOString();
      const { count } = await adminClient().from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", s.user.id).eq("kind", "quality_check").eq("meta->>action", "stage_review").gte("created_at", since);
      if ((count ?? 0) >= DAILY_AI_REVIEWS) throw new ApiError(429, "Bugünkü yapay zekâ bölüm kontrolü sınırına ulaşıldı; yarın tekrar deneyebilirsiniz");
    } else {
      await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
    }
    ai = await aiStageReview({ planId: s.profile.plan_id, bundle, stage, uiLocale, tier: "fast" });
    if (ai) await recordUsage(s.user.id, exempt ? "quality_check" : "ai_request", { usage: ai.usage, costUsd: ai.cost, provider: ai.provider, model: ai.model, meta: { action: "stage_review", projectId: st.project_id } });
  } catch (e) {
    if (e instanceof AiSpentError) await recordAiSpent(e, s.user.id);
    aiError = e instanceof ApiError ? e.message : "Yapay zekâ incelemesi şu anda yapılamadı";
  }
  const T = makeT(uiLocale);
  return json({ review: combine(rules, ai, T), aiError: aiError ? T(aiError) : null });
});
