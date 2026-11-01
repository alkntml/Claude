import crypto from "node:crypto";
import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("shares.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { data } = await s.supabase.from("project_shares").select("*").eq("project_id", id).order("created_at", { ascending: false });
  return json({ shares: data ?? [] });
});

export const POST = route<Ctx>("shares.create", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const b = await parseBody(req, z.object({ label: z.string().max(120).default(""), allowComments: z.boolean().default(true), expiresInDays: z.number().int().min(1).max(365).nullable().default(30) }));
  const token = crypto.randomBytes(24).toString("base64url");
  const { data, error } = await s.supabase.from("project_shares").insert({
    project_id: id, user_id: s.user.id, token, label: b.label, allow_comments: b.allowComments,
    expires_at: b.expiresInDays ? new Date(Date.now() + b.expiresInDays * 86400_000).toISOString() : null,
  }).select().single();
  if (error) throw error;
  return json({ share: data }, 201);
});

export const DELETE = route<Ctx>("shares.revoke", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { shareId } = await parseBody(req, z.object({ shareId: z.string().uuid() }));
  await s.supabase.from("project_shares").update({ revoked: true }).eq("id", shareId).eq("project_id", id).eq("user_id", s.user.id);
  return json({ ok: true });
});
