/**
 * D224: meta-analiz çıktıları — orman grafiği, huni grafiği (SVG; belgeye PNG olarak eklenir), yöntem cümlesi ve sonuç
 * metni (Markdown). Sayılar meta.ts’ten gelir; yapay zekâ yazmaz.
 */
import type { MetaModel, MetaResult, MetaType } from "@/lib/meta";

type Lang = "tr" | "en" | "de";
const L3 = (l: Lang, tr: string, en: string, de: string) => (l === "tr" ? tr : l === "de" ? de : en);
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
const dec = (x: number, l: Lang, d = 2) => { const v = Number.isFinite(x) ? x.toFixed(d) : "—"; return l === "en" ? v : v.replace(".", ","); };
const pTxt = (p: number, l: Lang) => { const sep = l === "en" ? "." : ","; return p < 0.001 ? `p < ${sep}001` : `p = ${p.toFixed(3).replace(/^0/, "").replace(".", sep)}`; };

export const META_TYPE_LABEL: Record<MetaType, { tr: string; en: string; de: string }> = {
  smd: { tr: "Hedges g (ortalama, SS ve n’den)", en: "Hedges’ g (from mean, SD and n)", de: "Hedges’ g (aus Mittelwert, SD und n)" },
  r: { tr: "Korelasyon r (Fisher z ile)", en: "Correlation r (via Fisher z)", de: "Korrelation r (über Fisher-z)" },
  or: { tr: "Odds oranı (olay sayılarından)", en: "Odds ratio (from event counts)", de: "Odds Ratio (aus Ereigniszahlen)" },
  generic: { tr: "Genel etki ve standart hata", en: "Generic effect and standard error", de: "Allgemeiner Effekt und Standardfehler" },
};
export const META_FIELD_LABEL: Record<string, { tr: string; en: string; de: string }> = {
  n1: { tr: "n (grup 1)", en: "n (group 1)", de: "n (Gruppe 1)" }, m1: { tr: "Ort. (grup 1)", en: "Mean (group 1)", de: "M (Gruppe 1)" }, sd1: { tr: "SS (grup 1)", en: "SD (group 1)", de: "SD (Gruppe 1)" },
  n2: { tr: "n (grup 2)", en: "n (group 2)", de: "n (Gruppe 2)" }, m2: { tr: "Ort. (grup 2)", en: "Mean (group 2)", de: "M (Gruppe 2)" }, sd2: { tr: "SS (grup 2)", en: "SD (group 2)", de: "SD (Gruppe 2)" },
  r: { tr: "r", en: "r", de: "r" }, n: { tr: "n", en: "n", de: "n" },
  e1: { tr: "Olay (grup 1)", en: "Events (group 1)", de: "Ereignisse (Gruppe 1)" }, e2: { tr: "Olay (grup 2)", en: "Events (group 2)", de: "Ereignisse (Gruppe 2)" },
  yi: { tr: "Etki (yi)", en: "Effect (yi)", de: "Effekt (yi)" }, sei: { tr: "Standart hata", en: "Standard error", de: "Standardfehler" },
};

/** Gösterim ölçeğindeki (OR, r, g) değerden etki ölçeğine (ln OR, z, g) */
const toEffect = (type: MetaType, x: number) => (type === "or" ? Math.log(x) : type === "r" ? Math.atanh(x) : x);

function niceTicks(res: MetaResult, lo: number, hi: number): number[] {
  const t = res.type;
  let disp: number[];
  if (t === "or") disp = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];
  else if (t === "r") disp = [-0.9, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 0.9];
  else {
    const span = hi - lo, raw = span / 5, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
    disp = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) disp.push(Math.round(v / step) * step);
  }
  const inRange = disp.filter((v) => { const e = toEffect(t, v); return e >= lo - 1e-9 && e <= hi + 1e-9; });
  return inRange.length >= 2 ? inRange : [res.back(lo), res.back(hi)];
}
const tickLabel = (v: number, type: MetaType) => (type === "or" ? String(v) : Math.abs(v) < 1e-9 ? "0" : String(Math.round(v * 100) / 100));

/** Orman grafiği (SVG): çalışma etkileri ve %95 GA, ağırlığa göre kare, birleşik etki baklavası */
export function forestSvg(res: MetaResult, l: Lang): { svg: string; width: number; height: number } {
  const W = 820, rowH = 24, top = 52, labelW = 210, plotX = labelW + 14, plotW = 300, effX = plotX + plotW + 24, wtX = W - 28;
  const rows = res.studies.length, pooledRows = 2, H = top + rows * rowH + 18 + pooledRows * rowH + 78;
  const all = [...res.studies.flatMap((s) => s.ci), ...res.fixed.ci, ...res.random.ci, res.nullValue === 1 ? 0 : 0];
  let lo = Math.min(...all), hi = Math.max(...all); const pad = (hi - lo) * 0.06 || 0.5; lo -= pad; hi += pad;
  if (res.type === "r") { lo = Math.max(lo, Math.atanh(-0.995)); hi = Math.min(hi, Math.atanh(0.995)); }
  const X = (e: number) => plotX + ((Math.min(Math.max(e, lo), hi) - lo) / (hi - lo)) * plotW;
  const ink = "#1f2937", mute = "#6b7280", brand = "#4338ca", grid = "#e5e7eb";
  const f = (e: number) => dec(res.back(e), l);
  const T: string[] = [];
  T.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  T.push(`<text x="10" y="30" font-size="12.5" font-weight="600" fill="${ink}">${esc(L3(l, "Çalışma", "Study", "Studie"))}</text>`);
  T.push(`<text x="${effX}" y="30" font-size="12.5" font-weight="600" fill="${ink}">${esc(res.effectName === "etki" ? L3(l, "Etki", "Effect", "Effekt") : res.effectName)} [${L3(l, "%95 GA", "95% CI", "95 %-KI")}]</text>`);
  T.push(`<text x="${wtX}" y="30" font-size="12.5" font-weight="600" fill="${ink}" text-anchor="end">${esc(L3(l, "Ağırlık", "Weight", "Gewicht"))}</text>`);
  const axisY = top + rows * rowH + 8;
  for (const v of niceTicks(res, lo, hi)) { const x = X(toEffect(res.type, v)); T.push(`<line x1="${x}" x2="${x}" y1="${top - 6}" y2="${axisY + pooledRows * rowH + 8}" stroke="${grid}"/>`); T.push(`<text x="${x}" y="${axisY + pooledRows * rowH + 24}" font-size="11" fill="${mute}" text-anchor="middle">${tickLabel(v, res.type)}</text>`); }
  const nx = X(toEffect(res.type, res.nullValue)); T.push(`<line x1="${nx}" x2="${nx}" y1="${top - 6}" y2="${axisY + pooledRows * rowH + 8}" stroke="${ink}" stroke-width="1.2"/>`);
  const maxW = Math.max(...res.studies.map((s) => s.wPct));
  res.studies.forEach((s, i) => {
    const y = top + i * rowH + rowH / 2, half = 3 + 6 * Math.sqrt(s.wPct / maxW);
    T.push(`<text x="10" y="${y + 4}" font-size="12" fill="${ink}">${esc(s.label.length > 30 ? s.label.slice(0, 29) + "…" : s.label)}</text>`);
    T.push(`<line x1="${X(s.ci[0])}" x2="${X(s.ci[1])}" y1="${y}" y2="${y}" stroke="${ink}" stroke-width="1.3"/>`);
    T.push(`<rect x="${X(s.yi) - half}" y="${y - half}" width="${2 * half}" height="${2 * half}" fill="${brand}"/>`);
    T.push(`<text x="${effX}" y="${y + 4}" font-size="12" fill="${ink}">${f(s.yi)} [${f(s.ci[0])}, ${f(s.ci[1])}]</text>`);
    T.push(`<text x="${wtX}" y="${y + 4}" font-size="12" fill="${ink}" text-anchor="end">${dec(s.wPct, l, 1)}%</text>`);
  });
  const diamond = (p: MetaResult["random"], idx: number, label: string, bold: boolean) => {
    const y = axisY + idx * rowH + rowH / 2 + 4;
    T.push(`<text x="10" y="${y + 4}" font-size="12" ${bold ? 'font-weight="700"' : ""} fill="${ink}">${esc(label)}</text>`);
    T.push(`<polygon points="${X(p.ci[0])},${y} ${X(p.est)},${y - 8} ${X(p.ci[1])},${y} ${X(p.est)},${y + 8}" fill="${bold ? brand : "#a5b4fc"}" stroke="${brand}"/>`);
    T.push(`<text x="${effX}" y="${y + 4}" font-size="12" ${bold ? 'font-weight="700"' : ""} fill="${ink}">${f(p.est)} [${f(p.ci[0])}, ${f(p.ci[1])}]</text>`);
  };
  diamond(res.random, 0, L3(l, "Rastgele etkiler", "Random effects", "Zufallseffekte"), res.model === "random");
  diamond(res.fixed, 1, L3(l, "Sabit etki", "Fixed effect", "Fester Effekt"), res.model === "fixed");
  const hy = axisY + pooledRows * rowH + 50;
  T.push(`<text x="10" y="${hy}" font-size="11.5" fill="${mute}">${esc(heterogeneityText(res, l))}</text>`);
  T.push(`<text x="${nx}" y="${axisY + pooledRows * rowH + 40}" font-size="10.5" fill="${mute}" text-anchor="middle">${esc(res.type === "or" ? L3(l, "OR (log ölçeği)", "OR (log scale)", "OR (Log-Skala)") : res.effectName)}</text>`);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Inter, Arial, sans-serif">${T.join("")}</svg>`, width: W, height: H };
}

/** Huni grafiği (SVG): etki ve standart hata; birleşik etki çizgisi ve sözde %95 sınırları */
export function funnelSvg(res: MetaResult, l: Lang): { svg: string; width: number; height: number } {
  const W = 560, H = 420, L = 64, R = 24, T0 = 28, B = 64, pw = W - L - R, ph = H - T0 - B;
  const maxSe = Math.max(...res.studies.map((s) => s.sei)) * 1.1;
  const ext = Math.max(...res.studies.map((s) => Math.abs(s.yi - res.pooled.est)), 1.96 * maxSe) * 1.08;
  const lo = res.pooled.est - ext, hi = res.pooled.est + ext;
  const X = (e: number) => L + ((e - lo) / (hi - lo)) * pw, Y = (se: number) => T0 + (se / maxSe) * ph;
  const ink = "#1f2937", mute = "#6b7280", brand = "#4338ca", grid = "#e5e7eb";
  const T: string[] = [`<rect width="${W}" height="${H}" fill="#ffffff"/>`];
  for (const v of niceTicks(res, lo, hi)) { const x = X(toEffect(res.type, v)); if (x >= L && x <= L + pw) { T.push(`<line x1="${x}" x2="${x}" y1="${T0}" y2="${T0 + ph}" stroke="${grid}"/><text x="${x}" y="${T0 + ph + 18}" font-size="11" fill="${mute}" text-anchor="middle">${tickLabel(v, res.type)}</text>`); } }
  for (let i = 0; i <= 4; i++) { const se = (maxSe * i) / 4, y = Y(se); T.push(`<line x1="${L}" x2="${L + pw}" y1="${y}" y2="${y}" stroke="${grid}"/><text x="${L - 8}" y="${y + 4}" font-size="11" fill="${mute}" text-anchor="end">${dec(se, l, 2)}</text>`); }
  const c = res.pooled.est;
  T.push(`<polygon points="${X(c)},${T0} ${X(c - 1.96 * maxSe)},${T0 + ph} ${X(c + 1.96 * maxSe)},${T0 + ph}" fill="#eef2ff" stroke="${brand}" stroke-dasharray="4 3" opacity="0.8"/>`);
  T.push(`<line x1="${X(c)}" x2="${X(c)}" y1="${T0}" y2="${T0 + ph}" stroke="${ink}" stroke-width="1.2"/>`);
  for (const s of res.studies) T.push(`<circle cx="${X(s.yi)}" cy="${Y(s.sei)}" r="4.5" fill="${brand}" stroke="#ffffff" stroke-width="1.5"/>`);
  T.push(`<text x="${L + pw / 2}" y="${H - 22}" font-size="12" fill="${ink}" text-anchor="middle">${esc(res.type === "or" ? L3(l, "Odds oranı (log ölçeği)", "Odds ratio (log scale)", "Odds Ratio (Log-Skala)") : res.type === "r" ? L3(l, "Korelasyon r", "Correlation r", "Korrelation r") : res.type === "smd" ? "Hedges g" : L3(l, "Etki", "Effect", "Effekt"))}</text>`);
  T.push(`<text transform="translate(16 ${T0 + ph / 2}) rotate(-90)" font-size="12" fill="${ink}" text-anchor="middle">${esc(L3(l, "Standart hata", "Standard error", "Standardfehler"))}</text>`);
  if (res.egger) T.push(`<text x="${L + pw}" y="${T0 - 10}" font-size="11" fill="${mute}" text-anchor="end">${esc(`Egger: t(${res.egger.df}) = ${dec(res.egger.t, l)}, ${pTxt(res.egger.p, l)}`)}</text>`);
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Inter, Arial, sans-serif">${T.join("")}</svg>`, width: W, height: H };
}

export function heterogeneityText(res: MetaResult, l: Lang): string {
  return `${L3(l, "Heterojenlik", "Heterogeneity", "Heterogenität")}: Q(${res.dfQ}) = ${dec(res.Q, l)}, ${pTxt(res.pQ, l)}, I² = ${dec(res.I2, l, 1)}%, τ² = ${dec(res.tau2, l, 3)}`;
}

/** Yöntem cümlesi (yöntem metnine girer) */
export function metaMethodsSentence(type: MetaType, model: MetaModel, l: Lang): string {
  const eff = L3(l,
    type === "smd" ? "Etki ölçüsü olarak Hedges g (küçük örneklem düzeltmeli standartlaştırılmış ortalama farkı) kullanılmıştır." : type === "r" ? "Etki ölçüsü olarak korelasyon katsayısı kullanılmış; çalışmalar Fisher z dönüşümüyle birleştirilip sonuç r’ye geri çevrilmiştir." : type === "or" ? "Etki ölçüsü olarak odds oranı kullanılmış; çalışmalar log ölçeğinde birleştirilmiş, hücresinde sıfır olan çalışmalara 0,5 düzeltmesi uygulanmıştır." : "Çalışmaların bildirdiği etki büyüklükleri ve standart hataları ters varyans ağırlıklarıyla birleştirilmiştir.",
    type === "smd" ? "Hedges’ g (standardised mean difference with small-sample correction) was used as the effect measure." : type === "r" ? "The correlation coefficient was the effect measure; studies were pooled on Fisher’s z scale and back-transformed to r." : type === "or" ? "The odds ratio was the effect measure; studies were pooled on the log scale, with a 0.5 continuity correction for studies with a zero cell." : "The effect sizes and standard errors reported by the studies were pooled with inverse-variance weights.",
    type === "smd" ? "Als Effektmaß wurde Hedges’ g (standardisierte Mittelwertdifferenz mit Korrektur für kleine Stichproben) verwendet." : type === "r" ? "Als Effektmaß diente der Korrelationskoeffizient; die Studien wurden auf der Fisher-z-Skala gepoolt und in r zurücktransformiert." : type === "or" ? "Als Effektmaß diente das Odds Ratio; die Studien wurden auf der Log-Skala gepoolt, bei Studien mit einer Nullzelle mit Korrektur um 0,5." : "Die von den Studien berichteten Effektstärken und Standardfehler wurden mit inversen Varianzen gewichtet gepoolt.");
  const mod = L3(l,
    model === "random" ? " Çalışmalar rastgele etkiler modeliyle (DerSimonian–Laird τ² kestiricisi) birleştirilmiştir; heterojenlik Cochran Q, I² ve τ² ile değerlendirilmiş, yayın yanlılığı huni grafiği ve Egger regresyon testiyle incelenmiştir (test, az sayıda çalışmada düşük güçlüdür)." : " Çalışmalar sabit etki (ters varyans) modeliyle birleştirilmiştir; heterojenlik Cochran Q ve I² ile değerlendirilmiş, yayın yanlılığı huni grafiği ve Egger regresyon testiyle incelenmiştir (test, az sayıda çalışmada düşük güçlüdür).",
    model === "random" ? " Studies were pooled with a random-effects model (DerSimonian–Laird estimator of τ²); heterogeneity was assessed with Cochran’s Q, I² and τ², and publication bias with a funnel plot and Egger’s regression test (low power with few studies)." : " Studies were pooled with a fixed-effect (inverse-variance) model; heterogeneity was assessed with Cochran’s Q and I², and publication bias with a funnel plot and Egger’s regression test (low power with few studies).",
    model === "random" ? " Die Studien wurden mit einem Random-Effects-Modell (DerSimonian-Laird-Schätzer für τ²) gepoolt; Heterogenität wurde mit Cochrans Q, I² und τ² beurteilt, Publikationsbias mit Funnel-Plot und Egger-Regressionstest (geringe Power bei wenigen Studien)." : " Die Studien wurden mit einem Fixed-Effect-Modell (inverse Varianz) gepoolt; Heterogenität wurde mit Cochrans Q und I² beurteilt, Publikationsbias mit Funnel-Plot und Egger-Regressionstest (geringe Power bei wenigen Studien).");
  return eff + mod;
}

/** Sonuç metni + çalışma tablosu (Markdown) */
export function metaResultsMarkdown(res: MetaResult, l: Lang, tableNo = 3): string {
  const p = res.pooled, nm = res.effectName === "etki" ? L3(l, "etki", "effect", "Effekt") : res.effectName;
  const est = (x: number) => dec(res.back(x), l), model = res.model === "random" ? L3(l, "rastgele etkiler", "random-effects", "Random-Effects") : L3(l, "sabit etki", "fixed-effect", "Fixed-Effect");
  const sigTxt = p.p < 0.05 ? L3(l, "anlamlıdır", "was significant", "war signifikant") : L3(l, "anlamlı değildir", "was not significant", "war nicht signifikant");
  const het = res.I2 < 25 ? L3(l, "düşük", "low", "gering") : res.I2 < 75 ? L3(l, "orta", "moderate", "mäßig") : L3(l, "yüksek", "high", "hoch");
  const out: string[] = [L3(l, "### Meta-analiz sonuçları", "### Meta-analysis results", "### Ergebnisse der Metaanalyse")];
  out.push(L3(l,
    `Meta-analize ${res.k} çalışma girmiştir. ${model.charAt(0).toLocaleUpperCase("tr")}${model.slice(1)} modeline göre birleşik etki ${nm} = ${est(p.est)}, %95 GA [${est(p.ci[0])}, ${est(p.ci[1])}], z = ${dec(p.z, l)}, ${pTxt(p.p, l)}; birleşik etki istatistiksel olarak ${sigTxt}. ${heterogeneityText(res, l)}; heterojenlik ${het} düzeydedir.`,
    `${res.k} studies were included in the meta-analysis. Under the ${model} model the pooled ${nm} was ${est(p.est)}, 95% CI [${est(p.ci[0])}, ${est(p.ci[1])}], z = ${dec(p.z, l)}, ${pTxt(p.p, l)}; the pooled effect ${sigTxt}. ${heterogeneityText(res, l)}; heterogeneity was ${het}.`,
    `In die Metaanalyse gingen ${res.k} Studien ein. Im ${model}-Modell betrug der gepoolte Effekt ${nm} = ${est(p.est)}, 95 %-KI [${est(p.ci[0])}, ${est(p.ci[1])}], z = ${dec(p.z, l)}, ${pTxt(p.p, l)}; der gepoolte Effekt ${sigTxt}. ${heterogeneityText(res, l)}; die Heterogenität war ${het}.`));
  if (res.egger) out.push(L3(l,
    `Yayın yanlılığı için Egger regresyon testi: kesişim = ${dec(res.egger.intercept, l)}, t(${res.egger.df}) = ${dec(res.egger.t, l)}, ${pTxt(res.egger.p, l)}${res.k < 10 ? "; çalışma sayısı 10’dan az olduğundan test düşük güçlüdür ve dikkatle yorumlanmalıdır" : ""}.`,
    `Egger’s regression test for publication bias: intercept = ${dec(res.egger.intercept, l)}, t(${res.egger.df}) = ${dec(res.egger.t, l)}, ${pTxt(res.egger.p, l)}${res.k < 10 ? "; with fewer than 10 studies the test has low power and should be interpreted with caution" : ""}.`,
    `Egger-Regressionstest auf Publikationsbias: Achsenabschnitt = ${dec(res.egger.intercept, l)}, t(${res.egger.df}) = ${dec(res.egger.t, l)}, ${pTxt(res.egger.p, l)}${res.k < 10 ? "; bei weniger als 10 Studien hat der Test geringe Power und ist mit Vorsicht zu interpretieren" : ""}.`));
  if (res.skipped.length) out.push(L3(l, `Verisi eksik ya da geçersiz olduğu için ${res.skipped.length} çalışma meta-analize alınmamıştır (${res.skipped.map((s) => `${s.label}: ${s.reason}`).join("; ")}).`, `${res.skipped.length} study(ies) were left out because their data were missing or invalid (${res.skipped.map((s) => `${s.label}: ${s.reason}`).join("; ")}).`, `${res.skipped.length} Studie(n) wurden wegen fehlender oder ungültiger Daten nicht aufgenommen (${res.skipped.map((s) => `${s.label}: ${s.reason}`).join("; ")}).`));
  out.push(L3(l, `*Tablo ${tableNo}. Meta-analize giren çalışmalar*`, `*Table ${tableNo}. Studies included in the meta-analysis*`, `*Tabelle ${tableNo}. In die Metaanalyse eingegangene Studien*`));
  const head = [L3(l, "Çalışma", "Study", "Studie"), nm, L3(l, "%95 GA", "95% CI", "95 %-KI"), L3(l, "Ağırlık (%)", "Weight (%)", "Gewicht (%)")];
  out.push([`| ${head.join(" | ")} |`, `|${"---|".repeat(4)}`, ...res.studies.map((s) => `| ${s.label.replace(/\|/g, "/")} | ${est(s.yi)} | [${est(s.ci[0])}, ${est(s.ci[1])}] | ${dec(s.wPct, l, 1)} |`), `| **${L3(l, "Birleşik", "Pooled", "Gepoolt")}** | **${est(p.est)}** | **[${est(p.ci[0])}, ${est(p.ci[1])}]** | 100 |`].join("\n"));
  return out.join("\n\n");
}
