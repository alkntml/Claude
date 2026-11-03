import { z } from "zod";
import { assertDeleted, ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("comments.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data } = await s.supabase.from("stage_comments").select("*").eq("stage_id", id).eq("user_id", s.user.id).order("created_at");
  return json({ comments: data ?? [] });
});

export const POST = route<Ctx>("comments.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ body: z.string().trim().min(1).max(5000), quote: z.string().max(1000).default("") }));
  const { data: stage } = await s.supabase.from("project_stages").select("project_id").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!stage) throw new ApiError(404, "Bölüm bulunamadı");
  const { data, error } = await s.supabase.from("stage_comments").insert({ stage_id: id, project_id: stage.project_id, user_id: s.user.id, body: b.body, quote: b.quote }).select().single();
  if (error) throw error;
  return json({ comment: data }, 201);
});

export const PATCH = route<Ctx>("comments.update", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({ commentId: z.string().uuid(), resolved: z.boolean().optional(), delete: z.boolean().optional() }));
  if (b.delete) assertDeleted(await s.supabase.from("stage_comments").delete().eq("id", b.commentId).eq("user_id", s.user.id).select("id"), "Yorum bulunamadı");
  else await s.supabase.from("stage_comments").update({ resolved: !!b.resolved }).eq("id", b.commentId).eq("user_id", s.user.id);
  return json({ ok: true });
});
