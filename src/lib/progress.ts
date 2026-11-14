/**
 * D191: Çalışmanın ilerlemesi (danışman görünümü). Saf hesap: istemci, sunucu ve testler ortak kullanır.
 * Hedef kelime, kurgudaki bölüm planından gelir. Hedefi olmayan bölümde durum yalnızca yazılan kelimeye göre belirlenir.
 * Kaynakça ve kapak gibi uzunluğu sayılmayan bölümler yüzdeye girmez.
 */
import { countsForLength, readBlueprint } from "@/lib/blueprint";

export type StageStatus = "empty" | "started" | "written" | "done";
export interface StageProgress { id: string; title: string; words: number; target: number; pct: number | null; status: StageStatus; updatedAt: string | null; openComments: number }
export interface ProjectProgress {
  totalWords: number;
  targetWords: number;
  /** Hedefi olan bölümlerde yazılan / hedef (her bölüm hedefinde sınırlanır); hedef yoksa yazılmış bölümlerin oranı */
  percent: number;
  stages: StageProgress[];
  openComments: number;
  lastActivity: string | null;
  quality: { score: number | null; at: string } | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function computeProgress(p: { context: any; stages: any[]; comments: { stage_id: string; resolved: boolean }[]; quality?: { score: number | null; created_at: string } | null }): ProjectProgress {
  const bp = readBlueprint(p.context?.blueprint);
  const targetOf = new Map<string, number>((bp?.chapters ?? []).map((c) => [c.stageId, c.words ?? 0]));
  const open = new Map<string, number>();
  for (const c of p.comments) if (!c.resolved) open.set(c.stage_id, (open.get(c.stage_id) ?? 0) + 1);
  const rows: StageProgress[] = [...p.stages]
    .filter((s) => !s.hidden && countsForLength(s.key))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((s) => {
      const words = Number(s.word_count) || 0;
      const target = targetOf.get(s.id) ?? 0;
      const pct = target > 0 ? Math.min(100, Math.round((words / target) * 100)) : null;
      const status: StageStatus = words === 0 ? "empty" : pct != null ? (pct >= 90 ? "done" : "started") : words >= 150 ? "written" : "started";
      return { id: s.id, title: String(s.title), words, target, pct, status, updatedAt: s.updated_at ?? null, openComments: open.get(s.id) ?? 0 };
    });
  const withTarget = rows.filter((r) => r.target > 0);
  const targetWords = withTarget.reduce((a, r) => a + r.target, 0);
  const percent = targetWords > 0
    ? Math.round((withTarget.reduce((a, r) => a + Math.min(r.words, r.target), 0) / targetWords) * 100)
    : rows.length ? Math.round((rows.filter((r) => r.status === "written" || r.status === "done").length / rows.length) * 100) : 0;
  const times = rows.map((r) => r.updatedAt).filter((x): x is string => !!x).sort();
  return {
    totalWords: rows.reduce((a, r) => a + r.words, 0),
    targetWords,
    percent,
    stages: rows,
    openComments: rows.reduce((a, r) => a + r.openComments, 0),
    lastActivity: times[times.length - 1] ?? null,
    quality: p.quality ? { score: p.quality.score, at: p.quality.created_at } : null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
