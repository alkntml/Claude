/**
 * D224: meta-analiz (sistematik derleme, “sentez sonuçları”). Etki ölçüleri: Hedges g (standartlaştırılmış ortalama farkı),
 * korelasyon (Fisher z), odds oranı (log OR) ve genel etki + standart hata. Sabit etki (ters varyans) ve rastgele etkiler
 * (DerSimonian–Laird); heterojenlik (Q, I², τ²); Egger regresyon testi; orman ve huni grafiği (SVG).
 * Saf modül: istemci, sunucu ve testler ortak kullanır; sonuçlar R metafor ile karşılaştırılarak test edilir.
 */
import { chi2RightTail, logGamma, normalTwoTailed } from "@/lib/stats/dist";
import { linearRegression } from "@/lib/stats/tests";

export type MetaType = "smd" | "r" | "or" | "generic";
export type MetaModel = "random" | "fixed";
/** Girdi alanları (hepsi sayı): smd → n1,m1,sd1,n2,m2,sd2 · r → r,n · or → e1,n1,e2,n2 · generic → yi,sei */
export const META_FIELDS: Record<MetaType, string[]> = {
  smd: ["n1", "m1", "sd1", "n2", "m2", "sd2"],
  r: ["r", "n"],
  or: ["e1", "n1", "e2", "n2"],
  generic: ["yi", "sei"],
};
export interface MetaRowInput { id: string; label: string; v: Record<string, number | null> }
export interface MetaStudy { id: string; label: string; yi: number; vi: number; sei: number; ci: [number, number]; wFixed: number; wRandom: number; wPct: number }
export interface MetaPooled { est: number; se: number; ci: [number, number]; z: number; p: number }
export interface MetaResult {
  type: MetaType; model: MetaModel; k: number; studies: MetaStudy[]; skipped: { label: string; reason: string }[];
  fixed: MetaPooled; random: MetaPooled; pooled: MetaPooled;
  Q: number; dfQ: number; pQ: number; I2: number; H2: number; tau2: number; tau: number;
  egger: { intercept: number; se: number; t: number; df: number; p: number } | null;
  /** Etki ölçeğinden gösterim ölçeğine (r için tanh, OR için exp, diğerleri aynı) */
  back: (x: number) => number;
  nullValue: number; effectName: string;
}

const Z975 = 1.959963984540054;
const finite = (x: unknown): x is number => typeof x === "number" && Number.isFinite(x);

/** Bir satırdan etki (yi) ve varyans (vi); geçersizse neden döner */
export function effectOf(type: MetaType, v: Record<string, number | null>): { yi: number; vi: number } | string {
  const g = (k: string) => v[k];
  if (type === "generic") {
    if (!finite(g("yi")) || !finite(g("sei"))) return "etki ve standart hata gerekli";
    if (g("sei")! <= 0) return "standart hata sıfırdan büyük olmalı";
    return { yi: g("yi")!, vi: g("sei")! ** 2 };
  }
  if (type === "r") {
    const r = g("r"), n = g("n");
    if (!finite(r) || !finite(n)) return "r ve n gerekli";
    if (Math.abs(r) >= 1) return "r −1 ile 1 arasında olmalı";
    if (n < 4) return "n en az 4 olmalı";
    return { yi: Math.atanh(r), vi: 1 / (n - 3) };
  }
  if (type === "or") {
    const e1 = g("e1"), n1 = g("n1"), e2 = g("e2"), n2 = g("n2");
    if (![e1, n1, e2, n2].every(finite)) return "olay ve toplam sayıları gerekli";
    if (e1! < 0 || e2! < 0 || e1! > n1! || e2! > n2! || n1! <= 0 || n2! <= 0) return "olay sayısı 0 ile toplam arasında olmalı";
    let a = e1!, b = n1! - e1!, c = e2!, d = n2! - e2!;
    if ((a === 0 && c === 0) || (b === 0 && d === 0)) return "her iki grupta da hiç olay (ya da hep olay) var; OR hesaplanamaz";
    if (a === 0 || b === 0 || c === 0 || d === 0) { a += 0.5; b += 0.5; c += 0.5; d += 0.5; } // metafor escalc: sıfır göze varsa +0,5
    return { yi: Math.log((a * d) / (b * c)), vi: 1 / a + 1 / b + 1 / c + 1 / d };
  }
  const [n1, m1, sd1, n2, m2, sd2] = ["n1", "m1", "sd1", "n2", "m2", "sd2"].map(g);
  if (![n1, m1, sd1, n2, m2, sd2].every(finite)) return "n, ortalama ve SS (iki grup için) gerekli";
  if (n1! < 2 || n2! < 2) return "her grupta n en az 2 olmalı";
  if (sd1! <= 0 || sd2! <= 0) return "SS sıfırdan büyük olmalı";
  const df = n1! + n2! - 2;
  const sp = Math.sqrt(((n1! - 1) * sd1! ** 2 + (n2! - 1) * sd2! ** 2) / df);
  const J = Math.exp(logGamma(df / 2) - Math.log(Math.sqrt(df / 2)) - logGamma((df - 1) / 2)); // Hedges’in kesin düzeltme çarpanı (metafor ile aynı)
  const yi = (J * (m1! - m2!)) / sp;
  return { yi, vi: 1 / n1! + 1 / n2! + yi ** 2 / (2 * (n1! + n2!)) };
}

const pool = (yi: number[], w: number[]): MetaPooled => {
  const sw = w.reduce((a, b) => a + b, 0), est = yi.reduce((a, v, i) => a + v * w[i], 0) / sw, se = Math.sqrt(1 / sw), z = est / se;
  return { est, se, ci: [est - Z975 * se, est + Z975 * se], z, p: normalTwoTailed(z) };
};

export function metaAnalysis(type: MetaType, model: MetaModel, rows: MetaRowInput[]): MetaResult {
  const ok: { id: string; label: string; yi: number; vi: number }[] = [], skipped: { label: string; reason: string }[] = [];
  for (const r of rows) {
    const e = effectOf(type, r.v);
    if (typeof e === "string") skipped.push({ label: r.label || "—", reason: e }); else ok.push({ id: r.id, label: r.label || r.id, ...e });
  }
  const k = ok.length;
  if (k < 2) throw new Error("Meta-analiz için en az 2 çalışmanın eksiksiz verisi gerekir");
  const yi = ok.map((s) => s.yi), vi = ok.map((s) => s.vi), wF = vi.map((v) => 1 / v);
  const fixed = pool(yi, wF);
  const Q = yi.reduce((a, y, i) => a + wF[i] * (y - fixed.est) ** 2, 0), dfQ = k - 1;
  const sw = wF.reduce((a, b) => a + b, 0), C = sw - wF.reduce((a, w) => a + w * w, 0) / sw;
  const tau2 = Math.max(0, (Q - dfQ) / C);
  const wR = vi.map((v) => 1 / (v + tau2));
  const random = pool(yi, wR);
  const pooled = model === "random" ? random : fixed;
  const wUse = model === "random" ? wR : wF, swUse = wUse.reduce((a, b) => a + b, 0);
  const studies: MetaStudy[] = ok.map((s, i) => ({ ...s, sei: Math.sqrt(s.vi), ci: [s.yi - Z975 * Math.sqrt(s.vi), s.yi + Z975 * Math.sqrt(s.vi)], wFixed: wF[i], wRandom: wR[i], wPct: (100 * wUse[i]) / swUse }));
  let egger: MetaResult["egger"] = null;
  if (k >= 3) {
    try {
      const reg = linearRegression(yi.map((y, i) => y / Math.sqrt(vi[i])), vi.map((v) => [1 / Math.sqrt(v)]), ["precision"]);
      const c = reg.coefficients[0];
      egger = { intercept: c.b, se: c.se, t: c.t, df: reg.dfResidual, p: c.p };
    } catch { egger = null; }
  }
  const back = type === "r" ? Math.tanh : type === "or" ? Math.exp : (x: number) => x;
  return {
    type, model, k, studies, skipped, fixed, random, pooled, Q, dfQ, pQ: chi2RightTail(Q, dfQ), I2: Q > 0 ? Math.max(0, (Q - dfQ) / Q) * 100 : 0, H2: Q / dfQ, tau2, tau: Math.sqrt(tau2), egger, back,
    nullValue: type === "or" ? 1 : 0,
    effectName: type === "smd" ? "Hedges g" : type === "r" ? "r" : type === "or" ? "OR" : "etki",
  };
}
