/**
 * D205: Satır içi otomatik tamamlamanın bağlamı. Asistanın bölüm yazarken kullandığı bilginin özü, kısa tutularak:
 * çalışmanın konusu, türü, düzeyi, yöntemi, amacı ve araştırma soruları; çalışmanın akışı (bölüm sırası ve
 * şu anki konum); bölümün amacı, çalışmadaki işlevi, karşılaması beklenen işlevler ve sorumlu asistan rolü.
 * Bütün çalışma türlerinde ve kullanıcının eklediği özel bölümlerde çalışır. Saf modül (testlenir).
 */
import { readBlueprint } from "@/lib/blueprint";
import { assistantFor, designById, GRANT_PROGRAMS, LEVEL_LABELS, METHODOLOGY_LABELS, sectionFunctions, stageDef, WORK_TYPES, workTypeGuidance, type AcademicLevel, type Methodology } from "@/lib/workflows";

export interface SuggestProject { title: string; work_type: string; academic_level?: string | null; discipline?: string | null; topic?: string | null; keywords?: string[] | null; context?: Record<string, unknown> | null }
export interface SuggestStage { id: string; key: string; title: string; description?: string | null; why?: string | null; hidden?: boolean | null; position?: number | null }

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s);

export function buildSuggestContext(o: { project: SuggestProject; stages: SuggestStage[]; stageId?: string | null; stageTitle: string; focusTitle?: string | null }) {
  const { project } = o;
  const ctx = (project.context ?? {}) as Record<string, unknown>;
  const methodology = typeof ctx.methodology === "string" ? ctx.methodology : null;
  const variant = typeof ctx.variant === "string" ? ctx.variant : null;
  const stage = o.stages.find((s) => s.id === o.stageId) ?? o.stages.find((s) => s.title === o.stageTitle) ?? null;
  const lines: string[] = [];

  // Çalışma (genel konu ve yön)
  const wt = WORK_TYPES.find((w) => w.id === project.work_type)?.title ?? project.work_type;
  const level = project.academic_level ? LEVEL_LABELS[project.academic_level as AcademicLevel] ?? project.academic_level : "";
  lines.push(`ÇALIŞMA: ${project.title}`);
  lines.push(`Tür: ${wt}${level ? ` · Düzey: ${level}` : ""}${project.discipline ? ` · Disiplin: ${project.discipline}` : ""}`);
  const approach = [methodology ? METHODOLOGY_LABELS[methodology as Methodology] ?? methodology : "", designById(typeof ctx.design === "string" ? ctx.design : null)?.label ?? ""].filter(Boolean).join(" · ");
  if (approach) lines.push(`Yaklaşım: ${approach}`);
  if (typeof ctx.program === "string") lines.push(`Program: ${GRANT_PROGRAMS.find((p) => p.id === ctx.program)?.label ?? ctx.program}`);
  if (project.topic) lines.push(`Konu: ${cut(project.topic, 400)}`);
  if (project.keywords?.length) lines.push(`Anahtar kelimeler: ${project.keywords.slice(0, 10).join(", ")}`);
  const bp = readBlueprint(ctx.blueprint);
  if (bp?.problem.trim()) lines.push(`Problem: ${cut(bp.problem.trim(), 300)}`);
  if (bp?.aim.trim()) lines.push(`Amaç: ${cut(bp.aim.trim(), 300)}`);
  const rq = bp?.questions.length ? bp.questions.map((q, i) => `${i + 1}) ${q}`).join(" ") : typeof ctx.researchQuestions === "string" ? ctx.researchQuestions.trim() : "";
  if (rq) lines.push(`Araştırma soruları / hipotezler: ${cut(rq, 500)}`);
  const g = workTypeGuidance(project.work_type);
  if (g) lines.push(`Tür kuralı: ${cut(g, 360)}`);

  // Çalışmanın akışı (gidişat): bölüm sırası ve şu anki konum
  const visible = o.stages.filter((s) => !s.hidden && s.key !== "references").sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  if (visible.length) {
    lines.push("", "ÇALIŞMANIN AKIŞI:");
    lines.push(visible.map((s, i) => `${i + 1}. ${s.title}${stage && s.id === stage.id ? "  ← şu an bu bölümde" : ""}`).join("\n"));
  }

  // Bölüm: başlık, amaç, işlev, beklenen işlevler, rol
  lines.push("", `BÖLÜM: ${o.stageTitle}${o.focusTitle ? ` › ${o.focusTitle}` : ""}`);
  const key = stage?.key ?? "";
  const def = key ? stageDef(key) : undefined;
  const purpose = def?.purpose ?? stage?.description ?? "";
  if (purpose) lines.push(`Bölümün amacı: ${cut(purpose, 400)}`);
  if (stage?.why) lines.push(`Çalışmadaki işlevi: ${cut(stage.why, 300)}`);
  const fns = key ? sectionFunctions(key, { workType: project.work_type, methodology, variant }) : [];
  if (fns.length) lines.push(`Bu bölümün karşılaması beklenenler: ${cut(fns.slice(0, 8).join("; "), 600)}`);
  const plan = bp && stage ? (bp.chapters.find((c) => c.stageId === stage.id) ?? bp.chapters.find((c) => c.key === stage.key))?.plan.trim() : "";
  if (plan) lines.push(`Öğrencinin bu bölüm için planı: ${cut(plan, 400)}`);
  const role = assistantFor(key, methodology);
  return { text: lines.join("\n"), role };
}
