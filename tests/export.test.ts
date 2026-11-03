import { describe, expect, it } from "vitest";
import { buildExportDoc } from "@/lib/export/model";
import { toDocx } from "@/lib/export/render-docx";
import { toPdf } from "@/lib/export/render-pdf";
import { toMarkdown, toText } from "@/lib/export/render-text";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { verifyStripeSignature } from "@/lib/payments";
import { summarize } from "@/lib/files/stats";
import { chunkText } from "@/lib/files/chunk";
import crypto from "node:crypto";

const sources = [
  { id: "s1", type: "article-journal", title: "Relationship obsessive compulsive disorder", authors: [{ family: "Doron", given: "Guy" }, { family: "Derby", given: "Danny" }, { family: "Szepsenwol", given: "Ohad" }], year: 2014, container_title: "Journal of OCRD", volume: "3", issue: "2", pages: "169-180", doi: "10.1016/j.jocrd.2013.12.005" },
  { id: "s2", type: "book", title: "Attachment and loss", authors: [{ family: "Bowlby", given: "John" }], year: 1969, publisher: "Basic Books" },
];
const stages = [
  { id: "a", key: "concepts", title: "Kavramsal çerçeve", position: 0, content_text: "x", content: { type: "doc", content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Bağlanma" }] },
    { type: "paragraph", content: [{ type: "text", text: "Bağlanma kuramı temel bir çerçevedir " }, { type: "citation", attrs: { ids: ["s2"], locator: null, narrative: false } }, { type: "text", text: ". Şüphe ve kontrol davranışları " }, { type: "citation", attrs: { ids: ["s1"], locator: "170", narrative: false } }, { type: "footnote", attrs: { text: "Ayrıntı için bkz. Ek 1." } }, { type: "text", text: " ğüşıöç İĞÜŞÖÇ." }] },
    { type: "table", content: [{ type: "tableRow", content: [{ type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Değişken" }] }] }, { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "Ort." }] }] }] }, { type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "ROCD" }] }] }, { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "2.4" }] }] }] }] },
  ] } },
  { id: "b", key: "references", title: "Kaynakça", position: 1, content_text: "", content: null },
];
const project = { title: "İlişki odaklı OKB çalışması", citation_style: "apa7", language: "tr", context: { university: "Örnek Üniversitesi" } };
const doc = buildExportDoc({ project, stages, sources, engineItems: sources.map(sourceRowToItemClient), authorName: "Ayşe Yılmaz" });

describe("akademik bölüm yapısı (D76)", () => {
  const p = (t: string) => ({ type: "paragraph", content: [{ type: "text", text: t }] });
  const h = (level: number, t: string) => ({ type: "heading", attrs: { level }, content: [{ type: "text", text: t }] });
  const st = (id: string, key: string, title: string, position: number, content: unknown[]) => ({ id, key, title, position, content_text: "metin", content: { type: "doc", content } });
  const thesis = [
    st("1", "topic", "Araştırma konusunun belirlenmesi", 0, [h(2, "Araştırma Konusunun Belirlenmesi"), p("Giriş metni.")]),
    st("2", "problem", "Araştırma probleminin tanımlanması", 1, [p("Problem metni."), h(3, "Atlanan düzey")]),
    st("3", "purpose", "Araştırmanın amacı ve önemi", 2, [h(2, "Araştırmanın Amacı ve Önemi"), p("Amaç.")]),
    st("4", "method", "Araştırmanın yöntemi", 3, [p("Model.")]),
    st("5", "sample", "Evren ve örneklem", 4, [p("Örneklem.")]),
    st("6", "findings", "Bulgular", 5, [h(2, "Bulgular"), h(2, "Betimsel bulgular"), p("…")]),
  ];
  const d = buildExportDoc({ project, stages: thesis, sources: [], engineItems: [], authorName: "" });
  const toc = d.toc.map((x) => `${x.number} ${x.text}`);
  it("ardışık aşamalar ana bölümlerde toplanır, aşama adları akademik başlığa dönüşür", () => {
    expect(toc).toEqual([
      "1 GİRİŞ", "1.1 Problem Durumu", "1.1.1 Atlanan düzey", "1.2 Araştırmanın Amacı ve Önemi",
      "2 YÖNTEM", "2.1 Araştırma Modeli", "2.2 Evren ve Örneklem",
      "3 BULGULAR", "3.1 Betimsel bulgular",
    ]);
  });
  it("aşama adını tekrar eden ilk başlık atlanır; “x.0.y” numarası oluşmaz", () => {
    expect(toc.some((x) => /\.0\./.test(x))).toBe(false);
    expect(toc.filter((x) => /Amacı ve Önemi/.test(x))).toHaveLength(1);
    expect(toc.some((x) => /Konusunun Belirlenmesi/.test(x))).toBe(false);
  });
  it("kullanıcı aşama adını değiştirdiyse kendi adı kullanılır", () => {
    const d2 = buildExportDoc({ project, stages: [st("1", "problem", "Sorunun Tarihsel Arka Planı", 0, [p("x")])], sources: [], engineItems: [], authorName: "" });
    expect(d2.toc.map((x) => x.text)).toEqual(["GİRİŞ", "Sorunun Tarihsel Arka Planı"]);
  });
});

describe("export", () => {
  it("renders citations in the project style and builds a bibliography", () => {
    const md = toMarkdown(doc);
    expect(md).toContain("## 1 KURAMSAL ÇERÇEVE VE İLGİLİ ARAŞTIRMALAR");
    expect(md).toContain("### 1.1 Temel Kavramlar");
    expect(md).toContain("#### 1.1.1 Bağlanma");
    expect(md).toContain("(Bowlby, 1969)");
    expect(md).toContain("(Doron vd., 2014, s. 170)");
    expect(md).toContain("[^1]");
    expect(md).toContain("## Kaynakça");
    expect(md.indexOf("Bowlby, J. (1969)")).toBeLessThan(md.indexOf("Doron, G."));
    expect(toText(doc)).toContain("KAYNAKÇA");
  });
  it("switching style changes all citations", () => {
    const ieee = buildExportDoc({ project: { ...project, citation_style: "ieee" }, stages, sources, engineItems: sources.map(sourceRowToItemClient), authorName: "" });
    const md = toMarkdown(ieee);
    expect(md).toContain("[1]");
    expect(md).toContain("[2, s. 170]");
    expect(md).toContain("1. J. Bowlby");
  });
  it("produces a valid DOCX (zip) and PDF", async () => {
    const docx = await toDocx(doc);
    expect(docx.subarray(0, 2).toString("latin1")).toBe("PK");
    expect(docx.length).toBeGreaterThan(5000);
    const pdf = await toPdf(doc);
    expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(10000);
  });
});

describe("misc server utils", () => {
  it("verifies Stripe webhook signatures", () => {
    const payload = '{"id":"evt_1"}';
    const t = Math.floor(Date.now() / 1000);
    const sig = crypto.createHmac("sha256", "whsec_test").update(`${t}.${payload}`).digest("hex");
    expect(verifyStripeSignature(payload, `t=${t},v1=${sig}`, "whsec_test")).toBe(true);
    expect(verifyStripeSignature(payload, `t=${t},v1=${"0".repeat(64)}`, "whsec_test")).toBe(false);
    expect(verifyStripeSignature(payload, `t=${t - 1000},v1=${sig}`, "whsec_test")).toBe(false);
  });
  it("computes descriptive statistics and correlations", () => {
    const s = summarize([["yas", "puan", "cinsiyet"], ["20", "3,5", "K"], ["22", "4,0", "E"], ["24", "4,5", "K"], ["", "5", "K"]]);
    expect(s.rows).toBe(4);
    const yas = s.columns[0];
    expect(yas).toMatchObject({ kind: "numeric", n: 3, missing: 1, mean: 22, sd: 2, median: 22 });
    expect(s.columns[2]).toMatchObject({ kind: "categorical", distinct: 2 });
    expect(s.correlations[0]).toMatchObject({ a: "yas", b: "puan", r: 1, n: 3 });
  });
  it("chunks pages with page hints", () => {
    const chunks = chunkText({ pages: ["a ".repeat(900), "b ".repeat(200)], text: "" });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].pageHint).toBe("s. 1");
    expect(chunks.at(-1)?.pageHint).toBe("s. 2");
  });
});

describe("şekiller (grafik) dışa aktarımı", () => {
  // 3×2 piksellik geçerli PNG (zlib ile üretilir)
  function tinyPng(): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const zlib = require("node:zlib") as typeof import("node:zlib");
    const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
    const crc = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
    const chunk = (type: string, data: Buffer) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(3, 0); ihdr.writeUInt32BE(2, 4); ihdr[8] = 8; ihdr[9] = 2;
    const raw = Buffer.alloc(2 * (1 + 3 * 3), 255); raw[0] = 0; raw[10] = 0;
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
    return `data:image/png;base64,${png.toString("base64")}`;
  }
  const figStages = [{ ...stages[0], content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Şekil 1. Ortalamalar", marks: [{ type: "italic" }] }] }, { type: "figure", attrs: { src: tinyPng(), alt: "Ortalamalar" } }, { type: "figure", attrs: { src: "https://example.com/x.png", alt: "dış" } }] } }];
  const fd = buildExportDoc({ project, stages: figStages, sources, engineItems: sources.map(sourceRowToItemClient), authorName: "" });
  it("yalnızca gömülü PNG kabul edilir, boyut okunur", () => {
    const imgs = fd.blocks.filter((b) => b.kind === "image");
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toMatchObject({ width: 3, height: 2, alt: "Ortalamalar" });
  });
  it("Word ve PDF şekli içerir, metin çıktısı yer tutucu yazar", async () => {
    const docx = await toDocx(fd);
    expect(docx.includes(Buffer.from("word/media/"))).toBe(true);
    const pdf = await toPdf(fd);
    expect(pdf.includes(Buffer.from("/Subtype /Image"))).toBe(true);
    expect(toText(fd)).toContain("[Ortalamalar]");
  });
});
