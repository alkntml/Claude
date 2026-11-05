import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { generateSurvey } from "@/lib/survey-ai";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 120;

const SELECT = "id, title, project_id, is_open, response_count, closes_at, max_responses, created_at, updated_at";

/** Yapay zekâ ile yeni anket: amaçtan taslak üretir ve kaydeder (D66) */
export const POST = route("surveys.ai.generate", async (req) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "surveys");
  const b = await parseBody(req, z.object({
    purpose: z.string().trim().min(10).max(2000),
    audience: z.string().trim().max(500).default(""),
    variables: z.string().trim().max(1500).default(""),
    length: z.enum(["short", "medium", "long"]).default("medium"),
    demographics: z.boolean().default(true),
    openEnded: z.boolean().default(false),
    consent: z.boolean().default(true),
    lang: z.enum(["tr", "en"]).default("tr"),
    projectId: z.string().uuid().nullable().optional(),
  }));
  let project = null;
  if (b.projectId) {
    const p = await requireProject(s, b.projectId);
    const { data: mem } = await s.supabase.from("project_memory").select("kind, content").eq("project_id", p.id).eq("user_id", s.user.id).in("kind", ["hypothesis", "variable", "question", "concept"]).limit(20);
    project = { title: p.title, topic: p.topic, keywords: p.keywords, discipline: p.discipline, memory: (mem ?? []).map((m) => m.content.slice(0, 300)) };
  }
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  let out;
  try { out = await generateSurvey(s.profile.plan_id, { ...b, project }); }
  catch (e) { throw new ApiError(422, e instanceof Error ? e.message : "Anket oluşturulamadı"); }
  await recordUsage(s.user.id, "ai_request", { usage: out.usage, costUsd: out.cost, provider: out.provider, model: out.model, meta: { action: "survey_generate" } });
  const { data, error } = await s.supabase.from("surveys").insert({
    user_id: s.user.id, project_id: b.projectId ?? null, title: out.survey.title || b.purpose.slice(0, 80),
    description: out.survey.description, consent: out.survey.consent, questions: out.survey.questions,
  }).select(SELECT).single();
  if (error) throw error;
  return json({ survey: data, notes: out.notes }, 201);
});
