import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { draftWords } from "@/lib/workflows/length";

/** Kanıt kaydında saklanacak en uzun çıktı (karakter) */
const MAX_OUTPUT = 200_000;
const plainWords = (s: string) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}’'\-]*/gu) ?? []).length;

/**
 * Kullanım kanıt kaydı (D102): yapay zekânın ürettiği metin, kullanıcı daha sonra silse de yöneticinin görebileceği
 * kayda yazılır (12 ay). `words`: belgeye eklenecek taslak kelimesi; taslak yoksa yanıtın kelimesi. Hata kullanıcı
 * isteğini bozmaz (tablo yoksa sessizce atlanır).
 */
export async function logAiOutput(p: { userId: string; action: string; projectId?: string | null; projectTitle?: string | null; stageTitle?: string | null; model?: string | null; output: string }): Promise<void> {
  if (!p.output?.trim()) return;
  const words = draftWords(p.output) || plainWords(p.output);
  await adminClient().from("activity_log").insert({
    user_id: p.userId, kind: "ai_output", action: p.action, project_id: p.projectId ?? null, project_title: p.projectTitle?.slice(0, 300) ?? null,
    stage_title: p.stageTitle?.slice(0, 300) ?? null, words, model: p.model ?? null, output: p.output.slice(0, MAX_OUTPUT),
  }).then(() => undefined, () => undefined);
}
