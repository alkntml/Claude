import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { extract, kindOf } from "@/lib/files/extract";
import { summarize } from "@/lib/files/stats";

type Ctx = { params: Promise<{ id: string }> };

/** CSV/XLSX için betimsel istatistik ve Pearson korelasyonları (deterministik hesaplama). */
export const GET = route<Ctx>("file.stats", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: f } = await s.supabase.from("files").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!f) throw new ApiError(404, "Dosya bulunamadı");
  const kind = kindOf(f.mime_type, f.name);
  if (kind !== "csv" && kind !== "xlsx") throw new ApiError(422, "Yalnızca CSV ve XLSX dosyaları analiz edilebilir");
  const { data: blob, error } = await s.supabase.storage.from("user-files").download(f.storage_path);
  if (error || !blob) throw new ApiError(500, "Dosya okunamadı");
  const ex = await extract(kind, Buffer.from(await blob.arrayBuffer()));
  return json({ summary: summarize(ex.rows ?? []) });
});
