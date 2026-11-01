import type { CitationItem, Person, Rich, Seg } from "./types";

export const t = (text: string): Seg => ({ text });
export const i = (text: string): Seg => ({ text, italic: true });

export function clean(s: string | null | undefined): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

/** Sondaki noktalamayı kaldırır (başlıklar arkasına stil noktalaması eklenirken). */
export function stripEndPunct(s: string): string {
  return clean(s).replace(/[.\s]+$/u, "");
}

/** Başlık zaten ?, ! ile bitiyorsa nokta eklenmez. */
export function endWith(s: string, p: string): string {
  const c = clean(s);
  if (!c) return c;
  if (/[.?!]$/u.test(c)) return c;
  return c + p;
}

export function normalizeDoi(doi: string | null | undefined): string | null {
  if (!doi) return null;
  const m = doi.trim().match(/10\.\d{4,9}\/\S+/i);
  return m ? m[0].replace(/[.,;]+$/, "").toLowerCase() : null;
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${normalizeDoi(doi) ?? doi}`;
}

export function pageRange(pages: string | null | undefined, dash = "–"): string {
  return clean(pages).replace(/\s*[-–—]+\s*/g, dash);
}

/** "Ayşe Nur" -> ["Ayşe", "Nur"]; "J.-P." gibi tireli adları korur. */
function givenParts(given: string): string[] {
  return clean(given).split(/\s+/).filter(Boolean);
}

/** "Jean-Paul Ayşe" -> "J.-P. A." */
export function initials(given: string | undefined, opts: { dots?: boolean; space?: boolean } = {}): string {
  const dots = opts.dots ?? true;
  const space = opts.space ?? true;
  if (!given) return "";
  const parts = givenParts(given).map((p) =>
    p.split("-").filter(Boolean).map((h) => h.charAt(0).toLocaleUpperCase("tr") + (dots ? "." : "")).join("-"),
  );
  return parts.join(dots && space ? " " : "");
}

export function familyOf(p: Person): string {
  return clean(p.literal ?? p.family ?? p.given ?? "");
}

export function isLiteral(p: Person): boolean {
  return !!p.literal || (!p.family && !p.given);
}

export function joinRich(parts: Rich[], sep: string): Rich {
  const out: Rich = [];
  parts.filter((p) => p.length && p.some((s) => s.text)).forEach((p, idx) => {
    if (idx > 0) out.push(t(sep));
    out.push(...p);
  });
  return out;
}

export function mergeRich(r: Rich): Rich {
  const out: Rich = [];
  for (const s of r) {
    if (!s.text) continue;
    const last = out[out.length - 1];
    if (last && !!last.italic === !!s.italic && !!last.sup === !!s.sup) last.text += s.text;
    else out.push({ ...s });
  }
  // Çift boşluk / noktalama öncesi boşluk temizliği
  for (const s of out) s.text = s.text.replace(/ {2,}/g, " ");
  return out;
}

export function richToPlain(r: Rich): string {
  return r.map((s) => s.text).join("");
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function richToHtml(r: Rich): string {
  return r
    .map((s) => {
      let h = escapeHtml(s.text);
      if (s.italic) h = `<em>${h}</em>`;
      if (s.sup) h = `<sup>${h}</sup>`;
      return h;
    })
    .join("");
}

export function richToMarkdown(r: Rich): string {
  return r
    .map((s) => {
      if (s.sup) return `^${s.text}^`;
      if (s.italic && s.text.trim()) {
        const lead = s.text.match(/^\s*/)?.[0] ?? "";
        const trail = s.text.match(/\s*$/)?.[0] ?? "";
        return `${lead}*${s.text.trim()}*${trail}`;
      }
      return s.text;
    })
    .join("");
}

/** Kaynakça sıralaması için anahtar (Türkçe harf duyarlı). */
export function sortKey(item: CitationItem): string {
  const first = item.authors[0] ?? item.editors?.[0];
  const name = first ? familyOf(first) : item.title;
  return `${name.toLocaleLowerCase("tr")}|${String(item.year ?? 9999).padStart(4, "0")}|${item.title.toLocaleLowerCase("tr")}`;
}

export function compareItems(a: CitationItem, b: CitationItem): number {
  return sortKey(a).localeCompare(sortKey(b), "tr");
}
