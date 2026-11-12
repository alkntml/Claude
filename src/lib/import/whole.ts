/**
 * Tüm çalışmayı içe aktarma (D149): belge, en üst düzey başlıklarına göre bölümlere (aşamalara) ayrılır.
 * Saf modül (test edilir). Word belgesi html-doc ile düğümlere çevrilir; PDF/TXT için metinden düğüm üretilir.
 */
import type { JSONNode } from "@/lib/editor/doc";
import { STAGE_LIBRARY } from "@/lib/workflows/stages";
import { fold } from "./references";

export interface ImportedSection { title: string; nodes: JSONNode[]; libraryKey: string | null }

const plain = (n: JSONNode): string => (n.text ?? "") + (n.content ?? []).map(plain).join("");
const words = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;

/**
 * En üst başlık düzeyine göre bölümler. Belge başlığı (tek H1 ve altında başka H1 yoksa) atılır ve ayrıca döner.
 * İlk başlıktan önceki metin (özet, ön söz vb.) 40 kelimeyi aşıyorsa “Ön metin” bölümü olur.
 */
export function splitIntoSections(nodes: JSONNode[], opts: { preambleTitle?: string } = {}): { docTitle: string | null; sections: ImportedSection[] } {
  let list = nodes.filter((n) => n.type !== "heading" || plain(n).trim());
  let docTitle: string | null = null;
  const h = list.filter((n) => n.type === "heading");
  // Belge başlığı: ilk başlık en üst düzeyde ve o düzeyde tek başına ise
  if (h.length > 1) {
    const lv = (n: JSONNode) => Number(n.attrs?.level ?? 1);
    const first = h[0];
    if (h.filter((x) => lv(x) === lv(first)).length === 1 && h.slice(1).every((x) => lv(x) > lv(first))) {
      docTitle = plain(first).trim();
      list = list.filter((n) => n !== first);
    }
  }
  const heads = list.filter((n) => n.type === "heading");
  if (!heads.length) return { docTitle, sections: list.some((n) => plain(n).trim()) ? [{ title: opts.preambleTitle ?? "Metin", nodes: list, libraryKey: null }] : [] };
  const top = Math.min(...heads.map((n) => Number(n.attrs?.level ?? 1)));
  const sections: ImportedSection[] = [];
  let cur: ImportedSection | null = null;
  const pre: JSONNode[] = [];
  for (const n of list) {
    if (n.type === "heading" && Number(n.attrs?.level ?? 1) === top) {
      const title = plain(n).replace(/^\s*(?:\d+(?:\.\d+)*\.?|[IVX]+\.|BÖLÜM\s+\d+[:.]?|CHAPTER\s+\d+[:.]?)\s*/i, "").trim();
      cur = { title: title || plain(n).trim(), nodes: [], libraryKey: libraryKeyFor(title) };
      sections.push(cur);
    } else if (cur) cur.nodes.push(n);
    else pre.push(n);
  }
  if (words(pre.map(plain).join(" ")) > 40) sections.unshift({ title: opts.preambleTitle ?? "Ön metin", nodes: pre, libraryKey: null });
  return { docTitle, sections };
}

/** Yaygın bölüm adları (TR/EN/DE) → aşama anahtarı */
const ALIASES: [RegExp, string][] = [
  [/^(giris|introduction|einleitung)$/, "introduction"],
  [/^(ozet|abstract|ozet ve abstract|zusammenfassung)$/, "title_abstract"],
  [/^(kavramsal cerceve|kuramsal cerceve|theoretical framework|conceptual framework|theoretischer rahmen)$/, "theory"],
  [/^(literatur|literatur taramasi|ilgili arastirmalar|literature review|related work|forschungsstand)$/, "literature"],
  [/^(yontem|yontemler|method|methods|methodology|materials and methods|methode|methodik)$/, "method"],
  [/^(bulgular|findings|results|ergebnisse)$/, "findings"],
  [/^(tartisma|discussion|diskussion)$/, "discussion"],
  [/^(sonuc|sonuclar|sonuc ve oneriler|conclusion|conclusions|fazit|schlussfolgerung)$/, "conclusion"],
  [/^(ekler|appendix|appendices|anhang)$/, "appendices"],
];

/** Bölüm başlığını kütüphanedeki aşama anahtarına eşler (ör. “Bulgular” → findings); emin değilse null */
export function libraryKeyFor(title: string): string | null {
  const f = fold(title);
  if (!f) return null;
  for (const [re, key] of ALIASES) if (re.test(f) && STAGE_LIBRARY[key]) return key;
  for (const [key, def] of Object.entries(STAGE_LIBRARY)) {
    const d = def as { title?: string };
    if (d.title && fold(d.title) === f) return key;
  }
  return null;
}

const HEADING_LINE = /^(?:\d+(?:\.\d+){0,3}\.?\s+\S|[IVX]+\.\s+\S|BÖLÜM\s+\d+|CHAPTER\s+\d+)/i;

/**
 * Düz metinden (PDF/TXT) düğüm: boş satırla ayrılan bloklar paragraf olur; kısa, numaralı veya tamamı büyük harf
 * satırlar başlık sayılır (numara derinliği düzeyi belirler). Sayfa sonu tireleri pdf-clean’de temizlenmiştir.
 */
export function textToNodes(text: string): JSONNode[] {
  const out: JSONNode[] = [];
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/);
  for (const b of blocks) {
    const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    // Bloğun ilk satırı başlık olabilir
    const first = lines[0];
    const isHeading = first.length <= 110 && !/[.:;,]$/.test(first) && (HEADING_LINE.test(first) || (first === first.toLocaleUpperCase("tr") && /\p{L}{3}/u.test(first) && words(first) <= 12));
    let rest = lines;
    if (isHeading) {
      const m = first.match(/^(\d+(?:\.\d+){0,3})\.?\s/);
      const level = m ? Math.min(4, m[1].split(".").length) : 1;
      out.push({ type: "heading", attrs: { level }, content: [{ type: "text", text: first }] });
      rest = lines.slice(1);
    }
    if (rest.length) {
      const para = rest.join(" ").replace(/\s+/g, " ").trim();
      if (para) out.push({ type: "paragraph", content: [{ type: "text", text: para }] });
    }
  }
  return out;
}

/** Düğümlerin düz metni ve kelime sayısı (aşama kaydı için) */
export function sectionText(nodes: JSONNode[]): { text: string; words: number } {
  const text = nodes.map(plain).filter(Boolean).join("\n\n");
  return { text, words: words(text) };
}
