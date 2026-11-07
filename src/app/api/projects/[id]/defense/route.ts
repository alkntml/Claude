import { z } from "zod";
import { assertSingleProject } from "@/lib/single-project";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { defenseFeedback, defenseQuestions } from "@/lib/defense";
import { loadProjectBundle } from "@/lib/projects";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const Body = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("questions"), count: z.number().int().min(3).max(15).default(8), focus: z.string().max(300).optional(), level: z.enum(["kind", "standard", "tough"]).default("standard") }),
  z.object({ mode: z.literal("evaluate"), question: z.string().trim().min(5).max(1000), answer: z.string().trim().min(5).max(8000) }),
]);

/** Savunma provası: jüri soruları üretir veya adayın cevabını değerlendirir. */
export const POST = route<Ctx>("project.defense", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "defense");
  const { id } = await params;
  const b = await parseBody(req, Body);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  await assertSingleProject(s, id);
  const acc = await projectAccess(s, id, "edit");
  const bundle = await loadProjectBundle(acc.db, id, acc.ownerId);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");
  try {
    const out = b.mode === "questions"
      ? await defenseQuestions({ planId: s.profile.plan_id, project: bundle.project, stages: bundle.stages, count: b.count, focus: b.focus, level: b.level })
      : await defenseFeedback({ planId: s.profile.plan_id, project: bundle.project, stages: bundle.stages, question: b.question, answer: b.answer });
    await recordUsage(s.user.id, "ai_request", { usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: `defense_${b.mode}`, projectId: id } });
    return json("questions" in out ? { questions: out.questions } : { feedback: out.feedback });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(422, e instanceof Error ? e.message : "Prova hazırlanamadı");
  }
});
