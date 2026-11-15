/**
 * D207: Kaynak okuyucudan (PDF veya tam metin) seçilen metni atıflı alıntıya çevirir. Saf modül (testlenir).
 * - Seçim temizlenir: satır sonu tirelemesi birleştirilir, boşluklar sadeleşir, baştaki/sondaki tırnaklar atılır.
 *   Kelimeler değiştirilmez (alıntı birebir kalır); Markdown’a çevrilmeden doğrudan editör düğümü olarak kurulur.
 * - Sayfa: seçimin başladığı ve bittiği sayfanın yayındaki numarası (“12” veya “12–13”); bilinmiyorsa boş.
 * - Kısa alıntı (< 40 kelime): “metin” (atıf). — nokta atıftan sonra (APA 7, 8.25)
 * - Uzun alıntı (≥ 40 kelime): blok alıntı, tırnaksız; nokta metnin sonunda, atıf ondan sonra (APA 7, 8.27)
 * Atıf editördeki canlı atıf düğümüdür; biçimi çalışmanın atıf stiline göre yazılır.
 */
import type { JSONNode } from "@/lib/editor/doc";

export const BLOCK_QUOTE_WORDS = 40;

/** PDF/metinden kopyalanan seçimi okunur tek parça metne çevirir */
export function cleanSelection(raw: string): string {
  return String(raw ?? "")
    .replace(/­/g, "") // yumuşak tire
    .replace(/(\p{L})-[ \t]*\r?\n\s*(\p{Ll})/gu, "$1$2") // satır sonunda bölünmüş kelime
    .replace(/[​﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["“”„«»'‘’]+|["“”„«»'‘’]+$/g, "")
    .trim();
}

export const wordCount = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** "s. 12" / "12" / null → "12"; geçersizse null */
export function pageNumberOf(hint: string | null | undefined): string | null {
  const m = String(hint ?? "").match(/(\d+[a-z]?)/i);
  return m ? m[1] : null;
}

/** Başlangıç ve bitiş sayfasından atıf konumu: "12", "12–13" veya null (atıf düğümünde “s.” öneki stil tarafından eklenir) */
export function pageLocator(start: string | null | undefined, end?: string | null): string | null {
  const a = pageNumberOf(start), b = pageNumberOf(end ?? start);
  if (!a && !b) return null;
  if (!a || !b || a === b) return a ?? b;
  return Number(a) <= Number(b) ? `${a}–${b}` : `${b}–${a}`;
}

export type QuoteKind = "quote" | "cite";

/**
 * Editöre eklenecek düğümler. `quote`: doğrudan alıntı + sayfalı atıf; `cite`: yalnızca sayfalı atıf (kullanıcı kendi
 * cümlesiyle yazar). `block` true ise düğüm bir blok alıntıdır (imlecin bulunduğu yere blok olarak eklenir).
 */
export function buildQuoteNodes(o: { text: string; locator: string | null; kind: QuoteKind; sourceId: string }): { nodes: JSONNode[]; block: boolean; words: number; text: string } {
  const citation: JSONNode = { type: "citation", attrs: { ids: [o.sourceId], locator: o.locator, narrative: false } };
  const text = cleanSelection(o.text);
  const words = wordCount(text);
  if (o.kind === "cite" || !text) return { nodes: [{ type: "text", text: " " }, citation], block: false, words, text };
  if (words >= BLOCK_QUOTE_WORDS) {
    const body = /[.!?…]$/.test(text) ? text : `${text}.`;
    return { nodes: [{ type: "blockquote", content: [{ type: "paragraph", content: [{ type: "text", text: `${body} ` }, citation] }] }], block: true, words, text };
  }
  const end = text.match(/[.!?…]+$/)?.[0] ?? "";
  const core = end === "." ? text.slice(0, -1) : text; // soru/ünlem işareti tırnağın içinde kalır
  return { nodes: [{ type: "text", text: `“${core}” ` }, citation, { type: "text", text: ". " }], block: false, words, text };
}
