import { getT } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";
import { QualityView } from "@/components/workspace/quality";
import { getSession } from "@/lib/auth";
import { projectAccessOrNull } from "@/lib/project-access";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kalite kontrol") };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) redirect("/giris");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  // Sahip veya ortak yazar (D115)
  const acc = await projectAccessOrNull(s, id);
  if (!acc) notFound();
  const [{ data: report }, { data: stages }] = await Promise.all([
    acc.db.from("quality_reports").select("*").eq("project_id", id).eq("user_id", acc.ownerId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    acc.db.from("project_stages").select("id, key, title").eq("project_id", id).eq("user_id", acc.ownerId),
  ]);
  return <QualityView project={{ id: acc.project.id, title: acc.project.title }} initial={report} stages={stages ?? []} />;
}
