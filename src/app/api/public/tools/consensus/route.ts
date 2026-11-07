import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { recordTool, toolRateOk } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { researchConsensus } from "@/lib/consensus";
import { localeFromRequest } from "@/i18n/server";

export const maxDuration = 90;

/**
 * Araştırmalar ne diyor? (D114): ücretsiz araç. Giriş gerektirmez; ziyaretçi saatte 5, üye saatte 20 soru sorabilir.
 * Maliyet araç kullanım kaydına yazılır (yönetim → maliyet).
 */
export const POST = route("public.tools.consensus", async (req) => {
  const b = await parseBody(req, z.object({ question: z.string().trim().min(8).max(300) }));
  const s = await getSession().catch(() => null);
  if (!(await toolRateOk(req, "consensus", s ? 20 : 5))) throw new ApiError(429, "Saatlik soru sınırına ulaştınız. Lütfen bir süre sonra tekrar deneyin.", "rate_limited");
  const r = await researchConsensus({ planId: s?.profile.plan_id ?? "free", question: b.question, lang: localeFromRequest(req) });
  await recordTool(req, "consensus", { userId: s?.user.id ?? null, items: r.papers.length, tokensIn: r.usage.input, tokensOut: r.usage.output, costUsd: r.cost, model: r.model }).catch(() => {});
  const { usage: _u, cost: _c, model: _m, provider: _p, ...result } = r; // eslint-disable-line @typescript-eslint/no-unused-vars
  return json(result);
});
