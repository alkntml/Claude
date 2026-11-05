/**
 * Yapıştırılan tabloyu (Excel/SPSS/CSV) sayısal matrise çevirir (D90). Sekme, noktalı virgül veya virgülle
 * ayrılmış olabilir; ilk satır başlıksa madde adları oradan alınır; ondalık virgül desteklenir. Eksik verili
 * satırlar analizden çıkarılır (liste bazında silme) ve sayısı bildirilir.
 */
export interface ParsedTable { names: string[]; rows: number[][]; dropped: number }

export function parseNumericTable(text: string): ParsedTable {
  const lines = text.replace(/\r/g, "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return { names: [], rows: [], dropped: 0 };
  const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : /,\s*\d/.test(lines[0]) && !/\d,\d/.test(lines[0]) ? "," : /\s{1,}/.test(lines[0]) ? /\s+/ : ",";
  const split = (l: string) => l.split(sep as string).map((c) => c.trim());
  const num = (c: string) => (c === "" ? NaN : Number(c.replace(",", ".")));
  const first = split(lines[0]);
  const header = first.some((c) => c !== "" && Number.isNaN(num(c)));
  const names = header ? first.map((c, i) => c || `M${i + 1}`) : first.map((_, i) => `M${i + 1}`);
  const body = header ? lines.slice(1) : lines;
  const rows: number[][] = [];
  let dropped = 0;
  for (const l of body) {
    const cells = split(l).slice(0, names.length).map(num);
    if (cells.length !== names.length || cells.some((v) => !Number.isFinite(v))) { dropped++; continue; }
    rows.push(cells);
  }
  return { names, rows, dropped };
}

/** Ters puanlanan maddeler: (min + max) − değer */
export function reverseScore(rows: number[][], cols: number[], min: number, max: number): number[][] {
  const set = new Set(cols);
  return rows.map((r) => r.map((v, j) => (set.has(j) ? min + max - v : v)));
}

/** Yaygın kullanılan yorum eşikleri (George ve Mallery, 2003) */
export function alphaVerdict(a: number): string {
  if (a >= 0.9) return "Mükemmel";
  if (a >= 0.8) return "İyi";
  if (a >= 0.7) return "Kabul edilebilir";
  if (a >= 0.6) return "Sorgulanabilir";
  if (a >= 0.5) return "Zayıf";
  return "Kabul edilemez";
}
