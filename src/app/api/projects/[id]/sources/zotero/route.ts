import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { importReferenceText } from "@/lib/sources/import-refs";
import { fetchZotero, ZoteroError } from "@/lib/sources/zotero";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 300;

/** Zotero kütüphanesinden (veya bir koleksiyondan) doğrudan içe aktarma (D149). API anahtarı saklanmaz. */
export const POST = route<Ctx>("project.sources.zotero", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "bib_io");
  const { id } = await params;
  const { db, ownerId } = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({
    library: z.enum(["user", "group"]).default("user"),
    libraryId: z.string().trim().regex(/^\d{1,12}$/, "Kütüphane kimliği yalnızca rakamlardan oluşur"),
    apiKey: z.string().trim().regex(/^[A-Za-z0-9]{10,40}$/, "API anahtarı geçersiz görünüyor"),
    collection: z.string().trim().regex(/^[A-Z0-9]{8}$/, "Koleksiyon anahtarı 8 karakterdir (ör. ABCD2345)").optional().or(z.literal("")),
  }));
  let text: string;
  try { text = await fetchZotero({ library: b.library, libraryId: b.libraryId, apiKey: b.apiKey, collection: b.collection || null }); }
  catch (e) { if (e instanceof ZoteroError) throw new ApiError(e.status === 404 ? 404 : e.status === 403 ? 403 : 502, e.message); throw e; }
  const out = await importReferenceText(db, id, ownerId, text, "csljson", "zotero");
  if (!out.found) throw new ApiError(422, "Zotero kütüphanesinde içe aktarılacak kaynak bulunamadı");
  return json(out, 201);
});
