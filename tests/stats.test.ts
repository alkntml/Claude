import { describe as d, expect, it } from "vitest";
import { chiSquareIndependence, cronbachAlpha, describe, independentT, kruskalWallis, linearRegression, mannWhitney, oneSampleT, oneWayAnova, pairedT, pearson, spearman, variance } from "@/lib/stats/tests";

d("t testleri (elle doğrulanmış değerler)", () => {
  it("bağımsız örneklem: Student ve Welch", () => {
    const r = independentT([1, 2, 3, 4, 5], [2, 4, 6, 8, 10]);
    expect(r.student.t).toBeCloseTo(-1.8974, 4);
    expect(r.student.df).toBe(8);
    expect(r.student.p).toBeCloseTo(0.0944, 3);
    expect(r.welch.df).toBeCloseTo(5.882, 3);
    expect(r.welch.p).toBeCloseTo(0.1078, 3);
    expect(r.cohensD).toBeCloseTo(-1.2, 4);
    expect(r.student.ci[0]).toBeCloseTo(-6.646, 2);
  });
  it("eşleştirilmiş", () => {
    const r = pairedT([10, 12, 9, 11, 14], [12, 13, 11, 13, 15]);
    // farklar: -2 -1 -2 -2 -1 => ort -1.6, ss 0.5477
    expect(r.diffMean).toBeCloseTo(-1.6, 6);
    expect(r.t).toBeCloseTo(-6.532, 3);
    expect(r.df).toBe(4);
    expect(r.p).toBeCloseTo(0.00284, 4);
  });
  it("tek örneklem", () => {
    const r = oneSampleT([5, 6, 7, 8, 9], 6);
    expect(r.t).toBeCloseTo(1.4142, 4);
    expect(r.p).toBeCloseTo(0.2302, 3);
  });
});

d("varyans analizi ve parametrik olmayan testler", () => {
  const g = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
  it("tek yönlü ANOVA", () => {
    const a = oneWayAnova(g);
    expect(a.F).toBeCloseTo(27, 6);
    expect([a.dfBetween, a.dfWithin]).toEqual([2, 6]);
    expect(a.p).toBeCloseTo(0.001, 3);
    expect(a.etaSquared).toBeCloseTo(0.9, 6);
  });
  it("Kruskal-Wallis", () => {
    const k = kruskalWallis(g);
    expect(k.H).toBeCloseTo(7.2, 6);
    expect(k.p).toBeCloseTo(0.0273, 4);
  });
  it("Mann-Whitney U (SPSS asimptotik)", () => {
    const m = mannWhitney([1, 2, 3], [4, 5, 6]);
    expect(m.U).toBe(0);
    expect(m.z).toBeCloseTo(-1.964, 3);
    expect(m.p).toBeCloseTo(0.0495, 3);
  });
});

d("korelasyon, regresyon, ki-kare, güvenirlik", () => {
  const x = [1, 2, 3, 4, 5], y = [2, 4, 5, 4, 5];
  it("Pearson ve Spearman", () => {
    const r = pearson(x, y);
    expect(r.r).toBeCloseTo(0.7746, 4);
    expect(r.t).toBeCloseTo(2.1213, 4);
    expect(r.p).toBeCloseTo(0.124, 3);
    expect(spearman(x, y).r).toBeCloseTo(0.7379, 4);
  });
  it("basit regresyon", () => {
    const m = linearRegression(y, x.map((v) => [v]), ["x"]);
    expect(m.coefficients[0].b).toBeCloseTo(2.2, 6);
    expect(m.coefficients[1].b).toBeCloseTo(0.6, 6);
    expect(m.r2).toBeCloseTo(0.6, 6);
    expect(m.F).toBeCloseTo(4.5, 6);
    expect(m.p).toBeCloseTo(0.124, 3);
    expect(m.coefficients[1].beta).toBeCloseTo(0.7746, 4);
  });
  it("çoklu regresyon ve tam doğrusal bağlantı", () => {
    const X = [[1, 2], [2, 1], [3, 4], [4, 3], [5, 6], [6, 5]];
    const yy = X.map(([a, b]) => 1 + 2 * a + 3 * b);
    const m = linearRegression(yy, X, ["a", "b"]);
    expect(m.coefficients.map((c) => Number(c.b.toFixed(6)))).toEqual([1, 2, 3]);
    expect(m.r2).toBeCloseTo(1, 6);
    expect(() => linearRegression(yy, X.map(([a]) => [a, 2 * a]), ["a", "a2"])).toThrow();
  });
  it("ki-kare bağımsızlık", () => {
    const a = [...Array(10).fill("A"), ...Array(20).fill("A"), ...Array(30).fill("B"), ...Array(40).fill("B")];
    const b = [...Array(10).fill("x"), ...Array(20).fill("y"), ...Array(30).fill("x"), ...Array(40).fill("y")];
    const c = chiSquareIndependence(a, b);
    expect(c.chi2).toBeCloseTo(0.7937, 4);
    expect(c.df).toBe(1);
    expect(c.p).toBeCloseTo(0.373, 3);
  });
  it("Cronbach alfa", () => {
    const items = [[3, 4, 3], [4, 4, 5], [2, 3, 2], [5, 5, 4], [3, 3, 3], [4, 5, 4]];
    const r = cronbachAlpha(items, ["m1", "m2", "m3"]);
    const totals = items.map((it) => it[0] + it[1] + it[2]);
    const sv = [0, 1, 2].reduce((s, j) => s + variance(items.map((it) => it[j])), 0);
    expect(r.alpha).toBeCloseTo(1.5 * (1 - sv / variance(totals)), 10);
    expect(r.alpha).toBeCloseTo(0.9079, 4); // elle: 1.5 × (1 − 3.0 / 7.6)
  });
  it("betimsel: çarpıklık ve basıklık (SPSS)", () => {
    const s = describe([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(s.mean).toBe(5);
    expect(s.sd).toBeCloseTo(2.138, 3);
    expect(s.skewness).toBeCloseTo(0.8185, 3);
    expect(s.kurtosis).toBeCloseTo(0.9406, 3);
  });
});
