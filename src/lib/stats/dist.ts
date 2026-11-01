/**
 * Olasılık dağılımları (deterministik, bağımlılıksız).
 * Düzenlenmiş eksik beta/gama fonksiyonları Numerical Recipes (Press vd., 2007) algoritmalarıyla hesaplanır.
 */

const EPS = 1e-14;
const FPMIN = 1e-300;

export function logGamma(x: number): number {
  // Lanczos yaklaşımı (g = 7, n = 9)
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

function betacf(a: number, b: number, x: number): number {
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Düzenlenmiş eksik beta fonksiyonu I_x(a, b) */
export function incBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** Düzenlenmiş alt eksik gama fonksiyonu P(a, x) */
export function incGammaP(a: number, x: number): number {
  if (x <= 0) return 0;
  const gln = logGamma(a);
  if (x < a + 1) {
    let ap = a, sum = 1 / a, del = sum;
    for (let n = 0; n < 1000; n++) { ap++; del *= x / ap; sum += del; if (Math.abs(del) < Math.abs(sum) * EPS) break; }
    return sum * Math.exp(-x + a * Math.log(x) - gln);
  }
  let b = x + 1 - a, c = 1 / FPMIN, d = 1 / b, h = d;
  for (let i = 1; i < 1000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = b + an / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return 1 - Math.exp(-x + a * Math.log(x) - gln) * h;
}

/** Student t: iki yönlü p değeri */
export function tTwoTailed(t: number, df: number): number {
  if (!Number.isFinite(t)) return 0;
  return Math.min(1, incBeta(df / (df + t * t), df / 2, 0.5));
}

/** F dağılımı: sağ kuyruk p değeri */
export function fRightTail(f: number, df1: number, df2: number): number {
  if (f <= 0) return 1;
  if (!Number.isFinite(f)) return 0;
  return Math.min(1, incBeta(df2 / (df2 + df1 * f), df2 / 2, df1 / 2));
}

/** Ki-kare: sağ kuyruk p değeri */
export function chi2RightTail(x: number, df: number): number {
  if (x <= 0) return 1;
  return Math.max(0, 1 - incGammaP(df / 2, x / 2));
}

/** Standart normal birikimli dağılım */
export function normalCdf(z: number): number {
  return z >= 0 ? 0.5 + 0.5 * incGammaP(0.5, (z * z) / 2) : 0.5 - 0.5 * incGammaP(0.5, (z * z) / 2);
}
export const normalTwoTailed = (z: number) => 2 * (1 - normalCdf(Math.abs(z)));

/** t dağılımının ters fonksiyonu (iki yönlü alfa için kritik değer), ikiye bölme ile */
export function tCritical(df: number, alpha = 0.05): number {
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tTwoTailed(mid, df) > alpha) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
export function zCritical(alpha = 0.05): number {
  let lo = 0, hi = 40;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (normalTwoTailed(mid) > alpha) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
