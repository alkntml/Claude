import "server-only";
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";

/* Savunma provası: çalışmanın kendi metnine dayanan jüri soruları ve cevap değerlendirmesi */
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DefenseQuestion { q: string; category: string; why: string }
export interface DefenseFeedback { score: number; strengths: string[]; improvements: string[]; outline: string[]; followUp: string }

/** Bölümleri bütçe içinde tek metne çevirir (her bölüme orantılı pay). */
export function workText(stages: any[], budget = 50_000): string {
  const ordered = [...stages].sort((a, b) => a.position - b.position).filter((s) => s.key !== "references" && String(s.content_text ?? "").trim());
  if (!ordered.length) return "";
  const per = Math.max(2000, Math.floor(budget / ordered.length));
  return ordered.map((s) => `### ${s.title}\n${String(s.content_text).slice(0, per)}`).join("\n\n");
}

const LANG = (p: any) => (p.language === "en" ? "English" : "Türkçe");

const Q_SCHEMA = {
  type: "object", additionalProperties: false, required: ["questions"],
  properties: { questions: { type: "array", items: { type: "object", additionalProperties: false, required: ["q", "category", "why"], properties: { q: { type: "string" }, category: { type: "string" }, why: { type: "string" } } } } },
};
const F_SCHEMA = {
  type: "object", additionalProperties: false, required: ["score", "strengths", "improvements", "outline", "followUp"],
  properties: {
    score: { type: "integer" },
    strengths: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    outline: { type: "array", items: { type: "string" } },
    followUp: { type: "string" },
  },
};

async function run(planId: string, system: string, user: string, schema: Record<string, unknown>, maxTokens: number) {
  const model = await resolveModel(planId, "default"); // karmaşık: jüri soruları ve cevap değerlendirmesi
  const res = await complete(model, { system, messages: [{ role: "user", content: user }], maxTokens, effort: "medium", jsonSchema: schema });
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  let data: any;
  try { data = JSON.parse(res.text); } catch { throw await spentError("Yanıt işlenemedi, lütfen tekrar deneyin", res, model.provider, "defense"); }
  return { data, usage: res.usage, model: res.model, provider: model.provider, cost };
}

export async function defenseQuestions(params: { planId: string; project: any; stages: any[]; count: number; focus?: string; level: "kind" | "standard" | "tough" }) {
  const body = workText(params.stages);
  if (!body) throw new Error("Prova için önce bölümleri yazın");
  const tone = { kind: "destekleyici ve yönlendirici", standard: "dengeli, tipik bir savunma jürisi", tough: "titiz ve zorlayıcı; zayıf noktaların üstüne giden" }[params.level];
  const out = await run(params.planId,
    `Deneyimli bir tez/proje savunma jürisi üyesisin. Dil: ${LANG(params.project)}. Tutum: ${tone}.
KURALLAR:
- Soruları YALNIZCA verilen çalışma metnine dayandır: amaç ve özgünlük, kuramsal çerçeve, yöntem seçimi ve gerekçesi, örneklem, ölçme araçları, analiz, bulguların yorumu, sınırlılıklar, katkı ve öneriler.
- Metindeki belirsiz, zayıf veya tutarsız noktaları hedefle; metinde olmayan bir ayrıntıyı varmış gibi sorma.
- Her soru tek ve net olsun. "category" kısa bir etiket (ör. "Yöntem"), "why" jürinin bu soruyu neden sorduğunu tek cümleyle açıklasın.`,
    `ÇALIŞMA: ${params.project.title}\n${params.focus ? `ODAK: ${params.focus}\n` : ""}SORU SAYISI: ${params.count}\n\nÇALIŞMA METNİ:\n${body}`,
    Q_SCHEMA, 4000);
  const questions: DefenseQuestion[] = (out.data.questions ?? []).filter((x: any) => x?.q?.trim()).slice(0, params.count).map((x: any) => ({ q: String(x.q).trim(), category: String(x.category ?? "").trim(), why: String(x.why ?? "").trim() }));
  return { ...out, questions };
}

export async function defenseFeedback(params: { planId: string; project: any; stages: any[]; question: string; answer: string }) {
  const body = workText(params.stages, 30_000);
  const out = await run(params.planId,
    `Tez/proje savunma jürisi üyesisin ve adaya geri bildirim veriyorsun. Dil: ${LANG(params.project)}.
KURALLAR:
- Adayın cevabını soruya ve ÇALIŞMA METNİNE göre değerlendir; "score" 1 (zayıf) – 5 (mükemmel).
- "strengths": cevabın güçlü yönleri; "improvements": eksik veya hatalı noktalar (somut).
- "outline": daha güçlü bir cevabın 3–5 maddelik iskeleti; YALNIZCA çalışma metnindeki bilgileri kullan, metinde olmayan bulgu, sayı veya kaynak ekleme. Metinde dayanak yoksa bunu açıkça söyle.
- "followUp": jürinin bu cevaba sorabileceği tek takip sorusu.
- Nazik ama dürüst ol.`,
    `ÇALIŞMA: ${params.project.title}\n\nSORU: ${params.question}\n\nADAYIN CEVABI: ${params.answer}\n\nÇALIŞMA METNİ:\n${body}`,
    F_SCHEMA, 2500);
  const d = out.data;
  const feedback: DefenseFeedback = {
    score: Math.min(5, Math.max(1, Math.round(Number(d.score) || 1))),
    strengths: (d.strengths ?? []).map(String).slice(0, 6),
    improvements: (d.improvements ?? []).map(String).slice(0, 6),
    outline: (d.outline ?? []).map(String).slice(0, 6),
    followUp: String(d.followUp ?? ""),
  };
  return { ...out, feedback };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
