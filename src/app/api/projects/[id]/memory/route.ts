import { z } from "zod";
import { assertDeleted, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };
const Kind = z.enum(["fact", "decision", "concept", "variable", "question", "hypothesis", "note"]);

export const GET = route<Ctx>("memory.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { data } = await s.supabase.from("project_memory").select("*").eq("project_id", id).order("created_at");
  return json({ memory: data ?? [] });
});

export const POST = route<Ctx>("memory.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const b = await parseBody(req, z.object({ kind: Kind, content: z.string().trim().min(1).max(4000) }));
  const { data, error } = await s.supabase.from("project_memory").insert({ project_id: id, user_id: s.user.id, kind: b.kind, content: b.content, source: "user" }).select().single();
  if (error) throw error;
  return json({ item: data }, 201);
});

export const DELETE = route<Ctx>("memory.delete", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { itemId } = await parseBody(req, z.object({ itemId: z.string().uuid() }));
  assertDeleted(await s.supabase.from("project_memory").delete().eq("id", itemId).eq("project_id", id).eq("user_id", s.user.id).select("id"));
  return json({ ok: true });
});
