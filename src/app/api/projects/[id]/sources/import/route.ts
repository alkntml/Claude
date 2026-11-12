import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { importReferenceText } from "@/lib/sources/import-refs";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 300;

/**
 * Zotero / Mendeley / EndNote dışa aktarımını (BibTeX, RIS, CSL-JSON) projeye aktarır.
 * Kaynaklar DOI ile doğrulanır; projede zaten olanlar (aynı DOI veya çok benzer başlık) atlanır.
 */
export const POST = route<Ctx>("project.sources.import", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "bib_io");
  const { id } = await params;
  const { db, ownerId } = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ text: z.string().min(10).max(5_000_000), format: z.enum(["bibtex", "ris", "csljson"]).nullable().optional() }));
  const out = await importReferenceText(db, id, ownerId, b.text, b.format ?? null);
  if (!out.format) throw new ApiError(422, "Dosya biçimi tanınmadı. BibTeX (.bib), RIS (.ris) veya CSL-JSON (.json) yükleyin.");
  if (!out.found) throw new ApiError(422, "Dosyada okunabilir kaynak bulunamadı");
  return json(out, 201);
});
