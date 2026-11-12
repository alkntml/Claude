import { describe, expect, it } from "vitest";
import { CitationEngine, richToPlain, type CitationItem } from "@/lib/citations";
import { isGermanTitle } from "@/lib/citations/styles";
import { captionRef, formatCaption, noteLabel, parseCaption, parseNote } from "@/lib/citations/captions";
import { detectLang } from "@/lib/editor/translate-doc";
import { buildExportDoc } from "@/lib/export/model";
import { biblatexSetup } from "@/lib/export/render-latex";
import { coverLines, resolveFormat } from "@/lib/export/format";
import { methodsMarkdown, prismaSvg, type PrismaCounts } from "@/lib/prisma";
import { buildChart } from "@/lib/stats/charts";
import { runAnalysis } from "@/lib/stats/apa";
import { LIKERT_PRESETS } from "@/lib/surveys";
import { chapterGroup, sectionTitle } from "@/lib/workflows/structure";
import { writingLang } from "@/lib/writing-lang";
import { latexFixture } from "./latex.test";

/** D144: çalışmanın Almanca yazılması */
const book: CitationItem = { id: "b1", type: "book", title: "Bindung und Verlust", authors: [{ family: "Bowlby", given: "John" }], year: 1969, publisher: "Basic Books", edition: "2" };
const three: CitationItem = { id: "a1", type: "article-journal", title: "Zwangsstörungen in Beziehungen", authors: [{ family: "Doron", given: "Guy" }, { family: "Derby", given: "Danny" }, { family: "Szepsenwol", given: "Ohad" }], year: 2014, containerTitle: "Journal of OCRD", volume: "3", pages: "169-180" };
const nodate: CitationItem = { id: "n1", type: "book", title: "Ohne Jahr", authors: [{ family: "Kaya", given: "Elif" }], publisher: "Verlag" };

describe("Almanca yazım dili", () => {
  it("bilinmeyen dil Türkçe sayılır; de korunur", () => {
    expect(writingLang("de")).toBe("de");
    expect(writingLang("fr")).toBe("tr");
    expect(writingLang(undefined)).toBe("tr");
  });

  it("atıf motoru Almanca terimler kullanır (S., o. J., Aufl., Literaturverzeichnis)", () => {
    const de = new CitationEngine("apa7", [book, three, nodate], { locale: "de" });
    expect(richToPlain(de.cite(["b1"], { locator: "45" }))).toBe("(Bowlby, 1969, S. 45)");
    expect(richToPlain(de.cite(["b1"], { locator: "45-47" }))).toBe("(Bowlby, 1969, S. 45–47)");
    expect(richToPlain(de.cite(["a1"]))).toBe("(Doron et al., 2014)");
    expect(richToPlain(de.cite(["n1"]))).toContain("o. J.");
    expect(de.meta.bibliographyTitle.de).toBe("Literaturverzeichnis");
    const vancouver = new CitationEngine("vancouver", [book], { locale: "de" });
    expect(vancouver.meta.bibliographyTitle.de).toBe("Literaturverzeichnis");
  });

  it("tablo/şekil başlıkları ve notlar Almanca; Almanca başlıklar geri okunur", () => {
    expect(captionRef("apa7", "table", 2, "de")).toBe("Tabelle 2");
    expect(captionRef("apa7", "figure", 1, "de")).toBe("Abbildung 1");
    expect(captionRef("ieee", "figure", 3, "de")).toBe("Abb. 3");
    expect(noteLabel("apa7", "de")).toEqual({ text: "Anmerkung.", italic: true });
    expect(noteLabel("harvard", "de").text).toBe("Anmerkung:");
    expect(formatCaption("apa7", "table", 1, "Deskriptive Statistiken", "de").lines[0][0].text).toBe("Tabelle 1");
    expect(parseCaption("Tabelle 3. Mittelwerte")).toMatchObject({ kind: "table", no: 3, title: "Mittelwerte" });
    expect(parseCaption("Abbildung 2")).toMatchObject({ kind: "figure", no: 2, labelOnly: true });
    expect(parseCaption("Tabelle 1 zeigt die Werte")).toBeNull();
    expect(parseNote("Anmerkung. N = 120.")).toBe("N = 120.");
  });

  it("bölüm başlıkları Almanca", () => {
    expect(sectionTitle("problem", "Araştırma probleminin tanımlanması", "Araştırma probleminin tanımlanması", "de")).toBe("Problemstellung");
    expect(sectionTitle("findings", "Bulgular", "Bulgular", "de")).toBe("ERGEBNISSE");
    expect(chapterGroup("method")?.title.de).toBe("METHODE");
  });

  it("dil tespiti Almancayı tanır, Türkçe ve İngilizceyi bozmaz", () => {
    expect(detectLang("Die vorliegende Studie untersucht den Zusammenhang zwischen der Nutzung sozialer Medien und dem Selbstwert, der bei Studierenden nicht immer stabil ist.")).toBe("de");
    expect(detectLang("Bu çalışma, sosyal medya kullanımı ile benlik saygısı arasındaki ilişkiyi incelemektedir.")).toBe("tr");
    expect(detectLang("This study examines the relationship between social media use and self-esteem in students.")).toBe("en");
  });

  it("istatistik raporu ve grafik Almanca", () => {
    const rows = [["Gruppe", "Wert"], ...Array.from({ length: 20 }, (_, i) => [i % 2 ? "A" : "B", String(3 + (i % 5) * 0.3 + (i % 2) * 0.5)])];
    const r = runAnalysis(rows, { kind: "ttest_ind", dv: "Wert", group: "Gruppe" }, "de");
    expect(r.title).toBe("Ergebnisse des t-Tests für unabhängige Stichproben");
    expect(r.text).toMatch(/^Mit einem t-Test für unabhängige Stichproben/);
    expect(r.text).toContain("95 %-KI");
    expect(r.text).not.toMatch(/Ort\.|SS =/);
    const c = buildChart(rows, { kind: "bar_means", dv: "Wert", group: "Gruppe", error: "ci95" }, "de");
    expect(c.title).toBe("Mittelwerte von Wert nach Gruppe");
    expect(c.note).toContain("Konfidenzintervalle");
  });

  it("PRISMA şeması ve yöntem metni Almanca", () => {
    const counts: PrismaCounts = { identified: 120, byOrigin: { OpenAlex: 80, Crossref: 40 }, duplicates: 20, screened: 100, excludedScreening: 70, sought: 30, notRetrieved: 2, assessed: 28, excludedEligibility: { "Falsches Design": 8 }, excludedEligibilityTotal: 8, included: 20, pendingScreening: 0, pendingEligibility: 0 } as PrismaCounts;
    expect(prismaSvg(counts, "de").svg).toContain("Identifizierte Datensätze");
    const md = methodsMarkdown({ protocol: { question: "", inclusion: [], exclusion: [], searches: [{ database: "OpenAlex", query: "x", date: "2026-01-10", results: "80" }] } as never, counts, lang: "de" });
    expect(md).toContain("PRISMA-2020-Statement");
    expect(md).toContain("*Tabelle 1. Suchstrategie*");
    expect(md).toContain("Insgesamt wurden 20 Studien");
  });

  it("anket Likert ifadeleri Almanca", () => {
    expect(LIKERT_PRESETS.de[5][0]).toBe("Stimme überhaupt nicht zu");
    expect(LIKERT_PRESETS.de[7]).toHaveLength(7);
  });

  it("dışa aktarma: Almanca kaynakça başlığı, Almanca bölüm başlığı, kapakta Betreuung", () => {
    const project = { title: "Testarbeit", citation_style: "apa7", language: "de", context: {} };
    const stages = [
      { id: "s", key: "problem", title: "Araştırma probleminin tanımlanması", position: 0, content_text: "Text", content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Text " }, { type: "citation", attrs: { ids: ["b1"], locator: "12", narrative: false } }] }] } },
    ];
    const doc = buildExportDoc({ project, stages, sources: [], engineItems: [book], authorName: "A. B." });
    expect(doc.language).toBe("de");
    expect(doc.bibliographyTitle).toBe("Literaturverzeichnis");
    expect(doc.toc.map((x) => x.text)).toEqual(["EINLEITUNG", "Problemstellung"]);
    const cover = coverLines({ ...resolveFormat(undefined), cover: { ...resolveFormat(undefined).cover, advisor: "Prof. X" } }, { title: "T", subtitle: "", author: "A", date: "2026", language: "de" });
    expect(cover.advisor).toBe("Betreuung\nProf. X");
  });

  it("LaTeX: Almanca babel ve biblatex, csquotes german", () => {
    expect(biblatexSetup("apa", "de")).toMatchObject({ babel: "ngerman" });
    expect(biblatexSetup("apa", "de").preamble).toContain("ngerman-apa");
    expect(biblatexSetup("authoryear", "de").options).toContain("maxcitenames=2");
    const main = latexFixture("apa7", "de").find((f) => f.name === "main.tex")!.data as string;
    expect(main).toContain("\\usepackage[ngerman]{babel}");
    expect(main).toContain("style=german]{csquotes}");
    expect(main).toContain("Erstellt mit Academiana");
  });

  it("diğer stillerde Almanca sayfa ve editör kısaltmaları; ISNAD Almanca başlığı bozmaz", () => {
    const ch: CitationItem = { id: "c1", type: "chapter", title: "Skalenadaptation in der Praxis", authors: [{ family: "Lee", given: "B." }], editors: [{ family: "Smith", given: "A." }], containerTitle: "Messung in der Bildung", year: 2019, pages: "45-67", publisher: "Verlag" };
    const harvard = richToPlain(new CitationEngine("harvard", [ch], { locale: "de" }).entry(ch));
    expect(harvard).toContain("In: Smith, A. (Hrsg.)");
    expect(harvard).toContain("S. 45–67");
    expect(richToPlain(new CitationEngine("mla", [ch], { locale: "de" }).entry(ch))).toContain("S. 45–67");
    const ieee = new CitationEngine("ieee", [book], { locale: "de", citedOrder: ["b1"] });
    expect(richToPlain(ieee.entry(book))).toContain("2. Aufl.");
    expect(richToPlain(new CitationEngine("isnad", [book], { locale: "de" }).entry(book))).toContain("Bindung und Verlust");
    expect(isGermanTitle("Bindung und Verlust")).toBe(true);
    expect(isGermanTitle("Attachment and loss")).toBe(false);
    expect(isGermanTitle("Öz düzenleme ve başarı")).toBe(false);
  });
});
