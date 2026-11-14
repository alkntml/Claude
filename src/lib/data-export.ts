import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminClient } from "@/lib/supabase/admin";

/** KVKK / GDPR: kullanıcının tüm verisi (taşınabilir JSON). Her tabloda açık user_id filtresi. */
export const EXPORT_TABLES = ["projects", "project_stages", "stage_revisions", "stage_comments", "project_memory", "sources", "ai_conversations", "ai_messages", "files", "quality_reports", "subscriptions", "usage_events", "feedback",
  // D154: KVKK Aydınlatma Metni’nde sayılan diğer kayıtlar (kullanıcının RLS ile okuyabildikleri)
  "surveys", "survey_responses", "project_shares", "notifications", "usage_credits", "claim_audits", "review_records", "download_passes", "data_requests", "legal_acceptances"];

/**
 * Yalnızca sunucunun yazıp okuduğu (kullanıcıya RLS ile kapalı) kayıtlar: kullanım kanıt kaydı, cihaz kimliği özetleri,
 * Tek Proje indirme izleri ve ödeme/paket tanımlama kayıtları. Service role ile ve açık user_id filtresiyle okunur.
 */
export const SERVER_EXPORT_TABLES = ["activity_log", "user_devices", "export_fingerprints", "plan_purchases"];

export async function buildUserExport(db: SupabaseClient, userId: string, profile: unknown) {
  const out: Record<string, unknown> = { exportedAt: new Date().toISOString(), profile };
  for (const t of EXPORT_TABLES) {
    const { data } = await db.from(t).select("*").eq("user_id", userId).limit(50000);
    out[t] = data ?? [];
  }
  let admin: SupabaseClient | null = null;
  try { admin = adminClient(); } catch { admin = null; }
  for (const t of SERVER_EXPORT_TABLES) {
    if (!admin) { out[t] = []; continue; }
    const { data } = await admin.from(t).select("*").eq("user_id", userId).limit(50000);
    out[t] = data ?? [];
  }
  // D192: Zotero/ORCID bağlantıları — şifreli anahtar dışa aktarılmaz
  out.source_links = admin ? ((await admin.from("source_links").select("project_id, provider, config, last_synced_at, last_result, created_at").eq("user_id", userId).limit(1000)).data ?? []) : [];
  return out;
}
