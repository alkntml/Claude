import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

async function requireOrgAdmin() {
  const s = await requireUser();
  const org = s.profile.org;
  if (!org || org.role !== "admin") throw new ApiError(403, "Kurum yöneticisi yetkisi gerekiyor");
  return { s, org };
}

/**
 * Kurum yöneticisi paneli: üyeler ve bu ayki kullanım SAYILARI. Gizlilik gereği proje başlığı veya içerik paylaşılmaz.
 */
export const GET = route("org.members", async () => {
  const { org } = await requireOrgAdmin();
  const db = adminClient();
  const { data: o } = await db.from("organizations").select("id, name, plan_id, seats, join_code, email_domain, expires_at").eq("id", org.id).single();
  const { data: members } = await db.from("organization_members").select("user_id, role, joined_at, profiles(full_name, email)").eq("org_id", org.id).order("joined_at");
  const ids = (members ?? []).map((m) => m.user_id);
  const since = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
  const [{ data: events }, { data: projects }] = await Promise.all([
    ids.length ? db.from("usage_events").select("user_id, kind, quantity").in("user_id", ids).gte("created_at", since).limit(50000) : Promise.resolve({ data: [] as { user_id: string; kind: string; quantity: number }[] }),
    ids.length ? db.from("projects").select("user_id").in("user_id", ids).neq("status", "archived") : Promise.resolve({ data: [] as { user_id: string }[] }),
  ]);
  const usage: Record<string, { ai: number; searches: number; projects: number }> = {};
  for (const id of ids) usage[id] = { ai: 0, searches: 0, projects: 0 };
  for (const e of events ?? []) { if (e.kind === "ai_request") usage[e.user_id].ai += e.quantity; if (e.kind === "source_search") usage[e.user_id].searches += e.quantity; }
  for (const p of projects ?? []) usage[p.user_id].projects++;
  return json({
    org: o,
    members: (members ?? []).map((m) => {
      const prof = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as { full_name: string | null; email: string | null } | null;
      return { userId: m.user_id, role: m.role, joinedAt: m.joined_at, name: prof?.full_name ?? "", email: prof?.email ?? "", usage: usage[m.user_id] };
    }),
  });
});

/** Üyeyi kurumdan çıkarır (kurum yöneticisi; kendini çıkaramaz) */
export const DELETE = route("org.members.remove", async (req) => {
  const { s, org } = await requireOrgAdmin();
  const { userId } = await parseBody(req, z.object({ userId: z.string().uuid() }));
  if (userId === s.user.id) throw new ApiError(422, "Kendinizi çıkaramazsınız");
  await adminClient().from("organization_members").delete().eq("org_id", org.id).eq("user_id", userId);
  return json({ ok: true });
});
