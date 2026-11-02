import { ApiError, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { buildUserExport } from "@/lib/data-export";
import { adminClient } from "@/lib/supabase/admin";

/** Yönetici: KVKK talebi için kullanıcının verisini JSON olarak indirir (D50) */
export const GET = route("admin.user_export", async (req) => {
  await requireAdmin();
  const userId = new URL(req.url).searchParams.get("userId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new ApiError(422, "Geçersiz kullanıcı");
  const db = adminClient();
  const { data: profile } = await db.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!profile) throw new ApiError(404, "Kullanıcı bulunamadı");
  const out = await buildUserExport(db, userId, profile);
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="academiana-veri-${userId.slice(0, 8)}.json"` } });
});
