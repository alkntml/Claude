import { describe, expect, it } from "vitest";
import { runAnalysis } from "@/lib/stats/apa";
import { dunnTest, friedmanTest, logisticRegression, repeatedAnova, twoWayAnova, wilcoxonSignedRank } from "@/lib/stats/tests2";

/** D224: değerler R 4.3.3 (wilcox.test, friedman.test, rstatix::dunn_test / anova_test, car::Anova(type = 3), glm) çıktısıdır. Veri setleri R’nin yerleşik setleridir. */
const R: Record<string, number> = {
  "dunn.pg.1.p": 0.263684267891386,
  "dunn.pg.1.padj": 0.263684267891386,
  "dunn.pg.1.z": -1.11772545437879,
  "dunn.pg.2.p": 0.0911639440484998,
  "dunn.pg.2.padj": 0.182327888097,
  "dunn.pg.2.z": 1.68928960718612,
  "dunn.pg.3.p": 0.0050002903702577,
  "dunn.pg.3.padj": 0.0150008711107731,
  "dunn.pg.3.z": 2.80701506156491,
  "dunn.ww.1.p": 0.0907680484008737,
  "dunn.ww.1.padj": 0.181536096801747,
  "dunn.ww.1.z": -1.69136009752021,
  "dunn.ww.2.p": 0.00101159137227127,
  "dunn.ww.2.padj": 0.00303477411681381,
  "dunn.ww.2.z": -3.28728294815841,
  "dunn.ww.3.p": 0.11050601909247,
  "dunn.ww.3.padj": 0.181536096801747,
  "dunn.ww.3.z": -1.5959228506382,
  "fri.W": 0.43127147766323,
  "fri.chi2": 38.8144329896907,
  "fri.p": 1.90009435975526e-08,
  "fri2.chi2": 9.78,
  "fri2.p": 0.0205318348501817,
  "lg.acc": 0.9375,
  "lg.b1": 18.8662987172041,
  "lg.b2": -8.08347518244463,
  "lg.b3": 0.0362555960822165,
  "lg.chi2": 33.1706228045908,
  "lg.cs": 0.645335129678142,
  "lg.dev": 10.059110472267,
  "lg.nag": 0.8708970180419,
  "lg.null": 43.2297332768578,
  "lg.or.wt.hi": 0.12631424353066,
  "lg.or.wt.lo": 7.53928814188363e-07,
  "lg.p": 6.26744854783834e-08,
  "lg.p1": 0.0112581987166137,
  "lg.p2": 0.00843381259970702,
  "lg.p3": 0.0409146464590299,
  "lg.se1": 7.44355806020527,
  "lg.se2": 3.0686751130547,
  "lg.se3": 0.0177341536507693,
  "lg2.b1": 21.7505291681781,
  "lg2.b2": -6.32969487501369,
  "lg2.b3": -6.13348761837014,
  "lg2.se1": 8.43343124273613,
  "lg2.se2": 2.42463159028008,
  "lg2.se3": 2.70016880966496,
  "rm.att.F": 19.882,
  "rm.att.ges": 0.175,
  "rm.att.ggE": 0.826,
  "rm.att.ggp": 1.52e-08,
  "rm.att.hfE": 0.909,
  "rm.att.hfp": 3.41e-09,
  "rm.att.mW": 0.666,
  "rm.att.mp": 0.046,
  "rm.att.p": 6.66e-10,
  "rm.m3.F": 2.871,
  "rm.m3.ges": 0.088,
  "rm.m3.ggE": 0.952,
  "rm.m3.ggp": 0.086,
  "rm.m3.hfE": 1.201,
  "rm.m3.hfp": 0.083,
  "rm.m3.mW": 0.95,
  "rm.m3.mp": 0.813,
  "rm.m3.p": 0.083,
  "tw.mt.am.F": 3.24836366636338,
  "tw.mt.am.p": 0.0831005254587753,
  "tw.mt.am.ss": 29.8673504273503,
  "tw.mt.am:cyl.F": 1.38323349309211,
  "tw.mt.am:cyl.p": 0.268614022629598,
  "tw.mt.am:cyl.ss": 25.4365112433863,
  "tw.mt.cyl.F": 22.3209620988318,
  "tw.mt.cyl.p": 2.27426338198936e-06,
  "tw.mt.cyl.ss": 410.463892195767,
  "tw.mt.err": 239.059166666667,
  "tw.tg.dose.F": 91.999964892867,
  "tw.tg.dose.p": 4.04629119599228e-18,
  "tw.tg.dose.ss": 2426.43433333333,
  "tw.tg.err": 712.106,
  "tw.tg.supp.F": 15.5719794524973,
  "tw.tg.supp.p": 0.000231182809773424,
  "tw.tg.supp.ss": 205.35,
  "tw.tg.supp:dose.F": 4.10699109402252,
  "tw.tg.supp:dose.p": 0.021860268964791,
  "tw.tg.supp:dose.ss": 108.319,
  "wil.exact.V": 34,
  "wil.exact.p": 0.0234375,
  "wil.sleep.V": 0,
  "wil.sleep.p": 0.00909069801592506,
  "wil.ties.V": 50,
  "wil.ties.p": 0.0235363736220907,
};
const DATA = {"mtcars":{"mpg":[21.0,21.0,22.8,21.4,18.7,18.1,14.3,24.4,22.8,19.2,17.8,16.4,17.3,15.2,10.4,10.4,14.7,32.4,30.4,33.9,21.5,15.5,15.2,13.3,19.2,27.3,26.0,30.4,15.8,19.7,15.0,21.4],"wt":[2.62,2.875,2.32,3.215,3.44,3.46,3.57,3.19,3.15,3.44,3.44,4.07,3.73,3.78,5.25,5.424,5.345,2.2,1.615,1.835,2.465,3.52,3.435,3.84,3.845,1.935,2.14,1.513,3.17,2.77,3.57,2.78],"hp":[110.0,110.0,93.0,110.0,175.0,105.0,245.0,62.0,95.0,123.0,123.0,180.0,180.0,180.0,205.0,215.0,230.0,66.0,52.0,65.0,97.0,150.0,150.0,245.0,175.0,66.0,91.0,113.0,264.0,175.0,335.0,109.0],"am":[1.0,1.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,1.0,1.0,0.0,0.0,0.0,0.0,0.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],"cyl":[6.0,6.0,4.0,6.0,8.0,6.0,8.0,4.0,4.0,6.0,6.0,8.0,8.0,8.0,8.0,8.0,8.0,4.0,4.0,4.0,4.0,8.0,8.0,8.0,8.0,4.0,4.0,4.0,8.0,6.0,8.0,4.0],"vs":[0.0,0.0,1.0,1.0,0.0,1.0,0.0,1.0,1.0,1.0,1.0,0.0,0.0,0.0,0.0,0.0,0.0,1.0,1.0,1.0,1.0,0.0,0.0,0.0,0.0,1.0,0.0,1.0,0.0,0.0,0.0,1.0]},"att":{"rating":[43.0,63.0,71.0,61.0,81.0,43.0,58.0,71.0,72.0,67.0,64.0,67.0,69.0,68.0,77.0,81.0,74.0,65.0,65.0,50.0,50.0,64.0,53.0,40.0,63.0,66.0,78.0,48.0,85.0,82.0],"complaints":[51.0,64.0,70.0,63.0,78.0,55.0,67.0,75.0,82.0,61.0,53.0,60.0,62.0,83.0,77.0,90.0,85.0,60.0,70.0,58.0,40.0,61.0,66.0,37.0,54.0,77.0,75.0,57.0,85.0,82.0],"privileges":[30.0,51.0,68.0,45.0,56.0,49.0,42.0,50.0,72.0,45.0,53.0,47.0,57.0,83.0,54.0,50.0,64.0,65.0,46.0,68.0,33.0,52.0,52.0,42.0,42.0,66.0,58.0,44.0,71.0,39.0],"learning":[39.0,54.0,69.0,47.0,66.0,44.0,56.0,55.0,67.0,47.0,58.0,39.0,42.0,45.0,72.0,72.0,69.0,75.0,57.0,54.0,34.0,62.0,50.0,58.0,48.0,63.0,74.0,45.0,71.0,59.0]},"tg":{"len":[4.2,11.5,7.3,5.8,6.4,10.0,11.2,11.2,5.2,7.0,16.5,16.5,15.2,17.3,22.5,17.3,13.6,14.5,18.8,15.5,23.6,18.5,33.9,25.5,26.4,32.5,26.7,21.5,23.3,29.5,15.2,21.5,17.6,9.7,14.5,10.0,8.2,9.4,16.5,9.7,19.7,23.3,23.6,26.4,20.0,25.2,25.8,21.2,14.5,27.3,25.5,26.4,22.4,24.5,24.8,30.9,26.4,27.3,29.4,23.0],"supp":["VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","VC","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ","OJ"],"dose":["0.5","0.5","0.5","0.5","0.5","0.5","0.5","0.5","0.5","0.5","1","1","1","1","1","1","1","1","1","1","2","2","2","2","2","2","2","2","2","2","0.5","0.5","0.5","0.5","0.5","0.5","0.5","0.5","0.5","0.5","1","1","1","1","1","1","1","1","1","1","2","2","2","2","2","2","2","2","2","2"]},"wb":{"breaks":[26.0,30.0,54.0,25.0,70.0,52.0,51.0,26.0,67.0,18.0,21.0,29.0,17.0,12.0,18.0,35.0,30.0,36.0,36.0,21.0,24.0,18.0,10.0,43.0,28.0,15.0,26.0,27.0,14.0,29.0,19.0,29.0,31.0,41.0,20.0,44.0,42.0,26.0,19.0,16.0,39.0,28.0,21.0,39.0,29.0,20.0,21.0,24.0,17.0,13.0,15.0,15.0,16.0,28.0],"tension":["L","L","L","L","L","L","L","L","L","M","M","M","M","M","M","M","M","M","H","H","H","H","H","H","H","H","H","L","L","L","L","L","L","L","L","L","M","M","M","M","M","M","M","M","M","H","H","H","H","H","H","H","H","H"]},"pg":{"weight":[4.17,5.58,5.18,6.11,4.5,4.61,5.17,4.53,5.33,5.14,4.81,4.17,4.41,3.59,5.87,3.83,6.03,4.89,4.32,4.69,6.31,5.12,5.54,5.5,5.37,5.29,4.92,6.15,5.8,5.26],"group":["ctrl","ctrl","ctrl","ctrl","ctrl","ctrl","ctrl","ctrl","ctrl","ctrl","trt1","trt1","trt1","trt1","trt1","trt1","trt1","trt1","trt1","trt1","trt2","trt2","trt2","trt2","trt2","trt2","trt2","trt2","trt2","trt2"]},"sl":{"a":[0.7,-1.6,-0.2,-1.2,-0.1,3.4,3.7,0.8,0.0,2.0],"b":[1.9,0.8,1.1,0.1,-0.1,4.4,5.5,1.6,4.6,3.4]}};
const close = (got: number, key: string, tol = 1e-5) => expect(Math.abs(got - R[key])).toBeLessThanOrEqual(Math.max(1e-7, Math.abs(R[key]) * tol));
const grp = (v: number[], g: string[]) => { const lv = [...new Set(g)]; return { lv, gs: lv.map((l) => v.filter((_, i) => g[i] === l)) }; };
const att = DATA.att.rating.map((_, i) => [DATA.att.rating[i], DATA.att.complaints[i], DATA.att.privileges[i], DATA.att.learning[i]]);
const m3 = [[8, 7, 6], [9, 5, 6], [5, 4, 7], [7, 4, 3], [9, 8, 8], [7, 6, 5], [7, 7, 9], [6, 8, 5], [6, 5, 5], [4, 3, 2]];

describe("Yeni istatistik analizleri: R ile karşılaştırma (D224)", () => {
  it("Wilcoxon işaretli sıralar: kesin, bağlı ve sıfırlı durumlar", () => {
    const a = wilcoxonSignedRank(DATA.sl.a, DATA.sl.b); close(a.V, "wil.sleep.V"); close(a.p, "wil.sleep.p");
    const b = wilcoxonSignedRank([12.1, 14.3, 9.8, 11.2, 15.6, 13.4, 10.9, 12.7], [10.2, 13.1, 10.4, 9.1, 12.8, 12.9, 8.5, 11.0]); expect(b.exact).toBe(true); close(b.V, "wil.exact.V"); close(b.p, "wil.exact.p");
    const c = wilcoxonSignedRank([5, 7, 7, 9, 10, 4, 8, 8, 6, 12, 3, 9], [4, 6, 8, 7, 7, 4, 5, 9, 2, 8, 3, 6]); expect(c.exact).toBe(false); close(c.V, "wil.ties.V"); close(c.p, "wil.ties.p");
  });
  it("Friedman ve Kendall W", () => {
    const f = friedmanTest(att); close(f.chi2, "fri.chi2"); close(f.p, "fri.p"); close(f.kendallW, "fri.W");
    const g = friedmanTest([[3, 5, 4, 2], [4, 4, 6, 3], [5, 6, 5, 4], [2, 3, 3, 3], [6, 7, 8, 5], [4, 5, 5, 5]]); close(g.chi2, "fri2.chi2"); close(g.p, "fri2.p");
  });
  it("Dunn (Holm) — bağ düzeltmeli", () => {
    for (const [nm, G] of [["pg", grp(DATA.pg.weight, DATA.pg.group)], ["ww", grp(DATA.wb.breaks, DATA.wb.tension)]] as const) dunnTest(G.gs, G.lv).forEach((r, i) => { close(r.z, `dunn.${nm}.${i + 1}.z`); close(r.p, `dunn.${nm}.${i + 1}.p`); close(r.pAdj, `dunn.${nm}.${i + 1}.padj`); });
  });
  it("İki yönlü ANOVA Tip III: dengeli (ToothGrowth) ve dengesiz (mtcars) tasarım", () => {
    const tw = twoWayAnova(DATA.tg.len, DATA.tg.supp, DATA.tg.dose); const ks = ["supp", "dose", "supp:dose"];
    tw.terms.forEach((t, i) => { close(t.ss, `tw.tg.${ks[i]}.ss`); close(t.F, `tw.tg.${ks[i]}.F`); close(t.p, `tw.tg.${ks[i]}.p`, 1e-4); }); close(tw.error.ss, "tw.tg.err");
    const t2 = twoWayAnova(DATA.mtcars.mpg, DATA.mtcars.am.map(String), DATA.mtcars.cyl.map(String)); expect(t2.balanced).toBe(false); const k2 = ["am", "cyl", "am:cyl"];
    t2.terms.forEach((t, i) => { close(t.ss, `tw.mt.${k2[i]}.ss`); close(t.F, `tw.mt.${k2[i]}.F`); close(t.p, `tw.mt.${k2[i]}.p`, 1e-4); }); close(t2.error.ss, "tw.mt.err");
  });
  it("Tekrarlı ölçümler ANOVA: küresellik ve düzeltmeler (rstatix 3 basamağa yuvarlar)", () => {
    for (const [nm, m] of [["att", att], ["m3", m3]] as const) {
      const r = repeatedAnova(m); const near = (got: number, key: string) => expect(Math.abs(got - R[key])).toBeLessThanOrEqual(6e-4);
      near(r.F, `rm.${nm}.F`); near(r.p, `rm.${nm}.p`); near(r.ssCond / (r.ssCond + r.ssSubj + r.ssErr), `rm.${nm}.ges`);
      near(r.mauchly!.W, `rm.${nm}.mW`); near(r.mauchly!.p, `rm.${nm}.mp`); near(r.epsGG, `rm.${nm}.ggE`); near(r.pGG, `rm.${nm}.ggp`); near(r.pHF, `rm.${nm}.hfp`);
      if (R[`rm.${nm}.hfE`] <= 1) near(r.epsHF, `rm.${nm}.hfE`); else expect(r.epsHF).toBe(1); // R ham ε’yu (1,201) bildirir; SPSS gibi 1’de sınırlıyoruz
    }
  });
  it("Lojistik regresyon: katsayılar, SH, OR güven aralığı, sapma, Nagelkerke", () => {
    const X = DATA.mtcars.wt.map((w, i) => [w, DATA.mtcars.hp[i]]);
    const lg = logisticRegression(DATA.mtcars.am, X, ["wt", "hp"]);
    lg.coefficients.forEach((c, i) => { close(c.b, `lg.b${i + 1}`); close(c.se, `lg.se${i + 1}`); close(c.p, `lg.p${i + 1}`, 1e-4); });
    close(lg.coefficients[1].orCi[0], "lg.or.wt.lo"); close(lg.coefficients[1].orCi[1], "lg.or.wt.hi");
    close(lg.nullDeviance, "lg.null"); close(lg.deviance, "lg.dev"); close(lg.chi2, "lg.chi2"); close(lg.p, "lg.p", 1e-4); close(lg.coxSnell, "lg.cs"); close(lg.nagelkerke, "lg.nag"); close(lg.accuracy, "lg.acc");
    const lg2 = logisticRegression(DATA.mtcars.vs, DATA.mtcars.wt.map((w, i) => [w, DATA.mtcars.am[i]]), ["wt", "am"]);
    lg2.coefficients.forEach((c, i) => { close(c.b, `lg2.b${i + 1}`); close(c.se, `lg2.se${i + 1}`); });
  });
  it("tam ayrışmada anlaşılır hata verir", () => {
    expect(() => logisticRegression([0, 0, 0, 0, 1, 1, 1, 1], [[1], [2], [3], [4], [5], [6], [7], [8]], ["x"])).toThrow(/ayrışma/);
  });
  it("raporlar: üç dilde üretilir, sayılar motorla aynı", () => {
    const rows = [Object.keys(DATA.att), ...DATA.att.rating.map((_, i) => Object.keys(DATA.att).map((k) => String((DATA.att as Record<string, number[]>)[k][i])))];
    const fr = runAnalysis(rows, { kind: "friedman", vars: ["rating", "complaints", "privileges", "learning"] }, "tr");
    expect(fr.text).toContain("Friedman"); expect(fr.text).toContain(`χ²(3, N = 30) = ${R["fri.chi2"].toFixed(2)}`);
    const rm = runAnalysis(rows, { kind: "rmanova", vars: ["rating", "complaints", "privileges", "learning"] }, "en");
    expect(rm.notes.join(" ")).toContain("Mauchly"); expect(rm.table).toContain("19.88");
    const mrows = [["am", "wt", "hp"], ...DATA.mtcars.am.map((a, i) => [String(a), String(DATA.mtcars.wt[i]), String(DATA.mtcars.hp[i])])];
    const lg = runAnalysis(mrows, { kind: "logistic", dv: "am", ivs: ["wt", "hp"] }, "de");
    expect(lg.text).toContain("logistische Regression"); expect(lg.table).toContain("| wt |");
    const kw = runAnalysis([["y", "g"], ...DATA.pg.weight.map((w, i) => [String(w), DATA.pg.group[i]])], { kind: "kruskal", dv: "y", group: "g" }, "tr");
    expect(kw.notes.join(" ")).toContain("Dunn");
  });
});
