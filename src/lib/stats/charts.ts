/**
 * Grafik verisi (deterministik). Ham veriden APA 7 şekilleri için gereken özet değerler hesaplanır;
 * çizim istemcide SVG olarak yapılır (src/lib/charts/svg.ts). Yapay zekâ hiçbir değer üretmez.
 */
import { DataTable } from "./apa";
import { tCritical } from "./dist";
import { describe, mean, pearson } from "./tests";
import { toNum } from "@/lib/files/stats";

type L = "tr" | "en" | "de";
export type ErrorKind = "ci95" | "se" | "sd" | "none";

export type ChartSpec =
  | { kind: "bar_means"; dv: string; group: string; error: ErrorKind }
  | { kind: "bar_freq"; variable: string; percent: boolean }
  | { kind: "line_means"; vars: string[]; group?: string; error: ErrorKind }
  | { kind: "histogram"; variable: string; bins?: number }
  | { kind: "scatter"; x: string; y: string; fit: boolean }
  | { kind: "box"; dv: string; group?: string };

export interface Series { name: string; values: number[]; errors?: number[] }
export interface Box { name: string; min: number; q1: number; median: number; q3: number; max: number; outliers: number[] }

export interface ChartData {
  kind: "bar" | "line" | "histogram" | "scatter" | "box";
  title: string;
  xLabel: string;
  yLabel: string;
  categories: string[];
  series: Series[];
  bins?: { from: number; to: number; count: number }[];
  points?: [number, number][];
  fit?: { a: number; b: number; r: number };
  boxes?: Box[];
  n: number;
  note: string;
}

const W = {
  tr: { mean: "Ortalama", freq: "Frekans", pct: "Yüzde (%)", ci: "Hata çubukları %95 güven aralığını gösterir.", se: "Hata çubukları ortalamanın standart hatasını (±1 SH) gösterir.", sd: "Hata çubukları ±1 standart sapmayı gösterir.", byGroup: (dv: string, g: string) => `${g} değişkenine göre ${dv} ortalamaları`, freqOf: (v: string) => `${v} değişkeninin dağılımı`, lineOf: (g?: string) => (g ? `Ölçümlere ve ${g} değişkenine göre ortalamalar` : "Ölçümlere göre ortalamalar"), histOf: (v: string) => `${v} puanlarının dağılımı`, scatterOf: (x: string, y: string) => `${x} ile ${y} arasındaki ilişki`, boxOf: (dv: string, g?: string) => (g ? `${g} değişkenine göre ${dv} puanlarının dağılımı` : `${dv} puanlarının dağılımı`), measure: "Ölçüm", all: "Tümü", fitNote: (r: string, n: number) => `Düz çizgi en küçük kareler doğrusudur (r = ${r}, N = ${n}).`, boxNote: "Kutular çeyrekler arası aralığı, kutudaki çizgi medyanı, bıyıklar 1,5 × ÇAA içindeki en uç değerleri gösterir; noktalar uç değerlerdir.", n: (n: number) => `N = ${n}.` },
  de: { mean: "Mittelwert", freq: "Häufigkeit", pct: "Prozent (%)", ci: "Die Fehlerbalken zeigen 95 %-Konfidenzintervalle.", se: "Die Fehlerbalken zeigen ±1 Standardfehler des Mittelwerts.", sd: "Die Fehlerbalken zeigen ±1 Standardabweichung.", byGroup: (dv: string, g: string) => `Mittelwerte von ${dv} nach ${g}`, freqOf: (v: string) => `Verteilung von ${v}`, lineOf: (g?: string) => (g ? `Mittelwerte über die Messzeitpunkte nach ${g}` : "Mittelwerte über die Messzeitpunkte"), histOf: (v: string) => `Verteilung der ${v}-Werte`, scatterOf: (x: string, y: string) => `Zusammenhang zwischen ${x} und ${y}`, boxOf: (dv: string, g?: string) => (g ? `Verteilung von ${dv} nach ${g}` : `Verteilung von ${dv}`), measure: "Messung", all: "Alle", fitNote: (r: string, n: number) => `Die durchgezogene Linie ist die Regressionsgerade nach der Methode der kleinsten Quadrate (r = ${r}, N = ${n}).`, boxNote: "Die Boxen zeigen den Interquartilsabstand, die Linie den Median, die Whisker die extremsten Werte innerhalb von 1,5 × IQR; Punkte sind Ausreißer.", n: (n: number) => `N = ${n}.` },
  en: { mean: "Mean", freq: "Frequency", pct: "Percent (%)", ci: "Error bars represent 95% confidence intervals.", se: "Error bars represent ±1 standard error of the mean.", sd: "Error bars represent ±1 standard deviation.", byGroup: (dv: string, g: string) => `Mean ${dv} by ${g}`, freqOf: (v: string) => `Distribution of ${v}`, lineOf: (g?: string) => (g ? `Means across measurements by ${g}` : "Means across measurements"), histOf: (v: string) => `Distribution of ${v} scores`, scatterOf: (x: string, y: string) => `Relationship between ${x} and ${y}`, boxOf: (dv: string, g?: string) => (g ? `Distribution of ${dv} by ${g}` : `Distribution of ${dv}`), measure: "Measurement", all: "All", fitNote: (r: string, n: number) => `The solid line is the least-squares regression line (r = ${r}, N = ${n}).`, boxNote: "Boxes show the interquartile range, the line the median, whiskers the most extreme values within 1.5 × IQR; dots are outliers.", n: (n: number) => `N = ${n}.` },
} as const;

const r2 = (x: number) => x.toFixed(2).replace(/^(-?)0\./, "$1.");

function errorOf(x: number[], kind: ErrorKind): number {
  if (kind === "none" || x.length < 2) return 0;
  const d = describe(x);
  if (kind === "sd") return d.sd;
  if (kind === "se") return d.se;
  return d.se * tCritical(x.length - 1);
}
const errNote = (k: ErrorKind, l: L) => (k === "none" ? "" : W[l][k === "ci95" ? "ci" : k]);

/** Tip 7 nicelik (R/Excel varsayılanı) */
export function quantile(sorted: number[], p: number): number {
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h), hi = Math.ceil(h);
  return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}

export function boxStats(name: string, x: number[]): Box {
  const s = [...x].sort((a, b) => a - b);
  const q1 = quantile(s, 0.25), q3 = quantile(s, 0.75), iqr = q3 - q1;
  const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
  const inside = s.filter((v) => v >= lo && v <= hi);
  return { name, min: inside[0], q1, median: quantile(s, 0.5), q3, max: inside[inside.length - 1], outliers: s.filter((v) => v < lo || v > hi) };
}

/** Sturges kuralı, 5–30 aralığında; sınırlar okunaklı genişliğe yuvarlanır */
export function histogramBins(x: number[], requested?: number): { from: number; to: number; count: number }[] {
  const min = Math.min(...x), max = Math.max(...x);
  if (min === max) return [{ from: min - 0.5, to: max + 0.5, count: x.length }];
  const k = Math.min(30, Math.max(5, requested ?? Math.ceil(Math.log2(x.length) + 1)));
  const raw = (max - min) / k;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const start = Math.floor(min / step) * step;
  const n = Math.max(1, Math.ceil((max - start) / step + 1e-9));
  const bins = Array.from({ length: n }, (_, i) => ({ from: +(start + i * step).toPrecision(12), to: +(start + (i + 1) * step).toPrecision(12), count: 0 }));
  for (const v of x) bins[Math.min(n - 1, Math.floor((v - start) / step + 1e-9))].count++;
  return bins;
}

export function buildChart(rows: string[][], spec: ChartSpec, l: L = "tr"): ChartData {
  const d = new DataTable(rows);
  const w = W[l];
  switch (spec.kind) {
    case "bar_means": {
      const m = d.grouped(spec.dv, spec.group);
      if (m.size < 1) throw new Error(l === "tr" ? "Gruplarda veri yok" : l === "de" ? "Keine Daten in den Gruppen" : "No data in groups");
      if (m.size > 20) throw new Error(l === "tr" ? "Gruplama değişkeninin 20’den fazla düzeyi var; daha az düzeyli bir değişken seçin." : l === "de" ? "Die Gruppierungsvariable hat mehr als 20 Ausprägungen; wählen Sie eine Variable mit weniger Ausprägungen." : "The grouping variable has more than 20 levels.");
      const cats = [...m.keys()], vals = cats.map((c) => m.get(c)!);
      const n = vals.reduce((a, v) => a + v.length, 0);
      return { kind: "bar", title: w.byGroup(spec.dv, spec.group), xLabel: spec.group, yLabel: `${spec.dv} (${w.mean})`, categories: cats, series: [{ name: spec.dv, values: vals.map(mean), errors: spec.error === "none" ? undefined : vals.map((v) => errorOf(v, spec.error)) }], n, note: [w.n(n), errNote(spec.error, l)].filter(Boolean).join(" ") };
    }
    case "bar_freq": {
      const i = d.col(spec.variable);
      const counts = new Map<string, number>();
      for (const r of d.body) { const v = String(r[i] ?? "").trim(); if (v) counts.set(v, (counts.get(v) ?? 0) + 1); }
      if (!counts.size) throw new Error(l === "tr" ? "Değişkende veri yok" : l === "de" ? "Keine Daten in der Variable" : "No data");
      if (counts.size > 25) throw new Error(l === "tr" ? "Değişkenin 25’ten fazla farklı değeri var; histogram kullanın." : l === "de" ? "Mehr als 25 verschiedene Werte; verwenden Sie ein Histogramm." : "More than 25 distinct values; use a histogram.");
      const cats = [...counts.keys()].sort((a, b) => (Number.isFinite(+a) && Number.isFinite(+b) ? +a - +b : a.localeCompare(b, "tr")));
      const n = [...counts.values()].reduce((a, b) => a + b, 0);
      return { kind: "bar", title: w.freqOf(spec.variable), xLabel: spec.variable, yLabel: spec.percent ? w.pct : w.freq, categories: cats, series: [{ name: spec.variable, values: cats.map((c) => (spec.percent ? (100 * counts.get(c)!) / n : counts.get(c)!)) }], n, note: w.n(n) };
    }
    case "line_means": {
      if (spec.vars.length < 2) throw new Error(l === "tr" ? "En az iki ölçüm değişkeni seçin" : l === "de" ? "Wählen Sie mindestens zwei Messvariablen" : "Select at least two measurement variables");
      const groups = new Map<string, number[][]>();
      const gi = spec.group ? d.col(spec.group) : -1;
      const idx = spec.vars.map((v) => d.col(v));
      for (const r of d.body) {
        const vals = idx.map((i) => toNum(String(r[i] ?? "")));
        if (!vals.every((x) => Number.isFinite(x))) continue;
        const g = gi >= 0 ? String(r[gi] ?? "").trim() : w.all;
        if (!g) continue;
        groups.set(g, [...(groups.get(g) ?? []), vals]);
      }
      if (!groups.size) throw new Error(l === "tr" ? "Seçilen değişkenlerde sayısal veri yok" : l === "de" ? "Keine numerischen Daten in den gewählten Variablen" : "No numeric data");
      if (groups.size > 8) throw new Error(l === "tr" ? "Gruplama değişkeninin 8’den fazla düzeyi var." : l === "de" ? "Die Gruppierungsvariable hat mehr als 8 Ausprägungen." : "Grouping variable has more than 8 levels.");
      const series: Series[] = [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr")).map(([name, rs]) => ({ name, values: spec.vars.map((_, k) => mean(rs.map((r) => r[k]))), errors: spec.error === "none" ? undefined : spec.vars.map((_, k) => errorOf(rs.map((r) => r[k]), spec.error)) }));
      const n = [...groups.values()].reduce((a, v) => a + v.length, 0);
      return { kind: "line", title: w.lineOf(spec.group), xLabel: w.measure, yLabel: w.mean, categories: spec.vars, series, n, note: [w.n(n), errNote(spec.error, l)].filter(Boolean).join(" ") };
    }
    case "histogram": {
      const x = d.numeric([spec.variable]).map((r) => r[0]);
      return { kind: "histogram", title: w.histOf(spec.variable), xLabel: spec.variable, yLabel: w.freq, categories: [], series: [], bins: histogramBins(x, spec.bins), n: x.length, note: w.n(x.length) };
    }
    case "scatter": {
      const rs = d.numeric([spec.x, spec.y]);
      if (rs.length < 3) throw new Error(l === "tr" ? "En az 3 gözlem gerekir" : l === "de" ? "Mindestens 3 Beobachtungen erforderlich" : "At least 3 observations required");
      const xs = rs.map((r) => r[0]), ys = rs.map((r) => r[1]);
      let fit: ChartData["fit"];
      let note = w.n(rs.length);
      if (spec.fit) {
        const mx = mean(xs), my = mean(ys);
        const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
        if (sxx > 0) {
          const b = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / sxx;
          const r = pearson(xs, ys).r;
          fit = { a: my - b * mx, b, r };
          note = w.fitNote(r2(r), rs.length);
        }
      }
      return { kind: "scatter", title: w.scatterOf(spec.x, spec.y), xLabel: spec.x, yLabel: spec.y, categories: [], series: [], points: rs.slice(0, 5000).map((r) => [r[0], r[1]] as [number, number]), fit, n: rs.length, note };
    }
    case "box": {
      const m: Map<string, number[]> = spec.group ? d.grouped(spec.dv, spec.group) : new Map([[w.all, d.numeric([spec.dv]).map((r) => r[0])]]);
      if (m.size > 15) throw new Error(l === "tr" ? "Gruplama değişkeninin 15’ten fazla düzeyi var." : l === "de" ? "Die Gruppierungsvariable hat mehr als 15 Ausprägungen." : "Grouping variable has more than 15 levels.");
      const boxes = [...m.entries()].filter(([, v]) => v.length).map(([k, v]) => boxStats(k, v));
      const n = [...m.values()].reduce((a, v) => a + v.length, 0);
      return { kind: "box", title: w.boxOf(spec.dv, spec.group), xLabel: spec.group ?? "", yLabel: spec.dv, categories: boxes.map((b) => b.name), series: [], boxes, n, note: `${w.n(n)} ${w.boxNote}` };
    }
  }
}
