import { describe, expect, it } from "vitest";
import { META_FIELDS, effectOf, metaAnalysis, type MetaRowInput, type MetaType } from "@/lib/meta";

/** D224: değerler R 4.3.3 / metafor 4.4 (escalc, rma yöntem “FE” ve “DL”, regtest model “lm”) çıktısıdır; veri setleri metafor’un dat.normand1999, dat.bcg ve dat.mcdaniel1994 setleridir. */
const R: Record<string, number> = {
  "mt.smd.yi1": -0.355169640940107,
  "mt.smd.vi1": 0.0130646755415297,
  "mt.smd.yi2": -0.347940022739099,
  "mt.smd.vi2": 0.0644688760988567,
  "mt.smd.yi9": 0.289556230080755,
  "mt.smd.vi9": 0.0362717341580545,
  "mt.smd.fe": -0.410611419420981,
  "mt.smd.fe.lo": -0.531350593779481,
  "mt.smd.fe.hi": -0.289872245062482,
  "mt.smd.fe.p": 2.63815990636155e-11,
  "mt.smd.re": -0.530737310615977,
  "mt.smd.re.lo": -1.03879644186531,
  "mt.smd.re.hi": -0.022678179366644,
  "mt.smd.re.p": 0.0406138546109007,
  "mt.smd.re.z": -2.04745068059502,
  "mt.smd.Q": 123.729274359718,
  "mt.smd.Qp": 5.62251323204304e-23,
  "mt.smd.tau2": 0.539714374820215,
  "mt.smd.I2": 93.5342706555107,
  "mt.smd.egger.p": 0.632749382449907,
  "mt.smd.egger.t": -0.499488604524625,
  "mt.or.yi1": -0.938694140870392,
  "mt.or.vi1": 0.357124952253629,
  "mt.or.yi2": -1.66619072902655,
  "mt.or.vi2": 0.208132393657186,
  "mt.or.yi13": -0.0173418739290936,
  "mt.or.vi13": 0.0716351172956587,
  "mt.or.fe": -0.43613907613641,
  "mt.or.fe.lo": -0.518977849632808,
  "mt.or.fe.hi": -0.353300302640011,
  "mt.or.fe.p": 5.77962302347888e-25,
  "mt.or.re": -0.747392349732138,
  "mt.or.re.lo": -1.12422060928063,
  "mt.or.re.hi": -0.370564090183641,
  "mt.or.re.p": 0.000101345956155794,
  "mt.or.re.z": -3.88734669090611,
  "mt.or.Q": 163.1649151808,
  "mt.or.Qp": 1.18877259111069e-28,
  "mt.or.tau2": 0.366343406725599,
  "mt.or.I2": 92.6454777445856,
  "mt.or.egger.p": 0.159991485084265,
  "mt.or.egger.t": -1.50695069669431,
  "mt.r.yi1": 0,
  "mt.r.vi1": 0.00833333333333333,
  "mt.r.yi2": 0.0600721559210316,
  "mt.r.vi2": 0.0108695652173913,
  "mt.r.yi160": 0.309519604203112,
  "mt.r.vi160": 0.00581395348837209,
  "mt.r.fe": 0.210462375694229,
  "mt.r.fe.lo": 0.198007548869993,
  "mt.r.fe.hi": 0.222917202518465,
  "mt.r.fe.p": 1.55300600101705e-240,
  "mt.r.re": 0.236783587830836,
  "mt.r.re.lo": 0.20457953318503,
  "mt.r.re.hi": 0.268987642476642,
  "mt.r.re.p": 4.42332826090755e-47,
  "mt.r.re.z": 14.41083457915,
  "mt.r.Q": 789.732141529245,
  "mt.r.Qp": 2.67263814052238e-84,
  "mt.r.tau2": 0.0267577743581274,
  "mt.r.I2": 79.8665912606633,
  "mt.r.egger.p": 0.0307700161003102,
  "mt.r.egger.t": 2.17956774844239,
};
const DATA: Record<MetaType, number[][]> = {"smd":[[155,55.0,47.0,156,75.0,64.0],[31,27.0,7.0,32,29.0,4.0],[75,64.0,17.0,71,119.0,29.0],[18,66.0,20.0,18,137.0,48.0],[8,14.0,8.0,13,18.0,11.0],[57,19.0,7.0,52,18.0,4.0],[34,52.0,45.0,33,41.0,34.0],[110,21.0,16.0,183,31.0,27.0],[60,30.0,27.0,52,23.0,20.0]],"or":[[4,123,11,139],[6,306,29,303],[3,231,11,220],[62,13598,248,12867],[33,5069,47,5808],[180,1541,372,1451],[8,2545,10,629],[505,88391,499,88391],[29,7499,45,7277],[17,1716,65,1665],[186,50634,141,27338],[5,2498,3,2341],[27,16913,29,17854]],"r":[[0.0,123],[0.06,95],[0.36,69],[0.15,1832],[0.14,78],[0.06,329],[0.09,153],[0.4,29],[0.39,29],[0.14,157],[0.36,149],[0.28,92],[0.62,15],[0.07,15],[0.18,170],[0.42,19],[0.08,19],[0.18,68],[0.43,93],[0.04,57],[-0.04,80],[0.05,53],[-0.14,24],[0.05,57],[0.35,275],[-0.08,45],[0.24,79],[0.16,107],[0.25,31],[0.68,407],[0.61,84],[0.81,8],[0.99,6],[0.66,7],[0.45,12],[0.71,14],[0.27,40],[-0.02,40],[0.29,99],[0.13,164],[0.03,67],[0.0,57],[0.09,50],[-0.03,129],[0.46,49],[0.3,63],[0.33,56],[0.24,238],[0.64,20],[0.12,122],[0.15,51],[0.44,40],[0.0,210],[0.16,334],[0.21,310],[0.29,180],[0.19,93],[0.04,472],[0.56,44],[0.14,75],[0.44,68],[0.36,38],[0.34,42],[0.11,39],[0.4,49],[0.23,41],[0.22,200],[0.44,850],[0.27,41],[0.11,32],[0.27,65],[-0.07,125],[0.32,134],[0.05,21],[0.2,44],[0.18,170],[0.34,149],[0.03,296],[0.45,24],[0.34,312],[0.51,205],[0.41,30],[0.37,11],[0.25,22],[-0.17,37],[0.47,43],[0.32,72],[-0.09,72],[0.33,108],[0.22,73],[0.27,73],[0.0,117],[0.41,80],[0.16,95],[0.0,182],[0.03,93],[0.01,64],[0.03,370],[0.14,131],[0.11,87],[0.08,80],[-0.13,41],[0.13,35],[0.36,106],[0.06,86],[0.19,54],[0.27,393],[0.17,102],[0.34,115],[0.28,63],[0.11,22],[0.07,37],[-0.13,116],[0.12,416],[0.12,101],[0.37,1359],[0.26,82],[0.42,32],[0.37,42],[0.17,196],[0.19,44],[0.32,47],[0.33,37],[0.24,12],[0.09,1807],[0.36,73],[0.26,73],[0.42,70],[0.62,30],[0.87,60],[-0.07,38],[0.65,12],[0.17,33],[0.3,33],[0.45,28],[0.24,51],[0.02,49],[0.23,164],[0.17,195],[0.32,165],[0.36,40],[0.09,100],[0.13,4195],[0.29,179],[0.49,74],[0.4,110],[0.23,31],[0.31,70],[0.46,21],[-0.12,29],[0.22,51],[0.59,51],[0.21,40],[0.02,40],[-0.03,129],[0.28,196],[-0.04,31],[0.19,494],[0.23,101],[0.3,175]]} as unknown as Record<MetaType, number[][]>;
const rows = (type: MetaType): MetaRowInput[] => DATA[type].map((vals, i) => ({ id: `s${i + 1}`, label: `S${i + 1}`, v: Object.fromEntries(META_FIELDS[type].map((f, j) => [f, vals[j]])) }));
const close = (got: number, key: string, tol = 1e-5) => expect(Math.abs(got - R[key])).toBeLessThanOrEqual(Math.max(1e-7, Math.abs(R[key]) * tol));

describe("Meta-analiz: R metafor ile karşılaştırma (D224)", () => {
  for (const type of ["smd", "or", "r"] as const) {
    it(`${type}: çalışma etkileri, sabit ve rastgele etkiler, heterojenlik, Egger`, () => {
      const res = metaAnalysis(type, "random", rows(type));
      const n = DATA[type].length;
      for (const i of [1, 2, n]) { close(res.studies[i - 1].yi, `mt.${type}.yi${i}`); close(res.studies[i - 1].vi, `mt.${type}.vi${i}`); }
      close(res.fixed.est, `mt.${type}.fe`); close(res.fixed.ci[0], `mt.${type}.fe.lo`); close(res.fixed.ci[1], `mt.${type}.fe.hi`); close(res.fixed.p, `mt.${type}.fe.p`, 1e-3);
      close(res.random.est, `mt.${type}.re`); close(res.random.ci[0], `mt.${type}.re.lo`); close(res.random.ci[1], `mt.${type}.re.hi`); close(res.random.p, `mt.${type}.re.p`, 1e-3); close(res.random.z, `mt.${type}.re.z`);
      close(res.Q, `mt.${type}.Q`); close(res.pQ, `mt.${type}.Qp`, 1e-4); close(res.tau2, `mt.${type}.tau2`); close(res.I2, `mt.${type}.I2`);
      close(res.egger!.p, `mt.${type}.egger.p`, 1e-3);
    });
  }
  it("gösterim ölçeği: OR → exp, r → tanh; model seçimi birleşik etkiyi belirler", () => {
    const r = metaAnalysis("or", "fixed", rows("or"));
    expect(r.back(r.pooled.est)).toBeCloseTo(Math.exp(R["mt.or.fe"]), 8); expect(r.nullValue).toBe(1);
    expect(metaAnalysis("r", "random", rows("r")).back(R["mt.r.re"])).toBeCloseTo(Math.tanh(R["mt.r.re"]), 12);
    expect(metaAnalysis("smd", "fixed", rows("smd")).pooled.est).toBeCloseTo(R["mt.smd.fe"], 6);
  });
  it("eksik/geçersiz satırlar atlanır ve nedeni söylenir; en az 2 çalışma gerekir", () => {
    const rs = rows("smd"); rs[0].v.sd1 = null; rs[1].v.n2 = 1;
    const res = metaAnalysis("smd", "random", rs);
    expect(res.k).toBe(DATA.smd.length - 2); expect(res.skipped).toHaveLength(2);
    expect(() => metaAnalysis("smd", "random", rows("smd").slice(0, 1))).toThrow(/en az 2/);
    expect(effectOf("or", { e1: 0, n1: 20, e2: 0, n2: 20 })).toMatch(/hesaplanamaz/);
    const z = effectOf("or", { e1: 0, n1: 20, e2: 5, n2: 20 }); expect(typeof z).toBe("object"); // sıfır göze: +0,5 düzeltmesi
    expect(effectOf("generic", { yi: 0.3, sei: 0 })).toMatch(/standart hata/);
  });
});
