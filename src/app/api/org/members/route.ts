import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { logOrg } from "@/lib/org-audit";
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
  const [{ data: events }, { data: projects }, audit] = await Promise.all([
    ids.length ? db.from("usage_events").select("user_id, kind, quantity").in("user_id", ids).gte("created_at", since).limit(50000) : Promise.resolve({ data: [] as { user_id: string; kind: string; quantity: number }[] }),
    ids.length ? db.from("projects").select("user_id").in("user_id", ids).neq("status", "archived") : Promise.resolve({ data: [] as { user_id: string }[] }),
    db.from("org_audit_log").select("action, actor_id, target_user, data, created_at").eq("org_id", org.id).order("created_at", { ascending: false }).limit(50).then((r) => r.data ?? [], () => []),
  ]);
  const usage: Record<string, { ai: number; searches: number; projects: number; exports: number; active: boolean }> = {};
  for (const id of ids) usage[id] = { ai: 0, searches: 0, projects: 0, exports: 0, active: false };
  for (const e of events ?? []) {
    const u = usage[e.user_id]; u.active = true;
    if (e.kind === "ai_request") u.ai += e.quantity; if (e.kind === "source_search") u.searches += e.quantity; if (e.kind === "export") u.exports += 1;
  }
  for (const p of projects ?? []) usage[p.user_id].projects++;
  const nameOf = new Map((members ?? []).map((m) => { const prof = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as { full_name: string | null; email: string | null } | null; return [m.user_id, prof?.full_name || prof?.email || "—"]; }));
  const vals = Object.values(usage);
  return json({
    summary: { members: ids.length, active: vals.filter((u) => u.active).length, ai: vals.reduce((a, u) => a + u.ai, 0), searches: vals.reduce((a, u) => a + u.searches, 0), exports: vals.reduce((a, u) => a + u.exports, 0) },
    audit: (audit as { action: string; actor_id: string | null; target_user: string | null; data: Record<string, unknown>; created_at: string }[]).map((a) => ({ action: a.action, at: a.created_at, actor: a.actor_id ? nameOf.get(a.actor_id) ?? "—" : "—", target: a.target_user ? nameOf.get(a.target_user) ?? "—" : null, data: a.data })),
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
  await logOrg(org.id, s.user.id, "member_removed", userId);
  return json({ ok: true });
});

/** Rol değişikliği (kurum yöneticisi): üye ↔ yönetici. Son yönetici üyeliğe alınamaz (D125). */
export const PATCH = route("org.members.role", async (req) => {
  const { s, org } = await requireOrgAdmin();
  const { userId, role } = await parseBody(req, z.object({ userId: z.string().uuid(), role: z.enum(["admin", "member"]) }));
  const db = adminClient();
  if (role === "member") {
    const { count } = await db.from("organization_members").select("user_id", { count: "exact", head: true }).eq("org_id", org.id).eq("role", "admin");
    if ((count ?? 0) <= 1) throw new ApiError(422, "Kurumda en az bir yönetici kalmalı");
  }
  const { data } = await db.from("organization_members").update({ role }).eq("org_id", org.id).eq("user_id", userId).select("user_id");
  if (!data?.length) throw new ApiError(404, "Üye bulunamadı");
  await logOrg(org.id, s.user.id, "role_changed", userId, { role });
  return json({ ok: true });
});
