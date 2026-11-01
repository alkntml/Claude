import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { resolveShare } from "@/lib/shares";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ token: string }> };

/** Danışman yorumu: oturum gerektirmez; paylaşım bağlantısı yorumlara izin veriyorsa kabul edilir. */
export const POST = route<Ctx>("share.comment", async (req, { params }) => {
  const { token } = await params;
  const share = await resolveShare(token);
  if (!share) throw new ApiError(404, "Bağlantı geçersiz veya süresi dolmuş");
  if (!share.allow_comments) throw new ApiError(403, "Bu bağlantı yorumlara kapalı");
  const b = await parseBody(req, z.object({ stageId: z.string().uuid(), name: z.string().trim().min(2).max(80), body: z.string().trim().min(2).max(3000), quote: z.string().max(500).default("") }));
  const db = adminClient();
  // Kötüye kullanım sınırı: paylaşım başına günde 60 yorum
  const since = new Date(Date.now() - 86400_000).toISOString();
  const { count } = await db.from("stage_comments").select("id", { count: "exact", head: true }).eq("share_id", share.id).gte("created_at", since);
  if ((count ?? 0) >= 60) throw new ApiError(429, "Günlük yorum sınırına ulaşıldı");
  const { data: stage } = await db.from("project_stages").select("id").eq("id", b.stageId).eq("project_id", share.project_id).maybeSingle();
  if (!stage) throw new ApiError(404, "Bölüm bulunamadı");
  const { error } = await db.from("stage_comments").insert({ stage_id: stage.id, project_id: share.project_id, user_id: share.user_id, body: b.body, quote: b.quote, author_name: b.name, share_id: share.id });
  if (error) throw error;
  return json({ ok: true }, 201);
});
