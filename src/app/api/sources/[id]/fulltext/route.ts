import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { ingestOpenAccess } from "@/lib/sources/fulltext";

type Ctx = { params: Promise<{ id: string }> };

export const maxDuration = 60;

export const POST = route<Ctx>("source.fulltext", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: src } = await s.supabase.from("sources").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!src) throw new ApiError(404, "Kaynak bulunamadı");
  if (!src.project_id) throw new ApiError(422, "Tam metin analizi için kaynak bir projeye bağlı olmalıdır");
  const result = await ingestOpenAccess(s.supabase, src, providerConfig());
  return json(result, result.status === "ingested" ? 200 : 422);
});
