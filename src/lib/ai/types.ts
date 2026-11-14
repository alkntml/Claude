export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateParams {
  model: string;
  /** Sabit sistem talimatı (önbelleğe alınır) */
  system: string;
  /** Sabit bağlam: proje bilgileri, kurgu, kaynak listesi (Anthropic’te önbelleğe alınır, D78) */
  context?: string;
  /** D189: bölüm boyunca sabit bağlam: diğer bölümler, ana hat, bölüm talimatları (Anthropic’te ayrıca önbelleğe alınır) */
  contextMid?: string;
  /** Değişken bağlam: bölümün mevcut metni, isteğe özgü kaynaklar, RAG parçaları (önbelleğe alınmaz) */
  contextTail?: string;
  messages: ChatMessage[];
  maxTokens: number;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
  /** Yapılandırılmış JSON çıktı şeması */
  jsonSchema?: Record<string, unknown>;
}

export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "done"; usage: Usage; stopReason: string | null; model: string };

/** input: önbellek dahil toplam girdi; cacheRead/cacheWrite bunun önbellekten okunan / önbelleğe yazılan kısmı */
export interface Usage { input: number; output: number; cacheRead?: number; cacheWrite?: number }

export interface AiProvider {
  id: "anthropic" | "openai";
  stream(params: GenerateParams, signal?: AbortSignal): AsyncIterable<StreamEvent>;
}

export class AiRefusalError extends Error {}
