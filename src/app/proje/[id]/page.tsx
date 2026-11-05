import { getT } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";
import { Workspace } from "@/components/workspace/workspace";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { loadProjectBundle } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getSession().catch(() => null);
  const { t } = await getT();
  if (!s) return { title: t("Çalışma") };
  const { data } = await s.supabase.from("projects").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? t("Çalışma") };
}

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ bolum?: string }> }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  if (!s) redirect("/giris");
  const { id } = await params;
  const { bolum } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  // Proje, dosyalar ve “son açılma” güncellemesi paralel yürür
  const [bundle, { data: files }] = await Promise.all([
    loadProjectBundle(s.supabase, id, s.user.id),
    s.supabase.from("files").select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, created_at").eq("user_id", s.user.id).eq("project_id", id).order("created_at", { ascending: false }),
    s.supabase.from("projects").update({ last_opened_at: new Date().toISOString() }).eq("id", id).eq("user_id", s.user.id),
  ]);
  if (!bundle) notFound();
  return <Workspace project={bundle.project} stages={bundle.stages} sources={bundle.sources} memory={bundle.memory} files={files ?? []} initialStageId={bolum ?? null} planId={s.profile.plan_id} />;
}
