import { pick } from "@/i18n/core";
import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { assertProjectQuota } from "@/lib/usage";
import { assertCanCreateProject } from "@/lib/single-project";
import { buildRoadmap, GRANT_PROGRAMS, type GrantProgram } from "@/lib/workflows";
import { STYLE_IDS } from "@/lib/citations";
import { translate } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";
import { adminClient } from "@/lib/supabase/admin";

const CreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  workType: z.enum(["thesis", "research_article", "journal_article", "capstone", "literature_review", "research_proposal", "grant_proposal", "text_editing", "source_research"]),
  level: z.enum(["bachelor", "master", "doctorate", "postdoc", "other"]).default("master"),
  methodology: z.enum(["quantitative", "qualitative", "mixed", "theoretical", "systematic_review"]).default("quantitative"),
  discipline: z.string().max(200).default(""),
  language: z.enum(["tr", "en"]).default("tr"),
  citationStyle: z.enum(STYLE_IDS as [string, ...string[]]).default("apa7"),
  topic: z.string().max(4000).default(""),
  keywords: z.array(z.string().max(80)).max(20).default([]),
  university: z.string().max(300).optional(),
  targetJournal: z.string().max(300).optional(),
  program: z.enum(GRANT_PROGRAMS.map((p) => p.id) as [GrantProgram, ...GrantProgram[]]).optional(),
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

  // Proje yalnızca sunucuda, kota kontrolünden sonra oluşturulur (kullanıcının doğrudan ekleme yetkisi yok; D51)
  const { data: project, error } = await adminClient()
    .from("projects")
    .insert({
      user_id: s.user.id,
      title: body.title,
      work_type: body.workType,
      academic_level: body.level,
      discipline: body.discipline,
      language: body.language,
      citation_style: body.citationStyle,
      topic: body.topic,
      keywords: body.keywords,
      context: { methodology: body.methodology, university: body.university, targetJournal: body.targetJournal, ...(body.workType === "grant_proposal" ? { program: body.program ?? "other" } : {}) },
    })
    .select()
    .single();
  if (error || !project) throw error ?? new Error("Proje oluşturulamadı");

  const roadmap = buildRoadmap({ workType: body.workType, level: body.level, methodology: body.methodology, program: body.program });
  const { error: stErr } = await s.supabase.from("project_stages").insert(
    roadmap.map((st, idx) => ({ project_id: project.id, user_id: s.user.id, key: st.key, title: translate(uiLocale, st.title), description: translate(uiLocale, st.description), position: idx })),
  );
  if (stErr) {
    await s.supabase.from("projects").delete().eq("id", project.id);
    throw stErr;
  }
  if (body.topic) {
    await s.supabase.from("project_memory").insert({ project_id: project.id, user_id: s.user.id, kind: "fact", content: `${pick({ tr: "Araştırma konusu", en: "Research topic", de: "Forschungsthema" }, uiLocale)}: ${body.topic}`, source: "user", pinned: true });
  }
  return json({ project }, 201);
});
