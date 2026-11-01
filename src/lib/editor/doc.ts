/**
 * ProseMirror/TipTap JSON belge yardımcıları (sunucu ve istemcide ortak).
 * Atıflar metne gömülü düz yazı değil, `citation` düğümleridir:
 *   { type: "citation", attrs: { ids: ["<source uuid>"], locator: "12", narrative: false } }
 * Böylece atıf stili değiştiğinde tüm metin otomatik olarak yeni stile dönüşür.
 */
export interface JSONNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: JSONNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

export interface CitationAttrs {
  ids: string[];
  locator: string | null;
  narrative: boolean;
}

export const EMPTY_DOC: JSONNode = { type: "doc", content: [{ type: "paragraph" }] };

export function walk(node: JSONNode | null | undefined, fn: (n: JSONNode, parent: JSONNode | null) => void, parent: JSONNode | null = null) {
  if (!node) return;
  fn(node, parent);
  for (const c of node.content ?? []) walk(c, fn, node);
}

export function citationAttrs(n: JSONNode): CitationAttrs {
  const a = n.attrs ?? {};
  const ids = Array.isArray(a.ids) ? (a.ids as unknown[]).map(String).filter(Boolean) : [];
  return { ids, locator: (a.locator as string) || null, narrative: !!a.narrative };
}

/** Metindeki atıf düğümlerini ilk geçiş sırasıyla döndürür. */
export function collectCitations(doc: JSONNode | null | undefined): CitationAttrs[] {
  const out: CitationAttrs[] = [];
  walk(doc, (n) => {
    if (n.type === "citation") out.push(citationAttrs(n));
  });
  return out;
}

export function citedIdsInOrder(docs: (JSONNode | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of docs) for (const c of collectCitations(d)) for (const id of c.ids) if (!seen.has(id)) { seen.add(id); out.push(id); }
  return out;
}

const BLOCKS = new Set(["paragraph", "heading", "blockquote", "listItem", "tableRow", "codeBlock", "footnoteBlock"]);

export function docToPlain(doc: JSONNode | null | undefined, renderCitation?: (a: CitationAttrs) => string): string {
  const parts: string[] = [];
  const rec = (n: JSONNode) => {
    if (n.type === "text") parts.push(n.text ?? "");
    else if (n.type === "citation") parts.push(renderCitation ? renderCitation(citationAttrs(n)) : "[atıf]");
    else if (n.type === "footnote") parts.push("");
    else if (n.type === "hardBreak") parts.push("\n");
    else if (n.type === "tableCell" || n.type === "tableHeader") {
      for (const c of n.content ?? []) rec(c);
      parts.push("\t");
      return;
    }
    for (const c of n.content ?? []) rec(c);
    if (BLOCKS.has(n.type)) parts.push("\n");
  };
  if (doc) rec(doc);
  return parts.join("").replace(/\n{3,}/g, "\n\n").trim();
}

export function wordCount(text: string): number {
  return (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’\-]*/gu) ?? []).length;
}

export interface HeadingInfo {
  level: number;
  text: string;
}

export function headings(doc: JSONNode | null | undefined): HeadingInfo[] {
  const out: HeadingInfo[] = [];
  walk(doc, (n) => {
    if (n.type === "heading") out.push({ level: Number(n.attrs?.level ?? 1), text: docToPlain({ type: "doc", content: n.content }) });
  });
  return out;
}

/** Otomatik başlık numaralandırma: [1, 1.1, 1.1.1] — bölüm sırası `chapter` ile verilir. */
export function numberHeadings(list: HeadingInfo[], chapter: number): string[] {
  const counters = [chapter, 0, 0, 0];
  return list.map((h) => {
    const lvl = Math.min(Math.max(h.level, 1), 4);
    if (lvl === 1) return String(chapter);
    counters[lvl - 1]++;
    for (let k = lvl; k < counters.length; k++) counters[k] = 0;
    return counters.slice(0, lvl).join(".");
  });
}

// ---------------------------------------------------------------------------
// AI çıktısı (Markdown alt kümesi) -> TipTap JSON
// ---------------------------------------------------------------------------

/** [[kaynak:S1]] , [[kaynak:S1,S2]] , [[kaynak:S3|s. 12]] , [[kaynak:S3|anlatı]] */
const CITE_RE = /\[\[kaynak:([A-Za-z0-9,\s-]+)(?:\|([^\]]+))?\]\]/g;

function inline(text: string, resolve: (shortId: string) => string | null): JSONNode[] {
  const out: JSONNode[] = [];
  const pushText = (s: string, marks?: JSONNode["marks"]) => {
    if (!s) return;
    out.push(marks?.length ? { type: "text", text: s, marks } : { type: "text", text: s });
  };
  const pushFormatted = (s: string) => {
    // **kalın** ve *italik*
    const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g;
    let last = 0;
    for (const m of s.matchAll(re)) {
      pushText(s.slice(last, m.index));
      const tok = m[0];
      if (tok.startsWith("**")) pushText(tok.slice(2, -2), [{ type: "bold" }]);
      else pushText(tok.slice(1, -1), [{ type: "italic" }]);
      last = (m.index ?? 0) + tok.length;
    }
    pushText(s.slice(last));
  };
  let last = 0;
  for (const m of text.matchAll(CITE_RE)) {
    pushFormatted(text.slice(last, m.index));
    const ids = m[1].split(",").map((x) => resolve(x.trim())).filter((x): x is string => !!x);
    const opt = (m[2] ?? "").trim();
    const narrative = /^(anlatı|narrative)$/i.test(opt);
    const locator = !narrative && opt ? opt.replace(/^(s|ss|p|pp)\.\s*/i, "") : null;
    if (ids.length) out.push({ type: "citation", attrs: { ids, locator, narrative } });
    else out.push({ type: "text", text: "[KAYNAK DOĞRULANAMADI]" });
    last = (m.index ?? 0) + m[0].length;
  }
  pushFormatted(text.slice(last));
  return out;
}

export function markdownToDoc(md: string, resolve: (shortId: string) => string | null): JSONNode {
  const lines = md.replace(/\r/g, "").split("\n");
  const content: JSONNode[] = [];
  let para: string[] = [];
  let list: { type: "bulletList" | "orderedList"; items: string[] } | null = null;
  let table: string[][] | null = null;

  const flushPara = () => {
    if (para.length) content.push({ type: "paragraph", content: inline(para.join(" "), resolve) });
    para = [];
  };
  const flushList = () => {
    if (list) {
      content.push({ type: list.type, content: list.items.map((it) => ({ type: "listItem", content: [{ type: "paragraph", content: inline(it, resolve) }] })) });
    }
    list = null;
  };
  const flushTable = () => {
    if (table && table.length) {
      const rows = table.filter((r) => !r.every((c) => /^:?-{2,}:?$/.test(c.trim())));
      content.push({
        type: "table",
        content: rows.map((r, ri) => ({
          type: "tableRow",
          content: r.map((c) => ({ type: ri === 0 ? "tableHeader" : "tableCell", content: [{ type: "paragraph", content: inline(c.trim(), resolve) }] })),
        })),
      });
    }
    table = null;
  };
  const flushAll = () => { flushPara(); flushList(); flushTable(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushAll(); continue; }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) { flushAll(); content.push({ type: "heading", attrs: { level: Math.min(h[1].length + 1, 4) }, content: inline(h[2], resolve) }); continue; }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushPara(); flushList();
      table = table ?? [];
      table.push(line.trim().slice(1, -1).split("|"));
      continue;
    } else if (table) flushTable();
    const b = line.match(/^\s*[-*•]\s+(.*)$/);
    const o = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (b || o) {
      flushPara();
      const type = b ? "bulletList" : "orderedList";
      if (!list || list.type !== type) { flushList(); list = { type, items: [] }; }
      list.items.push((b ?? o)![1]);
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) { flushAll(); content.push({ type: "blockquote", content: [{ type: "paragraph", content: inline(q[1], resolve) }] }); continue; }
    flushList();
    para.push(line.trim());
  }
  flushAll();
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

export function appendDoc(base: JSONNode | null | undefined, extra: JSONNode): JSONNode {
  const baseContent = (base?.content ?? []).filter((n) => !(n.type === "paragraph" && !n.content?.length));
  return { type: "doc", content: [...baseContent, ...(extra.content ?? [])] };
}
