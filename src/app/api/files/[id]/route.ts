import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>("file.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data } = await s.supabase.from("files").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Dosya bulunamadı");
  const { data: signed } = await s.supabase.storage.from("user-files").createSignedUrl(data.storage_path, 300);
  return json({ file: { ...data, extracted_text: data.extracted_text?.slice(0, 20000) ?? null }, downloadUrl: signed?.signedUrl ?? null });
});

export const DELETE = route<Ctx>("file.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data } = await s.supabase.from("files").select("storage_path").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Dosya bulunamadı");
  await s.supabase.storage.from("user-files").remove([data.storage_path]);
  await s.supabase.from("files").delete().eq("id", id);
  return json({ ok: true });
});
