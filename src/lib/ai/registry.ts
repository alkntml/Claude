import "server-only";
import { env } from "@/lib/env";
import { getSetting, type ModelRef } from "@/lib/settings";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";
import type { AiProvider, GenerateParams, StreamEvent } from "./types";

const PROVIDERS: Record<ModelRef["provider"], { provider: AiProvider; configured: () => boolean }> = {
  anthropic: { provider: anthropicProvider, configured: () => !!env.anthropicKey },
  openai: { provider: openaiProvider, configured: () => !!env.openaiKey },
};

export type Tier = "default" | "balanced" | "fast" | "premium";

export async function resolveModel(planId: string, tier?: Tier): Promise<ModelRef & { tier: Tier }> {
  const cfg = await getSetting("ai.models");
  const t: Tier = tier ?? cfg.plan_tiers[planId] ?? "default";
  const ref = (cfg[t] as ModelRef | undefined) ?? cfg.default;
  return { ...ref, tier: t };
}

export function isProviderConfigured(p: ModelRef["provider"]) {
  return PROVIDERS[p]?.configured() ?? false;
}

export async function estimateCost(model: string, input: number, output: number) {
  const cfg = await getSetting("ai.models");
  const price = cfg.pricing_per_mtok[model];
  if (!price) return 0;
  return (input * price.in + output * price.out) / 1_000_000;
}

export function streamWith(ref: ModelRef, params: Omit<GenerateParams, "model">, signal?: AbortSignal): AsyncIterable<StreamEvent> {
  const entry = PROVIDERS[ref.provider];
  if (!entry?.configured()) throw new Error(`${ref.provider} API anahtarı tanımlı değil`);
  return entry.provider.stream({ ...params, model: ref.model }, signal);
}

/** Akışsız tamamlama — kısa yapılandırılmış görevler için. */
export async function complete(ref: ModelRef, params: Omit<GenerateParams, "model">, signal?: AbortSignal) {
  let text = "";
  let usage = { input: 0, output: 0 };
  let stopReason: string | null = null;
  let model = ref.model;
  for await (const ev of streamWith(ref, params, signal)) {
    if (ev.type === "text") text += ev.text;
    else { usage = ev.usage; stopReason = ev.stopReason; model = ev.model; }
  }
  return { text, usage, stopReason, model };
}
