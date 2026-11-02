/**
 * Önerilen yazım sırası: bölümler yol haritası sırasıyla yazılır; özet/abstract gibi çalışmanın
 * tamamını özetleyen bölümler en sona bırakılır, kaynakça otomatik oluştuğu için sıraya girmez.
 */
export const WRITE_LAST = new Set(["title_abstract", "grant_summary"]);
export const AUTO_STAGES = new Set(["references"]);

interface StageLike { id: string; key: string; position: number; status?: string | null }

export function writingOrder<T extends StageLike>(stages: T[]): T[] {
  const sorted = [...stages].filter((s) => !AUTO_STAGES.has(s.key)).sort((a, b) => a.position - b.position);
  return [...sorted.filter((s) => !WRITE_LAST.has(s.key)), ...sorted.filter((s) => WRITE_LAST.has(s.key))];
}

/** Sıradaki tamamlanmamış bölüm (isteğe bağlı olarak belirli bir bölüm hariç) */
export function nextStage<T extends StageLike>(stages: T[], exceptId?: string): T | undefined {
  return writingOrder(stages).find((s) => s.status !== "done" && s.id !== exceptId);
}

/** Bu bölüm, önce yazılması gereken bölümler bitmeden açıldıysa önerilecek bölüm */
export function shouldWaitFor<T extends StageLike>(stages: T[], current: T): T | undefined {
  if (!WRITE_LAST.has(current.key)) return undefined;
  return writingOrder(stages).find((s) => !WRITE_LAST.has(s.key) && s.status !== "done");
}

export function completion(stages: StageLike[]): { done: number; total: number } {
  const list = stages.filter((s) => !AUTO_STAGES.has(s.key));
  return { done: list.filter((s) => s.status === "done").length, total: list.length };
}
