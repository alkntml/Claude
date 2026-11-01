import { describe, expect, it } from "vitest";
import { boxStats, buildChart, histogramBins, quantile } from "@/lib/stats/charts";
import { esc, niceTicks, renderChartSvg } from "@/lib/charts/svg";

const rows = [
  ["cinsiyet", "puan", "on", "son", "yas"],
  ["Kadın", "10", "1", "3", "20"], ["Kadın", "12", "2", "4", "22"], ["Kadın", "14", "3", "5", "24"],
  ["Erkek", "6", "2", "2", "21"], ["Erkek", "8", "3", "3", "23"], ["Erkek", "10", "4", "4", "25"],
];

describe("grafik verisi", () => {
  it("grup ortalamaları ve %95 GA hata çubuğu", () => {
    const c = buildChart(rows, { kind: "bar_means", dv: "puan", group: "cinsiyet", error: "ci95" });
    expect(c.categories).toEqual(["Erkek", "Kadın"]);
    expect(c.series[0].values).toEqual([8, 12]);
    // SH = 2/√3 = 1.1547; t(.975, 2) = 4.3027 → 4.968
    expect(c.series[0].errors![0]).toBeCloseTo(4.968, 2);
    expect(c.n).toBe(6);
    expect(c.note).toContain("%95");
  });
  it("frekans ve yüzde", () => {
    const c = buildChart(rows, { kind: "bar_freq", variable: "cinsiyet", percent: true });
    expect(c.series[0].values).toEqual([50, 50]);
  });
  it("tekrarlı ölçüm çizgisi gruplara göre", () => {
    const c = buildChart(rows, { kind: "line_means", vars: ["on", "son"], group: "cinsiyet", error: "none" });
    expect(c.series.map((s) => s.name)).toEqual(["Erkek", "Kadın"]);
    expect(c.series[1].values).toEqual([2, 4]);
  });
  it("saçılım ve regresyon doğrusu", () => {
    const c = buildChart(rows, { kind: "scatter", x: "yas", y: "puan", fit: true });
    expect(c.points).toHaveLength(6);
    // Σdxdy = 10, Σdx² = 17.5 → b = 0.5714
    expect(c.fit!.b).toBeCloseTo(0.5714, 3);
  });
  it("nicelik (tip 7), kutu ve histogram", () => {
    expect(quantile([1, 2, 3, 4], 0.25)).toBeCloseTo(1.75);
    const b = boxStats("x", [1, 2, 3, 4, 100]);
    expect(b.outliers).toEqual([100]);
    expect(b.max).toBe(4);
    const bins = histogramBins([1, 2, 2, 3, 3, 3, 4, 4, 5, 9]);
    expect(bins.reduce((a, x) => a + x.count, 0)).toBe(10);
    expect(bins[0].from).toBeLessThanOrEqual(1);
  });
});

describe("SVG çizimi", () => {
  it("okunaklı eksen değerleri", () => {
    expect(niceTicks(0, 13)).toEqual([0, 5, 10, 15]);
    expect(niceTicks(0.1, 0.87)).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    expect(niceTicks(0, 1, 5, 1)).toEqual([0, 1]);
  });
  it("tüm grafik türleri geçerli SVG üretir ve metni kaçışlar", () => {
    const r2 = [["g<x>", "v"], ["a&b", "1"], ["a&b", "2"], ["c", "3"]];
    for (const spec of [
      { kind: "bar_means", dv: "v", group: "g<x>", error: "se" },
      { kind: "box", dv: "v", group: "g<x>" },
      { kind: "histogram", variable: "v" },
    ] as const) {
      const svg = renderChartSvg(buildChart(r2, spec));
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg).not.toContain("<x>");
      if (spec.kind !== "histogram") expect(svg).toContain("a&amp;b");
      expect(svg).not.toContain("NaN");
    }
    expect(esc('"<&>')).toBe("&quot;&lt;&amp;&gt;");
    // Binlik değerlerde sondaki sıfırlar korunur
    const big = renderChartSvg(buildChart([["g", "v"], ["a", "3200"], ["b", "1400"]], { kind: "bar_means", dv: "v", group: "g", error: "none" }));
    expect(big).toContain(">4000<");
    expect(big).toContain(">1000<");
  });
});
