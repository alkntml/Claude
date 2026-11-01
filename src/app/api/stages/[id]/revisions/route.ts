import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("revisions.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data } = await s.supabase.from("stage_revisions").select("id, note, author, word_count, created_at").eq("stage_id", id).eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(100);
  return json({ revisions: data ?? [] });
});

/** Bir revizyonu geri yükler (geri yüklemeden önce mevcut hâl yeni revizyon olarak saklanır). */
export const POST = route<Ctx>("revisions.restore", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { revisionId } = await parseBody(req, z.object({ revisionId: z.string().uuid() }));
  const [{ data: rev }, { data: stage }] = await Promise.all([
    s.supabase.from("stage_revisions").select("*").eq("id", revisionId).eq("stage_id", id).eq("user_id", s.user.id).maybeSingle(),
    s.supabase.from("project_stages").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle(),
  ]);
  if (!rev || !stage) throw new ApiError(404, "Revizyon bulunamadı");
  await s.supabase.from("stage_revisions").insert({ stage_id: id, project_id: stage.project_id, user_id: s.user.id, content: stage.content, content_text: stage.content_text, word_count: stage.word_count, note: "Geri yükleme öncesi otomatik yedek", author: "system" });
  const { data, error } = await s.supabase.from("project_stages").update({ content: rev.content, content_text: rev.content_text, word_count: rev.word_count, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return json({ stage: data });
});
