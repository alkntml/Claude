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

// ---------------------------------------------------------------------------
// D222: ek dağılımlar (R’nin nmath kütüphanesindeki algoritmaların aktarımı; sonuçlar R ile karşılaştırılarak test edilir)
// ---------------------------------------------------------------------------

/** Standart normal dağılımın ters fonksiyonu (Wichura AS 241, PPND16; yaklaşık 1e-16 doğruluk) */
export function qnorm(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  const q = p - 0.5;
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((((((r * 2509.0809287301226727 + 33430.575583588128105) * r + 67265.770927008700853) * r + 45921.953931549871457) * r + 13731.693765509461125) * r + 1971.5909503065514427) * r + 133.14166789178437745) * r + 3.387132872796366608)
      / (((((((r * 5226.495278852545925 + 28729.085735721942674) * r + 39307.89580009271061) * r + 21213.794301586595867) * r + 5394.1960214247511077) * r + 687.1870074920579083) * r + 42.313330701600911252) * r + 1);
  }
  let r = q < 0 ? p : 1 - p;
  r = Math.sqrt(-Math.log(r));
  let val: number;
  if (r <= 5) {
    r -= 1.6;
    val = (((((((r * 7.7454501427834140764e-4 + 0.0227238449892691845833) * r + 0.24178072517745061177) * r + 1.27045825245236838258) * r + 3.64784832476320460504) * r + 5.7694972214606914055) * r + 4.6303378461565452959) * r + 1.42343711074968357734)
      / (((((((r * 1.05075007164441684324e-9 + 5.475938084995344946e-4) * r + 0.0151986665636164571966) * r + 0.14810397642748007459) * r + 0.68976733498510000455) * r + 1.6763848301838038494) * r + 2.05319162663775882187) * r + 1);
  } else {
    r -= 5;
    val = (((((((r * 2.01033439929228813265e-7 + 2.71155556874348757815e-5) * r + 0.0012426609473880784386) * r + 0.026532189526576123093) * r + 0.29656057182850489123) * r + 1.7848265399172913358) * r + 5.4637849111641143699) * r + 6.6579046435011037772)
      / (((((((r * 2.04426310338993978564e-15 + 1.4215117583164458887e-7) * r + 1.8463183175100546818e-5) * r + 7.868691311456132591e-4) * r + 0.0148753612908506148525) * r + 0.13692988092273580531) * r + 0.59983220655588793769) * r + 1);
  }
  return q < 0 ? -val : val;
}

/** Normal dağılımın üst kuyruğu (küçük olasılıklarda hassas): erfc ile */
export function normalUpper(z: number): number {
  return 0.5 * erfc(z / Math.SQRT2);
}
function erfc(x: number): number {
  // W. J. Cody’nin rasyonel yaklaşımları yerine sürekli kesir + seri (çift duyarlılıkta ~1e-15)
  const ax = Math.abs(x);
  let r: number;
  if (ax < 2) {
    // erf serisi
    let sum = ax, term = ax;
    for (let n = 1; n < 200; n++) { term *= -ax * ax / n; const add = term / (2 * n + 1); sum += add; if (Math.abs(add) < 1e-17 * Math.abs(sum)) break; }
    r = 1 - (2 / Math.sqrt(Math.PI)) * sum;
  } else {
    // Lentz yöntemiyle sürekli kesir
    const tiny = 1e-300;
    let f = ax, C = ax, D = 0;
    for (let n = 1; n < 500; n++) {
      const an = n / 2;
      D = ax + an * D; D = Math.abs(D) < tiny ? tiny : D; D = 1 / D;
      C = ax + an / C; C = Math.abs(C) < tiny ? tiny : C;
      const delta = C * D; f *= delta;
      if (Math.abs(delta - 1) < 1e-16) break;
    }
    r = Math.exp(-ax * ax) / Math.sqrt(Math.PI) / f;
  }
  return x >= 0 ? r : 2 - r;
}
const pnormLower = (x: number, mu = 0, s = 1) => 1 - normalUpper((x - mu) / s);

/** Stüdentleştirilmiş aralık dağılımı P(Q ≤ q) — Tukey HSD ve Games-Howell için (R ptukey, Copenhaver ve Holland 1988) */
function wprob(w: number, rr: number, cc: number): number {
  const nleg = 12, ihalf = 6, C1 = -30, C2 = -50, C3 = 60, bb = 8, wlar = 3, wincr1 = 2, wincr2 = 3;
  const xleg = [0.98156063424671925069, 0.904117256370474856678, 0.769902674194304687037, 0.587317954286617447297, 0.367831498998180193753, 0.125233408511468915472];
  const aleg = [0.0471753363865118271946, 0.106939325995318430960, 0.160078328543346226335, 0.203167426723065921749, 0.233492536538354808761, 0.249147045813402785001];
  const qsqz = w * 0.5;
  if (qsqz >= bb) return 1;
  let prW = 2 * pnormLower(qsqz) - 1;
  prW = prW >= Math.exp(C2 / cc) ? Math.pow(prW, cc) : 0;
  const wincr = w > wlar ? wincr1 : wincr2;
  let blb = qsqz;
  const binc = (bb - qsqz) / wincr;
  let bub = blb + binc;
  let einsum = 0;
  const cc1 = cc - 1;
  for (let wi = 1; wi <= wincr; wi++) {
    let elsum = 0;
    const a = 0.5 * (bub + blb), b = 0.5 * (bub - blb);
    for (let jj = 1; jj <= nleg; jj++) {
      let j: number, xx: number;
      if (ihalf < jj) { j = nleg - jj + 1; xx = xleg[j - 1]; } else { j = jj; xx = -xleg[j - 1]; }
      const ac = a + b * xx;
      const qexpo = ac * ac;
      if (qexpo > C3) break;
      const pplus = 2 * pnormLower(ac), pminus = 2 * pnormLower(ac, w);
      let rinsum = pplus * 0.5 - pminus * 0.5;
      if (rinsum >= Math.exp(C1 / cc1)) { rinsum = aleg[j - 1] * Math.exp(-(0.5 * qexpo)) * Math.pow(rinsum, cc1); elsum += rinsum; }
    }
    elsum *= (2 * b * cc) / Math.sqrt(2 * Math.PI);
    einsum += elsum;
    blb = bub; bub += binc;
  }
  prW += einsum;
  if (prW <= Math.exp(C1 / rr)) return 0;
  prW = Math.pow(prW, rr);
  return prW >= 1 ? 1 : prW;
}
export function ptukey(q: number, nmeans: number, df: number, nranges = 1): number {
  if (q <= 0) return 0;
  if (!Number.isFinite(q)) return 1;
  if (df > 25000) return wprob(q, nranges, nmeans);
  const xlegq = [0.989400934991649932596, 0.944575023073232576078, 0.865631202387831743880, 0.755404408355003033895, 0.617876244402643748447, 0.458016777657227386342, 0.281603550779258913230, 0.0950125098376374401853];
  const alegq = [0.0271524594117540948518, 0.0622535239386478928628, 0.0951585116824927848099, 0.124628971255533872052, 0.149595988816576732082, 0.169156519395002538189, 0.182603415044923588867, 0.189450610455068496285];
  const f2 = df * 0.5;
  let f2lf = f2 * Math.log(df) - df * Math.LN2 - logGamma(f2);
  const f21 = f2 - 1, ff4 = df * 0.25;
  const ulen = df <= 100 ? 1 : df <= 800 ? 0.5 : df <= 5000 ? 0.25 : 0.125;
  f2lf += Math.log(ulen);
  let ans = 0;
  for (let i = 1; i <= 50; i++) {
    let otsum = 0;
    const twa1 = (2 * i - 1) * ulen;
    for (let jj = 1; jj <= 16; jj++) {
      let j: number, t1: number;
      if (8 < jj) { j = jj - 8 - 1; t1 = f2lf + f21 * Math.log(twa1 + xlegq[j] * ulen) - (xlegq[j] * ulen + twa1) * ff4; }
      else { j = jj - 1; t1 = f2lf + f21 * Math.log(twa1 - xlegq[j] * ulen) + (xlegq[j] * ulen - twa1) * ff4; }
      if (t1 >= -30) {
        const qsqz = 8 < jj ? q * Math.sqrt((xlegq[j] * ulen + twa1) * 0.5) : q * Math.sqrt((-(xlegq[j] * ulen) + twa1) * 0.5);
        otsum += wprob(qsqz, nranges, nmeans) * alegq[j] * Math.exp(t1);
      }
    }
    if (i * ulen >= 1 && otsum <= 1e-14) break;
    ans += otsum;
  }
  return Math.min(1, ans);
}

/** Merkezi olmayan t dağılımı P(T ≤ t; df, ncp) (Lenth AS 243, R pnt) */
export function pnt(t: number, df: number, ncp: number): number {
  if (ncp === 0) return 1 - tUpper(t, df);
  let tt = t, del = ncp, neg = false;
  if (t < 0) { if (ncp > 40) return 0; neg = true; tt = -t; del = -ncp; }
  if (df > 4e5 || del * del > 2 * Math.LN2 * 1021) {
    const s = 1 / (4 * df);
    const v = pnormLower(tt * (1 - s), del, Math.sqrt(1 + tt * tt * 2 * s));
    return neg ? 1 - v : v;
  }
  let x = t * t;
  const rxb0 = df / (x + df);
  x = x / (x + df);
  let tnc = 0;
  if (x > 0) {
    const lambda = del * del;
    let p = 0.5 * Math.exp(-0.5 * lambda);
    if (p === 0) return neg ? 1 : 0;
    let q = Math.sqrt(2 / Math.PI) * p * del;
    let s = 0.5 - p;
    if (s < 1e-7) s = -0.5 * Math.expm1(-0.5 * lambda);
    let a = 0.5;
    const b = 0.5 * df;
    const rxb = Math.pow(rxb0, b);
    const albeta = Math.log(Math.sqrt(Math.PI)) + logGamma(b) - logGamma(0.5 + b);
    let xodd = incBeta(x, a, b);
    let godd = 2 * rxb * Math.exp(a * Math.log(x) - albeta);
    const tn = b * x;
    let xeven = tn < Number.EPSILON ? tn : 1 - rxb;
    let geven = tn * rxb;
    tnc = p * xodd + q * xeven;
    for (let it = 1; it <= 1000; it++) {
      a += 1;
      xodd -= godd; xeven -= geven;
      godd *= (x * (a + b - 1)) / a;
      geven *= (x * (a + b - 0.5)) / (a + 0.5);
      p *= lambda / (2 * it);
      q *= lambda / (2 * it + 1);
      tnc += p * xodd + q * xeven;
      s -= p;
      if (s < -1e-10) break;
      if (s <= 0 && it > 1) break;
      const errbd = 2 * s * (xodd - godd);
      if (Math.abs(errbd) < 1e-12) break;
    }
  }
  tnc += pnormLower(-del);
  const v = Math.min(tnc, 1);
  return neg ? 1 - v : v;
}
/** Merkezi t’nin üst kuyruğu P(T > t) */
function tUpper(t: number, df: number): number {
  const p2 = tTwoTailed(t, df) / 2;
  return t >= 0 ? p2 : 1 - p2;
}

/** Merkezi olmayan beta → merkezi olmayan F P(F ≤ f; df1, df2, ncp) (Lenth AS 226 + Frick R84, R pnbeta) */
export function pnf(f: number, df1: number, df2: number, ncp: number): number {
  if (f <= 0) return 0;
  const y = (df1 * f) / (df1 * f + df2);
  const a = df1 / 2, b = df2 / 2, c = ncp / 2;
  if (c === 0) return 1 - fRightTail(f, df1, df2);
  const x0 = Math.floor(Math.max(c - 7 * Math.sqrt(c), 0));
  const a0 = a + x0;
  const lbeta = logGamma(a0) + logGamma(b) - logGamma(a0 + b);
  let temp = incBeta(y, a0, b);
  let gx = Math.exp(a0 * Math.log(y) + b * Math.log1p(-y) - lbeta - Math.log(a0));
  let q = a0 > a ? Math.exp(-c + x0 * Math.log(c) - logGamma(x0 + 1)) : Math.exp(-c);
  let sumq = 1 - q;
  let ans = q * temp;
  let j = x0, errbd: number;
  do {
    j++;
    temp -= gx;
    gx *= (y * (a + b + j - 1)) / (a + j);
    q *= c / j;
    sumq -= q;
    ans += temp * q;
    errbd = (temp - gx) * sumq;
  } while (errbd > 1e-9 && j < 10000 + x0);
  return Math.min(1, Math.max(0, ans));
}

/** Monoton bir fonksiyonun hedef değeri aldığı noktayı ikiye bölmeyle bulur */
export function solveMonotone(fn: (x: number) => number, target: number, lo: number, hi: number): number {
  let flo = fn(lo) - target;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const fm = fn(mid) - target;
    if (Math.abs(hi - lo) < 1e-10) return mid;
    if ((fm > 0) === (flo > 0)) { lo = mid; flo = fm; } else hi = mid;
  }
  return (lo + hi) / 2;
}
