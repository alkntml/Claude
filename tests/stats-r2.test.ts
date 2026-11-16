import { describe, expect, it } from "vitest";
import { runAnalysis } from "@/lib/stats/apa";
import { numberFormatOf, toNumAs } from "@/lib/files/stats";
import { dCI, eta2CI, fisherExact2x2, gamesHowell, independentT, linearRegression, oneSampleT, oneWayAnova, pAdjust, pairedT, regressionDiagnostics, shapiroWilk, tukeyHSD, yatesChi2 } from "@/lib/stats/tests";

/** D222: değerler R 4.3.3 (shapiro.test, fisher.test, chisq.test, p.adjust, TukeyHSD, rstatix, effectsize, lmtest) çıktısıdır */
const R: Record<string, number> = {
  "sw.mpg.W": 0.947564726479274,
  "sw.mpg.p": 0.122881358539443,
  "sw.n3.W": 0.964285714285714,
  "sw.n3.p": 0.636886845028963,
  "sw.n5.W": 0.900618006915692,
  "sw.n5.p": 0.413310689079544,
  "sw.fib.W": 0.783573469378153,
  "sw.fib.p": 0.00915118577542891,
  "sw.n12.p": 0.0010350796687976,
  "sw.sepal.p": 0.0101811611756293,
  "fisher.tea.p": 0.485714285714286,
  "fisher.t2.p": 0.000536724119143436,
  "fisher.t4.p": 0.0151515151515152,
  "yates.t5.chi2": 5.29419560185185,
  "yates.t5.p": 0.021396610967139,
  "padj.holm.1": 0.05,
  "padj.holm.5": 0.2,
  "padj.BH.2": 0.0588,
  "padj.BH.6": 0.0588,
  "tukey.pg.3.diff": 0.865,
  "tukey.pg.3.lwr": 0.173783948589542,
  "tukey.pg.3.upr": 1.55621605141046,
  "tukey.pg.3.p": 0.0120064239794527,
  "tukey.pg.1.p": 0.390871144202125,
  "gh.iris.1.p": 4.71e-10,
  "gh.iris.3.lwr": 0.0525558548096051,
  "d.mt.lo": -2.26597309871599,
  "d.mt.hi": -0.670568604700452,
  "d.paired.lo": -2.1180165952233,
  "d.paired.hi": -0.414627662055387,
  "d.one.lo": -0.331580149413003,
  "eta.pg.lo": 0.0109923125347401,
  "eta.pg.hi": 0.490174887564183,
  "reg.bp.stat": 0.880722470178814,
  "reg.bp.p": 0.643803814544341,
  "reg.dw": 1.36239927295101,
  "reg.sw.W": 0.927916476117682,
  "reg.sw.p": 0.0342747606137479,
};
const close = (got: number, key: string, rel = 1e-5) => expect(Math.abs(got - R[key])).toBeLessThanOrEqual(Math.max(1e-6, Math.abs(R[key]) * rel));
const mpg = [21, 21, 22.8, 21.4, 18.7, 18.1, 14.3, 24.4, 22.8, 19.2, 17.8, 16.4, 17.3, 15.2, 10.4, 10.4, 14.7, 32.4, 30.4, 33.9, 21.5, 15.5, 15.2, 13.3, 19.2, 27.3, 26, 30.4, 15.8, 19.7, 15, 21.4];
const wt = [2.62, 2.875, 2.32, 3.215, 3.44, 3.46, 3.57, 3.19, 3.15, 3.44, 3.44, 4.07, 3.73, 3.78, 5.25, 5.424, 5.345, 2.2, 1.615, 1.835, 2.465, 3.52, 3.435, 3.84, 3.845, 1.935, 2.14, 1.513, 3.17, 2.77, 3.57, 2.78];
const hp = [110, 110, 93, 110, 175, 105, 245, 62, 95, 123, 123, 180, 180, 180, 205, 215, 230, 66, 52, 65, 97, 150, 150, 245, 175, 66, 91, 113, 264, 175, 335, 109];
const am = [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];
const pg = { ctrl: [4.17, 5.58, 5.18, 6.11, 4.5, 4.61, 5.17, 4.53, 5.33, 5.14], trt1: [4.81, 4.17, 4.41, 3.59, 5.87, 3.83, 6.03, 4.89, 4.32, 4.69], trt2: [6.31, 5.12, 5.54, 5.5, 5.37, 5.29, 4.92, 6.15, 5.8, 5.26] };
const sleepA = [0.7, -1.6, -0.2, -1.2, -0.1, 3.4, 3.7, 0.8, 0, 2], sleepB = [1.9, 0.8, 1.1, 0.1, -0.1, 4.4, 5.5, 1.6, 4.6, 3.4];

describe("İstatistik motoru: R ile karşılaştırma (D222)", () => {
  it("Shapiro–Wilk (n = 3, 5, 10, 12, 32, 150)", () => {
    const s = shapiroWilk(mpg); close(s.W, "sw.mpg.W"); close(s.p, "sw.mpg.p");
    const s3 = shapiroWilk([1, 2, 4]); close(s3.W, "sw.n3.W"); close(s3.p, "sw.n3.p");
    const s5 = shapiroWilk([2.1, 3.5, 1.2, 8.8, 4.4]); close(s5.W, "sw.n5.W"); close(s5.p, "sw.n5.p");
    const sf = shapiroWilk([1, 1, 2, 3, 5, 8, 13, 21, 34, 55]); close(sf.W, "sw.fib.W"); close(sf.p, "sw.fib.p");
    close(shapiroWilk([3, 7, 2, 9, 4, 4, 8, 1, 6, 5, 12, 30]).p, "sw.n12.p");
  });
  it("Fisher kesin testi ve Yates düzeltmesi (2×2)", () => {
    close(fisherExact2x2([[3, 1], [1, 3]]).p, "fisher.tea.p");
    close(fisherExact2x2([[10, 2], [3, 15]]).p, "fisher.t2.p");
    close(fisherExact2x2([[0, 6], [5, 1]]).p, "fisher.t4.p");
    const y = yatesChi2([[20, 12], [15, 30]]); close(y.chi2, "yates.t5.chi2"); close(y.p, "yates.t5.p");
  });
  it("Holm ve Benjamini–Hochberg düzeltmeleri", () => {
    const pv = [0.01, 0.04, 0.03, 0.005, 0.2, 0.049];
    const h = pAdjust(pv, "holm"), b = pAdjust(pv, "BH");
    close(h[0], "padj.holm.1"); close(h[4], "padj.holm.5"); close(b[1], "padj.BH.2"); close(b[5], "padj.BH.6");
  });
  it("Tukey HSD ve Games–Howell", () => {
    const groups = [pg.ctrl, pg.trt1, pg.trt2], labels = ["ctrl", "trt1", "trt2"];
    const tk = tukeyHSD(groups, labels, oneWayAnova(groups));
    close(tk[2].diff, "tukey.pg.3.diff"); close(tk[2].lwr, "tukey.pg.3.lwr"); close(tk[2].upr, "tukey.pg.3.upr"); close(tk[2].p, "tukey.pg.3.p", 1e-4); close(tk[0].p, "tukey.pg.1.p", 1e-4);
    const gh = gamesHowell(groups, labels);
    expect(Math.round(gh[2].p * 1000) / 1000).toBe(0.024); // rstatix p’yi 3 basamağa yuvarlar
  });
  it("Etki büyüklüğü güven aralıkları (merkezi olmayan t / F)", () => {
    const a0 = mpg.filter((_, i) => !am[i]), a1 = mpg.filter((_, i) => am[i]);
    const t = independentT(a0, a1);
    const ci = dCI(t.student.t, t.student.df, Math.sqrt(1 / a0.length + 1 / a1.length)); close(ci[0], "d.mt.lo"); close(ci[1], "d.mt.hi");
    const p = pairedT(sleepA, sleepB); const cp = dCI(p.t, p.df, 1 / Math.sqrt(p.df + 1)); close(cp[0], "d.paired.lo"); close(cp[1], "d.paired.hi");
    const o = oneSampleT(mpg, 20); close(dCI(o.t, o.df, 1 / Math.sqrt(o.df + 1))[0], "d.one.lo");
    const a = oneWayAnova([pg.ctrl, pg.trt1, pg.trt2]); const e = eta2CI(a.F, a.dfBetween, a.dfWithin); close(e[0], "eta.pg.lo", 1e-4); close(e[1], "eta.pg.hi", 1e-4);
  });
  it("Regresyon varsayımları: Breusch–Pagan, Durbin–Watson, artıkların normalliği", () => {
    const X = wt.map((w, i) => [w, hp[i]]);
    const reg = linearRegression(mpg, X, ["wt", "hp"]);
    const d = regressionDiagnostics(mpg, X, reg);
    close(d.breuschPagan.stat, "reg.bp.stat"); close(d.breuschPagan.p, "reg.bp.p"); close(d.durbinWatson, "reg.dw"); close(d.shapiro!.W, "reg.sw.W"); close(d.shapiro!.p, "reg.sw.p");
  });
  it("sayı biçimi sütun bazında: “2.875” 2875 değil 2,875 okunur (veri yüklemede ağırlık sütunu)", () => {
    expect(numberFormatOf(["2.62", "2.875", "3.215"])).toBe("dot");
    expect(numberFormatOf(["3,5", "1.250,75"])).toBe("comma");
    expect(numberFormatOf(["1.234.567", "2.500"])).toBe("dot-thousands");
    expect(toNumAs("2.875", "dot")).toBe(2.875);
    expect(toNumAs("1.250,75", "comma")).toBe(1250.75);
    const rows = [["mpg", "wt", "hp"], ...mpg.map((m, i) => [String(m), String(wt[i]), String(hp[i])])];
    const r = runAnalysis(rows, { kind: "regression", dv: "mpg", ivs: ["wt", "hp"] }, "en");
    expect(r.table).toContain("| wt | -3.88 | 0.63 |");
    expect(r.notes.join(" ")).toContain("R² = .83");
  });
});
