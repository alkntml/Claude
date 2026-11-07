import { z } from "zod";
import { assertSingleProject } from "@/lib/single-project";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { alignChapters, BLUEPRINT_FIELDS, BlueprintSchema, readBlueprint } from "@/lib/blueprint";
import { generateBlueprint, refineField } from "@/lib/blueprint-ai";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const FIELD = z.enum(["questions", ...BLUEPRINT_FIELDS.map((f) => f.key)] as [string, ...string[]]);

/** Kurgu için yapay zekâ (D67): tüm kurguyu üret (öğrencinin girişiyle) veya tek alanı yeniden öner. Sonuç kaydedilmez. */
export const POST = route<Ctx>("project.blueprint.ai", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("generate"), input: z.string().max(2000).default(""), targetWords: z.number().int().min(0).max(500000).default(0), wordsPerPage: z.number().int().min(150).max(600).optional() }),
    z.object({ mode: z.literal("field"), field: FIELD, instruction: z.string().max(500).optional(), blueprint: BlueprintSchema }),
  ]));
  const { project, db, ownerId } = await projectAccess(s, id, "edit");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  await assertSingleProject(s, id);
  const record = (o: { usage: { input: number; output: number }; cost: number; provider: string; model: string }, action: string) =>
    recordUsage(s.user.id, "ai_request", { usage: o.usage, costUsd: o.cost, provider: o.provider, model: o.model, meta: { action, projectId: id } });
  try {
    if (b.mode === "generate") {
      const { data: stages } = await db.from("project_stages").select("id, key, title, description").eq("project_id", id).eq("user_id", ownerId).order("position");
      const out = await generateBlueprint(s.profile.plan_id, { project, stages: stages ?? [], input: b.input, previous: readBlueprint(project.context?.blueprint), targetWords: b.targetWords, wordsPerPage: b.wordsPerPage });
      await record(out, "blueprint");
      return json({ blueprint: out.blueprint });
    }
    const out = await refineField(s.profile.plan_id, { project, blueprint: b.blueprint, field: b.field as never, instruction: b.instruction });
    await record(out, "blueprint_field");
    return json({ text: out.text, questions: out.questions });
  } catch (e) {
    throw new ApiError(422, e instanceof Error ? e.message : "Kurgu oluşturulamadı");
  }
});

/** Kurguyu kaydeder; `approve` ile onaylar (sonraki yazımlar bu plana göre ilerler) */
export const PUT = route<Ctx>("project.blueprint.save", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ blueprint: BlueprintSchema, approve: z.boolean().optional() }));
  const { project, db, ownerId } = await projectAccess(s, id, "edit");
  const { data: stages } = await db.from("project_stages").select("id, key, title").eq("project_id", id).eq("user_id", ownerId).order("position");
  const now = new Date().toISOString();
  const prev = readBlueprint(project.context?.blueprint);
  const blueprint = {
    ...b.blueprint,
    chapters: alignChapters(b.blueprint, stages ?? []),
    approvedAt: b.approve ? now : b.approve === false ? null : prev?.approvedAt ?? b.blueprint.approvedAt ?? null,
    updatedAt: now,
  };
  if (JSON.stringify(blueprint).length > 40000) throw new ApiError(413, "Kurgu çok uzun; bazı alanları kısaltın");
  const { data, error } = await db.from("projects").update({ context: { ...(project.context ?? {}), blueprint } }).eq("id", id).eq("user_id", ownerId).select().single();
  if (error) throw error;
  return json({ project: data });
});
