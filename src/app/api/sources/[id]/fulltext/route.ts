import { after } from "next/server";
import { ApiError, json, logError, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { ingestOpenAccess } from "@/lib/sources/fulltext";
import { adminClient } from "@/lib/supabase/admin";
import { assertNotLocked } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };

export const maxDuration = 60;

/** Tam metin analizini kuyruğa alır; işlem yanıt döndükten sonra arka planda sürer (durum: sources.fulltext_status). */
export const POST = route<Ctx>("source.fulltext", async (_req, { params }) => {
  const s = await requireUser();
  await assertNotLocked(s.user.id, s.profile.plan_id);
  const { id } = await params;
  const { data: src } = await s.supabase.from("sources").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!src) throw new ApiError(404, "Kaynak bulunamadı");
  if (!src.project_id) throw new ApiError(422, "Tam metin analizi için kaynak bir projeye bağlı olmalıdır");
  if (src.fulltext_status === "processing" || src.fulltext_status === "queued") return json({ status: src.fulltext_status }, 202);
  await s.supabase.from("sources").update({ fulltext_status: "queued", fulltext_message: null }).eq("id", id);
  // İstek bağlamı bittikten sonra çalışır; kullanıcı çerezine bağlı olmayan service role istemcisi kullanılır.
  // ingestOpenAccess yalnızca bu kaynağın kimliği ve sahibinin user_id'si ile yazar.
  after(async () => {
    try { await ingestOpenAccess(adminClient(), src, providerConfig()); } catch (e) { await logError("source.fulltext.bg", e, s.user.id); }
  });
  return json({ status: "queued" }, 202);
});
