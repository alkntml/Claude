import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumn, withoutNewColumns } from "@/lib/db-compat";
import { adminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/api";
import { buildTemplate, STAGE_LIBRARY, TEMPLATE_VERSION, UNDOABLE_ACTIONS, type TemplateSection } from "@/lib/workflows";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Projenin yol haritası girdileri (bağlamda saklanan yaklaşım, desen, alt tür, program) */
export function templateInputOf(project: any) {
  const ctx = project?.context ?? {};
  return { workType: project.work_type, level: project.academic_level, methodology: ctx.methodology ?? null, program: ctx.program ?? null, design: ctx.design ?? null, variant: ctx.variant ?? null };
}

/** Projenin güncel Academiana varsayılan şablonu */
export function defaultTemplateFor(project: any): TemplateSection[] {
  return buildTemplate(templateInputOf(project));
}

/**
 * Yapı değişikliği kaydı (D171). Migration 43 çalıştırılmadıysa tablo yoktur: kayıt sessizce atlanır, işlem sürer.
 * Yalnızca sunucu yazar (RLS’te ekleme politikası yok); kayıt proje kimliğiyle sınırlıdır.
 */
export async function logStructureChange(projectId: string, userId: string, action: string, detail: Record<string, unknown> = {}): Promise<void> {
  try {
    await adminClient().from("template_change_logs").insert({ project_id: projectId, user_id: userId, action: action.slice(0, 40), detail });
  } catch { /* geçmiş kaydı işlemi engellemez */ }
}

/** Bölüm satırlarını ekler; migration 43 öncesinde yeni sütunlar yoksa onlarsız yeniden dener */
export async function insertStageRows(db: SupabaseClient, rows: Record<string, unknown>[]) {
  const r = await db.from("project_stages").insert(rows).select();
  if (isMissingColumn(r.error)) return db.from("project_stages").insert(rows.map(withoutNewColumns)).select();
  return r;
}

/** Şablon bölümünden eklenecek satırın ayar alanları */
export function sectionColumns(t: Pick<TemplateSection, "requirement" | "scope" | "why" | "critical">) {
  return { requirement: t.requirement, scope: t.scope, why: t.why.slice(0, 600), critical: t.critical };
}

/** Kullanıcı şablonundaki bölüm biçimi */
export interface SavedSection { key: string; title: string; description: string; requirement: string; scope: string; hidden: boolean }

export function cleanSavedSections(raw: unknown): SavedSection[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 80).flatMap((x: any) => {
    const key = String(x?.key ?? "");
    if (!/^[a-z0-9_]{2,60}$/.test(key)) return [];
    if (!STAGE_LIBRARY[key] && !key.startsWith("custom_")) return [];
    return [{
      key, title: String(x?.title ?? STAGE_LIBRARY[key]?.title ?? "Bölüm").slice(0, 200), description: String(x?.description ?? "").slice(0, 1000),
      requirement: ["required", "conditional", "optional"].includes(x?.requirement) ? x.requirement : "required",
      scope: ["brief", "standard", "detailed"].includes(x?.scope) ? x.scope : "standard", hidden: !!x?.hidden,
    }];
  });
}

/** Geri alınabilen yapı değişiklikleri */
export const UNDOABLE = UNDOABLE_ACTIONS;

/**
 * D173: Yapı değişikliğini geri alır (referans 11.2 “geri alma”, 12.2 “proje bazında geri alma”). İçerik asla silinmez:
 * geri alınacak eklemede bölümde metin varsa o bölüm kaldırılmaz (skipped). Silinmiş bölüm yalnızca boşsa geri getirilir.
 */
export async function undoStructureChange(db: SupabaseClient, projectId: string, ownerId: string, log: { id: number; action: string; detail: any }): Promise<{ skipped: string[] }> {
  const d = log.detail ?? {};
  const skipped: string[] = [];
  if (d.undone) throw new ApiError(409, "Bu değişiklik zaten geri alındı");
  if (!UNDOABLE.has(log.action)) throw new ApiError(409, "Bu değişiklik geri alınamaz");
  const removeIfEmpty = async (sid: string) => {
    const { data } = await db.from("project_stages").select("title, word_count").eq("id", sid).eq("project_id", projectId).maybeSingle();
    if (!data) return;
    if ((data.word_count ?? 0) > 0) { skipped.push(data.title); return; }
    await db.from("project_stages").delete().eq("id", sid).eq("project_id", projectId);
  };
  const reinsert = async (rows: any[]) => {
    if (!rows.length) return;
    await insertStageRows(db, rows.map((r) => ({ project_id: projectId, user_id: ownerId, key: String(r.key).startsWith("custom_") || STAGE_LIBRARY[r.key] ? r.key : `custom_${Date.now().toString(36)}`, title: String(r.title ?? "Bölüm").slice(0, 200), description: String(r.description ?? ""), position: Number(r.position ?? 999), ...(r.requirement ? { requirement: r.requirement } : {}), ...(r.scope ? { scope: r.scope } : {}) })));
  };
  const reorder = async (prev: string[]) => {
    const { data } = await db.from("project_stages").select("id").eq("project_id", projectId).order("position");
    const ids = (data ?? []).map((x: any) => x.id as string);
    const ordered = [...prev.filter((x) => ids.includes(x)), ...ids.filter((x) => !prev.includes(x))];
    await Promise.all(ordered.map((sid, i) => db.from("project_stages").update({ position: i }).eq("id", sid).eq("project_id", projectId)));
  };
  switch (log.action) {
    case "section.add": case "section.duplicate": if (d.stageId) await removeIfEmpty(d.stageId); break;
    case "section.update": if (d.stageId && d.prev && Object.keys(d.prev).length) await compatUpdate(db, projectId, d.stageId, d.prev); break;
    case "section.reorder": if (Array.isArray(d.prev)) await reorder(d.prev); break;
    case "section.delete":
      if ((d.words ?? 0) > 0) throw new ApiError(409, "Metni olan silinmiş bölüm geri getirilemez; bölüm geçmişinden ve dışa aktarılmış kopyalardan yararlanın.");
      await reinsert([d]); break;
    default: {
      const u = d.undo ?? {};
      for (const sid of u.addedIds ?? []) await removeIfEmpty(sid);
      for (const r of u.renamed ?? []) await db.from("project_stages").update({ title: String(r.from).slice(0, 200) }).eq("id", r.id).eq("project_id", projectId);
      await reinsert(u.removedRows ?? []);
      if (Array.isArray(u.prevOrder)) await reorder(u.prevOrder);
      if (log.action === "template.default" && u.prevVersion !== undefined) {
        const { data: p } = await db.from("projects").select("context").eq("id", projectId).single();
        await db.from("projects").update({ context: { ...(p?.context ?? {}), templateVersion: u.prevVersion } }).eq("id", projectId);
      }
    }
  }
  try { await adminClient().from("template_change_logs").update({ detail: { ...d, undone: true } }).eq("id", log.id).eq("project_id", projectId); } catch { /* işaret yazılamazsa da geri alma geçerli */ }
  return { skipped };
}

async function compatUpdate(db: SupabaseClient, projectId: string, stageId: string, prev: Record<string, unknown>) {
  const row = Object.fromEntries(Object.entries(prev).filter(([k]) => ["title", "description", "requirement", "scope", "hidden"].includes(k)));
  const r = await db.from("project_stages").update(row).eq("id", stageId).eq("project_id", projectId);
  if (isMissingColumn(r.error)) await db.from("project_stages").update(withoutNewColumns(row)).eq("id", stageId).eq("project_id", projectId);
}

export { TEMPLATE_VERSION };
/* eslint-enable @typescript-eslint/no-explicit-any */
