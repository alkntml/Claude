import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { titleSimilarity } from "@/lib/citations/checks";
import { addSourcesToProject } from "@/lib/research";
import { parseReferences, type ImportFormat } from "@/lib/sources/bib";
import { SourceInput } from "@/lib/sources/input";

const MAX_ENTRIES = 300;

/**
 * Kaynak listesi içe aktarma (BibTeX, RIS, CSL-JSON): dosyadan veya Zotero’dan (D149). Kaynaklar DOI ile doğrulanır;
 * projede zaten olanlar (aynı DOI veya çok benzer başlık) atlanır.
 */
export async function importReferenceText(db: SupabaseClient, projectId: string, ownerId: string, text: string, format: ImportFormat | null, origin = "import") {
  const parsed = parseReferences(text, format);
  if (!parsed.format) return { format: null, found: 0, truncated: 0, added: [] as unknown[], duplicates: 0, invalid: 0 };
  const refs = parsed.refs;
  const { data: existing } = await db.from("sources").select("title, doi").eq("project_id", projectId).eq("user_id", ownerId);
  const valid: z.infer<typeof SourceInput>[] = [];
  let invalid = 0, duplicates = 0;
  for (const r of refs.slice(0, MAX_ENTRIES)) {
    const p = SourceInput.safeParse({ ...r, origins: [origin] });
    if (!p.success) { invalid++; continue; }
    const dupTitle = !p.data.doi && (existing ?? []).some((e) => titleSimilarity(e.title, p.data.title) >= 0.92);
    const dupInFile = valid.some((v) => (v.doi && v.doi === p.data.doi) || titleSimilarity(v.title, p.data.title) >= 0.95);
    if (dupTitle || dupInFile) { duplicates++; continue; }
    valid.push(p.data);
  }
  const added = valid.length ? await addSourcesToProject(db, projectId, ownerId, valid) : { sources: [], skipped: 0 };
  return { format: parsed.format, found: refs.length, truncated: Math.max(0, refs.length - MAX_ENTRIES), added: added.sources, duplicates: duplicates + added.skipped, invalid };
}
