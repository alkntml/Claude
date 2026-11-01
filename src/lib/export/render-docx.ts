import "server-only";
import {
  AlignmentType, Document, Footer, FootnoteReferenceRun, HeadingLevel, LevelFormat, Packer, PageBreak, PageNumber, Paragraph,
  Table, TableCell, TableOfContents, TableRow, TextRun, WidthType, BorderStyle,
} from "docx";
import type { ExportDoc, Run } from "./model";

const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4];

export async function toDocx(d: ExportDoc, opts: { fontFamily?: string; fontSizePt?: number; lineSpacing?: number } = {}): Promise<Buffer> {
  const font = opts.fontFamily ?? "Times New Roman";
  const size = (opts.fontSizePt ?? 12) * 2;
  const line = Math.round((opts.lineSpacing ?? 1.5) * 240);
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

  // Kapak
  body.push(new Paragraph({ spacing: { before: 2400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: d.title, bold: true, size: 32, font })] }));
  if (d.subtitle) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: d.subtitle, italics: true, size: 26, font })] }));
  for (const t of [d.author, d.institution, d.date].filter(Boolean)) body.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: t, size, font })] }));
  body.push(new Paragraph({ children: [new PageBreak()] }));

  // İçindekiler (Word açılışta alanları günceller)
  body.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: d.language === "tr" ? "İçindekiler" : "Contents", font, bold: true, size: 28 })] }));
  body.push(new TableOfContents(d.language === "tr" ? "İçindekiler" : "Contents", { hyperlink: true, headingStyleRange: "1-3" }));
  body.push(new Paragraph({ children: [new PageBreak()] }));

  let firstChapter = true;
  for (const b of d.blocks) {
    if (b.kind === "heading") {
      if (b.level === 1 && !firstChapter) body.push(new Paragraph({ children: [new PageBreak()] }));
      if (b.level === 1) firstChapter = false;
      body.push(new Paragraph({ heading: HEADINGS[b.level - 1], spacing: { before: 240, after: 120 }, children: [new TextRun({ text: `${b.number ? `${b.number} ` : ""}${b.runs.map((r) => r.text).join("")}`, bold: true, font, size: b.level === 1 ? 28 : size })] }));
    } else if (b.kind === "paragraph") {
      body.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line, after: 120 }, indent: b.quote ? { left: 720, right: 720 } : { firstLine: 567 }, children: runs(b.runs) }));
    } else if (b.kind === "caption") {
      body.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: runs(b.runs.map((r) => ({ ...r, italic: true }))) }));
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
      properties: { page: { margin: { top: 1418, bottom: 1418, left: 1701, right: 1418 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font, size: 20 })] })] }) },
      children: body,
    }],
  });
  return Packer.toBuffer(doc);
}
