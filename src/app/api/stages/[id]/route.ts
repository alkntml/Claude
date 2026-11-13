import { z } from "zod";
import { assertDeleted, ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { childAccess, displayName } from "@/lib/project-access";
import { adminClient } from "@/lib/supabase/admin";
import { compatWrite } from "@/lib/db-compat";
import type { SupabaseClient } from "@supabase/supabase-js";
import { docToPlain, wordCount, type JSONNode } from "@/lib/editor/doc";
import { logWords } from "@/lib/goals";
import { logStructureChange } from "@/lib/structure-server";

type Ctx = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["not_started", "in_progress", "review", "done"]).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  /** Revizyon anlık görüntüsü oluşturulsun mu (manuel kayıt veya AI ekleme sonrası) */
  snapshot: z.object({ note: z.string().max(300).default(""), author: z.enum(["user", "ai", "system"]).default("user") }).optional(),
  /** Ortak yazım (D115): istemcinin bildiği son kayıt zamanı; başka biri sonra kaydettiyse 409 */
  baseUpdatedAt: z.string().max(40).optional(),
  /** Çakışmada “benim sürümümle üzerine yaz” */
  force: z.boolean().optional(),
  /** D171: bölüm ayarları (açıklama, zorunluluk, kapsam, görünürlük) */
  description: z.string().max(1000).optional(),
  requirement: z.enum(["required", "conditional", "optional"]).optional(),
  scope: z.enum(["brief", "standard", "detailed"]).optional(),
  hidden: z.boolean().optional(),
});

const MAX_DOC_BYTES = 2_000_000;

async function recomputeProgress(supabase: SupabaseClient, projectId: string, wordDelta?: number) {
  const { data } = await supabase.from("project_stages").select("status, key, word_count").eq("project_id", projectId);
  const list = (data ?? []).filter((x) => x.key !== "references");
  const score = list.reduce((a, x) => a + (x.status === "done" ? 1 : x.status === "review" ? 0.75 : x.status === "in_progress" ? 0.35 : 0), 0);
  const progress = list.length ? Math.round((score / list.length) * 100) : 0;
  const update: Record<string, unknown> = { progress, updated_at: new Date().toISOString() };
  if (wordDelta !== undefined) {
    // Yazım hedefi için günlük toplam kelime kaydı
    const total = (data ?? []).reduce((a, x) => a + (x.word_count ?? 0), 0);
    const { data: p } = await supabase.from("projects").select("context").eq("id", projectId).single();
    const ctx = (p?.context ?? {}) as Record<string, unknown>;
    update.context = { ...ctx, wordLog: logWords(ctx.wordLog as Record<string, number> | undefined, new Date(), total, total - wordDelta) };
  }
  await supabase.from("projects").update(update).eq("id", projectId);
  return progress;
}

export const GET = route<Ctx>("stage.get", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row } = await childAccess(s, "project_stages", id, "read");
  return json({ stage: row });
});

export const PATCH = route<Ctx>("stage.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { row: stage, access } = await childAccess(s, "project_stages", id, "edit", "id, status, word_count, updated_at");
  const db = access.db;
  // last_editor ayrı okunur: migration 32 öncesinde sütun yoksa sorgu boş döner ve kayıt yine çalışır
  stage.last_editor = (await db.from("project_stages").select("last_editor").eq("id", id).maybeSingle()).data?.last_editor ?? null;
  const b = await parseBody(req, PatchSchema);
  // Çakışma (D115): bu kişi bölümü açtıktan sonra BAŞKA biri kaydettiyse üzerine yazmadan önce sorulur
  if (b.content && b.baseUpdatedAt && !b.force && stage.last_editor && stage.last_editor !== s.user.id
      && new Date(stage.updated_at).getTime() > new Date(b.baseUpdatedAt).getTime() + 500) {
    const [{ data: cur }, { data: who }] = await Promise.all([
      db.from("project_stages").select("*").eq("id", id).eq("project_id", stage.project_id).single(),
      adminClient().from("profiles").select("full_name, email").eq("id", stage.last_editor).maybeSingle(),
    ]);
    throw new ApiError(409, "Bu bölüm siz düzenlerken başka biri tarafından kaydedildi", "stage_conflict", { stage: cur, by: displayName(who) });
  }
  // “Benim sürümümle devam et”: üzerine yazılan (başkasının) sürümü önce geçmişe saklanır, kimsenin yazısı kaybolmaz
  if (b.content && b.force && stage.last_editor && stage.last_editor !== s.user.id) {
    const { data: cur } = await db.from("project_stages").select("content, content_text, word_count").eq("id", id).eq("project_id", stage.project_id).single();
    if (cur) await compatWrite({ stage_id: id, project_id: stage.project_id, user_id: access.ownerId, actor_id: stage.last_editor, content: cur.content, content_text: cur.content_text, word_count: cur.word_count, note: "Çakışmada üzerine yazılmadan önceki sürüm", author: "system" }, (row) => db.from("stage_revisions").insert(row));
  }
  const update: Record<string, unknown> = { updated_at: new Date().toISOString(), ...(b.content ? { last_editor: s.user.id } : {}) };
  if (b.title) update.title = b.title;
  if (b.status) update.status = b.status;
  const settings = { ...(b.description !== undefined ? { description: b.description } : {}), ...(b.requirement ? { requirement: b.requirement } : {}), ...(b.scope ? { scope: b.scope } : {}), ...(b.hidden !== undefined ? { hidden: b.hidden } : {}) };
  const structural = !!b.title || Object.keys(settings).length > 0;
  if (structural) Object.assign(update, settings, { modified: true });
  if (b.content) {
    if (JSON.stringify(b.content).length > MAX_DOC_BYTES) throw new ApiError(413, "Bölüm çok büyük (2 MB sınırı)");
    if (b.content.type !== "doc") throw new ApiError(422, "Geçersiz belge");
    const text = docToPlain(b.content as unknown as JSONNode);
    update.content = b.content;
    update.content_text = text;
    update.word_count = wordCount(text);
    if (stage.status === "not_started" && !b.status && text.length) update.status = "in_progress";
  }
  const { data, error } = await compatWrite(update, (row) => db.from("project_stages").update(row).eq("id", id).eq("project_id", stage.project_id).select().single());
  if (error) throw error;
  if (b.snapshot && b.content) {
    await compatWrite({
      stage_id: id, project_id: stage.project_id, user_id: access.ownerId, actor_id: s.user.id, content: data.content, content_text: data.content_text,
      word_count: data.word_count, note: b.snapshot.note, author: b.snapshot.author,
    }, (row) => db.from("stage_revisions").insert(row));
  }
  if (structural) await logStructureChange(stage.project_id, s.user.id, "section.update", { stageId: id, title: data.title, ...(b.title ? { renamed: b.title } : {}), ...settings });
  const progress = await recomputeProgress(db, stage.project_id, b.content ? (data.word_count ?? 0) - (stage.word_count ?? 0) : undefined);
  return json({ stage: data, progress });
});

export const DELETE = route<Ctx>("stage.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  // Bölüm silme yalnızca sahibe açıktır (ortak yazar silemez; alt başlıkları editörde düzenleyebilir)
  const { row: stage, access } = await childAccess(s, "project_stages", id, "owner", "id, key, title, word_count");
  assertDeleted(await access.db.from("project_stages").delete().eq("id", id).eq("user_id", access.ownerId).select("id"), "Bölüm bulunamadı");
  await logStructureChange(stage.project_id, s.user.id, "section.delete", { key: stage.key, title: stage.title, words: stage.word_count ?? 0 });
  await recomputeProgress(access.db, stage.project_id);
  return json({ ok: true });
});
