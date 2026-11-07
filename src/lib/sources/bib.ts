/**
 * Kaynak yöneticileriyle (Zotero, Mendeley, EndNote, JabRef) alışveriş:
 * BibTeX / BibLaTeX, RIS ve CSL-JSON içe aktarma; BibTeX ve RIS dışa aktarma.
 * Saf fonksiyonlar (istemci ve sunucuda kullanılabilir), dış bağımlılık yok.
 */
import type { CitationItem, ItemType, Person } from "@/lib/citations/types";

export type ImportFormat = "bibtex" | "ris" | "csljson";

/** İçe aktarılan kayıt (SourceInput ile uyumlu alanlar) */
export interface ImportedRef {
  type: ItemType;
  title: string;
  authors: Person[];
  editors?: Person[];
  year: number | null;
  month?: number | null;
  containerTitle?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  publisher?: string | null;
  publisherPlace?: string | null;
  edition?: string | null;
  doi?: string | null;
  url?: string | null;
  isbn?: string | null;
  pmid?: string | null;
  arxivId?: string | null;
  abstract?: string | null;
  language?: string | null;
  genre?: string | null;
  origins: string[];
}

// ---------------------------------------------------------------------------
// Ortak yardımcılar
// ---------------------------------------------------------------------------

/** "Soyad, Ad" veya "Ad Soyad" -> Person; {Kurum Adı} -> literal */
export function parseName(raw: string): Person {
  const s = raw.trim();
  if (/^\{.*\}$/.test(s)) return { literal: s.slice(1, -1).trim() };
  if (s.includes(",")) {
    const [family, ...rest] = s.split(",");
    const given = rest.join(",").trim();
    return given ? { family: family.trim(), given } : { literal: family.trim() };
  }
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { literal: parts[0] };
  // Soyad önekleri (van, de, von…) soyada dahil edilir
  let i = parts.length - 1;
  while (i > 1 && /^(van|von|de|der|den|da|di|du|la|le|bin|al|el)$/i.test(parts[i - 1])) i--;
  return { given: parts.slice(0, i).join(" "), family: parts.slice(i).join(" ") };
}

const cleanPages = (p?: string | null) => (p ? p.replace(/\s*-{1,3}\s*|\s*–\s*/g, "-").trim() || null : null);
const yearOf = (v?: string | null) => { const m = String(v ?? "").match(/(1[5-9]\d{2}|20\d{2}|2100)/); return m ? Number(m[1]) : null; };
const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const monthOf = (v?: string | null) => {
  if (!v) return null;
  const n = Number(v);
  if (n >= 1 && n <= 12) return n;
  return MONTHS[String(v).trim().slice(0, 3).toLowerCase()] ?? null;
};
const cleanDoi = (d?: string | null) => (d ? d.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "") || null : null);
const httpUrl = (u?: string | null) => (u && /^https?:\/\//i.test(u.trim()) ? u.trim() : null);

// ---------------------------------------------------------------------------
// BibTeX / BibLaTeX
// ---------------------------------------------------------------------------

const LATEX_ACCENTS: Record<string, Record<string, string>> = {
  '"': { a: "ä", o: "ö", u: "ü", e: "ë", i: "ï", A: "Ä", O: "Ö", U: "Ü", E: "Ë", I: "Ï", y: "ÿ" },
  "'": { a: "á", e: "é", i: "í", o: "ó", u: "ú", c: "ć", n: "ń", s: "ś", z: "ź", y: "ý", A: "Á", E: "É", I: "Í", O: "Ó", U: "Ú", C: "Ć", S: "Ś", Z: "Ź" },
  "`": { a: "à", e: "è", i: "ì", o: "ò", u: "ù", A: "À", E: "È", I: "Ì", O: "Ò", U: "Ù" },
  "^": { a: "â", e: "ê", i: "î", o: "ô", u: "û", A: "Â", E: "Ê", I: "Î", O: "Ô", U: "Û" },
  "~": { a: "ã", n: "ñ", o: "õ", A: "Ã", N: "Ñ", O: "Õ" },
  c: { c: "ç", s: "ş", C: "Ç", S: "Ş", t: "ţ", T: "Ţ" },
  u: { g: "ğ", G: "Ğ", a: "ă", A: "Ă" },
  v: { c: "č", s: "š", z: "ž", r: "ř", C: "Č", S: "Š", Z: "Ž", e: "ě", n: "ň" },
  ".": { I: "İ", z: "ż", Z: "Ż" },
  H: { o: "ő", u: "ű", O: "Ő", U: "Ű" },
};

/** LaTeX kaçışlarını Unicode'a çevirir ve fazla süslü parantezleri kaldırır. */
export function latexToUnicode(s: string): string {
  let out = s
    .replace(/\\([cuvH.])\s*\{\s*\\?([A-Za-z])\s*\}/g, (m, a, ch) => LATEX_ACCENTS[a]?.[ch] ?? m)
    .replace(/\\([cuvH])\s+([A-Za-z])/g, (m, a, ch) => LATEX_ACCENTS[a]?.[ch] ?? m)
    .replace(/\\(["'`^~.])\s*\{?\s*\\?([A-Za-z])\}?/g, (m, a, ch) => LATEX_ACCENTS[a]?.[ch] ?? m)
    .replace(/\{?\\i\}?/g, "ı")
    .replace(/\\ss\b/g, "ß")
    .replace(/\\(o|O)\b/g, (_, c) => (c === "o" ? "ø" : "Ø"))
    .replace(/\\(ae|AE)\b/g, (_, c) => (c === "ae" ? "æ" : "Æ"))
    .replace(/\\&/g, "&").replace(/\\%/g, "%").replace(/\\\$/g, "$").replace(/\\_/g, "_").replace(/\\#/g, "#")
    .replace(/---/g, "—").replace(/--/g, "–")
    .replace(/\\textendash\b\s*/g, "–").replace(/\\textemdash\b\s*/g, "—")
    .replace(/\\(?:emph|textit|textbf|textsc|mkbibquote|enquote)\s*\{([^{}]*)\}/g, "$1")
    .replace(/~/g, " ");
  // Kalan süslü parantezler (büyük harf koruma) kaldırılır
  out = out.replace(/[{}]/g, "");
  return out.replace(/\s+/g, " ").trim();
}

interface BibEntry { type: string; key: string; fields: Record<string, string> }

/** BibTeX metnini girdilere ayırır (iç içe parantez, tırnak ve # birleştirme desteklenir). */
export function splitBibTeX(text: string): BibEntry[] {
  const out: BibEntry[] = [];
  const strings: Record<string, string> = {};
  let i = 0;
  const n = text.length;
  while (i < n) {
    const at = text.indexOf("@", i);
    if (at < 0) break;
    const m = /^@\s*([A-Za-z]+)\s*([{(])/.exec(text.slice(at, at + 60));
    if (!m) { i = at + 1; continue; }
    const type = m[1].toLowerCase();
    const open = m[2];
    const j = at + m[0].length;
    // Girdi gövdesinin sonunu bul: süslü parantez derinliği + (…) biçimli girdilerde dış parantez
    let brace = open === "{" ? 1 : 0, paren = open === "(" ? 1 : 0, k = j;
    for (; k < n; k++) {
      const c = text[k];
      if (c === "\\") { k++; continue; }
      if (c === "{") brace++;
      else if (c === "}") { brace--; if (open === "{" && brace === 0) break; }
      else if (open === "(" && brace === 0) { if (c === "(") paren++; else if (c === ")" && --paren === 0) break; }
    }
    const body = text.slice(j, k);
    i = k + 1;
    if (type === "comment" || type === "preamble") continue;
    const fields = parseFields(type === "string" ? body : body.slice(body.indexOf(",") + 1), strings);
    if (type === "string") { Object.assign(strings, fields); continue; }
    const key = body.slice(0, Math.max(0, body.indexOf(","))).trim();
    out.push({ type, key, fields });
  }
  return out;
}

function parseFields(body: string, strings: Record<string, string>): Record<string, string> {
  const fields: Record<string, string> = {};
  let i = 0;
  const n = body.length;
  while (i < n) {
    const m = /^[\s,]*([A-Za-z][\w:.+-]*)\s*=\s*/.exec(body.slice(i));
    if (!m) break;
    const name = m[1].toLowerCase();
    i += m[0].length;
    const parts: string[] = [];
    for (;;) {
      while (i < n && /\s/.test(body[i])) i++;
      const c = body[i];
      if (c === "{") {
        let depth = 1, k = i + 1;
        for (; k < n && depth > 0; k++) { if (body[k] === "\\") { k++; continue; } if (body[k] === "{") depth++; else if (body[k] === "}") depth--; }
        parts.push(body.slice(i + 1, k - 1)); i = k;
      } else if (c === '"') {
        let k = i + 1, depth = 0;
        for (; k < n; k++) { if (body[k] === "\\") { k++; continue; } if (body[k] === "{") depth++; else if (body[k] === "}") depth--; else if (body[k] === '"' && depth === 0) break; }
        parts.push(body.slice(i + 1, k)); i = k + 1;
      } else {
        const mm = /^[^,#\s}]+/.exec(body.slice(i));
        if (!mm) break;
        const word = mm[0];
        parts.push(strings[word.toLowerCase()] ?? MONTH_MACROS[word.toLowerCase()] ?? word); i += word.length;
      }
      while (i < n && /\s/.test(body[i])) i++;
      if (body[i] === "#") { i++; continue; }
      break;
    }
    fields[name] = parts.join("");
    while (i < n && body[i] !== ",") i++;
    i++;
  }
  return fields;
}
const MONTH_MACROS: Record<string, string> = { jan: "1", feb: "2", mar: "3", apr: "4", may: "5", jun: "6", jul: "7", aug: "8", sep: "9", oct: "10", nov: "11", dec: "12" };

const BIB_TYPES: Record<string, ItemType> = {
  article: "article-journal", book: "book", mvbook: "book", inbook: "chapter", incollection: "chapter", inreference: "chapter",
  inproceedings: "paper-conference", conference: "paper-conference", proceedings: "book", phdthesis: "thesis", mastersthesis: "thesis",
  thesis: "thesis", techreport: "report", report: "report", online: "webpage", electronic: "webpage", www: "webpage",
  dataset: "dataset", unpublished: "other", misc: "other", booklet: "book", manual: "report",
};

/** Bütünüyle süslü paranteze alınmış mı? ({Kurum Adı} -> kurumsal yazar) */
function wholeBraced(x: string): boolean {
  if (!x.startsWith("{") || !x.endsWith("}")) return false;
  let depth = 0;
  for (let i = 0; i < x.length; i++) {
    if (x[i] === "\\") { i++; continue; }
    if (x[i] === "{") depth++;
    else if (x[i] === "}" && --depth === 0 && i < x.length - 1) return false;
  }
  return true;
}
/** Yazar listesini " and " ile böler (süslü parantez içindeki "and" bölünmez). */
function splitAnd(v: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  const words = v.split(/(\s+)/);
  for (const w of words) {
    for (const c of w) { if (c === "{") depth++; else if (c === "}") depth--; }
    if (depth === 0 && /^and$/i.test(w)) { out.push(cur.trim()); cur = ""; continue; }
    cur += w;
  }
  out.push(cur.trim());
  return out.filter(Boolean);
}
const splitPeople = (v?: string) => (v ? splitAnd(v).filter((x) => x.toLowerCase() !== "others").map((x) => (wholeBraced(x) ? { literal: latexToUnicode(x.slice(1, -1)) } : parseName(latexToUnicode(x)))) : []);

function bibToRef(e: BibEntry): ImportedRef | null {
  const f = Object.fromEntries(Object.entries(e.fields).map(([k, v]) => [k, k === "url" || k === "doi" ? v.trim() : latexToUnicode(v)]));
  const raw = e.fields;
  const title = f.title;
  if (!title) return null;
  let type = BIB_TYPES[e.type] ?? "other";
  if (type === "other" && (f.url || f.howpublished?.startsWith("http"))) type = "webpage";
  const isChapter = type === "chapter" || type === "paper-conference";
  const genre = e.type === "phdthesis" ? "doctoral" : e.type === "mastersthesis" ? "master"
    : e.type === "thesis" ? (/master|yüksek/i.test(f.type ?? "") ? "master" : /phd|doktora|doctor/i.test(f.type ?? "") ? "doctoral" : f.type || null) : null;
  const eprintArxiv = (f.archiveprefix ?? f.eprinttype ?? "").toLowerCase() === "arxiv" ? f.eprint : null;
  return {
    type,
    title,
    authors: splitPeople(raw.author),
    editors: splitPeople(raw.editor),
    year: yearOf(f.year ?? f.date),
    month: monthOf(f.month ?? (f.date?.match(/^\d{4}-(\d{2})/)?.[1] ?? null)),
    containerTitle: (isChapter ? f.booktitle : f.journal ?? f.journaltitle ?? f.booktitle) ?? null,
    volume: f.volume ?? null,
    issue: f.number ?? f.issue ?? null,
    pages: cleanPages(f.pages),
    publisher: (type === "thesis" ? f.school ?? f.institution : f.publisher ?? f.institution ?? f.organization) ?? null,
    publisherPlace: f.address ?? f.location ?? null,
    edition: f.edition ?? null,
    doi: cleanDoi(f.doi),
    url: httpUrl(f.url ?? (f.howpublished?.match(/https?:\/\/\S+/)?.[0] ?? null)),
    isbn: f.isbn ?? null,
    pmid: f.pmid ?? null,
    arxivId: eprintArxiv ?? null,
    abstract: f.abstract ?? null,
    language: f.language ?? f.langid ?? null,
    genre,
    origins: ["import"],
  };
}

export function parseBibTeX(text: string): ImportedRef[] {
  return splitBibTeX(text).map(bibToRef).filter((x): x is ImportedRef => !!x);
}

// ---------------------------------------------------------------------------
// RIS (EndNote, Mendeley, Zotero, Web of Science, Scopus)
// ---------------------------------------------------------------------------

const RIS_TYPES: Record<string, ItemType> = {
  JOUR: "article-journal", JFULL: "article-journal", MGZN: "article-journal", NEWS: "article-journal", EJOUR: "article-journal",
  BOOK: "book", EBOOK: "book", EDBOOK: "book", CHAP: "chapter", ECHAP: "chapter", CONF: "paper-conference", CPAPER: "paper-conference",
  THES: "thesis", RPRT: "report", ELEC: "webpage", WEB: "webpage", DATA: "dataset", GEN: "other", UNPB: "other",
};

export function parseRIS(text: string): ImportedRef[] {
  const out: ImportedRef[] = [];
  let cur: Record<string, string[]> | null = null;
  let last: string | null = null;
  for (const rawLine of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const m = /^([A-Z][A-Z0-9])\s{1,2}-\s?(.*)$/.exec(rawLine);
    if (!m) {
      // Satır devamı (uzun özetler birden çok satıra bölünebilir)
      if (cur && last && rawLine.trim()) { const arr = cur[last]; arr[arr.length - 1] = `${arr[arr.length - 1]} ${rawLine.trim()}`; }
      continue;
    }
    const [, tag, value] = m;
    if (tag === "TY") { cur = { TY: [value.trim()] }; last = null; continue; }
    if (!cur) continue;
    if (tag === "ER") {
      const ref = risToRef(cur);
      if (ref) out.push(ref);
      cur = null;
      last = null;
      continue;
    }
    (cur[tag] ??= []).push(value.trim());
    last = tag;
  }
  return out;
}

function risToRef(r: Record<string, string[]>): ImportedRef | null {
  const g = (...tags: string[]) => { for (const tg of tags) if (r[tg]?.[0]) return r[tg][0]; return null; };
  const title = g("TI", "T1", "CT", "BT");
  if (!title) return null;
  const ty = r.TY?.[0] ?? "GEN";
  const type = RIS_TYPES[ty] ?? "other";
  const sp = g("SP"), ep = g("EP");
  const date = g("PY", "Y1", "DA");
  const isChapter = type === "chapter" || type === "paper-conference";
  return {
    type,
    title: type === "chapter" && r.TI && r.BT ? r.TI[0] : title,
    authors: [...(r.AU ?? []), ...(r.A1 ?? [])].map(parseName),
    editors: [...(r.ED ?? []), ...(r.A2 ?? []), ...(r.A3 ?? [])].filter(() => isChapter).map(parseName),
    year: yearOf(date),
    month: date ? monthOf(date.split("/")[1]) : null,
    containerTitle: (isChapter ? g("T2", "BT", "J2") : g("JO", "JF", "T2", "JA", "J2")) ?? null,
    volume: g("VL"),
    issue: g("IS", "CP"),
    pages: sp ? cleanPages(ep ? `${sp}-${ep}` : sp) : null,
    publisher: g("PB"),
    publisherPlace: g("CY", "PP"),
    edition: g("ET"),
    doi: cleanDoi(g("DO")),
    url: httpUrl(g("UR", "L2", "LK")),
    isbn: type === "book" || type === "chapter" ? g("SN") : null,
    pmid: null,
    arxivId: null,
    abstract: g("AB", "N2"),
    language: g("LA"),
    genre: type === "thesis" ? (/master|yüksek/i.test(g("M3", "TA") ?? "") ? "master" : /phd|doktora|doctor/i.test(g("M3") ?? "") ? "doctoral" : null) : null,
    origins: ["import"],
  };
}

// ---------------------------------------------------------------------------
// CSL-JSON (Zotero "Better CSL JSON", Mendeley)
// ---------------------------------------------------------------------------

const CSL_TYPES: Record<string, ItemType> = {
  "article-journal": "article-journal", "article-magazine": "article-journal", "article-newspaper": "article-journal", article: "article-journal",
  book: "book", chapter: "chapter", "paper-conference": "paper-conference", thesis: "thesis", report: "report", webpage: "webpage",
  "post-weblog": "webpage", dataset: "dataset",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseCslJson(text: string): ImportedRef[] {
  let data: any;
  try { data = JSON.parse(text); } catch { return []; }
  const list: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [data];
  const people = (arr: any) => (Array.isArray(arr) ? arr.map((p: any) => (p.literal ? { literal: String(p.literal) } : { family: p.family ? String(p.family) : undefined, given: p.given ? String(p.given) : undefined })).filter((p: Person) => p.family || p.literal) : []);
  return list.filter((x) => x && typeof x === "object" && x.title).map((x) => {
    const parts = x.issued?.["date-parts"]?.[0] ?? [];
    const type = CSL_TYPES[x.type] ?? "other";
    return {
      type,
      title: String(x.title),
      authors: people(x.author),
      editors: people(x.editor),
      year: parts[0] ? Number(parts[0]) : yearOf(x.issued?.raw ?? x.issued?.literal),
      month: parts[1] ? Number(parts[1]) : null,
      containerTitle: x["container-title"] ?? null,
      volume: x.volume != null ? String(x.volume) : null,
      issue: x.issue != null ? String(x.issue) : null,
      pages: cleanPages(x.page ?? null),
      publisher: x.publisher ?? null,
      publisherPlace: x["publisher-place"] ?? null,
      edition: x.edition != null ? String(x.edition) : null,
      doi: cleanDoi(x.DOI ?? null),
      url: httpUrl(x.URL ?? null),
      isbn: x.ISBN ?? null,
      pmid: x.PMID ?? null,
      arxivId: null,
      abstract: x.abstract ?? null,
      language: x.language ?? null,
      genre: type === "thesis" ? (/master|yüksek/i.test(x.genre ?? "") ? "master" : /phd|doktora|doctor/i.test(x.genre ?? "") ? "doctoral" : x.genre ?? null) : null,
      origins: ["import"],
    } as ImportedRef;
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Biçimi içerikten tahmin eder. */
export function detectFormat(text: string): ImportFormat | null {
  const s = text.replace(/^\uFEFF/, "").trimStart();
  if (s.startsWith("[") || s.startsWith("{")) return "csljson";
  if (/^TY\s{1,2}-/m.test(s)) return "ris";
  if (/@\s*[A-Za-z]+\s*[{(]/.test(s)) return "bibtex";
  return null;
}

export function parseReferences(text: string, format?: ImportFormat | null): { format: ImportFormat | null; refs: ImportedRef[] } {
  const f = format ?? detectFormat(text);
  const refs = f === "bibtex" ? parseBibTeX(text) : f === "ris" ? parseRIS(text) : f === "csljson" ? parseCslJson(text) : [];
  return { format: f, refs: refs.filter((r) => r.title.trim()) };
}

// ---------------------------------------------------------------------------
// Dışa aktarma
// ---------------------------------------------------------------------------

const TO_BIB: Record<ItemType, string> = {
  "article-journal": "article", book: "book", chapter: "incollection", "paper-conference": "inproceedings", thesis: "phdthesis",
  report: "techreport", webpage: "misc", preprint: "misc", dataset: "misc", other: "misc",
};
const bibEscape = (s: string) => s.replace(/([&%$#_])/g, "\\$1").replace(/[{}]/g, "");
const personBib = (p: Person) => (p.literal ? `{${bibEscape(p.literal)}}` : [p.family, p.given].filter(Boolean).map((x) => bibEscape(String(x))).join(", "));
const asciiKey = (s: string) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^A-Za-z0-9]/g, "");

/** Kaynak kimliği → BibTeX anahtarı (Soyad + yıl; çakışmada a, b, c…). LaTeX çıktısındaki \cite anahtarlarıyla aynıdır (D136). */
export function bibKeyMap(items: CitationItem[]): Map<string, string> {
  const used = new Set<string>();
  const out = new Map<string, string>();
  for (const it of items) {
    const first = it.authors[0];
    const key = `${asciiKey(first?.family ?? first?.literal ?? "anon").slice(0, 20) || "anon"}${it.year ?? "nd"}`;
    let k = key, n = 0;
    while (used.has(k)) k = `${key}${String.fromCharCode(97 + n++)}`;
    used.add(k);
    out.set(it.id, k);
  }
  return out;
}

export function toBibTeX(items: CitationItem[]): string {
  const keys = bibKeyMap(items);
  return items.map((it) => {
    const key = keys.get(it.id)!;
    const type = it.type === "thesis" && it.genre === "master" ? "mastersthesis" : TO_BIB[it.type] ?? "misc";
    const f: [string, string | null | undefined][] = [
      ["author", it.authors.length ? it.authors.map(personBib).join(" and ") : null],
      ["editor", it.editors?.length ? it.editors.map(personBib).join(" and ") : null],
      ["title", `{${bibEscape(it.title)}}`],
      [it.type === "chapter" || it.type === "paper-conference" ? "booktitle" : "journal", it.type === "article-journal" || it.type === "chapter" || it.type === "paper-conference" ? it.containerTitle && bibEscape(it.containerTitle) : null],
      ["year", it.year ? String(it.year) : null],
      ["volume", it.volume], ["number", it.issue], ["pages", it.pages?.replace(/[-–]/, "--")],
      [it.type === "thesis" ? "school" : "publisher", it.type === "thesis" ? it.institution ?? it.publisher : it.publisher],
      ["address", it.publisherPlace], ["edition", it.edition], ["doi", it.doi], ["url", it.url], ["isbn", it.isbn],
      ["note", it.archive === "yok" && it.archiveId ? `YÖK Ulusal Tez Merkezi, Tez No. ${it.archiveId}` : null],
    ];
    const body = f.filter(([, v]) => v).map(([name, v]) => `  ${name} = {${v}}`).join(",\n");
    return `@${type}{${key},\n${body}\n}`;
  }).join("\n\n") + "\n";
}

const TO_RIS: Record<ItemType, string> = {
  "article-journal": "JOUR", book: "BOOK", chapter: "CHAP", "paper-conference": "CPAPER", thesis: "THES", report: "RPRT",
  webpage: "ELEC", preprint: "GEN", dataset: "DATA", other: "GEN",
};
const personRis = (p: Person) => (p.literal ? p.literal : [p.family, p.given].filter(Boolean).join(", "));

export function toRIS(items: CitationItem[]): string {
  return items.map((it) => {
    const lines: string[] = [`TY  - ${TO_RIS[it.type] ?? "GEN"}`];
    const add = (tag: string, v?: string | number | null) => { if (v !== null && v !== undefined && String(v).trim()) lines.push(`${tag}  - ${String(v).replace(/\r?\n/g, " ")}`); };
    it.authors.forEach((a) => add("AU", personRis(a)));
    it.editors?.forEach((a) => add("ED", personRis(a)));
    add("TI", it.title);
    add(it.type === "article-journal" ? "JO" : "T2", it.containerTitle);
    add("PY", it.year);
    add("VL", it.volume); add("IS", it.issue);
    const [sp, ep] = (it.pages ?? "").split(/[-–]/);
    add("SP", sp); add("EP", ep);
    add("PB", it.type === "thesis" ? it.institution ?? it.publisher : it.publisher);
    add("CY", it.publisherPlace); add("ET", it.edition); add("DO", it.doi); add("UR", it.url); add("SN", it.isbn);
    if (it.type === "thesis") add("M3", it.genre === "master" ? "Master's thesis" : it.genre === "doctoral" ? "Doctoral dissertation" : it.genre);
    lines.push("ER  - ");
    return lines.join("\r\n");
  }).join("\r\n\r\n") + "\r\n";
}
