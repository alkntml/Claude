import "server-only";
import { adminClient } from "@/lib/supabase/admin";

/**
 * Yalnızca sunucunun yazdığı tablolar (claim_audits, review_records — migration 33; RLS’te kullanıcıya yalnız okuma
 * izni vardır). Erişim projectAccess/childAccess ile doğrulandıktan sonra kullanılır; her sorguda açık project_id ve
 * user_id (= çalışma sahibi) filtresi zorunludur (CLAUDE.md ilke 5).
 */
export function serverDb() {
  return adminClient();
}
