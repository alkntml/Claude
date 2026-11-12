import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { isMissingColumn } from "@/lib/db-compat";
import { serverDb } from "@/lib/server-db";
import { projectAccess } from "@/lib/project-access";
import { extractData } from "@/lib/review-ai";
import { assertSingleProject } from "@/lib/single-project";
import { loadChunks } from "@/lib/sources/chunk-insert";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Dahil edilen çalışmalardan yapay zekâ destekli veri çıkarma taslağı (D134); en fazla 5 kayıt/istek */
export const POST = route<Ctx>("review.extract", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "prisma");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  await assertSingleProject(s, id);
  const b = await parseBody(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(5) }));
  const { data: recs, error } = await acc.db.from("review_records").select("id, record, source_id, extraction").eq("project_id", id).eq("user_id", acc.ownerId).eq("stage", "included").in("id", b.ids);
  if (error && isMissingColumn(error)) throw new ApiError(409, "Bu özellik için veritabanı güncellemesi gerekiyor (migration 36).", "migration_required");
  if (error) throw error;
  if (!recs?.length) throw new ApiError(404, "Dahil edilen kayıt bulunamadı");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const srcIds = recs.map((r: any) => r.source_id).filter(Boolean);
  const { data: srcs } = srcIds.length ? await acc.db.from("sources").select("id, abstract, access_level").in("id", srcIds).eq("user_id", acc.ownerId) : { data: [] as any[] };
  const full = (srcs ?? []).filter((x: any) => x.access_level === "full_text").map((x: any) => x.id);
  const chunks = await loadChunks(acc.db, { sourceIds: full, userId: acc.ownerId, limit: 6000 });
  const lang = acc.project.language === "en" || acc.project.language === "de" ? acc.project.language : localeFromRequest(req);
  const out: { id: string; extraction: any }[] = [];
  let cost = 0; const usage = { input: 0, output: 0 }; let model: string | null = null; let provider: string | null = null; let calls = 0;
  for (const r of recs as any[]) {
    const src = (srcs ?? []).find((x: any) => x.id === r.source_id);
    const abstract = src && src.access_level !== "metadata" ? src.abstract : r.record?.abstract ?? null;
    const x = await extractData({ planId: s.profile.plan_id, lang, title: r.record?.title ?? "", abstract, chunks: chunks.filter((c) => c.source_id === r.source_id) });
    if (x.usage) { usage.input += x.usage.input; usage.output += x.usage.output; cost += x.cost; model = x.model; provider = x.provider; calls++; }
    await serverDb().from("review_records").update({ extraction: x.extraction, updated_at: new Date().toISOString() }).eq("id", r.id).eq("project_id", id).eq("user_id", acc.ownerId);
    out.push({ id: r.id, extraction: x.extraction });
  }
  if (calls) await recordUsage(s.user.id, "ai_request", { quantity: calls, usage, costUsd: cost, provider: provider ?? undefined, model: model ?? undefined, meta: { action: "review_extract", projectId: id, records: calls } });
  return json({ results: out });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
