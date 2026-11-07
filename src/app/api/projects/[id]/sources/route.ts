import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { addSourcesToProject } from "@/lib/research";
import { SourceInput } from "@/lib/sources/input";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("project.sources.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { db } = await projectAccess(s, id, "read");
  const { data } = await db.from("sources").select("*").eq("project_id", id).order("created_at");
  return json({ sources: data ?? [] });
});

/** Kaynak(lar) ekler ve tanımlayıcısı olanları otomatik doğrular. */
export const POST = route<Ctx>("project.sources.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { db, ownerId } = await projectAccess(s, id, "edit");
  const { sources } = await parseBody(req, z.object({ sources: z.array(SourceInput).min(1).max(30) }));
  const result = await addSourcesToProject(db, id, ownerId, sources);
  return json(result, 201);
});
