import { describe, expect, it } from "vitest";
import { noZero, pApa, reportToMarkdown, runAnalysis } from "@/lib/stats/apa";
import { markdownToDoc } from "@/lib/editor/doc";

const rows = [
  ["grup", "kaygi", "once", "sonra", "m1", "m2", "m3", "cinsiyet"],
  ["A", "1", "10", "12", "3", "4", "3", "K"],
  ["A", "2", "12", "13", "4", "4", "5", "E"],
  ["A", "3", "9", "11", "2", "3", "2", "K"],
  ["A", "4", "11", "13", "5", "5", "4", "E"],
  ["A", "5", "14", "15", "3", "3", "3", "K"],
  ["B", "2", "", "10", "4", "5", "4", "E"],
  ["B", "4", "8", "9", "3", "4", "3", "K"],
  ["B", "6", "7", "9", "4", "4", "5", "E"],
  ["B", "8", "9", "10", "5", "5", "5", "K"],
  ["B", "10", "10", "12", "2", "3", "2", "E"],
];

describe("APA biçimlendirme", () => {
  it("p ve başta sıfır", () => {
    expect(pApa(0.0004)).toBe("p < .001");
    expect(pApa(0.0444)).toBe("p = .044");
    expect(noZero(-0.7746)).toBe("-.77");
  });
  it("bağımsız t testi raporu: doğru gruplar, df, p ve Türkçe cümle", () => {
    const r = runAnalysis(rows, { kind: "ttest_ind", dv: "kaygi", group: "grup" }, "tr");
    expect(r.n).toBe(10);
    expect(r.text).toContain("t(8) = -1.90");
    expect(r.text).toContain("p = .094");
    expect(r.text).toContain("anlamlı değildir");
    expect(r.notes[0]).toContain("Levene");
    expect(r.table.split("\n")).toHaveLength(4);
  });
  it("eşleştirilmiş t: eksik veri satırı çıkarılır (listwise)", () => {
    const r = runAnalysis(rows, { kind: "ttest_paired", a: "once", b: "sonra" }, "en");
    expect(r.n).toBe(9);
    expect(r.text).toMatch(/t\(8\) = -\d/);
  });
  it("ANOVA, korelasyon, regresyon, ki-kare, alfa çalışır ve belgeye tablo olarak dönüşür", () => {
    for (const spec of [
      { kind: "anova", dv: "kaygi", group: "grup" },
      { kind: "kruskal", dv: "kaygi", group: "grup" },
      { kind: "mannwhitney", dv: "kaygi", group: "grup" },
      { kind: "correlation", vars: ["kaygi", "m1", "m2"], method: "pearson" },
      { kind: "regression", dv: "kaygi", ivs: ["m1", "m2"] },
      { kind: "chisquare", a: "grup", b: "cinsiyet" },
      { kind: "alpha", items: ["m1", "m2", "m3"] },
      { kind: "describe", vars: ["kaygi", "m1"] },
    ] as const) {
      const r = runAnalysis(rows, spec as never, "tr");
      const md = reportToMarkdown(r, 3, "tr");
      expect(md).toContain("**Tablo 3**");
      expect(reportToMarkdown(r, 3, "tr", "chicago")).toContain("Tablo 3.");
      expect(reportToMarkdown(r, 3, "tr", "ieee")).toContain("TABLO III");
      const doc = markdownToDoc(md, () => null);
      expect(JSON.stringify(doc)).toContain('"type":"table"');
    }
  });
  it("hatalı seçimde anlaşılır hata", () => {
    expect(() => runAnalysis(rows, { kind: "ttest_ind", dv: "kaygi", group: "m1" }, "tr")).toThrow(/2 düzeyi/);
    expect(() => runAnalysis(rows, { kind: "describe", vars: ["yok"] }, "tr")).toThrow(/bulunamadı/);
  });
});
