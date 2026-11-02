import { getT } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";
import { Workspace } from "@/components/workspace/workspace";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { loadProjectBundle } from "@/lib/projects";
import { getWorkLock } from "@/lib/lock";
import { hasDownloadPass } from "@/lib/usage";
import { adminClient } from "@/lib/supabase/admin";
import { scrambleSource, scrambleText } from "@/lib/scramble";
import { LockedProject } from "@/components/workspace/locked-project";
import { memberCode } from "@/lib/member";

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
  // Çalışma kilidi (D50): içerik istemciye karartılmış gönderilir; asıl metin ve kaynaklar sayfada hiç bulunmaz
  const lock = await getWorkLock();
  if (lock.locked) {
    const bundle = await loadProjectBundle(adminClient(), id, s.user.id);
    if (!bundle) notFound();
    const pass = await hasDownloadPass(s.user.id, id);
    const stages = bundle.stages.map((st, i) => ({ id: st.id as string, title: st.title as string, key: st.key as string, word_count: Number(st.word_count ?? 0), text: scrambleText(String(st.content_text ?? "").slice(0, 3000), i + 3) }));
    const sources = bundle.sources.map((src, i) => { const x = scrambleSource(src, i + 5); return { id: x.id as string, title: x.title as string, year: x.year as number | null, authors: x.authors as unknown[] }; });
    return <LockedProject project={{ id: bundle.project.id, title: bundle.project.title, work_type: bundle.project.work_type }} stages={stages} sources={sources} reasons={lock.reasons} pass={pass} email={s.profile.email ?? s.user.email ?? ""} memberNo={memberCode(s.profile.member_no)} />;
  }
  // Proje, dosyalar ve “son açılma” güncellemesi paralel yürür
  const [bundle, { data: files }] = await Promise.all([
    loadProjectBundle(s.supabase, id, s.user.id),
    s.supabase.from("files").select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, created_at").eq("user_id", s.user.id).eq("project_id", id).order("created_at", { ascending: false }),
    s.supabase.from("projects").update({ last_opened_at: new Date().toISOString() }).eq("id", id).eq("user_id", s.user.id),
  ]);
  if (!bundle) notFound();
  return <Workspace project={bundle.project} stages={bundle.stages} sources={bundle.sources} memory={bundle.memory} files={files ?? []} initialStageId={bolum ?? null} planId={s.profile.plan_id} />;
}
