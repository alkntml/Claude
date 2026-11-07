import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { titleSimilarity } from "@/lib/citations/checks";
import { addSourcesToProject } from "@/lib/research";
import { parseReferences } from "@/lib/sources/bib";
import { SourceInput } from "@/lib/sources/input";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 300;

const MAX_ENTRIES = 300;

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
  const { format, refs } = parseReferences(b.text, b.format ?? null);
  if (!format) throw new ApiError(422, "Dosya biçimi tanınmadı. BibTeX (.bib), RIS (.ris) veya CSL-JSON (.json) yükleyin.");
  if (!refs.length) throw new ApiError(422, "Dosyada okunabilir kaynak bulunamadı");

  const { data: existing } = await db.from("sources").select("title, doi").eq("project_id", id).eq("user_id", ownerId);
  const valid: z.infer<typeof SourceInput>[] = [];
  let invalid = 0, duplicates = 0;
  for (const r of refs.slice(0, MAX_ENTRIES)) {
    const parsed = SourceInput.safeParse({ ...r, origins: ["import"] });
    if (!parsed.success) { invalid++; continue; }
    const dupTitle = !parsed.data.doi && (existing ?? []).some((e) => titleSimilarity(e.title, parsed.data.title) >= 0.92);
    const dupInFile = valid.some((v) => (v.doi && v.doi === parsed.data.doi) || titleSimilarity(v.title, parsed.data.title) >= 0.95);
    if (dupTitle || dupInFile) { duplicates++; continue; }
    valid.push(parsed.data);
  }
  const added = valid.length ? await addSourcesToProject(db, id, ownerId, valid) : { sources: [], skipped: 0 };
  return json({
    format,
    found: refs.length,
    truncated: Math.max(0, refs.length - MAX_ENTRIES),
    added: added.sources,
    duplicates: duplicates + added.skipped,
    invalid,
  }, 201);
});
