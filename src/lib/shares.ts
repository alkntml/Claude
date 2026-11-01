import "server-only";
import { adminClient } from "@/lib/supabase/admin";

/** Paylaşım bağlantısını çözer (iptal edilmiş veya süresi dolmuş bağlantılar null döner). */
export async function resolveShare(token: string) {
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  const db = adminClient();
  const { data: share } = await db.from("project_shares").select("*").eq("token", token).maybeSingle();
  if (!share || share.revoked) return null;
  if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) return null;
  return share as { id: string; project_id: string; user_id: string; allow_comments: boolean; label: string; expires_at: string | null; view_count: number };
}
