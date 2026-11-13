import { getT } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";
import { Workspace } from "@/components/workspace/workspace";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { loadProjectBundle } from "@/lib/projects";
import { displayName, hasMembers, projectAccessOrNull } from "@/lib/project-access";
import { requireLegalAcceptance } from "@/lib/legal/server";
import { getWorkLock } from "@/lib/lock";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession().catch(() => null);
  const { t } = await getT();
  if (!s) return { title: t("Çalışma") };
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { title: t("Çalışma") };
  const a = await projectAccessOrNull(s, id);
  return { title: a?.project.title ?? t("Çalışma"), robots: { index: false, follow: false } };
}

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ bolum?: string }> }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  if (!s) redirect("/giris");
  const { id } = await params;
  const { bolum } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  await requireLegalAcceptance(s, `/proje/${id}${bolum ? `?bolum=${encodeURIComponent(bolum)}` : ""}`);
  // Sahip veya ortak yazar (D115). Dosyalar kişiseldir: ortak yazar sahibin dosyalarını görmez.
  const access = await projectAccessOrNull(s, id);
  if (!access) notFound();
  const [bundle, { data: files }, shared] = await Promise.all([
    loadProjectBundle(access.db, id, access.ownerId),
    access.isOwner
      ? s.supabase.from("files").select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, created_at").eq("user_id", s.user.id).eq("project_id", id).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    access.isOwner ? hasMembers(id).catch(() => false) : Promise.resolve(true),
    access.isOwner ? s.supabase.from("projects").update({ last_opened_at: new Date().toISOString() }).eq("id", id).eq("user_id", s.user.id) : Promise.resolve(null),
  ]);
  if (!bundle) notFound();
  // D155: sayfa/yapay zekâ hakkı dolduysa çalışma salt okunur açılır (görüntüle + indir)
  const { locked } = await getWorkLock();
  return <Workspace project={bundle.project} stages={bundle.stages} sources={bundle.sources} memory={bundle.memory} files={files ?? []} initialStageId={bolum ?? null} planId={s.profile.plan_id} role={access.role} readOnly={locked} collaborative={shared} me={{ id: s.user.id, name: displayName({ full_name: s.profile.full_name, email: s.user.email }) }} />;
}
