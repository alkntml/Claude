import "server-only";
/**
 * Migration 32 (D115) canlıda henüz çalıştırılmadıysa yeni sütunlar (last_editor, actor_id) yoktur.
 * Yazma bu sütunlar olmadan bir kez daha denenir; böylece bölüm kaydı, sürüm ve yorum migration’dan önce de çalışır.
 */
const NEW_COLUMNS = ["last_editor", "actor_id"] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function isMissingColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  return !!error && (error.code === "42703" || error.code === "PGRST204" || /column .* does not exist|Could not find the '.*' column/i.test(error.message ?? ""));
}

export function withoutNewColumns<T extends Record<string, unknown>>(row: T): T {
  const copy: Record<string, unknown> = { ...row };
  for (const c of NEW_COLUMNS) delete copy[c];
  return copy as T;
}

/** run(row) yeni sütunlarla dener; sütun yoksa onlarsız tekrarlar */
export async function compatWrite<R extends { error: any }>(row: Record<string, unknown>, run: (row: Record<string, unknown>) => PromiseLike<R>): Promise<R> {
  const r = await run(row);
  if (isMissingColumn(r.error)) return run(withoutNewColumns(row));
  return r;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
