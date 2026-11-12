import "server-only";
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { readBlueprint } from "@/lib/blueprint";
import { GRANT_PROGRAMS, LEVEL_LABELS, WORK_TYPES, type AcademicLevel } from "@/lib/workflows";
import { LANG_NAME, writingLang } from "@/lib/writing-lang";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TitleIdea { title: string; note: string }

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["titles"],
  properties: { titles: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "note"], properties: { title: { type: "string" }, note: { type: "string" } } } } },
};

/** Çalışma bilgilerinden akademik başlık önerileri (bulgu veya sonuç iddiası içermez) */
export async function suggestTitles(params: { planId: string; project: any; hint?: string }) {
  const p = params.project;
  const wt = WORK_TYPES.find((w) => w.id === p.work_type)?.title ?? p.work_type;
  const program = p.context?.program ? GRANT_PROGRAMS.find((g) => g.id === p.context.program)?.label : null;
  const info = [
    `Çalışma türü: ${wt}${program ? ` (${program})` : ""}`,
    `Seviye: ${LEVEL_LABELS[p.academic_level as AcademicLevel] ?? p.academic_level}`,
    p.discipline && `Disiplin: ${p.discipline}`,
    p.context?.methodology && `Yöntem yaklaşımı: ${p.context.methodology}`,
    `Mevcut geçici başlık: ${p.title}`,
    p.topic && `Konu açıklaması: ${p.topic}`,
    p.keywords?.length && `Anahtar kelimeler: ${p.keywords.join(", ")}`,
    ...(() => { const bp = readBlueprint(p.context?.blueprint); return bp ? [bp.aim && `Kurgudaki amaç: ${bp.aim}`, bp.method && `Kurgudaki yöntem: ${bp.method}`, bp.sample && `Kurgudaki katılımcılar/kapsam: ${bp.sample}`] : []; })(),
    params.hint && `Kullanıcının isteği: ${params.hint}`,
  ].filter(Boolean).join("\n");
  const model = await resolveModel(params.planId, "balanced");
  const res = await complete(model, {
    system: `Akademik danışmansın; öğrenciye çalışma başlığı öneriyorsun. Dil: ${LANG_NAME[writingLang(p.language)]}.
KURALLAR:
- 5 farklı başlık öner: değişkenleri/kavramları, örneklemi veya bağlamı ve (uygunsa) yöntemi açıkça yansıtsın; 8–20 kelime; akademik ve nesnel.
- Başlıklar birbirinden anlamlı biçimde farklı olsun (ör. ilişkisel, karşılaştırmalı, belirli bir örneklemle daraltılmış, yöntemi öne çıkaran).
- Henüz yapılmamış bir araştırmanın sonucunu ima etme ("…artırır", "…etkilidir" gibi kesin yargı yok).
- Bilinmeyen bilgi (ör. il, okul adı) uydurma; gerekiyorsa genel ifade kullan.
- Türkçe başlıklarda yaygın kalıplar: "… ile … Arasındaki İlişkinin İncelenmesi", "… Üzerine Bir Araştırma", "…: … Örneği". Başlıkta her kelimenin ilk harfi büyük yazılır (bağlaçlar hariç).
- "note": bu başlığın neyi öne çıkardığını tek cümleyle açıkla.`,
    messages: [{ role: "user", content: info }],
    maxTokens: 1500,
    effort: "low",
    jsonSchema: SCHEMA,
  });
  let titles: TitleIdea[] = [];
  try { titles = (JSON.parse(res.text).titles ?? []).filter((x: any) => x?.title?.trim()).slice(0, 6).map((x: any) => ({ title: String(x.title).trim().slice(0, 300), note: String(x.note ?? "").trim() })); } catch { throw new Error("Başlık önerileri oluşturulamadı, lütfen tekrar deneyin"); }
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { titles, usage: res.usage, model: res.model, provider: model.provider, cost };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
