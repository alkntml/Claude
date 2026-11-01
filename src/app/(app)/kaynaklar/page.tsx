import { getT } from "@/i18n/server";
import { LibraryView } from "@/components/dashboard/library";
import { getSession } from "@/lib/auth";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kaynak araştırması") };
}

export default async function Page() {
  const s = (await getSession())!;
  const [projects, sources] = await Promise.all([
    s.supabase.from("projects").select("id, title").eq("user_id", s.user.id).neq("status", "archived").order("updated_at", { ascending: false }),
    s.supabase.from("sources").select("*").eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(500),
  ]);
  return <LibraryView projects={projects.data ?? []} sources={sources.data ?? []} />;
}
