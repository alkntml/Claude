import { z } from "zod";
import { assertDeleted, ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { childAccess, displayName } from "@/lib/project-access";
import { compatWrite } from "@/lib/db-compat";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("comments.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: stage, access } = await childAccess(s, "project_stages", id, "read", "id");
  const { data } = await access.db.from("stage_comments").select("*").eq("stage_id", id).eq("project_id", stage.project_id).eq("user_id", access.ownerId).order("created_at");
  // Kendi yorumu olmayanlar adla gösterilir (danışman yorumu author_name taşır)
  return json({ comments: (data ?? []).map((c) => ({ ...c, mine: c.actor_id ? c.actor_id === s.user.id : access.isOwner && !c.share_id })) });
});

export const POST = route<Ctx>("comments.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ body: z.string().trim().min(1).max(5000), quote: z.string().max(1000).default("") }));
  const { row: stage, access } = await childAccess(s, "project_stages", id, "comment", "id");
  const { data, error } = await compatWrite({
    stage_id: id, project_id: stage.project_id, user_id: access.ownerId, actor_id: s.user.id, body: b.body, quote: b.quote,
    ...(access.isOwner ? {} : { author_name: displayName(s.profile) }),
  }, (row) => access.db.from("stage_comments").insert(row).select().single());
  if (error) throw error;
  return json({ comment: { ...data, mine: true } }, 201);
});

/** Çözüldü işareti: yazabilen herkes; silme: sahip her yorumu, ortak yazar yalnızca kendi yorumunu */
export const PATCH = route<Ctx>("comments.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ commentId: z.string().uuid(), resolved: z.boolean().optional(), delete: z.boolean().optional() }));
  const { row: stage, access } = await childAccess(s, "project_stages", id, "comment", "id");
  const { data: c } = await access.db.from("stage_comments").select("*").eq("id", b.commentId).eq("stage_id", id).eq("project_id", stage.project_id).maybeSingle();
  if (!c) throw new ApiError(404, "Yorum bulunamadı");
  const own = c.actor_id === s.user.id;
  if (b.delete) {
    if (!access.isOwner && !own) throw new ApiError(403, "Yalnızca kendi yorumunuzu silebilirsiniz", "role_denied");
    assertDeleted(await access.db.from("stage_comments").delete().eq("id", b.commentId).eq("project_id", stage.project_id).select("id"), "Yorum bulunamadı");
  } else {
    if (access.role === "commenter" && !own) throw new ApiError(403, "Bu yorumu yalnızca yazanı veya çalışmanın sahibi çözebilir", "role_denied");
    await access.db.from("stage_comments").update({ resolved: !!b.resolved }).eq("id", b.commentId).eq("project_id", stage.project_id);
  }
  return json({ ok: true });
});
