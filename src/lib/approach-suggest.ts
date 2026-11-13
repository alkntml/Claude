import "server-only";
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { DESIGNS, LEVEL_LABELS, WORK_TYPES, type AcademicLevel } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */
const APPROACHES = ["quantitative", "qualitative", "mixed", "theoretical", "systematic_review", "meta_analysis"] as const;
const SCHEMA = {
  type: "object", additionalProperties: false, required: ["approach", "design", "why", "limits", "alternatives"],
  properties: {
    approach: { type: "string", enum: [...APPROACHES] },
    design: { type: "string", enum: ["", ...DESIGNS.map((d) => d.id)] },
    why: { type: "string" }, limits: { type: "string" },
    alternatives: { type: "array", items: { type: "string" } },
  },
};

/**
 * D171: yöntemini bilmeyen kullanıcıya yaklaşım ve desen önerisi (referans 8). Öneri gerekçesi ve sınırlılıklarıyla verilir;
 * nihai karar kullanıcı ve danışmanınındır. Bilinmeyen bilgi uydurulmaz.
 */
export async function suggestApproach(p: { planId: string; workType: string; level: string; discipline: string; topic: string; questions?: string; data?: string; locale: string }) {
  const model = await resolveModel(p.planId, "fast");
  const wt = WORK_TYPES.find((w) => w.id === p.workType)?.title ?? p.workType;
  const res = await complete(model, {
    system: `Araştırma yöntemi danışmanısın. Öğrencinin konusu, amacı, soruları, veri türü ve saha koşullarına göre en uygun araştırma yaklaşımını ve (varsa) deseni öner.
Yaklaşımlar: quantitative (ölçüm, dağılım, ilişki, fark, etki), qualitative (deneyim, anlam, süreç, bağlam), mixed (her iki odağın gerekçeli birleşimi), theoretical (kuramsal/kavramsal; veri toplanmaz), systematic_review, meta_analysis.
Desen kimlikleri: ${DESIGNS.map((d) => `${d.id} (${d.label}, ${d.approach})`).join("; ")}. Desen yalnızca nicel/nitel/karma yaklaşımda verilir; değilse boş bırak.
"why": 2–3 cümlelik gerekçe. "limits": önerinin sınırlılıkları ve neyi netleştirmek gerektiği (1–2 cümle). "alternatives": en fazla 2 makul alternatif (kısa). Nihai kararın öğrenci ve danışmanına ait olduğunu unutma; kesin dil kullanma. Yanıt dili: ${p.locale === "en" ? "English" : p.locale === "de" ? "Deutsch" : "Türkçe"}.`,
    messages: [{ role: "user", content: [`Çalışma türü: ${wt}`, `Seviye: ${LEVEL_LABELS[p.level as AcademicLevel] ?? p.level}`, p.discipline && `Disiplin: ${p.discipline}`, `Konu/amaç: ${p.topic}`, p.questions && `Araştırma soruları: ${p.questions}`, p.data && `Veri ve saha koşulları: ${p.data}`].filter(Boolean).join("\n") }],
    maxTokens: 900,
    effort: "low",
    jsonSchema: SCHEMA,
  });
  let out: any;
  try { out = JSON.parse(res.text); } catch { throw await spentError("Yöntem önerisi oluşturulamadı", res, model.provider, "approach_suggest"); }
  const approach = (APPROACHES as readonly string[]).includes(out.approach) ? out.approach : "quantitative";
  const design = DESIGNS.find((d) => d.id === out.design && d.approach === approach)?.id ?? null;
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { suggestion: { approach, design, why: String(out.why ?? "").slice(0, 800), limits: String(out.limits ?? "").slice(0, 600), alternatives: (out.alternatives ?? []).slice(0, 2).map((x: any) => String(x).slice(0, 200)) }, usage: res.usage, model: res.model, provider: model.provider, cost };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
