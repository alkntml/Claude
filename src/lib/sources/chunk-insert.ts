import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumn } from "@/lib/db-compat";

/**
 * Parçaları 200’lük gruplarla yazar. Bölüm sütunu (source_chunks.section, migration 36) canlıda henüz yoksa
 * bölüm bilgisi atılarak yeniden denenir; böylece PDF okuma migration’dan önce de çalışır (D132).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const stripSection = (r: Record<string, any>) => { const copy = { ...r }; delete copy.section; return copy; };

export async function insertChunks(db: SupabaseClient, rows: Record<string, any>[]) {
  let withSection = true;
  for (let k = 0; k < rows.length; k += 200) {
    const slice = rows.slice(k, k + 200);
    let { error } = await db.from("source_chunks").insert(withSection ? slice : slice.map(stripSection), { defaultToNull: false });
    if (error && withSection && isMissingColumn(error)) {
      withSection = false;
      ({ error } = await db.from("source_chunks").insert(slice.map(stripSection), { defaultToNull: false }));
    }
    if (error) throw error;
  }
}


/** Kaynak parçalarını bölüm bilgisiyle okur; bölüm sütunu yoksa (migration 36 öncesi) bölümsüz okur. */
export async function loadChunks(db: SupabaseClient, o: { sourceIds: string[]; userId: string; limit?: number }): Promise<{ source_id: string; content: string; page_hint: string | null; section: string | null }[]> {
  if (!o.sourceIds.length) return [];
  const q = (cols: string) => db.from("source_chunks").select(cols).in("source_id", o.sourceIds).eq("user_id", o.userId).order("chunk_index").limit(o.limit ?? 6000);
  let { data, error } = await q("source_id, content, page_hint, section");
  if (error && isMissingColumn(error)) ({ data, error } = await q("source_id, content, page_hint"));
  if (error) throw error;
  return ((data ?? []) as any[]).map((r) => ({ source_id: r.source_id, content: r.content, page_hint: r.page_hint ?? null, section: r.section ?? null }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */
