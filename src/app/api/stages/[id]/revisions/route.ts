import { z } from "zod";
import { assertDeleted, ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { childAccess, displayName } from "@/lib/project-access";
import { docToPlain, wordCount, type JSONNode } from "@/lib/editor/doc";
import { compatWrite, isMissingColumn } from "@/lib/db-compat";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("revisions.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: stage, access } = await childAccess(s, "project_stages", id, "read", "id");
  const list = (cols: string) => access.db.from("stage_revisions").select(cols).eq("stage_id", id).eq("project_id", stage.project_id).eq("user_id", access.ownerId).order("created_at", { ascending: false }).limit(100);
  let r = await list("id, note, author, word_count, created_at, actor_id");
  if (isMissingColumn(r.error)) r = await list("id, note, author, word_count, created_at");
  const data = (r.data ?? []) as unknown as { id: string; note: string; author: string; word_count: number; created_at: string; actor_id?: string | null }[];
  // Ortak yazım (D115): sürümü kimin oluşturduğu (yalnızca başkası oluşturduysa ad gösterilir)
  const actors = [...new Set(data.map((x) => x.actor_id).filter((x): x is string => !!x && x !== s.user.id))];
  const { data: names } = actors.length ? await adminClient().from("profiles").select("id, full_name, email").in("id", actors) : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
  const nameOf = (uid: string | null) => (uid && uid !== s.user.id ? displayName((names ?? []).find((n) => n.id === uid)) : null);
  return json({ revisions: data.map(({ actor_id, ...x }) => ({ ...x, by: nameOf(actor_id ?? null) })) });
});

/**
 * Bir revizyonu geri yükler (geri yüklemeden önce mevcut hâl yeni revizyon olarak saklanır).
 * `content` verilirse yalnızca sürüm olarak saklar (ortak yazımda çakışan yerel metin kaybolmasın — D115).
 */
export const POST = route<Ctx>("revisions.restore", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const body = await parseBody(req, z.union([
    z.object({ revisionId: z.string().uuid() }),
    z.object({ content: z.record(z.string(), z.unknown()), note: z.string().max(300).default("") }),
  ]));
  const { row: stage, access } = await childAccess(s, "project_stages", id, "edit");
  const db = access.db;
  if ("content" in body) {
    if (body.content.type !== "doc" || JSON.stringify(body.content).length > 2_000_000) throw new ApiError(422, "Geçersiz belge");
    const text = docToPlain(body.content as unknown as JSONNode);
    await compatWrite({ stage_id: id, project_id: stage.project_id, user_id: access.ownerId, actor_id: s.user.id, content: body.content, content_text: text, word_count: wordCount(text), note: body.note, author: "user" }, (row) => db.from("stage_revisions").insert(row));
    return json({ ok: true }, 201);
  }
  const { revisionId } = body;
  const { data: rev } = await db.from("stage_revisions").select("*").eq("id", revisionId).eq("stage_id", id).eq("user_id", access.ownerId).maybeSingle();
  if (!rev) throw new ApiError(404, "Revizyon bulunamadı");
  await compatWrite({ stage_id: id, project_id: stage.project_id, user_id: access.ownerId, actor_id: s.user.id, content: stage.content, content_text: stage.content_text, word_count: stage.word_count, note: "Geri yükleme öncesi otomatik yedek", author: "system" }, (row) => db.from("stage_revisions").insert(row));
  const { data, error } = await compatWrite({ content: rev.content, content_text: rev.content_text, word_count: rev.word_count, updated_at: new Date().toISOString(), last_editor: s.user.id }, (row) => db.from("project_stages").update(row).eq("id", id).eq("project_id", stage.project_id).select().single());
  if (error) throw error;
  return json({ stage: data });
});

/** Tek bir sürümü kalıcı olarak siler (yalnızca çalışmanın sahibi). */
export const DELETE = route<Ctx>("revisions.delete", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { revisionId } = await parseBody(req, z.object({ revisionId: z.string().uuid() }));
  assertDeleted(await s.supabase.from("stage_revisions").delete().eq("id", revisionId).eq("stage_id", id).eq("user_id", s.user.id).select("id"), "Sürüm bulunamadı");
  return json({ ok: true });
});
