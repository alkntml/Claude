/**
 * Yüklenen veri tablolarının (CSV/XLSX) betimsel istatistikleri — deterministik hesaplama.
 * Yapay zekâ bu değerleri yorumlayabilir ama üretmez.
 */
export interface NumericSummary {
  name: string; kind: "numeric"; n: number; missing: number; mean: number; sd: number; min: number; max: number; median: number;
}
export interface CategoricalSummary {
  name: string; kind: "categorical"; n: number; missing: number; levels: { value: string; count: number; pct: number }[]; distinct: number;
}
export type ColumnSummary = NumericSummary | CategoricalSummary;

export interface DataSummary {
  rows: number;
  columns: ColumnSummary[];
  correlations: { a: string; b: string; r: number; n: number }[];
}

const toNum = (s: string) => {
  const t = s.trim().replace(/\s/g, "");
  if (!t) return NaN;
  // Türkçe ondalık virgül desteği: "3,5" -> 3.5 (binlik ayırıcı noktası varsa kaldır)
  const norm = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t) ? t.replace(/\./g, "").replace(",", ".") : t.replace(",", ".");
  return /^-?\d+(\.\d+)?(e-?\d+)?$/i.test(norm) ? Number(norm) : NaN;
};

const round = (x: number, d = 3) => Math.round(x * 10 ** d) / 10 ** d;

export function summarize(rows: string[][]): DataSummary {
  if (rows.length < 2) return { rows: 0, columns: [], correlations: [] };
  const [header, ...body] = rows;
  const names = header.map((h, i) => (h?.trim() ? h.trim() : `Sütun ${i + 1}`));
  const columns: ColumnSummary[] = [];
  const numericCols: { name: string; values: number[] }[] = [];

  names.forEach((name, ci) => {
    const raw = body.map((r) => (r[ci] ?? "").trim());
    const present = raw.filter((v) => v !== "");
    const nums = present.map(toNum);
    const numericShare = present.length ? nums.filter((x) => !Number.isNaN(x)).length / present.length : 0;
    if (present.length && numericShare >= 0.95) {
      const vals = nums.filter((x) => !Number.isNaN(x));
      const n = vals.length;
      const mean = vals.reduce((a, b) => a + b, 0) / n;
      const sd = n > 1 ? Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
      const sorted = [...vals].sort((a, b) => a - b);
      const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
      columns.push({ name, kind: "numeric", n, missing: raw.length - n, mean: round(mean), sd: round(sd), min: sorted[0], max: sorted[n - 1], median: round(median) });
      numericCols.push({ name, values: raw.map(toNum) });
    } else {
      const counts = new Map<string, number>();
      for (const v of present) counts.set(v, (counts.get(v) ?? 0) + 1);
      const levels = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([value, count]) => ({ value, count, pct: round((count / present.length) * 100, 1) }));
      columns.push({ name, kind: "categorical", n: present.length, missing: raw.length - present.length, levels, distinct: counts.size });
    }
  });

  const correlations: DataSummary["correlations"] = [];
  const cols = numericCols.slice(0, 15);
  for (let a = 0; a < cols.length; a++) {
    for (let b = a + 1; b < cols.length; b++) {
      const pairs: [number, number][] = [];
      cols[a].values.forEach((x, k) => {
        const y = cols[b].values[k];
        if (!Number.isNaN(x) && !Number.isNaN(y)) pairs.push([x, y]);
      });
      if (pairs.length < 3) continue;
      const mx = pairs.reduce((s, p) => s + p[0], 0) / pairs.length;
      const my = pairs.reduce((s, p) => s + p[1], 0) / pairs.length;
      let sxy = 0, sxx = 0, syy = 0;
      for (const [x, y] of pairs) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
      if (!sxx || !syy) continue;
      correlations.push({ a: cols[a].name, b: cols[b].name, r: round(sxy / Math.sqrt(sxx * syy)), n: pairs.length });
    }
  }
  return { rows: body.length, columns, correlations };
}
