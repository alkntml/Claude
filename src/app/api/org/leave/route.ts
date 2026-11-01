import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Kurumdan ayrılma (kişisel paket yeniden geçerli olur) */
export const POST = route("org.leave", async () => {
  const s = await requireUser();
  await adminClient().from("organization_members").delete().eq("user_id", s.user.id);
  return json({ ok: true });
});
