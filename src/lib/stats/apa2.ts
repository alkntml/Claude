/**
 * D224: ek analizlerin APA raporları (Wilcoxon, Friedman, Dunn notu, iki yönlü ANOVA, tekrarlı ölçümler ANOVA’sı,
 * lojistik regresyon). Tüm sayılar tests2.ts’ten gelir; yapay zekâ üretmez.
 */
import { f2, L3, noZero, pApa, pCell, sig, table, type L } from "./apa-util";
import type { AnalysisReport, DataTable } from "./apa";
import { pAdjust } from "./tests";
import { dunnTest, friedmanTest, logisticRegression, repeatedAnova, twoWayAnova, wilcoxonSignedRank } from "./tests2";

const T = {
  tr: { variable: "Değişken", median: "Medyan", meanRank: "Sıra ort.", measure: "Ölçüm", source: "Varyans kaynağı", error: "Hata", total: "Toplam", predictor: "Yordayıcı", mean: "Ort.", sd: "SS", group: "Grup" },
  en: { variable: "Variable", median: "Median", meanRank: "Mean rank", measure: "Measure", source: "Source", error: "Error", total: "Total", predictor: "Predictor", mean: "M", sd: "SD", group: "Group" },
  de: { variable: "Variable", median: "Median", meanRank: "Mittlerer Rang", measure: "Messung", source: "Varianzquelle", error: "Fehler", total: "Gesamt", predictor: "Prädiktor", mean: "M", sd: "SD", group: "Gruppe" },
} as const;
/** Odds oranı biçimi: çok küçük/büyük değerler 0,00 / sonsuz görünmesin */
const fo = (x: number) => (!Number.isFinite(x) ? "—" : x !== 0 && x < 0.001 ? x.toExponential(1) : x < 0.1 ? x.toFixed(3) : x >= 1000 ? x.toExponential(1) : f2(x));
const sfx = (p: number, l: L) => (l === "tr" && p < 0.05 ? "dır" : "");

export function reportWilcoxon(d: DataTable, a: string, b: string, l: L): AnalysisReport {
  const rows = d.numeric([a, b]);
  const r = wilcoxonSignedRank(rows.map((x) => x[0]), rows.map((x) => x[1]));
  const t = T[l];
  const tbl = table([t.variable, "n", t.median, "V", "z", "p", "r"], [
    [a, r.n, f2(r.median1), f2(r.V, 1), f2(r.z), pCell(r.p), noZero(r.r)],
    [b, r.n, f2(r.median2), "", "", "", ""],
  ]);
  const notes = [L3(l,
    `V, pozitif farkların sıra toplamıdır. ${r.exact ? "n < 50 ve bağ olmadığı için kesin p değeri" : "Bağ ya da sıfır fark bulunduğundan süreklilik düzeltmeli normal yaklaşım"} kullanıldı; ${r.zeros ? `${r.zeros} çiftte fark sıfır olduğu için hesaba katılmadı (etkin n = ${r.nPairs}). ` : ""}Etki büyüklüğü r = |z| / √n.`,
    `V is the sum of ranks of the positive differences. ${r.exact ? "An exact p value was used (n < 50, no ties)" : "The normal approximation with continuity correction was used because of ties or zero differences"}; ${r.zeros ? `${r.zeros} pair(s) with zero difference were dropped (effective n = ${r.nPairs}). ` : ""}Effect size r = |z| / √n.`,
    `V ist die Rangsumme der positiven Differenzen. ${r.exact ? "Es wurde der exakte p-Wert verwendet (n < 50, keine Bindungen)" : "Wegen Bindungen oder Nulldifferenzen wurde die Normalapproximation mit Stetigkeitskorrektur verwendet"}; ${r.zeros ? `${r.zeros} Paar(e) mit Differenz null wurden ausgelassen (effektives n = ${r.nPairs}). ` : ""}Effektstärke r = |z| / √n.`)];
  const text = L3(l,
    `${a} ve ${b} ölçümleri arasındaki fark Wilcoxon işaretli sıralar testiyle incelenmiştir. ${a} (Mdn = ${f2(r.median1)}) ile ${b} (Mdn = ${f2(r.median2)}) arasındaki fark istatistiksel olarak ${sig(r.p, l)}${sfx(r.p, l)}, V = ${f2(r.V, 1)}, z = ${f2(r.z)}, ${pApa(r.p)}, r = ${noZero(r.r)}.`,
    `A Wilcoxon signed-rank test compared ${a} (Mdn = ${f2(r.median1)}) and ${b} (Mdn = ${f2(r.median2)}); the difference was ${sig(r.p, l)}, V = ${f2(r.V, 1)}, z = ${f2(r.z)}, ${pApa(r.p)}, r = ${noZero(r.r)}.`,
    `Ein Wilcoxon-Vorzeichen-Rang-Test verglich ${a} (Mdn = ${f2(r.median1)}) und ${b} (Mdn = ${f2(r.median2)}); der Unterschied war ${sig(r.p, l)}, V = ${f2(r.V, 1)}, z = ${f2(r.z)}, ${pApa(r.p)}, r = ${noZero(r.r)}.`);
  return { title: L3(l, "Wilcoxon işaretli sıralar testi sonuçları", "Wilcoxon signed-rank test results", "Ergebnisse des Wilcoxon-Vorzeichen-Rang-Tests"), table: tbl, text, notes, n: r.n };
}

export function reportFriedman(d: DataTable, vars: string[], l: L): AnalysisReport {
  if (vars.length < 3) throw new Error(L3(l, "Friedman testi için en az 3 ölçüm seçin", "Select at least 3 measures", "Wählen Sie mindestens 3 Messungen"));
  const rows = d.numeric(vars);
  const r = friedmanTest(rows);
  const t = T[l];
  const tbl = table([t.measure, "n", t.median, t.meanRank], vars.map((v, j) => [v, r.n, f2(r.medians[j]), f2(r.meanRanks[j])]));
  const notes: string[] = [L3(l, `Kendall W = ${noZero(r.kendallW)} (uyum katsayısı: 0 = hiç uyum yok, 1 = tam uyum).`, `Kendall’s W = ${noZero(r.kendallW)} (coefficient of concordance: 0 = none, 1 = complete).`, `Kendalls W = ${noZero(r.kendallW)} (Konkordanzkoeffizient: 0 = keine, 1 = vollständige Übereinstimmung).`)];
  if (r.p < 0.05) {
    const pairs: { a: string; b: string; p: number; r: number }[] = [];
    for (let i = 0; i < vars.length; i++) for (let j = i + 1; j < vars.length; j++) { const w = wilcoxonSignedRank(rows.map((x) => x[i]), rows.map((x) => x[j])); pairs.push({ a: vars[i], b: vars[j], p: w.p, r: w.r }); }
    const adj = pAdjust(pairs.map((x) => x.p), "holm");
    const sg = pairs.map((x, i) => ({ ...x, pa: adj[i] })).filter((x) => x.pa < 0.05);
    notes.push(L3(l, `Holm düzeltmeli Wilcoxon ikili karşılaştırmaları: ${sg.length ? sg.map((x) => `${x.a} – ${x.b} (${pApa(x.pa)}, r = ${noZero(x.r)})`).join("; ") : "anlamlı ikili fark bulunmadı"}.`, `Holm-adjusted Wilcoxon pairwise comparisons: ${sg.length ? sg.map((x) => `${x.a} – ${x.b} (${pApa(x.pa)}, r = ${noZero(x.r)})`).join("; ") : "no significant pairwise differences"}.`, `Holm-korrigierte Wilcoxon-Paarvergleiche: ${sg.length ? sg.map((x) => `${x.a} – ${x.b} (${pApa(x.pa)}, r = ${noZero(x.r)})`).join("; ") : "keine signifikanten Paarunterschiede"}.`));
  }
  const text = L3(l,
    `${vars.join(", ")} ölçümleri arasındaki fark Friedman testiyle incelenmiştir; fark istatistiksel olarak ${sig(r.p, l)}${sfx(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Kendall W = ${noZero(r.kendallW)}.`,
    `A Friedman test compared ${vars.join(", ")}; the difference was ${sig(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Kendall’s W = ${noZero(r.kendallW)}.`,
    `Ein Friedman-Test verglich ${vars.join(", ")}; der Unterschied war ${sig(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Kendalls W = ${noZero(r.kendallW)}.`);
  return { title: L3(l, "Friedman testi sonuçları", "Friedman test results", "Ergebnisse des Friedman-Tests"), table: tbl, text, notes, n: r.n };
}

/** Kruskal–Wallis anlamlıysa Dunn (Holm düzeltmeli) ikili karşılaştırma notu */
export function dunnNote(groups: number[][], labels: string[], l: L): string {
  const rows = dunnTest(groups, labels, "holm").filter((x) => x.pAdj < 0.05);
  return L3(l,
    `Dunn çoklu karşılaştırmaları (Holm düzeltmeli): ${rows.length ? rows.map((x) => `${x.a} – ${x.b} (z = ${f2(x.z)}, ${pApa(x.pAdj)})`).join("; ") : "anlamlı ikili fark bulunmadı"}.`,
    `Dunn post hoc comparisons (Holm-adjusted): ${rows.length ? rows.map((x) => `${x.a} – ${x.b} (z = ${f2(x.z)}, ${pApa(x.pAdj)})`).join("; ") : "no significant pairwise differences"}.`,
    `Dunn-Post-hoc-Vergleiche (Holm-korrigiert): ${rows.length ? rows.map((x) => `${x.a} – ${x.b} (z = ${f2(x.z)}, ${pApa(x.pAdj)})`).join("; ") : "keine signifikanten Paarunterschiede"}.`);
}

export function reportAnova2(d: DataTable, dv: string, fa: string, fb: string, l: L): AnalysisReport {
  const di = d.col(dv), ai = d.col(fa), bi = d.col(fb);
  const y: number[] = [], A: string[] = [], B: string[] = [];
  for (const r of d.body) {
    const v = d.num(di, String(r[di] ?? "")), a = String(r[ai] ?? "").trim(), b = String(r[bi] ?? "").trim();
    if (Number.isFinite(v) && a && b) { y.push(v); A.push(a); B.push(b); }
  }
  if (fa === fb) throw new Error(L3(l, "İki farklı faktör seçin", "Select two different factors", "Wählen Sie zwei verschiedene Faktoren"));
  const r = twoWayAnova(y, A, B, fa, fb);
  const t = T[l];
  const desc = table([fa, fb, "n", t.mean, t.sd], r.cells.map((c) => [c.a, c.b, c.n, f2(c.mean), f2(c.sd)]));
  const anova = table([t.source, L3(l, "KT", "SS", "QS"), L3(l, "sd", "df", "df"), L3(l, "KO", "MS", "MQS"), "F", "p", "ηp²"], [
    ...r.terms.map((x) => [x.name, f2(x.ss), x.df, f2(x.ms), f2(x.F), pCell(x.p), noZero(x.partialEta2)]),
    [t.error, f2(r.error.ss), r.error.df, f2(r.error.ms), "", "", ""],
    [t.total, f2(r.total.ss), r.total.df, "", "", "", ""],
  ]);
  const notes = [L3(l,
    `Kareler toplamı Tip III’tür (SPSS ve car::Anova ile aynı); ${r.balanced ? "hücre büyüklükleri eşittir" : "hücre büyüklükleri eşit değildir, bu yüzden Tip III kullanılması önemlidir"}. ηp² = kısmi eta kare. Levene testi: F(${r.levene.df1}, ${r.levene.df2}) = ${f2(r.levene.F)}, ${pApa(r.levene.p)}.`,
    `Sums of squares are Type III (as in SPSS and car::Anova); ${r.balanced ? "cell sizes are equal" : "cell sizes are unequal, so using Type III matters"}. ηp² = partial eta squared. Levene’s test: F(${r.levene.df1}, ${r.levene.df2}) = ${f2(r.levene.F)}, ${pApa(r.levene.p)}.`,
    `Die Quadratsummen sind Typ III (wie in SPSS und car::Anova); ${r.balanced ? "die Zellgrößen sind gleich" : "die Zellgrößen sind ungleich, daher ist Typ III wichtig"}. ηp² = partielles Eta-Quadrat. Levene-Test: F(${r.levene.df1}, ${r.levene.df2}) = ${f2(r.levene.F)}, ${pApa(r.levene.p)}.`)];
  const inter = r.terms[2];
  if (inter.p < 0.05) notes.push(L3(l, "Etkileşim anlamlı olduğu için ana etkiler tek başına yorumlanmamalı; basit ana etkilere (bir faktörün düzeylerinde diğerinin etkisine) bakın.", "Because the interaction is significant, main effects should not be interpreted alone; examine simple main effects.", "Da die Interaktion signifikant ist, sollten Haupteffekte nicht isoliert interpretiert werden; prüfen Sie einfache Haupteffekte."));
  const part = (x: (typeof r.terms)[number]) => `F(${x.df}, ${r.error.df}) = ${f2(x.F)}, ${pApa(x.p)}, ηp² = ${noZero(x.partialEta2)}`;
  const [ta, tb] = r.terms;
  const text = L3(l,
    `${dv} puanları üzerinde ${fa} ve ${fb} faktörlerinin etkisi iki yönlü varyans analiziyle incelenmiştir. ${fa} ana etkisi ${sig(ta.p, l)}${sfx(ta.p, l)}, ${part(ta)}; ${fb} ana etkisi ${sig(tb.p, l)}${sfx(tb.p, l)}, ${part(tb)}; ${fa} × ${fb} etkileşimi ${sig(inter.p, l)}${sfx(inter.p, l)}, ${part(inter)}.`,
    `A two-way ANOVA examined the effects of ${fa} and ${fb} on ${dv}. The main effect of ${fa} was ${sig(ta.p, l)}, ${part(ta)}; the main effect of ${fb} was ${sig(tb.p, l)}, ${part(tb)}; the ${fa} × ${fb} interaction was ${sig(inter.p, l)}, ${part(inter)}.`,
    `Eine zweifaktorielle Varianzanalyse prüfte die Effekte von ${fa} und ${fb} auf ${dv}. Der Haupteffekt von ${fa} war ${sig(ta.p, l)}, ${part(ta)}; der Haupteffekt von ${fb} war ${sig(tb.p, l)}, ${part(tb)}; die Interaktion ${fa} × ${fb} war ${sig(inter.p, l)}, ${part(inter)}.`);
  return { title: L3(l, "İki yönlü varyans analizi (ANOVA) sonuçları", "Two-way analysis of variance (ANOVA) results", "Ergebnisse der zweifaktoriellen Varianzanalyse (ANOVA)"), table: `${desc}\n\n${anova}`, text, notes, n: r.n };
}

export function reportRm(d: DataTable, vars: string[], l: L): AnalysisReport {
  if (vars.length < 2) throw new Error(L3(l, "En az 2 ölçüm seçin", "Select at least 2 measures", "Wählen Sie mindestens 2 Messungen"));
  const rows = d.numeric(vars);
  const r = repeatedAnova(rows);
  const t = T[l];
  const desc = table([t.measure, "n", t.mean, t.sd], vars.map((v, j) => [v, r.n, f2(r.means[j]), f2(r.sds[j])]));
  const useGG = !!r.mauchly && r.mauchly.p < 0.05;
  const e = useGG ? r.epsGG : 1, pc = useGG ? r.pGG : r.p, dfc = r.dfCond * e, dfe = r.dfErr * e;
  const dfs = (x: number) => (Number.isInteger(x) ? String(x) : f2(x));
  const anova = table([t.source, L3(l, "KT", "SS", "QS"), L3(l, "sd", "df", "df"), L3(l, "KO", "MS", "MQS"), "F", "p", "ηp²"], [
    [useGG ? L3(l, "Ölçüm (GG düzeltmeli)", "Measure (GG-corrected)", "Messung (GG-korrigiert)") : t.measure, f2(r.ssCond), dfs(dfc), f2(r.ssCond / dfc), f2(r.F), pCell(pc), noZero(r.partialEta2)],
    [t.error, f2(r.ssErr), dfs(dfe), f2(r.ssErr / dfe), "", "", ""],
  ]);
  const notes: string[] = [];
  if (r.mauchly) notes.push(L3(l,
    `Mauchly küresellik testi: W = ${noZero(r.mauchly.W, 3)}, χ²(${r.mauchly.df}) = ${f2(r.mauchly.chi2)}, ${pApa(r.mauchly.p)}. Greenhouse–Geisser ε = ${noZero(r.epsGG, 3)}, Huynh–Feldt ε = ${noZero(r.epsHF, 3)}. ${useGG ? "Küresellik sağlanmadığı için Greenhouse–Geisser düzeltmeli sonuçlar raporlanmıştır." : "Küresellik sağlandığından düzeltmesiz sonuçlar raporlanmıştır."}`,
    `Mauchly’s test of sphericity: W = ${noZero(r.mauchly.W, 3)}, χ²(${r.mauchly.df}) = ${f2(r.mauchly.chi2)}, ${pApa(r.mauchly.p)}. Greenhouse–Geisser ε = ${noZero(r.epsGG, 3)}, Huynh–Feldt ε = ${noZero(r.epsHF, 3)}. ${useGG ? "Sphericity was violated, so Greenhouse–Geisser-corrected results are reported." : "Sphericity held, so uncorrected results are reported."}`,
    `Mauchly-Test auf Sphärizität: W = ${noZero(r.mauchly.W, 3)}, χ²(${r.mauchly.df}) = ${f2(r.mauchly.chi2)}, ${pApa(r.mauchly.p)}. Greenhouse-Geisser ε = ${noZero(r.epsGG, 3)}, Huynh-Feldt ε = ${noZero(r.epsHF, 3)}. ${useGG ? "Die Sphärizität war verletzt; berichtet werden Greenhouse-Geisser-korrigierte Ergebnisse." : "Die Sphärizität war gegeben; berichtet werden unkorrigierte Ergebnisse."}`));
  else notes.push(L3(l, "İki ölçümde küresellik varsayımı kendiliğinden sağlanır (düzeltme gerekmez).", "With two measures sphericity holds automatically (no correction needed).", "Bei zwei Messungen ist die Sphärizität automatisch gegeben (keine Korrektur nötig)."));
  if (pc < 0.05 && vars.length > 2) {
    const sg = r.pairwise.filter((x) => x.pHolm < 0.05);
    notes.push(L3(l, `Holm düzeltmeli eşleştirilmiş t karşılaştırmaları: ${sg.length ? sg.map((x) => `${vars[x.a]} – ${vars[x.b]} (fark = ${f2(x.diff)}, t(${x.df}) = ${f2(x.t)}, ${pApa(x.pHolm)})`).join("; ") : "anlamlı ikili fark bulunmadı"}.`, `Holm-adjusted paired t comparisons: ${sg.length ? sg.map((x) => `${vars[x.a]} – ${vars[x.b]} (diff = ${f2(x.diff)}, t(${x.df}) = ${f2(x.t)}, ${pApa(x.pHolm)})`).join("; ") : "no significant pairwise differences"}.`, `Holm-korrigierte t-Tests für abhängige Stichproben: ${sg.length ? sg.map((x) => `${vars[x.a]} – ${vars[x.b]} (Differenz = ${f2(x.diff)}, t(${x.df}) = ${f2(x.t)}, ${pApa(x.pHolm)})`).join("; ") : "keine signifikanten Paarunterschiede"}.`));
  }
  const text = L3(l,
    `${vars.join(", ")} ölçümleri arasındaki fark tekrarlı ölçümler için tek yönlü varyans analiziyle incelenmiştir; fark istatistiksel olarak ${sig(pc, l)}${sfx(pc, l)}, F(${dfs(dfc)}, ${dfs(dfe)}) = ${f2(r.F)}, ${pApa(pc)}, ηp² = ${noZero(r.partialEta2)}.`,
    `A repeated-measures one-way ANOVA compared ${vars.join(", ")}; the difference was ${sig(pc, l)}, F(${dfs(dfc)}, ${dfs(dfe)}) = ${f2(r.F)}, ${pApa(pc)}, ηp² = ${noZero(r.partialEta2)}.`,
    `Eine einfaktorielle Varianzanalyse mit Messwiederholung verglich ${vars.join(", ")}; der Unterschied war ${sig(pc, l)}, F(${dfs(dfc)}, ${dfs(dfe)}) = ${f2(r.F)}, ${pApa(pc)}, ηp² = ${noZero(r.partialEta2)}.`);
  return { title: L3(l, "Tekrarlı ölçümler için tek yönlü ANOVA sonuçları", "Repeated-measures one-way ANOVA results", "Ergebnisse der einfaktoriellen ANOVA mit Messwiederholung"), table: `${desc}\n\n${anova}`, text, notes, n: r.n };
}

export function reportLogistic(d: DataTable, dv: string, ivs: string[], l: L): AnalysisReport {
  if (!ivs.length) throw new Error(L3(l, "En az 1 yordayıcı seçin", "Select at least 1 predictor", "Wählen Sie mindestens 1 Prädiktor"));
  const di = d.col(dv), idx = ivs.map((v) => d.col(v));
  const rawY: string[] = [], X: number[][] = [];
  for (const r of d.body) {
    const yv = String(r[di] ?? "").trim();
    const xs = idx.map((i) => d.num(i, String(r[i] ?? "")));
    if (yv && xs.every((x) => Number.isFinite(x))) { rawY.push(yv); X.push(xs); }
  }
  const lv = [...new Set(rawY)].sort((a, b) => (Number.isFinite(+a) && Number.isFinite(+b) ? +a - +b : a.localeCompare(b, "tr")));
  if (lv.length !== 2) throw new Error(L3(l, `Bağımlı değişkenin tam 2 kategorisi olmalı (şu an ${lv.length}: ${lv.slice(0, 6).join(", ")})`, `The dependent variable must have exactly 2 categories (found ${lv.length})`, `Die abhängige Variable muss genau 2 Kategorien haben (gefunden ${lv.length})`));
  const y = rawY.map((v) => (v === lv[1] ? 1 : 0));
  const r = logisticRegression(y, X, ivs);
  const t = T[l];
  const tbl = table([t.predictor, "B", L3(l, "SH", "SE", "SE"), "Wald z", "p", "OR", L3(l, "OR %95 GA", "OR 95% CI", "OR 95 %-KI")], r.coefficients.map((c) => [c.name === "(Sabit)" ? L3(l, "(Sabit)", "(Constant)", "(Konstante)") : c.name, f2(c.b), f2(c.se), f2(c.z), pCell(c.p), c.name === "(Sabit)" ? "" : fo(c.or), c.name === "(Sabit)" ? "" : `[${fo(c.orCi[0])}, ${fo(c.orCi[1])}]`]));
  const notes = [
    L3(l, `Bağımlı değişken: “${lv[1]}” olay (1), “${lv[0]}” referans (0). Olay sayısı = ${r.events}/${r.n}.`, `Dependent variable: “${lv[1]}” is the event (1), “${lv[0]}” the reference (0). Events = ${r.events}/${r.n}.`, `Abhängige Variable: „${lv[1]}“ ist das Ereignis (1), „${lv[0]}“ die Referenz (0). Ereignisse = ${r.events}/${r.n}.`),
    L3(l, `Model χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}. Nagelkerke R² = ${noZero(r.nagelkerke)}, Cox ve Snell R² = ${noZero(r.coxSnell)}, McFadden R² = ${noZero(r.mcFadden)}.`, `Model χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}. Nagelkerke R² = ${noZero(r.nagelkerke)}, Cox & Snell R² = ${noZero(r.coxSnell)}, McFadden R² = ${noZero(r.mcFadden)}.`, `Modell-χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}. Nagelkerkes R² = ${noZero(r.nagelkerke)}, Cox & Snell R² = ${noZero(r.coxSnell)}, McFadden R² = ${noZero(r.mcFadden)}.`),
    L3(l, `Sınıflama (kesme noktası .50): doğruluk %${f2(r.accuracy * 100, 1)}, duyarlılık %${f2(r.sensitivity * 100, 1)}, özgüllük %${f2(r.specificity * 100, 1)}; ROC eğrisi altındaki alan (AUC) = ${noZero(r.auc)}. Güven aralıkları Wald yöntemiyledir.`, `Classification (cut-off .50): accuracy ${f2(r.accuracy * 100, 1)}%, sensitivity ${f2(r.sensitivity * 100, 1)}%, specificity ${f2(r.specificity * 100, 1)}%; area under the ROC curve (AUC) = ${noZero(r.auc)}. Confidence intervals are Wald intervals.`, `Klassifikation (Schwelle .50): Genauigkeit ${f2(r.accuracy * 100, 1)} %, Sensitivität ${f2(r.sensitivity * 100, 1)} %, Spezifität ${f2(r.specificity * 100, 1)} %; Fläche unter der ROC-Kurve (AUC) = ${noZero(r.auc)}. Konfidenzintervalle nach Wald.`),
  ];
  if (Math.min(r.events, r.n - r.events) < 10 * r.k) notes.push(L3(l, `Uyarı: az görülen kategoride yordayıcı başına 10’dan az olay var (${Math.min(r.events, r.n - r.events)} olay, ${r.k} yordayıcı); tahminler kararsız olabilir.`, `Warning: fewer than 10 events per predictor in the rarer category (${Math.min(r.events, r.n - r.events)} events, ${r.k} predictors); estimates may be unstable.`, `Hinweis: In der selteneren Kategorie gibt es weniger als 10 Ereignisse pro Prädiktor (${Math.min(r.events, r.n - r.events)} Ereignisse, ${r.k} Prädiktoren); die Schätzungen können instabil sein.`));
  const sg = r.coefficients.slice(1).filter((c) => c.p < 0.05);
  const text = L3(l,
    `${ivs.join(", ")} değişken(ler)inin ${dv} (${lv[1]}) olasılığını yordaması ikili lojistik regresyonla incelenmiştir. Model istatistiksel olarak ${sig(r.p, l)}${sfx(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Nagelkerke R² = ${noZero(r.nagelkerke)}. ${sg.length ? `Anlamlı yordayıcılar: ${sg.map((c) => `${c.name} (OR = ${fo(c.or)}, %95 GA [${fo(c.orCi[0])}, ${fo(c.orCi[1])}], ${pApa(c.p)})`).join("; ")}.` : "Hiçbir yordayıcı anlamlı değildir."}`,
    `A binary logistic regression examined whether ${ivs.join(", ")} predicted ${dv} (${lv[1]}). The model was ${sig(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Nagelkerke R² = ${noZero(r.nagelkerke)}. ${sg.length ? `Significant predictors: ${sg.map((c) => `${c.name} (OR = ${fo(c.or)}, 95% CI [${fo(c.orCi[0])}, ${fo(c.orCi[1])}], ${pApa(c.p)})`).join("; ")}.` : "No predictor was significant."}`,
    `Eine binäre logistische Regression prüfte, ob ${ivs.join(", ")} ${dv} (${lv[1]}) vorhersagen. Das Modell war ${sig(r.p, l)}, χ²(${r.df}, N = ${r.n}) = ${f2(r.chi2)}, ${pApa(r.p)}, Nagelkerkes R² = ${noZero(r.nagelkerke)}. ${sg.length ? `Signifikante Prädiktoren: ${sg.map((c) => `${c.name} (OR = ${fo(c.or)}, 95 %-KI [${fo(c.orCi[0])}, ${fo(c.orCi[1])}], ${pApa(c.p)})`).join("; ")}.` : "Kein Prädiktor war signifikant."}`);
  return { title: L3(l, "İkili lojistik regresyon sonuçları", "Binary logistic regression results", "Ergebnisse der binären logistischen Regression"), table: tbl, text, notes, n: r.n };
}
