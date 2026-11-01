import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { pdfPageLabels } from "./pages";

/**
 * Yüklenen PDF'in parçalarındaki "s. N" (PDF sırası) ipuçlarını yayındaki sayfa numarasına çevirir.
 * Güncelleme parça kimliğiyle yapılır (sayfa numaraları çakışsa bile çift dönüşüm olmaz).
 */
export async function remapChunkPages(db: SupabaseClient, sourceId: string, sourcePages: string | null | undefined) {
  const { data } = await db.from("source_chunks").select("id, page_hint").eq("source_id", sourceId).limit(5000);
  const rows = (data ?? []).map((r) => ({ id: r.id as number, page: Number(String(r.page_hint ?? "").replace(/^s\.\s*/, "")) || null }));
  const max = Math.max(0, ...rows.map((r) => r.page ?? 0));
  if (!max) return;
  const labels = pdfPageLabels(sourcePages, max);
  const groups = new Map<string, number[]>();
  for (const r of rows) {
    if (!r.page) continue;
    const label = labels[r.page - 1];
    const hint = label ? `s. ${label}` : "";
    if (hint === `s. ${r.page}`) continue;
    groups.set(hint, [...(groups.get(hint) ?? []), r.id]);
  }
  for (const [hint, ids] of groups) {
    for (let k = 0; k < ids.length; k += 500) await db.from("source_chunks").update({ page_hint: hint || null }).in("id", ids.slice(k, k + 500));
  }
}
