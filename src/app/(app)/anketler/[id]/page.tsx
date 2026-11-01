import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { SurveyEditor } from "@/components/surveys/survey-editor";
import { getSession } from "@/lib/auth";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Anket") };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const s = (await getSession())!;
  const { id } = await params;
  const [{ data: survey }, { data: projects }] = await Promise.all([
    s.supabase.from("surveys").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle(),
    s.supabase.from("projects").select("id, title").eq("user_id", s.user.id).neq("status", "archived").order("updated_at", { ascending: false }),
  ]);
  if (!survey) notFound();
  return <SurveyEditor initial={survey} projects={projects ?? []} />;
}
