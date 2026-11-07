import "server-only";
/**
 * Çoklu belge analizi (D132): 2–8 kaynağa birlikte soru sorma ve karşılaştırmalı sentez.
 * Her kaynaktan yalnızca okunan metin (tam metin parçaları, yoksa özet) kullanılır; kaynak etiketleri S1…S8’dir ve
 * cevaptaki her bilgi [[kaynak:S2|s. 5]] biçiminde kaynağına bağlanır (editöre canlı atıf olarak eklenebilir).
 * Künyesi dışında içeriği okunmamış kaynak, malzemede “içerik yok” diye belirtilir; ona bilgi yüklenmez.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { rankChunks, type EvidenceChunk } from "@/lib/ai/evidence";
import { spentError } from "@/lib/ai/spent";
import type { SectionId } from "@/lib/files/pdf-clean";

export interface MultiSource {
  id: string; title: string; authors: string; year: number | null;
  abstract: string | null; access_level: "metadata" | "abstract" | "full_text";
  chunks: { content: string; page_hint: string | null; section?: string | null }[];
}
export type MultiMode = "ask" | "compare";

const COMPARE_KEYWORDS = ["aim", "purpose", "method", "design", "participants", "sample", "results", "findings", "limitations", "amaç", "yöntem", "örneklem", "katılımcı", "bulgular", "sınırlılık"];
const COMPARE_SECTIONS: SectionId[] = ["abstract", "method", "results", "discussion"];

const COMPARE_SCHEMA = {
  type: "object", additionalProperties: false, required: ["rows", "agreements", "disagreements", "gaps"],
  properties: {
    rows: { type: "array", items: { type: "object", additionalProperties: false, required: ["label", "aim", "design", "sample", "findings", "limitations"], properties: { label: { type: "string" }, aim: { type: "string" }, design: { type: "string" }, sample: { type: "string" }, findings: { type: "string" }, limitations: { type: "string" } } } },
    agreements: { type: "array", items: { type: "object", additionalProperties: false, required: ["point", "labels"], properties: { point: { type: "string" }, labels: { type: "array", items: { type: "string" } } } } },
    disagreements: { type: "array", items: { type: "object", additionalProperties: false, required: ["point", "labels", "why"], properties: { point: { type: "string" }, labels: { type: "array", items: { type: "string" } }, why: { type: "string" } } } },
    gaps: { type: "array", items: { type: "string" } },
  },
};

export interface CompareResult {
  rows: { label: string; aim: string; design: string; sample: string; findings: string; limitations: string }[];
  agreements: { point: string; labels: string[] }[];
  disagreements: { point: string; labels: string[]; why: string }[];
  gaps: string[];
}

/** Kaynak başına kanıt seçimi: tam metinde en ilgili parçalar (bölüm önceliğiyle), yoksa özet */
export function pickEvidence(src: MultiSource, keywords: string[], perSource: number, sections?: string[]): EvidenceChunk[] {
  if (!src.chunks.length) return [];
  return rankChunks(src.chunks, keywords, null, perSource, { sections });
}

export function materialFor(sources: (MultiSource & { label: string; evidence: EvidenceChunk[] })[]): string {
  return sources.map((s) => {
    const head = `[${s.label}] ${s.authors}${s.year ? ` (${s.year})` : ""}. ${s.title} — ${s.access_level === "full_text" ? "tam metin okundu" : s.access_level === "abstract" ? "yalnızca özet" : "yalnızca künye (içerik okunmadı)"}`;
    const abs = s.abstract && s.access_level !== "metadata" ? `ÖZET:\n${s.abstract.slice(0, 1800)}` : "";
    const parts = s.evidence.map((c, i) => `${s.label}-P${i + 1}${c.page ? ` (s. ${c.page})` : ""}${c.section ? ` [${c.section}]` : ""}:\n${c.content.slice(0, 1300)}`);
    return [head, abs, ...parts].filter(Boolean).join("\n");
  }).join("\n\n---\n\n");
}

/** Model metninde geçen ama listede olmayan kaynak etiketlerini temizler (uydurma atıf olmasın) */
export function sanitizeCitations(md: string, labels: string[]): string {
  return md.replace(/\[\[kaynak:([A-Za-z0-9,\s-]+)(\|[^\]]+)?\]\]/g, (m, ids: string, loc?: string) => {
    const ok = ids.split(",").map((x) => x.trim()).filter((x) => labels.includes(x));
    return ok.length ? `[[kaynak:${ok.join(",")}${loc ?? ""}]]` : "";
  });
}

export async function analyzeSources(o: {
  planId: string; lang: "tr" | "en"; mode: MultiMode; question: string;
  sources: MultiSource[]; project: { title: string; topic?: string | null };
}) {
  const model = await resolveModel(o.planId, "balanced");
  const L = o.lang === "en";
  const labeled = o.sources.map((s, i) => {
    const label = `S${i + 1}`;
    const kw = o.mode === "compare" ? [o.question, ...COMPARE_KEYWORDS] : [o.question];
    return { ...s, label, evidence: pickEvidence(s, kw, o.mode === "compare" ? 4 : 3, o.mode === "compare" ? COMPARE_SECTIONS : undefined) };
  });
  const labels = labeled.map((s) => s.label);
  const material = materialFor(labeled);
  const rules = `KURALLAR:
- Yalnızca verilen KAYNAK MALZEMESİNE dayan; kendi bilgini, kaynakta olmayan sayı/örneklem/bulgu ekleme.
- Bir kaynağın içeriği okunmadıysa (yalnızca künye) ona bilgi yükleme; “içeriği okunmadı” de.
- Dil: ${L ? "English" : "Türkçe"}.`;

  if (o.mode === "ask") {
    const res = await complete(model, {
      system: `Birden çok akademik kaynağı birlikte okuyan bir araştırma asistanısın. Öğrencinin sorusunu, verilen kaynakların hepsini dikkate alarak cevapla.
${rules}
- Her bilginin sonuna kaynağını [[kaynak:S2|s. 5]] biçiminde yaz (sayfa yoksa [[kaynak:S2]]); birden çok kaynak aynı şeyi söylüyorsa [[kaynak:S1,S3]].
- Kaynaklar arasında uyuşma ve ayrışma varsa açıkça belirt (“S1 ve S3 … bulurken S2 … bulmuştur”). Çelişkinin olası nedenini (örneklem, yöntem, bağlam farkı) yalnızca malzemeye dayanarak açıkla.
- Sonda kısa bir “Kaynakların yetmediği noktalar” maddesi ekle (varsa).
- Markdown kullan; gereksiz giriş cümlesi yazma.
Öğrencinin çalışması: “${o.project.title}”${o.project.topic ? ` (${o.project.topic})` : ""}.`,
      messages: [{ role: "user", content: `KAYNAK MALZEMESİ:\n${material}\n\nSORU: ${o.question}` }], maxTokens: 3000, effort: "medium",
    });
    const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
    const answer = sanitizeCitations(res.text.trim(), labels);
    if (!answer) throw await spentError("Cevap alınamadı, lütfen tekrar deneyin", res, model.provider, "multi_ask");
    return { mode: o.mode, answer, compare: null as CompareResult | null, labels: labeled.map((s) => ({ label: s.label, id: s.id, access: s.access_level, evidence: s.evidence.length })), usage: res.usage, cost, model: res.model, provider: model.provider };
  }

  const res = await complete(model, {
    system: `Birden çok akademik çalışmayı karşılaştıran titiz bir araştırmacısın. Verilen her kaynak için kısa bir karşılaştırma satırı, kaynaklar arasındaki uyuşmalar, ayrışmalar/çelişkiler ve araştırma boşlukları üret.
${rules}
- rows: her kaynak için bir satır (label = S1, S2…). Alanlar kısa (en fazla 30 kelime); tam metin parçasından alınan bilginin sonuna “(s. N)” yaz; malzemede yoksa “belirtilmemiş” yaz.
- agreements/disagreements: yalnızca en az iki kaynağın gerçekten değindiği noktalar; labels bu kaynakların etiketleri. disagreements.why: ayrışmanın malzemeden görülen olası nedeni (örneklem, yöntem, ölçüm, bağlam) — yoksa “malzemeden anlaşılmıyor”.
- gaps: bu kaynakların birlikte ele almadığı, öğrencinin çalışması için önemli olabilecek 1–4 boşluk (malzemeye dayanarak).
${o.question ? `Karşılaştırmanın odağı: ${o.question}` : ""}`,
    messages: [{ role: "user", content: `KAYNAK MALZEMESİ:\n${material}` }], maxTokens: 900 + labeled.length * 350, effort: "medium", jsonSchema: COMPARE_SCHEMA,
  });
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  let compare: CompareResult | null = null;
  try {
    const j = JSON.parse(res.text) as CompareResult;
    const keep = (ls: string[]) => ls.filter((x) => labels.includes(x));
    compare = {
      rows: (j.rows ?? []).filter((r) => labels.includes(r.label)),
      agreements: (j.agreements ?? []).map((a) => ({ ...a, labels: keep(a.labels) })).filter((a) => a.labels.length >= 2),
      disagreements: (j.disagreements ?? []).map((a) => ({ ...a, labels: keep(a.labels) })).filter((a) => a.labels.length >= 2),
      gaps: (j.gaps ?? []).slice(0, 4),
    };
  } catch { /* aşağıda hata */ }
  if (!compare?.rows.length) throw await spentError("Karşılaştırma üretilemedi, lütfen tekrar deneyin", res, model.provider, "multi_compare");
  return { mode: o.mode, answer: null as string | null, compare, labels: labeled.map((s) => ({ label: s.label, id: s.id, access: s.access_level, evidence: s.evidence.length })), usage: res.usage, cost, model: res.model, provider: model.provider };
}
