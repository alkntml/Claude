import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { suggestApproach } from "@/lib/approach-suggest";
import { assertWithinLimits, recordUsage } from "@/lib/usage";
import { localeFromRequest } from "@/i18n/server";

export const maxDuration = 60;

const Schema = z.object({
  workType: z.string().max(40), level: z.string().max(20), discipline: z.string().max(200).default(""),
  topic: z.string().trim().min(10, "Öneri için konuyu ve amacı birkaç cümleyle yazın").max(4000), questions: z.string().max(2000).optional(), data: z.string().max(1000).optional(),
});

/** D171: “Yöntemimi henüz bilmiyorum” — gerekçeli yaklaşım ve desen önerisi */
export const POST = route("projects.suggest_approach", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, Schema);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  try {
    const out = await suggestApproach({ planId: s.profile.plan_id, ...b, locale: localeFromRequest(req) });
    await recordUsage(s.user.id, "ai_request", { usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: "approach_suggest" } });
    return json({ suggestion: out.suggestion });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(422, e instanceof Error ? e.message : "Yöntem önerisi oluşturulamadı");
  }
});
