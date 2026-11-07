import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildExportDoc } from "@/lib/export/model";
import { biblatexSetup, runsToTex, texEscape, texLocator, toLatexFiles, toLatexZip } from "@/lib/export/render-latex";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { bibKeyMap } from "@/lib/sources/bib";

// 1×1 şeffaf PNG
const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

export const LATEX_SOURCES = [
  { id: "s1", type: "article-journal", title: "Relationship obsessive compulsive disorder & attachment: 50% of cases", authors: [{ family: "Doron", given: "Guy" }, { family: "Derby", given: "Danny" }], year: 2014, container_title: "Journal of OCRD", volume: "3", issue: "2", pages: "169-180", doi: "10.1016/j.jocrd.2013.12.005" },
  { id: "s2", type: "book", title: "Bağlanma ve kayıp", authors: [{ family: "Bowlby", given: "John" }], year: 1969, publisher: "Basic Books" },
  { id: "s3", type: "article-journal", title: "Öz düzenleme ve başarı", authors: [{ family: "Doron", given: "Ayşe" }], year: 2014, container_title: "Eğitim Dergisi", volume: "1", pages: "1-10" },
];
const p = (...c: unknown[]) => ({ type: "paragraph", content: c });
const tx = (text: string, marks?: string[]) => ({ type: "text", text, ...(marks ? { marks: marks.map((type) => ({ type })) } : {}) });
const cite = (ids: string[], locator: string | null = null, narrative = false) => ({ type: "citation", attrs: { ids, locator, narrative } });
export const LATEX_STAGES = [
  { id: "a", key: "concepts", title: "Kavramsal çerçeve", position: 0, content_text: "x", content: { type: "doc", content: [
    { type: "heading", attrs: { level: 2 }, content: [tx("Bağlanma & ilişki_kuramı")] },
    p(tx("Bağlanma kuramı temel bir çerçevedir "), cite(["s2"]), tx(". "), cite(["s1"], "s. 170", true), tx(" %50 oranını bildirmiştir"), { type: "footnote", attrs: { text: "Ayrıntı için bkz. Ek 1 — $ ve # işaretleri." } }, tx(" ğüşıöç İĞÜŞÖÇ "), tx("kalın", ["bold"]), tx(" ve "), tx("italik", ["italic"]), tx(".")),
    p(tx("Birden çok kaynak "), cite(["s1", "s3"], "ss. 12-14"), tx(" ve “tırnak” … ~ ^ \\ işaretleri.")),
    { type: "bulletList", content: [{ type: "listItem", content: [p(tx("Birinci madde"))] }, { type: "listItem", content: [p(tx("İkinci madde "), cite(["s3"]))] }] },
    p(tx("Tablo 1"), { type: "hardBreak" }, tx("Değişkenlere ilişkin ortalamalar")),
    { type: "table", content: [{ type: "tableRow", content: [{ type: "tableHeader", content: [p(tx("Değişken"))] }, { type: "tableHeader", content: [p(tx("Ort."))] }] }, { type: "tableRow", content: [{ type: "tableCell", content: [p(tx("ROCD_1"))] }, { type: "tableCell", content: [p(tx("2.4"))] }] }] },
    { type: "figure", attrs: { src: PNG, alt: "Şekil" } },
    { type: "blockquote", content: [p(tx("Uzun doğrudan alıntı metni."))] },
  ] } },
  { id: "b", key: "references", title: "Kaynakça", position: 1, content_text: "", content: null },
];
export function latexFixture(style = "apa7", language = "tr") {
  const project = { title: "İlişki odaklı OKB & bağlanma: %50 örneklem", citation_style: style, language, context: { university: "Örnek Üniversitesi" } };
  const items = LATEX_SOURCES.map(sourceRowToItemClient);
  const doc = buildExportDoc({ project, stages: LATEX_STAGES, sources: LATEX_SOURCES, engineItems: items, authorName: "Ayşe Yılmaz", options: { latexCitations: true } });
  return toLatexFiles(doc, { style: style as "apa7", items });
}

describe("LaTeX çıktısı (D136)", () => {
  it("özel karakterleri kaçırır, yer belirteci sayfaya çevrilir", () => {
    expect(texEscape("50% & $_#{}")).toBe("50\\% \\& \\$\\_\\#\\{\\}");
    expect(texEscape("a\\b ~ ^")).toBe("a\\textbackslash{}b \\textasciitilde{} \\textasciicircum{}");
    expect(texLocator("s. 170")).toBe("170");
    expect(texLocator("ss. 12-14")).toBe("12--14");
    expect(texLocator(null)).toBe("");
  });
  it("atıflar \\parencite / \\textcite olur; anahtarlar .bib ile aynı; dipnot korunur", () => {
    const files = latexFixture();
    const tex = String(files.find((f) => f.name === "main.tex")!.data);
    const bib = String(files.find((f) => f.name === "references.bib")!.data);
    const keys = bibKeyMap(LATEX_SOURCES.map(sourceRowToItemClient));
    expect(keys.get("s1")).toBe("Doron2014");
    expect(keys.get("s3")).toBe("Doron2014a");
    expect(tex).toContain(`\\parencite{${keys.get("s2")}}`);
    expect(tex).toContain(". \\textcite[170]{Doron2014}");
    expect(tex).toContain("\\parencite[12--14]{Doron2014,Doron2014a}");
    expect(tex).toContain("\\footnote{Ayrıntı için bkz. Ek 1 --- \\$ ve \\# işaretleri.}");
    expect(tex).toContain("\\textbf{kalın}");
    expect(tex).toContain("\\section{");
    expect(tex).toContain("\\subsubsection{Bağlanma \\& ilişki\\_kuramı}");
    expect(tex).toContain("\\begin{tabular}");
    expect(tex).toContain("ROCD\\_1");
    expect(tex).toContain("\\includegraphics");
    expect(tex).toContain("style=apa");
    expect(tex).toContain("turkish");
    expect(bib).toContain("@article{Doron2014,");
    expect(bib).toContain("@article{Doron2014a,");
    expect(files.some((f) => f.name === "figures/sekil-1.png")).toBe(true);
    // Biçimlenmiş metin atıfı (Doron & Derby, 2014) LaTeX’e düz metin olarak girmez
    expect(tex).not.toContain("(Bowlby, 1969)");
  });
  it("stil eşlemesi ve not (ISNAD → authoryear, IEEE → ieee)", () => {
    expect(String(latexFixture("isnad").find((f) => f.name === "main.tex")!.data)).toMatch(/style=authoryear[\s\S]*|ISNAD/);
    expect(String(latexFixture("ieee", "en").find((f) => f.name === "main.tex")!.data)).toContain("style=ieee");
  });
  it("atıflı boşluk bölünmez boşluk olur", () => {
    expect(runsToTex([{ text: "metin " }, { text: "", cite: { ids: ["x"], locator: null } }], new Map([["x", "K1"]]))).toBe("metin~\\parencite{K1}");
  });
  it("Türkçe belgede biblatex dil ayarı: APA eşlemesi, diğer stillerde İngilizce dil dosyası + Türkçe kısaltmalar", () => {
    const apa = biblatexSetup("apa", true);
    expect(apa.preamble).toContain("\\DeclareLanguageMapping{turkish}{american-apa}");
    expect(apa.preamble).toContain("and = {ve}");
    const ay = biblatexSetup("authoryear", true);
    expect(ay.babel).toBe("english,turkish,shorthands=:!");
    expect(ay.options).toContain("autolang=none");
    expect(ay.bibBegin).toContain("otherlanguage");
    expect(biblatexSetup("ieee", false)).toEqual({ babel: "english", options: "", preamble: "", bibBegin: "", bibEnd: "" });
  });
  it("ZIP içinde main.tex, references.bib, şekil ve README var", async () => {
    const { default: JSZip } = await import("jszip");
    const project = { title: "Deneme", citation_style: "apa7", language: "tr", context: {} };
    const items = LATEX_SOURCES.map(sourceRowToItemClient);
    const doc = buildExportDoc({ project, stages: LATEX_STAGES, sources: LATEX_SOURCES, engineItems: items, authorName: "A", options: { latexCitations: true } });
    const zip = await JSZip.loadAsync(await toLatexZip(doc, { style: "apa7", items }));
    expect(Object.keys(zip.files).sort()).toEqual(["README.txt", "figures/", "figures/sekil-1.png", "main.tex", "references.bib"]);
  });
  // LATEX_OUT=/dizin verilirse derleme denemesi için dosyalar yazılır
  it("isteğe bağlı: dosyaları diske yazar", () => {
    const out = process.env.LATEX_OUT;
    if (!out) return;
    for (const style of ["apa7", "isnad", "chicago", "mla", "harvard", "ieee", "vancouver", "ama", "turabian", "apa6"]) for (const lang of ["tr", "en"]) {
      const dir = path.join(out, `${style}-${lang}`);
      for (const f of latexFixture(style, lang)) { fs.mkdirSync(path.dirname(path.join(dir, f.name)), { recursive: true }); fs.writeFileSync(path.join(dir, f.name), f.data); }
    }
  });
});
