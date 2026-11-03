import "server-only";
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { fromAiQuestions, type AiQuestion, type Question } from "@/lib/surveys";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Yapay zekâ ile anket taslağı, düzenleme, tek soru iyileştirme ve inceleme (D66). */

const Q_PROPS = {
  type: { type: "string", enum: ["single", "multi", "likert", "number", "text", "info"] },
  title: { type: "string" },
  help: { type: "string" },
  code: { type: "string" },
  required: { type: "boolean" },
  options: { type: "array", items: { type: "string" } },
  items: { type: "array", items: { type: "string" } },
  reverse: { type: "array", items: { type: "integer" } },
  points: { type: "integer" },
  min: { type: "string" },
  max: { type: "string" },
  long: { type: "boolean" },
};
const Q_SCHEMA = { type: "object", additionalProperties: false, required: Object.keys(Q_PROPS), properties: Q_PROPS };

const FORMAT = `SORU BİÇİMİ (her soruda tüm alanlar bulunur; türe uymayanları boş bırak: "" / [] / false / 5):
- type: "single" (tek seçim) | "multi" (çoklu seçim) | "likert" (ölçek bloğu: title = yönerge, items = maddeler) | "number" (sayı; min/max metin olarak, yoksa "") | "text" (açık uçlu; long = paragraf) | "info" (bölüm açıklaması, cevap alınmaz)
- code: veri dosyasındaki kısa değişken adı; Türkçe karakter olabilir, boşluk yok (ör. Yas, Cinsiyet, Sinif). Likert’te madde ön eki (ör. "MO" → MO1, MO2…).
- reverse: Likert’te ters puanlanacak maddelerin 0’dan başlayan sıraları.
- points: Likert derecesi (5 veya 7).
- help: katılımcıya kısa açıklama (gerekmiyorsa "").`;

const RULES = (lang: "tr" | "en") => `Bilimsel anket tasarımı uzmanısın. Anket dili: ${lang === "en" ? "English" : "Türkçe"}.
TEMEL KURALLAR:
- Maddeler açık, tek yargılı (bir maddede tek şey), yönlendirmesiz, yargısız ve hedef kitlenin anlayacağı dilde olsun. Çift olumsuzluk ve teknik jargon kullanma.
- Seçenekler birbirini dışlasın ve olası cevapları kapsasın; gerekiyorsa "Diğer" ve "Belirtmek istemiyorum" ekle.
- Hassas sorular (gelir, sağlık, cinsel yönelim vb.) yalnızca araştırma için gerekliyse ve "Belirtmek istemiyorum" seçeneğiyle sorulsun.
- Ad, e-posta, telefon, T.C. kimlik no gibi kimlik belirleyici bilgi ASLA sorma.
- Yayımlanmış, telifli/geçerlenmiş ölçeklerin (ör. bilinen bir ölçeğin) maddelerini birebir yazma ve maddelerin geçerlenmiş olduğunu ima etme. Özgün taslak maddeler yaz.
- Kaynak, yazar, yayın veya istatistik uydurma.`;

function lineFor(q: Question, i: number) {
  return JSON.stringify({ n: i + 1, ...q, id: undefined, labels: undefined });
}

async function run(planId: string, system: string, user: string, schema: Record<string, unknown>, maxTokens: number) {
  const model = await resolveModel(planId, "balanced");
  const res = await complete(model, { system, messages: [{ role: "user", content: user }], maxTokens, effort: "medium", jsonSchema: schema });
  let data: any;
  try { data = JSON.parse(res.text); } catch { throw new Error("Yapay zekâ yanıtı okunamadı, lütfen tekrar deneyin"); }
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { data, usage: res.usage, model: res.model, provider: model.provider, cost };
}

export interface SurveyBrief {
  purpose: string; audience: string; variables: string; length: "short" | "medium" | "long";
  demographics: boolean; openEnded: boolean; consent: boolean; lang: "tr" | "en";
  project?: { title: string; topic?: string | null; keywords?: string[] | null; discipline?: string | null; memory?: string[] } | null;
}

const LENGTH = { short: "kısa: yaklaşık 5 dakika, 10–20 cevaplanacak madde", medium: "orta: yaklaşık 10 dakika, 20–40 madde", long: "uzun: yaklaşık 15 dakika, 40–60 madde" };

/** Amaç ve hedef kitleden eksiksiz anket taslağı */
export async function generateSurvey(planId: string, b: SurveyBrief) {
  const info = [
    `Araştırmanın amacı / konusu: ${b.purpose}`,
    b.audience && `Hedef katılımcılar: ${b.audience}`,
    b.variables && `Ölçülmek istenen değişkenler / kavramlar: ${b.variables}`,
    `Uzunluk: ${LENGTH[b.length]}`,
    `Demografik sorular: ${b.demographics ? "ekle (başta, kısa)" : "ekleme"}`,
    `Açık uçlu soru: ${b.openEnded ? "sonda 1–2 tane ekle" : "ekleme"}`,
    b.project && `Bağlı çalışma: ${b.project.title}${b.project.discipline ? ` (${b.project.discipline})` : ""}${b.project.topic ? `\nÇalışmanın konusu: ${b.project.topic}` : ""}${b.project.keywords?.length ? `\nAnahtar kelimeler: ${b.project.keywords.join(", ")}` : ""}${b.project.memory?.length ? `\nÇalışmanın hipotez/değişken notları:\n- ${b.project.memory.join("\n- ")}` : ""}`,
  ].filter(Boolean).join("\n");
  const schema = {
    type: "object", additionalProperties: false, required: ["title", "description", "consent", "questions", "notes"],
    properties: { title: { type: "string" }, description: { type: "string" }, consent: { type: "string" }, questions: { type: "array", items: Q_SCHEMA }, notes: { type: "array", items: { type: "string" } } },
  };
  const out = await run(planId, `${RULES(b.lang)}
GÖREV: Verilen amaca göre uygulanmaya hazır bir anket taslağı hazırla.
- Her değişken/kavram için ayrı bir Likert bloğu kur (blok başına 4–8 madde; uygun yerlerde 1–2 ters madde ve reverse’te işaretle). Değişken verilmediyse amaçtan çıkar.
- Sıra: (varsa) demografik → ana ölçek blokları → (varsa) açık uçlu. Bloklar arasına gerekirse kısa "info" açıklaması koy.
- title: anketin katılımcıya görünen başlığı. description: katılımcıya 1–2 cümlelik amaç ve süre açıklaması.
- consent: ${b.consent ? "kısa bilgilendirilmiş onam metni; araştırmacı adı, kurum, e-posta gibi bilinmeyenleri [ARAŞTIRMACI ADI], [KURUM], [E-POSTA] diye köşeli parantezle bırak; kimlik bilgisi toplanmadığını belirt" : "boş bırak"}.
- notes: araştırmacıya 2–4 kısa not (ör. hangi blok neyi ölçüyor; geçerlenmiş bir ölçek varsa onun izinli Türkçe uyarlamasını kullanmasının daha doğru olacağı; ön uygulama önerisi). Ölçek adı uydurma.
${FORMAT}`, info, schema, 12000);
  const questions = fromAiQuestions(out.data.questions as AiQuestion[], b.lang);
  if (!questions.length) throw new Error("Anket oluşturulamadı, lütfen amacı biraz daha ayrıntılı yazıp tekrar deneyin");
  return {
    survey: { title: String(out.data.title ?? "").trim().slice(0, 300), description: String(out.data.description ?? "").trim().slice(0, 2000), consent: b.consent ? String(out.data.consent ?? "").trim().slice(0, 5000) : "", questions },
    notes: (out.data.notes ?? []).map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 6) as string[],
    usage: out.usage, model: out.model, provider: out.provider, cost: out.cost,
  };
}

/** Serbest talimatla tüm anketi düzenler (ör. “daha kısa yap”, “ters madde ekle”, “lise öğrencilerine uyarla”) */
export async function reviseSurvey(planId: string, p: { questions: Question[]; instruction: string; lang: "tr" | "en"; title: string }) {
  const schema = {
    type: "object", additionalProperties: false, required: ["questions", "changes"],
    properties: { questions: { type: "array", items: Q_SCHEMA }, changes: { type: "array", items: { type: "string" } } },
  };
  const out = await run(planId, `${RULES(p.lang)}
GÖREV: Mevcut anketi araştırmacının talimatına göre düzenle ve TAMAMINI döndür.
- Talimatın gerektirmediği soruları olduğu gibi bırak (aynı sırada, aynı code ile).
- changes: yaptığın değişiklikleri araştırmacıya 1–6 kısa madde hâlinde anlat.
${FORMAT}`, `Anket başlığı: ${p.title}\nTalimat: ${p.instruction}\n\nMevcut sorular (JSON, her satır bir soru):\n${p.questions.map(lineFor).join("\n")}`, schema, 14000);
  const keep = p.questions.map((q) => q.id);
  const questions = fromAiQuestions(out.data.questions as AiQuestion[], p.lang, keep);
  if (!questions.length) throw new Error("Düzenleme yapılamadı, talimatı değiştirip tekrar deneyin");
  return { questions, changes: (out.data.changes ?? []).map(String).filter(Boolean).slice(0, 8) as string[], usage: out.usage, model: out.model, provider: out.provider, cost: out.cost };
}

/** Tek soruyu iyileştirir; boş bir Likert bloğu için yönergeye uygun maddeler yazar */
export async function improveQuestion(planId: string, p: { question: Question; context: string; instruction?: string; lang: "tr" | "en" }) {
  const schema = { type: "object", additionalProperties: false, required: ["question", "note"], properties: { question: Q_SCHEMA, note: { type: "string" } } };
  const out = await run(planId, `${RULES(p.lang)}
GÖREV: Verilen tek soruyu iyileştir. Türünü ve code’unu koru. Likert ise maddeleri netleştir; maddesi yoksa veya çok azsa yönergeye/başlığa uygun 5–8 madde yaz (uygunsa 1–2 ters madde). Seçimli soruda seçenekleri kapsayıcı ve birbirini dışlayan hâle getir.
note: neyi değiştirdiğini tek cümleyle söyle.
${FORMAT}`, `Anketin konusu: ${p.context}\n${p.instruction ? `Araştırmacının isteği: ${p.instruction}\n` : ""}Soru: ${lineFor(p.question, 0)}`, schema, 4000);
  const [q] = fromAiQuestions([{ ...out.data.question, type: p.question.type, code: p.question.code }], p.lang, [p.question.id]);
  if (!q) throw new Error("Soru iyileştirilemedi, lütfen tekrar deneyin");
  return { question: q, note: String(out.data.note ?? "").trim(), usage: out.usage, model: out.model, provider: out.provider, cost: out.cost };
}

export interface ReviewIssue { question: number; item: number; kind: string; problem: string; suggestion: string; replacement: string }

/** Uzman gözüyle inceleme: yönlendirici, çift yargılı, belirsiz ifade vb. + önerilen yeni ifade */
export async function reviewSurvey(planId: string, p: { questions: Question[]; lang: "tr" | "en"; title: string }) {
  const schema = {
    type: "object", additionalProperties: false, required: ["summary", "issues"],
    properties: {
      summary: { type: "string" },
      issues: { type: "array", items: { type: "object", additionalProperties: false, required: ["question", "item", "kind", "problem", "suggestion", "replacement"], properties: {
        question: { type: "integer" }, item: { type: "integer" },
        kind: { type: "string", enum: ["leading", "double_barreled", "ambiguous", "negation", "jargon", "options", "sensitive", "order", "other"] },
        problem: { type: "string" }, suggestion: { type: "string" }, replacement: { type: "string" },
      } } },
    },
  };
  const out = await run(planId, `${RULES(p.lang)}
GÖREV: Anketi bir hakem gibi incele; yalnızca gerçek sorunları bildir (en fazla 15). Sorun yoksa boş liste döndür.
- question: sorunun 1’den başlayan sırası. item: Likert’te maddenin 1’den başlayan sırası; seçimli soruda sorunlu seçeneğin sırası; sorunun kendi metniyse 0.
- kind: leading (yönlendirici), double_barreled (iki şeyi birden soruyor), ambiguous (belirsiz), negation (olumsuz/çift olumsuz), jargon, options (seçenekler eksik/örtüşüyor), sensitive (hassas), order (sıra etkisi), other.
- problem: sorunu tek cümleyle açıkla. suggestion: ne yapılmalı. replacement: ilgili metnin önerilen yeni hâli (yalnızca tek bir metni değiştirmek yetiyorsa; yoksa "").
- summary: anketin genel değerlendirmesi, 1–2 cümle.`, `Anket başlığı: ${p.title}\n\nSorular (JSON, her satır bir soru; n = sıra):\n${p.questions.map(lineFor).join("\n")}`, schema, 6000);
  const issues: ReviewIssue[] = (out.data.issues ?? []).map((x: any) => ({
    question: Number(x.question) || 0, item: Number(x.item) || 0, kind: String(x.kind ?? "other"),
    problem: String(x.problem ?? "").trim(), suggestion: String(x.suggestion ?? "").trim(), replacement: String(x.replacement ?? "").trim().slice(0, 500),
  })).filter((x: ReviewIssue) => x.question >= 1 && x.question <= p.questions.length && x.problem).slice(0, 15);
  return { summary: String(out.data.summary ?? "").trim(), issues, usage: out.usage, model: out.model, provider: out.provider, cost: out.cost };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
