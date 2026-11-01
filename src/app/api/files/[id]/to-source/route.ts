import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { SourceInput, toRow } from "@/lib/sources/input";
import { verifySource } from "@/lib/sources/verify";
import { remapChunkPages } from "@/lib/sources/chunk-pages";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Yüklenen makale PDF'ini projeye "tam metin" erişimli kaynak olarak bağlar.
 * Künye kullanıcıdan alınır veya DOI ile otoriteden doldurulur.
 */
export const POST = route<Ctx>("file.toSource", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ source: SourceInput.partial().extend({ title: z.string().max(1000).optional() }) }));
  const { data: f } = await s.supabase.from("files").select("id, project_id, name, extraction_status, extracted_text").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!f) throw new ApiError(404, "Dosya bulunamadı");
  if (!f.project_id) throw new ApiError(422, "Dosya bir projeye bağlı olmalıdır");
  if (f.extraction_status !== "done" || (f.extracted_text ?? "").length < 1000) throw new ApiError(422, "Dosyadan yeterli metin çıkarılamadı");

  let meta = { ...b.source, title: b.source.title || f.name.replace(/\.[^.]+$/, ""), origins: ["upload"] } as z.infer<typeof SourceInput>;
  const v = await verifySource({ title: meta.title, doi: meta.doi, pmid: meta.pmid, arxivId: meta.arxivId }, providerConfig());
  if (v.record && (v.status === "verified" || !b.source.title)) {
    const r = v.record;
    meta = { ...meta, title: b.source.title || r.title, authors: meta.authors?.length ? meta.authors : r.authors, year: meta.year ?? r.year, containerTitle: meta.containerTitle ?? r.containerTitle, volume: meta.volume ?? r.volume, issue: meta.issue ?? r.issue, pages: meta.pages ?? r.pages, publisher: meta.publisher ?? r.publisher, type: meta.type ?? r.type };
  }
  const row = { ...toRow({ ...meta, authors: meta.authors ?? [], type: meta.type ?? "article-journal" }), project_id: f.project_id, user_id: s.user.id, file_id: f.id, access_level: "full_text", verified: v.status === "verified", verification: (({ record: _r, ...rest }) => (void _r, rest))(v) };
  const { data: src, error } = await s.supabase.from("sources").insert(row).select().single();
  if (error) throw error;
  // Dosyanın RAG parçalarını kaynağa bağla
  await s.supabase.from("source_chunks").update({ source_id: src.id }).eq("file_id", f.id);
  await remapChunkPages(s.supabase, src.id, src.pages);
  return json({ source: src }, 201);
});
