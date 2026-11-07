import "server-only";
/**
 * Akademik çeviri ve dil denetimi (D111).
 * - Çeviri: Türkçe ↔ İngilizce, akademik üslup; atıf/dipnot/şekil işaretleri (⟦C1⟧, ⟦F1⟧, ⟦G1⟧) korunur, içerik eklenmez
 *   veya özetlenmez; projenin terim sözlüğü zorunlu karşılık olarak uygulanır; istatistik gösterimi ve ondalık ayırıcı
 *   hedef dile çevrilir. Uzun metin bloklar bölünmeden parçalara ayrılır.
 * - Dil denetimi: yazım, dil bilgisi, noktalama, akademik üslup ve terim tutarlılığı önerileri; her öneri metinde birebir
 *   geçen bir parçaya bağlıdır, böylece tek tek uygulanabilir.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { splitChunks, tokensIn } from "@/lib/editor/translate-doc";

export type Lang = "tr" | "en";
export type Variant = "us" | "uk";
export interface GlossaryEntry { tr: string; en: string }
type Usage = { input: number; output: number; cacheRead?: number; cacheWrite?: number };
export interface AiSpend { usage: Usage; cost: number; model: string; provider: string; calls: number }

const add = (a: AiSpend, u: Usage, cost: number) => {
  a.usage.input += u.input; a.usage.output += u.output; a.usage.cacheRead = (a.usage.cacheRead ?? 0) + (u.cacheRead ?? 0); a.usage.cacheWrite = (a.usage.cacheWrite ?? 0) + (u.cacheWrite ?? 0);
  a.cost += cost; a.calls += 1;
};

export const MAX_TRANSLATE_CHARS = 60_000;
export const MAX_PROOFREAD_CHARS = 40_000;

function translateSystem(o: { from: Lang; to: Lang; variant: Variant; glossary: GlossaryEntry[]; discipline?: string | null; citationStyle?: string | null }): string {
  const target = o.to === "en" ? `akademik İngilizce (${o.variant === "uk" ? "İngiliz İngilizcesi yazımı: analyse, behaviour, organisation" : "Amerikan İngilizcesi yazımı: analyze, behavior, organization"})` : "akademik Türkçe (TDK yazım kurallarına uygun)";
  const gloss = o.glossary.filter((g) => g.tr.trim() && g.en.trim()).slice(0, 200);
  return `Sen ${o.discipline ? `${o.discipline} alanında ` : ""}uzman, hakemli dergi standartlarında çalışan bir akademik çevirmensin. Sana verilen ${o.from === "tr" ? "Türkçe" : "İngilizce"} metni ${target} diline çevir.

KURALLAR (hepsine uy):
1. Anlamı birebir koru. İçerik ekleme, çıkarma, özetleme veya yorumlama. Her cümle çevrilmiş olmalı.
2. ⟦C1⟧, ⟦F2⟧, ⟦G3⟧ gibi işaretler atıf, dipnot ve şekildir: her birini AYNEN, bir kez ve cümlede anlamca ait olduğu yere yaz. Asla çevirme, silme, birleştirme veya yeni işaret uydurma.
3. Markdown yapısını koru: # başlık düzeyleri, - ve 1. listeler, | tablo | satır ve sütun sayısı, > alıntı, **kalın**, *italik*. Blok sayısı aynı kalsın.
4. Akademik üslup: nesnel, açık ve hedef dilin hakemli dergilerinde kullanılan terimlerle. ${o.to === "en" ? "Kısaltma (don't vb.) ve günlük dil kullanma. Yöntem ve bulgu anlatımında geçmiş zaman kullan." : "Edilgen ve nesnel anlatımı tercih et; devrik ve konuşma diline ait yapılar kullanma."}
5. Sayılar ve istatistik: ${o.to === "en" ? "ondalık virgülü noktaya çevir (3,84 → 3.84); yüzdeleri “%62” → “62%” yaz; Ort./SS → M/SD, n, p, r, t, F italik kalır; 1’den büyük olamayan değerlerde baştaki sıfırı yazma (.05)" : "ondalık noktayı virgüle çevir (3.84 → 3,84); “62%” → “%62”; M/SD → Ort./SS"}. Sayı değerlerini ASLA değiştirme.
6. Tablo ve şekil etiketleri: ${o.to === "en" ? "Tablo → Table, Şekil → Figure, Not. → Note." : "Table → Tablo, Figure → Şekil, Note. → Not."}
7. Özel adlar, ölçek ve kuram adları: yerleşik ${o.to === "en" ? "İngilizce" : "Türkçe"} adı biliniyorsa onu kullan; bilmiyorsan ilk geçişte özgün adı parantez içinde bırak. Kurum, kişi ve dergi adlarını çevirme.
8. ${gloss.length ? "TERİM SÖZLÜĞÜ zorunludur: sözlükteki terimleri her geçişte verilen karşılıkla çevir." : "Aynı terimi metin boyunca hep aynı karşılıkla çevir."}
${gloss.length ? `\nTERİM SÖZLÜĞÜ (Türkçe => İngilizce):\n${gloss.map((g) => `- ${g.tr} => ${g.en}`).join("\n")}\n` : ""}
ÇIKTI BİÇİMİ:
- Önce yalnızca çevrilmiş Markdown metni (açıklama, giriş cümlesi veya kod bloğu YOK).
- Girdide ⟦DİPNOTLAR⟧ bölümü varsa, çevirinin ardından ayrı bir satırda ⟦DİPNOTLAR⟧ yaz ve her dipnotu “⟦F1⟧ çeviri” biçiminde ayrı satırda ver.
- En sonda ayrı bir satırda ⟦TERİMLER⟧ yaz; metindeki en önemli en fazla 12 alan terimini “Türkçe terim => İngilizce terim” biçiminde her satıra bir tane listele (sözlükte zaten olanları yazma).`;
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
  const have = new Set(o.glossary.map((g) => g.tr.toLocaleLowerCase("tr")));
  const termList = [...terms].map(([tr, en]) => (o.from === "tr" ? { tr, en } : { tr: en, en: tr }))
    .filter((g) => !have.has(g.tr.toLocaleLowerCase("tr"))).slice(0, 12);
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
  const rules = o.lang === "en"
    ? `İngilizce akademik metin (${o.variant === "uk" ? "İngiliz" : "Amerikan"} İngilizcesi yazımı). Denetle: yazım, özne-yüklem uyumu, article (a/an/the), zaman tutarlılığı (yöntem ve bulgular geçmiş zaman), edat kullanımı, noktalama, kısaltma ve günlük dil (don't, a lot of, get), belirsiz zamirler, Türkçeden aktarma kaynaklı yapılar (ör. “according to the results of the analysis made”), aşırı uzun cümleler.`
    : `Türkçe akademik metin. Denetle: TDK yazımı (bağlaç “de/da” ve “ki”nin ayrı/bitişik yazımı, soru eki “mi”, kesme işareti, büyük harf, birleşik kelimeler, “-dır/-tır” ünsüz benzeşmesi), noktalama, özne-yüklem uyumu, anlatım bozuklukları (gereksiz sözcük, eksik öge, çatı uyuşmazlığı), akademik olmayan veya öznel ifadeler, “ben/biz” dili tutarsızlığı, aşırı uzun cümleler.`;
  const gloss = o.glossary.filter((g) => g.tr && g.en).slice(0, 150);
  const system = `Sen titiz bir akademik editörsün. ${rules}
KURALLAR:
- Yalnızca gerçek hataları ve açık üslup sorunlarını bildir; zevke bağlı değişiklik önerme. Anlamı ve içeriği değiştirme, bilgi ekleme.
- “original” alanı, bloğun metninde BİREBİR geçen en kısa parça olsun (büyük-küçük harf ve noktalama dahil); ⟦C⟧ işaretini içermesin. “suggestion” onun yerine geçecek düzeltilmiş parça.
- “block” bloğun numarası (verilen [0], [1] … numarası). “reason” kısa ve Türkçe olsun (en fazla 15 kelime).
- Kategoriler: spelling (yazım), grammar (dil bilgisi), punctuation (noktalama), style (akademik üslup), consistency (terim tutarlılığı), clarity (anlam açıklığı / uzun cümle).
${gloss.length ? `- Terim sözlüğündeki karşılıklardan sapmaları “consistency” olarak bildir:\n${gloss.map((g) => `  ${g.tr} => ${g.en}`).join("\n")}` : ""}
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
