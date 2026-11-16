/**
 * Çıkarımsal istatistik testleri (deterministik). Sonuçlar SPSS/R ile aynı formüllerle hesaplanır;
 * yapay zekâ hiçbir değeri üretmez.
 */
import { chi2RightTail, fRightTail, logGamma, normalTwoTailed, normalUpper, pnf, pnt, ptukey, qnorm, solveMonotone, tCritical, tTwoTailed, zCritical } from "./dist";

export const mean = (x: number[]) => x.reduce((a, b) => a + b, 0) / x.length;
export function variance(x: number[]): number {
  const m = mean(x);
  return x.reduce((a, b) => a + (b - m) ** 2, 0) / (x.length - 1);
}
export const sd = (x: number[]) => Math.sqrt(variance(x));

export interface Descriptive { n: number; mean: number; sd: number; se: number; min: number; max: number; skewness: number; kurtosis: number; skewZ: number; kurtZ: number }

/** Betimsel istatistikler; çarpıklık/basıklık SPSS ile aynı (düzeltilmiş G1, G2) ve standart hataları */
export function describe(x: number[]): Descriptive {
  const n = x.length;
  const m = mean(x);
  const s = n > 1 ? sd(x) : 0;
  const m2 = x.reduce((a, b) => a + (b - m) ** 2, 0) / n;
  const m3 = x.reduce((a, b) => a + (b - m) ** 3, 0) / n;
  const m4 = x.reduce((a, b) => a + (b - m) ** 4, 0) / n;
  const g1 = m2 ? m3 / m2 ** 1.5 : 0;
  const g2 = m2 ? m4 / m2 ** 2 - 3 : 0;
  const skew = n > 2 ? (Math.sqrt(n * (n - 1)) / (n - 2)) * g1 : NaN;
  const kurt = n > 3 ? ((n - 1) / ((n - 2) * (n - 3))) * ((n + 1) * g2 + 6) : NaN;
  const ses = n > 2 ? Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3))) : NaN;
  const sek = n > 3 ? 2 * ses * Math.sqrt((n * n - 1) / ((n - 3) * (n + 5))) : NaN;
  return { n, mean: m, sd: s, se: n ? s / Math.sqrt(n) : NaN, min: Math.min(...x), max: Math.max(...x), skewness: skew, kurtosis: kurt, skewZ: skew / ses, kurtZ: kurt / sek };
}

// ---------------------------------------------------------------------------
// t testleri
// ---------------------------------------------------------------------------

export interface IndependentT {
  groups: [Descriptive, Descriptive];
  levene: { F: number; df1: number; df2: number; p: number };
  student: { t: number; df: number; p: number; diff: number; ci: [number, number] };
  welch: { t: number; df: number; p: number; diff: number; ci: [number, number] };
  cohensD: number;
  /** Levene p < .05 ise Welch önerilir */
  recommended: "student" | "welch";
}

export function independentT(x: number[], y: number[]): IndependentT {
  if (x.length < 2 || y.length < 2) throw new Error("Her grupta en az 2 gözlem gerekir");
  const dx = describe(x), dy = describe(y);
  const n1 = x.length, n2 = y.length;
  const v1 = variance(x), v2 = variance(y);
  const diff = dx.mean - dy.mean;
  const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
  const seS = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
  const dfS = n1 + n2 - 2;
  const tS = diff / seS;
  const seW = Math.sqrt(v1 / n1 + v2 / n2);
  const dfW = (v1 / n1 + v2 / n2) ** 2 / ((v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1));
  const tW = diff / seW;
  const lev = leveneTest([x, y]);
  const ci = (se: number, df: number): [number, number] => { const c = tCritical(df) * se; return [diff - c, diff + c]; };
  return {
    groups: [dx, dy],
    levene: lev,
    student: { t: tS, df: dfS, p: tTwoTailed(tS, dfS), diff, ci: ci(seS, dfS) },
    welch: { t: tW, df: dfW, p: tTwoTailed(tW, dfW), diff, ci: ci(seW, dfW) },
    cohensD: diff / Math.sqrt(sp2),
    recommended: lev.p < 0.05 ? "welch" : "student",
  };
}

/** Levene varyans homojenliği testi (ortalamaya göre, SPSS varsayılanı) */
export function leveneTest(groups: number[][]): { F: number; df1: number; df2: number; p: number } {
  const z = groups.map((g) => { const m = mean(g); return g.map((v) => Math.abs(v - m)); });
  const a = oneWayAnova(z);
  return { F: a.F, df1: a.dfBetween, df2: a.dfWithin, p: a.p };
}

export interface PairedT { before: Descriptive; after: Descriptive; diffMean: number; diffSd: number; t: number; df: number; p: number; ci: [number, number]; cohensDz: number; r: number }

export function pairedT(x: number[], y: number[]): PairedT {
  if (x.length !== y.length) throw new Error("Eşleştirilmiş ölçümlerin sayısı eşit olmalıdır");
  if (x.length < 2) throw new Error("En az 2 eşleştirilmiş gözlem gerekir");
  const d = x.map((v, i) => v - y[i]);
  const md = mean(d), sdd = sd(d), n = d.length;
  const se = sdd / Math.sqrt(n);
  const t = md / se;
  const c = tCritical(n - 1) * se;
  return { before: describe(x), after: describe(y), diffMean: md, diffSd: sdd, t, df: n - 1, p: tTwoTailed(t, n - 1), ci: [md - c, md + c], cohensDz: md / sdd, r: pearson(x, y).r };
}

export interface OneSampleT { desc: Descriptive; mu: number; t: number; df: number; p: number; ci: [number, number]; cohensD: number }
export function oneSampleT(x: number[], mu: number): OneSampleT {
  if (x.length < 2) throw new Error("En az 2 gözlem gerekir");
  const d = describe(x);
  const se = d.sd / Math.sqrt(d.n);
  const t = (d.mean - mu) / se;
  const c = tCritical(d.n - 1) * se;
  return { desc: d, mu, t, df: d.n - 1, p: tTwoTailed(t, d.n - 1), ci: [d.mean - mu - c, d.mean - mu + c], cohensD: (d.mean - mu) / d.sd };
}

// ---------------------------------------------------------------------------
// Tek yönlü varyans analizi
// ---------------------------------------------------------------------------

export interface Anova {
  groups: Descriptive[];
  ssBetween: number; ssWithin: number; dfBetween: number; dfWithin: number; msBetween: number; msWithin: number;
  F: number; p: number; etaSquared: number; omegaSquared: number;
}

export function oneWayAnova(groups: number[][]): Anova {
  const gs = groups.filter((g) => g.length);
  if (gs.length < 2) throw new Error("En az 2 grup gerekir");
  const all = gs.flat();
  const N = all.length, k = gs.length;
  if (N - k < 1) throw new Error("Gruplardaki gözlem sayısı yetersiz");
  const gm = mean(all);
  const ssB = gs.reduce((a, g) => a + g.length * (mean(g) - gm) ** 2, 0);
  const ssW = gs.reduce((a, g) => { const m = mean(g); return a + g.reduce((s, v) => s + (v - m) ** 2, 0); }, 0);
  const dfB = k - 1, dfW = N - k;
  const msB = ssB / dfB, msW = ssW / dfW;
  const F = msW === 0 ? (msB === 0 ? 0 : Infinity) : msB / msW;
  return {
    groups: gs.map((g) => describe(g)), ssBetween: ssB, ssWithin: ssW, dfBetween: dfB, dfWithin: dfW, msBetween: msB, msWithin: msW,
    F, p: fRightTail(F, dfB, dfW), etaSquared: ssB / (ssB + ssW), omegaSquared: Math.max(0, (ssB - dfB * msW) / (ssB + ssW + msW)),
  };
}

/** Bonferroni düzeltmeli ikili karşılaştırmalar (ANOVA'nın ortak hata kareler ortalamasıyla) */
export function bonferroniPosthoc(groups: number[][], labels: string[], a: Anova) {
  const out: { a: string; b: string; diff: number; p: number }[] = [];
  const m = (groups.length * (groups.length - 1)) / 2;
  for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
    const diff = mean(groups[i]) - mean(groups[j]);
    const se = Math.sqrt(a.msWithin * (1 / groups[i].length + 1 / groups[j].length));
    out.push({ a: labels[i], b: labels[j], diff, p: Math.min(1, tTwoTailed(diff / se, a.dfWithin) * m) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Korelasyon ve regresyon
// ---------------------------------------------------------------------------

export interface Correlation { r: number; n: number; t: number; df: number; p: number; ci: [number, number] }

export function pearson(x: number[], y: number[]): Correlation {
  const n = x.length;
  if (n < 3) throw new Error("En az 3 eşleşmiş gözlem gerekir");
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  if (!sxx || !syy) throw new Error("Değişkenlerden biri sabit; korelasyon hesaplanamaz");
  const r = Math.max(-1, Math.min(1, sxy / Math.sqrt(sxx * syy)));
  const df = n - 2;
  const t = Math.abs(r) === 1 ? Infinity * Math.sign(r) : r * Math.sqrt(df / (1 - r * r));
  // Fisher z güven aralığı
  const z = Math.atanh(Math.max(-0.999999, Math.min(0.999999, r))), se = 1 / Math.sqrt(Math.max(1, n - 3)), c = zCritical() * se;
  return { r, n, t, df, p: tTwoTailed(t, df), ci: [Math.tanh(z - c), Math.tanh(z + c)] };
}

/** Sıralar (eşit değerlere ortalama sıra) */
export function ranks(x: number[]): number[] {
  const idx = x.map((v, i) => [v, i] as const).sort((a, b) => a[0] - b[0]);
  const r = new Array<number>(x.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const avg = (i + j + 2) / 2;
    for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
    i = j + 1;
  }
  return r;
}

export function spearman(x: number[], y: number[]): Correlation {
  return pearson(ranks(x), ranks(y));
}

export interface Regression {
  n: number; k: number;
  coefficients: { name: string; b: number; se: number; beta: number | null; t: number; p: number; ci: [number, number] }[];
  r2: number; adjR2: number; F: number; dfModel: number; dfResidual: number; p: number; rmse: number;
  vif: Record<string, number>;
}

/** Çoklu doğrusal regresyon (en küçük kareler, Gauss-Jordan ile ters matris) */
export function linearRegression(y: number[], X: number[][], names: string[]): Regression {
  const n = y.length, k = names.length;
  if (n <= k + 1) throw new Error("Gözlem sayısı yordayıcı sayısından en az 2 fazla olmalıdır");
  const D = X.map((row) => [1, ...row]);
  const p = k + 1;
  const XtX = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => D.reduce((a, r) => a + r[i] * r[j], 0)));
  const Xty = Array.from({ length: p }, (_, i) => D.reduce((a, r, idx) => a + r[i] * y[idx], 0));
  const inv = invert(XtX);
  if (!inv) throw new Error("Yordayıcılar arasında tam çoklu doğrusal bağlantı var (bir değişken diğerlerinin birleşimi)");
  const b = inv.map((row) => row.reduce((a, v, j) => a + v * Xty[j], 0));
  const yhat = D.map((r) => r.reduce((a, v, j) => a + v * b[j], 0));
  const my = mean(y);
  const sse = y.reduce((a, v, i) => a + (v - yhat[i]) ** 2, 0);
  const sst = y.reduce((a, v) => a + (v - my) ** 2, 0);
  const dfR = n - p, dfM = k;
  const mse = sse / dfR;
  const r2 = sst ? 1 - sse / sst : 0;
  const F = dfM && mse ? ((sst - sse) / dfM) / mse : 0;
  const sy = sd(y);
  const crit = tCritical(dfR);
  const coefficients = b.map((bi, i) => {
    const se = Math.sqrt(mse * inv[i][i]);
    const t = bi / se;
    const sx = i === 0 ? null : sd(X.map((r) => r[i - 1]));
    return { name: i === 0 ? "(Sabit)" : names[i - 1], b: bi, se, beta: sx === null ? null : (bi * sx) / sy, t, p: tTwoTailed(t, dfR), ci: [bi - crit * se, bi + crit * se] as [number, number] };
  });
  const vif: Record<string, number> = {};
  if (k > 1) names.forEach((nm, j) => {
    try {
      const others = X.map((r) => r.filter((_, c) => c !== j));
      const sub = linearRegression(X.map((r) => r[j]), others, names.filter((_, c) => c !== j));
      vif[nm] = 1 / (1 - sub.r2);
    } catch { vif[nm] = Infinity; }
  });
  return { n, k, coefficients, r2, adjR2: 1 - (1 - r2) * (n - 1) / dfR, F, dfModel: dfM, dfResidual: dfR, p: fRightTail(F, dfM, dfR), rmse: Math.sqrt(mse), vif };
}

function invert(m: number[][]): number[][] | null {
  const n = m.length;
  const a = m.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[piv][c])) piv = r;
    if (Math.abs(a[piv][c]) < 1e-10 * Math.max(1, Math.abs(m[c][c]))) return null;
    [a[c], a[piv]] = [a[piv], a[c]];
    const d = a[c][c];
    for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = a[r][c]; if (f) for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j]; }
  }
  return a.map((row) => row.slice(n));
}

// ---------------------------------------------------------------------------
// Ki-kare, güvenirlik, parametrik olmayan testler
// ---------------------------------------------------------------------------

export interface ChiSquare { rows: string[]; cols: string[]; observed: number[][]; expected: number[][]; chi2: number; df: number; p: number; cramersV: number; n: number; lowExpectedShare: number }

export function chiSquareIndependence(a: string[], b: string[]): ChiSquare {
  const rows = [...new Set(a)].sort(), cols = [...new Set(b)].sort();
  if (rows.length < 2 || cols.length < 2) throw new Error("Her iki değişkenin de en az 2 kategorisi olmalıdır");
  const obs = rows.map(() => cols.map(() => 0));
  a.forEach((v, i) => { obs[rows.indexOf(v)][cols.indexOf(b[i])]++; });
  const n = a.length;
  const rt = obs.map((r) => r.reduce((x, y) => x + y, 0));
  const ct = cols.map((_, j) => obs.reduce((x, r) => x + r[j], 0));
  const exp = rows.map((_, i) => cols.map((_, j) => (rt[i] * ct[j]) / n));
  let chi2 = 0, low = 0;
  for (let i = 0; i < rows.length; i++) for (let j = 0; j < cols.length; j++) { chi2 += (obs[i][j] - exp[i][j]) ** 2 / exp[i][j]; if (exp[i][j] < 5) low++; }
  const df = (rows.length - 1) * (cols.length - 1);
  return { rows, cols, observed: obs, expected: exp, chi2, df, p: chi2RightTail(chi2, df), cramersV: Math.sqrt(chi2 / (n * (Math.min(rows.length, cols.length) - 1))), n, lowExpectedShare: low / (rows.length * cols.length) };
}

export interface Reliability { alpha: number; k: number; n: number; items: { name: string; mean: number; sd: number; itemTotal: number; alphaIfDeleted: number }[] }

/** Cronbach alfa, düzeltilmiş madde-toplam korelasyonu ve madde silindiğinde alfa */
export function cronbachAlpha(items: number[][], names: string[]): Reliability {
  // items: her satır bir katılımcı, her sütun bir madde (eksik veri önceden satır bazında çıkarılmış olmalı)
  const k = names.length, n = items.length;
  if (k < 2) throw new Error("En az 2 madde gerekir");
  if (n < 3) throw new Error("En az 3 katılımcı gerekir");
  const col = (j: number) => items.map((r) => r[j]);
  const alphaOf = (cols: number[]) => {
    const totals = items.map((r) => cols.reduce((a, j) => a + r[j], 0));
    const vt = variance(totals);
    const sv = cols.reduce((a, j) => a + variance(col(j)), 0);
    return vt ? (cols.length / (cols.length - 1)) * (1 - sv / vt) : NaN;
  };
  const all = names.map((_, j) => j);
  return {
    alpha: alphaOf(all), k, n,
    items: names.map((name, j) => {
      const rest = items.map((r) => all.filter((c) => c !== j).reduce((a, c) => a + r[c], 0));
      let itemTotal = NaN;
      try { itemTotal = pearson(col(j), rest).r; } catch { /* sabit madde */ }
      return { name, mean: mean(col(j)), sd: sd(col(j)), itemTotal, alphaIfDeleted: k > 2 ? alphaOf(all.filter((c) => c !== j)) : NaN };
    }),
  };
}

export interface MannWhitney { n1: number; n2: number; meanRank1: number; meanRank2: number; median1: number; median2: number; U: number; z: number; p: number; r: number }

/** Mann-Whitney U (eşitlik düzeltmeli normal yaklaşım; SPSS "Asymp. Sig.") */
export function mannWhitney(x: number[], y: number[]): MannWhitney {
  const n1 = x.length, n2 = y.length, N = n1 + n2;
  if (n1 < 2 || n2 < 2) throw new Error("Her grupta en az 2 gözlem gerekir");
  const r = ranks([...x, ...y]);
  const R1 = r.slice(0, n1).reduce((a, b) => a + b, 0);
  const U1 = R1 - (n1 * (n1 + 1)) / 2;
  const U = Math.min(U1, n1 * n2 - U1);
  const counts = new Map<number, number>();
  for (const v of [...x, ...y]) counts.set(v, (counts.get(v) ?? 0) + 1);
  const tie = [...counts.values()].reduce((a, t) => a + (t ** 3 - t), 0);
  const sigma = Math.sqrt(((n1 * n2) / 12) * ((N + 1) - tie / (N * (N - 1))));
  const z = sigma ? (U1 - (n1 * n2) / 2) / sigma : 0;
  const med = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = s.length; return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2; };
  return { n1, n2, meanRank1: R1 / n1, meanRank2: (r.slice(n1).reduce((a, b) => a + b, 0)) / n2, median1: med(x), median2: med(y), U, z, p: normalTwoTailed(z), r: Math.abs(z) / Math.sqrt(N) };
}

export interface KruskalWallis { H: number; df: number; p: number; meanRanks: number[]; ns: number[]; epsilonSquared: number }

export function kruskalWallis(groups: number[][]): KruskalWallis {
  const gs = groups.filter((g) => g.length);
  if (gs.length < 2) throw new Error("En az 2 grup gerekir");
  const all = gs.flat(), N = all.length;
  const r = ranks(all);
  let off = 0, sum = 0;
  const meanRanks: number[] = [];
  for (const g of gs) { const R = r.slice(off, off + g.length).reduce((a, b) => a + b, 0); off += g.length; sum += (R * R) / g.length; meanRanks.push(R / g.length); }
  let H = (12 / (N * (N + 1))) * sum - 3 * (N + 1);
  const counts = new Map<number, number>();
  for (const v of all) counts.set(v, (counts.get(v) ?? 0) + 1);
  const tie = 1 - [...counts.values()].reduce((a, t) => a + (t ** 3 - t), 0) / (N ** 3 - N);
  if (tie > 0) H /= tie;
  const df = gs.length - 1;
  return { H, df, p: chi2RightTail(H, df), meanRanks, ns: gs.map((g) => g.length), epsilonSquared: H / (N - 1) };
}

// ---------------------------------------------------------------------------
// D222: normallik, küçük örneklem 2×2 tabloları, çoklu karşılaştırma, etki büyüklüğü güven aralıkları,
// regresyon varsayımları. Algoritmalar R’ninkilerle aynıdır (shapiro.test, fisher.test, TukeyHSD,
// rstatix::games_howell_test, p.adjust, effectsize, lmtest::bptest) ve testlerde R çıktısıyla karşılaştırılır.
// ---------------------------------------------------------------------------

/** Shapiro–Wilk normallik testi (Royston 1995, AS R94; R shapiro.test ile aynı). 3 ≤ n ≤ 5000 */
export function shapiroWilk(data: number[]): { W: number; p: number; n: number } {
  const x = data.filter(Number.isFinite).slice().sort((a, b) => a - b);
  const n = x.length;
  if (n < 3) throw new Error("Shapiro–Wilk testi için en az 3 gözlem gerekir");
  if (n > 5000) throw new Error("Shapiro–Wilk testi en fazla 5000 gözlemle çalışır");
  const range = x[n - 1] - x[0];
  if (range < 1e-19) throw new Error("Tüm değerler aynı; normallik sınanamaz");
  const poly = (cc: number[], xv: number) => { let r = cc[0]; if (cc.length > 1) { let p = xv * cc[cc.length - 1]; for (let j = cc.length - 2; j > 0; j--) p = (p + cc[j]) * xv; r += p; } return r; };
  const g = [-2.273, 0.459];
  const c1 = [0, 0.221157, -0.147981, -2.07119, 4.434685, -2.706056];
  const c2 = [0, 0.042981, -0.293762, -1.752461, 5.682633, -3.582633];
  const c3 = [0.544, -0.39978, 0.025054, -6.714e-4];
  const c4 = [1.3822, -0.77857, 0.062767, -0.0020322];
  const c5 = [-1.5861, -0.31082, -0.083751, 0.0038915];
  const c6 = [-0.4803, -0.082676, 0.0030302];
  const nn2 = Math.floor(n / 2);
  const a = new Array<number>(nn2 + 1).fill(0); // 1 tabanlı
  const an = n;
  if (n === 3) a[1] = Math.SQRT1_2;
  else {
    const an25 = an + 0.25;
    let summ2 = 0;
    for (let i = 1; i <= nn2; i++) { a[i] = qnorm((i - 0.375) / an25); summ2 += a[i] * a[i]; }
    summ2 *= 2;
    const ssumm2 = Math.sqrt(summ2), rsn = 1 / Math.sqrt(an);
    const a1 = poly(c1, rsn) - a[1] / ssumm2;
    let i1: number, fac: number;
    if (n > 5) {
      i1 = 3;
      const a2 = -a[2] / ssumm2 + poly(c2, rsn);
      fac = Math.sqrt((summ2 - 2 * a[1] * a[1] - 2 * a[2] * a[2]) / (1 - 2 * a1 * a1 - 2 * a2 * a2));
      a[2] = a2;
    } else {
      i1 = 2;
      fac = Math.sqrt((summ2 - 2 * a[1] * a[1]) / (1 - 2 * a1 * a1));
    }
    a[1] = a1;
    for (let i = i1; i <= nn2; i++) a[i] /= -fac;
  }
  const sign = (v: number) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  let xx = x[0] / range, sx = xx, sa = -a[1];
  for (let i = 1, j = n - 1; i < n; j--) {
    const xi = x[i] / range;
    sx += xi;
    i++;
    if (i !== j) sa += sign(i - j) * a[Math.min(i, j)];
    xx = xi;
  }
  sa /= n; sx /= n;
  let ssa = 0, ssx = 0, sax = 0;
  for (let i = 0, j = n - 1; i < n; i++, j--) {
    const asa = i !== j ? sign(i - j) * a[1 + Math.min(i, j)] - sa : -sa;
    const xsx = x[i] / range - sx;
    ssa += asa * asa; ssx += xsx * xsx; sax += asa * xsx;
  }
  const ssassx = Math.sqrt(ssa * ssx);
  const w1 = ((ssassx - sax) * (ssassx + sax)) / (ssa * ssx);
  const W = 1 - w1;
  if (n === 3) {
    const p = 1.90985931710274 * (Math.asin(Math.sqrt(W)) - 1.0471975511966);
    return { W, p: Math.max(0, p), n };
  }
  let y = Math.log(w1);
  const lxx = Math.log(an);
  let m: number, s: number;
  if (n <= 11) {
    const gamma = poly(g, an);
    if (y >= gamma) return { W, p: 1e-99, n };
    y = -Math.log(gamma - y);
    m = poly(c3, an);
    s = Math.exp(poly(c4, an));
  } else {
    m = poly(c5, lxx);
    s = Math.exp(poly(c6, lxx));
  }
  return { W, p: normalUpper((y - m) / s), n };
}

/** 2×2 tablo için Fisher’in kesin testi (iki yönlü; R fisher.test ile aynı ölçüt) ve Yates düzeltmeli ki-kare */
export function fisherExact2x2(t: number[][]): { p: number; oddsRatio: number } {
  const [[a, b], [c, d]] = t;
  const r1 = a + b, r2 = c + d, c1 = a + c, n = r1 + r2;
  const lf = (k: number) => logGamma(k + 1);
  const logP = (x: number) => lf(r1) + lf(r2) + lf(c1) + lf(n - c1) - lf(n) - lf(x) - lf(r1 - x) - lf(c1 - x) - lf(r2 - c1 + x);
  const lo = Math.max(0, c1 - r2), hi = Math.min(r1, c1);
  const obs = logP(a);
  let p = 0;
  for (let x = lo; x <= hi; x++) { const lp = logP(x); if (lp <= obs + Math.log1p(1e-7)) p += Math.exp(lp); }
  return { p: Math.min(1, p), oddsRatio: b * c === 0 ? Infinity : (a * d) / (b * c) };
}
export function yatesChi2(t: number[][]): { chi2: number; df: number; p: number } {
  const [[a, b], [c, d]] = t;
  const n = a + b + c + d;
  const rows = [a + b, c + d], cols = [a + c, b + d];
  let chi2 = 0;
  [[a, b], [c, d]].forEach((row, i) => row.forEach((o, j) => { const e = (rows[i] * cols[j]) / n; const dev = Math.min(0.5, Math.abs(o - e)); chi2 += (Math.abs(o - e) - dev) ** 2 / e; }));
  return { chi2, df: 1, p: chi2RightTail(chi2, 1) };
}

/** Çoklu karşılaştırma düzeltmeleri (R p.adjust ile aynı): Bonferroni, Holm, Benjamini–Hochberg (FDR) */
export function pAdjust(ps: number[], method: "bonferroni" | "holm" | "BH"): number[] {
  const m = ps.length;
  if (method === "bonferroni") return ps.map((p) => Math.min(1, p * m));
  const idx = ps.map((p, i) => [p, i] as const);
  const out = new Array<number>(m);
  if (method === "holm") {
    idx.sort((x, y) => x[0] - y[0]);
    let run = 0;
    idx.forEach(([p, i], k) => { run = Math.max(run, Math.min(1, (m - k) * p)); out[i] = run; });
    return out;
  }
  idx.sort((x, y) => y[0] - x[0]);
  let run = 1;
  idx.forEach(([p, i], k) => { run = Math.min(run, (m / (m - k)) * p); out[i] = Math.min(1, run); });
  return out;
}

export interface PairwiseRow { a: string; b: string; diff: number; lwr: number; upr: number; p: number; df?: number }
/** Tukey HSD (eşit varyans; Tukey–Kramer dengesiz gruplarda; R TukeyHSD ile aynı) */
export function tukeyHSD(groups: number[][], labels: string[], a: Anova): PairwiseRow[] {
  const k = groups.length, out: PairwiseRow[] = [];
  const qcrit = solveMonotone((q) => ptukey(q, k, a.dfWithin), 0.95, 0, 100);
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const diff = mean(groups[j]) - mean(groups[i]);
    const se = Math.sqrt((a.msWithin / 2) * (1 / groups[i].length + 1 / groups[j].length));
    const q = Math.abs(diff) / se;
    out.push({ a: labels[j], b: labels[i], diff, lwr: diff - qcrit * se, upr: diff + qcrit * se, p: Math.max(0, 1 - ptukey(q, k, a.dfWithin)) });
  }
  return out;
}
/** Games–Howell (varyanslar eşit değilken; rstatix::games_howell_test ile aynı) */
export function gamesHowell(groups: number[][], labels: string[]): PairwiseRow[] {
  const k = groups.length, out: PairwiseRow[] = [];
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const ni = groups[i].length, nj = groups[j].length, vi = variance(groups[i]) / ni, vj = variance(groups[j]) / nj;
    const diff = mean(groups[j]) - mean(groups[i]);
    const df = (vi + vj) ** 2 / (vi ** 2 / (ni - 1) + vj ** 2 / (nj - 1));
    const se = Math.sqrt((vi + vj) / 2);
    const q = Math.abs(diff) / se;
    const qcrit = solveMonotone((x) => ptukey(x, k, df), 0.95, 0, 100);
    out.push({ a: labels[j], b: labels[i], diff, lwr: diff - qcrit * se, upr: diff + qcrit * se, p: Math.max(0, 1 - ptukey(q, k, df)), df });
  }
  return out;
}

/** Merkezi olmayan t ile etki büyüklüğü güven aralığı: d = ncp × ölçek (effectsize::cohens_d ile aynı yöntem) */
export function dCI(t: number, df: number, scale: number, level = 0.95): [number, number] {
  const alpha = (1 - level) / 2;
  const span = Math.max(10, Math.abs(t) * 3 + 10);
  const lo = solveMonotone((ncp) => pnt(t, df, ncp), 1 - alpha, t - span, t + span);
  const hi = solveMonotone((ncp) => pnt(t, df, ncp), alpha, t - span, t + span);
  return [lo * scale, hi * scale];
}
/** η² için merkezi olmayan F güven aralığı (effectsize::eta_squared, iki yönlü) */
export function eta2CI(F: number, df1: number, df2: number, level = 0.95): [number, number] {
  const alpha = (1 - level) / 2;
  // effectsize: λ sınırları F = λ/df1 olarak η²’ye çevrilir → η² = λ / (λ + df2)
  const toEta = (ncp: number) => ncp / (ncp + df2);
  const maxN = Math.max(100, F * df1 * 10 + 100);
  const at = (ncp: number) => pnf(F, df1, df2, ncp);
  const lo = at(0) < 1 - alpha ? 0 : solveMonotone(at, 1 - alpha, 0, maxN);
  const hi = at(0) < alpha ? 0 : solveMonotone(at, alpha, 0, maxN);
  return [toEta(lo), toEta(hi)];
}

/** Regresyon varsayımları: artıkların normalliği (Shapiro–Wilk), eş varyans (Breusch–Pagan, Koenker), Durbin–Watson */
export function regressionDiagnostics(y: number[], X: number[][], reg: Regression): { residuals: number[]; shapiro: { W: number; p: number } | null; breuschPagan: { stat: number; df: number; p: number }; durbinWatson: number } {
  const res = y.map((v, i) => v - reg.coefficients.reduce((a, c, j) => a + c.b * (j === 0 ? 1 : X[i][j - 1]), 0));
  const n = res.length;
  let shapiro: { W: number; p: number } | null = null;
  try { const s = shapiroWilk(res); shapiro = { W: s.W, p: s.p }; } catch { shapiro = null; }
  // Koenker’in stüdentleştirilmiş BP testi: e² ~ X yardımcı regresyonunun n·R²’si (lmtest::bptest varsayılanı)
  const e2 = res.map((e) => e * e);
  const aux = linearRegression(e2, X, X[0].map((_, j) => `x${j}`));
  const stat = n * aux.r2, df = X[0].length;
  let num = 0, den = res[0] ** 2;
  for (let i = 1; i < n; i++) { num += (res[i] - res[i - 1]) ** 2; den += res[i] ** 2; }
  return { residuals: res, shapiro, breuschPagan: { stat, df, p: chi2RightTail(stat, df) }, durbinWatson: num / den };
}
