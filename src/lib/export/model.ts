/**
 * Dışa aktarma için ara belge modeli: TipTap JSON + kaynaklar + atıf stili ->
 * biçimden bağımsız bloklar. DOCX, PDF, Markdown ve TXT işleyicileri bu modeli kullanır.
 */
import { resolveFormat, resolveLayout, type DocFormat } from "./format";
import { CitationEngine, type CitationItem, type CitationStyleId, type CiteLocale, type Rich } from "@/lib/citations";
import { formatCaption, noteLabel, parseCaption, parseNote, type ParsedCaption } from "@/lib/citations/captions";
import { citedIdsInOrder, citationAttrs, type JSONNode } from "@/lib/editor/doc";
import { stageDef } from "@/lib/workflows";
import { dictFor } from "@/i18n";
import { LANG_TAG } from "@/lib/writing-lang";
import { chapterGroup, NOT_IN_MANUSCRIPT, sameHeading, sectionTitle, UNNUMBERED, UNNUMBERED_GROUPS } from "@/lib/workflows/structure";

export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  sup?: boolean;
  /** Bu run bir dipnot işaretidir; değeri dipnot metnidir */
  footnote?: string;
  /** LaTeX çıktısında atıf biçimlenmez; kaynak kimlikleriyle \cite komutuna çevrilir (D136) */
  cite?: { ids: string[]; locator: string | null; narrative?: boolean; suppressAuthor?: boolean; prefix?: string | null; suffix?: string | null };
}

export type Block =
  | { kind: "heading"; level: number; number: string; runs: Run[]; keep?: "abstract" }
  | { kind: "paragraph"; runs: Run[]; quote?: boolean; keep?: "abstract" }
  | { kind: "list"; ordered: boolean; items: Run[][] }
  | { kind: "table"; rows: Run[][][]; header: boolean }
  /** Tablo/şekil başlığı: satırlar ve hizalama projenin atıf stiline göre (D106, citations/captions.ts) */
  | { kind: "caption"; lines: Run[][]; align: "left" | "center"; /** D173: tablo/şekil listesi için */ list?: "table" | "figure"; entry?: string }
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
  /** D170: dergi/araştırma makalesi düzeni: kapak ve içindekiler yok, başlık ilk sayfanın üstünde, bölümler kesintisiz */
  article: boolean;
  /** D178: kapak + içindekiler + listeler basılsın mı (üniversite/ders teslimi düzeni); false = dergi gönderim düzeni */
  cover: boolean;
  /** D178: biçim ve kapak bilgileri (LaTeX kapağı için; Word/PDF ayrıca alır) */
  format?: Partial<DocFormat>;
  /** D178: kapaktaki çalışma türü satırı için */
  workType: string;
  level: string;
  /** D173: tezde ön sayfalardaki tablo ve şekil listeleri (başlık sırasıyla) */
  lists: { tables: string[]; figures: string[]; tablesTitle: string; figuresTitle: string };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function buildExportDoc(params: {
  project: any;
  stages: any[];
  sources: any[];
  engineItems: CitationItem[];
  authorName: string;
  /** onlyStageIds: yalnızca seçilen bölümler aktarılır; numaralar tüm çalışmadaki yerlerini korur (D91) */
  options?: { numberHeadings?: boolean; onlyStageIds?: string[]; latexCitations?: boolean };
}): ExportDoc {
  const { project, stages } = params;
  const locale: CiteLocale = project.language === "en" || project.language === "de" ? project.language : "tr";
  const ordered = [...stages].sort((a, b) => a.position - b.position);
  const only = params.options?.onlyStageIds?.length ? new Set(params.options.onlyStageIds) : null;
  // Kaynakça yalnızca aktarılan bölümlerde atıf yapılan kaynakları içerir
  const order = citedIdsInOrder(ordered.filter((s) => !only || only.has(s.id)).map((s) => s.content as JSONNode));
  const engine = new CitationEngine(project.citation_style as CitationStyleId, params.engineItems, { locale, citedOrder: order });
  const doNumber = params.options?.numberHeadings ?? true;
  // Kullanıcının değiştirmediği aşama adları (sözlükte karşılığı olan Türkçe adlar) çalışmanın diline çevrilir
  const dict = dictFor(locale);
  const tl = (x: string) => (dict && dict[x]) || x;
  const firstSeen = new Set<string>();

  const blocks: Block[] = [];
  /** Tablo/şekil başlığı olabilecek paragraflar (komşu tablo/şekle göre sonradan karar verilir) */
  const capOf = new Map<Block, ParsedCaption>();
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
        if (params.options?.latexCitations) { out.push({ text: "", cite: { ids: a.ids, locator: a.locator, narrative: a.narrative, suppressAuthor: a.suppressAuthor, prefix: a.prefix, suffix: a.suffix } }); continue; }
        const first = a.ids.some((id) => !firstSeen.has(id));
        a.ids.forEach((id) => firstSeen.add(id));
        out.push(...richToRuns(engine.cite(a.ids, { locator: a.locator, narrative: a.narrative, suppressAuthor: a.suppressAuthor, prefix: a.prefix, suffix: a.suffix }, first)));
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
  /** Seçimli aktarımda ana bölüm başlığı, o ana bölümden ilk seçilen kısmın önüne eklenir */
  const ch: { head: { block: Block; toc: ExportDoc["toc"][number]; shown: boolean } | null; startedHere: boolean } = { head: null, startedHere: false };
  const startChapter = (runs: Run[], isNumbered: boolean) => {
    numbered = isNumbered;
    if (isNumbered) { chapter++; counters[0] = chapter - 1; }
    counters[1] = counters[2] = counters[3] = 0;
    lastLevel = 0;
    emit(1, runs);
    ch.head = { block: blocks[blocks.length - 1], toc: toc[toc.length - 1], shown: true };
    ch.startedHere = true;
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
        if (runs.some((r) => r.text.trim() || r.footnote || r.cite)) {
          const blk: Block = { kind: "paragraph", runs };
          const cap = runs.some((r) => r.footnote || r.cite) ? null : parseCaption(runsToPlain(runs));
          if (cap) capOf.set(blk, cap);
          blocks.push(blk);
        }
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
    if (st.key === "references" || NOT_IN_MANUSCRIPT.has(st.key) || st.hidden) continue;
    const doc = st.content as JSONNode | null;
    const hasText = (st.content_text ?? "").trim().length > 0;
    if (!hasText) continue;
    const def = stageDef(st.key);
    const title = tl(sectionTitle(st.key, st.title, def?.title, locale));
    const group = chapterGroup(st.key);
    const skipTitle = [st.title, def?.title ?? "", title].find((x) => x) ?? "";
    const b0 = blocks.length, t0 = toc.length;
    ch.startedHere = false;
    if (st.key === "title_abstract" || st.key === "article_body" || st.key === "front_matter") {
      // D170: Özet bölümü iş adıyla (“Başlık, özet ve anahtar kelimeler”) basılmaz; içindeki “Özet / Abstract” başlıkları
      // numarasız ana başlık olur. Konu bölümlerinin kendi başlığı yoktur; içindeki her ## başlık numaralı ana bölümdür.
      currentGroup = null;
      const isAbstract = st.key === "title_abstract";
      const isFront = st.key === "front_matter";
      numbered = !isAbstract && !isFront;
      counters[0] = chapter; counters[1] = counters[2] = counters[3] = 0;
      lastLevel = 0;
      const firstIsHeading = (doc?.content ?? []).find((n) => n.type === "heading" || (n.type === "paragraph" && (n.content ?? []).length));
      if (isAbstract && firstIsHeading?.type !== "heading") emit(1, [{ text: title || tl(st.title) }]);
      headingCtx = { shift: -1, skipTitle: isAbstract || isFront ? "" : skipTitle, seen: 0 };
      if (doc) visit(doc);
      if (isFront) { counters[0] = chapter; numbered = true; }
      else if (!isAbstract) chapter = counters[0];
      else for (let k = b0; k < blocks.length; k++) { const blk = blocks[k]; if (blk.kind === "heading" || blk.kind === "paragraph") blk.keep = "abstract"; }
      if (only && !only.has(st.id)) { blocks.splice(b0); toc.splice(t0); }
      continue;
    }
    if (group) {
      if (currentGroup !== group.id) { startChapter([{ text: group.title[locale] }], !UNNUMBERED_GROUPS.has(group.id)); currentGroup = group.id; }
      if (title) { emit(2, [{ text: title }]); headingCtx = { shift: 1, skipTitle, seen: 0 }; }
      else headingCtx = { shift: 0, skipTitle, seen: 0 }; // başlıksız açılış metni (Giriş’in ilk kısmı)
    } else {
      currentGroup = null;
      startChapter([{ text: title || tl(st.title) }], !UNNUMBERED.has(st.key));
      headingCtx = { shift: 0, skipTitle, seen: 0 };
    }
    if (doc) visit(doc);
    // Seçilmeyen bölüm: numaralandırma sürer ama içerik belgeye girmez
    if (only && !only.has(st.id)) {
      blocks.splice(b0); toc.splice(t0);
      if (ch.startedHere && ch.head) ch.head.shown = false;
    } else if (only && ch.head && !ch.head.shown) {
      blocks.splice(b0, 0, ch.head.block); toc.splice(t0, 0, ch.head.toc);
      ch.head.shown = true;
    }
  }

  const arranged = arrangeCaptions(blocks, capOf, String(project.citation_style ?? "apa7"), locale);
  const bib = engine.bibliography(order);
  const meta = engine.meta;
  return {
    title: project.title,
    author: params.authorName,
    institution: project.context?.university ?? "",
    subtitle: project.context?.subtitle ?? "",
    date: new Date().toLocaleDateString(LANG_TAG[locale], { year: "numeric", month: "long" }),
    language: locale,
    styleLabel: meta.label,
    numberHeadings: doNumber,
    toc,
    blocks: arranged,
    bibliographyTitle: meta.bibliographyTitle[locale],
    bibliography: bib.map((b) => ({ number: b.number, rich: b.rich })),
    numericBibliography: meta.family === "numeric",
    article: project.work_type === "journal_article" || project.work_type === "research_article",
    cover: resolveLayout(resolveFormat(project.context?.format), { workType: project.work_type, documentPurpose: project.context?.documentPurpose }) === "submission",
    format: project.context?.format ?? undefined,
    workType: String(project.work_type ?? ""),
    level: String(project.academic_level ?? ""),
    lists: {
      tables: arranged.flatMap((b) => (b.kind === "caption" && b.list === "table" ? [b.entry ?? ""] : [])),
      figures: arranged.flatMap((b) => (b.kind === "caption" && b.list === "figure" ? [b.entry ?? ""] : [])),
      tablesTitle: locale === "tr" ? "TABLOLAR LİSTESİ" : locale === "de" ? "TABELLENVERZEICHNIS" : "LIST OF TABLES",
      figuresTitle: locale === "tr" ? "ŞEKİLLER LİSTESİ" : locale === "de" ? "ABBILDUNGSVERZEICHNIS" : "LIST OF FIGURES",
    },
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function runsToPlain(runs: Run[]): string {
  return runs.map((r) => (r.footnote ? "" : r.text)).join("");
}

const isTarget = (b: Block | undefined): b is Extract<Block, { kind: "table" | "image" }> => !!b && (b.kind === "table" || b.kind === "image");

/**
 * Tablo ve şekil başlıklarını atıf stiline göre biçimlendirir ve konumlandırır (D106). Bir paragraf ancak bir tablo
 * veya şeklin hemen önünde/arkasında duruyorsa başlık sayılır; başlık kalıbı (Tablo 1. …, APA 7’nin iki satırlı
 * biçimi, IEEE’nin TABLO I biçimi…) hangi stilde yazılmış olursa olsun güncel stile çevrilir. Hemen ardından gelen
 * “Not.”/“Not:” paragrafının etiketi de stile uyarlanır.
 */
export function arrangeCaptions(blocks: Block[], capOf: Map<Block, ParsedCaption>, style: string, lang: CiteLocale): Block[] {
  const out: Block[] = [];
  const plain = (b: Block) => (b.kind === "paragraph" ? runsToPlain(b.runs) : "");
  const make = (kind: "table" | "figure", no: number, title: string) => {
    const f = formatCaption(style, kind, no, title, lang);
    const lines = f.lines.map((l) => l.map((r) => ({ text: r.text, bold: r.bold, italic: r.italic })));
    const entry = lines.map((l) => l.map((r) => r.text).join("")).join(" ").replace(/\s+/g, " ").trim();
    return { pos: f.position, block: { kind: "caption", lines, align: f.align, list: kind, entry } as Block };
  };
  const pushNotes = (from: number): number => {
    let i = from;
    while (i < blocks.length && blocks[i].kind === "paragraph" && parseNote(plain(blocks[i])) !== null && !capOf.has(blocks[i])) {
      const rest = parseNote(plain(blocks[i]))!;
      const lbl = noteLabel(style, lang);
      out.push({ kind: "paragraph", runs: [{ text: lbl.text, italic: lbl.italic }, { text: rest ? ` ${rest}` : "" }] });
      i++;
    }
    return i;
  };
  const place = (pos: "above" | "below", cap: Block, target: Block) => { if (pos === "above") out.push(cap, target); else out.push(target, cap); };
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    const cap = capOf.get(b);
    if (cap) {
      // Başlık hedefin üstünde (APA 7’de iki satır olabilir: “Tablo 1” + başlık paragrafı)
      let j = i + 1, title = cap.title;
      if (cap.labelOnly && blocks[j]?.kind === "paragraph" && !capOf.has(blocks[j]) && isTarget(blocks[j + 1])) { title = plain(blocks[j]).trim(); j++; }
      const target = blocks[j];
      if (isTarget(target)) {
        const c = make(target.kind === "image" ? "figure" : "table", cap.no, title);
        place(c.pos, c.block, target);
        i = pushNotes(j + 1);
        continue;
      }
    }
    if (isTarget(b)) {
      // Başlık hedefin altında (şekil altı yazılmış başlık)
      const next = blocks[i + 1];
      const nc = next ? capOf.get(next) : undefined;
      const afterIsTarget = isTarget(blocks[i + 2]) || (nc?.labelOnly && isTarget(blocks[i + 3]));
      if (nc && !afterIsTarget) {
        let j = i + 2, title = nc.title;
        if (nc.labelOnly && blocks[j]?.kind === "paragraph" && !capOf.has(blocks[j])) { title = plain(blocks[j]).trim(); j++; }
        const c = make(b.kind === "image" ? "figure" : "table", nc.no, title);
        place(c.pos, c.block, b);
        i = pushNotes(j);
        continue;
      }
    }
    out.push(b);
    i++;
  }
  return out;
}
