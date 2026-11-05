import "server-only";
import { AiSpentError } from "@/lib/api";
import { estimateCost } from "./registry";
import type { Usage } from "./types";

/** Yanıtı kullanılamayan (ör. bozuk JSON) ama faturalanan çağrı için maliyeti taşıyan hata (D94) */
export async function spentError(message: string, res: { usage: Usage; model: string }, provider: string, action: string): Promise<AiSpentError> {
  const costUsd = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage).catch(() => 0);
  const cache = res.usage.cacheRead || res.usage.cacheWrite ? { r: res.usage.cacheRead ?? 0, w: res.usage.cacheWrite ?? 0 } : undefined;
  return new AiSpentError(message, { tokensIn: res.usage.input, tokensOut: res.usage.output, costUsd, model: res.model, provider, action, cache });
}
