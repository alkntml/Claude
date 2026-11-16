/**
 * D213: Mizan doğruluk ölçümünün puanlaması (saf modül, testlenir). Etiketler elle yazılmış “doğru cevap”tır;
 * tahmin, ürünün iddia denetimi motorunun kararıdır.
 * - Tam isabet: dört karardan (destekliyor, kısmen, desteklemiyor, çelişiyor) doğrusunun bulunması
 * - Sorun yakalama: kaynakta sorunlu olan iddiaların (destekliyor dışındaki her etiket) “sorun var” diye işaretlenmesi
 * - Yanlış alarm: kaynakça doğru olan iddiaya sorun denmesi
 * - Tehlikeli kaçırma: çelişen ya da kaynakta hiç olmayan iddiaya “destekliyor” denmesi
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
  return {
    n,
    exactPct: pct(exact, n), exact,
    detectionPct: pct(caught, problems.length), caught, problems: problems.length,
    falseAlarmPct: pct(falseAlarms, fine.length), falseAlarms, fine: fine.length,
    dangerousMisses: dangerous.length, dangerousIds: dangerous.map((r) => r.id),
    perLabel, confusion,
  };
}
export type BenchScore = ReturnType<typeof scoreBench>;
