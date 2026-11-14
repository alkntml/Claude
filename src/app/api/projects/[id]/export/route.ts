import { ApiError, route } from "@/lib/api";
import { watchExport } from "@/lib/single-watch";
import { requireUser } from "@/lib/auth";
import { buildExportDoc } from "@/lib/export/model";
import { toDocx } from "@/lib/export/render-docx";
import { effectiveFormat } from "@/lib/export/format";
import { toPdf } from "@/lib/export/render-pdf";
import { toMarkdown, toText } from "@/lib/export/render-text";
import { toLatexZip } from "@/lib/export/render-latex";
import type { CitationStyleId } from "@/lib/citations";
import { loadProjectBundle, sourceRowToItem } from "@/lib/projects";
import { projectAccess } from "@/lib/project-access";
import { assertWithinLimits, recordUsage } from "@/lib/usage";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

const TYPES = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pdf: "application/pdf",
  md: "text/markdown; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  /** D136: LaTeX (main.tex + references.bib + şekiller) ZIP — Overleaf’e yüklenebilir */
  latex: "application/zip",
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
  // LaTeX metin tabanlı bir biçimdir: Markdown izni olan her pakette açıktır
  await assertWithinLimits(s.user.id, s.profile.plan_id, "export", { format: format === "latex" ? "md" : format, projectId: id });
  const acc = await projectAccess(s, id, "read");
  const bundle = await loadProjectBundle(acc.db, id, acc.ownerId);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");

  const doc = buildExportDoc({
    project: bundle.project,
    stages: bundle.stages,
    sources: bundle.sources,
    engineItems: bundle.sources.map(sourceRowToItem),
    authorName: s.profile.full_name || s.profile.email || "",
    // ?stages=id1,id2 → yalnızca seçilen bölümler (D91)
    options: { latexCitations: format === "latex", numberHeadings: url.searchParams.get("numbering") !== "0", onlyStageIds: (url.searchParams.get("stages") ?? "").split(",").filter((x) => /^[0-9a-f-]{36}$/i.test(x)) },
  });

  let body: Buffer | string;
  if (format === "docx") body = await toDocx(doc, effectiveFormat(bundle.project));
  else if (format === "pdf") body = await toPdf(doc, effectiveFormat(bundle.project));
  else if (format === "md") body = toMarkdown(doc);
  else if (format === "latex") body = await toLatexZip(doc, { style: (bundle.project.citation_style ?? "apa7") as CitationStyleId, items: bundle.sources.map(sourceRowToItem) });
  else body = toText(doc);

  await recordUsage(s.user.id, "export", { meta: { format, projectId: id } });
  // D109: Tek Proje gözetimi — yalnızca tam indirmeler karşılaştırılır (seçili bölüm indirmesi farklı içerik sayılmasın)
  if (!(url.searchParams.get("stages") ?? "").trim()) {
    if (acc.isOwner) await watchExport({ userId: s.user.id, profile: s.profile, projectId: id, projectTitle: bundle.project.title, doc, cover: bundle.project.context?.format?.cover ?? {} }).catch(() => {});
  }
  const filename = `${safeName(bundle.project.title)}.${format === "latex" ? "zip" : format}`;
  // D136: “Overleaf’te aç” — ZIP 15 dakikalık imzalı bağlantıyla geçici olarak saklanır; Overleaf bu adresten indirir
  if (format === "latex" && url.searchParams.get("target") === "overleaf") {
    const store = adminClient().storage.from("user-files");
    const folder = `${s.user.id}/overleaf`;
    const { data: old } = await store.list(folder, { limit: 100 });
    if (old?.length) await store.remove(old.map((f) => `${folder}/${f.name}`)).catch(() => {});
    const path = `${folder}/${crypto.randomUUID()}-${filename}`;
    const { error: upErr } = await store.upload(path, body as Buffer, { contentType: "application/zip", upsert: false });
    if (upErr) throw upErr;
    const { data: signed, error: sErr } = await store.createSignedUrl(path, 900);
    if (sErr || !signed?.signedUrl) throw sErr ?? new ApiError(500, "Bağlantı oluşturulamadı");
    return Response.json({ url: signed.signedUrl, expiresIn: 900 }, { headers: { "Cache-Control": "no-store" } });
  }
  return new Response(typeof body === "string" ? body : new Uint8Array(body), {
    headers: { "Content-Type": TYPES[format], "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
  });
});
