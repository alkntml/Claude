/* Tarayıcı tarafı: /api/ai/chat SSE akışını okur (asistan paneli ve toplu yazım ortak kullanır). */
import { handlePlanError } from "@/lib/client";
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ChatPhase = "plan" | "search" | "verify" | "read" | "write" | "gaps";
export const PHASES: ChatPhase[] = ["plan", "search", "verify", "read", "write", "gaps"];

export interface ChatRequest {
  projectId: string;
  stageId: string | null;
  conversationId: string | null;
  message: string;
  action: string;
  selection?: string;
  /** Odaklanılan alt başlığın belgedeki sırası (D97: hedef uzunluk alt başlığa bölünür) */
  focusIndex?: number | null;
}

export async function* readSSE(res: Response): AsyncGenerator<{ event: string; data: any }> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const ev = chunk.match(/^event: (.*)$/m)?.[1] ?? "message";
      const data = chunk.match(/^data: (.*)$/m)?.[1];
      if (data) yield { event: ev, data: JSON.parse(data) };
    }
  }
}

/** İsteği gönderir ve her olayı onEvent'e iletir. Sunucu "error" olayı gönderirse hata fırlatır. */
export async function streamChat(body: ChatRequest, signal: AbortSignal, onEvent: (event: string, data: any) => void, errorLabel = "Error") {
  const res = await fetch("/api/ai/chat", { method: "POST", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok || !res.body) {
    const j = await res.json().catch(() => ({}));
    handlePlanError(res.status, j);
    throw new Error(j.error ?? `${errorLabel} ${res.status}`);
  }
  for await (const ev of readSSE(res)) {
    if (ev.event === "error") throw new Error(ev.data.error);
    onEvent(ev.event, ev.data);
  }
}

/** Limit uyarılarını oturum başına bir kez göstermek için */
export function shouldWarnOnce(key: string): boolean {
  try {
    if (sessionStorage.getItem(`warn:${key}`)) return false;
    sessionStorage.setItem(`warn:${key}`, "1");
  } catch { /* depolama yoksa yine de göster */ }
  return true;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
