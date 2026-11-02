import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Yönetim → Kilitler (D50): “mevcut çalışmayı indir” hakları ve bekleyen KVKK veri talepleri */
export const GET = route("admin.locks", async () => {
  await requireAdmin();
  const db = adminClient();
  const [passes, requests, locked] = await Promise.all([
    db.from("download_passes").select("id, user_id, project_id, expires_at, note, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("data_requests").select("id, user_id, kind, status, created_at").eq("status", "pending").order("created_at").limit(100),
    db.from("profiles").select("id, email, plan_id").eq("work_locked", true).order("created_at", { ascending: false }).limit(100),
  ]);
  const userIds = [...new Set([...(passes.data ?? []).map((p) => p.user_id), ...(requests.data ?? []).map((r) => r.user_id).filter(Boolean)])];
  const projectIds = [...new Set((passes.data ?? []).map((p) => p.project_id))];
  const [{ data: users }, { data: projects }] = await Promise.all([
    userIds.length ? db.from("profiles").select("id, email").in("id", userIds) : Promise.resolve({ data: [] as { id: string; email: string }[] }),
    projectIds.length ? db.from("projects").select("id, title").in("id", projectIds) : Promise.resolve({ data: [] as { id: string; title: string }[] }),
  ]);
  const email = Object.fromEntries((users ?? []).map((u) => [u.id, u.email]));
  const title = Object.fromEntries((projects ?? []).map((p) => [p.id, p.title]));
  return json({
    passes: (passes.data ?? []).map((p) => ({ ...p, email: email[p.user_id] ?? null, title: title[p.project_id] ?? null })),
    requests: (requests.data ?? []).map((r) => ({ ...r, email: r.user_id ? email[r.user_id] ?? null : null })),
    locked: locked.data ?? [],
  });
});

/** Ödeme alındıktan sonra bir projeye indirme hakkı tanımlar (proje sahibi otomatik bulunur). */
export const POST = route("admin.locks.grant", async (req) => {
  const s = await requireAdmin();
  const b = await parseBody(req, z.object({ projectId: z.string().uuid(), days: z.number().int().min(1).max(60).default(7), note: z.string().max(500).default("") }));
  const db = adminClient();
  const { data: project } = await db.from("projects").select("id, user_id, title").eq("id", b.projectId).maybeSingle();
  if (!project) throw new ApiError(404, "Proje bulunamadı");
  const expires = new Date(Date.now() + b.days * 86400_000).toISOString();
  const { data, error } = await db.from("download_passes").insert({ user_id: project.user_id, project_id: project.id, expires_at: expires, note: b.note, created_by: s.user.id }).select().single();
  if (error) throw error;
  return json({ pass: { ...data, title: project.title } }, 201);
});

/** KVKK talebini tamamlandı olarak işaretler */
export const PATCH = route("admin.locks.request", async (req) => {
  await requireAdmin();
  const b = await parseBody(req, z.object({ requestId: z.string().uuid(), status: z.enum(["completed", "rejected"]).default("completed") }));
  const { error } = await adminClient().from("data_requests").update({ status: b.status, completed_at: new Date().toISOString() }).eq("id", b.requestId);
  if (error) throw error;
  return json({ ok: true });
});

/** İndirme hakkını iptal eder */
export const DELETE = route("admin.locks.revoke", async (req) => {
  await requireAdmin();
  const b = await parseBody(req, z.object({ passId: z.string().uuid() }));
  const { error } = await adminClient().from("download_passes").delete().eq("id", b.passId);
  if (error) throw error;
  return json({ ok: true });
});
