import "server-only";
import { ApiError } from "@/lib/api";
import { adminClient } from "@/lib/supabase/admin";
import { monthStart, planLimits } from "@/lib/usage";

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

const OFF_MSG = {
  ai_request: "Tek Proje paketinde, çalışmanız dışındaki yapay zekâ kullanımının (anket, konu bulma) bu ayki hakkı doldu. Çalışmanızdaki kullanım bundan etkilenmez.",
  source_search: "Tek Proje paketinde, çalışmanız dışındaki kaynak taramasının bu ayki hakkı doldu. Çalışmanızın içinden yaptığınız taramalar bundan etkilenmez.",
} as const;

/**
 * D109: Tek Proje’de sınırsızlık yalnızca pakete bağlı çalışma içindir. Çalışmaya bağlı olmayan yapay zekâ ve tarama
 * (anket yapay zekâsı, konu bulma, çalışma dışından kaynak arama) ayda Ücretsiz paket kadardır. Dönüş true ise kullanım
 * kaydına `offProject: true` yazılmalıdır (sayaç bu işaretle sayar).
 */
export async function assertSingleOffProject(s: { user: { id: string }; profile: Prof }, kind: "ai_request" | "source_search"): Promise<boolean> {
  const p = s.profile;
  if (p.plan_id !== SINGLE_PLAN || p.role === "admin") return false;
  const free = await planLimits("free");
  const lim = kind === "ai_request" ? free.ai_requests_month : free.source_searches_month;
  if (lim == null) return true;
  const { data } = await adminClient().from("usage_events").select("quantity")
    .eq("user_id", s.user.id).eq("kind", kind).gte("created_at", monthStart()).eq("meta->>offProject", "true").limit(1000);
  const used = (data ?? []).reduce((a, r) => a + Number(r.quantity ?? 0), 0);
  if (used >= lim) throw new ApiError(402, OFF_MSG[kind], "single_offproject");
  return true;
}

/** Çalışmaya bağlıysa (pakete bağlı çalışma) sınırsız; değilse çalışma dışı aylık hak (D109). Dönüş: kullanım kaydına offProject yazılsın mı? */
export async function singleScope(s: { user: { id: string }; profile: Prof }, kind: "ai_request" | "source_search", projectId: string | null | undefined): Promise<boolean> {
  if (projectId && projectId === s.profile.single_project_id) return false;
  return assertSingleOffProject(s, kind);
}
