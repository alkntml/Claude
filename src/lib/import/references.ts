/**
 * Belgeden içe aktarma (D87): kaynakçayı ayırma, kaynak satırını ayrıştırma, metin içi “Yazar (Yıl)” ve
 * “(Yazar, Yıl)” atıflarını gerçek atıf düğümlerine çevirme ve başlıkları çalışmanın düzeyine oturtma.
 * Tahminle eşleştirme yapılmaz: yazar soyadı ve yıl kaynakçadaki bir kayda birebir uymuyorsa metin olduğu gibi
 * kalır ve rapora yazılır. Saf modül (test edilir).
 */
import { docToPlain, type JSONNode } from "@/lib/editor/doc";

const REF_HEADING = /^(kaynakça|kaynaklar|yararlanılan kaynaklar|references|bibliography|works cited)\s*:?$/i;

export const fold = (s: string) => s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
const plain = (n: JSONNode) => docToPlain({ type: "doc", content: [n] }).trim();

/** Kaynakça başlığından sonraki paragrafları ayırır; gövde ve kaynak satırları döner */
export function splitReferences(nodes: JSONNode[]): { body: JSONNode[]; refs: string[] } {
  const i = nodes.findIndex((n) => (n.type === "heading" || n.type === "paragraph") && REF_HEADING.test(plain(n)));
  if (i < 0) return { body: nodes, refs: [] };
  const level = nodes[i].type === "heading" ? Number(nodes[i].attrs?.level ?? 1) : 99;
  let end = i + 1;
  while (end < nodes.length && !(nodes[end].type === "heading" && Number(nodes[end].attrs?.level ?? 1) <= level)) end++;
  const refs: string[] = [];
  for (const n of nodes.slice(i + 1, end)) {
    if (n.type === "paragraph") { const t = plain(n); if (t.length > 15) refs.push(t); }
    else if (n.type === "bulletList" || n.type === "orderedList") for (const li of n.content ?? []) { const t = plain(li); if (t.length > 15) refs.push(t); }
  }
  return { body: [...nodes.slice(0, i), ...nodes.slice(end)], refs };
}

export interface ParsedRef { raw: string; families: string[]; year: number | null; yearSuffix: string; title: string; doi: string | null; authors: { family: string; given?: string }[]; container: string | null }

// Soyadı: kesme işareti yalnızca ardından büyük harf gelirse adın parçasıdır (O’Brien); “Duygu’nun” eki ayrı kalır
const NAME = "[\\p{Lu}][\\p{L}\\-]*(?:['’][\\p{Lu}][\\p{L}\\-]*)?(?:\\s(?:de|van|von|der|da|del|di|la|le|bin|al)\\s[\\p{Lu}][\\p{L}\\-]*)*";

/** APA / Harvard / ISNAD benzeri kaynak satırı. Belirsiz alanlar boş bırakılır (uydurulmaz). */
export function parseReference(raw: string): ParsedRef {
  const text = raw.replace(/\s+/g, " ").trim();
  const doiM = text.match(/\b(10\.\d{4,9}\/[^\s"<>]+)/);
  const doi = doiM ? doiM[1].replace(/[.,;)\]]+$/, "") : null;
  // Yazar–tarih (APA/Harvard): “Soyad, A., & Soyad, B. (2020). Başlık. Dergi…”
  const ad = text.match(/^(.+?)\s*\((\d{4})([a-z]?)(?:,[^)]*)?\)\.?\s*(.*)$/u);
  let authorsPart = "", rest = text, year: number | null = null, suffix = "";
  if (ad) { authorsPart = ad[1]; year = Number(ad[2]); suffix = ad[3]; rest = ad[4]; }
  else {
    // ISNAD/Chicago: “Soyad, Ad. Başlık. … 2020.” — yazar ilk noktaya kadar, yıl metindeki son yıl
    const ys = [...text.matchAll(/\b(19|20)\d{2}\b/g)];
    if (ys.length) year = Number(ys[ys.length - 1][0]);
    const dot = text.search(/\.\s/);
    authorsPart = dot > 0 ? text.slice(0, dot) : "";
    rest = dot > 0 ? text.slice(dot + 2) : text;
  }
  const authors: { family: string; given?: string }[] = [];
  const re = new RegExp(`(${NAME}),\\s*((?:[\\p{Lu}][\\p{Ll}]*\\.?(?:\\s?-\\s?[\\p{Lu}]\\.?)?\\s?)+)`, "gu");
  for (const m of authorsPart.matchAll(re)) authors.push({ family: m[1].trim(), given: m[2].trim().replace(/\s+$/, "") });
  if (!authors.length && authorsPart.trim() && !/\d/.test(authorsPart)) authors.push({ family: authorsPart.split(",")[0].trim() });
  const title = (rest.match(/^(.+?[.?!])(\s|$)/)?.[1] ?? rest).replace(/\.$/, "").trim();
  const afterTitle = rest.slice(title.length).replace(/^[.?!]\s*/, "");
  const container = afterTitle.split(/,|\.\s/)[0]?.trim() || null;
  return { raw: text, families: authors.map((a) => a.family), year, yearSuffix: suffix, title, doi, authors, container };
}

export interface RefKey { id: string; families: string[]; year: number | null; suffix?: string }

/** Atıftaki yazar grubu → kaynak kimliği (ilk yazar + yıl, iki yazarlıysa ikinci yazar da uymalı) */
export function matchCitation(authorText: string, year: string, refs: RefKey[]): string | null {
  const y = Number(year.slice(0, 4)), suf = year.slice(4);
  const etal = /\b(vd|v\.d|et al|ve ark|ve diğ)\b\.?/i.test(authorText);
  const names = authorText.replace(/\b(vd|v\.d|et al|ve ark|ve diğ)\b\.?/gi, "").split(/\s*(?:,|&|\bve\b|\band\b)\s*/i).map(fold).filter(Boolean);
  if (!names.length) return null;
  const cands = refs.filter((r) => r.year === y && (!suf || !r.suffix || r.suffix === suf) && r.families.length && fold(r.families[0]) === names[0]);
  // Birden çok yazar yazılmışsa hepsi sırasıyla uymalı
  let fit = names.length > 1 ? cands.filter((r) => names.every((n, k) => r.families[k] && fold(r.families[k]) === n)) : cands;
  if (fit.length > 1) {
    // Aynı ilk yazar ve yılda birden çok kayıt: “vd.” → 3+ yazarlı, tek ad → tek yazarlı, sonra yıl harfi
    const byCount = fit.filter((r) => (etal ? r.families.length >= 3 : names.length === 1 ? r.families.length === 1 : true));
    if (byCount.length) fit = byCount;
    if (fit.length > 1) fit = fit.filter((r) => (r.suffix ?? "") === suf);
  }
  return fit.length === 1 ? fit[0].id : null;
}

const AUTH = `${NAME}(?:(?:,\\s*${NAME})*\\s+(?:ve|and|&)\\s+${NAME})?(?:\\s+(?:vd\\.|v\\.d\\.|et al\\.|ve ark\\.|ve diğ\\.))?`;
const NARR = new RegExp(`(${AUTH})(['’][\\p{Ll}]+)?\\s\\((\\d{4}[a-z]?)(?:,\\s*((?:s|ss|p|pp)\\.\\s*[\\d–\\-]+))?\\)`, "gu");
const PAREN = /\(([^()]*?\b\d{4}[a-z]?\b[^()]*?)\)/gu;
const PREFIX = /^(akt\.|aktaran|bkz\.|krş\.|karş\.|örn\.|ör\.|see|cf\.|e\.g\.,?|cited in)\s+/i;
const CITE_SHAPED = /\p{Lu}[\p{L}'’-]+.*\b\d{4}[a-z]?\b/u;
const ITEM = new RegExp(`^(${AUTH}),?\\s+(\\d{4}[a-z]?)(?:,\\s*((?:s|ss|p|pp)\\.\\s*[\\d–\\-]+))?$`, "u");

const cite = (ids: string[], o: { narrative?: boolean; suppressAuthor?: boolean; locator?: string | null; prefix?: string | null; suffix?: string | null } = {}): JSONNode => ({
  type: "citation",
  attrs: { ids, locator: o.locator ? o.locator.replace(/^(s|ss|p|pp)\.\s*/, "") : null, narrative: !!o.narrative, ...(o.suppressAuthor ? { suppressAuthor: true } : {}), ...(o.prefix ? { prefix: o.prefix } : {}), ...(o.suffix ? { suffix: o.suffix } : {}) },
});

export interface LinkReport { linked: number; unmatched: string[] }

/** Tek bir metin parçasındaki atıfları düğüme çevirir */
function linkText(text: string, marks: JSONNode["marks"], refs: RefKey[], rep: LinkReport): JSONNode[] {
  type Hit = { start: number; end: number; nodes: JSONNode[] };
  const hits: Hit[] = [];
  const t = (s: string): JSONNode => (marks?.length ? { type: "text", text: s, marks } : { type: "text", text: s });
  for (const m of text.matchAll(NARR)) {
    const id = matchCitation(m[1], m[3], refs);
    if (!id) { rep.unmatched.push(m[0]); continue; }
    const possessive = !!m[2];
    hits.push({ start: m.index!, end: m.index! + m[0].length, nodes: possessive ? [t(`${m[1]}${m[2]} `), cite([id], { suppressAuthor: true, locator: m[4] })] : [cite([id], { narrative: true, locator: m[4] })] });
  }
  for (const m of text.matchAll(PAREN)) {
    const start = m.index!, end = start + m[0].length;
    if (hits.some((h) => start < h.end && end > h.start)) continue;
    const parts = m[1].split(/\s*;\s*/);
    const ids: string[] = [];
    const extra: string[] = [];
    let locator: string | null = null, prefix: string | null = null, ok = true;
    parts.forEach((raw, k) => {
      if (!ok) return;
      const pm = raw.trim().match(PREFIX);
      const body = pm ? raw.trim().slice(pm[0].length) : raw.trim();
      const im = body.match(ITEM);
      if (im) {
        const id = matchCitation(im[1], im[2], refs);
        // Yalnızca ilk atıfta ön ek olabilir (akt., bkz.); ortadaki ön ekler biçimi bozar
        if (!id || (pm && ids.length)) { ok = false; return; }
        if (pm) prefix = pm[0].trim();
        ids.push(id);
        if (im[3]) locator = im[3];
      } else if (!CITE_SHAPED.test(body) && ids.length && k > 0) {
        extra.push(raw.trim()); // ör. “α = 0,79”: atıf değil, parantez içi açıklama
      } else ok = false;
    });
    if (!ok || !ids.length) { if (/\p{Lu}[\p{L}'’-]+(\s+vd\.)?,?\s+\d{4}/u.test(m[1])) rep.unmatched.push(m[0]); continue; }
    hits.push({ start, end, nodes: [cite([...new Set(ids)], { locator: ids.length === 1 ? locator : null, prefix, suffix: extra.length ? extra.join("; ") : null })] });
  }
  if (!hits.length) return [t(text)];
  hits.sort((a, b) => a.start - b.start);
  const out: JSONNode[] = [];
  let pos = 0;
  for (const h of hits) {
    if (h.start < pos) continue;
    if (h.start > pos) out.push(t(text.slice(pos, h.start)));
    out.push(...h.nodes);
    rep.linked++;
    pos = h.end;
  }
  if (pos < text.length) out.push(t(text.slice(pos)));
  return out;
}

/** Belgedeki tüm metinlerde (paragraf, liste, tablo) atıfları bağlar; başlıklara dokunmaz */
export function linkCitations(nodes: JSONNode[], refs: RefKey[]): { nodes: JSONNode[]; report: LinkReport } {
  const rep: LinkReport = { linked: 0, unmatched: [] };
  const visit = (n: JSONNode): JSONNode => {
    if (n.type === "heading") return n;
    if (n.type === "paragraph") return { ...n, content: (n.content ?? []).flatMap((c) => (c.type === "text" && c.text ? linkText(c.text, c.marks, refs, rep) : [c])) };
    return n.content ? { ...n, content: n.content.map(visit) } : n;
  };
  const out = nodes.map(visit);
  rep.unmatched = [...new Set(rep.unmatched)].slice(0, 30);
  return { nodes: out, report: rep };
}

const NUM = /^\s*(?:\d+(?:\.\d+)*\.?|[IVX]+\.|[A-Z]\.)\s+/;

/**
 * Başlıkları çalışmaya oturtur: elle yazılmış numaralar silinir (sistem numaralar), art arda yinelenen başlık
 * tekilleşir, en üst düzey `base` olur, `max`tan derin düzeyler `max`a çekilir. `dropTitle` verilirse ve ilk
 * başlık onunla aynıysa atılır (alt başlığın içine aktarırken başlık tekrar etmesin).
 */
export function fitHeadings(nodes: JSONNode[], opts: { base: number; max: number; dropTitle?: (text: string) => boolean }): JSONNode[] {
  let list = nodes.map((n) => (n.type === "heading" ? { ...n, content: [{ type: "text", text: plain(n).replace(NUM, "").trim() }] } : n))
    .filter((n) => n.type !== "heading" || plain(n));
  list = list.filter((n, i) => !(n.type === "heading" && i > 0 && list[i - 1].type === "heading" && fold(plain(list[i - 1])) === fold(plain(n))));
  // Belgenin başında başlıkla aynı metinli paragraf (Word “Title” stili) yinelenmesin
  list = list.filter((n, i) => !(n.type === "paragraph" && list[i + 1]?.type === "heading" && fold(plain(n).replace(NUM, "")) === fold(plain(list[i + 1]))));
  const firstHeading = list.findIndex((n) => n.type === "heading");
  if (opts.dropTitle && firstHeading >= 0 && list.slice(0, firstHeading).every((n) => !plain(n)) && opts.dropTitle(plain(list[firstHeading]))) list.splice(firstHeading, 1);
  const levels = list.filter((n) => n.type === "heading").map((n) => Number(n.attrs?.level ?? 1));
  if (!levels.length) return list;
  const min = Math.min(...levels);
  return list.map((n) => (n.type === "heading" ? { ...n, attrs: { level: Math.min(opts.max, Math.max(2, Number(n.attrs?.level ?? 1) - min + opts.base)) } } : n));
}
