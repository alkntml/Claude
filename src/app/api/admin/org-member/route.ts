import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Platform yöneticisi: e-postayla kullanıcıyı kuruma ekler / rolünü değiştirir (ör. kurum yöneticisi atama) */
export const POST = route("admin.orgMember", async (req) => {
  await requireAdmin();
  const b = await parseBody(req, z.object({ orgId: z.string().uuid(), email: z.string().email().max(300), role: z.enum(["admin", "member"]).default("admin") }));
  const db = adminClient();
  const { data: p } = await db.from("profiles").select("id").ilike("email", b.email.trim()).maybeSingle();
  if (!p) throw new ApiError(404, "Bu e-postayla kayıtlı kullanıcı yok (önce siteye kayıt olmalı)");
  const { data: cur } = await db.from("organization_members").select("org_id").eq("user_id", p.id).maybeSingle();
  if (cur && cur.org_id !== b.orgId) throw new ApiError(409, "Kullanıcı başka bir kurumun üyesi");
  const { error } = await db.from("organization_members").upsert({ org_id: b.orgId, user_id: p.id, role: b.role });
  if (error) throw new ApiError(400, error.message);
  return json({ ok: true });
});
