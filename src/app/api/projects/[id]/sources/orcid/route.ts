import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { importReferenceText } from "@/lib/sources/import-refs";
import { fetchOrcidWorks, normalizeOrcid, OrcidError } from "@/lib/sources/orcid";
import { saveLink } from "@/lib/sources/sync";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 300;

/** D192: ORCID numarasındaki herkese açık yayınları projeye aktarır; “eşitle” seçilirse yeni yayınlar sonra da eklenir */
export const POST = route<Ctx>("project.sources.orcid", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "bib_io");
  const { id } = await params;
  const { db, ownerId } = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ orcid: z.string().trim().max(60), remember: z.boolean().default(false) }));
  const orcid = normalizeOrcid(b.orcid);
  if (!orcid) throw new ApiError(422, "ORCID numarası geçersiz (ör. 0000-0002-1825-0097)");
  let works: Awaited<ReturnType<typeof fetchOrcidWorks>>;
  try { works = await fetchOrcidWorks(orcid); }
  catch (e) { if (e instanceof OrcidError) throw new ApiError(e.status, e.message); throw e; }
  const out = await importReferenceText(db, id, ownerId, works.text, "csljson", "orcid");
  if (b.remember) await saveLink({ projectId: id, ownerId, provider: "orcid", config: { orcid, name: works.name }, result: { added: out.added.length, duplicates: out.duplicates } });
  if (!works.count && !b.remember) throw new ApiError(422, "Bu ORCID kaydında herkese açık yayın bulunamadı");
  return json({ ...out, name: works.name }, 201);
});
