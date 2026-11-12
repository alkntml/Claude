import "server-only";
/**
 * Akademik çeviri ve dil denetimi (D111).
 * - Çeviri: Türkçe, İngilizce ve Almanca arasında (D144), akademik üslup; atıf/dipnot/şekil işaretleri (⟦C1⟧, ⟦F1⟧, ⟦G1⟧) korunur, içerik eklenmez
 *   veya özetlenmez; projenin terim sözlüğü zorunlu karşılık olarak uygulanır; istatistik gösterimi ve ondalık ayırıcı
 *   hedef dile çevrilir. Uzun metin bloklar bölünmeden parçalara ayrılır.
 * - Dil denetimi: yazım, dil bilgisi, noktalama, akademik üslup ve terim tutarlılığı önerileri; her öneri metinde birebir
 *   geçen bir parçaya bağlıdır, böylece tek tek uygulanabilir.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { splitChunks, tokensIn } from "@/lib/editor/translate-doc";

export type Lang = "tr" | "en" | "de";
export type Variant = "us" | "uk";
/** Terim sözlüğü satırı: en az iki dil dolu (D144: Almanca sütun isteğe bağlı) */
export interface GlossaryEntry { tr: string; en: string; de?: string }
type Usage = { input: number; output: number; cacheRead?: number; cacheWrite?: number };
export interface AiSpend { usage: Usage; cost: number; model: string; provider: string; calls: number }

const add = (a: AiSpend, u: Usage, cost: number) => {
  a.usage.input += u.input; a.usage.output += u.output; a.usage.cacheRead = (a.usage.cacheRead ?? 0) + (u.cacheRead ?? 0); a.usage.cacheWrite = (a.usage.cacheWrite ?? 0) + (u.cacheWrite ?? 0);
  a.cost += cost; a.calls += 1;
};

export const MAX_TRANSLATE_CHARS = 60_000;
export const MAX_PROOFREAD_CHARS = 40_000;

const LABEL: Record<Lang, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca" };
const CAPTIONS: Record<Lang, string> = { tr: "Tablo, Şekil, Not.", en: "Table, Figure, Note.", de: "Tabelle, Abbildung, Anmerkung." };

/** Sözlükteki iki dil arasındaki karşılıklar (ikisi de dolu olanlar) */
export function glossaryPairs(glossary: GlossaryEntry[], from: Lang, to: Lang): [string, string][] {
  return glossary.map((g) => [String(g[from] ?? "").trim(), String(g[to] ?? "").trim()] as [string, string]).filter(([a, b]) => a && b);
}

function translateSystem(o: { from: Lang; to: Lang; variant: Variant; glossary: GlossaryEntry[]; discipline?: string | null; citationStyle?: string | null }): string {
  const target = o.to === "en"
    ? `akademik İngilizce (${o.variant === "uk" ? "İngiliz İngilizcesi yazımı: analyse, behaviour, organisation" : "Amerikan İngilizcesi yazımı: analyze, behavior, organization"})`
    : o.to === "de" ? "akademik Almanca (güncel Duden yazım kuralları; wissenschaftliches Deutsch)" : "akademik Türkçe (TDK yazım kurallarına uygun)";
  const style = o.to === "en"
    ? "Kısaltma (don't vb.) ve günlük dil kullanma. Yöntem ve bulgu anlatımında geçmiş zaman kullan."
    : o.to === "de"
      ? "Nesnel ve nominal üslup; “ich” yerine edilgen ya da “in der vorliegenden Arbeit” yapıları. Günlük dil kullanma; yöntem ve bulgularda Präteritum’u tutarlı kullan; adları ve büyük harf kurallarını doğru uygula."
      : "Edilgen ve nesnel anlatımı tercih et; devrik ve konuşma diline ait yapılar kullanma.";
  // Ondalık ayırıcı: İngilizcede nokta, Türkçe ve Almancada virgül; yüzde: en “62%”, tr “%62”, de “62 %”
  const numbers = o.to === "en"
    ? "ondalık virgülü noktaya çevir (3,84 → 3.84); yüzdeleri “62%” yaz; Ort./SS → M/SD, n, p, r, t, F italik kalır; 1’den büyük olamayan değerlerde baştaki sıfırı yazma (.05)"
    : o.to === "de"
      ? "ondalık noktayı virgüle çevir (3.84 → 3,84); yüzdeleri “62 %” yaz; M/SD gösterimini koru (Ort./SS → M/SD); n, p, r, t, F italik kalır"
      : "ondalık noktayı virgüle çevir (3.84 → 3,84); “62%” → “%62”; M/SD → Ort./SS";
  const pairs = glossaryPairs(o.glossary, o.from, o.to).slice(0, 200);
  return `Sen ${o.discipline ? `${o.discipline} alanında ` : ""}uzman, hakemli dergi standartlarında çalışan bir akademik çevirmensin. Sana verilen ${LABEL[o.from]} metni ${target} diline çevir.

KURALLAR (hepsine uy):
1. Anlamı birebir koru. İçerik ekleme, çıkarma, özetleme veya yorumlama. Her cümle çevrilmiş olmalı.
2. ⟦C1⟧, ⟦F2⟧, ⟦G3⟧ gibi işaretler atıf, dipnot ve şekildir: her birini AYNEN, bir kez ve cümlede anlamca ait olduğu yere yaz. Asla çevirme, silme, birleştirme veya yeni işaret uydurma. [KAYNAK GEREKLİ] ve [VERİ GİRİLECEK] işaretlerini de çevirmeden aynen bırak.
3. Markdown yapısını koru: # başlık düzeyleri, - ve 1. listeler, | tablo | satır ve sütun sayısı, > alıntı, **kalın**, *italik*. Blok sayısı aynı kalsın.
4. Akademik üslup: nesnel, açık ve hedef dilin hakemli dergilerinde kullanılan terimlerle. ${style}
5. Sayılar ve istatistik: ${numbers}. Sayı değerlerini ASLA değiştirme.
6. Tablo ve şekil etiketlerini hedef dile çevir (${CAPTIONS[o.from]} → ${CAPTIONS[o.to]}).
7. Özel adlar, ölçek ve kuram adları: yerleşik ${LABEL[o.to]} adı biliniyorsa onu kullan; bilmiyorsan ilk geçişte özgün adı parantez içinde bırak. Kurum, kişi ve dergi adlarını çevirme.
8. ${pairs.length ? "TERİM SÖZLÜĞÜ zorunludur: sözlükteki terimleri her geçişte verilen karşılıkla çevir." : "Aynı terimi metin boyunca hep aynı karşılıkla çevir."}
${pairs.length ? `\nTERİM SÖZLÜĞÜ (${LABEL[o.from]} => ${LABEL[o.to]}):\n${pairs.map(([a, b]) => `- ${a} => ${b}`).join("\n")}\n` : ""}
ÇIKTI BİÇİMİ:
- Önce yalnızca çevrilmiş Markdown metni (açıklama, giriş cümlesi veya kod bloğu YOK).
- Girdide ⟦DİPNOTLAR⟧ bölümü varsa, çevirinin ardından ayrı bir satırda ⟦DİPNOTLAR⟧ yaz ve her dipnotu “⟦F1⟧ çeviri” biçiminde ayrı satırda ver.
- En sonda ayrı bir satırda ⟦TERİMLER⟧ yaz; metindeki en önemli en fazla 12 alan terimini “${LABEL[o.from]} terim => ${LABEL[o.to]} terim” biçiminde her satıra bir tane listele (sözlükte zaten olanları yazma).`;
}

export interface TranslateResult { md: string; footnotes: string[]; terms: GlossaryEntry[]; spend: AiSpend }

/** Markdown (işaretli) ve dipnotları çevirir; parçalar sırayla çevrilir, terim tutarlılığı için sözlük her parçaya verilir */
export async function translateTokenized(o: { planId: string; md: string; footnotes: string[]; from: Lang; to: Lang; variant: Variant; glossary: GlossaryEntry[]; discipline?: string | null }): Promise<TranslateResult> {
  const model = await resolveModel(o.planId, "balanced");
  const system = translateSystem(o);
  const spend: AiSpend = { usage: { input: 0, output: 0 }, cost: 0, model: model.model, provider: model.provider, calls: 0 };
  const outParts: string[] = [];
  const fnOut: string[] = new Array(o.footnotes.length).fill("");
  const terms = new Map<string, string>();
  for (const chunk of splitChunks(o.md, 6000)) {
    const fnIdx = tokensIn(chunk).filter((k) => k.startsWith("F")).map((k) => Number(k.slice(1)));
    const fnBlock = fnIdx.length ? `\n\n⟦DİPNOTLAR⟧\n${fnIdx.map((i) => `⟦F${i}⟧ ${o.footnotes[i - 1] ?? ""}`).join("\n")}` : "";
    const res = await complete(model, { system, messages: [{ role: "user", content: `${chunk}${fnBlock}` }], maxTokens: Math.min(16000, Math.ceil(chunk.length / 2) + 1500), effort: "low" });
    add(spend, res.usage, await estimateCost(res.model, res.usage.input, res.usage.output, res.usage));
    let text = res.text.replace(/^```[a-z]*\n?|```\s*$/gim, "").trim();
    const termAt = text.indexOf("⟦TERİMLER⟧");
    if (termAt >= 0) {
      for (const line of text.slice(termAt + "⟦TERİMLER⟧".length).split("\n")) {
        const m = line.replace(/^[-*\s]+/, "").match(/^(.+?)\s*=>\s*(.+)$/);
        if (m && m[1].length <= 80 && m[2].length <= 80) terms.set(m[1].trim(), m[2].trim());
      }
      text = text.slice(0, termAt).trim();
    }
    const fnAt = text.indexOf("⟦DİPNOTLAR⟧");
    if (fnAt >= 0) {
      for (const line of text.slice(fnAt + "⟦DİPNOTLAR⟧".length).split("\n")) {
        const m = line.trim().match(/^⟦F(\d+)⟧\s*(.*)$/);
        if (m && Number(m[1]) <= fnOut.length) fnOut[Number(m[1]) - 1] = m[2].trim();
      }
      text = text.slice(0, fnAt).trim();
    }
    if (!text) throw await spentError("Çeviri alınamadı, lütfen tekrar deneyin", { usage: spend.usage, model: spend.model }, spend.provider, "translate");
    outParts.push(text);
  }
  // Önerilen terimler: kaynak ve hedef dil sütunları dolu yeni sözlük satırları (kaynak terim sözlükte varsa atlanır)
  const have = new Set(o.glossary.map((g) => String(g[o.from] ?? "").toLocaleLowerCase(o.from)).filter(Boolean));
  const termList: GlossaryEntry[] = [...terms]
    .filter(([src]) => !have.has(src.toLocaleLowerCase(o.from)))
    .map(([src, tgt]) => ({ tr: "", en: "", ...{ [o.from]: src, [o.to]: tgt } }) as GlossaryEntry).slice(0, 12);
  return { md: outParts.join("\n\n"), footnotes: fnOut, terms: termList, spend };
}

export type IssueCategory = "spelling" | "grammar" | "punctuation" | "style" | "consistency" | "clarity";
export interface Issue { block: number; original: string; suggestion: string; category: IssueCategory; reason: string }

const ISSUE_SCHEMA = {
  type: "object", additionalProperties: false, required: ["issues"],
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["block", "original", "suggestion", "category", "reason"],
        properties: {
          block: { type: "integer" }, original: { type: "string" }, suggestion: { type: "string" },
          category: { type: "string", enum: ["spelling", "grammar", "punctuation", "style", "consistency", "clarity"] }, reason: { type: "string" },
        },
      },
    },
  },
};

/** Dil denetimi: her öneri bloktaki birebir bir parçaya bağlanır; doğrulanamayan öneriler atılır */
export async function proofread(o: { planId: string; blocks: string[]; lang: Lang; variant: Variant; glossary: GlossaryEntry[] }): Promise<{ issues: Issue[]; spend: AiSpend }> {
  const model = await resolveModel(o.planId, "balanced");
  const spend: AiSpend = { usage: { input: 0, output: 0 }, cost: 0, model: model.model, provider: model.provider, calls: 0 };
  const rules = o.lang === "de"
    ? `Almanca akademik metin (güncel Duden kuralları). Denetle: yazım (ß/ss, birleşik ve ayrı yazım), ad ve adlaşmış sözcüklerde büyük harf, virgül kuralları (yan cümle, mastar grupları), çekim ve uyum (Kasus, artikel, sıfat çekimi), fiil konumu, akademik olmayan ifadeler ve “ich”-dili tutarsızlığı, İngilizceden/Türkçeden aktarma yapılar, aşırı uzun ve iç içe cümleler.`
    : o.lang === "en"
    ? `İngilizce akademik metin (${o.variant === "uk" ? "İngiliz" : "Amerikan"} İngilizcesi yazımı). Denetle: yazım, özne-yüklem uyumu, article (a/an/the), zaman tutarlılığı (yöntem ve bulgular geçmiş zaman), edat kullanımı, noktalama, kısaltma ve günlük dil (don't, a lot of, get), belirsiz zamirler, Türkçeden aktarma kaynaklı yapılar (ör. “according to the results of the analysis made”), aşırı uzun cümleler.`
    : `Türkçe akademik metin. Denetle: TDK yazımı (bağlaç “de/da” ve “ki”nin ayrı/bitişik yazımı, soru eki “mi”, kesme işareti, büyük harf, birleşik kelimeler, “-dır/-tır” ünsüz benzeşmesi), noktalama, özne-yüklem uyumu, anlatım bozuklukları (gereksiz sözcük, eksik öge, çatı uyuşmazlığı), akademik olmayan veya öznel ifadeler, “ben/biz” dili tutarsızlığı, aşırı uzun cümleler.`;
  // Denetlenen dildeki sapmalar için: o dildeki terimin diğer dillerdeki karşılığıyla eşleşmesi
  const other: Lang = o.lang === "tr" ? "en" : "tr";
  const gloss = glossaryPairs(o.glossary, other, o.lang).slice(0, 150).map(([a, b]) => ({ src: a, tgt: b }));
  const system = `Sen titiz bir akademik editörsün. ${rules}
KURALLAR:
- Yalnızca gerçek hataları ve açık üslup sorunlarını bildir; zevke bağlı değişiklik önerme. Anlamı ve içeriği değiştirme, bilgi ekleme.
- “original” alanı, bloğun metninde BİREBİR geçen en kısa parça olsun (büyük-küçük harf ve noktalama dahil); ⟦C⟧ işaretini içermesin. “suggestion” onun yerine geçecek düzeltilmiş parça.
- “block” bloğun numarası (verilen [0], [1] … numarası). “reason” kısa ve Türkçe olsun (en fazla 15 kelime).
- Kategoriler: spelling (yazım), grammar (dil bilgisi), punctuation (noktalama), style (akademik üslup), consistency (terim tutarlılığı), clarity (anlam açıklığı / uzun cümle).
${gloss.length ? `- Terim sözlüğündeki karşılıklardan sapmaları “consistency” olarak bildir:\n${gloss.map((g) => `  ${g.src} => ${g.tgt}`).join("\n")}` : ""}
- En fazla 80 öneri. Hata yoksa boş liste döndür.`;
  const issues: Issue[] = [];
  // Bloklar ~12.000 karakterlik gruplar hâlinde denetlenir (numaralar genel sıradır)
  let start = 0;
  while (start < o.blocks.length) {
    let end = start, size = 0;
    while (end < o.blocks.length && (end === start || size + o.blocks[end].length < 12_000)) { size += o.blocks[end].length; end++; }
    const user = o.blocks.slice(start, end).map((b, i) => `[${start + i}] ${b}`).join("\n\n");
    const res = await complete(model, { system, messages: [{ role: "user", content: user }], maxTokens: 6000, effort: "low", jsonSchema: ISSUE_SCHEMA });
    add(spend, res.usage, await estimateCost(res.model, res.usage.input, res.usage.output, res.usage));
    let parsed: { issues: Issue[] };
    try { parsed = JSON.parse(res.text); } catch { throw await spentError("Dil denetimi yanıtı okunamadı, lütfen tekrar deneyin", { usage: spend.usage, model: spend.model }, spend.provider, "proofread"); }
    for (const it of parsed.issues ?? []) {
      const b = o.blocks[it.block];
      if (!b || !it.original || it.original === it.suggestion || it.original.includes("⟦") || it.suggestion.includes("⟦") || !b.includes(it.original)) continue;
      if (it.original.length > 400) continue;
      issues.push({ block: it.block, original: it.original, suggestion: it.suggestion, category: it.category, reason: String(it.reason ?? "").slice(0, 160) });
    }
    start = end;
  }
  return { issues: issues.slice(0, 120), spend };
}
