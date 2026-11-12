/**
 * Analiz çalıştırma ve APA 7 raporlama: veri tablosundan (CSV/XLSX satırları) seçilen değişkenlerle
 * testi hesaplar, APA biçiminde tablo (Markdown) ve sonuç cümlesi üretir. Tüm sayılar hesaplamadan gelir.
 */
import { captionMarkdown, captionRef, formatCaption, noteLabel } from "@/lib/citations/captions";
import { toNum } from "@/lib/files/stats";
import {
  bonferroniPosthoc, chiSquareIndependence, cronbachAlpha, describe, independentT, kruskalWallis, linearRegression,
  mannWhitney, oneSampleT, oneWayAnova, pairedT, pearson, spearman,
} from "./tests";

export type AnalysisSpec =
  | { kind: "describe"; vars: string[] }
  | { kind: "ttest_ind"; dv: string; group: string; levels?: [string, string] }
  | { kind: "ttest_paired"; a: string; b: string }
  | { kind: "ttest_one"; dv: string; mu: number }
  | { kind: "anova"; dv: string; group: string }
  | { kind: "mannwhitney"; dv: string; group: string; levels?: [string, string] }
  | { kind: "kruskal"; dv: string; group: string }
  | { kind: "correlation"; vars: string[]; method: "pearson" | "spearman" }
  | { kind: "regression"; dv: string; ivs: string[] }
  | { kind: "chisquare"; a: string; b: string }
  | { kind: "alpha"; items: string[]; scale?: string };

export interface AnalysisReport {
  title: string;
  /** APA tablosu (Markdown; belgeye tablo olarak eklenir) */
  table: string;
  /** APA sonuç cümlesi */
  text: string;
  notes: string[];
  n: number;
}

type L = "tr" | "en" | "de";
const T = {
  tr: {
    desc: "Betimsel istatistikler", variable: "Değişken", skew: "Çarpıklık", kurt: "Basıklık", group: "Grup", diff: "Fark",
    ttest: "Bağımsız örneklemler t testi sonuçları", paired: "Eşleştirilmiş örneklemler t testi sonuçları", onesample: "Tek örneklem t testi sonuçları",
    anova: "Tek yönlü varyans analizi (ANOVA) sonuçları", source: "Varyans kaynağı", between: "Gruplar arası", within: "Gruplar içi", total: "Toplam",
    mw: "Mann-Whitney U testi sonuçları", kw: "Kruskal-Wallis H testi sonuçları", meanRank: "Sıra ort.", median: "Medyan",
    corr: (m: string) => (m === "spearman" ? "Spearman sıra farkları korelasyon katsayıları" : "Pearson korelasyon katsayıları"),
    reg: "Çoklu doğrusal regresyon analizi sonuçları", predictor: "Yordayıcı", chisq: "Ki-kare bağımsızlık testi sonuçları", alpha: "Güvenirlik analizi (Cronbach alfa)",
    item: "Madde", itemTotal: "Düzeltilmiş madde-toplam r", alphaIf: "Madde silinirse α", mean: "Ort.", sd: "SS",
  },
  en: {
    desc: "Descriptive statistics", variable: "Variable", skew: "Skewness", kurt: "Kurtosis", group: "Group", diff: "Difference",
    ttest: "Independent samples t-test results", paired: "Paired samples t-test results", onesample: "One-sample t-test results",
    anova: "One-way analysis of variance (ANOVA) results", source: "Source", between: "Between groups", within: "Within groups", total: "Total",
    mw: "Mann-Whitney U test results", kw: "Kruskal-Wallis H test results", meanRank: "Mean rank", median: "Median",
    corr: (m: string) => (m === "spearman" ? "Spearman rank-order correlation coefficients" : "Pearson correlation coefficients"),
    reg: "Multiple linear regression results", predictor: "Predictor", chisq: "Chi-square test of independence results", alpha: "Reliability analysis (Cronbach's alpha)",
    item: "Item", itemTotal: "Corrected item-total r", alphaIf: "α if item deleted", mean: "M", sd: "SD",
  },
  // D144: Almanca (DGPs/APA’nın Almanca uygulaması; M, SD, df korunur)
  de: {
    desc: "Deskriptive Statistiken", variable: "Variable", skew: "Schiefe", kurt: "Kurtosis", group: "Gruppe", diff: "Differenz",
    ttest: "Ergebnisse des t-Tests für unabhängige Stichproben", paired: "Ergebnisse des t-Tests für abhängige Stichproben", onesample: "Ergebnisse des t-Tests für eine Stichprobe",
    anova: "Ergebnisse der einfaktoriellen Varianzanalyse (ANOVA)", source: "Varianzquelle", between: "Zwischen den Gruppen", within: "Innerhalb der Gruppen", total: "Gesamt",
    mw: "Ergebnisse des Mann-Whitney-U-Tests", kw: "Ergebnisse des Kruskal-Wallis-H-Tests", meanRank: "Mittlerer Rang", median: "Median",
    corr: (m: string) => (m === "spearman" ? "Spearman-Rangkorrelationskoeffizienten" : "Pearson-Korrelationskoeffizienten"),
    reg: "Ergebnisse der multiplen linearen Regression", predictor: "Prädiktor", chisq: "Ergebnisse des Chi-Quadrat-Unabhängigkeitstests", alpha: "Reliabilitätsanalyse (Cronbachs Alpha)",
    item: "Item", itemTotal: "Korrigierte Item-Skala-Korrelation", alphaIf: "α bei Weglassen des Items", mean: "M", sd: "SD",
  },
} as const;
/** Üç dilli kısa seçici */
const L3 = (l: L, tr: string, en: string, de: string) => (l === "tr" ? tr : l === "de" ? de : en);

// ---------------------------------------------------------------------------
// Biçimlendirme (APA 7): p < .001; r, β, p, α başında sıfırsız
// ---------------------------------------------------------------------------
export const f2 = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : "—");
export const noZero = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d).replace(/^(-?)0\./, "$1.") : "—");
export const pApa = (p: number) => (p < 0.001 ? "p < .001" : `p = ${noZero(p, 3)}`);
const pCell = (p: number) => (p < 0.001 ? "< .001" : noZero(p, 3));
const stars = (p: number) => (p < 0.001 ? "***" : p < 0.01 ? "**" : p < 0.05 ? "*" : "");
const sig = (p: number, l: L) => (p < 0.05 ? L3(l, "anlamlı", "significant", "signifikant") : L3(l, "anlamlı değildir", "not significant", "nicht signifikant"));
const table = (head: string[], rows: (string | number)[][]) => [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");

// ---------------------------------------------------------------------------
// Veri erişimi (listwise silme)
// ---------------------------------------------------------------------------
export class DataTable {
  readonly header: string[];
  readonly body: string[][];
  constructor(rows: string[][]) {
    if (rows.length < 2) throw new Error("Veri tablosu boş");
    this.header = rows[0].map((h, i) => (h?.trim() ? h.trim() : `Sütun ${i + 1}`));
    this.body = rows.slice(1).filter((r) => r.some((c) => String(c ?? "").trim()));
  }
  col(name: string): number {
    const i = this.header.indexOf(name);
    if (i < 0) throw new Error(`“${name}” sütunu bulunamadı`);
    return i;
  }
  /** Tüm istenen sayısal sütunları dolu olan satırlar */
  numeric(names: string[]): number[][] {
    const idx = names.map((n) => this.col(n));
    const out: number[][] = [];
    for (const r of this.body) {
      const v = idx.map((i) => toNum(String(r[i] ?? "")));
      if (v.every((x) => Number.isFinite(x))) out.push(v);
    }
    if (!out.length) throw new Error("Seçilen değişkenlerde sayısal veri yok");
    return out;
  }
  /** Gruplama değişkeni + sayısal bağımlı değişken */
  grouped(dv: string, group: string): Map<string, number[]> {
    const di = this.col(dv), gi = this.col(group);
    const m = new Map<string, number[]>();
    for (const r of this.body) {
      const g = String(r[gi] ?? "").trim();
      const v = toNum(String(r[di] ?? ""));
      if (!g || !Number.isFinite(v)) continue;
      m.set(g, [...(m.get(g) ?? []), v]);
    }
    return new Map([...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr")));
  }
  categorical(a: string, b: string): [string[], string[]] {
    const ai = this.col(a), bi = this.col(b);
    const xs: string[] = [], ys: string[] = [];
    for (const r of this.body) { const x = String(r[ai] ?? "").trim(), y = String(r[bi] ?? "").trim(); if (x && y) { xs.push(x); ys.push(y); } }
    return [xs, ys];
  }
}

function twoGroups(m: Map<string, number[]>, levels: [string, string] | undefined, l: L): [string, number[], string, number[]] {
  const keys = levels ?? ([...m.keys()] as string[]);
  if (!levels && keys.length !== 2) throw new Error(L3(l, `Gruplama değişkeninin tam 2 düzeyi olmalı (şu an ${keys.length}: ${keys.slice(0, 6).join(", ")}). Karşılaştırılacak iki grubu seçin veya ANOVA kullanın.`, `The grouping variable must have exactly 2 levels (found ${keys.length}).`, `Die Gruppierungsvariable muss genau 2 Ausprägungen haben (gefunden: ${keys.length}). Wählen Sie zwei Gruppen oder nutzen Sie eine ANOVA.`));
  const [a, b] = keys;
  if (!m.get(a) || !m.get(b)) throw new Error(L3(l, "Seçilen gruplarda veri yok", "No data in the selected groups", "Keine Daten in den gewählten Gruppen"));
  return [a, m.get(a)!, b, m.get(b)!];
}

const ns = (x: number) => String(Math.round(x));

// ---------------------------------------------------------------------------
// Çalıştırıcı
// ---------------------------------------------------------------------------
export function runAnalysis(rows: string[][], spec: AnalysisSpec, l: L = "tr"): AnalysisReport {
  const d = new DataTable(rows);
  const t = T[l];
  const notes: string[] = [];

  switch (spec.kind) {
    case "describe": {
      const res = spec.vars.map((v) => ({ v, s: describe(d.numeric([v]).map((r) => r[0])) }));
      const tbl = table([t.variable, "n", t.mean, t.sd, "Min", L3(l, "Maks", "Max", "Max"), t.skew, t.kurt], res.map(({ v, s }) => [v, s.n, f2(s.mean), f2(s.sd), f2(s.min), f2(s.max), f2(s.skewness), f2(s.kurtosis)]));
      const off = res.filter(({ s }) => Math.abs(s.skewness) > 1.5 || Math.abs(s.kurtosis) > 1.5);
      notes.push(L3(l,
        "Çarpıklık ve basıklık değerlerinin −1,5 ile +1,5 arasında olması normal dağılım için yeterli kabul edilir (Tabachnick ve Fidell, 2013). Bu kaynağı metinde kullanacaksanız projenize ekleyin.",
        "Skewness and kurtosis between −1.5 and +1.5 are commonly considered acceptable for normality (Tabachnick & Fidell, 2013). Add this source to your project if you cite it.",
        "Schiefe und Kurtosis zwischen −1,5 und +1,5 gelten üblicherweise als ausreichend für eine Normalverteilung (Tabachnick & Fidell, 2013). Fügen Sie diese Quelle Ihrem Projekt hinzu, wenn Sie sie zitieren."));
      const text = l === "de"
        ? `Die deskriptiven Statistiken der Variablen sind in Tabelle 1 dargestellt. ${off.length ? `Bei ${off.map((o) => o.v).join(", ")} lagen Schiefe oder Kurtosis außerhalb von ±1,5; für diese Variablen sollten nichtparametrische Verfahren erwogen werden.` : "Schiefe und Kurtosis aller Variablen lagen im Bereich von ±1,5."}`
        : l === "tr"
        ? `Değişkenlere ilişkin betimsel istatistikler Tablo 1’de sunulmuştur. ${off.length ? `${off.map((o) => o.v).join(", ")} değişken(ler)inde çarpıklık veya basıklık değeri ±1,5 sınırının dışındadır; bu değişkenler için parametrik olmayan testler değerlendirilmelidir.` : "Tüm değişkenlerin çarpıklık ve basıklık değerleri ±1,5 aralığındadır."}`
        : `Descriptive statistics are presented in Table 1. ${off.length ? `Skewness or kurtosis for ${off.map((o) => o.v).join(", ")} fell outside ±1.5; non-parametric tests should be considered for these variables.` : "Skewness and kurtosis of all variables were within ±1.5."}`;
      return { title: t.desc, table: tbl, text, notes, n: Math.max(...res.map((r) => r.s.n)) };
    }

    case "ttest_ind": {
      const [ga, a, gb, b] = twoGroups(d.grouped(spec.dv, spec.group), spec.levels, l);
      const r = independentT(a, b);
      const used = r[r.recommended];
      const df = r.recommended === "welch" ? f2(used.df) : ns(used.df);
      const tbl = table([t.group, "n", t.mean, t.sd, "t", L3(l, "sd", "df", "df"), "p", "Cohen d"], [
        [ga, r.groups[0].n, f2(r.groups[0].mean), f2(r.groups[0].sd), f2(used.t), df, pCell(used.p), f2(Math.abs(r.cohensD))],
        [gb, r.groups[1].n, f2(r.groups[1].mean), f2(r.groups[1].sd), "", "", "", ""],
      ]);
      notes.push(l === "de"
        ? `Levene-Test: F(${r.levene.df1}, ${r.levene.df2}) = ${f2(r.levene.F)}, ${pApa(r.levene.p)}. ${r.recommended === "welch" ? "Da keine Varianzhomogenität vorlag, wird der Welch-korrigierte t-Test berichtet." : "Varianzhomogenität lag vor; berichtet wird der t-Test nach Student."}`
        : l === "tr"
        ? `Levene testi: F(${r.levene.df1}, ${r.levene.df2}) = ${f2(r.levene.F)}, ${pApa(r.levene.p)}. ${r.recommended === "welch" ? "Varyanslar homojen olmadığı için Welch düzeltmeli t testi raporlanmıştır." : "Varyanslar homojendir; Student t testi raporlanmıştır."}`
        : `Levene's test: F(${r.levene.df1}, ${r.levene.df2}) = ${f2(r.levene.F)}, ${pApa(r.levene.p)}. ${r.recommended === "welch" ? "Equal variances not assumed; Welch's t-test is reported." : "Equal variances assumed; Student's t-test is reported."}`);
      const text = l === "de"
        ? `Mit einem t-Test für unabhängige Stichproben wurde geprüft, ob sich ${spec.dv} nach ${spec.group} unterscheidet. Der Unterschied zwischen ${ga} (M = ${f2(r.groups[0].mean)}, SD = ${f2(r.groups[0].sd)}) und ${gb} (M = ${f2(r.groups[1].mean)}, SD = ${f2(r.groups[1].sd)}) war ${sig(used.p, l)}, t(${df}) = ${f2(used.t)}, ${pApa(used.p)}, d = ${f2(Math.abs(r.cohensD))}, 95 %-KI [${f2(used.ci[0])}, ${f2(used.ci[1])}].`
        : l === "tr"
        ? `${spec.dv} puanlarının ${spec.group} değişkenine göre farklılaşıp farklılaşmadığı bağımsız örneklemler t testiyle incelenmiştir. ${ga} grubunun puanları (Ort. = ${f2(r.groups[0].mean)}, SS = ${f2(r.groups[0].sd)}) ile ${gb} grubunun puanları (Ort. = ${f2(r.groups[1].mean)}, SS = ${f2(r.groups[1].sd)}) arasındaki fark istatistiksel olarak ${sig(used.p, l)}${used.p < 0.05 ? "dır" : ""}, t(${df}) = ${f2(used.t)}, ${pApa(used.p)}, d = ${f2(Math.abs(r.cohensD))}, %95 GA [${f2(used.ci[0])}, ${f2(used.ci[1])}].`
        : `An independent samples t-test was conducted to compare ${spec.dv} by ${spec.group}. The difference between ${ga} (M = ${f2(r.groups[0].mean)}, SD = ${f2(r.groups[0].sd)}) and ${gb} (M = ${f2(r.groups[1].mean)}, SD = ${f2(r.groups[1].sd)}) was ${sig(used.p, l)}, t(${df}) = ${f2(used.t)}, ${pApa(used.p)}, d = ${f2(Math.abs(r.cohensD))}, 95% CI [${f2(used.ci[0])}, ${f2(used.ci[1])}].`;
      return { title: t.ttest, table: tbl, text, notes, n: a.length + b.length };
    }

    case "ttest_paired": {
      const rows2 = d.numeric([spec.a, spec.b]);
      const r = pairedT(rows2.map((x) => x[0]), rows2.map((x) => x[1]));
      const tbl = table([t.variable, "n", t.mean, t.sd, "t", L3(l, "sd", "df", "df"), "p", "Cohen dz"], [
        [spec.a, r.before.n, f2(r.before.mean), f2(r.before.sd), f2(r.t), r.df, pCell(r.p), f2(Math.abs(r.cohensDz))],
        [spec.b, r.after.n, f2(r.after.mean), f2(r.after.sd), "", "", "", ""],
      ]);
      const text = l === "de"
        ? `Ein t-Test für abhängige Stichproben verglich ${spec.a} (M = ${f2(r.before.mean)}, SD = ${f2(r.before.sd)}) und ${spec.b} (M = ${f2(r.after.mean)}, SD = ${f2(r.after.sd)}); der Unterschied war ${sig(r.p, l)}, t(${r.df}) = ${f2(r.t)}, ${pApa(r.p)}, dz = ${f2(Math.abs(r.cohensDz))}, 95 %-KI [${f2(r.ci[0])}, ${f2(r.ci[1])}].`
        : l === "tr"
        ? `${spec.a} (Ort. = ${f2(r.before.mean)}, SS = ${f2(r.before.sd)}) ve ${spec.b} (Ort. = ${f2(r.after.mean)}, SS = ${f2(r.after.sd)}) puanları arasındaki fark eşleştirilmiş örneklemler t testiyle incelenmiş ve fark istatistiksel olarak ${sig(r.p, l)}${r.p < 0.05 ? "dır" : ""}, t(${r.df}) = ${f2(r.t)}, ${pApa(r.p)}, dz = ${f2(Math.abs(r.cohensDz))}, %95 GA [${f2(r.ci[0])}, ${f2(r.ci[1])}].`
        : `A paired samples t-test compared ${spec.a} (M = ${f2(r.before.mean)}, SD = ${f2(r.before.sd)}) and ${spec.b} (M = ${f2(r.after.mean)}, SD = ${f2(r.after.sd)}); the difference was ${sig(r.p, l)}, t(${r.df}) = ${f2(r.t)}, ${pApa(r.p)}, dz = ${f2(Math.abs(r.cohensDz))}, 95% CI [${f2(r.ci[0])}, ${f2(r.ci[1])}].`;
      return { title: t.paired, table: tbl, text, notes, n: r.before.n };
    }

    case "ttest_one": {
      const r = oneSampleT(d.numeric([spec.dv]).map((x) => x[0]), spec.mu);
      const tbl = table([t.variable, "n", t.mean, t.sd, L3(l, "Test değeri", "Test value", "Testwert"), "t", L3(l, "sd", "df", "df"), "p", "Cohen d"], [[spec.dv, r.desc.n, f2(r.desc.mean), f2(r.desc.sd), f2(spec.mu), f2(r.t), r.df, pCell(r.p), f2(Math.abs(r.cohensD))]]);
      const text = l === "de"
        ? `Der Mittelwert von ${spec.dv} (M = ${f2(r.desc.mean)}, SD = ${f2(r.desc.sd)}) unterschied sich ${r.p < 0.05 ? "signifikant" : "nicht signifikant"} vom Testwert ${f2(spec.mu)}, t(${r.df}) = ${f2(r.t)}, ${pApa(r.p)}, d = ${f2(Math.abs(r.cohensD))}.`
        : l === "tr"
        ? `${spec.dv} ortalaması (Ort. = ${f2(r.desc.mean)}, SS = ${f2(r.desc.sd)}) ile test değeri (${f2(spec.mu)}) arasındaki fark ${sig(r.p, l)}${r.p < 0.05 ? "dır" : ""}, t(${r.df}) = ${f2(r.t)}, ${pApa(r.p)}, d = ${f2(Math.abs(r.cohensD))}.`
        : `The mean of ${spec.dv} (M = ${f2(r.desc.mean)}, SD = ${f2(r.desc.sd)}) differed ${r.p < 0.05 ? "significantly" : "non-significantly"} from ${f2(spec.mu)}, t(${r.df}) = ${f2(r.t)}, ${pApa(r.p)}, d = ${f2(Math.abs(r.cohensD))}.`;
      return { title: t.onesample, table: tbl, text, notes, n: r.desc.n };
    }

    case "anova": {
      const m = d.grouped(spec.dv, spec.group);
      const labels = [...m.keys()], groups = [...m.values()];
      if (labels.length < 2) throw new Error(L3(l, "En az 2 grup gerekir", "At least 2 groups are required", "Mindestens 2 Gruppen erforderlich"));
      if (labels.length > 12) throw new Error(L3(l, "Gruplama değişkeninin çok fazla düzeyi var (en fazla 12)", "Too many groups (max 12)", "Zu viele Gruppen (höchstens 12)"));
      const a = oneWayAnova(groups);
      const desc = table([t.group, "n", t.mean, t.sd], labels.map((g, i) => [g, a.groups[i].n, f2(a.groups[i].mean), f2(a.groups[i].sd)]));
      const anova = table([t.source, L3(l, "KT", "SS", "QS"), L3(l, "sd", "df", "df"), L3(l, "KO", "MS", "MQS"), "F", "p", "η²"], [
        [t.between, f2(a.ssBetween), a.dfBetween, f2(a.msBetween), f2(a.F), pCell(a.p), noZero(a.etaSquared)],
        [t.within, f2(a.ssWithin), a.dfWithin, f2(a.msWithin), "", "", ""],
        [t.total, f2(a.ssBetween + a.ssWithin), a.dfBetween + a.dfWithin, "", "", "", ""],
      ]);
      const ph = a.p < 0.05 ? bonferroniPosthoc(groups, labels, a).filter((x) => x.p < 0.05) : [];
      if (a.p < 0.05) notes.push(l === "de"
        ? `Bonferroni-korrigierte Paarvergleiche: ${ph.length ? ph.map((x) => `${x.a} – ${x.b} (Differenz = ${f2(x.diff)}, ${pApa(x.p)})`).join("; ") : "keine signifikanten Paarunterschiede"}.`
        : l === "tr"
        ? `Bonferroni düzeltmeli ikili karşılaştırmalar: ${ph.length ? ph.map((x) => `${x.a} – ${x.b} (fark = ${f2(x.diff)}, ${pApa(x.p)})`).join("; ") : "anlamlı ikili fark bulunmadı"}.`
        : `Bonferroni-corrected pairwise comparisons: ${ph.length ? ph.map((x) => `${x.a} – ${x.b} (diff = ${f2(x.diff)}, ${pApa(x.p)})`).join("; ") : "no significant pairwise differences"}.`);
      const text = l === "de"
        ? `Mit einer einfaktoriellen Varianzanalyse wurde geprüft, ob sich ${spec.dv} nach ${spec.group} unterscheidet. Der Effekt war ${sig(a.p, l)}, F(${a.dfBetween}, ${a.dfWithin}) = ${f2(a.F)}, ${pApa(a.p)}, η² = ${noZero(a.etaSquared)}.`
        : l === "tr"
        ? `${spec.dv} puanlarının ${spec.group} değişkenine göre farklılaşıp farklılaşmadığı tek yönlü varyans analiziyle incelenmiştir. Gruplar arasındaki fark istatistiksel olarak ${sig(a.p, l)}${a.p < 0.05 ? "dır" : ""}, F(${a.dfBetween}, ${a.dfWithin}) = ${f2(a.F)}, ${pApa(a.p)}, η² = ${noZero(a.etaSquared)}.`
        : `A one-way ANOVA examined differences in ${spec.dv} by ${spec.group}. The effect was ${sig(a.p, l)}, F(${a.dfBetween}, ${a.dfWithin}) = ${f2(a.F)}, ${pApa(a.p)}, η² = ${noZero(a.etaSquared)}.`;
      return { title: t.anova, table: `${desc}\n\n${anova}`, text, notes, n: groups.flat().length };
    }

    case "mannwhitney": {
      const [ga, a, gb, b] = twoGroups(d.grouped(spec.dv, spec.group), spec.levels, l);
      const r = mannWhitney(a, b);
      const tbl = table([t.group, "n", t.median, t.meanRank, "U", "z", "p", "r"], [
        [ga, r.n1, f2(r.median1), f2(r.meanRank1), f2(r.U), f2(r.z), pCell(r.p), noZero(r.r)],
        [gb, r.n2, f2(r.median2), f2(r.meanRank2), "", "", "", ""],
      ]);
      const text = l === "de"
        ? `Ein Mann-Whitney-U-Test verglich ${spec.dv} zwischen ${ga} (Mdn = ${f2(r.median1)}) und ${gb} (Mdn = ${f2(r.median2)}); der Unterschied war ${sig(r.p, l)}, U = ${f2(r.U)}, z = ${f2(r.z)}, ${pApa(r.p)}, r = ${noZero(r.r)}.`
        : l === "tr"
        ? `${spec.dv} puanlarının ${spec.group} değişkenine göre farklılaşıp farklılaşmadığı Mann-Whitney U testiyle incelenmiştir. ${ga} (Mdn = ${f2(r.median1)}) ve ${gb} (Mdn = ${f2(r.median2)}) grupları arasındaki fark ${sig(r.p, l)}${r.p < 0.05 ? "dır" : ""}, U = ${f2(r.U)}, z = ${f2(r.z)}, ${pApa(r.p)}, r = ${noZero(r.r)}.`
        : `A Mann-Whitney U test compared ${spec.dv} between ${ga} (Mdn = ${f2(r.median1)}) and ${gb} (Mdn = ${f2(r.median2)}); the difference was ${sig(r.p, l)}, U = ${f2(r.U)}, z = ${f2(r.z)}, ${pApa(r.p)}, r = ${noZero(r.r)}.`;
      return { title: t.mw, table: tbl, text, notes, n: r.n1 + r.n2 };
    }

    case "kruskal": {
      const m = d.grouped(spec.dv, spec.group);
      const labels = [...m.keys()];
      const r = kruskalWallis([...m.values()]);
      const tbl = table([t.group, "n", t.meanRank], labels.map((g, i) => [g, r.ns[i], f2(r.meanRanks[i])]));
      const text = l === "de"
        ? `Ein Kruskal-Wallis-H-Test prüfte ${spec.dv} nach ${spec.group}; der Unterschied war ${sig(r.p, l)}, H(${r.df}) = ${f2(r.H)}, ${pApa(r.p)}, ε² = ${noZero(r.epsilonSquared)}.`
        : l === "tr"
        ? `${spec.dv} puanlarının ${spec.group} değişkenine göre farklılaşıp farklılaşmadığı Kruskal-Wallis H testiyle incelenmiştir; fark ${sig(r.p, l)}${r.p < 0.05 ? "dır" : ""}, H(${r.df}) = ${f2(r.H)}, ${pApa(r.p)}, ε² = ${noZero(r.epsilonSquared)}.`
        : `A Kruskal-Wallis H test examined ${spec.dv} by ${spec.group}; the difference was ${sig(r.p, l)}, H(${r.df}) = ${f2(r.H)}, ${pApa(r.p)}, ε² = ${noZero(r.epsilonSquared)}.`;
      return { title: t.kw, table: tbl, text, notes, n: r.ns.reduce((a, b) => a + b, 0) };
    }

    case "correlation": {
      if (spec.vars.length < 2) throw new Error(L3(l, "En az 2 değişken seçin", "Select at least 2 variables", "Wählen Sie mindestens 2 Variablen"));
      const data = d.numeric(spec.vars);
      const colv = (j: number) => data.map((r) => r[j]);
      const fn = spec.method === "spearman" ? spearman : pearson;
      const rows2 = spec.vars.map((v, i) => [`${i + 1}. ${v}`, f2(describe(colv(i)).mean), f2(describe(colv(i)).sd), ...spec.vars.map((_, j) => (j < i ? `${noZero(fn(colv(i), colv(j)).r)}${stars(fn(colv(i), colv(j)).p)}` : j === i ? "—" : ""))]);
      const tbl = table([t.variable, t.mean, t.sd, ...spec.vars.map((_, j) => String(j + 1))], rows2);
      notes.push(l === "tr" ? `n = ${data.length}. *p < .05, **p < .01, ***p < .001.` : `n = ${data.length}. *p < .05, **p < .01, ***p < .001.`);
      const pairs: string[] = [];
      for (let i = 0; i < spec.vars.length; i++) for (let j = i + 1; j < spec.vars.length; j++) {
        const c = fn(colv(i), colv(j));
        pairs.push(`${spec.vars[i]} – ${spec.vars[j]}: r(${c.df}) = ${noZero(c.r)}, ${pApa(c.p)}`);
      }
      const text = l === "de"
        ? `Die Zusammenhänge zwischen den Variablen wurden mit ${spec.method === "spearman" ? "Spearman-Rangkorrelationen" : "Pearson-Korrelationen"} untersucht (Tabelle 1). ${pairs.join("; ")}.`
        : l === "tr"
        ? `Değişkenler arasındaki ilişkiler ${spec.method === "spearman" ? "Spearman sıra farkları" : "Pearson"} korelasyon analiziyle incelenmiştir (Tablo 1). ${pairs.join("; ")}.`
        : `Relationships among the variables were examined with ${spec.method === "spearman" ? "Spearman's rank-order" : "Pearson"} correlations (Table 1). ${pairs.join("; ")}.`;
      return { title: t.corr(spec.method), table: tbl, text, notes, n: data.length };
    }

    case "regression": {
      if (!spec.ivs.length) throw new Error(L3(l, "En az 1 yordayıcı seçin", "Select at least 1 predictor", "Wählen Sie mindestens 1 Prädiktor"));
      const data = d.numeric([spec.dv, ...spec.ivs]);
      const r = linearRegression(data.map((x) => x[0]), data.map((x) => x.slice(1)), spec.ivs);
      const tbl = table([t.predictor, "B", L3(l, "SH", "SE", "SE"), "β", "t", "p", L3(l, "%95 GA", "95% CI", "95 %-KI")], r.coefficients.map((c) => [c.name === "(Sabit)" && l !== "tr" ? L3(l, "(Sabit)", "(Constant)", "(Konstante)") : c.name, f2(c.b), f2(c.se), c.beta === null ? "" : noZero(c.beta), f2(c.t), pCell(c.p), `[${f2(c.ci[0])}, ${f2(c.ci[1])}]`]));
      notes.push(`R² = ${noZero(r.r2)}, ${L3(l, "düzeltilmiş", "adjusted", "korrigiertes")} R² = ${noZero(r.adjR2)}, F(${r.dfModel}, ${r.dfResidual}) = ${f2(r.F)}, ${pApa(r.p)}.`);
      const highVif = Object.entries(r.vif).filter(([, v]) => v >= 5);
      if (highVif.length) notes.push(l === "de" ? `Hinweis auf Multikollinearität (VIF ≥ 5): ${highVif.map(([k, v]) => `${k} (${f2(v)})`).join(", ")}.` : l === "tr" ? `Çoklu doğrusal bağlantı uyarısı (VIF ≥ 5): ${highVif.map(([k, v]) => `${k} (${f2(v)})`).join(", ")}.` : `Multicollinearity warning (VIF ≥ 5): ${highVif.map(([k, v]) => `${k} (${f2(v)})`).join(", ")}.`);
      const sigP = r.coefficients.slice(1).filter((c) => c.p < 0.05);
      const text = l === "de"
        ? `Mit einer multiplen linearen Regression wurde geprüft, ob ${spec.ivs.join(", ")} ${spec.dv} vorhersagen. Das Modell war ${sig(r.p, l)}, F(${r.dfModel}, ${r.dfResidual}) = ${f2(r.F)}, ${pApa(r.p)}, und erklärte ${f2(r.r2 * 100, 1)} % der Varianz (R² = ${noZero(r.r2)}). ${sigP.length ? `Signifikante Prädiktoren: ${sigP.map((c) => `${c.name} (β = ${noZero(c.beta ?? NaN)}, ${pApa(c.p)})`).join("; ")}.` : "Keiner der Prädiktoren war für sich genommen signifikant."}`
        : l === "tr"
        ? `${spec.ivs.join(", ")} değişken(ler)inin ${spec.dv} değişkenini yordama gücü çoklu doğrusal regresyon analiziyle incelenmiştir. Model istatistiksel olarak ${sig(r.p, l)}${r.p < 0.05 ? "dır" : ""}, F(${r.dfModel}, ${r.dfResidual}) = ${f2(r.F)}, ${pApa(r.p)}, ve varyansın %${f2(r.r2 * 100, 1)}’ini açıklamaktadır (R² = ${noZero(r.r2)}). ${sigP.length ? `Anlamlı yordayıcılar: ${sigP.map((c) => `${c.name} (β = ${noZero(c.beta ?? NaN)}, ${pApa(c.p)})`).join("; ")}.` : "Yordayıcıların hiçbiri tek başına anlamlı değildir."}`
        : `A multiple linear regression examined whether ${spec.ivs.join(", ")} predicted ${spec.dv}. The model was ${sig(r.p, l)}, F(${r.dfModel}, ${r.dfResidual}) = ${f2(r.F)}, ${pApa(r.p)}, explaining ${f2(r.r2 * 100, 1)}% of the variance (R² = ${noZero(r.r2)}). ${sigP.length ? `Significant predictors: ${sigP.map((c) => `${c.name} (β = ${noZero(c.beta ?? NaN)}, ${pApa(c.p)})`).join("; ")}.` : "No predictor was individually significant."}`;
      return { title: t.reg, table: tbl, text, notes, n: r.n };
    }

    case "chisquare": {
      const [xs, ys] = d.categorical(spec.a, spec.b);
      const r = chiSquareIndependence(xs, ys);
      const tbl = table([`${spec.a} \\ ${spec.b}`, ...r.cols, t.total], [
        ...r.rows.map((rw, i) => [rw, ...r.observed[i].map((v) => `${v} (%${f2((v / r.observed[i].reduce((a, b) => a + b, 0)) * 100, 1)})`), r.observed[i].reduce((a, b) => a + b, 0)]),
        [t.total, ...r.cols.map((_, j) => r.observed.reduce((a, row) => a + row[j], 0)), r.n],
      ]);
      if (r.lowExpectedShare > 0.2) notes.push(l === "de" ? `In ${f2(r.lowExpectedShare * 100, 0)} % der Zellen ist die erwartete Häufigkeit kleiner als 5; erwägen Sie den exakten Test nach Fisher oder das Zusammenfassen von Kategorien.` : l === "tr" ? `Gözelerin %${f2(r.lowExpectedShare * 100, 0)}’inde beklenen değer 5’ten küçüktür; ki-kare sonucu güvenilir olmayabilir (Fisher kesin testi veya kategori birleştirme düşünülmelidir).` : `${f2(r.lowExpectedShare * 100, 0)}% of cells have expected counts below 5; consider Fisher's exact test or merging categories.`);
      const text = l === "de"
        ? `Ein Chi-Quadrat-Unabhängigkeitstest prüfte den Zusammenhang zwischen ${spec.a} und ${spec.b}; er war ${sig(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Cramérs V = ${noZero(r.cramersV)}.`
        : l === "tr"
        ? `${spec.a} ile ${spec.b} arasındaki ilişki ki-kare bağımsızlık testiyle incelenmiş ve ilişki istatistiksel olarak ${sig(r.p, l)}${r.p < 0.05 ? "dır" : ""}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Cramér V = ${noZero(r.cramersV)}.`
        : `A chi-square test of independence examined the relationship between ${spec.a} and ${spec.b}; it was ${sig(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Cramér's V = ${noZero(r.cramersV)}.`;
      return { title: t.chisq, table: tbl, text, notes, n: r.n };
    }

    case "alpha": {
      const data = d.numeric(spec.items);
      const r = cronbachAlpha(data, spec.items);
      const tbl = table([t.item, t.mean, t.sd, t.itemTotal, t.alphaIf], r.items.map((it) => [it.name, f2(it.mean), f2(it.sd), noZero(it.itemTotal), noZero(it.alphaIfDeleted)]));
      const low = r.items.filter((it) => it.itemTotal < 0.3);
      if (low.length) notes.push(l === "de" ? `Items mit korrigierter Item-Skala-Korrelation unter .30: ${low.map((x) => x.name).join(", ")}.` : l === "tr" ? `Düzeltilmiş madde-toplam korelasyonu .30’un altında olan maddeler: ${low.map((x) => x.name).join(", ")}.` : `Items with corrected item-total correlation below .30: ${low.map((x) => x.name).join(", ")}.`);
      const scale = spec.scale || L3(l, "Ölçeğin", "The scale", "Die Skala");
      const text = l === "de"
        ? `${scale} zeigte in dieser Studie eine interne Konsistenz von Cronbachs α = ${noZero(r.alpha)} (k = ${r.k}, n = ${r.n}).`
        : l === "tr"
        ? `${scale} bu çalışmadaki iç tutarlılık katsayısı Cronbach α = ${noZero(r.alpha)} olarak hesaplanmıştır (k = ${r.k}, n = ${r.n}).`
        : `${scale} showed internal consistency of Cronbach's α = ${noZero(r.alpha)} in this study (k = ${r.k}, n = ${r.n}).`;
      return { title: t.alpha, table: tbl, text, notes, n: r.n };
    }
  }
}

/**
 * Belgeye eklenecek Markdown: tablo başlığı + tablo + not + sonuç paragrafı. Başlık, not etiketi ve metindeki tablo
 * göndermesi çalışmanın atıf stiline göre yazılır (D106; APA 7’de “**Tablo 1**” + italik başlık, IEEE’de “TABLO I” …).
 */
export function reportToMarkdown(r: AnalysisReport, tableNo: number, l: L = "tr", style = "apa7"): string {
  const caption = captionMarkdown(formatCaption(style, "table", tableNo, r.title, l));
  const nl = noteLabel(style, l);
  const note = r.notes.length ? `\n\n${nl.italic ? `*${nl.text}*` : nl.text} ${r.notes.join(" ")}` : "";
  return `${caption}\n\n${r.table}${note}\n\n${r.text.replace(/Tablo 1|Table 1|Tabelle 1/g, captionRef(style, "table", tableNo, l))}`;
}
