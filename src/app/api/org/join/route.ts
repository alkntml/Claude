import { logOrg } from "@/lib/org-audit";
import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { emailMatchesDomain } from "@/lib/pricing";
import { adminClient } from "@/lib/supabase/admin";

/** Kurum katılım koduyla kuruma katılma (koltuk sayısı ve e-posta alan adı kontrol edilir) */
export const POST = route("org.join", async (req) => {
  const s = await requireUser();
  const { code } = await parseBody(req, z.object({ code: z.string().trim().min(6).max(20) }));
  const db = adminClient();
  const { data: org } = await db.from("organizations").select("id, name, seats, email_domain, active, expires_at").eq("join_code", code.toUpperCase()).maybeSingle();
  if (!org || !org.active || (org.expires_at && new Date(org.expires_at) < new Date())) throw new ApiError(404, "Kurum kodu geçersiz veya lisans süresi dolmuş");
  if (!s.user.email_confirmed_at) throw new ApiError(403, "Kuruma katılmak için önce e-posta adresinizi doğrulayın");
  if (!emailMatchesDomain(s.user.email, org.email_domain)) throw new ApiError(403, `Bu kuruma yalnızca @${org.email_domain} uzantılı e-posta adresleriyle katılınabilir`);
  const { data: mine } = await db.from("organization_members").select("org_id").eq("user_id", s.user.id).maybeSingle();
  if (mine) throw new ApiError(409, mine.org_id === org.id ? "Zaten bu kurumun üyesisiniz" : "Başka bir kurumun üyesisiniz; önce oradan ayrılın");
  const { count } = await db.from("organization_members").select("user_id", { count: "exact", head: true }).eq("org_id", org.id);
  if (org.seats != null && (count ?? 0) >= org.seats) throw new ApiError(409, "Kurum lisansındaki kullanıcı sayısı doldu; kurum yöneticinize başvurun");
  const { error } = await db.from("organization_members").insert({ org_id: org.id, user_id: s.user.id, role: "member" });
  if (error) throw new ApiError(409, "Kuruma katılınamadı");
  await logOrg(org.id, s.user.id, "member_joined", s.user.id);
  return json({ ok: true, org: { id: org.id, name: org.name } });
});
