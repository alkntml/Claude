/**
 * D224: ek analizler — Wilcoxon işaretli sıralar, Friedman, Dunn, iki yönlü ANOVA (Tip III), tekrarlı ölçümlerde tek
 * yönlü ANOVA (Mauchly, Greenhouse–Geisser, Huynh–Feldt), lojistik regresyon. Algoritmalar R’deki karşılıklarıyla aynıdır
 * (wilcox.test, friedman.test, rstatix::dunn_test, car::Anova(type = 3), rstatix::anova_test, glm) ve testlerde R çıktısıyla
 * karşılaştırılır. Yapay zekâ hiçbir değeri üretmez.
 */
import { chi2RightTail, fRightTail, normalCdf, normalTwoTailed } from "./dist";
import { invert, leveneTest, mean, pAdjust, pairedT, ranks, sd } from "./tests";

const tieSum = (vals: number[]) => { const m = new Map<number, number>(); for (const v of vals) m.set(v, (m.get(v) ?? 0) + 1); return [...m.values()].reduce((a, t) => a + (t ** 3 - t), 0); };
const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b); const m = s.length; return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2; };

// ---------------------------------------------------------------------------
// Wilcoxon işaretli sıralar (eşleştirilmiş, parametrik olmayan)
// ---------------------------------------------------------------------------
export interface Wilcoxon { n: number; nPairs: number; zeros: number; V: number; z: number; p: number; exact: boolean; r: number; median1: number; median2: number; medianDiff: number }

/** psignrank: P(V ≤ q), n çift için (dinamik programlama) */
function signRankCdf(q: number, n: number): number {
  const max = (n * (n + 1)) / 2;
  const cnt = new Array<number>(max + 1).fill(0); cnt[0] = 1;
  for (let k = 1; k <= n; k++) for (let s = max; s >= k; s--) cnt[s] += cnt[s - k];
  let sum = 0; for (let s = 0; s <= Math.min(q, max); s++) sum += cnt[s];
  return sum / 2 ** n;
}

/** R wilcox.test(x, y, paired = TRUE) ile aynı: n < 50 ve bağ/sıfır yoksa kesin p; aksi hâlde süreklilik düzeltmeli normal yaklaşım */
export function wilcoxonSignedRank(x: number[], y: number[]): Wilcoxon {
  if (x.length !== y.length) throw new Error("Eşleştirilmiş ölçümlerin sayısı eşit olmalıdır");
  const d = x.map((v, i) => v - y[i]);
  const nz = d.filter((v) => v !== 0);
  const n = nz.length;
  if (n < 1) throw new Error("Bütün farklar sıfır; test yapılamaz");
  const abs = nz.map(Math.abs), rk = ranks(abs);
  const V = nz.reduce((a, v, i) => a + (v > 0 ? rk[i] : 0), 0);
  const ties = tieSum(abs), zeros = d.length - n;
  const exact = n < 50 && ties === 0 && zeros === 0;
  const mu = (n * (n + 1)) / 4;
  const sigma = Math.sqrt((n * (n + 1) * (2 * n + 1)) / 24 - ties / 48);
  const z0 = sigma ? (V - mu) / sigma : 0;
  let p: number, z: number;
  if (exact) {
    const q = V > mu ? 1 - signRankCdf(V - 1, n) : signRankCdf(V, n);
    p = Math.min(2 * q, 1); z = z0;
  } else {
    const corr = Math.sign(V - mu) * 0.5;
    z = sigma ? (V - mu - corr) / sigma : 0;
    p = 2 * Math.min(normalCdf(z), 1 - normalCdf(z));
  }
  return { n: d.length, nPairs: n, zeros, V, z, p, exact, r: Math.abs(z0) / Math.sqrt(n), median1: median(x), median2: median(y), medianDiff: median(d) };
}

// ---------------------------------------------------------------------------
// Friedman (tekrarlı ölçümler, parametrik olmayan) ve Kendall W
// ---------------------------------------------------------------------------
export interface Friedman { n: number; k: number; chi2: number; df: number; p: number; kendallW: number; meanRanks: number[]; medians: number[] }
/** rows: denek × koşul. R friedman.test (bağ düzeltmeli) */
export function friedmanTest(rows: number[][]): Friedman {
  const n = rows.length, k = rows[0]?.length ?? 0;
  if (n < 2 || k < 3) throw new Error("Friedman testi için en az 2 denek ve 3 ölçüm gerekir");
  const rk = rows.map((r) => ranks(r));
  const colSum = Array.from({ length: k }, (_, j) => rk.reduce((a, r) => a + r[j], 0));
  const ties = rows.reduce((a, r) => a + tieSum(r), 0);
  const num = 12 * colSum.reduce((a, s) => a + (s - (n * (k + 1)) / 2) ** 2, 0);
  const chi2 = num / (n * k * (k + 1) - ties / (k - 1));
  return { n, k, chi2, df: k - 1, p: chi2RightTail(chi2, k - 1), kendallW: chi2 / (n * (k - 1)), meanRanks: colSum.map((s) => s / n), medians: Array.from({ length: k }, (_, j) => median(rows.map((r) => r[j]))) };
}

// ---------------------------------------------------------------------------
// Dunn çoklu karşılaştırması (Kruskal–Wallis sonrası; bağ düzeltmeli, Holm ile; rstatix::dunn_test)
// ---------------------------------------------------------------------------
export interface DunnRow { a: string; b: string; diff: number; z: number; p: number; pAdj: number }
export function dunnTest(groups: number[][], labels: string[], adjust: "holm" | "bonferroni" | "BH" = "holm"): DunnRow[] {
  const all = groups.flat(), N = all.length, r = ranks(all);
  const mr: number[] = []; let off = 0;
  for (const g of groups) { mr.push(r.slice(off, off + g.length).reduce((a, b) => a + b, 0) / g.length); off += g.length; }
  const v = (N * (N + 1)) / 12 - tieSum(all) / (12 * (N - 1));
  const rows: Omit<DunnRow, "pAdj">[] = [];
  for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) {
    const diff = mr[j] - mr[i];
    const z = diff / Math.sqrt(v * (1 / groups[i].length + 1 / groups[j].length));
    rows.push({ a: labels[i], b: labels[j], diff, z, p: normalTwoTailed(z) });
  }
  const adj = pAdjust(rows.map((x) => x.p), adjust);
  return rows.map((x, i) => ({ ...x, pAdj: adj[i] }));
}

// ---------------------------------------------------------------------------
// Ortak: en küçük kareler ile artık kareler toplamı
// ---------------------------------------------------------------------------
function olsSSE(y: number[], X: number[][]): { sse: number; rank: boolean } {
  const p = X[0]?.length ?? 0;
  const XtX = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => X.reduce((a, r) => a + r[i] * r[j], 0)));
  const Xty = Array.from({ length: p }, (_, i) => X.reduce((a, r, k) => a + r[i] * y[k], 0));
  const inv = invert(XtX);
  if (!inv) return { sse: NaN, rank: false };
  const b = inv.map((row) => row.reduce((a, v, j) => a + v * Xty[j], 0));
  const sse = y.reduce((a, v, i) => a + (v - X[i].reduce((s, x, j) => s + x * b[j], 0)) ** 2, 0);
  return { sse, rank: true };
}

// ---------------------------------------------------------------------------
// İki yönlü ANOVA (denekler arası, etkileşimli, Tip III kareler toplamı; SPSS ve car::Anova(type = 3) ile aynı)
// ---------------------------------------------------------------------------
export interface TwoWayTerm { name: string; ss: number; df: number; ms: number; F: number; p: number; partialEta2: number }
export interface TwoWayAnova {
  n: number; levelsA: string[]; levelsB: string[];
  cells: { a: string; b: string; n: number; mean: number; sd: number }[];
  terms: TwoWayTerm[]; error: { ss: number; df: number; ms: number }; total: { ss: number; df: number };
  levene: { F: number; df1: number; df2: number; p: number }; balanced: boolean;
}
export function twoWayAnova(y: number[], fa: string[], fb: string[], nameA = "A", nameB = "B"): TwoWayAnova {
  const n = y.length;
  const la = [...new Set(fa)].sort((a, b) => a.localeCompare(b, "tr")), lb = [...new Set(fb)].sort((a, b) => a.localeCompare(b, "tr"));
  if (la.length < 2 || lb.length < 2) throw new Error("Her iki faktörün de en az 2 düzeyi olmalıdır");
  if (la.length > 8 || lb.length > 8) throw new Error("Faktör düzeyi sayısı en fazla 8 olabilir");
  const cellVals = new Map<string, number[]>();
  y.forEach((v, i) => { const k = `${fa[i]}\u0000${fb[i]}`; cellVals.set(k, [...(cellVals.get(k) ?? []), v]); });
  if (la.some((a) => lb.some((b) => !(cellVals.get(`${a}\u0000${b}`)?.length)))) throw new Error("Bazı hücrelerde (faktör düzeyi birleşimlerinde) hiç gözlem yok; iki yönlü ANOVA için her hücrede veri gerekir");
  const code = (lv: string[], v: string) => { const i = lv.indexOf(v); return i === lv.length - 1 ? lv.slice(0, -1).map(() => -1) : lv.slice(0, -1).map((_, j) => (j === i ? 1 : 0)); };
  const A = fa.map((v) => code(la, v)), B = fb.map((v) => code(lb, v));
  const AB = A.map((a, i) => a.flatMap((x) => B[i].map((z) => x * z)));
  const cols = { int: y.map(() => [1]), A, B, AB };
  const build = (omit?: "A" | "B" | "AB") => y.map((_, i) => [...cols.int[i], ...(omit === "A" ? [] : A[i]), ...(omit === "B" ? [] : B[i]), ...(omit === "AB" ? [] : AB[i])]);
  const full = olsSSE(y, build());
  if (!full.rank) throw new Error("Model kurulamadı (hücrelerde yetersiz değişim)");
  const dfErr = n - la.length * lb.length;
  if (dfErr < 1) throw new Error("Hücre başına gözlem yetersiz: en az bir hücrede birden fazla gözlem olmalı");
  const mse = full.sse / dfErr;
  const term = (name: string, omit: "A" | "B" | "AB", df: number): TwoWayTerm => {
    const ss = olsSSE(y, build(omit)).sse - full.sse;
    const F = ss / df / mse;
    return { name, ss, df, ms: ss / df, F, p: fRightTail(F, df, dfErr), partialEta2: ss / (ss + full.sse) };
  };
  const terms = [term(nameA, "A", la.length - 1), term(nameB, "B", lb.length - 1), term(`${nameA} × ${nameB}`, "AB", (la.length - 1) * (lb.length - 1))];
  const gm = mean(y), sst = y.reduce((a, v) => a + (v - gm) ** 2, 0);
  const cells = la.flatMap((a) => lb.map((b) => { const v = cellVals.get(`${a}\u0000${b}`)!; return { a, b, n: v.length, mean: mean(v), sd: v.length > 1 ? sd(v) : NaN }; }));
  const sizes = new Set(cells.map((c) => c.n));
  return { n, levelsA: la, levelsB: lb, cells, terms, error: { ss: full.sse, df: dfErr, ms: mse }, total: { ss: sst, df: n - 1 }, levene: leveneTest([...cellVals.values()].filter((v) => v.length)), balanced: sizes.size === 1 };
}

// ---------------------------------------------------------------------------
// Tekrarlı ölçümlerde tek yönlü ANOVA (denek içi), küreselik ve düzeltmeler
// ---------------------------------------------------------------------------
export interface RepeatedAnova {
  n: number; k: number; means: number[]; sds: number[];
  ssCond: number; ssSubj: number; ssErr: number; dfCond: number; dfErr: number; F: number; p: number; partialEta2: number;
  mauchly: { W: number; chi2: number; df: number; p: number } | null; epsGG: number; epsHF: number;
  pGG: number; pHF: number; pairwise: { a: number; b: number; diff: number; t: number; df: number; p: number; pHolm: number }[];
}
function det(m: number[][]): number {
  const n = m.length; const a = m.map((r) => [...r]); let d = 1;
  for (let c = 0; c < n; c++) {
    let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[piv][c])) piv = r;
    if (Math.abs(a[piv][c]) < 1e-14) return 0;
    if (piv !== c) { [a[c], a[piv]] = [a[piv], a[c]]; d = -d; }
    d *= a[c][c];
    for (let r = c + 1; r < n; r++) { const f = a[r][c] / a[c][c]; for (let j = c; j < n; j++) a[r][j] -= f * a[c][j]; }
  }
  return d;
}
export function repeatedAnova(rows: number[][]): RepeatedAnova {
  const n = rows.length, k = rows[0]?.length ?? 0;
  if (n < 3 || k < 2) throw new Error("Tekrarlı ölçümler ANOVA’sı için en az 3 denek ve 2 ölçüm gerekir");
  const cm = Array.from({ length: k }, (_, j) => mean(rows.map((r) => r[j])));
  const sm = rows.map((r) => mean(r)), gm = mean(rows.flat());
  const ssCond = n * cm.reduce((a, m) => a + (m - gm) ** 2, 0);
  const ssSubj = k * sm.reduce((a, m) => a + (m - gm) ** 2, 0);
  const ssTot = rows.flat().reduce((a, v) => a + (v - gm) ** 2, 0);
  const ssErr = ssTot - ssCond - ssSubj;
  const dfC = k - 1, dfE = (n - 1) * (k - 1);
  const F = ssCond / dfC / (ssErr / dfE);
  const p = fRightTail(F, dfC, dfE);
  // Kovaryans matrisi ve çift merkezleme (Greenhouse–Geisser / Huynh–Feldt)
  const S = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => rows.reduce((a, r) => a + (r[i] - cm[i]) * (r[j] - cm[j]), 0) / (n - 1)));
  const rm = S.map((r) => mean(r)), tm = mean(rm);
  const Sd = S.map((r, i) => r.map((v, j) => v - rm[i] - rm[j] + tm));
  let epsGG = 1, epsHF = 1, mauchly: RepeatedAnova["mauchly"] = null, pGG = p, pHF = p;
  if (k > 2) {
    const tr = Sd.reduce((a, r, i) => a + r[i], 0), tr2 = Sd.reduce((a, r) => a + r.reduce((s, v) => s + v * v, 0), 0);
    epsGG = tr ** 2 / ((k - 1) * tr2);
    epsHF = Math.min(1, (n * (k - 1) * epsGG - 2) / ((k - 1) * (n - 1 - (k - 1) * epsGG)));
    pGG = fRightTail(F, dfC * epsGG, dfE * epsGG); pHF = fRightTail(F, dfC * epsHF, dfE * epsHF);
    // Mauchly: Helmert (ortonormal) karşıtlıklarla; R mauchly.test düzeltmeli ki-kare
    const pp = k - 1;
    const C: number[][] = Array.from({ length: pp }, (_, i) => Array.from({ length: k }, (_, j) => (j <= i ? 1 : j === i + 1 ? -(i + 1) : 0)));
    C.forEach((row, i) => { const nrm = Math.sqrt(row.reduce((a, v) => a + v * v, 0)); C[i] = row.map((v) => v / nrm); });
    const T = Array.from({ length: pp }, (_, i) => Array.from({ length: pp }, (_, j) => { let s = 0; for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) s += C[i][a] * S[a][b] * C[j][b]; return s; }));
    const d = det(T), trace = T.reduce((a, r, i) => a + r[i], 0);
    if (d > 0) {
      const logW = Math.log(d) - pp * Math.log(trace / pp), nn = n - 1;
      const rho = 1 - (2 * pp * pp + pp + 2) / (6 * pp * nn);
      const z = -nn * rho * logW, f = (pp * (pp + 1)) / 2 - 1;
      const w2 = ((pp + 2) * (pp - 1) * (pp - 2) * (2 * pp ** 3 + 6 * pp * pp + 3 * pp + 2)) / (288 * (nn * pp * rho) ** 2);
      const pr1 = chi2RightTail(z, f), pr2 = chi2RightTail(z, f + 4);
      mauchly = { W: Math.exp(logW), chi2: z, df: f, p: pr1 + w2 * (pr2 - pr1) };
    }
  }
  const pairs: RepeatedAnova["pairwise"] = [];
  for (let a = 0; a < k; a++) for (let b = a + 1; b < k; b++) {
    const t = pairedT(rows.map((r) => r[a]), rows.map((r) => r[b]));
    pairs.push({ a, b, diff: t.diffMean, t: t.t, df: t.df, p: t.p, pHolm: 0 });
  }
  const adj = pAdjust(pairs.map((x) => x.p), "holm"); pairs.forEach((x, i) => (x.pHolm = adj[i]));
  return { n, k, means: cm, sds: Array.from({ length: k }, (_, j) => sd(rows.map((r) => r[j]))), ssCond, ssSubj, ssErr, dfCond: dfC, dfErr: dfE, F, p, partialEta2: ssCond / (ssCond + ssErr), mauchly, epsGG, epsHF, pGG, pHF, pairwise: pairs };
}

// ---------------------------------------------------------------------------
// İkili lojistik regresyon (Newton–Raphson / IRLS; R glm(family = binomial) ile aynı)
// ---------------------------------------------------------------------------
export interface Logistic {
  n: number; k: number; events: number;
  coefficients: { name: string; b: number; se: number; z: number; p: number; or: number; orCi: [number, number] }[];
  nullDeviance: number; deviance: number; chi2: number; df: number; p: number;
  mcFadden: number; coxSnell: number; nagelkerke: number; accuracy: number; sensitivity: number; specificity: number; auc: number; iterations: number;
}
export function logisticRegression(y: number[], X: number[][], names: string[]): Logistic {
  const n = y.length, k = names.length;
  if (y.some((v) => v !== 0 && v !== 1)) throw new Error("Bağımlı değişken yalnızca 0 ve 1 değerlerini almalıdır");
  const ev = y.reduce((a, v) => a + v, 0);
  if (ev === 0 || ev === n) throw new Error("Bağımlı değişkenin her iki kategorisinde de gözlem olmalıdır");
  if (n <= k + 1) throw new Error("Gözlem sayısı yordayıcı sayısından en az 2 fazla olmalıdır");
  const D = X.map((r) => [1, ...r]), p = k + 1;
  let b = new Array<number>(p).fill(0), iter = 0, dev = Infinity, info: number[][] = [];
  const probs = (bb: number[]) => D.map((r) => { const eta = r.reduce((a, v, j) => a + v * bb[j], 0); return 1 / (1 + Math.exp(-eta)); });
  const deviance = (mu: number[]) => -2 * y.reduce((a, v, i) => a + (v ? Math.log(Math.max(mu[i], 1e-300)) : Math.log(Math.max(1 - mu[i], 1e-300))), 0);
  for (iter = 1; iter <= 50; iter++) {
    const mu = probs(b), w = mu.map((m) => m * (1 - m));
    info = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => D.reduce((a, r, t) => a + r[i] * r[j] * w[t], 0)));
    const grad = Array.from({ length: p }, (_, i) => D.reduce((a, r, t) => a + r[i] * (y[t] - mu[t]), 0));
    const inv = invert(info);
    if (!inv) throw new Error("Yordayıcılar arasında tam çoklu doğrusal bağlantı var ya da tam ayrışma var; model kurulamadı");
    const step = inv.map((row) => row.reduce((a, v, j) => a + v * grad[j], 0));
    // Adım yarılama: sapma artarsa (büyük ölçekli yordayıcılarda Newton adımı aşabilir) adım küçültülür
    let t = 1, nb = b.map((v, j) => v + step[j]), nd = deviance(probs(nb));
    for (let h = 0; h < 30 && (!Number.isFinite(nd) || (Number.isFinite(dev) && nd > dev + 1e-9)); h++) { t /= 2; nb = b.map((v, j) => v + t * step[j]); nd = deviance(probs(nb)); }
    if (!Number.isFinite(nd) || nb.some((v) => !Number.isFinite(v))) throw new Error("Model yakınsamıyor; yordayıcıları gözden geçirin");
    b = nb;
    const done = Math.abs(dev - nd) < 1e-11 * (Math.abs(nd) + 0.1);
    dev = nd;
    if (done) break;
  }
  if (b.some((v) => Math.abs(v) > 25)) throw new Error("Tam ayrışma: bir yordayıcı sonucu kusursuz ayırıyor; tahminler sonsuza gidiyor. Yordayıcıları gözden geçirin");
  const mu = probs(b), w = mu.map((m) => m * (1 - m));
  info = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => D.reduce((a, r, t) => a + r[i] * r[j] * w[t], 0)));
  const cov = invert(info);
  if (!cov) throw new Error("Model kurulamadı");
  const z975 = 1.959963984540054;
  const coefficients = b.map((bi, i) => { const se = Math.sqrt(cov[i][i]), z = bi / se; return { name: i === 0 ? "(Sabit)" : names[i - 1], b: bi, se, z, p: normalTwoTailed(z), or: Math.exp(bi), orCi: [Math.exp(bi - z975 * se), Math.exp(bi + z975 * se)] as [number, number] }; });
  const p0 = ev / n, nullDev = -2 * (ev * Math.log(p0) + (n - ev) * Math.log(1 - p0));
  const chi2 = nullDev - dev;
  const coxSnell = 1 - Math.exp((dev - nullDev) / n), maxCs = 1 - Math.exp(-nullDev / n);
  const pred = mu.map((m) => (m >= 0.5 ? 1 : 0));
  const tp = pred.filter((v, i) => v === 1 && y[i] === 1).length, tn = pred.filter((v, i) => v === 0 && y[i] === 0).length;
  const pos = mu.filter((_, i) => y[i] === 1), neg = mu.filter((_, i) => y[i] === 0);
  const rk = ranks([...pos, ...neg]);
  const auc = (rk.slice(0, pos.length).reduce((a, v) => a + v, 0) - (pos.length * (pos.length + 1)) / 2) / (pos.length * neg.length);
  return { n, k, events: ev, coefficients, nullDeviance: nullDev, deviance: dev, chi2, df: k, p: chi2RightTail(chi2, k), mcFadden: 1 - dev / nullDev, coxSnell, nagelkerke: coxSnell / maxCs, accuracy: (tp + tn) / n, sensitivity: tp / ev, specificity: tn / (n - ev), auc, iterations: iter };
}
