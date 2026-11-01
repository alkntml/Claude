import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { docToPlain, wordCount, type JSONNode } from "@/lib/editor/doc";
import { logWords } from "@/lib/goals";

type Ctx = { params: Promise<{ id: string }> };

const PatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  status: z.enum(["not_started", "in_progress", "review", "done"]).optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  /** Revizyon anlık görüntüsü oluşturulsun mu (manuel kayıt veya AI ekleme sonrası) */
  snapshot: z.object({ note: z.string().max(300).default(""), author: z.enum(["user", "ai", "system"]).default("user") }).optional(),
});

const MAX_DOC_BYTES = 2_000_000;

async function recomputeProgress(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], projectId: string, wordDelta?: number) {
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
  const { data } = await s.supabase.from("project_stages").select("*").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Bölüm bulunamadı");
  return json({ stage: data });
});

export const PATCH = route<Ctx>("stage.update", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: stage } = await s.supabase.from("project_stages").select("id, project_id, status, word_count").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!stage) throw new ApiError(404, "Bölüm bulunamadı");
  const b = await parseBody(req, PatchSchema);
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (b.title) update.title = b.title;
  if (b.status) update.status = b.status;
  if (b.content) {
    if (JSON.stringify(b.content).length > MAX_DOC_BYTES) throw new ApiError(413, "Bölüm çok büyük (2 MB sınırı)");
    if (b.content.type !== "doc") throw new ApiError(422, "Geçersiz belge");
    const text = docToPlain(b.content as unknown as JSONNode);
    update.content = b.content;
    update.content_text = text;
    update.word_count = wordCount(text);
    if (stage.status === "not_started" && !b.status && text.length) update.status = "in_progress";
  }
  const { data, error } = await s.supabase.from("project_stages").update(update).eq("id", id).select().single();
  if (error) throw error;
  if (b.snapshot && b.content) {
    await s.supabase.from("stage_revisions").insert({
      stage_id: id, project_id: stage.project_id, user_id: s.user.id, content: data.content, content_text: data.content_text,
      word_count: data.word_count, note: b.snapshot.note, author: b.snapshot.author,
    });
  }
  const progress = await recomputeProgress(s.supabase, stage.project_id, b.content ? (data.word_count ?? 0) - (stage.word_count ?? 0) : undefined);
  return json({ stage: data, progress });
});

export const DELETE = route<Ctx>("stage.delete", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { data: stage } = await s.supabase.from("project_stages").select("id, project_id").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!stage) throw new ApiError(404, "Bölüm bulunamadı");
  await s.supabase.from("project_stages").delete().eq("id", id);
  await recomputeProgress(s.supabase, stage.project_id);
  return json({ ok: true });
});
