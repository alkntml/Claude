import { getT } from "@/i18n/server";
import { notFound, redirect } from "next/navigation";
import { QualityView } from "@/components/workspace/quality";
import { getSession } from "@/lib/auth";
import { projectAccessOrNull } from "@/lib/project-access";
import { requireLegalAcceptance } from "@/lib/legal/server";
import { buildChecklist } from "@/lib/quality/checklist";
import { consistencyChain } from "@/lib/quality/consistency-chain";
import type { JSONNode } from "@/lib/editor/doc";
import { stageDef } from "@/lib/workflows";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  await requireLegalAcceptance(s, `/proje/${id}/kalite`);
  // Sahip veya ortak yazar (D115)
  const acc = await projectAccessOrNull(s, id);
  if (!acc) notFound();
  const [{ data: report }, { data: stages }, { data: sources }, audits] = await Promise.all([
    acc.db.from("quality_reports").select("*").eq("project_id", id).eq("user_id", acc.ownerId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    acc.db.from("project_stages").select("*").eq("project_id", id).eq("user_id", acc.ownerId).order("position"),
    acc.db.from("sources").select("id, verified, access_level").eq("project_id", id).eq("user_id", acc.ownerId),
    // İddia denetimleri (D119): her bölümün son denetimi; tablo yoksa (migration 33 öncesi) boş
    acc.db.from("claim_audits").select("stage_id, summary, created_at").eq("project_id", id).eq("user_id", acc.ownerId).order("created_at", { ascending: false }).limit(300).then((r) => r.data ?? [], () => []),
  ]);
  const lastAudit: Record<string, any> = {};
  for (const a of audits as { stage_id: string; summary: any; created_at: string }[]) if (!lastAudit[a.stage_id]) lastAudit[a.stage_id] = { ...a.summary, created_at: a.created_at };
  const list = stages ?? [];
  const checklist = buildChecklist({
    workType: acc.project.work_type, keywords: acc.project.keywords ?? [], hasFormat: !!acc.project.context?.format,
    stages: list.map((st) => ({ id: st.id, key: st.key, title: st.title, content: st.content as JSONNode, generated: !!stageDef(st.key)?.generated })),
    sources: sources ?? [], audits: lastAudit, qualityScore: report?.score ?? null,
  });
  // D171: tutarlılık zinciri (puanı etkilemez)
  const ctx = acc.project.context ?? {};
  const chain = consistencyChain({
    workType: acc.project.work_type, level: acc.project.academic_level, methodology: ctx.methodology ?? null, program: ctx.program ?? null, design: ctx.design ?? null, variant: ctx.variant ?? null,
    stages: list.map((st: any) => ({ key: st.key, title: st.title, text: String(st.content_text ?? ""), hidden: !!st.hidden })),
  });
  return <QualityView project={{ id: acc.project.id, title: acc.project.title }} initial={report} stages={list.map(({ id: sid, key, title }) => ({ id: sid, key, title }))} checklist={checklist} chain={chain} />;
}
