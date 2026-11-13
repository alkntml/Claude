import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isMissingColumn, withoutNewColumns } from "@/lib/db-compat";
import { adminClient } from "@/lib/supabase/admin";
import { buildTemplate, STAGE_LIBRARY, TEMPLATE_VERSION, type TemplateSection } from "@/lib/workflows";

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

export { TEMPLATE_VERSION };
/* eslint-enable @typescript-eslint/no-explicit-any */
