import { getT } from "@/i18n/server";
import { SurveyList } from "@/components/surveys/survey-list";
import { getSession } from "@/lib/auth";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Anketlerim") };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ proje?: string }> }) {
  const s = (await getSession())!;
  const { proje } = await searchParams;
  const [surveys, projects] = await Promise.all([
    s.supabase.from("surveys").select("id, title, project_id, is_open, response_count, closes_at, updated_at").eq("user_id", s.user.id).order("updated_at", { ascending: false }),
    s.supabase.from("projects").select("id, title").eq("user_id", s.user.id).neq("status", "archived").order("updated_at", { ascending: false }),
  ]);
  return <SurveyList surveys={surveys.data ?? []} projects={projects.data ?? []} defaultProject={proje ?? null} />;
}
