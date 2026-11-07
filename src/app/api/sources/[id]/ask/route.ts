import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { logAiOutput } from "@/lib/activity";
import { localeFromRequest } from "@/i18n/server";
import { assertSingleProject } from "@/lib/single-project";
import { askSource } from "@/lib/source-ask";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 90;
type Ctx = { params: Promise<{ id: string }> };

const Body = z.object({
  question: z.string().trim().min(2).max(2000),
  preset: z.enum(["summary", "method", "sample", "findings", "limitations", "relation", "quotes", "definitions"]).optional(),
  history: z.array(z.object({ q: z.string().max(2000), a: z.string().max(8000) })).max(8).default([]),
});

/** Kaynağa sor (D112): tek kaynağın okunan metninden sayfa numaralı cevap */
export const POST = route<Ctx>("source.ask", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, Body);
  const { data: src } = await s.supabase.from("sources").select("id, project_id, title, authors, year, container_title, abstract, access_level").eq("id", id).maybeSingle();
  if (!src) throw new ApiError(404, "Kaynak bulunamadı");
  const project = await requireProject(s, src.project_id as string);
  await assertSingleProject(s, project.id);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const { data: chunks } = src.access_level === "full_text"
    ? await s.supabase.from("source_chunks").select("content, page_hint").eq("source_id", id).order("chunk_index").limit(2000)
    : { data: [] };
  const authors = (Array.isArray(src.authors) ? src.authors : []).slice(0, 3).map((a: { family?: string; literal?: string }) => a.family ?? a.literal ?? "").filter(Boolean).join(", ") + ((src.authors?.length ?? 0) > 3 ? " vd." : "");
  const lang = project.language === "en" ? "en" : localeFromRequest(req);
  const r = await askSource({
    planId: s.profile.plan_id, question: b.question, preset: b.preset, history: b.history, lang,
    source: { title: src.title, authors, year: src.year, container: src.container_title, abstract: src.abstract, access_level: src.access_level },
    chunks: chunks ?? [], project: { title: project.title, topic: project.topic },
  });
  await Promise.all([
    recordUsage(s.user.id, "ai_request", { usage: r.usage, costUsd: r.cost, provider: r.provider, model: r.model, meta: { action: "source_ask", projectId: project.id, sourceId: id } }),
    logAiOutput({ userId: s.user.id, action: "source_ask", projectId: project.id, projectTitle: project.title, stageTitle: `Kaynak: ${src.title.slice(0, 120)}`, model: r.model, output: r.answer }),
  ]);
  return json({ answer: r.answer, evidence: r.evidence, access: r.access });
});
