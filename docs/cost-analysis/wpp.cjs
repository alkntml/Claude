// Sistemin tez biçimiyle (format.ts: Times New Roman 12, 1.5 satır, kenarlar 3/2.5/3.5/2.5 cm, ilk satır 1.25 cm,
// paragraf sonrası 6 pt, iki yana yaslı) gerçek Türkçe metinden Word belgesi üretir. Biçim seçenekleri argümanla değişir.
const fs = require("fs");
const path = require("path");
const docx = require("/home/user/Claude/node_modules/docx");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = docx;

const DIR = path.join(__dirname, "corpus");
const [, , out, spacingArg, nWordsArg, fontPtArg, mTop, mBottom, mLeft, mRight, indentArg, afterArg] = process.argv;
const spacing = Number(spacingArg || 1.5), nWords = Number(nWordsArg || 12000), fontPt = Number(fontPtArg || 12);
const cm = (v) => Math.round(Number(v) * 567);
// Türkçe paragraflar: yalnızca uzun, çoğunlukla Türkçe karakter içeren satır blokları
const raw = fs.readdirSync(DIR).filter((f) => /^dp_\d+\.txt$/.test(f)).map((f) => fs.readFileSync(path.join(DIR, f), "utf8")).join("\n");
const paras = raw.split(/\n\s*\n/).map((p) => p.replace(/\s+/g, " ").trim()).filter((p) => p.split(" ").length > 60 && /[çğışöü]/.test(p) && (p.match(/[çğışöü]/g) || []).length / p.length > 0.02);
const children = [];
let words = 0, i = 0, h = 0;
while (words < nWords) {
  if (i % 6 === 0) children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120, line: Math.round(240 * spacing) }, children: [new TextRun({ text: `2.${++h} Alt Başlık ${h}`, bold: true, font: "Times New Roman", size: fontPt * 2 })] }));
  const p = paras[i % paras.length];
  // Paragraf uzunluğu akademik yazıya yakın tutulur (90–160 kelime)
  const w = p.split(" ").slice(0, 90 + (i * 37) % 70).join(" ");
  words += w.split(" ").length;
  children.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, indent: { firstLine: cm(indentArg || 1.25) }, spacing: { after: Number(afterArg || 6) * 20, line: Math.round(240 * spacing) }, children: [new TextRun({ text: w, font: "Times New Roman", size: fontPt * 2 })] }));
  i++;
}
const doc = new Document({ sections: [{ properties: { page: { size: { width: cm(21), height: cm(29.7) }, margin: { top: cm(mTop || 3), bottom: cm(mBottom || 2.5), left: cm(mLeft || 3.5), right: cm(mRight || 2.5) } } }, children }] });
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(out, b); console.log(JSON.stringify({ words, paragraphs: i, headings: h })); });
