import "server-only";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";

/* Atıf doğrulama: bir cümlenin, atıf yapılan kaynakta gerçekten desteklenip desteklenmediğini kontrol eder. */

export interface EvidenceChunk { content: string; page: string | null }
export type Verdict = "supports" | "partial" | "not_supported" | "insufficient";
export interface EvidenceResult {
  access: "metadata" | "abstract" | "full_text";
  chunks: EvidenceChunk[];
  abstract: string | null;
  verdict: Verdict;
  explanation: string;
  quote: string | null;
  quotePage: string | null;
}

const tokens = (s: string) => (s.toLocaleLowerCase("tr").match(/[\p{L}\p{N}]{3,}/gu) ?? []);

/** Parçaları anahtar kelime örtüşmesine göre sıralar (sayfa eşleşmesine ek puan). */
export function rankChunks(chunks: { content: string; page_hint: string | null }[], keywords: string[], page?: string | null, limit = 4): EvidenceChunk[] {
  const kw = new Set(keywords.flatMap(tokens));
  const pageNums = page ? page.split(/[-–]/).map((x) => x.trim()) : [];
  return chunks
    .map((c) => {
      const words = new Set(tokens(c.content));
      let hit = 0;
      for (const w of kw) if (words.has(w)) hit++;
      const p = c.page_hint?.replace(/^s\.\s*/, "") ?? null;
      const onPage = p && pageNums.length && (pageNums.includes(p) || (pageNums.length === 2 && Number(p) >= Number(pageNums[0]) && Number(p) <= Number(pageNums[1])));
      return { c, score: hit / Math.max(1, kw.size) + (onPage ? 1.5 : 0) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ c }) => ({ content: c.content, page: c.page_hint?.replace(/^s\.\s*/, "") ?? null }));
}

const KW_SCHEMA = { type: "object", additionalProperties: false, required: ["keywords"], properties: { keywords: { type: "array", items: { type: "string" } } } };
const VERDICT_SCHEMA = {
  type: "object", additionalProperties: false, required: ["verdict", "explanation", "quote", "quotePage"],
  properties: {
    verdict: { type: "string", enum: ["supports", "partial", "not_supported", "insufficient"] },
    explanation: { type: "string" },
    quote: { type: "string" },
    quotePage: { type: "string" },
  },
};

export async function checkEvidence(params: {
  planId: string; uiLanguage: "tr" | "en"; sentence: string; locator: string | null;
  source: { title: string; abstract: string | null; access_level: "metadata" | "abstract" | "full_text" };
  chunks: { content: string; page_hint: string | null }[];
}) {
  const model = await resolveModel(params.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  let tokensIn = 0, tokensOut = 0, cost = 0;
  const track = async (r: { usage: { input: number; output: number }; model: string }) => { tokensIn += r.usage.input; tokensOut += r.usage.output; cost += await estimateCost(r.model, r.usage.input, r.usage.output); };

  let best: EvidenceChunk[] = [];
  if (params.chunks.length) {
    // Cümle Türkçe, kaynak İngilizce olabilir: her iki dilde anahtar kelime üretilir
    const kw = await complete(model, {
      system: "Verilen akademik cümle için, kaynağın tam metninde arama yapmaya uygun 6–10 anahtar kelime üret: hem cümlenin dilinde hem İngilizce karşılıklarıyla. Yalnızca JSON döndür.",
      messages: [{ role: "user", content: params.sentence }], maxTokens: 300, effort: "low", jsonSchema: KW_SCHEMA,
    });
    await track(kw);
    let keywords: string[] = [];
    try { keywords = JSON.parse(kw.text).keywords ?? []; } catch { /* yalnızca cümle kelimeleri */ }
    best = rankChunks(params.chunks, [params.sentence, ...keywords], params.locator);
  }

  if (!best.length && !params.source.abstract) {
    return { result: { access: params.source.access_level, chunks: [], abstract: null, verdict: "insufficient" as Verdict, explanation: params.uiLanguage === "en" ? "Only the citation data of this source is known; its content has not been read, so the claim cannot be checked." : "Bu kaynağın yalnızca künyesi biliniyor; içeriği okunmadığı için iddia kontrol edilemez.", quote: null, quotePage: null }, usage: { tokensIn, tokensOut, cost, model: model.model, provider: model.provider } };
  }

  const material = [
    params.source.abstract ? `ÖZET:\n${params.source.abstract.slice(0, 2500)}` : "",
    ...best.map((c, i) => `PARÇA ${i + 1}${c.page ? ` (s. ${c.page})` : ""}:\n${c.content.slice(0, 1600)}`),
  ].filter(Boolean).join("\n\n");
  const v = await complete(model, {
    system: `Bir akademik atfın doğruluğunu denetleyen titiz bir editörsün. Yalnızca verilen kaynak metnine dayan; kendi bilgini kullanma.
verdict: "supports" = metin iddiayı açıkça destekliyor; "partial" = kısmen destekliyor veya iddia kaynaktan daha güçlü/genel ifade edilmiş; "not_supported" = metin iddiayı desteklemiyor veya çelişiyor; "insufficient" = verilen metin karar vermeye yetmiyor (ör. yalnızca özet var ve konu özette geçmiyor).
quote: kararını dayandırdığın en kısa ifade, kaynak metinden AYNEN (yoksa boş). quotePage: alıntının sayfası (yoksa boş).
explanation: ${params.uiLanguage === "en" ? "English" : "Türkçe"}, en fazla 2 cümle; atıfta sayfa numarası verilmişse sayfanın doğru olup olmadığını da belirt.`,
    messages: [{ role: "user", content: `KAYNAK: ${params.source.title}\nERİŞİM: ${params.source.access_level}\nATIFTA VERİLEN SAYFA: ${params.locator ?? "yok"}\n\nMETİNDEKİ İDDİA:\n${params.sentence}\n\nKAYNAK METNİ:\n${material}` }],
    maxTokens: 700, effort: "low", jsonSchema: VERDICT_SCHEMA,
  });
  await track(v);
  let parsed: { verdict: Verdict; explanation: string; quote: string; quotePage: string } = { verdict: "insufficient", explanation: "", quote: "", quotePage: "" };
  try { parsed = JSON.parse(v.text); } catch { /* varsayılan */ }
  // Alıntı gerçekten kaynak metninde yoksa gösterme (uydurma alıntıya karşı)
  const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");
  const quoteOk = parsed.quote && norm(material).includes(norm(parsed.quote));
  return {
    result: { access: params.source.access_level, chunks: best, abstract: params.source.abstract, verdict: parsed.verdict, explanation: parsed.explanation, quote: quoteOk ? parsed.quote : null, quotePage: quoteOk && parsed.quotePage ? parsed.quotePage : null },
    usage: { tokensIn, tokensOut, cost, model: model.model, provider: model.provider },
  };
}
