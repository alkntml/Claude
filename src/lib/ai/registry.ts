import "server-only";
import { env } from "@/lib/env";
import { getSetting, type ModelRef } from "@/lib/settings";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";
import type { AiProvider, GenerateParams, StreamEvent, Usage } from "./types";
import { costFor } from "./cost";
export { costFor };

const PROVIDERS: Record<ModelRef["provider"], { provider: AiProvider; configured: () => boolean }> = {
  anthropic: { provider: anthropicProvider, configured: () => !!env.anthropicKey },
  openai: { provider: openaiProvider, configured: () => !!env.openaiKey },
};

export type Tier = "default" | "balanced" | "fast" | "premium";

/**
 * Model işe göre seçilir, pakete göre değil (D47):
 * fast = Haiku (basit düzenleme), balanced = Sonnet (yazım), default = Opus (karmaşık analiz).
 * Paketler yalnızca kota/limit bakımından ayrışır. planId ileride gerekirse diye imzada tutuluyor.
 */
export async function resolveModel(_planId: string, tier: Tier): Promise<ModelRef & { tier: Tier }> {
  const cfg = await getSetting("ai.models");
  const ref = (cfg[tier] as ModelRef | undefined) ?? cfg.default;
  return { ...ref, tier };
}

export function isProviderConfigured(p: ModelRef["provider"]) {
  return PROVIDERS[p]?.configured() ?? false;
}

/**
 * Tahmini maliyet (USD). `input` önbellek dahil toplam girdidir; `cache` verilirse önbellekten okunan kısım
 * girdi fiyatının %10’u, önbelleğe yazılan kısım %125’i ile hesaplanır (Anthropic fiyatlandırması).
 */
export async function estimateCost(model: string, input: number, output: number, cache?: Pick<Usage, "cacheRead" | "cacheWrite">) {
  const cfg = await getSetting("ai.models");
  return costFor(cfg.pricing_per_mtok[model], input, output, cache);
}


export function streamWith(ref: ModelRef, params: Omit<GenerateParams, "model">, signal?: AbortSignal): AsyncIterable<StreamEvent> {
  const entry = PROVIDERS[ref.provider];
  if (!entry?.configured()) throw new Error(`${ref.provider} API anahtarı tanımlı değil`);
  return entry.provider.stream({ ...params, model: ref.model }, signal);
}

/** Akışsız tamamlama — kısa yapılandırılmış görevler için. */
export async function complete(ref: ModelRef, params: Omit<GenerateParams, "model">, signal?: AbortSignal) {
  let text = "";
  let usage: Usage = { input: 0, output: 0 };
  let stopReason: string | null = null;
  let model = ref.model;
  for await (const ev of streamWith(ref, params, signal)) {
    if (ev.type === "text") text += ev.text;
    else { usage = ev.usage; stopReason = ev.stopReason; model = ev.model; }
  }
  return { text, usage, stopReason, model };
}
