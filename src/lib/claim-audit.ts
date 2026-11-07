import "server-only";
/**
 * Kaynak destekli iddia denetimi (D119). Atıflı her cümle, atıf yaptığı kaynağın OKUNAN metniyle (tam metin parçaları
 * veya özet) karşılaştırılır. Maliyeti düşük tutmak için cümleler kaynağa göre gruplanır: her kaynak için en fazla iki
 * küçük model çağrısı (anahtar kelime + toplu karar). Alıntı, kaynak metninde birebir yoksa gösterilmez.
 * Yalnızca künyesi bilinen kaynakta yapay zekâya gidilmez: “yetersiz” döner.
 */
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { rankChunks, type EvidenceChunk } from "@/lib/ai/evidence";
import type { ClaimVerdict } from "@/lib/claims";
import { mapLimit } from "@/lib/research";

export interface PairInput { claimId: string; sentence: string; locator: string | null }
export interface SourceInput { id: string; title: string; abstract: string | null; access_level: "metadata" | "abstract" | "full_text"; chunks: { content: string; page_hint: string | null }[] }
export interface PairResult { claimId: string; sourceId: string; verdict: ClaimVerdict; explanation: string; quote: string | null; quotePage: string | null; access: SourceInput["access_level"] }

const KW_SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "keywords"], properties: { id: { type: "string" }, keywords: { type: "array", items: { type: "string" } } } } } },
};
const VERDICT_SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["id", "verdict", "explanation", "quote", "quotePage"],
        properties: {
          id: { type: "string" },
          verdict: { type: "string", enum: ["supports", "partial", "not_supported", "insufficient"] },
          explanation: { type: "string" }, quote: { type: "string" }, quotePage: { type: "string" },
        },
      },
    },
  },
};
const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");
const BATCH = 6;

export async function auditSources(o: { planId: string; lang: "tr" | "en"; groups: { source: SourceInput; pairs: PairInput[] }[] }) {
  const model = await resolveModel(o.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const usage = { input: 0, output: 0 };
  let cost = 0, calls = 0;
  const track = async (r: { usage: { input: number; output: number; cacheRead?: number; cacheWrite?: number }; model: string }) => {
    usage.input += r.usage.input; usage.output += r.usage.output; calls++;
    cost += await estimateCost(r.model, r.usage.input, r.usage.output, r.usage);
  };
  const L = o.lang === "en";
  const jobs = o.groups.flatMap((g) => Array.from({ length: Math.ceil(g.pairs.length / BATCH) }, (_, i) => ({ source: g.source, pairs: g.pairs.slice(i * BATCH, (i + 1) * BATCH) })));

  const results = await mapLimit(jobs, 3, async ({ source, pairs }): Promise<PairResult[]> => {
    const base = { sourceId: source.id, access: source.access_level };
    if (!source.chunks.length && !source.abstract) {
      return pairs.map((p) => ({ ...base, claimId: p.claimId, verdict: "insufficient" as const, quote: null, quotePage: null,
        explanation: L ? "Only the citation data of this source is known; its content has not been read." : "Bu kaynağın yalnızca künyesi biliniyor; içeriği okunmadığı için iddia kontrol edilemez." }));
    }
    // 1) Tam metin varsa: her cümle için (cümle dilinde + İngilizce) anahtar kelime → en ilgili parçalar
    const perClaim = new Map<string, EvidenceChunk[]>();
    if (source.chunks.length) {
      let kws: Record<string, string[]> = {};
      try {
        const kw = await complete(model, {
          system: "Her akademik cümle için, kaynağın tam metninde arama yapmaya uygun 5–8 anahtar kelime üret: hem cümlenin dilinde hem İngilizce karşılıklarıyla. Yalnızca JSON.",
          messages: [{ role: "user", content: pairs.map((p) => `[${p.claimId}] ${p.sentence}`).join("\n") }], maxTokens: 600, effort: "low", jsonSchema: KW_SCHEMA,
        });
        await track(kw);
        kws = Object.fromEntries((JSON.parse(kw.text).items ?? []).map((x: { id: string; keywords: string[] }) => [x.id, x.keywords]));
      } catch { /* yalnızca cümle kelimeleri kullanılır */ }
      for (const p of pairs) perClaim.set(p.claimId, rankChunks(source.chunks, [p.sentence, ...(kws[p.claimId] ?? [])], p.locator, 3));
    }
    // 2) Ortak malzeme: özet + cümlelerin parçaları (tekrarsız, etiketli)
    const used = new Map<string, EvidenceChunk & { label: string }>();
    for (const list of perClaim.values()) for (const c of list) if (!used.has(c.content)) used.set(c.content, { ...c, label: `P${used.size + 1}` });
    const material = [
      source.abstract ? `ÖZET:\n${source.abstract.slice(0, 2500)}` : "",
      ...[...used.values()].map((c) => `${c.label}${c.page ? ` (s. ${c.page})` : ""}:\n${c.content.slice(0, 1400)}`),
    ].filter(Boolean).join("\n\n");
    const claimsText = pairs.map((p) => {
      const labels = (perClaim.get(p.claimId) ?? []).map((c) => used.get(c.content)?.label).filter(Boolean).join(", ");
      return `[${p.claimId}] ${p.sentence}${p.locator ? ` (atıfta sayfa: ${p.locator})` : ""}${labels ? ` → ilgili parçalar: ${labels}` : ""}`;
    }).join("\n");
    const v = await complete(model, {
      system: `Akademik atıfların doğruluğunu denetleyen titiz bir editörsün. Yalnızca verilen KAYNAK METNİNE dayan; kendi bilgini kullanma. Her iddia için:
verdict: "supports" = kaynak metni iddiayı açıkça destekliyor; "partial" = kısmen destekliyor ya da iddia kaynaktan daha güçlü/genel ifade edilmiş; "not_supported" = metin iddiayı desteklemiyor veya çelişiyor; "insufficient" = verilen metin karar vermeye yetmiyor (ör. yalnızca özet var ve konu özette geçmiyor).
quote: kararı dayandırdığın en kısa ifade, kaynak metinden AYNEN (yoksa boş). quotePage: alıntının sayfası (yoksa boş).
explanation: ${L ? "English" : "Türkçe"}, tek cümle; atıfta sayfa verilmişse sayfanın uygun olup olmadığını da belirt.
Her iddia için bir öğe döndür; id değerini köşeli parantezdeki kimlikle aynı yaz.`,
      messages: [{ role: "user", content: `KAYNAK: ${source.title}\nERİŞİM: ${source.access_level}\n\nİDDİALAR:\n${claimsText}\n\nKAYNAK METNİ:\n${material}` }],
      maxTokens: 400 + pairs.length * 220, effort: "low", jsonSchema: VERDICT_SCHEMA,
    });
    await track(v);
    let items: { id: string; verdict: ClaimVerdict; explanation: string; quote: string; quotePage: string }[] = [];
    try { items = JSON.parse(v.text).items ?? []; } catch { /* aşağıda yetersiz sayılır */ }
    const nm = norm(material);
    return pairs.map((p) => {
      const it = items.find((x) => x.id === p.claimId);
      const quoteOk = !!it?.quote && nm.includes(norm(it.quote));
      return { ...base, claimId: p.claimId, verdict: it?.verdict ?? "insufficient", explanation: it?.explanation ?? (L ? "No decision could be made." : "Karar verilemedi."), quote: quoteOk ? it!.quote : null, quotePage: quoteOk && it!.quotePage ? it!.quotePage : null };
    });
  });
  return { results: results.flat(), usage, cost, calls, model: model.model, provider: model.provider };
}
