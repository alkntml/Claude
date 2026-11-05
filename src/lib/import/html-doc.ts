/**
 * Word (mammoth HTML çıktısı) → TipTap belge düğümleri (D87). mammoth’un ürettiği HTML sınırlı ve düzgündür
 * (h1–h6, p, strong/em/u, sup/sub, ul/ol/li, table/thead/tbody/tr/th/td, a, br, img); küçük bir ayrıştırıcı yeterlidir.
 * Görseller ve dipnot bağlantıları atlanır (sayısı rapor edilir). Saf modül (test edilir).
 */
import type { JSONNode } from "@/lib/editor/doc";

interface El { tag: string; children: (El | string)[] }

const VOID = new Set(["br", "img", "hr", "meta", "link", "input"]);
const ENT: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s: string) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
  if (e[0] === "#") { const n = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
  return ENT[e.toLowerCase()] ?? m;
});

export function parseHtml(html: string): El {
  const root: El = { tag: "root", children: [] };
  const stack: El[] = [root];
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z0-9]+)([^>]*?)(\/?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { stack[stack.length - 1].children.push(decode(m[5])); continue; }
    if (!m[2]) continue;
    const tag = m[2].toLowerCase();
    if (m[1]) {
      // Kapanış: eşleşen açılışa kadar yığından çık
      const i = stack.map((e) => e.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
      continue;
    }
    const el: El = { tag, children: [] };
    if (tag === "img") el.children.push("\u0000img");
    stack[stack.length - 1].children.push(el);
    if (!VOID.has(tag) && !m[4]) stack.push(el);
  }
  return root;
}

type Mark = { type: string };
const MARK: Record<string, string> = { strong: "bold", b: "bold", em: "italic", i: "italic", u: "underline", sup: "superscript" };

export interface ConvertStats { images: number; footnotes: number }

function inline(el: El, marks: Mark[], out: JSONNode[], stats: ConvertStats) {
  for (const c of el.children) {
    if (typeof c === "string") {
      if (c === "\u0000img") { stats.images++; continue; }
      const text = c.replace(/\s+/g, " ");
      if (!text) continue;
      const prev = out[out.length - 1];
      const same = prev?.type === "text" && JSON.stringify(prev.marks ?? []) === JSON.stringify(marks);
      if (same) prev.text += text;
      else out.push(marks.length ? { type: "text", text, marks: [...marks] } : { type: "text", text });
      continue;
    }
    if (c.tag === "br") { out.push({ type: "hardBreak" }); continue; }
    if (c.tag === "img") { stats.images++; continue; }
    // Dipnot / son not bağlantıları ([1]) atlanır
    if (c.tag === "a" && /^\[?\d+\]?$/.test(textOf(c).trim()) && c.children.some((x) => typeof x !== "string" && x.tag === "sup")) { stats.footnotes++; continue; }
    if (c.tag === "sup" && /^\[?\d+\]?$/.test(textOf(c).trim()) && c.children.some((x) => typeof x !== "string" && x.tag === "a")) { stats.footnotes++; continue; }
    const mk = MARK[c.tag];
    inline(c, mk && !marks.some((x) => x.type === mk) ? [...marks, { type: mk }] : marks, out, stats);
  }
}

export function textOf(el: El | string): string {
  return typeof el === "string" ? (el === "\u0000img" ? "" : el) : el.children.map(textOf).join("");
}

function trimInline(nodes: JSONNode[]): JSONNode[] {
  const out = nodes.filter((n) => n.type !== "text" || n.text);
  if (out[0]?.type === "text") out[0] = { ...out[0], text: out[0].text!.replace(/^\s+/, "") };
  const l = out.length - 1;
  if (out[l]?.type === "text") out[l] = { ...out[l], text: out[l].text!.replace(/\s+$/, "") };
  return out.filter((n) => n.type !== "text" || n.text);
}

const para = (el: El, stats: ConvertStats): JSONNode => {
  const content: JSONNode[] = [];
  inline(el, [], content, stats);
  const c = trimInline(content);
  return c.length ? { type: "paragraph", content: c } : { type: "paragraph" };
};

function blocks(el: El, stats: ConvertStats): JSONNode[] {
  const out: JSONNode[] = [];
  const loose: El = { tag: "p", children: [] };
  const flushLoose = () => { if (textOf(loose).trim()) out.push(para(loose, stats)); loose.children = []; };
  for (const c of el.children) {
    if (typeof c === "string") { loose.children.push(c); continue; }
    const t = c.tag;
    if (/^h[1-6]$/.test(t)) {
      flushLoose();
      const content = trimInline((() => { const a: JSONNode[] = []; inline(c, [], a, stats); return a; })()).filter((n) => n.type === "text").map((n) => ({ type: "text", text: n.text }));
      if (content.length) out.push({ type: "heading", attrs: { level: Number(t[1]) }, content });
    } else if (t === "p") {
      flushLoose();
      const p = para(c, stats);
      if (p.content?.length) out.push(p);
    } else if (t === "ul" || t === "ol") {
      flushLoose();
      const items = c.children.filter((x): x is El => typeof x !== "string" && x.tag === "li").map((li) => {
        const inner = blocks(li, stats).filter((b) => b.type === "paragraph" || b.type === "bulletList" || b.type === "orderedList");
        return { type: "listItem", content: inner.length ? inner : [{ type: "paragraph" }] };
      });
      if (items.length) out.push({ type: t === "ul" ? "bulletList" : "orderedList", content: items });
    } else if (t === "table") {
      flushLoose();
      const rows: El[] = [];
      const collect = (e: El) => { for (const x of e.children) if (typeof x !== "string") { if (x.tag === "tr") rows.push(x); else if (x.tag === "thead" || x.tag === "tbody" || x.tag === "tfoot") collect(x); } };
      collect(c);
      const width = Math.max(1, ...rows.map((r) => r.children.filter((x) => typeof x !== "string" && (x.tag === "td" || x.tag === "th")).length));
      const tr = rows.map((r) => {
        const cells = r.children.filter((x): x is El => typeof x !== "string" && (x.tag === "td" || x.tag === "th"));
        const made = cells.map((cell) => {
          const inner = blocks(cell, stats).filter((b) => b.type === "paragraph");
          return { type: cell.tag === "th" ? "tableHeader" : "tableCell", content: inner.length ? inner : [{ type: "paragraph" }] };
        });
        while (made.length < width) made.push({ type: "tableCell", content: [{ type: "paragraph" }] });
        return { type: "tableRow", content: made };
      });
      if (tr.length) out.push({ type: "table", content: tr });
    } else if (t === "blockquote") {
      flushLoose();
      const inner = blocks(c, stats).filter((b) => b.type === "paragraph");
      if (inner.length) out.push({ type: "blockquote", content: inner });
    } else if (t === "img") {
      stats.images++;
    } else if (t === "a" && !textOf(c).trim()) {
      // Yer imi çapaları (<a id="…"></a>)
    } else if (["div", "section", "article", "body", "html", "li", "td", "th"].includes(t)) {
      flushLoose();
      out.push(...blocks(c, stats));
    } else {
      loose.children.push(c);
    }
  }
  flushLoose();
  return out;
}

export function htmlToNodes(html: string): { nodes: JSONNode[]; stats: ConvertStats } {
  const stats: ConvertStats = { images: 0, footnotes: 0 };
  // mammoth dipnotları belgenin sonuna liste olarak ekler (id="footnote-…"); içe aktarmada atlanır
  const cleaned = html.replace(/<ol>\s*<li id="(?:footnote|endnote)-[\s\S]*$/i, "");
  return { nodes: blocks(parseHtml(cleaned), stats), stats };
}
