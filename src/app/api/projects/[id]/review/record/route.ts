import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { isMissingColumn } from "@/lib/db-compat";
import { APPRAISAL_ITEMS, EXTRACTION_FIELDS } from "@/lib/prisma";
import { serverDb } from "@/lib/server-db";
import { projectAccess } from "@/lib/project-access";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
const Cell = z.object({ value: z.string().max(1500), quote: z.string().max(1500).nullable().optional(), page: z.string().max(40).nullable().optional(), edited: z.boolean().optional() });
const Extraction = z.object(Object.fromEntries(EXTRACTION_FIELDS.map((f) => [f, Cell.optional()]))).extend({ basedOn: z.enum(["full_text", "abstract", "metadata"]).optional(), at: z.string().max(40).optional() });
const Answer = z.enum(["yes", "no", "unclear", "na"]);
const Appraisal = z.object({ answers: z.object(Object.fromEntries(APPRAISAL_ITEMS.map((i) => [i.id, Answer.optional()]))), note: z.string().max(1000).optional(), at: z.string().max(40).optional() });

/** Dahil edilen çalışmanın veri çıkarma formunu (elle düzeltme) ve kalite değerlendirmesini kaydeder (D134) */
export const PATCH = route<Ctx>("review.record", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const b = await parseBody(req, z.object({ id: z.string().uuid(), extraction: Extraction.optional(), appraisal: Appraisal.optional() }));
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.extraction) patch.extraction = b.extraction;
  if (b.appraisal) patch.appraisal = { ...b.appraisal, at: new Date().toISOString() };
  const { error } = await serverDb().from("review_records").update(patch).eq("id", b.id).eq("project_id", id).eq("user_id", acc.ownerId);
  if (error && isMissingColumn(error)) throw new ApiError(409, "Bu özellik için veritabanı güncellemesi gerekiyor (migration 36).", "migration_required");
  if (error) throw error;
  return json({ ok: true });
});
