import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { assertProjectQuota } from "@/lib/usage";
import { assertCanCreateProject } from "@/lib/single-project";

import { STYLE_IDS } from "@/lib/citations";
import { GRANT_PROGRAMS, type GrantProgram } from "@/lib/workflows";
import { createProject } from "@/lib/project-create";
import { readResearchPrefs } from "@/lib/research-prefs";

import { localeFromRequest } from "@/i18n/server";


const CreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  workType: z.enum(["thesis", "research_article", "journal_article", "capstone", "literature_review", "research_proposal", "grant_proposal", "text_editing", "source_research"]),
  level: z.enum(["bachelor", "master", "doctorate", "postdoc", "other"]).default("master"),
  methodology: z.enum(["quantitative", "qualitative", "mixed", "theoretical", "systematic_review", "meta_analysis"]).default("quantitative"),
  /** D171: araştırma deseni, alt tür ve kullanıcı şablonu */
  design: z.string().regex(/^[a-z_]{2,40}$/).optional(),
  variant: z.enum(["research", "software", "business", "education"]).optional(),
  templateId: z.string().uuid().optional(),
  discipline: z.string().max(200).default(""),
  language: z.enum(["tr", "en", "de"]).default("tr"),
  citationStyle: z.enum(STYLE_IDS as [string, ...string[]]).default("apa7"),
  topic: z.string().max(4000).default(""),
  keywords: z.array(z.string().max(80)).max(20).default([]),
  university: z.string().max(300).optional(),
  targetJournal: z.string().max(300).optional(),
  program: z.enum(GRANT_PROGRAMS.map((p) => p.id) as [GrantProgram, ...GrantProgram[]]).optional(),
  /** D149: sihirbazdaki kaynak tercihleri ve bölüm yapısı */
  research: z.object({ mode: z.enum(["auto", "ask", "off"]), yearFrom: z.number().int().min(1900).max(2100).nullable(), minCitations: z.number().int().min(0).max(100000), preprints: z.boolean() }).optional(),
  structure: z.enum(["standard", "smart", "free"]).default("smart"),
});

export const GET = route("projects.list", async (req) => {
  const s = await requireUser();
  // Yöneticinin otomatik çalışmaları (D77)
  if (new URL(req.url).searchParams.get("autopilot") === "1") {
    if (s.profile.role !== "admin") throw new ApiError(403, "Yönetici yetkisi gerekiyor", "forbidden");
    const { data } = await s.supabase.from("projects").select("id, title, work_type, progress, updated_at, autopilot:context->autopilot").eq("user_id", s.user.id).not("context->autopilot", "is", null).order("updated_at", { ascending: false }).limit(50);
    return json({ projects: data ?? [] });
  }
  const { data } = await s.supabase
    .from("projects")
    .select("id, title, work_type, academic_level, status, progress, citation_style, updated_at, last_opened_at, discipline")
    .eq("user_id", s.user.id)
    .order("updated_at", { ascending: false });
  return json({ projects: data ?? [] });
});

export const POST = route("projects.create", async (req) => {
  const s = await requireUser();
  const body = await parseBody(req, CreateSchema);
  const uiLocale = localeFromRequest(req);
  // Tek Proje paketi (D103): ikinci çalışma engellenir ve yöneticiye bildirilir
  await assertCanCreateProject(s);
  await assertProjectQuota(s.user.id, s.profile.plan_id);

  const project = await createProject(s, { ...body, research: body.research ? readResearchPrefs({ research: body.research }) : undefined }, uiLocale);
  return json({ project }, 201);
});
