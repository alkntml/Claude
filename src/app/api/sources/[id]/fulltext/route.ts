import { after } from "next/server";
import { ApiError, json, logError, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { childAccess } from "@/lib/project-access";
import { providerConfig } from "@/lib/env";
import { ingestOpenAccess } from "@/lib/sources/fulltext";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export const maxDuration = 60;

/** Tam metin analizini kuyruğa alır; işlem yanıt döndükten sonra arka planda sürer (durum: sources.fulltext_status). */
export const POST = route<Ctx>("source.fulltext", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: src, access } = await childAccess(s, "sources", id, "edit");
  if (!src.project_id) throw new ApiError(422, "Tam metin analizi için kaynak bir projeye bağlı olmalıdır");
  if (src.fulltext_status === "processing" || src.fulltext_status === "queued") return json({ status: src.fulltext_status }, 202);
  await access.db.from("sources").update({ fulltext_status: "queued", fulltext_message: null }).eq("id", id).eq("user_id", access.ownerId);
  // İstek bağlamı bittikten sonra çalışır; kullanıcı çerezine bağlı olmayan service role istemcisi kullanılır.
  // ingestOpenAccess yalnızca bu kaynağın kimliği ve sahibinin user_id'si ile yazar.
  after(async () => {
    try { await ingestOpenAccess(adminClient(), src, providerConfig()); } catch (e) { await logError("source.fulltext.bg", e, s.user.id); }
  });
  return json({ status: "queued" }, 202);
});
