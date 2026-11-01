import "server-only";
import {
  AlignmentType, Document, Footer, FootnoteReferenceRun, HeadingLevel, LevelFormat, Packer, PageBreak, PageNumber, Paragraph,
  Table, TableCell, TableOfContents, TableRow, TextRun, WidthType, BorderStyle, ImageRun,
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

  const body: (Paragraph | Table | TableOfContents)[] = [];

  // Kapak (şablondaki kurum bilgileriyle)
  const cv = coverLines(f, d);
  const center = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; before?: number } = {}) =>
    text.split("\n").forEach((tx, k) => body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: k === 0 ? o.before ?? 0 : 0, line: 300 }, children: [new TextRun({ text: tx, bold: o.bold, italics: o.italics, size: o.size ?? size, font })] })));
  cv.top.forEach((tx, k) => center(tx, { bold: true, before: k === 0 ? 0 : 0 }));
  center(cv.title, { bold: true, size: 32, before: cv.top.length ? 2400 : 3200 });
  if (cv.subtitle) center(cv.subtitle, { italics: true, size: 26, before: 200 });
  if (cv.thesisType) center(cv.thesisType, { bold: true, before: 1600 });
  if (cv.author) center(cv.author, { before: cv.thesisType ? 800 : 1600 });
  if (cv.advisor) center(cv.advisor, { before: 800 });
  if (!f.cover.university && d.institution) center(d.institution, { before: 400 });
  center(cv.bottom, { before: 2400 });
  body.push(new Paragraph({ children: [new PageBreak()] }));

  // İçindekiler (Word açılışta alanları günceller)
  body.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: d.language === "tr" ? "İçindekiler" : "Contents", font, bold: true, size: 28 })] }));
  body.push(new TableOfContents(d.language === "tr" ? "İçindekiler" : "Contents", { hyperlink: true, headingStyleRange: "1-3" }));
  body.push(new Paragraph({ children: [new PageBreak()] }));

  let firstChapter = true;
  for (const b of d.blocks) {
    if (b.kind === "heading") {
      if (b.level === 1 && !firstChapter && f.chapterOnNewPage) body.push(new Paragraph({ children: [new PageBreak()] }));
      if (b.level === 1) firstChapter = false;
      const htext = b.runs.map((r) => r.text).join("");
      const shown = b.level === 1 && f.chapterTitleUppercase ? htext.toLocaleUpperCase(d.language === "tr" ? "tr" : "en") : htext;
      body.push(new Paragraph({ heading: HEADINGS[b.level - 1], alignment: b.level === 1 && f.chapterTitleCenter ? AlignmentType.CENTER : AlignmentType.LEFT, spacing: { before: 240, after: 120 }, children: [new TextRun({ text: `${b.number ? `${b.number} ` : ""}${shown}`, bold: true, font, size: b.level === 1 ? Math.max(size, 28) : size, color: "000000" })] }));
    } else if (b.kind === "paragraph") {
      body.push(new Paragraph({ alignment: f.justify ? AlignmentType.JUSTIFIED : AlignmentType.LEFT, spacing: { line, after }, indent: b.quote ? { left: 720, right: 720 } : { firstLine: Math.round(f.firstLineIndentCm * CM) }, children: runs(b.runs) }));
    } else if (b.kind === "caption") {
      body.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: runs(b.runs.map((r) => ({ ...r, italic: true }))) }));
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
    body.push(new Paragraph({ children: [new PageBreak()] }));
    body.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: d.bibliographyTitle, bold: true, font, size: 28 })] }));
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
    creator: "Akademi AI",
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
      properties: { page: { margin: { top: Math.round(f.margins.top * CM), bottom: Math.round(f.margins.bottom * CM), left: Math.round(f.margins.left * CM), right: Math.round(f.margins.right * CM) } } },
      ...(f.pageNumber === "top-right"
        ? { headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ children: [PageNumber.CURRENT], font, size: 20 })] })] }) } }
        : { footers: { default: new Footer({ children: [new Paragraph({ alignment: f.pageNumber === "bottom-right" ? AlignmentType.RIGHT : AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font, size: 20 })] })] }) } }),
      children: body,
    }],
  });
  return Packer.toBuffer(doc);
}
