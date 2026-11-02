import { ApiError, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { citedIdsInOrder, type JSONNode } from "@/lib/editor/doc";
import { toBibTeX, toRIS } from "@/lib/sources/bib";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { assertFeature, assertWithinLimits } from "@/lib/usage";
import { getWorkLock } from "@/lib/lock";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/** Proje kaynaklarını BibTeX veya RIS olarak indirir (Zotero, Mendeley, EndNote içe aktarabilir). */
export const GET = route<Ctx>("project.sources.export", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "bib_io");
  const { id } = await params;
  await requireProject(s, id);
  const url = new URL(req.url);
  const format = url.searchParams.get("format");
  if (format !== "bib" && format !== "ris") throw new ApiError(422, "Desteklenmeyen biçim");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "export", { projectId: id });
  const db = (await getWorkLock()).locked ? adminClient() : s.supabase;
  const { data: sources } = await db.from("sources").select("*").eq("project_id", id).eq("user_id", s.user.id).order("created_at");
  let rows = sources ?? [];
  if (url.searchParams.get("scope") === "cited") {
    const { data: stages } = await db.from("project_stages").select("content, position").eq("project_id", id).order("position");
    const order = citedIdsInOrder((stages ?? []).map((x) => x.content as JSONNode));
    rows = order.map((sid) => rows.find((r) => r.id === sid)).filter(Boolean) as typeof rows;
  }
  const items = rows.map(sourceRowToItemClient);
  const body = format === "bib" ? toBibTeX(items) : toRIS(items);
  return new Response(body, {
    headers: {
      "Content-Type": format === "bib" ? "application/x-bibtex; charset=utf-8" : "application/x-research-info-systems; charset=utf-8",
      "Content-Disposition": `attachment; filename="kaynaklar.${format}"`,
      "Cache-Control": "no-store",
    },
  });
});
