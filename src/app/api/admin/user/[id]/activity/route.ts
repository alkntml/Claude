import { ApiError, json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { activitySummary, type ActivityRow } from "@/lib/activity-summary";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Kullanım kanıt kaydı (D102): kullanıcının aldığı yapay zekâ çıktıları ve sildikleri. `?log=ID` tek kaydın tam metnini
 * verir. 12 aydan eski kayıtlar okunurken temizlenir.
 */
export const GET = route<Ctx>("admin.user.activity", async (req, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const db = adminClient();
  const url = new URL(req.url);
  const log = url.searchParams.get("log");
  if (log) {
    const { data } = await db.from("activity_log").select("id, output, created_at, action, project_title, stage_title, words").eq("user_id", id).eq("id", Number(log)).maybeSingle();
    if (!data) throw new ApiError(404, "Kayıt bulunamadı");
    return json({ item: data });
  }
  await db.from("activity_log").delete().eq("user_id", id).lt("created_at", new Date(Date.now() - 365 * 86400_000).toISOString());
  const rows: ActivityRow[] = [];
  for (let from = 0; from < 20000; from += 1000) {
    const { data, error } = await db.from("activity_log").select("id, kind, action, project_title, stage_title, words, words_before, model, created_at").eq("user_id", id).order("created_at", { ascending: false }).range(from, from + 999);
    if (error) return json({ summary: null, items: [], missing: true });
    rows.push(...((data ?? []) as ActivityRow[]));
    if (!data || data.length < 1000) break;
  }
  // Liste için ilk 150 kaydın kısa önizlemesi
  const ids = rows.slice(0, 150).filter((r) => r.kind === "ai_output").map((r) => r.id);
  const previews: Record<number, string> = {};
  if (ids.length) {
    const { data } = await db.from("activity_log").select("id, output").in("id", ids);
    for (const r of data ?? []) previews[r.id as number] = String(r.output ?? "").replace(/:::(taslak|eksik|hafiza)[^\n]*\n?/g, "").replace(/\s+/g, " ").slice(0, 180);
  }
  return json({ summary: activitySummary(rows), items: rows.slice(0, 150).map((r) => ({ ...r, preview: previews[r.id] ?? null })) });
});
