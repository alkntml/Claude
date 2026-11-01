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

describe("export", () => {
  it("renders citations in the project style and builds a bibliography", () => {
    const md = toMarkdown(doc);
    expect(md).toContain("## 1 Kavramsal çerçeve");
    expect(md).toContain("### 1.1 Bağlanma");
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
