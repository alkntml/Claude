import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { addSourcesToProject } from "@/lib/research";
import { SourceInput } from "@/lib/sources/input";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("project.sources.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { data } = await s.supabase.from("sources").select("*").eq("project_id", id).order("created_at");
  return json({ sources: data ?? [] });
});

/** Kaynak(lar) ekler ve tanımlayıcısı olanları otomatik doğrular. */
export const POST = route<Ctx>("project.sources.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { sources } = await parseBody(req, z.object({ sources: z.array(SourceInput).min(1).max(30) }));
  const result = await addSourcesToProject(s.supabase, id, s.user.id, sources);
  return json(result, 201);
});
