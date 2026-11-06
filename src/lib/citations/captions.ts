/**
 * Tablo ve şekil başlıkları (D106): her atıf stilinin kuralına göre etiket, numara, başlık biçimi ve konum.
 * Editöre eklenirken o anki stile göre yazılır; dışa aktarma (Word, PDF, metin) ve danışman görünümü ise başlıkları
 * yeniden çözümleyip projenin GÜNCEL stiline göre biçimlendirir — stil sonradan değişse de çıktı doğru olur.
 *
 * Kaynak kurallar (özet):
 * - APA 7: tablo ve şekil başlığı ÜSTTE; numara kalın (Tablo 1), başlık bir alt satırda italik. Not: “Not.” italik.
 * - APA 6: tablo üstte (Tablo 1 düz, başlık alt satırda italik); şekil ALTTA, “Şekil 1.” italik + başlık düz.
 * - Chicago / Turabian: tablo üstte “Tablo 1. Başlık”; şekil altta “Şekil 1. Başlık”. Not: “Not:”.
 * - MLA 9: tablo üstte, numara ve başlık ayrı satırlarda; şekil altta “Şekil 1.” (İngilizcede “Fig. 1.”).
 * - IEEE: tablo üstte, ortalı, Roma rakamı (TABLO I) ve başlık büyük harfle alt satırda; şekil altta, ortalı “Şekil 1.” (Fig. 1.).
 * - Vancouver / AMA 11: tablo üstte “Tablo 1. Başlık” (AMA’da numara kalın); şekil altta.
 * - Harvard ve ISNAD 2 başlık biçimini kesin olarak belirlemez; yaygın uygulama: tablo üstte, şekil altta.
 *   Enstitü veya dergi kılavuzu her zaman önceliklidir.
 */
import type { CitationStyleId } from "./types";

export type CaptionKind = "table" | "figure";
export interface CaptionRun { text: string; bold?: boolean; italic?: boolean }
export interface CaptionFormat { position: "above" | "below"; align: "left" | "center"; lines: CaptionRun[][] }
type Lang = "tr" | "en";

const ABOVE_FIGURE = new Set<string>(["apa7"]);

export function toRoman(n: number): string {
  const map: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "", x = Math.max(1, Math.floor(n));
  for (const [v, s] of map) while (x >= v) { out += s; x -= v; }
  return out;
}

export function fromRoman(s: string): number {
  const v: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const a = v[s[i]] ?? 0, b = v[s[i + 1]] ?? 0;
    total += a < b ? -a : a;
  }
  return total;
}

const up = (s: string, lang: Lang) => s.toLocaleUpperCase(lang === "tr" ? "tr" : "en");

/** Metin içinde tabloya/şekle gönderme: “Tablo 1”, IEEE’de “Tablo I”, MLA/IEEE İngilizcede “Fig. 1” */
export function captionRef(style: CitationStyleId | string, kind: CaptionKind, no: number, lang: Lang): string {
  if (kind === "table") return `${lang === "tr" ? "Tablo" : "Table"} ${style === "ieee" ? toRoman(no) : no}`;
  return `${lang === "tr" ? "Şekil" : style === "mla" || style === "ieee" ? "Fig." : "Figure"} ${no}`;
}

/** Stile göre başlığın konumu, hizası ve satırları */
export function formatCaption(style: CitationStyleId | string, kind: CaptionKind, no: number, title: string, lang: Lang): CaptionFormat {
  const t = title.trim();
  const label = captionRef(style, kind, no, lang);
  const position: CaptionFormat["position"] = kind === "table" || ABOVE_FIGURE.has(style) ? "above" : "below";
  const one = (head: CaptionRun, sep = " "): CaptionRun[][] => [[head, ...(t ? [{ text: `${sep}${t}` }] : [])]];
  switch (style) {
    case "apa7":
      return { position, align: "left", lines: [[{ text: label, bold: true }], ...(t ? [[{ text: t, italic: true }]] : [])] };
    case "apa6":
      return kind === "table"
        ? { position, align: "left", lines: [[{ text: label }], ...(t ? [[{ text: t, italic: true }]] : [])] }
        : { position, align: "left", lines: one({ text: `${label}.`, italic: true }) };
    case "mla":
      return kind === "table"
        ? { position, align: "left", lines: [[{ text: label }], ...(t ? [[{ text: t }]] : [])] }
        : { position, align: "left", lines: one({ text: `${label}.` }) };
    case "ieee":
      return kind === "table"
        ? { position, align: "center", lines: [[{ text: up(label, lang) }], ...(t ? [[{ text: up(t, lang) }]] : [])] }
        : { position, align: "center", lines: one({ text: `${label}.` }) };
    case "ama":
      return { position, align: "left", lines: one({ text: `${label}.`, bold: true }) };
    case "harvard":
      return { position, align: "left", lines: one({ text: `${label}:` }) };
    default: // chicago, turabian, vancouver, isnad
      return { position, align: "left", lines: one({ text: `${label}.` }) };
  }
}

/** Tablo/şekil notunun etiketi: APA’da “Not.” (italik), diğerlerinde “Not:” */
export function noteLabel(style: CitationStyleId | string, lang: Lang): CaptionRun {
  return style === "apa7" || style === "apa6" ? { text: lang === "tr" ? "Not." : "Note.", italic: true } : { text: lang === "tr" ? "Not:" : "Note:" };
}

export interface ParsedCaption { kind: CaptionKind; no: number; title: string; labelOnly: boolean }

// “Tablo 1. Başlık”, “Tablo 1: Başlık”, “Tablo 1” (APA 7 etiket satırı), “TABLO I”, “Şekil 2.”, “Fig. 3.”
// Etiketten sonra yalnızca nokta/iki nokta veya satır sonu gelebilir: “Tablo 1’de görüldüğü gibi” başlık sayılmaz.
const CAPTION_RE = /^\s*(Tablo|Table|TABLO|TABLE|Şekil|ŞEKİL|Figure|FIGURE|Fig\.|FIG\.)\s+(\d{1,3}|[IVXLC]{1,7})\s*(?:([.:])\s*(.*)|)$/s;

export function parseCaption(text: string): ParsedCaption | null {
  const m = text.replace(/\s+/g, " ").trim().match(CAPTION_RE);
  if (!m) return null;
  const kind: CaptionKind = /^(Tablo|Table|TABLO|TABLE)$/.test(m[1]) ? "table" : "figure";
  const no = /^\d+$/.test(m[2]) ? Number(m[2]) : fromRoman(m[2]);
  if (!no) return null;
  const title = (m[4] ?? "").trim();
  if (title.length > 400) return null;
  return { kind, no, title, labelOnly: !m[3] && !title };
}

/** Metindeki en büyük tablo/şekil numarası (sonraki numarayı bulmak için; her satır ayrı denetlenir) */
export function maxCaptionNo(text: string, kind: CaptionKind): number {
  let max = 0;
  for (const line of String(text ?? "").split(/\n+/)) {
    const c = parseCaption(line);
    if (c && c.kind === kind) max = Math.max(max, c.no);
  }
  return max;
}

/** Notun başlangıcı: “Not.”, “Not:”, “Note.”, “Note:” → etiket ve kalan metin */
export function parseNote(text: string): string | null {
  const m = text.trim().match(/^(Not|Note)\s*[.:]\s*(.*)$/s);
  return m ? m[2] : null;
}

/** Editöre eklenecek TipTap paragrafları (o anki stile göre) */
export function captionNodes(fmt: CaptionFormat): { type: "paragraph"; content: { type: "text"; text: string; marks?: { type: string }[] }[] }[] {
  return fmt.lines.map((line) => ({
    type: "paragraph" as const,
    content: line.filter((r) => r.text).map((r) => ({ type: "text" as const, text: r.text, ...(r.bold || r.italic ? { marks: [...(r.bold ? [{ type: "bold" }] : []), ...(r.italic ? [{ type: "italic" }] : [])] } : {}) })),
  }));
}

/** Markdown satırları (istatistik tablosunu belgeye eklerken; **kalın**, *italik*) */
export function captionMarkdown(fmt: CaptionFormat): string {
  return fmt.lines.map((line) => line.map((r) => (r.bold ? `**${r.text}**` : r.italic ? `*${r.text}*` : r.text)).join("")).join("\n\n");
}
