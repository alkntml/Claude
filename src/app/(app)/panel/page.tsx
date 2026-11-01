import { getT } from "@/i18n/server";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getSession } from "@/lib/auth";
import { planLimits, usageSummary } from "@/lib/usage";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kontrol paneli") };
}

export default async function Panel() {
  const s = (await getSession())!;
  const db = s.supabase;
  const uid = s.user.id;
  const [projects, recentStages, sourcesCount, convs, files, ann, usage, limits] = await Promise.all([
    db.from("projects").select("id, title, work_type, academic_level, status, progress, citation_style, updated_at").eq("user_id", uid).order("updated_at", { ascending: false }),
    db.from("project_stages").select("id, title, project_id, word_count, updated_at, status").eq("user_id", uid).gt("word_count", 0).order("updated_at", { ascending: false }).limit(6),
    db.from("sources").select("id", { count: "exact", head: true }).eq("user_id", uid),
    db.from("ai_conversations").select("id, title, project_id, stage_id, updated_at").eq("user_id", uid).order("updated_at", { ascending: false }).limit(5),
    db.from("files").select("id, name, purpose, size_bytes, created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(5),
    db.from("announcements").select("id, title, body, level").order("starts_at", { ascending: false }).limit(3),
    usageSummary(uid).catch(() => null),
    planLimits(s.profile.plan_id).catch(() => ({})),
  ]);
  return (
    <Dashboard
      name={s.profile.full_name?.split(" ")[0] ?? ""}
      plan={s.profile.plan_id}
      projects={projects.data ?? []}
      recentStages={recentStages.data ?? []}
      sourcesCount={sourcesCount.count ?? 0}
      conversations={convs.data ?? []}
      files={files.data ?? []}
      announcements={ann.data ?? []}
      usage={usage}
      limits={limits}
    />
  );
}
