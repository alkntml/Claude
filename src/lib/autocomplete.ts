import "server-only";
/**
 * Satır içi otomatik tamamlama (D113): öğrenci yazarken paragrafın devamı için en fazla bir cümlelik öneri.
 * Öneri kaynak gerektiren hiçbir şey içermez (sayı, yıl, ad, atıf, istatistik); yalnızca öğrencinin kendi düşüncesini
 * akademik dille sürdürür. Aylık yapay zekâ hakkından düşmez (ayrı kullanım türü: autocomplete), maliyeti maliyet
 * tavanına eklenir; günlük sınır pakete göredir.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";

export const AUTOCOMPLETE_DAILY: Record<string, number> = { free: 30, basic: 150, pro: 300, premium: 500, single: 500 };

/** Öneriyi güvenli hâle getirir: kaynak gerektiren içerik veya biçim bozukluğu varsa boş döner */
export function sanitizeSuggestion(raw: string, before: string): string {
  let s = raw.replace(/\s+/g, " ").replace(/^["“”'`]+|["“”'`]+$/g, "").trim();
  if (!s) return "";
  // Kaynak gerektirebilecek içerik: rakam, yıl, atıf işareti, yüzde, parantez içi yazar-yıl
  if (/\d|\[\[|\(|%|https?:|www\./.test(s)) return "";
  // En fazla bir cümle ve 220 karakter
  const end = s.search(/[.!?](\s|$)/);
  if (end >= 0) s = s.slice(0, end + 1);
  if (s.length > 220) s = `${s.slice(0, 220).replace(/\s+\S*$/, "")}`;
  // Önceki metnin sonu boşluk değilse ve öneri noktalama ile başlamıyorsa başına boşluk
  const needsSpace = before.length > 0 && !/\s$/.test(before) && !/^[,.;:!?)]/.test(s);
  return needsSpace ? ` ${s}` : s;
}

export async function suggestContinuation(o: { planId: string; before: string; stageTitle: string; focusTitle?: string | null; projectTitle: string; lang: "tr" | "en" }) {
  const model = await resolveModel(o.planId, "fast");
  const L = o.lang === "en";
  const system = `Sen akademik yazımda öğrencinin cümlesini tamamlayan bir yazım yardımcısısın. Verilen metnin hemen devamını yaz.
KURALLAR:
- En fazla BİR cümle (en fazla 25 kelime). Metin cümle ortasında bitiyorsa yalnızca o cümleyi tamamla.
- ${L ? "İngilizce" : "Türkçe"}, akademik, nesnel ve metnin üslubuyla uyumlu yaz.
- Kaynak gerektiren hiçbir şey yazma: sayı, yüzde, yıl, kişi veya kurum adı, istatistik, araştırma bulgusu, atıf YOK. Öğrencinin kendi argümanını, geçiş ifadesini veya yöntem anlatımını sürdür.
- Yalnızca devam metnini yaz; tırnak, açıklama veya önceki metni tekrar etme. Uygun bir devam yoksa boş yanıt ver.`;
  const user = `ÇALIŞMA: ${o.projectTitle}\nBÖLÜM: ${o.stageTitle}${o.focusTitle ? ` › ${o.focusTitle}` : ""}\n\nMETİN:\n${o.before.slice(-1500)}`;
  const res = await complete(model, { system, messages: [{ role: "user", content: user }], maxTokens: 80, effort: "low" });
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { text: sanitizeSuggestion(res.text, o.before), usage: res.usage, cost, model: res.model, provider: model.provider };
}
