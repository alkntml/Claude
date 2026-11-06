/** Kullanım kanıt kaydı özeti (D102). Saf fonksiyon (test edilir). */
export interface ActivityRow { id: number; kind: "ai_output" | "project_deleted" | "stage_deleted" | "text_removed"; action: string | null; project_title: string | null; stage_title: string | null; words: number; words_before: number | null; model: string | null; created_at: string }

const trMonth = (d: string | Date) => { const x = new Date(new Date(d).getTime() + 3 * 3600_000); return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`; };

export function activitySummary(rows: ActivityRow[], now = new Date()) {
  const month = trMonth(now);
  const ai = rows.filter((r) => r.kind === "ai_output");
  const sum = (xs: ActivityRow[]) => xs.reduce((a, r) => a + (Number(r.words) || 0), 0);
  const byMonth = new Map<string, { outputs: number; words: number; deleted: number }>();
  for (const r of rows) {
    const m = trMonth(r.created_at);
    const v = byMonth.get(m) ?? { outputs: 0, words: 0, deleted: 0 };
    if (r.kind === "ai_output") { v.outputs++; v.words += Number(r.words) || 0; } else v.deleted += Number(r.words) || 0;
    byMonth.set(m, v);
  }
  return {
    outputs: ai.length,
    words: sum(ai),
    // Türk tez biçiminde sayfa (344 kelime/sayfa, D95)
    pages: Math.round(sum(ai) / 344),
    monthOutputs: ai.filter((r) => trMonth(r.created_at) === month).length,
    monthWords: sum(ai.filter((r) => trMonth(r.created_at) === month)),
    projectsDeleted: rows.filter((r) => r.kind === "project_deleted").length,
    deletedWords: sum(rows.filter((r) => r.kind !== "ai_output")),
    months: [...byMonth.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([m, v]) => ({ month: m, ...v })),
  };
}
