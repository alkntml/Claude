import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { isMissingColumn } from "@/lib/db-compat";
import { cleanSavedSections, defaultTemplateFor, insertStageRows, logStructureChange, sectionColumns, TEMPLATE_VERSION, undoStructureChange } from "@/lib/structure-server";
import { diffTemplate, STAGE_LIBRARY, type TemplateSection } from "@/lib/workflows";
import { translate } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";

type Ctx = { params: Promise<{ id: string }> };

/* eslint-disable @typescript-eslint/no-explicit-any */
async function loadStages(db: any, id: string) {
  let r = await db.from("project_stages").select("id, key, title, position, word_count, requirement, scope, hidden").eq("project_id", id).order("position");
  if (isMissingColumn(r.error)) r = await db.from("project_stages").select("id, key, title, position, word_count").eq("project_id", id).order("position");
  return (r.data ?? []) as any[];
}

/** Hedef yapı: Academiana varsayılanı veya kullanıcının kayıtlı şablonu */
async function targetOf(s: any, project: any, source: string, uiLocale: any): Promise<TemplateSection[]> {
  if (source === "default") return defaultTemplateFor(project).map((t) => ({ ...t, title: translate(uiLocale, t.title), description: translate(uiLocale, t.description), why: translate(uiLocale, t.why) }));
  const { data } = await s.supabase.from("user_templates").select("sections").eq("id", source).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Şablon bulunamadı");
  return cleanSavedSections(data.sections).map((x) => ({ key: x.key, title: x.title, description: x.description, requirement: x.requirement as any, scope: x.scope as any, why: "", critical: false }));
}

/** D171: yapı durumu — varsayılan şablon, farklar, şablon sürümü ve değişiklik geçmişi */
export const GET = route<Ctx>("structure.get", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { project, db } = await projectAccess(s, id, "read");
  const uiLocale = localeFromRequest(req);
  const source = new URL(req.url).searchParams.get("source") ?? "default";
  const stages = await loadStages(db, id);
  const target = await targetOf(s, project, source === "default" ? "default" : source, uiLocale);
  const { data: log } = await db.from("template_change_logs").select("id, action, detail, created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(40);
  return json({
    template: target, diff: diffTemplate(stages, target),
    version: { project: Number(project.context?.templateVersion ?? 1), current: TEMPLATE_VERSION },
    log: log ?? [],
  });
});

const ApplySchema = z.object({
  source: z.string().max(60).default("default"),
  add: z.array(z.string().max(60)).max(60).default([]),
  remove: z.array(z.string().uuid()).max(60).default([]),
  rename: z.array(z.string().uuid()).max(60).default([]),
});

/**
 * Seçilen farkları uygular (kullanıcı onayıyla). İçerik silinmez: metni olan bölüm kaldırılmaz (atlananlar döner).
 * Eklenen bölümler hedef yapıdaki sıraya yerleştirilir.
 */
export const POST = route<Ctx>("structure.apply", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { project, db, ownerId } = await projectAccess(s, id, "owner");
  const b = await parseBody(req, ApplySchema);
  const uiLocale = localeFromRequest(req);
  const target = await targetOf(s, project, b.source, uiLocale);
  const stages = await loadStages(db, id);
  const diff = diffTemplate(stages, target);
  const skipped: string[] = [];
  const prevOrder = stages.map((x) => x.id as string);
  const removedRows: Record<string, unknown>[] = [];
  // Kaldır (yalnızca boş bölümler); geri alma için satır bilgisi saklanır
  for (const r of diff.remove.filter((x) => b.remove.includes(x.id))) {
    if (r.hasText) { skipped.push(r.title); continue; }
    const st = stages.find((x) => x.id === r.id);
    removedRows.push({ key: r.key, title: r.title, requirement: st?.requirement ?? "required", scope: st?.scope ?? "standard", position: st?.position ?? 0 });
    await db.from("project_stages").delete().eq("id", r.id).eq("project_id", id);
  }
  // Yeniden adlandır
  const renamed = diff.rename.filter((x) => b.rename.includes(x.id));
  for (const r of renamed) await db.from("project_stages").update({ title: r.to.slice(0, 200) }).eq("id", r.id).eq("project_id", id);
  let addedIds: string[] = [];
  // Ekle: hedef sıradaki önceki bölümün arkasına
  const addList = diff.add.filter((x) => b.add.includes(x.key) && (STAGE_LIBRARY[x.key] || x.key.startsWith("custom_")));
  if (addList.length) {
    const current = await loadStages(db, id);
    const order = [...current];
    for (const t of addList) {
      const ti = target.findIndex((x) => x.key === t.key);
      const prevKeys = target.slice(0, ti).map((x) => x.key).reverse();
      const anchor = prevKeys.map((k) => order.findIndex((st) => st.key === k)).find((i) => i >= 0) ?? -1;
      order.splice(anchor + 1, 0, { id: null, key: t.key, title: t.title, _t: t });
    }
    const fresh = order.filter((x) => !x.id).map((x) => ({ project_id: id, user_id: ownerId, key: x.key, title: x._t.title, description: x._t.description, position: order.indexOf(x), ...sectionColumns(x._t) }));
    const { data: inserted, error } = await insertStageRows(db, fresh);
    if (error) throw error;
    // Sıra numaralarını yeniden yaz
    const ids = order.map((x) => x.id ?? (inserted ?? []).find((r: any) => r.key === x.key)?.id).filter(Boolean);
    addedIds = (inserted ?? []).map((r: any) => r.id);
    await Promise.all(ids.map((sid: string, idx: number) => db.from("project_stages").update({ position: idx }).eq("id", sid).eq("project_id", id)));
  }
  const prevVersion = project.context?.templateVersion ?? null;
  if (b.source === "default") await db.from("projects").update({ context: { ...(project.context ?? {}), templateVersion: TEMPLATE_VERSION } }).eq("id", id);
  await logStructureChange(id, s.user.id, b.source === "default" ? "template.default" : "template.apply", {
    source: b.source, added: addList.map((x) => x.key), removed: removedRows.length, renamed: renamed.length, skipped,
    // D173: geri alma bilgisi
    undo: { addedIds, renamed: renamed.map((r) => ({ id: r.id, from: r.from })), removedRows, prevOrder, prevVersion },
  });
  return json({ ok: true, skipped });
});

/** D173 (referans 11.2, 12.2): bir yapı değişikliğini proje bazında geri alır. Metin içeren bölüm silinmez; yalnızca sahip. */
export const PATCH = route<Ctx>("structure.undo", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { db, ownerId } = await projectAccess(s, id, "owner");
  const b = await parseBody(req, z.object({ undo: z.number().int().positive() }));
  const { data: log } = await db.from("template_change_logs").select("id, action, detail").eq("id", b.undo).eq("project_id", id).maybeSingle();
  if (!log) throw new ApiError(404, "Kayıt bulunamadı");
  const res = await undoStructureChange(db, id, ownerId, log as any);
  await logStructureChange(id, s.user.id, "undo", { of: log.id, action: log.action, skipped: res.skipped });
  return json({ ok: true, skipped: res.skipped });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
