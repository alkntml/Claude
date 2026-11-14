import { z } from "zod";
import { assertSingleProject } from "@/lib/single-project";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { suggestTitles } from "@/lib/titles";
import { assertWithinLimits, recordUsage, setupRequestQuantity } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

/** Çalışma başlığı önerileri */
export const POST = route<Ctx>("project.titles", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ hint: z.string().max(500).optional() }));
  const { project } = await projectAccess(s, id, "edit");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  await assertSingleProject(s, id);
  try {
    const out = await suggestTitles({ planId: s.profile.plan_id, project, hint: b.hint });
    await recordUsage(s.user.id, "ai_request", { usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: "titles", projectId: id }, quantity: await setupRequestQuantity(s.user.id, id, "titles") });
    return json({ titles: out.titles });
  } catch (e) {
    throw new ApiError(422, e instanceof Error ? e.message : "Başlık önerileri oluşturulamadı");
  }
});
