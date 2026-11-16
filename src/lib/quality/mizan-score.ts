/**
 * D213: Mizan doğruluk ölçümünün puanlaması (saf modül, testlenir). Etiketler elle yazılmış “doğru cevap”tır;
 * tahmin, ürünün iddia denetimi motorunun kararıdır.
 * - Tam isabet: dört karardan (destekliyor, kısmen, desteklemiyor, çelişiyor) doğrusunun bulunması
 * - Sorun yakalama: kaynakta sorunlu olan iddiaların (destekliyor dışındaki her etiket) “sorun var” diye işaretlenmesi
 * - Yanlış alarm: kaynakça doğru olan iddiaya sorun denmesi
 * - Tehlikeli kaçırma: çelişen ya da kaynakta hiç olmayan iddiaya “destekliyor” denmesi
 * - D221: her etiket için kesinlik (precision), duyarlılık (recall), F1; makro F1; “sorun var” ikili sınıflaması için
 *   P/R/F1; yanlış pozitif ve yanlış negatiflerin kimlik listeleri
 */
export type BenchLabel = "supports" | "partial" | "not_supported" | "contradicts";
export const BENCH_LABELS: BenchLabel[] = ["supports", "partial", "not_supported", "contradicts"];

export interface BenchRow { id: string; label: BenchLabel; predicted: string }

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);

export function scoreBench(rows: BenchRow[]) {
  const n = rows.length;
  const exact = rows.filter((r) => r.predicted === r.label).length;
  const problems = rows.filter((r) => r.label !== "supports");
  const fine = rows.filter((r) => r.label === "supports");
  const caught = problems.filter((r) => r.predicted !== "supports").length;
  const falseAlarms = fine.filter((r) => r.predicted !== "supports").length;
  const dangerous = rows.filter((r) => (r.label === "contradicts" || r.label === "not_supported") && r.predicted === "supports");
  const confusion: Record<string, Record<string, number>> = {};
  for (const r of rows) {
    confusion[r.label] ??= {};
    confusion[r.label][r.predicted] = (confusion[r.label][r.predicted] ?? 0) + 1;
  }
  const perLabel = BENCH_LABELS.map((l) => {
    const xs = rows.filter((r) => r.label === l);
    return { label: l, n: xs.length, correct: xs.filter((r) => r.predicted === l).length, pct: pct(xs.filter((r) => r.predicted === l).length, xs.length) };
  });
  const prf = (tp: number, fp: number, fn: number) => {
    const precision = tp + fp ? tp / (tp + fp) : 0, recall = tp + fn ? tp / (tp + fn) : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    const r3 = (x: number) => Math.round(x * 1000) / 1000;
    return { tp, fp, fn, precision: r3(precision), recall: r3(recall), f1: r3(f1) };
  };
  const perClass = BENCH_LABELS.map((l) => {
    const fpIds = rows.filter((r) => r.predicted === l && r.label !== l).map((r) => r.id);
    const fnIds = rows.filter((r) => r.label === l && r.predicted !== l).map((r) => r.id);
    return { label: l, ...prf(rows.filter((r) => r.label === l && r.predicted === l).length, fpIds.length, fnIds.length), fpIds, fnIds };
  });
  const macroF1 = Math.round((perClass.reduce((a, c) => a + c.f1, 0) / perClass.length) * 1000) / 1000;
  // İkili: pozitif = “kaynakta sorun var” (destekliyor dışı). Yanlış pozitif = doğru iddiaya sorun; yanlış negatif = sorunlu iddiaya “destekliyor”
  const issueFp = fine.filter((r) => r.predicted !== "supports").map((r) => r.id);
  const issueFn = problems.filter((r) => r.predicted === "supports").map((r) => r.id);
  const issue = { ...prf(caught, issueFp.length, issueFn.length), fpIds: issueFp, fnIds: issueFn };
  return {
    n,
    perClass, macroF1, issue,
    exactPct: pct(exact, n), exact,
    detectionPct: pct(caught, problems.length), caught, problems: problems.length,
    falseAlarmPct: pct(falseAlarms, fine.length), falseAlarms, fine: fine.length,
    dangerousMisses: dangerous.length, dangerousIds: dangerous.map((r) => r.id),
    perLabel, confusion,
  };
}
export type BenchScore = ReturnType<typeof scoreBench>;
