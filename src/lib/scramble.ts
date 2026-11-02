/**
 * Karartma (D50): kilitli çalışmada metin ve kaynaklar istemciye hiç gönderilmez; yerine aynı
 * uzunlukta, anlamsız harflerden oluşan bir metin gönderilir. Ekranda buğulu görünür, ama
 * kopyalansa veya sayfa kaynağı incelense bile asıl içerik elde edilemez.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

const LOWER = "abcçdefgğhıijklmnoöprsştuüvyz";
const UPPER = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

/** Deterministik sözde rastgele (aynı girdi → aynı çıktı; içerikle ilişkisi yok) */
function rng(seed: number) {
  let x = seed >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

/** Harfleri rastgele harflerle, rakamları rastgele rakamlarla değiştirir; boşluk ve noktalama korunur. */
export function scrambleText(s: string | null | undefined, seed = 7): string {
  if (!s) return "";
  const r = rng(seed + s.length * 31);
  let out = "";
  for (const ch of s) {
    if (/\p{Lu}/u.test(ch)) out += UPPER[Math.floor(r() * UPPER.length)];
    else if (/\p{L}/u.test(ch)) out += LOWER[Math.floor(r() * LOWER.length)];
    else if (/\p{N}/u.test(ch)) out += String(Math.floor(r() * 10));
    else out += ch;
  }
  return out;
}

/** TipTap belgesi: metinler karartılır, şekiller ve bağlantılar çıkarılır, yapı (başlık/paragraf) korunur. */
export function scrambleDoc(node: any, seed = 7): any {
  if (!node || typeof node !== "object") return node;
  if (node.type === "figure" || node.type === "image") return { type: "paragraph", content: [{ type: "text", text: scrambleText("Şekil", seed) }] };
  const out: any = { type: node.type };
  if (node.attrs) {
    out.attrs = { ...node.attrs };
    for (const k of ["src", "href", "alt", "title", "caption", "note", "locator", "prefix", "suffix"]) if (k in out.attrs) out.attrs[k] = typeof out.attrs[k] === "string" ? scrambleText(out.attrs[k], seed) : null;
  }
  if (typeof node.text === "string") out.text = scrambleText(node.text, seed + 1);
  if (Array.isArray(node.content)) out.content = node.content.map((c: any, i: number) => scrambleDoc(c, seed + i + 1));
  return out;
}

/** Kaynak satırı: künye bilgileri karartılır; DOI, bağlantı ve özet gönderilmez. */
export function scrambleSource(row: any, seed = 11): any {
  const s = (v: unknown) => (typeof v === "string" ? scrambleText(v, seed) : v);
  const authors = Array.isArray(row.authors) ? row.authors.map((a: any) => (typeof a === "string" ? scrambleText(a, seed) : { ...a, family: s(a?.family), given: s(a?.given), literal: s(a?.literal) })) : row.authors;
  return {
    ...row,
    title: s(row.title), container_title: s(row.container_title), publisher: s(row.publisher), publisher_place: s(row.publisher_place), authors,
    abstract: row.abstract ? scrambleText(String(row.abstract).slice(0, 400), seed) : null,
    summary: null, notes: "", relevance_note: "", verification: {}, tags: [],
    doi: null, pmid: null, pmcid: null, arxiv_id: null, isbn: null, openalex_id: null, url: null, oa_url: null, file_id: null,
    volume: s(row.volume), issue: s(row.issue), pages: s(row.pages), edition: s(row.edition),
  };
}
