import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { suggestTitles } from "@/lib/titles";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

/** Çalışma başlığı önerileri */
export const POST = route<Ctx>("project.titles", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ hint: z.string().max(500).optional() }));
  const project = await requireProject(s, id);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  try {
    const out = await suggestTitles({ planId: s.profile.plan_id, project, hint: b.hint });
    await recordUsage(s.user.id, "ai_request", { usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: "titles", projectId: id } });
    return json({ titles: out.titles });
  } catch (e) {
    throw new ApiError(422, e instanceof Error ? e.message : "Başlık önerileri oluşturulamadı");
  }
});
