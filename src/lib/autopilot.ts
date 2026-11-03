/**
 * Otomatik çalışma (yönetici modülü, D77) için saf kurallar: kalite raporundan düzeltme planı,
 * alt başlık önerisi ayrıştırma, durum ve günlük biçimi. İstemci + test ortak.
 */
export type AutoStatus = "blueprint" | "running" | "paused" | "review" | "done" | "failed";
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
  /** Yapay zekâ jüri incelemesi yapıldı mı (D78: yalnızca ilk turda; sonraki turlar kural tabanlı ve ücretsiz) */
  aiReviewed?: boolean;
  /** Otomatik düzeltmesi bir kez denenmiş bulgular (aynı bulgu için tekrar tekrar düzeltme yapılmaz) */
  attempted?: string[];
  /** Kullanıcının “olduğu gibi kalsın” dediği bulgular (sonraki turlarda yok sayılır) */
  ignored?: string[];
  /** Kullanıcı onayı bekleyen bulgular (status: "review") */
  pending?: PendingIssue[];
  /** Kullanıcının “yeniden düzelt” dediği bulgular (bir sonraki turda zorla gözden geçirilir) */
  forceFix?: string[];
  /** Toplam düzeltme turu sınırı (kullanıcı “yeniden düzelt” dedikçe bir tur artar) */
  maxRounds?: number;
}

export type PendingReason = "data" | "attempted" | "manual";
export interface PendingIssue { key: string; title: string; detail?: string; stageKey?: string; severity: "info" | "warning" | "error"; reason: PendingReason; /** Düzeltme seçeneği sunulur mu (veri gerektirenlerde sunulmaz) */ fixable: boolean }

export const TARGET_SCORE = 85;
export const MAX_FIX_ROUNDS = 3;
export const MAX_LOG = 40;
export const MAX_PENDING = 40;

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

/** Bulgunun turlar arasında aynı kalan kimliği (sayılar atılır: “3 uzun cümle” → “uzun cümle”) */
export function issueKey(it: IssueLike): string {
  const n = (x?: string) => (x ?? "").toLocaleLowerCase("tr").replace(/\d+([.,]\d+)?/g, "#").replace(/\s+/g, " ").trim().slice(0, 160);
  return `${it.category}|${it.stageKey ?? ""}|${n(it.title)}|${n(it.detail)}`;
}

/** Otomatik düzeltilebilir mi? Gerçek veri gerektirenler asla (uydurma yok); bilgi düzeyindeki notlar planFixes’e bırakılır */
export const autoFixable = (it: IssueLike) => it.category !== "data";

export type Decision =
  | { kind: "done"; ignoredLeft: number }
  | { kind: "fix"; plan: FixPlan; keys: string[] }
  | { kind: "review"; pending: PendingIssue[] };

const SEV_ORDER = { error: 0, warning: 1, info: 2 } as const;

/**
 * Kalite raporundan sonraki adım (D78). Döngüye girmemek için:
 * - kullanıcının kabul ettiği (ignored) bulgular yok sayılır;
 * - her bulgu için otomatik düzeltme en fazla bir kez denenir;
 * - düzeltilecek yeni bulgu kalmadıysa veya tur sınırı dolduysa kalan bulgular kullanıcıya sorulur.
 */
export function decideNext(score: number, issues: IssueLike[], st: Pick<AutoState, "round" | "attempted" | "ignored" | "maxRounds" | "forceFix">): Decision {
  const ignored = new Set(st.ignored ?? []);
  const attempted = new Set(st.attempted ?? []);
  const active = issues.filter((it) => !ignored.has(issueKey(it)));
  if (score >= TARGET_SCORE) return { kind: "done", ignoredLeft: issues.length - active.length };
  const actionable = active.filter((it) => autoFixable(it) && !attempted.has(issueKey(it)));
  const plan = planFixes(actionable);
  // Kullanıcının açıkça düzeltilmesini istediği (planFixes’in normalde atladığı) bulgular bölüm revizyonuna eklenir
  const force = new Set(st.forceFix ?? []);
  for (const it of actionable) {
    if (!force.has(issueKey(it)) || !it.stageKey || plan.rewrite.includes(it.stageKey)) continue;
    const list = (plan.revise[it.stageKey] ??= []);
    if (!list.includes(it)) list.push(it);
  }
  const hasWork = plan.rewrite.length > 0 || plan.placeholders.length > 0 || Object.keys(plan.revise).length > 0 || plan.verifySources;
  if (hasWork && st.round < (st.maxRounds ?? MAX_FIX_ROUNDS)) {
    // Yalnızca bu turda gerçekten ele alınan bulgular “denendi” sayılır
    const covered = (it: IssueLike) =>
      it.category === "sources" ? plan.verifySources && it.severity !== "info"
        : !!it.stageKey && (plan.rewrite.includes(it.stageKey) || plan.placeholders.includes(it.stageKey) || (plan.revise[it.stageKey] ?? []).includes(it));
    return { kind: "fix", plan, keys: actionable.filter(covered).map(issueKey) };
  }
  if (!active.length) return { kind: "done", ignoredLeft: issues.length };
  const seen = new Set<string>();
  const pending: PendingIssue[] = [];
  for (const it of [...active].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity])) {
    const key = issueKey(it);
    if (seen.has(key)) continue;
    seen.add(key);
    const reason: PendingReason = !autoFixable(it) ? "data" : attempted.has(key) ? "attempted" : "manual";
    pending.push({ key, title: it.title, detail: it.detail?.slice(0, 300), stageKey: it.stageKey, severity: it.severity, reason, fixable: reason === "attempted" || (reason === "manual" && !!it.stageKey) });
    if (pending.length >= MAX_PENDING) break;
  }
  return { kind: "review", pending };
}

/**
 * Kullanıcının seçimlerini duruma uygular: “düzelt” denenler bir kez daha denenir (bir tur eklenir),
 * “olduğu gibi kalsın” denenler sonraki turlarda yok sayılır.
 */
export function applyReview(st: AutoState, fix: string[]): AutoState {
  const pending = st.pending ?? [];
  const fixSet = new Set(fix.filter((k) => pending.some((p) => p.key === k && p.fixable)));
  const keep = pending.filter((p) => !fixSet.has(p.key)).map((p) => p.key);
  return {
    ...st,
    pending: [],
    ignored: [...new Set([...(st.ignored ?? []), ...keep])],
    attempted: (st.attempted ?? []).filter((k) => !fixSet.has(k)),
    forceFix: [...fixSet],
    maxRounds: fixSet.size ? st.round + 1 : st.maxRounds,
  };
}
