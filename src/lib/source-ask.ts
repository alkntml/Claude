import "server-only";
import { AI_LANGUAGE, pick, type Locale } from "@/i18n/core";
/**
 * Kaynağa sor (D112): öğrenci tek bir kaynağa soru sorar; cevap yalnızca o kaynağın okunan metninden (tam metin parçaları
 * veya özet) verilir, tam metindeki her bilgi sayfa numarasıyla (s. N) gösterilir. Metinde olmayan bilgi uydurulmaz;
 * erişim seviyesi cevapta açıkça belirtilir.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { rankChunks, type EvidenceChunk } from "@/lib/ai/evidence";
import { spentError } from "@/lib/ai/spent";
import { SECTION_PREFS } from "@/lib/files/pdf-clean";

export type AskPreset = "summary" | "method" | "sample" | "findings" | "limitations" | "relation" | "quotes" | "definitions";

/** Hazır soruların arama sözcükleri (TR + EN; makaleler çoğunlukla İngilizce) */
const PRESET_KEYWORDS: Record<AskPreset, string[]> = {
  summary: ["abstract", "aim", "purpose", "conclusion", "amaç", "sonuç", "results", "findings"],
  method: ["method", "methodology", "design", "procedure", "analysis", "measure", "instrument", "yöntem", "desen", "analiz", "ölçek", "veri toplama"],
  sample: ["participants", "sample", "sampling", "respondents", "students", "teachers", "örneklem", "katılımcı", "evren", "n ="],
  findings: ["results", "findings", "significant", "table", "correlation", "effect", "bulgu", "anlamlı", "ilişki", "fark"],
  limitations: ["limitation", "limitations", "future research", "caution", "sınırlılık", "öneri", "gelecek"],
  relation: ["implication", "discussion", "conclusion", "tartışma", "sonuç", "öneri"],
  quotes: ["defined", "definition", "argue", "conclude", "suggest", "tanım", "sonuç olarak", "göstermektedir"],
  definitions: ["defined", "definition", "concept", "refers to", "tanım", "kavram", "olarak tanımlanır"],
};

export interface AskResult { answer: string; evidence: EvidenceChunk[]; access: "metadata" | "abstract" | "full_text" }
type Usage = { input: number; output: number; cacheRead?: number; cacheWrite?: number };

export async function askSource(o: {
  planId: string;
  question: string;
  preset?: AskPreset;
  history: { q: string; a: string }[];
  lang: Locale;
  source: { title: string; authors: string; year: number | null; container: string | null; abstract: string | null; access_level: "metadata" | "abstract" | "full_text" };
  chunks: { content: string; page_hint: string | null; section?: string | null }[];
  project: { title: string; topic?: string | null };
}): Promise<AskResult & { usage: Usage; cost: number; model: string; provider: string }> {
  const model = await resolveModel(o.planId, "balanced");
  const kw = [o.question, ...(o.preset ? PRESET_KEYWORDS[o.preset] : []), ...(o.preset === "relation" ? [o.project.title, o.project.topic ?? ""] : [])];
  // Özet ve genel sorularda metnin farklı yerlerinden parça alınır; diğerlerinde en ilgili parçalar
  let evidence: EvidenceChunk[] = [];
  if (o.chunks.length) {
    const ranked = rankChunks(o.chunks, kw, null, o.preset === "summary" ? 4 : 9, { sections: o.preset ? SECTION_PREFS[o.preset] : undefined });
    if (o.preset === "summary") {
      const step = Math.max(1, Math.floor(o.chunks.length / 5));
      const spread = o.chunks.filter((_, i) => i % step === 0).slice(0, 5).map((c) => ({ content: c.content, page: c.page_hint?.replace(/^s\.\s*/, "") ?? null }));
      evidence = [...spread, ...ranked.filter((r) => !spread.some((s) => s.content === r.content))].slice(0, 9);
    } else evidence = ranked;
  }
  const accessNote = pick(o.source.access_level === "full_text" ? { tr: "Tam metin okundu (aşağıdaki parçalar).", en: "Full text was read (passages below).", de: "Der Volltext wurde gelesen (Auszüge unten)." }
    : o.source.access_level === "abstract" ? { tr: "Yalnızca özet var; tam metin okunmadı.", en: "Only the abstract is available; the full text has not been read.", de: "Nur das Abstract liegt vor; der Volltext wurde nicht gelesen." }
    : { tr: "Yalnızca künye bilgisi var; özet ve tam metin okunmadı.", en: "Only citation data is available; neither the abstract nor the full text has been read.", de: "Nur bibliografische Angaben liegen vor; weder Abstract noch Volltext wurden gelesen." }, o.lang);
  const system = `Sen akademik bir okuma asistanısın. Öğrenci TEK BİR KAYNAK hakkında soru soruyor. Yalnızca aşağıda verilen kaynak materyaline (özet ve tam metin parçaları) dayanarak cevap ver.
KURALLAR:
- Materyalde olmayan hiçbir bilgiyi yazma: sayı, örneklem, bulgu, yazar görüşü uydurma. Materyal cevap için yetmiyorsa bunu açıkça söyle ve hangi bölümün (ör. yöntem bölümü) okunması gerektiğini belirt.
- Tam metin parçasından aldığın her bilginin sonuna sayfasını “(s. N)” biçiminde yaz; parçanın sayfası yoksa “(tam metin)” yaz. Özetten aldığın bilgiye “(özet)” yaz.
- Doğrudan alıntıyı yalnızca materyaldeki cümleyi birebir aktararak ve tırnak içinde ver; kelime değiştirme.
- Cevap ${AI_LANGUAGE[o.lang]}, açık ve öğrencinin tezinde kullanabileceği netlikte olsun. Kısa başlıklar ve madde işaretleri kullanabilirsin (Markdown). Gereksiz giriş cümlesi yazma.
- “Çalışmamla ilişkisi” sorulursa öğrencinin çalışması: “${o.project.title}”${o.project.topic ? ` (${o.project.topic})` : ""}. İlişkiyi yalnızca kaynağın gerçekten söylediklerine dayandır; kaynağın söylemediği bir sonucu ona atfetme.
- Erişim durumu: ${accessNote}`;
  const material = [
    `KAYNAK: ${o.source.authors}${o.source.year ? ` (${o.source.year})` : ""}. ${o.source.title}${o.source.container ? `. ${o.source.container}` : ""}`,
    o.source.abstract && o.source.access_level !== "metadata" ? `ÖZET:\n${o.source.abstract.slice(0, 3000)}` : "",
    ...evidence.map((c, i) => `PARÇA ${i + 1}${c.page ? ` (s. ${c.page})` : ""}${c.section ? ` [${c.section}]` : ""}:\n${c.content.slice(0, 1800)}`),
  ].filter(Boolean).join("\n\n");
  const messages = [
    ...o.history.slice(-4).flatMap((h) => [{ role: "user" as const, content: h.q.slice(0, 1500) }, { role: "assistant" as const, content: h.a.slice(0, 3000) }]),
    { role: "user" as const, content: `${material}\n\nSORU: ${o.question}` },
  ];
  const res = await complete(model, { system, messages, maxTokens: 2500, effort: "low" });
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  const answer = res.text.trim();
  if (!answer) throw await spentError("Cevap alınamadı, lütfen tekrar deneyin", res, model.provider, "source_ask");
  return { answer, evidence, access: o.source.access_level, usage: res.usage, cost, model: res.model, provider: model.provider };
}
