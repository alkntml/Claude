import "server-only";
/**
 * Çalışmaya erişim (D115, ortak yazım). Çalışmanın tüm içeriği sahibinin kaydıdır (user_id = sahip). Sahip kendi oturumuyla
 * (RLS) çalışır; ortak yazar için üyelik `project_members` tablosundan doğrulanır ve sorgular sunucu anahtarıyla, her zaman
 * açık `project_id` / sahip `user_id` filtresiyle yapılır. Rol sırası: commenter (okur, yorum yazar) < editor (yazar) < owner.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api";
import type { Session } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

export type ProjectRole = "owner" | "editor" | "commenter" | "advisor";
export type AccessNeed = "read" | "comment" | "edit" | "owner";
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ProjectAccess {
  project: any;
  role: ProjectRole;
  /** Çalışma sahibinin kimliği: alt kayıtlar bu kimlikle okunur ve yazılır */
  ownerId: string;
  /** Sahip için kullanıcının oturumu (RLS), ortak yazar için sunucu istemcisi (açık filtreyle) */
  db: SupabaseClient;
  isOwner: boolean;
}

const RANK: Record<ProjectRole, number> = { commenter: 1, advisor: 1, editor: 2, owner: 3 };
const NEED: Record<AccessNeed, number> = { read: 1, comment: 1, edit: 2, owner: 3 };

/** Rol, istenen işlem için yeterli mi? (saf; testlerde de kullanılır) */
export function roleAllows(role: ProjectRole, need: AccessNeed): boolean {
  return RANK[role] >= NEED[need];
}

export const ROLE_DENIED: Record<AccessNeed, string> = {
  read: "Bu çalışmaya erişiminiz yok",
  comment: "Bu çalışmaya erişiminiz yok",
  edit: "Bu çalışmada yalnızca yorum yazabilirsiniz; düzenleme yetkiniz yok",
  owner: "Bu işlemi yalnızca çalışmanın sahibi yapabilir",
};

/** Çalışmayı ve kullanıcının rolünü döner; erişim yoksa 404, rol yetmiyorsa 403. */
export async function projectAccess(s: Session, projectId: string, need: AccessNeed = "edit"): Promise<ProjectAccess> {
  const { data: own } = await s.supabase.from("projects").select("*").eq("id", projectId).eq("user_id", s.user.id).maybeSingle();
  if (own) return { project: own, role: "owner", ownerId: s.user.id, db: s.supabase, isOwner: true };
  const admin = adminClient();
  const { data: m } = await admin.from("project_members").select("role").eq("project_id", projectId).eq("user_id", s.user.id).maybeSingle();
  if (!m) throw new ApiError(404, "Proje bulunamadı");
  const { data: project } = await admin.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (!project) throw new ApiError(404, "Proje bulunamadı");
  const role = m.role as ProjectRole;
  if (!roleAllows(role, need)) throw new ApiError(403, ROLE_DENIED[need], "role_denied");
  return { project, role, ownerId: project.user_id, db: admin, isOwner: false };
}

/** Sayfa yüklemesi için: erişim yoksa null (notFound) */
export async function projectAccessOrNull(s: Session, projectId: string): Promise<ProjectAccess | null> {
  try { return await projectAccess(s, projectId, "read"); } catch { return null; }
}

/**
 * Bir alt kaydı (bölüm, kaynak…) ve bağlı olduğu çalışmaya erişimi döner. Önce kullanıcının kendi kaydı (RLS) aranır;
 * yoksa kaydın çalışması üzerinden ortak yazarlık denetlenir.
 */
export async function childAccess(s: Session, table: "project_stages" | "sources", id: string, need: AccessNeed = "edit", columns = "*"): Promise<{ row: any; access: ProjectAccess }> {
  const cols = columns === "*" ? "*" : `${columns}, project_id`;
  const { data: own } = await s.supabase.from(table).select(cols).eq("id", id).eq("user_id", s.user.id).maybeSingle();
  const notFound = table === "project_stages" ? "Bölüm bulunamadı" : "Kaynak bulunamadı";
  if (own) {
    const pid = (own as any).project_id as string | null;
    if (!pid) return { row: own, access: { project: null, role: "owner", ownerId: s.user.id, db: s.supabase, isOwner: true } };
    return { row: own, access: await projectAccess(s, pid, need) };
  }
  const { data: row } = await adminClient().from(table).select(cols).eq("id", id).maybeSingle();
  const pid = (row as any)?.project_id as string | undefined;
  if (!row || !pid) throw new ApiError(404, notFound);
  try {
    return { row, access: await projectAccess(s, pid, need) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) throw new ApiError(404, notFound);
    throw e;
  }
}

/** Kullanıcının ortak yazarı olduğu çalışmalar (panelde “Benimle paylaşılanlar”) */
export async function sharedWithMe(userId: string): Promise<{ id: string; title: string; work_type: string; progress: number; updated_at: string; role: ProjectRole; owner_name: string | null }[]> {
  const admin = adminClient();
  const { data: ms } = await admin.from("project_members").select("project_id, role").eq("user_id", userId);
  if (!ms?.length) return [];
  const { data: ps } = await admin.from("projects").select("id, title, work_type, progress, updated_at, user_id, status").in("id", ms.map((m) => m.project_id));
  const owners = [...new Set((ps ?? []).map((p) => p.user_id))];
  const { data: names } = owners.length ? await admin.from("profiles").select("id, full_name, email").in("id", owners) : { data: [] as any[] };
  const nameOf = (id: string) => { const p = (names ?? []).find((x: any) => x.id === id); return p ? (p.full_name || p.email?.split("@")[0] || null) : null; };
  return (ps ?? []).filter((p) => p.status !== "archived").map((p) => ({
    id: p.id, title: p.title, work_type: p.work_type, progress: p.progress ?? 0, updated_at: p.updated_at,
    role: (ms.find((m) => m.project_id === p.id)?.role ?? "commenter") as ProjectRole, owner_name: nameOf(p.user_id),
  })).sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** Görünen ad: ad soyad, yoksa e-postanın @ öncesi */
export function displayName(p: { full_name?: string | null; email?: string | null } | null | undefined): string {
  return (p?.full_name || p?.email?.split("@")[0] || "").trim() || "—";
}

/** Çalışmanın ortak yazarı var mı? (sahip dahil kişi sayısı > 1 ise varlık ve çakışma denetimi çalışır) */
export async function hasMembers(projectId: string): Promise<boolean> {
  const { count } = await adminClient().from("project_members").select("user_id", { count: "exact", head: true }).eq("project_id", projectId);
  return (count ?? 0) > 0;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
