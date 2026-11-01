import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { remapChunkPages } from "@/lib/sources/chunk-pages";

type Ctx = { params: Promise<{ id: string }> };

/** Kapalı erişimli bir kaynağa kullanıcının yüklediği PDF'i tam metin olarak bağlar. */
export const POST = route<Ctx>("source.attachFile", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ fileId: z.string().uuid() }));
  const { data: src } = await s.supabase.from("sources").select("id, project_id, pages").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!src) throw new ApiError(404, "Kaynak bulunamadı");
  const { data: f } = await s.supabase.from("files").select("id, project_id, extraction_status, extracted_text").eq("id", b.fileId).eq("user_id", s.user.id).maybeSingle();
  if (!f) throw new ApiError(404, "Dosya bulunamadı");
  if (f.project_id !== src.project_id) throw new ApiError(422, "Dosya ve kaynak aynı projede olmalıdır");
  if (f.extraction_status !== "done" || (f.extracted_text ?? "").length < 1000) throw new ApiError(422, "Dosyadan yeterli metin çıkarılamadı");
  await s.supabase.from("source_chunks").delete().eq("source_id", id).eq("user_id", s.user.id);
  await s.supabase.from("source_chunks").update({ source_id: id }).eq("file_id", f.id).eq("user_id", s.user.id);
  await remapChunkPages(s.supabase, id, src.pages);
  const { data, error } = await s.supabase.from("sources").update({ file_id: f.id, access_level: "full_text", fulltext_status: "done", fulltext_message: null }).eq("id", id).eq("user_id", s.user.id).select().single();
  if (error) throw error;
  return json({ source: data });
});
