import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { loadProgress } from "@/lib/progress-server";

type Ctx = { params: Promise<{ id: string }> };

/** D191: çalışmanın bölüm bölüm ilerlemesi (sahip, ortak yazar, yorumcu ve danışman görür) */
export const GET = route<Ctx>("project.progress", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const acc = await projectAccess(s, id, "read");
  return json(await loadProgress(acc.db, acc.project));
});
