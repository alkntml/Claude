import { getT } from "@/i18n/server";
import { FilesView } from "@/components/dashboard/files";
import { getSession } from "@/lib/auth";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Dosyalarım") };
}

export default async function Page() {
  const s = (await getSession())!;
  const [files, projects] = await Promise.all([
    s.supabase.from("files").select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, extraction_meta, created_at").eq("user_id", s.user.id).order("created_at", { ascending: false }),
    s.supabase.from("projects").select("id, title").eq("user_id", s.user.id).neq("status", "archived"),
  ]);
  return <FilesView files={files.data ?? []} projects={projects.data ?? []} />;
}
