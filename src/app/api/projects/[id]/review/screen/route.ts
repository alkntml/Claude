import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { EMPTY_PROTOCOL } from "@/lib/prisma";
import { projectAccess } from "@/lib/project-access";
import { screenSuggestions } from "@/lib/review-ai";
import { assertSingleProject } from "@/lib/single-project";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 90;

/** Başlık/özet taraması için yapay zekâ ÖNERİSİ (D122). Karar kullanıcıdadır; öneri kayda yazılır. */
export const POST = route<Ctx>("review.screen", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  await assertSingleProject(s, id);
  const b = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(25) }));
  const protocol = { ...EMPTY_PROTOCOL, ...(acc.project.context?.review ?? {}) };
  if (!protocol.inclusion.length && !protocol.exclusion.length) throw new ApiError(422, "Önce protokolde dahil etme ve hariç tutma ölçütlerini yazın");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const { data: recs } = await acc.db.from("review_records").select("id, record").eq("project_id", id).eq("user_id", acc.ownerId).in("id", b.ids);
  if (!recs?.length) throw new ApiError(404, "Kayıt bulunamadı");
  const r = await screenSuggestions({ planId: s.profile.plan_id, lang: localeFromRequest(req), protocol, records: recs });
  await Promise.all(r.out.filter((x) => x.ai).map((x) => acc.db.from("review_records").update({ ai: x.ai }).eq("id", x.id).eq("project_id", id).eq("user_id", acc.ownerId)));
  await recordUsage(s.user.id, "ai_request", { usage: r.usage, costUsd: r.cost, provider: r.provider, model: r.model, meta: { action: "review_screen", projectId: id, records: recs.length } });
  return json({ suggestions: r.out });
});
