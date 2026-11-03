/**
 * Otomatik çalışma (yönetici modülü, D77) için saf kurallar: kalite raporundan düzeltme planı,
 * alt başlık önerisi ayrıştırma, durum ve günlük biçimi. İstemci + test ortak.
 */
export type AutoStatus = "blueprint" | "running" | "paused" | "done" | "failed";
export type AutoPhase = "title" | "write" | "quality" | "fix" | "done";

export interface AutoState {
  status: AutoStatus;
  phase: AutoPhase;
  round: number;
  score: number | null;
  log: { at: string; text: string }[];
  startedAt: string;
  finishedAt?: string | null;
  note?: string;
}

export const TARGET_SCORE = 85;
export const MAX_FIX_ROUNDS = 3;
export const MAX_LOG = 40;

export function newState(): AutoState {
  return { status: "blueprint", phase: "title", round: 0, score: null, log: [], startedAt: new Date().toISOString(), finishedAt: null };
}

export function pushLog(s: AutoState, text: string): AutoState {
  return { ...s, log: [...s.log, { at: new Date().toISOString(), text: text.slice(0, 240) }].slice(-MAX_LOG) };
}

export interface IssueLike { category: string; severity: "info" | "warning" | "error"; title: string; detail?: string; stageKey?: string; id?: string }

export interface FixPlan {
  /** Baştan yazılacak bölümler (boş, çok kısa veya literatüre dayanması gerekirken atıfsız) */
  rewrite: string[];
  /** Kaynak gerektiren iddiaları ([KAYNAK GEREKLİ]) düzeltilecek bölümler */
  placeholders: string[];
  /** Sorunlarıyla birlikte gözden geçirilecek bölümler (dil, tekrar, tutarlılık, yapı) */
  revise: Record<string, IssueLike[]>;
  /** Doğrulanmamış / eksik künyeli kaynaklar yeniden doğrulanacak */
  verifySources: boolean;
  /** Gerçek araştırma verisi gereken alanlar var (uydurulamaz; teslimde belirtilir) */
  dataPending: boolean;
}

const has = (s: string, ...words: string[]) => words.some((w) => s.toLocaleLowerCase("tr").includes(w));

/** Kalite raporundaki sorunları uygulanabilir düzeltme adımlarına çevirir */
export function planFixes(issues: IssueLike[]): FixPlan {
  const plan: FixPlan = { rewrite: [], placeholders: [], revise: {}, verifySources: false, dataPending: false };
  const add = (arr: string[], k?: string) => { if (k && !arr.includes(k)) arr.push(k); };
  for (const it of issues) {
    const title = it.title ?? "";
    if (it.category === "data") { plan.dataPending = true; continue; }
    if (it.category === "sources") { if (it.severity !== "info") plan.verifySources = true; continue; }
    if (it.category === "structure" && has(title, "boş bölüm", "kısa bölüm", "empty section", "short section")) { add(plan.rewrite, it.stageKey); continue; }
    if (it.category === "citations" && has(title, "atıf içermeyen", "no citations", "without citations")) { add(plan.rewrite, it.stageKey); continue; }
    if (it.category === "citations" && has(title, "kaynak gerektiren", "claim", "requires a source", "needs a source")) { add(plan.placeholders, it.stageKey); continue; }
    if (!it.stageKey) continue;
    // Bilgi düzeyindeki tek tük dil notları (uzun cümle, boşluk) tek başına yeniden yazım gerektirmez
    if (it.severity === "info" && it.category === "language") continue;
    (plan.revise[it.stageKey] ??= []).push(it);
  }
  // Baştan yazılacak bölüm ayrıca gözden geçirilmez
  for (const k of plan.rewrite) delete plan.revise[k];
  return plan;
}

/** Yapay zekânın önerdiği alt başlık satırlarını temizler (numara, işaret, tekrar, bölüm adının kendisi) */
export function parseHeadingLines(text: string, stageTitle: string, max: number, same: (a: string, b: string) => boolean): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const l = raw.replace(/^[#\-*•\d.)\s]+/, "").replace(/\*\*/g, "").trim();
    if (l.length < 3 || l.length > 140) continue;
    if (same(l, stageTitle)) continue;
    if (out.some((x) => same(x, l))) continue;
    out.push(l);
    if (out.length >= max) break;
  }
  return out;
}
