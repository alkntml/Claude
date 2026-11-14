/**
 * D190 — ISNAD 2 dipnotlu atıf stili: ilk atıfta tam künye, sonraki atıflarda kısa atıf (Soyad, Kısa Başlık, sayfa);
 * makale ve kitap bölümünde sayfa aralığından sonra “/” ile atıf yapılan sayfa. Word/PDF’te gerçek dipnot, LaTeX’te \footcite.
 */
import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import JSZip from "jszip";
import { CitationEngine, STYLES, type CitationItem } from "@/lib/citations";
import { richToPlain } from "@/lib/citations/util";
import { buildExportDoc } from "@/lib/export/model";
import { toDocx } from "@/lib/export/render-docx";
import { toPdf } from "@/lib/export/render-pdf";
import { toLatexFiles } from "@/lib/export/render-latex";
import { effectiveFormat } from "@/lib/export/format";

const items: CitationItem[] = [
  { id: "a", type: "article-journal", title: "Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme", authors: [{ family: "Kaya", given: "Elif" }], year: 2021, containerTitle: "Örnek Psikoloji Dergisi", volume: "12", issue: "3", pages: "45-62" },
  { id: "b", type: "book", title: "Öz düzenleme ve öğrenme", authors: [{ family: "Yılmaz", given: "Burak" }], year: 2019, publisher: "Örnek Yayınevi", publisherPlace: "Ankara" },
  { id: "c", type: "chapter", title: "Dijital alışkanlıklar", authors: [{ family: "Demir", given: "Ali" }, { family: "Aksoy", given: "Merve" }], year: 2020, containerTitle: "Eğitimde yeni yönelimler", editors: [{ family: "Şahin", given: "Can" }], publisher: "Örnek Yayınevi", publisherPlace: "İstanbul", pages: "101-118" },
  { id: "d", type: "article-journal", title: "Smartphone use and sleep", authors: [{ family: "Lee", given: "Jin" }, { family: "Park", given: "Soo" }, { family: "Chen", given: "Li" }], year: 2020, containerTitle: "Sample Journal", volume: "5", issue: "2", pages: "77-93" },
];
const e = new CitationEngine("isnad_note", items, { locale: "tr" });
const n = (ids: string[], first: boolean, locator?: string) => richToPlain(e.note(ids, { locator }, first));

describe("ISNAD 2 dipnot biçimi (D190)", () => {
  it("stil dipnotlu ailededir", () => {
    expect(STYLES.isnad_note.family).toBe("note");
  });
  it("makale: ilk atıf tam künye, sayfa aralığı/atıf sayfası; sonraki kısa atıf", () => {
    expect(n(["a"], true, "50")).toBe("Elif Kaya, “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”, Örnek Psikoloji Dergisi 12/3 (2021), 45-62/50.");
    expect(n(["a"], true)).toBe("Elif Kaya, “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”, Örnek Psikoloji Dergisi 12/3 (2021), 45-62.");
    expect(n(["a"], false, "s. 52")).toBe("Kaya, “Üniversite Öğrencilerinde Sosyal”, 52.");
  });
  it("kitap: (Yer: Yayınevi, Yıl), sayfa; kısa atıfta italik kısa başlık", () => {
    expect(n(["b"], true, "34")).toBe("Burak Yılmaz, Öz Düzenleme ve Öğrenme (Ankara: Örnek Yayınevi, 2019), 34.");
    const short = e.note(["b"], { locator: "40" }, false);
    expect(richToPlain(short)).toBe("Yılmaz, Öz Düzenleme ve Öğrenme, 40.");
    expect(short.some((s) => s.italic && s.text.includes("Öz Düzenleme"))).toBe(true);
  });
  it("kitap bölümü ve çok yazarlı eser", () => {
    expect(n(["c"], true, "105")).toBe("Ali Demir - Merve Aksoy, “Dijital Alışkanlıklar”, Eğitimde Yeni Yönelimler, ed. Can Şahin (İstanbul: Örnek Yayınevi, 2020), 101-118/105.");
    expect(n(["d"], false)).toBe("Lee vd., “Smartphone Use and Sleep”.");
  });
  it("bir dipnotta birden çok kaynak noktalı virgülle ayrılır", () => {
    expect(n(["b", "d"], false)).toBe("Yılmaz, Öz Düzenleme ve Öğrenme; Lee vd., “Smartphone Use and Sleep”.");
  });

  it("dışa aktarma: Word’de gerçek dipnot, PDF üretilir, LaTeX’te \\footcite; kaynakça ISNAD", async () => {
    const cite = (ids: string[], locator?: string) => ({ type: "citation", attrs: { ids, locator: locator ?? null } });
    const p = (...content: unknown[]) => ({ type: "paragraph", content });
    const long = "Bu cümle sayfayı doldurmak için yazılmış uzun bir akademik paragrafın parçasıdır ve dipnotların sayfa altına yerleşmesini sınar. ".repeat(6);
    const content = { type: "doc", content: [
      p({ type: "text", text: "Sosyal medya kullanımı ertelemeyle ilişkilidir." }, cite(["a"], "50"), { type: "text", text: " Öz düzenleme bu ilişkide önemlidir." }, cite(["b"], "34")),
      ...Array.from({ length: 6 }, () => p({ type: "text", text: long })),
      p({ type: "text", text: "Aynı bulgu tekrar edilmiştir." }, cite(["a"], "52"), { type: "text", text: " Bölüm yazarları da benzer görüştedir." }, cite(["c"], "105")),
    ] };
    const stages = [{ id: "00000000-0000-0000-0000-000000000001", key: "literature", title: "Literatür", position: 0, content_text: "x", content }];
    const project = { title: "ISNAD dipnot denemesi", work_type: "thesis", academic_level: "master", language: "tr", citation_style: "isnad_note", context: { methodology: "quantitative", university: "Ankara Üniversitesi" } };
    const d = buildExportDoc({ project, stages, sources: [], engineItems: items, authorName: "Ali Veli" });
    const runs = d.blocks.flatMap((b) => (b.kind === "paragraph" ? b.runs : []));
    const notes = runs.filter((r) => r.footnote !== undefined).map((r) => r.footnote);
    expect(notes).toEqual([
      "Elif Kaya, “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”, Örnek Psikoloji Dergisi 12/3 (2021), 45-62/50.",
      "Burak Yılmaz, Öz Düzenleme ve Öğrenme (Ankara: Örnek Yayınevi, 2019), 34.",
      "Kaya, “Üniversite Öğrencilerinde Sosyal”, 52.",
      "Ali Demir - Merve Aksoy, “Dijital Alışkanlıklar”, Eğitimde Yeni Yönelimler, ed. Can Şahin (İstanbul: Örnek Yayınevi, 2020), 101-118/105.",
    ]);
    // ISNAD: dipnot numarası noktalamadan sonra ve boşluksuz (…güçlüdür.¹)
    const d2 = buildExportDoc({ project, stages: [{ ...stages[0], content: { type: "doc", content: [p({ type: "text", text: "Bu ilişki güçlüdür " }, cite(["b"]), { type: "text", text: ". Devam." })] } }], sources: [], engineItems: items, authorName: "Ali Veli" });
    const r2 = d2.blocks.flatMap((b) => (b.kind === "paragraph" ? b.runs : []));
    const fi = r2.findIndex((r) => r.footnote !== undefined);
    expect(r2[fi - 1].text.endsWith("güçlüdür.")).toBe(true);
    expect(r2[fi + 1].text).toBe(" Devam.");
    // Metin içinde yazar–tarih atfı kalmaz
    expect(runs.map((r) => r.text).join("")).not.toMatch(/\(Kaya, 2021/);
    const fmt = effectiveFormat(project);
    const zip = await JSZip.loadAsync(await toDocx(d, fmt));
    const fn = await zip.file("word/footnotes.xml")!.async("string");
    expect(fn).toContain("Örnek Psikoloji Dergisi");
    expect(await zip.file("word/document.xml")!.async("string")).toContain("w:footnoteReference");
    const pdf = await toPdf(d, fmt);
    expect(pdf.subarray(0, 4).toString()).toBe("%PDF");
    if (process.env.ISNAD_OUT) writeFileSync(process.env.ISNAD_OUT, pdf);
    const latexDoc = buildExportDoc({ project, stages, sources: [], engineItems: items, authorName: "Ali Veli", options: { latexCitations: true } });
    const tex = toLatexFiles(latexDoc, { style: "isnad_note", items }).find((f) => f.name === "main.tex")!.data as string;
    expect(tex).toContain("\\footcite[50]");
    expect(tex).toContain("style=verbose");
    // Kaynakça ISNAD 2 biçiminde
    expect(d.bibliography.map((b) => b.rich.map((r) => r.text).join(""))).toContain("Kaya, Elif. “Üniversite Öğrencilerinde Sosyal Medya Kullanımı ve Akademik Erteleme”. Örnek Psikoloji Dergisi 12/3 (2021), 45-62.");
  });
});
