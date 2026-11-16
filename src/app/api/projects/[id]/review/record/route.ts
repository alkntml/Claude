import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { isMissingColumn } from "@/lib/db-compat";
import { APPRAISAL_TOOLS, EXTRACTION_FIELDS, type AppraisalToolId } from "@/lib/prisma";
import { serverDb } from "@/lib/server-db";
import { projectAccess } from "@/lib/project-access";
import { assertFeature } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
const Cell = z.object({ value: z.string().max(1500), quote: z.string().max(1500).nullable().optional(), page: z.string().max(40).nullable().optional(), edited: z.boolean().optional() });
const Extraction = z.object(Object.fromEntries(EXTRACTION_FIELDS.map((f) => [f, Cell.optional()]))).extend({
  basedOn: z.enum(["full_text", "abstract", "metadata"]).optional(), at: z.string().max(40).optional(),
  // D222: protokoldeki ek alanlar
  custom: z.record(z.string().max(80), Cell).refine((x) => Object.keys(x).length <= 12, "En fazla 12 ek alan").optional(),
});
// D222: araç ve araca göre yanıtlar (Genel/JBI: evet-hayır; RoB 2: düşük-bazı endişeler-yüksek; ROBINS-I; NOS yıldız)
const Answer = z.enum(["yes", "no", "unclear", "na", "low", "some", "high", "moderate", "serious", "critical", "ni", "0", "1", "2"]);
const ITEM_IDS = [...new Set(APPRAISAL_TOOLS.flatMap((t) => t.items.map((i) => i.id)))] as [string, ...string[]];
const Appraisal = z.object({
  tool: z.enum(APPRAISAL_TOOLS.map((x) => x.id) as [AppraisalToolId, ...AppraisalToolId[]]).optional(),
  answers: z.record(z.enum(ITEM_IDS), Answer), note: z.string().max(1000).optional(), at: z.string().max(40).optional(),
});

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
