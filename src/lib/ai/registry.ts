import "server-only";
import { env } from "@/lib/env";
import { getSetting, type ModelRef } from "@/lib/settings";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";
import type { AiProvider, GenerateParams, StreamEvent, Usage } from "./types";
import { costFor, resolvePrice } from "./cost";
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
  return costFor(resolvePrice(model, cfg.pricing_per_mtok).price, input, output, cache);
}


export function streamWith(ref: ModelRef, params: Omit<GenerateParams, "model">, signal?: AbortSignal): AsyncIterable<StreamEvent> {
  const entry = PROVIDERS[ref.provider];
  if (!entry?.configured()) throw new Error(`${ref.provider} API anahtarı tanımlı değil`);
  return observe(ref, entry.provider.stream({ ...params, model: ref.model }, signal));
}

/**
 * Gözlemlenebilirlik (D125): her yapay zekâ çağrısının süresi, ilk parçaya kadar geçen süre, başarı/hata ve token
 * sayısı `ai_calls` tablosuna yazılır (içerik yazılmaz). Yazma hatası çağrıyı asla etkilemez.
 */
async function* observe(ref: ModelRef, inner: AsyncIterable<StreamEvent>): AsyncIterable<StreamEvent> {
  const t0 = Date.now();
  let ttft: number | null = null, ok = false, error: string | null = null;
  let done: { usage: Usage; stopReason: string | null; model: string } | null = null;
  try {
    for await (const ev of inner) {
      if (ttft == null) ttft = Date.now() - t0;
      if (ev.type !== "text") done = { usage: ev.usage, stopReason: ev.stopReason, model: ev.model };
      yield ev;
    }
    ok = true;
  } catch (e) {
    error = ((e as Error)?.name === "AbortError" ? "aborted" : String((e as { status?: number })?.status ?? (e as Error)?.message ?? "error")).slice(0, 120);
    throw e;
  } finally {
    const row = { model: done?.model ?? ref.model, ms: Date.now() - t0, ttft_ms: ttft, ok, error, stop_reason: done?.stopReason ?? null, input_tokens: done?.usage.input ?? 0, output_tokens: done?.usage.output ?? 0 };
    import("@/lib/supabase/admin").then(({ adminClient }) => adminClient().from("ai_calls").insert(row)).then(() => undefined, () => undefined);
  }
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
