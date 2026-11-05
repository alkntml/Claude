import { dateLocale } from "@/i18n";
import { getT } from "@/i18n/server";
import { notFound } from "next/navigation";
import { Logo } from "@/components/icons";
import { DocView } from "@/components/share/doc-view";
import { ShareComment } from "@/components/share/share-comment";
import { isSupabaseConfigured } from "@/lib/env";
import { buildExportDoc } from "@/lib/export/model";
import { sourceRowToItem } from "@/lib/projects";
import { resolveShare } from "@/lib/shares";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Paylaşılan çalışma"), robots: { index: false, follow: false } };
}

export default async function SharedProject({ params }: { params: Promise<{ token: string }> }) {
  if (!isSupabaseConfigured()) notFound();
  const { t, locale } = await getT();
  const dl = dateLocale(locale);
  const { token } = await params;
  const share = await resolveShare(token);
  if (!share) notFound();
  const db = adminClient();
  // Yalnızca paylaşılan projeye ait veriler, açık project_id filtresiyle okunur
  const [{ data: project }, { data: stages }, { data: sources }, { data: owner }] = await Promise.all([
    db.from("projects").select("*").eq("id", share.project_id).single(),
    db.from("project_stages").select("id, key, title, position, content, content_text").eq("project_id", share.project_id).order("position"),
    db.from("sources").select("*").eq("project_id", share.project_id),
    db.from("profiles").select("full_name").eq("id", share.user_id).single(),
  ]);
  if (!project) notFound();
  await db.from("project_shares").update({ view_count: share.view_count + 1, last_viewed_at: new Date().toISOString() }).eq("id", share.id);
  const doc = buildExportDoc({ project, stages: stages ?? [], sources: sources ?? [], engineItems: (sources ?? []).map(sourceRowToItem), authorName: owner?.full_name ?? "" });
  const written = (stages ?? []).filter((s) => (s.content_text ?? "").trim() && s.key !== "references");
  const stageIds = Object.fromEntries(written.map((s) => [s.title, `bolum-${s.id}`]));

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3"><Logo /><span className="rounded-full bg-ink-100 px-3 py-1 text-xs text-ink-600">{t("Salt okunur paylaşım")}{share.expires_at ? ` · ${t("{date} tarihine kadar", { date: new Date(share.expires_at).toLocaleDateString(dl) })}` : ""}</span></div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-12 lg:grid-cols-[1fr_260px]">
        <main>
          <p className="text-sm text-ink-400">{doc.author}{doc.institution ? ` · ${doc.institution}` : ""}</p>
          <h1 className="mt-2 font-serif text-4xl font-medium leading-tight tracking-tight text-ink-950">{doc.title}</h1>
          <p className="mt-2 text-sm text-ink-500">{doc.styleLabel} · {t("{n} bölüm", { n: written.length })}</p>
          <div className="mt-8"><DocView doc={doc} stageIds={stageIds} /></div>
        </main>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <nav className="text-sm">
            <p className="mb-2 font-semibold text-ink-800">{t("İçindekiler")}</p>
            {doc.toc.filter((e) => e.level === 1).map((e) => <a key={e.text} href={`#${stageIds[e.text] ?? ""}`} className="block rounded-lg px-2 py-1 text-ink-600 hover:bg-ink-50">{e.number} {e.text}</a>)}
          </nav>
          {share.allow_comments && written.length > 0 && <ShareComment token={token} stages={written.map((s) => ({ id: s.id, title: s.title }))} />}
        </aside>
      </div>
    </div>
  );
}
