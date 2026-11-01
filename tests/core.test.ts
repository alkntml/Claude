import { describe, expect, it } from "vitest";
import { buildRoadmap } from "@/lib/workflows";
import { citedIdsInOrder, docToPlain, markdownToDoc, numberHeadings, wordCount } from "@/lib/editor/doc";
import { runQualityChecks } from "@/lib/quality/checks";

describe("roadmap", () => {
  it("builds full thesis roadmap", () => {
    const r = buildRoadmap({ workType: "thesis", level: "master" });
    expect(r.map((s) => s.key)).toEqual(["topic", "problem", "purpose", "questions", "concepts", "literature", "theory", "method", "sample", "instruments", "analysis", "findings", "discussion", "conclusion", "references", "appendices"]);
  });
  it("adapts to qualitative + bachelor", () => {
    const keys = buildRoadmap({ workType: "thesis", level: "bachelor", methodology: "qualitative" }).map((s) => s.key);
    expect(keys).toContain("participants");
    expect(keys).not.toContain("sample");
    expect(keys).not.toContain("theory");
  });
  it("removes empirical stages for theoretical work", () => {
    const keys = buildRoadmap({ workType: "thesis", level: "doctorate", methodology: "theoretical" }).map((s) => s.key);
    expect(keys).not.toContain("findings");
  });
});

describe("markdown -> doc", () => {
  const map: Record<string, string> = { S1: "uuid-1", S2: "uuid-2" };
  const doc = markdownToDoc(
    "## Kavramsal Çerçeve\n\nBağlanma kuramı **temel** bir çerçevedir [[kaynak:S1]]. Ayrıca *ebeveyn* tutumları önemlidir [[kaynak:S2,S1|s. 12]].\n\n- madde bir\n- madde iki [[kaynak:S9]]\n\n| A | B |\n|---|---|\n| 1 | 2 |",
    (s) => map[s] ?? null,
  );
  it("creates citation nodes and resolves short ids", () => {
    expect(citedIdsInOrder([doc])).toEqual(["uuid-1", "uuid-2"]);
    const plain = docToPlain(doc, (a) => `(${a.ids.join(";")}${a.locator ? `, ${a.locator}` : ""})`);
    expect(plain).toContain("çerçevedir (uuid-1).");
    expect(plain).toContain("(uuid-2;uuid-1, 12)");
    expect(plain).toContain("[KAYNAK DOĞRULANAMADI]");
  });
  it("parses headings, lists, tables", () => {
    expect(doc.content?.map((n) => n.type)).toEqual(["heading", "paragraph", "bulletList", "table"]);
    expect(doc.content?.[3].content).toHaveLength(2); // ayraç satırı atlanır
  });
  it("counts words and numbers headings", () => {
    expect(wordCount("Bağlanma kuramı, 1969'da önerilmiştir.")).toBe(4);
    expect(numberHeadings([{ level: 1, text: "" }, { level: 2, text: "" }, { level: 3, text: "" }, { level: 2, text: "" }], 2)).toEqual(["2", "2.1", "2.1.1", "2.2"]);
  });
});

describe("quality checks", () => {
  it("flags informal language, placeholders, untested hypotheses and unverified sources", () => {
    const report = runQualityChecks(
      [
        { key: "questions", title: "Hipotezler", text: "H1: A ile B ilişkilidir. H2: C, B'yi yordar.", citedIds: [] },
        { key: "literature", title: "Literatür", text: "Bence bu konu çok önemlidir ve kesin olarak kanıtlamıştır. [KAYNAK GEREKLİ]", citedIds: [], needsLiterature: true },
        { key: "findings", title: "Bulgular", text: "H1 desteklenmiştir. [VERİ GİRİLECEK: korelasyon]", citedIds: ["s1"] },
      ],
      [{ id: "s1", type: "article-journal", title: "X", authors: [{ family: "A" }], year: 2020, verified: false, accessLevel: "metadata" }],
    );
    const titles = report.issues.map((i) => i.title);
    expect(titles).toContain("Günlük / öznel ifade");
    expect(titles).toContain("Aşırı kesin iddia");
    expect(titles).toContain("Kaynak gerektiren iddia");
    expect(titles).toContain("Veri girilmesi gereken alan");
    expect(titles).toContain("Test edilmeyen hipotez");
    expect(titles).toContain("Doğrulanmamış kaynak");
    expect(titles).toContain("Atıf içermeyen bölüm");
    expect(report.score).toBeLessThan(80);
    expect(report.plagiarism.available).toBe(false);
  });
});
