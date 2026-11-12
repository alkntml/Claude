import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

/**
 * Hesap → Gizlilik ve Veri Yönetimi (D154): kullanıcının oluşturduğu tüm danışman paylaşım bağlantıları.
 * İptal, mevcut çalışma ucu üzerinden yapılır (DELETE /api/projects/[id]/shares). Bağlantının gizli anahtarı (token) listelenmez.
 */
export const GET = route("account.shares", async () => {
  const s = await requireUser();
  const { data, error } = await s.supabase.from("project_shares")
    .select("id, project_id, label, allow_comments, revoked, expires_at, created_at, projects(title)")
    .eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(200);
  if (error) throw error;
  const now = Date.now();
  const shares = (data ?? []).map((r) => {
    const p = r.projects as { title?: string } | { title?: string }[] | null;
    const title = (Array.isArray(p) ? p[0]?.title : p?.title) ?? "";
    const expired = !!r.expires_at && new Date(r.expires_at).getTime() < now;
    return { id: r.id, projectId: r.project_id, projectTitle: title, label: r.label, allowComments: r.allow_comments, expiresAt: r.expires_at, createdAt: r.created_at, active: !r.revoked && !expired, revoked: !!r.revoked, expired };
  });
  return json({ shares });
});
