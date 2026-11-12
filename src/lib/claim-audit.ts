import "server-only";
import { AI_LANGUAGE, pick, type Locale } from "@/i18n/core";
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
export const AUDIT_VERSION = 4;

/** “Çelişiyor” yalnızca kaynaktan birebir doğrulanmış bir alıntıyla verilebilir; yoksa “desteklenmiyor”a düşer */
/**
 * Alıntının yerini ve sayfasını sunucu belirler: alıntıyı birebir içeren parçanın sayfası. Modelin yazdığı
 * “P1”, “ÖZET” gibi iç etiketler sayfa olarak gösterilmez; özetteki alıntının sayfası yoktur.
 */
export function locateQuote(quote: string | null | undefined, abstract: string | null, chunks: { content: string; page: string | null }[]): { ok: boolean; page: string | null } {
  if (!quote || quote.trim().length < 8) return { ok: false, page: null };
  const q = norm(quote);
  for (const c of chunks) if (norm(c.content).includes(q)) return { ok: true, page: c.page ? String(c.page) : null };
  if (abstract && norm(abstract).includes(q)) return { ok: true, page: null };
  return { ok: false, page: null };
}

/** Açıklamadan iç parça etiketlerini (P1, P2 …) temizler */
export function cleanExplanation(s: string): string {
  return s.replace(/\s*\((?:P\d+(?:\s*[,–-]\s*P?\d+)*)\)/g, "").replace(/\s{2,}/g, " ").slice(0, 400).trim();
}

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
        type: "object", additionalProperties: false, required: ["id", "quote", "explanation", "verdict"],
        properties: {
          // Önce kanıt ve gerekçe, karar en son (karar gerekçeyle tutarlı olsun); sayfa sunucuda bulunur
          id: { type: "string" }, quote: { type: "string" }, explanation: { type: "string" },
          verdict: { type: "string", enum: ["supports", "partial", "not_supported", "contradicts", "insufficient"] },
        },
      },
    },
  },
};
const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLocaleLowerCase("tr");
const BATCH = 6;

export async function auditSources(o: { planId: string; lang: Locale; groups: { source: SourceInput; pairs: PairInput[] }[] }) {
  const model = await resolveModel(o.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const usage = { input: 0, output: 0 };
  let cost = 0, calls = 0;
  const track = async (r: { usage: { input: number; output: number; cacheRead?: number; cacheWrite?: number }; model: string }) => {
    usage.input += r.usage.input; usage.output += r.usage.output; calls++;
    cost += await estimateCost(r.model, r.usage.input, r.usage.output, r.usage);
  };
  const jobs = o.groups.flatMap((g) => Array.from({ length: Math.ceil(g.pairs.length / BATCH) }, (_, i) => ({ source: g.source, pairs: g.pairs.slice(i * BATCH, (i + 1) * BATCH) })));

  const results = await mapLimit(jobs, 3, async ({ source, pairs }): Promise<PairResult[]> => {
    const base = { sourceId: source.id, access: source.access_level };
    if (!source.chunks.length && !source.abstract) {
      return pairs.map((p) => ({ ...base, claimId: p.claimId, verdict: "insufficient" as const, quote: null, quotePage: null,
        explanation: pick({ tr: "Bu kaynağın yalnızca künyesi biliniyor; içeriği okunmadığı için iddia kontrol edilemez.", en: "Only the citation data of this source is known; its content has not been read.", de: "Von dieser Quelle sind nur die bibliografischen Angaben bekannt; ihr Inhalt wurde nicht gelesen, daher kann die Aussage nicht geprüft werden." }, o.lang) }));
    }
    // D150: önce cümle başına en ilgili 4 parça okunur; “kısmen / desteklemiyor / yetersiz” çıkanlar, doğru parçanın
    // ilk okumada kaçırılmış olma ihtimaline karşı 9 parçayla yeniden okunur. Yeni karar yalnızca daha iyiyse ve
    // “destekliyor” ise kaynaktan birebir doğrulanan alıntıyla alınır (ölçüt gevşetilmez).
    const judge = async (ps: PairInput[], k: number): Promise<PairResult[]> => {
      // 1) Tam metin varsa: her cümle için (cümle dilinde + İngilizce) anahtar kelime → en ilgili parçalar
      const perClaim = new Map<string, EvidenceChunk[]>();
      if (source.chunks.length) {
        let kws: Record<string, string[]> = {};
        try {
          const kw = await complete(model, {
            system: "Her akademik cümle için, kaynağın tam metninde arama yapmaya uygun 5–8 anahtar kelime üret: hem cümlenin dilinde hem İngilizce karşılıklarıyla. Yalnızca JSON.",
            messages: [{ role: "user", content: ps.map((p) => `[${p.claimId}] ${p.sentence}`).join("\n") }], maxTokens: 600, effort: "low", jsonSchema: KW_SCHEMA,
          });
          await track(kw);
          kws = Object.fromEntries((JSON.parse(kw.text).items ?? []).map((x: { id: string; keywords: string[] }) => [x.id, x.keywords]));
        } catch { /* yalnızca cümle kelimeleri kullanılır */ }
        for (const p of ps) perClaim.set(p.claimId, rankChunks(source.chunks, [p.sentence, ...(kws[p.claimId] ?? [])], p.locator, k));
      }
      // 2) Ortak malzeme: özet + cümlelerin parçaları (tekrarsız, etiketli)
      const used = new Map<string, EvidenceChunk & { label: string }>();
      for (const list of perClaim.values()) for (const c of list) if (!used.has(c.content)) used.set(c.content, { ...c, label: `P${used.size + 1}` });
      const material = [
        source.abstract ? `ÖZET:\n${source.abstract.slice(0, 2500)}` : "",
        ...[...used.values()].map((c) => `${c.label}${c.page ? ` (s. ${c.page})` : ""}:\n${c.content.slice(0, 1400)}`),
      ].filter(Boolean).join("\n\n");
      const claimsText = ps.map((p) => {
        const labels = (perClaim.get(p.claimId) ?? []).map((c) => used.get(c.content)?.label).filter(Boolean).join(", ");
        return `[${p.claimId}] ${p.sentence}${p.locator ? ` (atıfta sayfa: ${p.locator})` : ""}${labels ? ` → ilgili parçalar: ${labels}` : ""}`;
      }).join("\n");
      const v = await complete(model, {
        system: `Akademik atıfları denetleyen deneyimli, adil bir danışmansın. Soru şu: “Bu cümleye bu kaynakla atıf yapmak akademik olarak doğru mu?” Yalnızca verilen KAYNAK METNİNE dayan; kendi bilgini kullanma.
  verdict:
  - "supports": cümlenin ANA bilgisi (bulgu, sayı, yön, örneklem/kapsam) kaynakta var. Başka sözcüklerle anlatım, çeviri, özetleme, kaynakta açıkça tanımlanan şeyin eş anlamlısıyla söylenmesi (ör. “genel nüfus/çok uluslu topluluk örneklemi” → “klinik olmayan örneklem”), küçük ifade farkları ve cümlenin sonunda yazarın kendi yorumunu “düşündürmektedir, olabilir, işaret eder” gibi temkinli dille eklemesi "supports" kalır. Küçük bir not varsa açıklamada belirt ama kararı düşürme.
  - "partial": cümlenin ANA bilgilerinden biri kaynakta yok ya da önemli ölçüde değiştirilmiş: sayı/oran farklı ya da yanlış niteleniyor (ör. kaynak “en fazla %71” diyor, cümle “%71’i” diyor), ilişki nedensellik olarak sunulmuş (kaynak “ilişkili”, cümle “etkiler”), kaynağın belirli bir örneklem için söylediği genelleştirilmiş, ya da kaynaktaki temkinli ifade kesin hâle getirilmiş.
  - "not_supported": kaynak metni cümlenin ana bilgisine hiç değinmiyor.
  - "contradicts": kaynak metni cümlenin tersini ya da onunla bağdaşmayan bir bulguyu AÇIKÇA söylüyor ve bunu alıntılayabiliyorsun (ör. cümle “artırır”, kaynak “anlamlı fark bulunmadı”). “yalnızca, her zaman” gibi aşırı kesinlik ya da kaynağın bir ayrıntıyı belirtmemesi çelişki DEĞİLDİR. Şüphede seçme.
  - "insufficient": yalnızca özet var ve cümlenin konusu özette geçmiyor (tam metin okunmadığı için karar verilemez).
  Küçük ayrıntılar yüzünden "partial" verme; bir danışmanın düzeltme isteyeceği bir sorun yoksa "supports" ver.
  quote: kararı dayandırdığın en kısa ifade, kaynak metinden AYNEN kopyala (yoksa boş).
  explanation: ${AI_LANGUAGE[o.lang]}, TEK kısa cümle (en fazla 30 kelime); “P1, P2, ÖZET” gibi parça etiketlerinden söz etme. "partial" ise neyin düzeltilmesi gerektiğini söyle. Atıfta sayfa verilmişse ve bu sayfa uygun değilse belirt. verdict açıklamanla tutarlı olmalı.
  Her iddia için bir öğe döndür; id değerini köşeli parantezdeki kimlikle aynı yaz.`,
        messages: [{ role: "user", content: `KAYNAK: ${source.title}\nERİŞİM: ${source.access_level}\n\nİDDİALAR:\n${claimsText}\n\nKAYNAK METNİ:\n${material}` }],
        maxTokens: 800 + ps.length * 350, effort: "low", jsonSchema: VERDICT_SCHEMA,
      });
      await track(v);
      let items: { id: string; verdict: ClaimVerdict; explanation: string; quote: string }[] = [];
      try { items = JSON.parse(v.text).items ?? []; } catch { /* aşağıda yetersiz sayılır */ }
      const evidence = [...used.values()];
      return ps.map((p) => {
        const it = items.find((x) => x.id === p.claimId);
        // Yanıt alınamadıysa sürüm işareti konmaz: sonuç önbelleğe girmez, “Yeniden denetle” bu cümleyi tekrar dener
        if (!it) return { ...base, claimId: p.claimId, verdict: "insufficient" as const, quote: null, quotePage: null, explanation: pick({ tr: "Bu cümle için yanıt alınamadı; lütfen yeniden denetleyin.", en: "No answer was received for this sentence; please run the audit again.", de: "Für diesen Satz kam keine Antwort; bitte führen Sie die Prüfung erneut durch." }, o.lang) };
        const loc = locateQuote(it.quote, source.abstract, evidence);
        return { ...base, claimId: p.claimId, av: AUDIT_VERSION, verdict: guardVerdict(it.verdict, loc.ok), explanation: cleanExplanation(it.explanation), quote: loc.ok ? it.quote : null, quotePage: loc.page };
      });
    };
    const first = await judge(pairs, 4);
    const RANK: Record<string, number> = { supports: 3, partial: 2, insufficient: 1, not_supported: 0 };
    const weak = first.filter((r) => r.av && r.verdict in RANK && r.verdict !== "supports");
    // İkinci okuma yalnızca ilk okumada görülmemiş parça varsa yapılır
    if (source.chunks.length <= 4 || !weak.length) return first;
    const second = await judge(pairs.filter((p) => weak.some((w) => w.claimId === p.claimId)), 9).catch(() => [] as PairResult[]);
    return first.map((r) => {
      const s2 = second.find((x) => x.claimId === r.claimId);
      if (!s2 || !s2.av || !(s2.verdict in RANK) || RANK[s2.verdict] <= RANK[r.verdict]) return r;
      if (s2.verdict === "supports" && !s2.quote) return r;
      return s2;
    });
  });
  return { results: results.flat(), usage, cost, calls, model: model.model, provider: model.provider };
}

const STANCE_SCHEMA = {
  type: "object", additionalProperties: false, required: ["items"],
  properties: { items: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "quote", "explanation", "stance"], properties: { id: { type: "string" }, quote: { type: "string" }, explanation: { type: "string" }, stance: { type: "string", enum: ["supports", "contradicts", "unrelated"] } } } } },
};

/**
 * Kaynaklar arası destek/çelişki kontrolü (D133): cümlenin atıf YAPMADIĞI, projedeki başka bir kaynak bu cümleyi
 * destekliyor mu, yoksa çelişiyor mu? Aday kaynaklar kelime örtüşmesiyle seçilir (relatedCandidates); her kaynak için
 * tek bir küçük model çağrısı yapılır. Alıntı kaynak metninde birebir yoksa gösterilmez; “ilgisiz” sonuçlar atılır.
 */
export async function crossCheckSources(o: { planId: string; lang: Locale; groups: { source: SourceInput; claims: { claimId: string; sentence: string }[] }[] }) {
  const model = await resolveModel(o.planId, "fast");
  if (!isProviderConfigured(model.provider)) throw new Error("Yapay zekâ sağlayıcısı yapılandırılmamış");
  const usage = { input: 0, output: 0 };
  let cost = 0, calls = 0;
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
quote: kararı dayandırdığın en kısa ifade, kaynak metninden AYNEN (yoksa boş). explanation: ${AI_LANGUAGE[o.lang]}, tek kısa cümle (en fazla 30 kelime); “P1, ÖZET” gibi parça etiketlerinden söz etme.
Her cümle için bir öğe döndür; id değerini köşeli parantezdeki kimlikle aynı yaz.`,
      messages: [{ role: "user", content: `KAYNAK: ${source.title}\n\nCÜMLELER:\n${claims.map((c) => `[${c.claimId}] ${c.sentence}`).join("\n")}\n\nKAYNAK METNİ:\n${material}` }],
      maxTokens: 600 + claims.length * 300, effort: "low", jsonSchema: STANCE_SCHEMA,
    });
    usage.input += r.usage.input; usage.output += r.usage.output; calls++;
    cost += await estimateCost(r.model, r.usage.input, r.usage.output, r.usage);
    let items: { id: string; stance: "supports" | "contradicts" | "unrelated"; explanation: string; quote: string }[] = [];
    try { items = JSON.parse(r.text).items ?? []; } catch { /* yok say */ }
    const evidence = [...used.values()];
    return items.filter((x) => x.stance !== "unrelated" && claims.some((c) => c.claimId === x.id)).map((x) => {
      const loc = locateQuote(x.quote, source.abstract, evidence);
      return { claimId: x.id, sourceId: source.id, stance: x.stance as "supports" | "contradicts", explanation: cleanExplanation(x.explanation), quote: loc.ok ? x.quote : null, quotePage: loc.page };
    })
      // Alıntısı doğrulanamayan “çelişiyor” sonucu gösterilmez (yanlış alarm riskini azaltır)
      .filter((x) => x.stance === "supports" || x.quote);
  });
  return { results: out.flat(), usage, cost, calls, model: model.model, provider: model.provider };
}
