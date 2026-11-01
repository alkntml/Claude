import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { STYLE_IDS } from "@/lib/citations";

type Ctx = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  citationStyle: z.enum(STYLE_IDS as [string, ...string[]]).optional(),
  language: z.enum(["tr", "en"]).optional(),
  discipline: z.string().max(200).optional(),
  academicLevel: z.enum(["bachelor", "master", "doctorate", "postdoc", "other"]).optional(),
  topic: z.string().max(4000).optional(),
  keywords: z.array(z.string().max(80)).max(20).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export const GET = route<Ctx>("projects.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const project = await requireProject(s, id);
  await s.supabase.from("projects").update({ last_opened_at: new Date().toISOString() }).eq("id", id);
  return json({ project });
});

export const PATCH = route<Ctx>("projects.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const current = await requireProject(s, id);
  const b = await parseBody(req, PatchSchema);
  const update: Record<string, unknown> = {};
  if (b.title !== undefined) update.title = b.title;
  if (b.status !== undefined) update.status = b.status;
  if (b.citationStyle !== undefined) update.citation_style = b.citationStyle;
  if (b.language !== undefined) update.language = b.language;
  if (b.discipline !== undefined) update.discipline = b.discipline;
  if (b.academicLevel !== undefined) update.academic_level = b.academicLevel;
  if (b.topic !== undefined) update.topic = b.topic;
  if (b.keywords !== undefined) update.keywords = b.keywords;
  if (b.context !== undefined) {
    if (JSON.stringify(b.context).length > 20000) throw new ApiError(413, "Bağlam çok büyük");
    update.context = { ...(current.context ?? {}), ...b.context };
  }
  const { data, error } = await s.supabase.from("projects").update(update).eq("id", id).select().single();
  if (error) throw error;
  return json({ project: data });
});

export const DELETE = route<Ctx>("projects.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { error } = await s.supabase.from("projects").delete().eq("id", id).eq("user_id", s.user.id);
  if (error) throw error;
  return json({ ok: true });
});
