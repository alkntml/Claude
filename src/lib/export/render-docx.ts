import "server-only";
import {
  AlignmentType, Document, Footer, FootnoteReferenceRun, HeadingLevel, LevelFormat, Packer, PageBreak, PageNumber, Paragraph,
  Table, TableCell, TableRow, TextRun, WidthType, BorderStyle, ImageRun,
  Bookmark, InternalHyperlink, LeaderType, PageReference, TabStopType, HeightRule, VerticalAlign,
} from "docx";
import { figurePng, type ExportDoc, type Run } from "./model";
import { CM, coverLines, resolveFormat, type DocFormat } from "./format";
import { Header } from "docx";

const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];

export async function toDocx(d: ExportDoc, raw: Partial<DocFormat> = {}): Promise<Buffer> {
  const f = resolveFormat(raw);
  const font = f.fontFamily;
  const size = f.fontSizePt * 2;
  const line = Math.round(f.lineSpacing * 240);
  const after = f.paragraphAfterPt * 20;
  const footnotes: Record<number, { children: Paragraph[] }> = {};
  let fnId = 0;

  const runs = (rs: Run[]) =>
    rs.map((r) => {
      if (r.footnote !== undefined) {
        fnId++;
        footnotes[fnId] = { children: [new Paragraph({ children: [new TextRun({ text: r.footnote, size: 20, font })] })] };
        return new FootnoteReferenceRun(fnId);
      }
      return new TextRun({ text: r.text, bold: r.bold, italics: r.italic, underline: r.underline ? {} : undefined, superScript: r.sup, font, size });
    });

  const body: (Paragraph | Table)[] = [];

  // D170/D178: dergi gönderim düzeni (kapaksız) — başlık ve yazar ilk sayfanın üstünde, bölümler kesintisiz
  if (!d.cover) {
    body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: d.title, bold: true, font, size: 28 })] }));
    if (d.subtitle) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: d.subtitle, italics: true, font, size: 24 })] }));
    if (d.author) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: d.author, font, size })] }));
    if (d.institution) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 360 }, children: [new TextRun({ text: d.institution, italics: true, font, size: size - 2 })] }));
  }

  // D178: kapak — Türk üniversitelerinde yaygın düzen. Üstte 3×3 cm logo alanı; kurum satırları 12 punto kalın, tek aralık;
  // başlık 14 punto kalın büyük harf; çalışma türü, yazar ve danışman; en altta ŞEHİR – AY YIL. Hepsi ortalı.
  const cv = coverLines(f, d);
  if (d.cover) {
    const center = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; before?: number } = {}) =>
      text.split("\n").forEach((tx, k) => body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: k === 0 ? o.before ?? 0 : 0, after: 0, line: 276 }, children: [new TextRun({ text: tx, bold: o.bold, italics: o.italics, size: o.size ?? 24, font })] })));
    if (cv.logo) {
      const dash = { style: BorderStyle.DASHED, size: 4, color: "A0A0A0" };
      body.push(new Table({
        alignment: AlignmentType.CENTER, width: { size: 3 * CM, type: WidthType.DXA }, columnWidths: [3 * CM],
        rows: [new TableRow({ height: { value: 3 * CM, rule: HeightRule.EXACT }, children: [new TableCell({ width: { size: 3 * CM, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, borders: { top: dash, bottom: dash, left: dash, right: dash },
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.language === "tr" ? "Üniversite logosu" : d.language === "de" ? "Hochschullogo" : "University logo", size: 14, color: "A0A0A0", font })] })] })] })],
      }));
    }
    cv.top.forEach((tx, k) => center(tx, { bold: true, before: k === 0 ? (cv.logo ? 240 : 0) : 0 }));
    center(cv.title, { bold: true, size: 28, before: 1700 });
    if (cv.subtitle) center(cv.subtitle, { italics: true, size: 24, before: 200 });
    if (cv.thesisType) center(cv.thesisType, { bold: true, before: 1200 });
    if (cv.author) center(cv.author, { bold: true, before: 1000 });
    if (cv.advisor) center(cv.advisor, { before: 800 });
    center(cv.bottom, { bold: true, before: 2000 });
    body.push(new Paragraph({ children: [new PageBreak()] }));
  }

  // İçindekiler: girişler dosyaya hazır yazılır (Word alan güncellemesi yapmasa, Mac Word / Pages / Google Dokümanlar’da da
  // görünür). Her giriş başlığa bağlantılıdır; sayfa numaraları PAGEREF alanıyla Word açılışta güncellenir.
  // D178: kapaklı teslim düzeninde makalede de içindekiler ve (varsa) tablo/şekil listeleri basılır
  if (d.cover) {
  body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: d.language === "tr" ? "İÇİNDEKİLER" : d.language === "de" ? "INHALTSVERZEICHNIS" : "CONTENTS", font, bold: true, size: 28 })] }));
  const textWidth = Math.round((21 - f.margins.left - f.margins.right) * CM);
  const tocEntry = (anchor: string, text: string, level: number, bold = level === 1) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: textWidth, leader: LeaderType.DOT }],
    indent: { left: (level - 1) * 400 },
    spacing: { line: 300, after: 60 },
    children: [new InternalHyperlink({ anchor, children: [new TextRun({ text, font, size, bold }), new TextRun({ text: "\t", font, size })] }), new PageReference(anchor, { hyperlink: true })],
  });
  d.toc.forEach((t, k) => body.push(tocEntry(`_Toc${k + 1}`, `${t.number ? `${t.number} ` : ""}${t.level === 1 && f.chapterTitleUppercase ? t.text.toLocaleUpperCase(d.language) : t.text}`, t.level)));
  if (d.bibliography.length) body.push(tocEntry("_TocBib", d.bibliographyTitle, 1));
  body.push(new Paragraph({ children: [new PageBreak()] }));
  // D173: tablolar ve şekiller listesi (tezde ön sayfalar; yalnızca başlıklı tablo/şekil varsa)
  for (const [kind, items, title] of [["Lot", d.lists.tables, d.lists.tablesTitle], ["Lof", d.lists.figures, d.lists.figuresTitle]] as const) {
    if (!items.length) continue;
    body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240 }, children: [new TextRun({ text: title, bold: true, font, size: 28 })] }));
    items.forEach((text, k) => body.push(tocEntry(`_${kind}${k + 1}`, text, 1, false)));
    body.push(new Paragraph({ children: [new PageBreak()] }));
  }
  }
  const capNo = { table: 0, figure: 0 };
  let tocIdx = 0;

  let firstChapter = true;
  for (const [bi, b] of d.blocks.entries()) {
    if (b.kind === "heading") {
      if (b.level === 1 && !firstChapter && f.chapterOnNewPage && !d.article) body.push(new Paragraph({ children: [new PageBreak()] }));
      if (b.level === 1) firstChapter = false;
      const htext = b.runs.map((r) => r.text).join("");
      const shown = b.level === 1 && f.chapterTitleUppercase ? htext.toLocaleUpperCase(d.language) : htext;
      const hrun = new TextRun({ text: `${b.number ? `${b.number} ` : ""}${shown}`, bold: true, font, size: b.level === 1 ? Math.max(size, 28) : size, color: "000000" });
      // İçindekiler girişleri (model.toc) başlıklarla birebir aynı sırada
      const anchor = `_Toc${++tocIdx}`;
      body.push(new Paragraph({ heading: HEADINGS[b.level - 1], keepNext: true, keepLines: true, alignment: b.level === 1 && f.chapterTitleCenter ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 240, after: 120 }, children: [new Bookmark({ id: anchor, children: [hrun] })] }));
    } else if (b.kind === "paragraph") {
      // D170: özet/abstract bloğu (metin + anahtar kelimeler) sayfa arasında bölünmez
      const nx = d.blocks[bi + 1];
      const keepAbs = b.keep === "abstract" ? { keepLines: true, keepNext: nx?.kind === "paragraph" && nx.keep === "abstract" } : {};
      // Özet/abstract: tek satır aralığı, bir punto küçük, girintisiz (dergi düzeni)
      if (b.keep === "abstract") body.push(new Paragraph({ ...keepAbs, alignment: AlignmentType.JUSTIFIED, spacing: { line: 240, after }, children: runs(b.runs) }));
      else body.push(new Paragraph({ ...keepAbs, alignment: f.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT, spacing: { line, after }, indent: b.quote ? { left: 720, right: 720 } : { firstLine: Math.round(f.firstLineIndentCm * CM) }, children: runs(b.runs) }));
    } else if (b.kind === "caption") {
      // D106: satırlar ve biçim (kalın/italik/ortalı) atıf stiline göre modelde hazırlanır
      // D173: tablo/şekil listesindeki sayfa numarası için başlığın ilk satırı yer imiyle işaretlenir
      const mark = d.cover && b.list ? `_${b.list === "table" ? "Lot" : "Lof"}${++capNo[b.list]}` : "";
      b.lines.forEach((l, k) => body.push(new Paragraph({ alignment: b.align === "center" ? AlignmentType.CENTER : AlignmentType.LEFT, keepNext: true, spacing: { before: k === 0 ? 120 : 0, after: k === b.lines.length - 1 ? 60 : 0 }, children: k === 0 && mark ? [new Bookmark({ id: mark, children: runs(l) })] : runs(l) })));
    } else if (b.kind === "image") {
      // Metin genişliği ~15 cm (≈ 567 px @96dpi); şekil oranı korunur
      const w = Math.min(560, b.width), h = Math.round((w * b.height) / b.width);
      body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 160 }, children: [new ImageRun({ type: "png", data: figurePng(b.src), transformation: { width: w, height: h }, altText: { name: "figure", description: b.alt, title: b.alt } })] }));
    } else if (b.kind === "list") {
      b.items.forEach((it) => body.push(new Paragraph({ numbering: { reference: b.ordered ? "ordered" : "bullets", level: 0 }, spacing: { line }, children: runs(it) })));
    } else if (b.kind === "table") {
      const cols = Math.max(...b.rows.map((r) => r.length));
      body.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: { top: { style: BorderStyle.SINGLE, size: 6, color: "000000" }, bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000" }, left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } },
        rows: b.rows.map((r, ri) => new TableRow({
          tableHeader: ri === 0 && b.header,
          children: Array.from({ length: cols }, (_, ci) => new TableCell({
            borders: ri === 0 && b.header ? { bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" } } : undefined,
            children: [new Paragraph({ children: runs((r[ci] ?? []).map((x) => ({ ...x, bold: x.bold || (ri === 0 && b.header) }))) })],
          })),
        })),
      }));
      body.push(new Paragraph({ text: "" }));
    }
  }

  if (d.bibliography.length) {
    if (!d.article) body.push(new Paragraph({ children: [new PageBreak()] }));
    body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new Bookmark({ id: "_TocBib", children: [new TextRun({ text: d.bibliographyTitle, bold: true, font, size: 28 })] })] }));
    for (const e of d.bibliography) {
      const children = [
        ...(d.numericBibliography ? [new TextRun({ text: `[${e.number}]\t`, font, size })] : []),
        ...e.rich.map((s) => new TextRun({ text: s.text, italics: s.italic, superScript: s.sup, font, size })),
      ];
      // Yazar-tarih stillerinde asılı girinti (hanging indent)
      body.push(new Paragraph({ spacing: { line, after: 120 }, indent: d.numericBibliography ? { left: 567, hanging: 567 } : { left: 720, hanging: 720 }, children }));
    }
  }

  const doc = new Document({
    creator: "Academiana",
    title: d.title,
    features: { updateFields: true },
    footnotes,
    styles: { default: { document: { run: { font, size } } } },
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        { reference: "ordered", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ],
    },
    sections: [{
      // D178: kapak sayfasında sayfa numarası basılmaz (farklı ilk sayfa)
      properties: { titlePage: d.cover, page: { margin: { top: Math.round(f.margins.top * CM), bottom: Math.round(f.margins.bottom * CM), left: Math.round(f.margins.left * CM), right: Math.round(f.margins.right * CM) } } },
      ...(f.pageNumber === "top-right"
        ? { headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font, size: 20 })] })] }), ...(d.cover ? { first: new Header({ children: [] }) } : {}) } }
        : { footers: { default: new Footer({ children: [new Paragraph({ alignment: f.pageNumber === "bottom-right" ? AlignmentType.RIGHT : AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font, size: 20 })] })] }), ...(d.cover ? { first: new Footer({ children: [] }) } : {}) } }),
      children: body,
    }],
  });
  return Packer.toBuffer(doc);
}
