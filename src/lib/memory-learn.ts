import "server-only";
/**
 * Hafızaya belgeden öğren (D88): kullanıcının yüklediği belge (PDF, Word, metin) okunur, çalışma için kalıcı
 * önemi olan bilgiler (karar, kavram tanımı, değişken, araştırma sorusu, hipotez, olgu) kısa hafıza kayıtlarına
 * dönüştürülür. Yalnızca belgede açıkça yazanlar alınır; sayı ve adlar belgedeki gibi aktarılır, yorum eklenmez.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { fold } from "@/lib/import/references";
import { LANG_NAME, writingLang } from "@/lib/writing-lang";

const KINDS = ["fact", "decision", "concept", "variable", "question", "hypothesis", "note"] as const;
export type MemoryKind = (typeof KINDS)[number];

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: {
    items: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["kind", "content"], properties: { kind: { type: "string", enum: [...KINDS] }, content: { type: "string" } } },
    },
  },
};

/** Belge metninden en fazla `max` hafıza kaydı çıkarır; mevcut kayıtlarla aynı olanlar atılır */
export async function learnFromDocument(params: {
  planId: string;
  fileName: string;
  text: string;
  project: { title: string; topic?: string | null; language?: string | null };
  existing: string[];
  max?: number;
}) {
  const max = params.max ?? 20;
  const model = await resolveModel(params.planId, "balanced");
  const lang = LANG_NAME[writingLang(params.project.language)];
  const system = `Akademik bir çalışmanın proje hafızasını dolduran titiz bir araştırma asistanısın. Sana verilen belgeyi oku ve bu çalışmada (“${params.project.title}”${params.project.topic ? `, konu: ${params.project.topic}` : ""}) sonraki yazımlarda hatırlanması gereken bilgileri en fazla ${max} kısa kayıt olarak çıkar.
KURALLAR:
- YALNIZCA belgede açıkça yazan bilgileri al. Yorum, çıkarım, değerlendirme veya belgede olmayan bilgi EKLEME. Sayıları, ölçek adlarını, madde sayılarını, örneklem büyüklüklerini, güvenirlik katsayılarını ve yazar–yıl bilgilerini belgedeki gibi aktar.
- Türler: decision (çalışmada alınmış karar: yöntem, ölçek, örneklem tercihi vb.), concept (kavram tanımı), variable (değişken ve nasıl ölçüleceği), question (araştırma sorusu), hypothesis (hipotez), fact (kaynağıyla birlikte önemli bulgu veya olgu, ör. “Choi (2021): …”), note (diğer önemli bilgi).
- Her kayıt tek başına anlaşılır, tek bilgi içeren, 1–2 cümlelik olsun; ${lang} yaz.
- Belgede çalışma için önemli bilgi yoksa boş liste döndür. Zaten hafızada olan bilgileri tekrar yazma.`;
  const user = `BELGE: ${params.fileName}\n${params.existing.length ? `HAFIZADA ZATEN OLANLAR:\n${params.existing.slice(-60).map((x) => `- ${x}`).join("\n")}\n\n` : ""}BELGE METNİ:\n"""\n${params.text}\n"""`;
  const res = await complete(model, { system, messages: [{ role: "user", content: user }], maxTokens: 4000, effort: "low", jsonSchema: SCHEMA });
  let items: { kind: MemoryKind; content: string }[] = [];
  try { items = (JSON.parse(res.text) as { items: { kind: MemoryKind; content: string }[] }).items ?? []; } catch { throw await spentError("Yapay zekâ yanıtı okunamadı, lütfen tekrar deneyin", res, model.provider, "memory_learn"); }
  const seen = new Set(params.existing.map(fold));
  const clean = items
    .filter((x) => KINDS.includes(x.kind) && typeof x.content === "string" && x.content.trim().length > 3)
    .map((x) => ({ kind: x.kind, content: x.content.trim().slice(0, 1200) }))
    .filter((x) => { const k = fold(x.content); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, max);
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { items: clean, usage: res.usage, model: res.model, provider: model.provider, cost };
}
