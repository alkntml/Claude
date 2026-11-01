/** Yazım hedefi ve teslim takvimi (istemci ve sunucuda ortak, saf fonksiyonlar). */

export interface Goal { weeklyWords?: number | null; deadline?: string | null; targetWords?: number | null }
export type WordLog = Record<string, number>; // "YYYY-MM-DD" -> o günün sonundaki toplam kelime

export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Haftanın başlangıcı (pazartesi) */
export function weekStart(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - wd);
  return x;
}

/** Günlük toplamı kaydeder; ilk kayıtta düne önceki toplam yazılır (mevcut metin bu haftaya sayılmasın). */
export function logWords(log: WordLog | null | undefined, now: Date, total: number, previousTotal: number): WordLog {
  const out: WordLog = { ...(log ?? {}) };
  if (!Object.keys(out).length) {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    out[dayKey(y)] = previousTotal;
  }
  out[dayKey(now)] = total;
  const keys = Object.keys(out).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - 120))) delete out[k];
  return out;
}

/** Bu hafta yazılan kelime (haftadan önceki son kayda göre artış; silinen metin eksi sayılmaz). */
export function wordsThisWeek(log: WordLog | null | undefined, now: Date, total: number): number {
  const ws = dayKey(weekStart(now));
  const keys = Object.keys(log ?? {}).sort();
  const before = keys.filter((k) => k < ws).pop();
  const base = before !== undefined ? log![before] : keys.length ? log![keys[0]] : total;
  return Math.max(0, total - base);
}

export function daysLeft(deadline: string | null | undefined, now: Date): number | null {
  if (!deadline) return null;
  const d = new Date(`${deadline}T23:59:59`);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}

export interface PlanWeek { start: string; end: string; stages: string[] }

/** Kalan bölümleri teslim tarihine kadar haftalara eşit dağıtır (son hafta gözden geçirme için boş bırakılır). */
export function deadlinePlan(stages: { title: string; status: string; key?: string }[], deadline: string | null | undefined, now: Date): PlanWeek[] {
  const left = daysLeft(deadline, now);
  if (left === null || left <= 0) return [];
  const todo = stages.filter((s) => s.status !== "done" && s.key !== "references").map((s) => s.title);
  const weeks = Math.max(1, Math.ceil(left / 7));
  const workWeeks = weeks > 2 ? weeks - 1 : weeks; // son hafta: genel okuma ve düzeltme
  const per = Math.max(1, Math.ceil(todo.length / workWeeks));
  const out: PlanWeek[] = [];
  const ws = weekStart(now);
  for (let w = 0; w < weeks; w++) {
    const start = new Date(ws); start.setDate(ws.getDate() + w * 7);
    const end = new Date(start); end.setDate(start.getDate() + 6);
    out.push({ start: dayKey(start), end: dayKey(end), stages: todo.slice(w * per, (w + 1) * per) });
  }
  return out;
}

/** Hedef toplam kelimeye ulaşmak için haftada gereken kelime */
export function neededPerWeek(goal: Goal | null | undefined, total: number, now: Date): number | null {
  const left = daysLeft(goal?.deadline, now);
  if (!goal?.targetWords || left === null || left <= 0) return null;
  return Math.max(0, Math.ceil((goal.targetWords - total) / Math.max(1, left / 7)));
}
