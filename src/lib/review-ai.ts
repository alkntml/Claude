import "server-only";
/**
 * PRISMA eleme önerisi (D122): yapay zekâ, protokoldeki dahil etme / hariç tutma ölçütlerine göre başlık ve özetten
 * “dahil / hariç / emin değilim” ÖNERİSİ ve kısa gerekçe verir. Karar vermez; kararı kullanıcı verir.
 */
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import type { ReviewProtocol, ReviewRecordData } from "@/lib/prisma";

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "decision", "reason"], properties: { id: { type: "string" }, decision: { type: "string", enum: ["include", "exclude", "unsure"] }, reason: { type: "string" } } } } },
};

export async function screenSuggestions(o: { planId: string; lang: "tr" | "en"; protocol: ReviewProtocol; records: { id: string; record: ReviewRecordData }[] }) {
  const model = await resolveModel(o.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const L = o.lang === "en";
  const crit = `ARAŞTIRMA SORUSU: ${o.protocol.question || "-"}\nDAHİL ETME ÖLÇÜTLERİ:\n${o.protocol.inclusion.map((x) => `- ${x}`).join("\n") || "-"}\nHARİÇ TUTMA ÖLÇÜTLERİ:\n${o.protocol.exclusion.map((x) => `- ${x}`).join("\n") || "-"}`;
  const list = o.records.map((r, i) => `[r${i}] ${r.record.title}${r.record.year ? ` (${r.record.year})` : ""}\nÖZET: ${(r.record.abstract ?? "(özet yok)").slice(0, 1200)}`).join("\n\n");
  const res = await complete(model, {
    system: `Sistematik derlemede başlık/özet taraması yapan titiz bir araştırmacısın. Her kayıt için yalnızca verilen ölçütlere ve kaydın başlık/özetine dayanarak öneri ver:
include = ölçütleri karşılıyor görünüyor; exclude = en az bir hariç tutma ölçütüne açıkça uyuyor veya dahil etme ölçütlerini açıkça karşılamıyor; unsure = özet yok veya karar için bilgi yetersiz (şüphede unsure seç; tam metin aşamasına bırakılır).
reason: ${L ? "English" : "Türkçe"}, tek kısa cümle; exclude ise hangi ölçüte takıldığını yaz. id değerini köşeli parantezdeki kimlikle aynı yaz.`,
    messages: [{ role: "user", content: `${crit}\n\nKAYITLAR:\n${list}` }], maxTokens: 300 + o.records.length * 90, effort: "low", jsonSchema: SCHEMA,
  });
  let items: { id: string; decision: "include" | "exclude" | "unsure"; reason: string }[] = [];
  try { items = JSON.parse(res.text).items ?? []; } catch { /* boş */ }
  const out = o.records.map((r, i) => { const it = items.find((x) => x.id === `r${i}`); return { id: r.id, ai: it ? { decision: it.decision, reason: it.reason.slice(0, 300) } : null }; });
  return { out, usage: res.usage, cost: await estimateCost(res.model, res.usage.input, res.usage.output, res.usage), model: res.model, provider: model.provider };
}
