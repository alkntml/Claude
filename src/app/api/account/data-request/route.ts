import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/**
 * KVKK veri erişim talebi (D50): çalışma kilitliyken anında indirme yerine talep oluşturulur.
 * Yönetici, Yönetim → Kilitler’den kullanıcının verisini indirip yasal süre (30 gün) içinde ücretsiz iletir.
 */
export const POST = route("account.data_request", async () => {
  const s = await requireUser();
  const db = adminClient();
  const { data: open } = await db.from("data_requests").select("id, created_at").eq("user_id", s.user.id).eq("kind", "export").eq("status", "pending").maybeSingle();
  if (open) return json({ ok: true, request: open, existing: true });
  const { data, error } = await db.from("data_requests").insert({ user_id: s.user.id, kind: "export", status: "pending" }).select("id, created_at").single();
  if (error) throw error;
  return json({ ok: true, request: data }, 201);
});
