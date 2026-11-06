import "server-only";
import { ApiError } from "@/lib/api";
import { adminClient } from "@/lib/supabase/admin";

/**
 * Tek Proje paketi (D103): yalnızca tek bir çalışma; sınırsız kullanım yalnızca o çalışmada.
 * Engellenen denemeler ve şüpheli davranış yöneticilere bildirilir (raise_abuse_alert, migration 27).
 */
export const SINGLE_PLAN = "single";
type Prof = { id?: string; plan_id: string; single_project_id?: string | null; role?: string };

export async function singleAlert(userId: string, rule: string, data: Record<string, unknown> = {}): Promise<void> {
  await adminClient().rpc("raise_abuse_alert", { p_user: userId, p_rule: rule, p_data: data }).then(() => undefined, () => undefined);
}

/** Yapay zekâ ve tarama yalnızca pakete bağlı çalışmada kullanılabilir */
export async function assertSingleProject(s: { user: { id: string }; profile: Prof }, projectId: string | null | undefined): Promise<void> {
  const p = s.profile;
  if (p.plan_id !== SINGLE_PLAN || p.role === "admin" || !projectId) return;
  if (p.single_project_id && p.single_project_id !== projectId) {
    const { data } = await adminClient().from("projects").select("title").eq("id", p.single_project_id).maybeSingle();
    throw new ApiError(402, `Tek Proje paketiniz yalnızca “${data?.title ?? "pakete bağlı çalışma"}” çalışmasında geçerlidir.`, "single_project");
  }
}

/** Yeni çalışma: pakete bağlı çalışma varsa engellenir ve yöneticiye bildirilir */
export async function assertCanCreateProject(s: { user: { id: string }; profile: Prof }): Promise<void> {
  const p = s.profile;
  if (p.plan_id !== SINGLE_PLAN || p.role === "admin" || !p.single_project_id) return;
  await singleAlert(s.user.id, "second_project", { project_id: p.single_project_id });
  throw new ApiError(402, "Tek Proje paketinde yalnızca bir çalışma yapılabilir. Yeni bir çalışma için paketinizi yükseltebilirsiniz.", "single_project");
}

/** Pakete bağlı çalışmanın silinmesi ve türünün değiştirilmesi engellenir, denemeler bildirilir */
export async function assertSingleProjectChange(s: { user: { id: string }; profile: Prof }, projectId: string, change: "delete" | "work_type", title?: string | null): Promise<void> {
  const p = s.profile;
  if (p.plan_id !== SINGLE_PLAN || p.role === "admin" || p.single_project_id !== projectId) return;
  await singleAlert(s.user.id, change === "delete" ? "delete_project" : "worktype_change", { project_id: projectId, project_title: title ?? null });
  throw new ApiError(403, change === "delete" ? "Tek Proje paketine bağlı çalışma silinemez." : "Tek Proje paketinde çalışma türü değiştirilemez.", "single_project");
}
