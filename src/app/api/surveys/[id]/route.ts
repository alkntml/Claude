import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { QuestionsSchema } from "@/lib/surveys";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("survey.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data } = await s.supabase.from("surveys").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Anket bulunamadı");
  return json({ survey: data });
});

const Patch = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  consent: z.string().max(8000).optional(),
  questions: QuestionsSchema.optional(),
  isOpen: z.boolean().optional(),
  maxResponses: z.number().int().min(1).max(100000).nullable().optional(),
  closesAt: z.string().datetime({ offset: true }).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
});

export const PATCH = route<Ctx>("survey.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, Patch);
  const { data: cur } = await s.supabase.from("surveys").select("id, response_count, questions").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!cur) throw new ApiError(404, "Anket bulunamadı");
  // Cevap gelmeye başladıktan sonra soru yapısı değiştirilemez (veri sütunları bozulmasın); metin düzeltmesine izin verilir
  if (b.questions && cur.response_count > 0) {
    const shape = (qs: unknown) => JSON.stringify((qs as { id: string; type: string; code: string; options?: unknown[]; items?: unknown[]; points?: number }[]).map((q) => [q.id, q.type, q.code, q.options?.length ?? 0, q.items?.length ?? 0, q.points ?? 0]));
    if (shape(b.questions) !== shape(cur.questions)) throw new ApiError(409, "Cevap almaya başlamış bir anketin soru yapısı değiştirilemez. Yalnızca yazım düzeltmesi yapabilirsiniz; yeni sorular için anketin kopyasını oluşturun.");
  }
  if (b.isOpen && !(b.questions ?? (cur.questions as unknown[])).length) throw new ApiError(422, "Yayına almadan önce en az bir soru ekleyin");
  if (b.projectId) await requireProject(s, b.projectId);
  const upd: Record<string, unknown> = {};
  if (b.title !== undefined) upd.title = b.title;
  if (b.description !== undefined) upd.description = b.description;
  if (b.consent !== undefined) upd.consent = b.consent;
  if (b.questions !== undefined) upd.questions = b.questions;
  if (b.isOpen !== undefined) upd.is_open = b.isOpen;
  if (b.maxResponses !== undefined) upd.max_responses = b.maxResponses;
  if (b.closesAt !== undefined) upd.closes_at = b.closesAt;
  if (b.projectId !== undefined) upd.project_id = b.projectId;
  const { data, error } = await s.supabase.from("surveys").update(upd).eq("id", id).eq("user_id", s.user.id).select("*").single();
  if (error) throw error;
  return json({ survey: data });
});

export const DELETE = route<Ctx>("survey.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await s.supabase.from("surveys").delete().eq("id", id).eq("user_id", s.user.id);
  return json({ ok: true });
});
