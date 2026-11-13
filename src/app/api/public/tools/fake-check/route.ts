import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { recordTool, toolRateOk } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { hasUnlimitedTools } from "@/lib/pricing";
import { fakeCheck } from "@/lib/tools/server";

export const maxDuration = 60;

/** Uydurma kaynak kontrolü (D90): giriş gerektirmez; saatte 15 kontrol, her kontrolde en fazla 30 kaynak. */
export const POST = route("public.tools.fake_check", async (req) => {
  const b = await parseBody(req, z.object({ lines: z.array(z.string().trim().min(5).max(800)).min(1).max(30) }));
  // D162: Sınırsız Proje üyeleri ücretsiz araçları sınırsız kullanır
  const s = await getSession().catch(() => null);
  if (!hasUnlimitedTools(s?.profile.plan_id, s?.profile.role === "admin") && !(await toolRateOk(req, "fake_check", 15))) throw new ApiError(429, "Saatlik kontrol sınırına ulaştınız. Lütfen bir süre sonra tekrar deneyin.", "rate_limited");
  const out = await fakeCheck(b.lines);
  await recordTool(req, "fake_check", { userId: s?.user.id ?? null, items: b.lines.length, tokensIn: out.ai.tokensIn, tokensOut: out.ai.tokensOut, costUsd: out.ai.cost, model: out.ai.model }).catch(() => {});
  return json({ results: out.results });
});
