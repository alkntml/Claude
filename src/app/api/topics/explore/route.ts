import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { exploreTopic, suggestTopics } from "@/lib/topics-server";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";
import { singleScope } from "@/lib/single-project";

export const maxDuration = 60;

/** Tez konusu bulma: OpenAlex istatistikleri (+ isteğe bağlı yapay zekâ önerileri) */
export const POST = route("topics.explore", async (req) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "topics");
  const b = await parseBody(req, z.object({ query: z.string().trim().min(3).max(200), ideas: z.boolean().default(true), level: z.string().max(60).default(""), discipline: z.string().max(200).default(""), language: z.enum(["tr", "en", "de"]).default("tr") }));
  await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
  const offS = await singleScope(s, "source_search", null);
  let data;
  try { data = await exploreTopic(b.query); } catch { throw new ApiError(502, "Veri tabanına şu anda ulaşılamadı, lütfen biraz sonra tekrar deneyin"); }
  await recordUsage(s.user.id, "source_search", { quantity: 1, meta: { kind: "topic_explore", query: b.query, ...(offS ? { offProject: true } : {}) } });
  if (!b.ideas || data.total < 5) return json({ data, ideas: [] });
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const offA = await singleScope(s, "ai_request", null);
  try {
    const out = await suggestTopics({ planId: s.profile.plan_id, data, level: b.level, discipline: b.discipline, language: b.language });
    await recordUsage(s.user.id, "ai_request", { usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: "topic_ideas", ...(offA ? { offProject: true } : {}) } });
    return json({ data, ideas: out.ideas });
  } catch {
    return json({ data, ideas: [], ideasError: true });
  }
});
