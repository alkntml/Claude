import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/** KVKK / GDPR: kullanıcının tüm verisi (taşınabilir JSON). Her tabloda açık user_id filtresi. */
export const EXPORT_TABLES = ["projects", "project_stages", "stage_revisions", "stage_comments", "project_memory", "sources", "ai_conversations", "ai_messages", "files", "quality_reports", "subscriptions", "usage_events", "feedback"];

export async function buildUserExport(db: SupabaseClient, userId: string, profile: unknown) {
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), profile };
  for (const t of EXPORT_TABLES) {
    const { data } = await db.from(t).select("*").eq("user_id", userId).limit(50000);
    out[t] = data ?? [];
  }
  return out;
}
