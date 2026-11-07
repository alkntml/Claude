import "server-only";
/**
 * Kaynak destekli iddia denetimi (D119). Atıflı her cümle, atıf yaptığı kaynağın OKUNAN metniyle (tam metin parçaları
 * veya özet) karşılaştırılır. Maliyeti düşük tutmak için cümleler kaynağa göre gruplanır: her kaynak için en fazla iki
 * küçük model çağrısı (anahtar kelime + toplu karar). Alıntı, kaynak metninde birebir yoksa gösterilmez.
 * Yalnızca künyesi bilinen kaynakta yapay zekâya gidilmez: “yetersiz” döner.
 */
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { rankChunks, type EvidenceChunk } from "@/lib/ai/evidence";
import type { ClaimVerdict, RelatedEvidence } from "@/lib/claims";
import { mapLimit } from "@/lib/research";

export interface PairInput { claimId: string; sentence: string; locator: string | null }
export interface SourceInput { id: string; title: string; abstract: string | null; access_level: "metadata" | "abstract" | "full_text"; chunks: { content: string; page_hint: string | null }[] }
export interface PairResult { claimId: string; sourceId: string; verdict: ClaimVerdict; explanation: string; quote: string | null; quotePage: string | null; access: SourceInput["access_level"]; /** Denetim yöntemi sürümü; eski sürüm sonuçları önbellekten kullanılmaz */ av?: number }

/** Karar kuralları değişince artır: önceki denetim sonuçları yeniden değerlendirilir */
export const AUDIT_VERSION = 2;

/** “Çelişiyor” yalnızca kaynaktan birebir doğrulanmış bir alıntıyla verilebilir; yoksa “desteklenmiyor”a düşer */
export function guardVerdict(verdict: ClaimVerdict, quoteOk: boolean): ClaimVerdict {
  return verdict === "contradicts" && !quoteOk ? "not_supported" : verdict;
}

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
        type: "object", additionalProperties: false, required: ["id", "quote", "quotePage", "explanation", "verdict"],
        properties: {
          // Önce kanıt ve gerekçe, karar en son (karar gerekçeyle tutarlı olsun)
          id: { type: "string" }, quote: { type: "string" }, quotePage: { type: "string" }, explanation: { type: "string" },
          verdict: { type: "string", enum: ["supports", "partial", "not_supported", "contradicts", "insufficient"] },
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
verdict: "supports" = kaynak metni iddiayı açıkça destekliyor; "partial" = kısmen destekliyor ya da iddia kaynaktan daha güçlü/genel ifade edilmiş (ör. kaynak “ilişkili” diyor, cümle “etkiler” diyor; kaynak belirli bir örneklem için söylüyor, cümle genelliyor); "not_supported" = metin bu iddiaya değinmiyor veya iddiayı taşımıyor; "contradicts" = kaynak metni iddianın tersini ya da onunla bağdaşmayan bir bulgu AÇIKÇA söylüyor (ör. cümle “artırır” diyor, kaynak “anlamlı fark bulunmadı” diyor) — bu kararı yalnızca tersini söyleyen ifadeyi alıntılayabiliyorsan ver; cümlenin “yalnızca, her zaman, kesinlikle” gibi kaynaktan daha güçlü ifade etmesi ya da kaynağın bir ayrıntıyı belirtmemesi çelişki DEĞİLDİR (bunlar "partial" ya da "not_supported"); şüphedeysen "contradicts" seçme; "insufficient" = verilen metin karar vermeye yetmiyor (ör. yalnızca özet var ve konu özette geçmiyor).
quote: kararı dayandırdığın en kısa ifade, kaynak metinden AYNEN (yoksa boş). quotePage: alıntının sayfası (yoksa boş).
explanation: ${L ? "English" : "Türkçe"}, tek cümle; atıfta sayfa verilmişse sayfanın uygun olup olmadığını da belirt. verdict, açıklamanla tutarlı olmalı (açıklama “kısmen” diyorsa verdict "partial").
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
      return { ...base, claimId: p.claimId, av: AUDIT_VERSION, verdict: it ? guardVerdict(it.verdict, quoteOk) : "insufficient", explanation: it?.explanation ?? (L ? "No decision could be made." : "Karar verilemedi."), quote: quoteOk ? it!.quote : null, quotePage: quoteOk && it!.quotePage ? it!.quotePage : null };
    });
  });
  return { results: results.flat(), usage, cost, calls, model: model.model, provider: model.provider };
}

const STANCE_SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "stance", "explanation", "quote", "quotePage"], properties: { id: { type: "string" }, stance: { type: "string", enum: ["supports", "contradicts", "unrelated"] }, explanation: { type: "string" }, quote: { type: "string" }, quotePage: { type: "string" } } } } },
};

/**
 * Kaynaklar arası destek/çelişki kontrolü (D133): cümlenin atıf YAPMADIĞI, projedeki başka bir kaynak bu cümleyi
 * destekliyor mu, yoksa çelişiyor mu? Aday kaynaklar kelime örtüşmesiyle seçilir (relatedCandidates); her kaynak için
 * tek bir küçük model çağrısı yapılır. Alıntı kaynak metninde birebir yoksa gösterilmez; “ilgisiz” sonuçlar atılır.
 */
export async function crossCheckSources(o: { planId: string; lang: "tr" | "en"; groups: { source: SourceInput; claims: { claimId: string; sentence: string }[] }[] }) {
  const model = await resolveModel(o.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const usage = { input: 0, output: 0 };
  let cost = 0, calls = 0;
  const L = o.lang === "en";
  const out = await mapLimit(o.groups, 3, async ({ source, claims }): Promise<(RelatedEvidence & { claimId: string })[]> => {
    const per = new Map<string, EvidenceChunk[]>();
    for (const c of claims) per.set(c.claimId, source.chunks.length ? rankChunks(source.chunks, [c.sentence], null, 2) : []);
    const used = new Map<string, EvidenceChunk & { label: string }>();
    for (const list of per.values()) for (const c of list) if (!used.has(c.content)) used.set(c.content, { ...c, label: `P${used.size + 1}` });
    const material = [source.abstract ? `ÖZET:\n${source.abstract.slice(0, 2200)}` : "", ...[...used.values()].map((c) => `${c.label}${c.page ? ` (s. ${c.page})` : ""}:\n${c.content.slice(0, 1300)}`)].filter(Boolean).join("\n\n");
    if (!material) return [];
    const r = await complete(model, {
      system: `Bir öğrencinin akademik metnindeki cümleleri, bu cümlelerde ATIF YAPILMAMIŞ başka bir kaynağın metniyle karşılaştırıyorsun. Yalnızca verilen KAYNAK METNİNE dayan.
stance: "supports" = kaynak metni cümlenin iddiasını açıkça destekliyor (öğrenci bu kaynağı da atıf olarak ekleyebilir); "contradicts" = kaynak metni cümlenin iddiasının tersini ya da onunla bağdaşmayan bir bulguyu açıkça söylüyor; "unrelated" = konu aynı olsa bile cümlenin iddiası hakkında açık bir şey söylemiyor (şüphede unrelated seç).
quote: kararı dayandırdığın en kısa ifade, kaynak metninden AYNEN (yoksa boş). quotePage: alıntının sayfası (yoksa boş). explanation: ${L ? "English" : "Türkçe"}, tek cümle.
Her cümle için bir öğe döndür; id değerini köşeli parantezdeki kimlikle aynı yaz.`,
      messages: [{ role: "user", content: `KAYNAK: ${source.title}\n\nCÜMLELER:\n${claims.map((c) => `[${c.claimId}] ${c.sentence}`).join("\n")}\n\nKAYNAK METNİ:\n${material}` }],
      maxTokens: 300 + claims.length * 200, effort: "low", jsonSchema: STANCE_SCHEMA,
    });
    usage.input += r.usage.input; usage.output += r.usage.output; calls++;
    cost += await estimateCost(r.model, r.usage.input, r.usage.output, r.usage);
    let items: { id: string; stance: "supports" | "contradicts" | "unrelated"; explanation: string; quote: string; quotePage: string }[] = [];
    try { items = JSON.parse(r.text).items ?? []; } catch { /* yok say */ }
    const nm = norm(material);
    return items.filter((x) => x.stance !== "unrelated" && claims.some((c) => c.claimId === x.id)).map((x) => {
      const quoteOk = !!x.quote && nm.includes(norm(x.quote));
      return { claimId: x.id, sourceId: source.id, stance: x.stance as "supports" | "contradicts", explanation: x.explanation.slice(0, 400), quote: quoteOk ? x.quote : null, quotePage: quoteOk && x.quotePage ? x.quotePage : null };
    })
      // Alıntısı doğrulanamayan “çelişiyor” sonucu gösterilmez (yanlış alarm riskini azaltır)
      .filter((x) => x.stance === "supports" || x.quote);
  });
  return { results: out.flat(), usage, cost, calls, model: model.model, provider: model.provider };
}
