import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { logOrg } from "@/lib/org-audit";
import { adminClient } from "@/lib/supabase/admin";

/** Kurumdan ayrılma (kişisel paket yeniden geçerli olur). Kurumun tek yöneticisi ayrılamaz (D125). */
export const POST = route("org.leave", async () => {
  const s = await requireUser();
  const db = adminClient();
  const { data: me } = await db.from("organization_members").select("org_id, role").eq("user_id", s.user.id).maybeSingle();
  if (!me) return json({ ok: true });
  if (me.role === "admin") {
    const { count } = await db.from("organization_members").select("user_id", { count: "exact", head: true }).eq("org_id", me.org_id).eq("role", "admin");
    if ((count ?? 0) <= 1) throw new ApiError(422, "Kurumun tek yöneticisi olarak ayrılamazsınız. Önce başka bir üyeyi yönetici yapın.");
  }
  await db.from("organization_members").delete().eq("user_id", s.user.id);
  await logOrg(me.org_id, s.user.id, "member_left", s.user.id);
  return json({ ok: true });
});
