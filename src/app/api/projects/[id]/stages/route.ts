import { z } from "zod";
import { watchSections } from "@/lib/single-watch";
import { json, parseBody, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { buildRoadmap, STAGE_LIBRARY } from "@/lib/workflows";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("stages.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { data } = await s.supabase.from("project_stages").select("id, key, title, description, position, status, word_count, updated_at").eq("project_id", id).order("position");
  return json({ stages: data ?? [] });
});

const AddSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(1000).default(""),
  libraryKey: z.string().max(60).optional(),
  afterPosition: z.number().int().min(-1).optional(),
});

/** Yeni aşama ekler (kütüphaneden veya özel). */
export const POST = route<Ctx>("stages.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const project = await requireProject(s, id);
  const b = await parseBody(req, AddSchema);
  const { data: existing } = await s.supabase.from("project_stages").select("id, key, position").eq("project_id", id).order("position");
  const list = existing ?? [];
  let key = b.libraryKey && STAGE_LIBRARY[b.libraryKey] ? b.libraryKey : `custom_${Date.now().toString(36)}`;
  if (list.some((x) => x.key === key)) key = `${key}_${Date.now().toString(36)}`;
  const pos = b.afterPosition === undefined ? list.length : b.afterPosition + 1;
  // Sonraki aşamaları kaydır
  for (const st of list.filter((x) => x.position >= pos).sort((a, b2) => b2.position - a.position)) {
    await s.supabase.from("project_stages").update({ position: st.position + 1 }).eq("id", st.id);
  }
  const lib = STAGE_LIBRARY[key];
  const { data, error } = await s.supabase.from("project_stages").insert({
    project_id: id, user_id: s.user.id, key, title: b.title, description: b.description || lib?.purpose || "", position: pos,
  }).select().single();
  if (error) throw error;
  // D109: Tek Proje — bölüm sayısı çalışma türü şablonunun iki katını aşarsa yöneticiye uyarı (engellemez)
  let template = 0;
  try { template = buildRoadmap({ workType: project.work_type, level: project.academic_level, methodology: project.methodology ?? undefined, program: project.context?.program }).length; } catch { /* bilinmeyen tür */ }
  await watchSections({ userId: s.user.id, profile: s.profile, projectId: id, projectTitle: project.title, count: list.length + 1, template }).catch(() => {});
  return json({ stage: data }, 201);
});

const ReorderSchema = z.object({ order: z.array(z.string().uuid()).min(1).max(100) });

export const PUT = route<Ctx>("stages.reorder", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  await requireProject(s, id);
  const { order } = await parseBody(req, ReorderSchema);
  await Promise.all(order.map((sid, idx) => s.supabase.from("project_stages").update({ position: idx }).eq("id", sid).eq("project_id", id)));
  return json({ ok: true });
});
