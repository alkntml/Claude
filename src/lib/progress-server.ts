import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { computeProgress, type ProjectProgress } from "@/lib/progress";

/** D191: ilerleme verisi; her sorgu açık project_id filtresiyle (sunucu anahtarıyla çağrılsa da başka çalışmaya taşmaz) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function loadProgress(db: SupabaseClient, project: any): Promise<ProjectProgress> {
  const [stages, comments, quality] = await Promise.all([
    db.from("project_stages").select("id, key, title, position, word_count, updated_at, hidden").eq("project_id", project.id),
    db.from("stage_comments").select("stage_id, resolved").eq("project_id", project.id).limit(5000),
    db.from("quality_reports").select("score, created_at").eq("project_id", project.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return computeProgress({ context: project.context ?? {}, stages: stages.data ?? [], comments: comments.data ?? [], quality: quality.data ?? null });
}
