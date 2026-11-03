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
  let last = 1;
  return list.map((h) => {
    // Seviye atlanırsa (## olmadan ###) bir üst düzeye çekilir: “1.0.1” yerine “1.1” (D76)
    const lvl = Math.min(Math.max(h.level, 1), 4, last + 1);
    last = lvl;
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

export interface CitationUsage {
  stageId: string;
  stageTitle: string;
  /** Bölüm içinde aynı kaynağa yapılan kaçıncı atıf (0'dan başlar; editörde konuma gitmek için) */
  occurrence: number;
  /** En yakın alt başlık */
  heading: string | null;
  /** Atfın geçtiği paragraf (atıf yeri "⟦…⟧" ile işaretli, kısaltılmış) */
  snippet: string;
  locator: string | null;
}

/** Her kaynağın metinde kullanıldığı yerler: bölüm, alt başlık, paragraf ve sayfa bilgisi. */
export function citationUsages(stages: { id: string; title: string; content: JSONNode | null | undefined }[]): Map<string, CitationUsage[]> {
  const out = new Map<string, CitationUsage[]>();
  for (const st of stages) {
    const counts: Record<string, number> = {};
    let heading: string | null = null;
    const visitBlock = (block: JSONNode) => {
      if (block.type === "heading") { heading = docToPlain({ type: "doc", content: block.content }); return; }
      const hasCitation = (block.content ?? []).some((c) => c.type === "citation");
      if (!hasCitation) { for (const c of block.content ?? []) if (c.type !== "text") visitBlock(c); return; }
      const inline = block.content ?? [];
      inline.forEach((n, idx) => {
        if (n.type !== "citation") return;
        const a = citationAttrs(n);
        const before = docToPlain({ type: "doc", content: inline.slice(0, idx) }, () => "").replace(/\s+/g, " ");
        const after = docToPlain({ type: "doc", content: inline.slice(idx + 1) }, () => "").replace(/\s+/g, " ");
        const snippet = `${before.length > 160 ? `…${before.slice(-160)}` : before}⟦…⟧${after.length > 60 ? `${after.slice(0, 60)}…` : after}`.trim();
        for (const id of a.ids) {
          const occurrence = counts[id] ?? 0;
          counts[id] = occurrence + 1;
          const list = out.get(id) ?? [];
          list.push({ stageId: st.id, stageTitle: st.title, occurrence, heading, snippet, locator: a.locator });
          out.set(id, list);
        }
      });
    };
    for (const b of st.content?.content ?? []) visitBlock(b);
  }
  return out;
}

export const PLACEHOLDER_RE = /\[KAYNAK GEREKLİ\]|\[KAYNAK DOĞRULANAMADI\]/;

/** Yer tutucu içeren paragraf/başlıkları bulur (liste ve alıntı içindekiler dahil). */
export function findPlaceholderBlocks(doc: JSONNode | null | undefined): JSONNode[] {
  const out: JSONNode[] = [];
  walk(doc, (n) => {
    if ((n.type === "paragraph" || n.type === "heading") && PLACEHOLDER_RE.test(docToPlain({ type: "doc", content: n.content }))) out.push(n);
  });
  return out;
}

/** Paragraftaki atıfları ⟦C1⟧ işaretlerine çevirir (yapay zekâ düzeltirken atıfları bozmasın diye). */
export function blockToTokenText(block: JSONNode): { text: string; tokens: JSONNode[] } {
  const tokens: JSONNode[] = [];
  const text = (block.content ?? []).map((n) => {
    if (n.type === "citation") { tokens.push(n); return `⟦C${tokens.length}⟧`; }
    if (n.type === "text") {
      const t = n.text ?? "";
      const marks = new Set((n.marks ?? []).map((m) => m.type));
      return marks.has("bold") ? `**${t}**` : marks.has("italic") ? `*${t}*` : t;
    }
    if (n.type === "hardBreak") return "\n";
    return "";
  }).join("");
  return { text, tokens };
}

/** ⟦Cn⟧ işaretlerini özgün atıf düğümlerine geri çevirir. */
export function restoreTokens(nodes: JSONNode[], tokens: JSONNode[]): JSONNode[] {
  const fix = (n: JSONNode): JSONNode[] => {
    if (n.type === "text" && n.text && /⟦C\d+⟧/.test(n.text)) {
      const out: JSONNode[] = [];
      for (const part of n.text.split(/(⟦C\d+⟧)/)) {
        const m = part.match(/^⟦C(\d+)⟧$/);
        if (m) { const tk = tokens[Number(m[1]) - 1]; if (tk) out.push(tk); }
        else if (part) out.push({ ...n, text: part });
      }
      return out;
    }
    return [n.content ? { ...n, content: n.content.flatMap(fix) } : n];
  };
  return nodes.flatMap(fix);
}

/** Belgede düz metni `plain` olan ilk paragraf/başlığı yeni düğümlerle değiştirir. Bulamazsa null. */
export function replaceBlockByText(doc: JSONNode, plain: string, replacement: JSONNode[]): JSONNode | null {
  let done = false;
  const rec = (n: JSONNode): JSONNode => {
    if (!n.content) return n;
    const content: JSONNode[] = [];
    for (const c of n.content) {
      if (!done && (c.type === "paragraph" || c.type === "heading") && docToPlain({ type: "doc", content: c.content }) === plain) {
        content.push(...replacement);
        done = true;
      } else content.push(rec(c));
    }
    return { ...n, content };
  };
  const out = rec(doc);
  return done ? out : null;
}
