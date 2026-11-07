import "server-only";
/** Kurum denetim kaydı (D125): kurum üyeliğinde kim, kimi, ne zaman değiştirdi. Yazma hatası işlemi bozmaz. */
import { adminClient } from "@/lib/supabase/admin";

export type OrgAction = "member_joined" | "member_left" | "member_removed" | "role_changed";
export async function logOrg(orgId: string, actorId: string | null, action: OrgAction, targetUser: string | null = null, data: Record<string, unknown> = {}) {
  await adminClient().from("org_audit_log").insert({ org_id: orgId, actor_id: actorId, target_user: targetUser, action, data }).then(() => undefined, () => undefined);
}
