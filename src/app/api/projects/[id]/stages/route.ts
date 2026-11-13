import { z } from "zod";
import { watchSections } from "@/lib/single-watch";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { compatWrite, isMissingColumn } from "@/lib/db-compat";
import { buildRoadmap, STAGE_LIBRARY } from "@/lib/workflows";
import { defaultTemplateFor, logStructureChange } from "@/lib/structure-server";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("stages.list", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { db } = await projectAccess(s, id, "read");
  const base = "id, key, title, description, position, status, word_count, updated_at";
  // D171: bölüm ayarları; migration 43 öncesinde sütunlar yoksa varsayılanlarla döner
  let r = await db.from("project_stages").select(`${base}, requirement, scope, hidden, why, critical, modified`).eq("project_id", id).order("position");
  if (isMissingColumn(r.error)) r = await db.from("project_stages").select(base).eq("project_id", id).order("position") as typeof r;
  const defaults = { requirement: "required", scope: "standard", hidden: false, why: "", critical: false, modified: false };
  const rows = (r.data ?? []).map((x) => Object.assign({}, defaults, x));
  return json({ stages: rows });
});

const AddSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(1000).default(""),
  libraryKey: z.string().max(60).optional(),
  afterPosition: z.number().int().min(-1).optional(),
  /** D171: bir bölümü çoğalt (başlık ve alt başlık yapısı kopyalanır, metin kopyalanmaz) */
  duplicateOf: z.string().uuid().optional(),
  requirement: z.enum(["required", "conditional", "optional"]).optional(),
  scope: z.enum(["brief", "standard", "detailed"]).optional(),
});

/** Yeni aşama ekler (kütüphaneden veya özel). */
export const POST = route<Ctx>("stages.add", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { project, db, ownerId } = await projectAccess(s, id, "edit");
  const b = await parseBody(req, AddSchema);
  const { data: existing } = await db.from("project_stages").select("id, key, position").eq("project_id", id).order("position");
  const list = existing ?? [];
  let key = b.libraryKey && STAGE_LIBRARY[b.libraryKey] ? b.libraryKey : `custom_${Date.now().toString(36)}`;
  if (list.some((x) => x.key === key)) key = `${key}_${Date.now().toString(36)}`;
  const pos = b.afterPosition === undefined ? list.length : b.afterPosition + 1;
  // Sonraki aşamaları kaydır
  for (const st of list.filter((x) => x.position >= pos).sort((a, b2) => b2.position - a.position)) {
    await db.from("project_stages").update({ position: st.position + 1 }).eq("id", st.id).eq("project_id", id);
  }
  const lib = STAGE_LIBRARY[key];
  // D171: şablonda olan bölüm eklenirse zorunluluk, kapsam ve gerekçe şablondan gelir
  const t = b.libraryKey ? defaultTemplateFor(project).find((x) => x.key === b.libraryKey) : undefined;
  // Çoğaltma: kaynağın başlık yapısı (yalnızca başlıklar) kopyalanır
  let copied: Record<string, unknown> = {};
  if (b.duplicateOf) {
    const { data: src } = await db.from("project_stages").select("*").eq("id", b.duplicateOf).eq("project_id", id).maybeSingle();
    if (src) {
      const heads = ((src.content as { content?: { type?: string }[] } | null)?.content ?? []).filter((n) => n?.type === "heading");
      copied = { content: heads.length ? { type: "doc", content: heads } : null, requirement: src.requirement ?? "optional", scope: src.scope ?? "standard" };
    }
  }
  const { data, error } = await compatWrite({
    project_id: id, user_id: ownerId, last_editor: s.user.id, key, title: b.title, description: b.description || lib?.purpose || "", position: pos,
    requirement: b.requirement ?? t?.requirement ?? "optional", scope: b.scope ?? t?.scope ?? "standard", why: t?.why ?? "", critical: !!t?.critical, modified: true,
    ...copied,
  }, (row) => db.from("project_stages").insert(row).select().single());
  if (error) throw error;
  await logStructureChange(id, s.user.id, b.duplicateOf ? "section.duplicate" : "section.add", { key, title: b.title, position: pos });
  // D109: Tek Proje — bölüm sayısı çalışma türü şablonunun iki katını aşarsa yöneticiye uyarı (engellemez)
  let template = 0;
  try { template = buildRoadmap({ workType: project.work_type, level: project.academic_level, methodology: project.context?.methodology ?? undefined, program: project.context?.program, design: project.context?.design, variant: project.context?.variant }).length; } catch { /* bilinmeyen tür */ }
  if (ownerId === s.user.id) await watchSections({ userId: s.user.id, profile: s.profile, projectId: id, projectTitle: project.title, count: list.length + 1, template }).catch(() => {});
  return json({ stage: data }, 201);
});

const ReorderSchema = z.object({ order: z.array(z.string().uuid()).min(1).max(100) });

export const PUT = route<Ctx>("stages.reorder", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { db } = await projectAccess(s, id, "edit");
  const { order } = await parseBody(req, ReorderSchema);
  await Promise.all(order.map((sid, idx) => db.from("project_stages").update({ position: idx }).eq("id", sid).eq("project_id", id)));
  await logStructureChange(id, s.user.id, "section.reorder", { count: order.length });
  return json({ ok: true });
});
