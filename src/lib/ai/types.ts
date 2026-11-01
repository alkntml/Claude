export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateParams {
  model: string;
  /** Sabit sistem talimatı (önbelleğe alınır) */
  system: string;
  /** Değişken bağlam: proje bilgileri, kaynaklar, RAG parçaları */
  context?: string;
  messages: ChatMessage[];
  maxTokens: number;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  /** Yapılandırılmış JSON çıktı şeması */
  jsonSchema?: Record<string, unknown>;
}

export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "done"; usage: { input: number; output: number }; stopReason: string | null; model: string };

export interface AiProvider {
  id: "anthropic" | "openai";
  stream(params: GenerateParams, signal?: AbortSignal): AsyncIterable<StreamEvent>;
}

export class AiRefusalError extends Error {}
