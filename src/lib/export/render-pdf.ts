import "server-only";
import path from "node:path";
import PDFDocument from "pdfkit";
import type { ExportDoc, Run } from "./model";

const FONT_DIR = path.join(process.cwd(), "assets", "fonts");
const F = {
  regular: path.join(FONT_DIR, "DejaVuSerif.ttf"),
  bold: path.join(FONT_DIR, "DejaVuSerif-Bold.ttf"),
  italic: path.join(FONT_DIR, "DejaVuSerif-Italic.ttf"),
  boldItalic: path.join(FONT_DIR, "DejaVuSerif-BoldItalic.ttf"),
};

/** PDF: A4, Türkçe karakter destekli gömülü yazı tipi, sayfa numarası, dipnotlar bölüm sonunda. */
export async function toPdf(d: ExportDoc): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margins: { top: 72, bottom: 72, left: 85, right: 72 }, bufferPages: true, info: { Title: d.title, Author: d.author, Creator: "Akademi AI" } });
  doc.registerFont("r", F.regular).registerFont("b", F.bold).registerFont("i", F.italic).registerFont("bi", F.boldItalic);
  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on("end", () => res(Buffer.concat(chunks))));

  const notes: string[] = [];
  const fontOf = (r: Run) => (r.bold && r.italic ? "bi" : r.bold ? "b" : r.italic ? "i" : "r");
  const writeRuns = (runs: Run[], opts: PDFKit.Mixins.TextOptions & { size?: number } = {}) => {
    const size = opts.size ?? 11.5;
    const list = runs.map((r) => (r.footnote !== undefined ? (notes.push(r.footnote), { text: String(notes.length), sup: true, bold: false, italic: false }) : r)).filter((r) => r.text);
    if (!list.length) return;
    list.forEach((r, k) => {
      doc.font(fontOf(r)).fontSize(r.sup ? size * 0.65 : size);
      doc.text(r.text, { ...opts, continued: k < list.length - 1, ...(r.sup ? { rise: size * 0.35 } as object : {}) });
    });
  };

  // Kapak
  doc.moveDown(8).font("b").fontSize(20).text(d.title, { align: "center" });
  if (d.subtitle) doc.moveDown(0.6).font("i").fontSize(14).text(d.subtitle, { align: "center" });
  doc.moveDown(3).font("r").fontSize(12);
  for (const t of [d.author, d.institution, d.date].filter(Boolean)) doc.text(t, { align: "center" }).moveDown(0.5);

  // İçindekiler (sayfa numarası olmadan; PDF yer imleri eklenir)
  doc.addPage().font("b").fontSize(15).text(d.language === "tr" ? "İçindekiler" : "Contents").moveDown();
  for (const t of d.toc) doc.font(t.level === 1 ? "b" : "r").fontSize(11).text(`${"    ".repeat(t.level - 1)}${t.number ? `${t.number}  ` : ""}${t.text}`, { lineGap: 3 });

  let started = false;
  for (const b of d.blocks) {
    if (b.kind === "heading") {
      if (b.level === 1) { doc.addPage(); started = true; }
      else doc.moveDown(0.6);
      const label = `${b.number ? `${b.number}  ` : ""}${b.runs.map((r) => r.text).join("")}`;
      doc.font("b").fontSize(b.level === 1 ? 15 : b.level === 2 ? 13 : 12).text(label, { align: "left" });
      if (b.level <= 2) doc.outline.addItem(label);
      doc.moveDown(0.5);
    } else if (b.kind === "paragraph") {
      if (!started) { doc.addPage(); started = true; }
      writeRuns(b.runs, { align: "justify", lineGap: 4, indent: b.quote ? 0 : 24, ...(b.quote ? { width: doc.page.width - 85 - 72 - 60 } : {}) });
      doc.moveDown(0.5);
    } else if (b.kind === "caption") {
      writeRuns(b.runs.map((r) => ({ ...r, italic: true })), { size: 10.5 });
      doc.moveDown(0.3);
    } else if (b.kind === "list") {
      b.items.forEach((it, k) => { writeRuns([{ text: b.ordered ? `${k + 1}. ` : "•  " }, ...it], { indent: 14, lineGap: 3 }); });
      doc.moveDown(0.5);
    } else if (b.kind === "table") {
      const cols = Math.max(...b.rows.map((r) => r.length));
      const width = doc.page.width - 85 - 72;
      const colW = width / cols;
      doc.moveTo(85, doc.y).lineTo(85 + width, doc.y).lineWidth(0.8).stroke();
      b.rows.forEach((row, ri) => {
        const y = doc.y + 4;
        let maxH = 0;
        for (let ci = 0; ci < cols; ci++) {
          const text = (row[ci] ?? []).map((r) => r.text).join("");
          doc.font(ri === 0 && b.header ? "b" : "r").fontSize(10);
          const h = doc.heightOfString(text, { width: colW - 6 });
          doc.text(text, 85 + ci * colW + 3, y, { width: colW - 6 });
          maxH = Math.max(maxH, h);
        }
        doc.y = y + maxH + 4;
        if (ri === 0 && b.header) doc.moveTo(85, doc.y).lineTo(85 + width, doc.y).lineWidth(0.5).stroke();
        if (doc.y > doc.page.height - 100) doc.addPage();
      });
      doc.moveTo(85, doc.y).lineTo(85 + width, doc.y).lineWidth(0.8).stroke();
      doc.x = 85;
      doc.moveDown();
    }
  }

  if (notes.length) {
    doc.moveDown().font("b").fontSize(12).text(d.language === "tr" ? "Notlar" : "Notes").moveDown(0.4);
    notes.forEach((n, k) => doc.font("r").fontSize(9.5).text(`${k + 1}. ${n}`, { lineGap: 2 }));
  }

  if (d.bibliography.length) {
    doc.addPage().font("b").fontSize(15).text(d.bibliographyTitle).moveDown();
    doc.outline.addItem(d.bibliographyTitle);
    for (const e of d.bibliography) {
      const runs: Run[] = [...(d.numericBibliography ? [{ text: `[${e.number}] ` }] : []), ...e.rich.map((s) => ({ text: s.text, italic: s.italic, sup: s.sup }))];
      // Asılı girinti: metin bloğu 22pt içeriden başlar, ilk satır sola taşar
      doc.x = 85 + 22;
      writeRuns(runs, { size: 11, lineGap: 3, indent: -22, width: doc.page.width - 85 - 72 - 22 });
      doc.x = 85;
      doc.moveDown(0.4);
    }
  }

  // Sayfa numaraları (kapak hariç)
  const range = doc.bufferedPageRange();
  for (let p = range.start + 1; p < range.start + range.count; p++) {
    doc.switchToPage(p);
    const bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font("r").fontSize(9).text(String(p), 0, doc.page.height - 40, { align: "center", width: doc.page.width });
    doc.page.margins.bottom = bottom;
  }
  doc.end();
  return done;
}
