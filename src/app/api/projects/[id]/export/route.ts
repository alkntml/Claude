import { ApiError, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { buildExportDoc } from "@/lib/export/model";
import { toDocx } from "@/lib/export/render-docx";
import { toPdf } from "@/lib/export/render-pdf";
import { toMarkdown, toText } from "@/lib/export/render-text";
import { loadProjectBundle, sourceRowToItem } from "@/lib/projects";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

const TYPES = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  md: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8",
} as const;

function safeName(s: string) {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "calisma";
}

export const GET = route<Ctx>("project.export", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const url = new URL(req.url);
  const format = url.searchParams.get("format") as keyof typeof TYPES;
  if (!TYPES[format]) throw new ApiError(422, "Desteklenmeyen biçim");
  // D81: kullanıcı kendi çalışmasını her zaman indirebilir (aylık hak dolsa bile); yalnızca paketin biçim izni kontrol edilir
  await assertWithinLimits(s.user.id, s.profile.plan_id, "export", { format, projectId: id });
  const bundle = await loadProjectBundle(s.supabase, id, s.user.id);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");

  const doc = buildExportDoc({
    project: bundle.project,
    stages: bundle.stages,
    sources: bundle.sources,
    engineItems: bundle.sources.map(sourceRowToItem),
    authorName: s.profile.full_name || s.profile.email || "",
    // ?stages=id1,id2 → yalnızca seçilen bölümler (D91)
    options: { numberHeadings: url.searchParams.get("numbering") !== "0", onlyStageIds: (url.searchParams.get("stages") ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/i.test(x)) },
  });

  let body: Buffer | string;
  if (format === "docx") body = await toDocx(doc, bundle.project.context?.format ?? {});
  else if (format === "pdf") body = await toPdf(doc, bundle.project.context?.format ?? {});
  else if (format === "md") body = toMarkdown(doc);
  else body = toText(doc);

  await recordUsage(s.user.id, "export", { meta: { format, projectId: id } });
  const filename = `${safeName(bundle.project.title)}.${format}`;
  return new Response(typeof body === "string" ? body : new Uint8Array(body), {
    headers: { "Content-Type": TYPES[format], "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
  });
});
