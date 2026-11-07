import "server-only";
/**
 * PRISMA eleme önerisi (D122): yapay zekâ, protokoldeki dahil etme / hariç tutma ölçütlerine göre başlık ve özetten
 * “dahil / hariç / emin değilim” ÖNERİSİ ve kısa gerekçe verir. Karar vermez; kararı kullanıcı verir.
 */
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { rankChunks } from "@/lib/ai/evidence";
import { EXTRACTION_FIELDS, type Extraction, type ExtractionField, type ReviewProtocol, type ReviewRecordData } from "@/lib/prisma";

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

/* ---------------- D134: veri çıkarma ---------------- */

const FIELD_HINTS: Record<ExtractionField, string> = {
  design: "araştırma deseni/yaklaşımı (ör. yarı deneysel, kesitsel, nitel durum çalışması, meta-analiz)",
  country: "çalışmanın yapıldığı ülke ve ortam (okul düzeyi, hastane, çevrim içi vb.)",
  sample: "örneklem büyüklüğü (n) ve temel özellikleri (yaş, düzey, cinsiyet dağılımı)",
  intervention: "müdahale/uygulama veya incelenen bağımsız değişkenler",
  outcomes: "bağımlı değişkenler/sonuç ölçümleri ve kullanılan ölçme araçları",
  findings: "temel bulgular (yön, büyüklük, anlamlılık; sayıları yalnızca metinde varsa yaz)",
};
const EX_SCHEMA = {
  type: "object", additionalProperties: false, required: [...EXTRACTION_FIELDS],
  properties: Object.fromEntries(EXTRACTION_FIELDS.map((f) => [f, { type: "object", additionalProperties: false, required: ["value", "quote", "page"], properties: { value: { type: "string" }, quote: { type: "string" }, page: { type: "string" } } }])),
};
const nrm = (s: string) => s.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");

/**
 * Dahil edilen bir çalışmadan veri çıkarma (D134): yalnızca okunan metinden (tam metin parçaları — yöntem ve bulgular
 * bölümleri öncelikli — veya özet). Metinde olmayan alan “belirtilmemiş” kalır; her alanın dayanak alıntısı kaynak
 * metninde birebir yoksa alıntı gösterilmez. Sonuç taslaktır; araştırmacı düzeltir.
 */
export async function extractData(o: { planId: string; lang: "tr" | "en"; title: string; abstract: string | null; chunks: { content: string; page_hint: string | null; section?: string | null }[] }) {
  const basedOn: Extraction["basedOn"] = o.chunks.length ? "full_text" : o.abstract ? "abstract" : "metadata";
  if (basedOn === "metadata") return { extraction: { basedOn, at: new Date().toISOString() } as Extraction, usage: null, cost: 0, model: null, provider: null };
  const model = await resolveModel(o.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const picks = o.chunks.length ? rankChunks(o.chunks, ["method", "participants", "sample", "design", "procedure", "instrument", "measure", "results", "findings", "yöntem", "örneklem", "katılımcı", "desen", "ölçek", "bulgular", "anlamlı", "n ="], null, 8, { sections: ["method", "results", "abstract"] }) : [];
  const material = [o.abstract ? `ÖZET:\n${o.abstract.slice(0, 2500)}` : "", ...picks.map((c, i) => `P${i + 1}${c.page ? ` (s. ${c.page})` : ""}${c.section ? ` [${c.section}]` : ""}:\n${c.content.slice(0, 1400)}`)].filter(Boolean).join("\n\n");
  const L = o.lang === "en";
  const res = await complete(model, {
    system: `Sistematik derleme için dahil edilen bir çalışmadan veri çıkarıyorsun. Yalnızca verilen METNE dayan; tahmin etme, kendi bilgini ekleme.
Her alan için: value = kısa ve net (en fazla 35 kelime, ${L ? "English" : "Türkçe"}); metinde yoksa value = "${L ? "not reported" : "belirtilmemiş"}". quote = değerin dayandığı en kısa ifade, metinden AYNEN (yoksa boş). page = alıntının sayfası (yoksa boş).
Alanlar: ${EXTRACTION_FIELDS.map((f) => `${f}: ${FIELD_HINTS[f]}`).join("; ")}.`,
    messages: [{ role: "user", content: `ÇALIŞMA: ${o.title}\n\nMETİN:\n${material}` }], maxTokens: 1400, effort: "low", jsonSchema: EX_SCHEMA,
  });
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  const nm = nrm(material);
  let j: Record<string, { value: string; quote: string; page: string }> = {};
  try { j = JSON.parse(res.text); } catch { /* boş */ }
  const extraction: Extraction = { basedOn, at: new Date().toISOString() };
  for (const f of EXTRACTION_FIELDS) {
    const c = j[f];
    if (!c?.value) continue;
    const ok = !!c.quote && nm.includes(nrm(c.quote));
    extraction[f] = { value: c.value.slice(0, 600), quote: ok ? c.quote.slice(0, 600) : null, page: ok && c.page ? c.page.slice(0, 20) : null };
  }
  return { extraction, usage: res.usage, cost, model: res.model, provider: model.provider };
}
