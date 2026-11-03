import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";
import type { AiProvider, GenerateParams, StreamEvent } from "./types";

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic({ apiKey: env.anthropicKey }));

/** Sunucu taraflı yedek model (refusal fallback) desteği olan modeller. */
const FALLBACK_MODELS = new Set(["claude-opus-5-5", "claude-sonnet-5-5", "claude-opus-5", "claude-fable-5-1"]);

export const anthropicProvider: AiProvider = {
  id: "anthropic",
  async *stream(p: GenerateParams, signal?: AbortSignal): AsyncIterable<StreamEvent> {
    const useFallback = FALLBACK_MODELS.has(p.model);
    const system: Anthropic.Beta.BetaTextBlockParam[] = [{ type: "text", text: p.system, cache_control: { type: "ephemeral" } }];
    // Sabit bağlam da önbelleğe alınır (D78): aynı çalışmadaki ardışık isteklerde ~%90 daha ucuz okunur
    if (p.context) system.push({ type: "text", text: p.context, cache_control: { type: "ephemeral" } });
    if (p.contextTail) system.push({ type: "text", text: p.contextTail });

    const stream = getClient().beta.messages.stream(
      {
        model: p.model,
        max_tokens: p.maxTokens,
        system,
        messages: p.messages,
        output_config: {
          ...(p.effort ? { effort: p.effort } : {}),
          ...(p.jsonSchema ? { format: { type: "json_schema", schema: p.jsonSchema } } : {}),
        },
        ...(useFallback ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      },
      { signal },
    );

    for await (const ev of stream) {
      if (ev.type === "content_block_delta" && ev.delta.type === "text_delta") yield { type: "text", text: ev.delta.text };
    }
    const final = await stream.finalMessage();
    const cacheRead = final.usage.cache_read_input_tokens ?? 0;
    const cacheWrite = final.usage.cache_creation_input_tokens ?? 0;
    yield {
      type: "done",
      usage: { input: (final.usage.input_tokens ?? 0) + cacheRead + cacheWrite, output: final.usage.output_tokens ?? 0, cacheRead, cacheWrite },
      stopReason: final.stop_reason ?? null,
      model: final.model,
    };
  },
};
