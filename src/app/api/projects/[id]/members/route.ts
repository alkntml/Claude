import crypto from "node:crypto";
import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { ADVISOR_LIMIT, COAUTHOR_LIMIT, coauthorEmailOk } from "@/lib/coauthors";
import { displayName, projectAccess } from "@/lib/project-access";
import { adminClient } from "@/lib/supabase/admin";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
const Role = z.enum(["editor", "commenter", "advisor"]);

/** Ortak yazarlar (D115): üyeler + (sahip için) bekleyen davetler. Ortak yazar diğer üyelerin adını görür, e-postasını görmez. */
export const GET = route<Ctx>("members.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const acc = await projectAccess(s, id, "read");
  const admin = adminClient();
  const [{ data: ms }, { data: invites }] = await Promise.all([
    admin.from("project_members").select("user_id, role, created_at").eq("project_id", id).order("created_at"),
    acc.isOwner
      ? admin.from("project_invites").select("id, email, role, token, created_at, expires_at").eq("project_id", id).is("accepted_at", null).gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
  ]);
  const ids = [acc.ownerId, ...(ms ?? []).map((m) => m.user_id)];
  const { data: profs } = await admin.from("profiles").select("id, full_name, email").in("id", ids);
  const prof = (uid: string) => (profs ?? []).find((p) => p.id === uid);
  const person = (uid: string, role: string, since?: string) => ({
    userId: uid, role, since: since ?? null, name: displayName(prof(uid)), me: uid === s.user.id,
    email: acc.isOwner || uid === s.user.id ? prof(uid)?.email ?? null : null,
  });
  return json({
    myRole: acc.role,
    canInvite: acc.isOwner,
    limit: COAUTHOR_LIMIT,
    advisorLimit: ADVISOR_LIMIT,
    members: [person(acc.ownerId, "owner"), ...(ms ?? []).map((m) => person(m.user_id, m.role, m.created_at))],
    invites: invites ?? [],
  });
});

/** Davet oluşturur (yalnızca sahip, Pro ve üzeri / Tek Proje). Kayıtlı kullanıcıya bildirim de gider. */
export const POST = route<Ctx>("members.invite", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const acc = await projectAccess(s, id, "owner");
  const b = await parseBody(req, z.object({ email: z.string().trim().toLowerCase().email().max(320), role: Role.default("editor") }));
  // D191: danışman daveti her pakette açıktır; ortak yazar/yorumcu daveti Pro ve üzeri
  const advisor = b.role === "advisor";
  if (!advisor) assertFeature(s.profile.plan_id, "coauthors");
  if (!coauthorEmailOk(b.email)) throw new ApiError(422, "Bu e-posta adresine davet gönderilemez");
  if (b.email === (s.user.email ?? "").toLowerCase()) throw new ApiError(422, "Kendinizi davet edemezsiniz");
  const admin = adminClient();
  const nowIso = new Date().toISOString();
  const [{ data: ms }, { data: pending }, { data: target }] = await Promise.all([
    admin.from("project_members").select("user_id, role").eq("project_id", id),
    admin.from("project_invites").select("id, email, role").eq("project_id", id).is("accepted_at", null).gt("expires_at", nowIso),
    admin.from("profiles").select("id").eq("email", b.email).maybeSingle(),
  ]);
  if (target && (ms ?? []).some((m) => m.user_id === target.id)) throw new ApiError(409, "Bu kişi zaten bu çalışmanın ortak yazarı");
  // Aynı adrese bekleyen davet varsa yenisi oluşturulmaz, rolü güncellenir
  const existing = (pending ?? []).find((p) => p.email.toLowerCase() === b.email);
  // Danışmanlar ve ortak yazarlar ayrı sınırlara sayılır
  const sameKind = (r: string) => (r === "advisor") === advisor;
  const used = (ms ?? []).filter((m) => sameKind(m.role)).length + (pending ?? []).filter((p) => sameKind(p.role) && p.id !== existing?.id).length;
  if (advisor && used >= ADVISOR_LIMIT) throw new ApiError(422, `Bir çalışmaya en fazla ${ADVISOR_LIMIT} danışman eklenebilir`, "advisor_limit");
  if (!advisor && used >= COAUTHOR_LIMIT) throw new ApiError(422, `Bir çalışmaya en fazla ${COAUTHOR_LIMIT} ortak yazar eklenebilir`, "coauthor_limit");
  const token = existing ? null : crypto.randomBytes(24).toString("base64url");
  const { data: invite, error } = existing
    ? await admin.from("project_invites").update({ role: b.role, expires_at: new Date(Date.now() + 14 * 86400_000).toISOString() }).eq("id", existing.id).select("id, email, role, token, created_at, expires_at").single()
    : await admin.from("project_invites").insert({ project_id: id, email: b.email, role: b.role, token, invited_by: s.user.id }).select("id, email, role, token, created_at, expires_at").single();
  if (error) throw error;
  if (target) {
    await admin.from("notifications").insert({
      user_id: target.id, kind: "coauthor_invite",
      data: { token: invite.token, project: String(acc.project.title).slice(0, 200), from: displayName(s.profile), role: b.role },
    }).then(() => undefined, () => undefined);
  }
  return json({ invite, registered: !!target }, existing ? 200 : 201);
});

/** Rol değiştirme (yalnızca sahip) */
export const PATCH = route<Ctx>("members.role", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await projectAccess(s, id, "owner");
  const b = await parseBody(req, z.object({ userId: z.string().uuid(), role: Role }));
  if (b.role !== "advisor") assertFeature(s.profile.plan_id, "coauthors");
  const { data, error } = await adminClient().from("project_members").update({ role: b.role }).eq("project_id", id).eq("user_id", b.userId).select("user_id");
  if (error) throw error;
  if (!data?.length) throw new ApiError(404, "Ortak yazar bulunamadı");
  return json({ ok: true });
});

/** Üye çıkarma (sahip), çalışmadan ayrılma (ortak yazarın kendisi) veya davet iptali (sahip) */
export const DELETE = route<Ctx>("members.remove", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ userId: z.string().uuid().optional(), inviteId: z.string().uuid().optional() }));
  const acc = await projectAccess(s, id, "read");
  const admin = adminClient();
  if (b.inviteId) {
    if (!acc.isOwner) throw new ApiError(403, "Bu işlemi yalnızca çalışmanın sahibi yapabilir", "role_denied");
    await admin.from("project_invites").delete().eq("id", b.inviteId).eq("project_id", id).is("accepted_at", null);
    return json({ ok: true });
  }
  const uid = b.userId ?? s.user.id;
  if (uid === acc.ownerId) throw new ApiError(422, "Çalışmanın sahibi çıkarılamaz");
  if (!acc.isOwner && uid !== s.user.id) throw new ApiError(403, "Bu işlemi yalnızca çalışmanın sahibi yapabilir", "role_denied");
  const { data } = await admin.from("project_members").delete().eq("project_id", id).eq("user_id", uid).select("user_id");
  if (!data?.length) throw new ApiError(404, "Ortak yazar bulunamadı");
  await admin.from("project_presence").delete().eq("project_id", id).eq("user_id", uid);
  // Ayrılan kişi sahibine, çıkarılan kişi kendisine bildirilir
  await admin.from("notifications").insert(acc.isOwner
    ? { user_id: uid, kind: "coauthor_removed", data: { project: String(acc.project.title).slice(0, 200) } }
    : { user_id: acc.ownerId, kind: "coauthor_left", data: { project: String(acc.project.title).slice(0, 200), name: displayName(s.profile) } },
  ).then(() => undefined, () => undefined);
  return json({ ok: true });
});
