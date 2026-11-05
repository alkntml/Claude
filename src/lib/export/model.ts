/**
 * Dışa aktarma için ara belge modeli: TipTap JSON + kaynaklar + atıf stili ->
 * biçimden bağımsız bloklar. DOCX, PDF, Markdown ve TXT işleyicileri bu modeli kullanır.
 */
import { CitationEngine, type CitationItem, type CitationStyleId, type CiteLocale, type Rich } from "@/lib/citations";
import { citedIdsInOrder, citationAttrs, type JSONNode } from "@/lib/editor/doc";
import { stageDef } from "@/lib/workflows";
import { chapterGroup, sameHeading, sectionTitle, UNNUMBERED } from "@/lib/workflows/structure";

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  sup?: boolean;
  /** Bu run bir dipnot işaretidir; değeri dipnot metnidir */
  footnote?: string;
}

export type Block =
  | { kind: "heading"; level: number; number: string; runs: Run[] }
  | { kind: "paragraph"; runs: Run[]; quote?: boolean }
  | { kind: "list"; ordered: boolean; items: Run[][] }
  | { kind: "table"; rows: Run[][][]; header: boolean }
  | { kind: "caption"; runs: Run[] }
  | { kind: "image"; src: string; width: number; height: number; alt: string };

/** base64 → bayt (sunucuda Buffer, tarayıcıda atob) */
export function base64Bytes(b64: string): Uint8Array {
  if (typeof Buffer !== "undefined") return new Uint8Array(Buffer.from(b64, "base64"));
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** Belgeye gömülü şekil: yalnızca PNG veri adresi kabul edilir (dış adres yok), en fazla ~3 MB */
export function figureImage(attrs: Record<string, unknown> | undefined): { src: string; width: number; height: number; alt: string } | null {
  const src = String(attrs?.src ?? "");
  const m = src.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (!m || m[1].length > 4_000_000) return null;
  const head = base64Bytes(m[1].slice(0, 44));
  if (head.length < 24 || head[0] !== 0x89 || head[1] !== 0x50 || head[2] !== 0x4e || head[3] !== 0x47) return null;
  // PNG IHDR: genişlik ve yükseklik 16. ve 20. baytlarda (big-endian)
  const u32 = (o: number) => ((head[o] << 24) >>> 0) + (head[o + 1] << 16) + (head[o + 2] << 8) + head[o + 3];
  const width = u32(16), height = u32(20);
  if (!width || !height || width > 10000 || height > 10000) return null;
  return { src, width, height, alt: String(attrs?.alt ?? "").slice(0, 300) };
}

/** Şeklin PNG baytları (dışa aktarıcılar için) */
export const figurePng = (src: string) => Buffer.from(src.slice(src.indexOf(",") + 1), "base64");

export interface ExportDoc {
  title: string;
  author: string;
  institution: string;
  subtitle: string;
  date: string;
  language: CiteLocale;
  styleLabel: string;
  numberHeadings: boolean;
  toc: { level: number; number: string; text: string }[];
  blocks: Block[];
  bibliographyTitle: string;
  bibliography: { number?: number; rich: Rich }[];
  numericBibliography: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildExportDoc(params: {
  project: any;
  stages: any[];
  sources: any[];
  engineItems: CitationItem[];
  authorName: string;
  options?: { numberHeadings?: boolean };
}): ExportDoc {
  const { project, stages } = params;
  const locale: CiteLocale = project.language === "en" ? "en" : "tr";
  const ordered = [...stages].sort((a, b) => a.position - b.position);
  const order = citedIdsInOrder(ordered.map((s) => s.content as JSONNode));
  const engine = new CitationEngine(project.citation_style as CitationStyleId, params.engineItems, { locale, citedOrder: order });
  const doNumber = params.options?.numberHeadings ?? true;
  const firstSeen = new Set<string>();

  const blocks: Block[] = [];
  const toc: ExportDoc["toc"] = [];
  let chapter = 0;

  const richToRuns = (r: Rich): Run[] => r.map((s) => ({ text: s.text, italic: s.italic, sup: s.sup }));

  const inlineRuns = (nodes: JSONNode[] | undefined): Run[] => {
    const out: Run[] = [];
    for (const n of nodes ?? []) {
      if (n.type === "text") {
        const marks = new Set((n.marks ?? []).map((m) => m.type));
        out.push({ text: n.text ?? "", bold: marks.has("bold"), italic: marks.has("italic"), underline: marks.has("underline"), sup: marks.has("superscript") });
      } else if (n.type === "citation") {
        const a = citationAttrs(n);
        const first = a.ids.some((id) => !firstSeen.has(id));
        a.ids.forEach((id) => firstSeen.add(id));
        out.push(...richToRuns(engine.cite(a.ids, { locator: a.locator, narrative: a.narrative }, first)));
      } else if (n.type === "footnote") {
        out.push({ text: "", footnote: String(n.attrs?.text ?? "") });
      } else if (n.type === "hardBreak") {
        out.push({ text: "\n" });
      } else {
        out.push(...inlineRuns(n.content));
      }
    }
    return out;
  };

  // Başlık numaralandırma (D76): bölüm içinde tek sayaç; seviye atlanırsa (## olmadan ###) düzeltilir → “1.0.1” oluşmaz
  const counters = [0, 0, 0, 0];
  let lastLevel = 1;
  let numbered = true;
  const emit = (level: number, runs: Run[]) => {
    const lvl = Math.max(1, Math.min(4, level, lastLevel + 1));
    lastLevel = lvl;
    let number = "";
    if (numbered && doNumber) {
      counters[lvl - 1]++;
      for (let k = lvl; k < 4; k++) counters[k] = 0;
      number = counters.slice(0, lvl).join(".");
    }
    blocks.push({ kind: "heading", level: lvl, number, runs });
    // İçindekiler tüm başlık düzeylerini içerir (D85; 4. düzey ör. 2.1.4.1 dahil). Sıra blok başlıklarıyla birebir aynıdır.
    toc.push({ level: lvl, number, text: runs.map((r) => r.text).join("") });
  };
  const startChapter = (runs: Run[], isNumbered: boolean) => {
    numbered = isNumbered;
    if (isNumbered) { chapter++; counters[0] = chapter - 1; }
    counters[1] = counters[2] = counters[3] = 0;
    lastLevel = 0;
    emit(1, runs);
  };
  /** Aşama içi başlıklar: ilk başlık aşama adının tekrarıysa atlanır; düzey, bölüm içindeki konuma göre kaydırılır */
  let headingCtx = { shift: 0, skipTitle: "", seen: 0 };

  const visit = (n: JSONNode) => {
    switch (n.type) {
      case "heading": {
        const runs = inlineRuns(n.content);
        const text = runs.map((r) => r.text).join("");
        headingCtx.seen++;
        if (headingCtx.seen === 1 && headingCtx.skipTitle && sameHeading(text, headingCtx.skipTitle)) break;
        emit(Math.min(Math.max(Number(n.attrs?.level ?? 2), 2), 4) + headingCtx.shift, runs);
        break;
      }
      case "paragraph": {
        const runs = inlineRuns(n.content);
        const isCaption = /^(Tablo|Şekil|Table|Figure)\s+\d+/.test(runs.map((r) => r.text).join(""));
        if (runs.some((r) => r.text.trim() || r.footnote)) blocks.push(isCaption ? { kind: "caption", runs } : { kind: "paragraph", runs });
        break;
      }
      case "blockquote":
        for (const c of n.content ?? []) blocks.push({ kind: "paragraph", runs: inlineRuns(c.content), quote: true });
        break;
      case "bulletList":
      case "orderedList":
        blocks.push({ kind: "list", ordered: n.type === "orderedList", items: (n.content ?? []).map((li) => (li.content ?? []).flatMap((p) => inlineRuns(p.content))) });
        break;
      case "table": {
        const rows = (n.content ?? []).map((row) => (row.content ?? []).map((cell) => (cell.content ?? []).flatMap((p) => inlineRuns(p.content))));
        const header = (n.content?.[0]?.content ?? []).some((c) => c.type === "tableHeader");
        blocks.push({ kind: "table", rows, header });
        break;
      }
      case "figure": {
        const img = figureImage(n.attrs);
        if (img) blocks.push({ kind: "image", ...img });
        break;
      }
      default:
        for (const c of n.content ?? []) visit(c);
    }
  };

  // Aşamalar → akademik ana bölümler (D76): ardışık giriş/kuram/yöntem aşamaları tek ana bölümde toplanır
  let currentGroup: string | null = null;
  for (const st of ordered) {
    if (st.key === "references") continue;
    const doc = st.content as JSONNode | null;
    const hasText = (st.content_text ?? "").trim().length > 0;
    if (!hasText) continue;
    const def = stageDef(st.key);
    const title = sectionTitle(st.key, st.title, def?.title, locale);
    const group = chapterGroup(st.key);
    const skipTitle = [st.title, def?.title ?? "", title].find((x) => x) ?? "";
    if (group) {
      if (currentGroup !== group.id) { startChapter([{ text: group.title[locale] }], true); currentGroup = group.id; }
      if (title) { emit(2, [{ text: title }]); headingCtx = { shift: 1, skipTitle, seen: 0 }; }
      else headingCtx = { shift: 0, skipTitle, seen: 0 }; // başlıksız açılış metni (Giriş’in ilk kısmı)
    } else {
      currentGroup = null;
      startChapter([{ text: title || st.title }], !UNNUMBERED.has(st.key));
      headingCtx = { shift: 0, skipTitle, seen: 0 };
    }
    if (doc) visit(doc);
  }

  const bib = engine.bibliography(order);
  const meta = engine.meta;
  return {
    title: project.title,
    author: params.authorName,
    institution: project.context?.university ?? "",
    subtitle: project.context?.subtitle ?? "",
    date: new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { year: "numeric", month: "long" }),
    language: locale,
    styleLabel: meta.label,
    numberHeadings: doNumber,
    toc,
    blocks,
    bibliographyTitle: meta.bibliographyTitle[locale],
    bibliography: bib.map((b) => ({ number: b.number, rich: b.rich })),
    numericBibliography: meta.family === "numeric",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function runsToPlain(runs: Run[]): string {
  return runs.map((r) => (r.footnote ? "" : r.text)).join("");
}
