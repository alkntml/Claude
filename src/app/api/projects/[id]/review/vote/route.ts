import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { isMissingColumn } from "@/lib/db-compat";
import type { Votes } from "@/lib/prisma";
import { serverDb } from "@/lib/server-db";
import { projectAccess } from "@/lib/project-access";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Çift değerlendirici modu (D134): her ekip üyesi (sahip veya ortak yazar) kayda bağımsız oy verir. Oylar kararı
 * değiştirmez; uyum (Cohen’in kappası) ve çelişkili kayıtlar hesaplanır, nihai kararı ekip verir.
 */
export const POST = route<Ctx>("review.vote", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(100), phase: z.enum(["screening", "eligibility"]), decision: z.enum(["include", "exclude", "unsure"]).nullable(), reason: z.string().trim().max(300).nullable().optional() }));
  const { data: cur, error } = await acc.db.from("review_records").select("id, votes").eq("project_id", id).eq("user_id", acc.ownerId).in("id", b.ids);
  if (error && isMissingColumn(error)) throw new ApiError(409, "Bu özellik için veritabanı güncellemesi gerekiyor (migration 36).", "migration_required");
  if (error) throw error;
  const name = (s.profile.full_name || s.user.email || "").slice(0, 80);
  for (const r of (cur ?? []) as any[]) {
    const votes: Votes = r.votes ?? {};
    const phase = { ...(votes[b.phase] ?? {}) };
    if (b.decision) phase[s.user.id] = { decision: b.decision, reason: b.reason ?? null, name, at: new Date().toISOString() };
    else delete phase[s.user.id];
    const { error: e2 } = await serverDb().from("review_records").update({ votes: { ...votes, [b.phase]: phase } }).eq("id", r.id).eq("project_id", id).eq("user_id", acc.ownerId);
    if (e2) throw e2;
  }
  return json({ updated: (cur ?? []).length });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
