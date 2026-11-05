import { ApiError, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { generateDeck, renderPptx } from "@/lib/export/presentation";
import { loadProjectBundle, sourceRowToItem } from "@/lib/projects";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 180;

function safeName(s: string) {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "sunum";
}

/** Tez savunması / makale sunumu taslağı (.pptx). İçerik yalnızca çalışmanın kendi metninden üretilir. */
export const POST = route<Ctx>("project.presentation", async (_req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "defense");
  const { id } = await params;
  await assertWithinLimits(s.user.id, s.profile.plan_id, "export", { format: "docx" });
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const bundle = await loadProjectBundle(s.supabase, id, s.user.id);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");
  let gen;
  try {
    gen = await generateDeck({ planId: s.profile.plan_id, project: bundle.project, stages: bundle.stages, sources: bundle.sources });
  } catch (e) {
    throw new ApiError(422, e instanceof Error ? e.message : "Sunum oluşturulamadı");
  }
  const buf = await renderPptx({ deck: gen.deck, sourceMap: gen.sourceMap, project: bundle.project, items: bundle.sources.map(sourceRowToItem), authorName: s.profile.full_name || "" });
  await Promise.all([
    recordUsage(s.user.id, "ai_request", { usage: gen.usage, costUsd: gen.cost, provider: gen.provider, model: gen.model, meta: { action: "presentation", projectId: id } }),
    recordUsage(s.user.id, "export", { meta: { format: "pptx", projectId: id } }),
  ]);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "Content-Disposition": `attachment; filename="${safeName(bundle.project.title)}-sunum.pptx"`,
      "Cache-Control": "no-store",
    },
  });
});
