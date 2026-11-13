import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { isMissingColumn } from "@/lib/db-compat";
import { TEMPLATE_VERSION } from "@/lib/structure-server";

/** D171: kullanıcının kayıtlı yapı şablonları (yalnızca kendisi; RLS) */
export const GET = route("templates.list", async () => {
  const s = await requireUser();
  const { data, error } = await s.supabase.from("user_templates").select("id, name, work_type, methodology, sections, updated_at").eq("user_id", s.user.id).order("updated_at", { ascending: false }).limit(50);
  // Migration 43 çalıştırılmadıysa tablo yoktur: boş liste
  if (error) return json({ templates: [], unavailable: true });
  return json({ templates: (data ?? []).map((t) => ({ ...t, count: Array.isArray(t.sections) ? t.sections.length : 0, sections: undefined })) });
});

const SaveSchema = z.object({ projectId: z.string().uuid(), name: z.string().trim().min(1).max(120) });

/** Projenin güncel yapısını şablon olarak kaydeder (başlık, açıklama, sıra, zorunluluk, kapsam, görünürlük; metin kaydedilmez) */
export const POST = route("templates.save", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, SaveSchema);
  const { project, db } = await projectAccess(s, b.projectId, "read");
  let r = await db.from("project_stages").select("key, title, description, position, requirement, scope, hidden").eq("project_id", b.projectId).order("position");
  if (isMissingColumn(r.error)) r = await db.from("project_stages").select("key, title, description, position").eq("project_id", b.projectId).order("position") as typeof r;
  const sections = (r.data ?? []).map((x) => {
    const y = x as Record<string, unknown>;
    return { key: y.key, title: y.title, description: y.description ?? "", requirement: y.requirement ?? "required", scope: y.scope ?? "standard", hidden: !!y.hidden };
  });
  const { data, error } = await s.supabase.from("user_templates").insert({ user_id: s.user.id, name: b.name, work_type: project.work_type, methodology: project.context?.methodology ?? null, template_version: TEMPLATE_VERSION, sections }).select("id, name").single();
  if (error) throw new ApiError(503, "Şablon kaydedilemedi. Veritabanı güncellemesi (migration 43) henüz çalıştırılmamış olabilir.");
  return json({ template: data }, 201);
});
