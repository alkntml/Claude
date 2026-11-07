import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { PRESENCE_WINDOW_MS } from "@/lib/coauthors";
import { displayName, projectAccess } from "@/lib/project-access";
import { adminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Ortak yazım varlık sinyali (D115): “şu an bu bölümdeyim” kaydı + çalışmadaki diğer kişiler ve bölümlerin son kayıt zamanları.
 * İstemci ~25 sn’de bir çağırır; başka biri açık bölümü kaydettiyse ve yerelde kaydedilmemiş değişiklik yoksa bölüm yenilenir.
 */
export const POST = route<Ctx>("project.presence", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, z.object({ stageId: z.string().uuid().nullable().default(null) }));
  const acc = await projectAccess(s, id, "read");
  const admin = adminClient();
  const now = new Date();
  await admin.from("project_presence").upsert({ project_id: id, user_id: s.user.id, stage_id: b.stageId, seen_at: now.toISOString() }, { onConflict: "project_id,user_id" });
  const since = new Date(now.getTime() - PRESENCE_WINDOW_MS).toISOString();
  const [{ data: here }, { data: stages }] = await Promise.all([
    admin.from("project_presence").select("user_id, stage_id, seen_at").eq("project_id", id).neq("user_id", s.user.id).gte("seen_at", since),
    acc.db.from("project_stages").select("id, updated_at, last_editor").eq("project_id", id).eq("user_id", acc.ownerId)
      .then((r) => (r.error ? { data: [] as { id: string; updated_at: string; last_editor: string | null }[] } : r)),
  ]);
  const uids = [...new Set([...(here ?? []).map((h) => h.user_id), ...(stages ?? []).map((x) => x.last_editor).filter((x): x is string => !!x && x !== s.user.id)])];
  const { data: profs } = uids.length ? await admin.from("profiles").select("id, full_name, email").in("id", uids) : { data: [] as { id: string; full_name: string | null; email: string | null }[] };
  const nameOf = (uid: string) => displayName((profs ?? []).find((p) => p.id === uid));
  return json({
    others: (here ?? []).map((h) => ({ userId: h.user_id, name: nameOf(h.user_id), stageId: h.stage_id })),
    stages: (stages ?? []).map((x) => ({ id: x.id, updatedAt: x.updated_at, by: x.last_editor && x.last_editor !== s.user.id ? nameOf(x.last_editor) : null })),
  });
});
