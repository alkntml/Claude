import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { localeFromRequest } from "@/i18n/server";
import { logAiOutput } from "@/lib/activity";
import { analyzeSources } from "@/lib/multi-ask";
import { projectAccess } from "@/lib/project-access";
import { assertSingleProject } from "@/lib/single-project";
import { loadChunks } from "@/lib/sources/chunk-insert";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const Body = z.object({
  sourceIds: z.array(z.string().uuid()).min(2).max(8),
  mode: z.enum(["ask", "compare"]),
  question: z.string().trim().max(2000).default(""),
});

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Çoklu belge analizi (D132): seçili kaynaklara birlikte soru veya karşılaştırmalı sentez */
export const POST = route<Ctx>("sources.analyze", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "matrix");
  const { id } = await params;
  const b = await parseBody(req, Body);
  if (b.mode === "ask" && b.question.length < 3) throw new ApiError(422, "Sorunuzu yazın");
  const acc = await projectAccess(s, id, "edit");
  await assertSingleProject(s, id);
  const { data: rows } = await acc.db.from("sources").select("id, title, authors, year, abstract, access_level").eq("project_id", id).eq("user_id", acc.ownerId).in("id", b.sourceIds);
  if ((rows ?? []).length < 2) throw new ApiError(422, "En az iki kaynak seçin");
  if ((rows ?? []).every((r: any) => r.access_level === "metadata")) throw new ApiError(422, "Seçilen kaynakların hiçbirinin özeti veya tam metni okunmadı; karşılaştırma yapılamaz.");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const full = (rows ?? []).filter((r: any) => r.access_level === "full_text").map((r: any) => r.id);
  const chunks = await loadChunks(acc.db, { sourceIds: full, userId: acc.ownerId, limit: 8000 });
  // Seçim sırası korunur (S1 = ilk seçilen)
  const ordered = b.sourceIds.map((sid) => (rows ?? []).find((r: any) => r.id === sid)).filter(Boolean) as any[];
  const authorsOf = (a: any[]) => (Array.isArray(a) ? a : []).slice(0, 2).map((x) => x.family ?? x.literal ?? "").filter(Boolean).join(" & ") + ((a?.length ?? 0) > 2 ? " vd." : "");
  const r = await analyzeSources({
    planId: s.profile.plan_id, lang: acc.project.language === "en" || acc.project.language === "de" ? acc.project.language : localeFromRequest(req), mode: b.mode, question: b.question,
    project: { title: acc.project.title, topic: acc.project.topic },
    sources: ordered.map((x) => ({ id: x.id, title: x.title, authors: authorsOf(x.authors), year: x.year, abstract: x.abstract, access_level: x.access_level, chunks: chunks.filter((c) => c.source_id === x.id) })),
  });
  await Promise.all([
    recordUsage(s.user.id, "ai_request", { quantity: b.mode === "compare" ? 2 : 1, usage: r.usage, costUsd: r.cost, provider: r.provider, model: r.model, meta: { action: b.mode === "compare" ? "multi_compare" : "multi_ask", projectId: id, sources: ordered.length } }),
    logAiOutput({ userId: s.user.id, action: b.mode === "compare" ? "multi_compare" : "multi_ask", projectId: id, projectTitle: acc.project.title, stageTitle: `Çoklu kaynak (${ordered.length})`, model: r.model, output: r.answer ?? JSON.stringify(r.compare).slice(0, 20000) }),
  ]);
  return json({ mode: r.mode, answer: r.answer, compare: r.compare, labels: r.labels });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
