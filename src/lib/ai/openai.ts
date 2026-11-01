import "server-only";
import { env } from "@/lib/env";
import type { AiProvider, GenerateParams, StreamEvent } from "./types";

/**
 * OpenAI uyumlu sağlayıcı (Chat Completions, SSE). Platformun tek bir sağlayıcıya bağımlı
 * kalmaması için eklenmiştir; yönetici panelinden model katmanlarına atanabilir.
 */
export const openaiProvider: AiProvider = {
  id: "openai",
  async *stream(p: GenerateParams, signal?: AbortSignal): AsyncIterable<StreamEvent> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal,
      headers: { Authorization: `Bearer ${env.openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: p.model,
        max_completion_tokens: p.maxTokens,
        stream: true,
        stream_options: { include_usage: true },
        messages: [{ role: "system", content: p.context ? `${p.system}\n\n${p.context}` : p.system }, ...p.messages],
        ...(p.jsonSchema ? { response_format: { type: "json_schema", json_schema: { name: "output", schema: p.jsonSchema, strict: false } } } : {}),
      }),
    });
    if (!res.ok || !res.body) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let usage = { input: 0, output: 0 };
    let stop: string | null = null;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const j = JSON.parse(data);
          const delta = j.choices?.[0]?.delta?.content;
          if (delta) yield { type: "text", text: delta };
          if (j.choices?.[0]?.finish_reason) stop = j.choices[0].finish_reason;
          if (j.usage) usage = { input: j.usage.prompt_tokens ?? 0, output: j.usage.completion_tokens ?? 0 };
        } catch {
          // kısmi satır
        }
      }
    }
    yield { type: "done", usage, stopReason: stop, model: p.model };
  },
};
