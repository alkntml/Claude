import { ApiError, json, route } from "@/lib/api";
import { requireProject, requireUser } from "@/lib/auth";
import { chunkText } from "@/lib/files/chunk";
import { checkMagic, extract, kindOf } from "@/lib/files/extract";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 120;
const MAX_BYTES = 25 * 1024 * 1024;
const PURPOSES = ["guideline", "chapter", "article", "data", "other"] as const;

export const GET = route("files.list", async (req) => {
  const s = await requireUser();
  const projectId = new URL(req.url).searchParams.get("projectId");
  let q = s.supabase.from("files").select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, extraction_meta, created_at").eq("user_id", s.user.id).order("created_at", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data } = await q;
  return json({ files: data ?? [] });
});

export const POST = route("files.upload", async (req) => {
  const s = await requireUser();
  const form = await req.formData().catch(() => null);
  if (!form) throw new ApiError(400, "Dosya bekleniyor");
  const file = form.get("file");
  if (!(file instanceof File)) throw new ApiError(400, "Dosya bekleniyor");
  const projectId = (form.get("projectId") as string) || null;
  const purpose = (form.get("purpose") as string) || "other";
  if (!PURPOSES.includes(purpose as (typeof PURPOSES)[number])) throw new ApiError(422, "Geçersiz dosya amacı");
  if (file.size > MAX_BYTES) throw new ApiError(413, "Dosya 25 MB sınırını aşıyor");
  const kind = kindOf(file.type, file.name);
  if (!kind) throw new ApiError(415, "Desteklenen türler: PDF, DOCX, XLSX, CSV, TXT");
  // Dosyalar kişiseldir (D115): ortak yazar başkasının çalışmasına dosya bağlayamaz
  if (projectId) await requireProject(s, projectId).catch(() => { throw new ApiError(403, "Dosyalar kişiseldir; bu çalışmaya dosyayı yalnızca sahibi ekleyebilir. Metni asistana yapıştırarak kullanabilirsiniz.", "role_denied"); });
  await assertWithinLimits(s.user.id, s.profile.plan_id, "upload", { bytes: file.size });

  const buf = Buffer.from(await file.arrayBuffer());
  if (!checkMagic(kind, buf)) throw new ApiError(415, "Dosya içeriği uzantısıyla uyuşmuyor");

  const safe = file.name.normalize("NFKD").replace(/[^\w.\-]+/g, "_").slice(-100);
  const path = `${s.user.id}/${crypto.randomUUID()}-${safe}`;
  const { error: upErr } = await s.supabase.storage.from("user-files").upload(path, buf, { contentType: file.type || "application/octet-stream", upsert: false });
  if (upErr) throw upErr;

  let status: "done" | "failed" = "done";
  let text = "";
  let meta: Record<string, unknown> = { kind };
  let pages: string[] | undefined;
  try {
    const ex = await extract(kind, buf);
    text = ex.text.slice(0, 2_000_000);
    pages = ex.pages;
    meta = { ...meta, ...ex.meta, chars: ex.text.length };
    if (kind === "pdf" && ex.text.trim().length < 200) meta.warning = "Metin çıkarılamadı; taranmış (görüntü) PDF olabilir.";
  } catch (e) {
    status = "failed";
    meta.error = e instanceof Error ? e.message : "Okuma hatası";
  }

  const { data: row, error } = await s.supabase.from("files").insert({
    user_id: s.user.id, project_id: projectId, name: file.name.slice(0, 300), mime_type: file.type || kind, size_bytes: file.size,
    storage_path: path, purpose, extraction_status: status, extracted_text: text || null, extraction_meta: meta,
  }).select("id, name, mime_type, size_bytes, purpose, project_id, extraction_status, extraction_meta, created_at").single();
  if (error) {
    await s.supabase.storage.from("user-files").remove([path]);
    throw error;
  }

  // Metin belgeleri proje içinde aranabilir parçalara bölünür (RAG)
  if (projectId && status === "done" && kind !== "csv" && kind !== "xlsx" && text) {
    const chunks = chunkText({ pages, text }).slice(0, 3000);
    for (let k = 0; k < chunks.length; k += 200) {
      await s.supabase.from("source_chunks").insert(chunks.slice(k, k + 200).map((c, idx) => ({ file_id: row.id, project_id: projectId, user_id: s.user.id, chunk_index: k + idx, page_hint: c.pageHint, content: c.content })));
    }
    if (purpose === "guideline") await s.supabase.from("projects").update({ guideline_file_id: row.id }).eq("id", projectId);
  }
  await recordUsage(s.user.id, "upload", { meta: { bytes: file.size, kind } });
  return json({ file: row }, 201);
});
