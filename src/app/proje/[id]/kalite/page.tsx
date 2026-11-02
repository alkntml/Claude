import { getT } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";
import { QualityView } from "@/components/workspace/quality";
import { getSession } from "@/lib/auth";
import { getWorkLock } from "@/lib/lock";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kalite kontrol") };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) redirect("/giris");
  if ((await getWorkLock()).locked) redirect(`/proje/${(await params).id}`);
  const { id } = await params;
  const { data: project } = await s.supabase.from("projects").select("id, title").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!project) notFound();
  const [{ data: report }, { data: stages }] = await Promise.all([
    s.supabase.from("quality_reports").select("*").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    s.supabase.from("project_stages").select("id, key, title").eq("project_id", id),
  ]);
  return <QualityView project={project} initial={report} stages={stages ?? []} />;
}
