import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { autoSync, listLinks, removeLink, syncLink } from "@/lib/sources/sync";
import { hasFeature } from "@/lib/features";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 300;
const Provider = z.enum(["zotero", "orcid"]);

/** D192: çalışmanın Zotero/ORCID bağlantıları (anahtar hiçbir zaman döndürülmez) */
export const GET = route<Ctx>("project.sources.sync.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await projectAccess(s, id, "read");
  return json({ links: await listLinks(id) });
});

/** Şimdi eşitle (provider) veya çalışma açılınca kendiliğinden eşitleme (auto: yalnızca eskiyen bağlantılar) */
export const POST = route<Ctx>("project.sources.sync", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { db, ownerId } = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ provider: Provider.optional(), auto: z.boolean().default(false) }));
  // Paket kaynak aktarımını içermiyorsa kendiliğinden eşitleme sessizce atlanır
  if (b.auto) return json(hasFeature(s.profile.plan_id, "bib_io") ? await autoSync(db, id, ownerId) : { synced: [], added: [] });
  assertFeature(s.profile.plan_id, "bib_io");
  if (!b.provider) throw new ApiError(422, "Eşitlenecek bağlantıyı seçin");
  try { return json(await syncLink(db, id, ownerId, b.provider)); }
  catch (e) { throw new ApiError(502, (e as Error).message); }
});

/** Bağlantıyı kaldırır (Zotero anahtarı silinir; eklenmiş kaynaklar projede kalır) */
export const DELETE = route<Ctx>("project.sources.sync.remove", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ provider: Provider }));
  await removeLink(id, b.provider);
  return json({ ok: true });
});
