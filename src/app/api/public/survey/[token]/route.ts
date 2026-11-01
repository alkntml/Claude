import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { adminClient } from "@/lib/supabase/admin";
import { validateAnswers, type Question } from "@/lib/surveys";

type Ctx = { params: Promise<{ token: string }> };

/**
 * Herkese açık anket cevabı. Katılımcının kimliği, IP adresi veya e-postası saklanmaz.
 * Kötüye kullanıma karşı: bal küpü alanı, çok hızlı gönderim, anket başına kısa süreli yoğunluk sınırı.
 */
export const POST = route<Ctx>("survey.submit", async (req, { params }) => {
  const { token } = await params;
  if (!/^[a-f0-9]{24,128}$/.test(token)) throw new ApiError(404, "Anket bulunamadı");
  const b = await parseBody(req, z.object({ answers: z.record(z.string().max(80), z.unknown()), website: z.string().max(200).optional(), seconds: z.number().int().min(0).max(86400).optional() }));
  const db = adminClient();
  const { data: sv } = await db.from("surveys").select("id, user_id, questions, is_open, closes_at, max_responses, response_count").eq("token", token).maybeSingle();
  if (!sv) throw new ApiError(404, "Anket bulunamadı");
  if (!sv.is_open || (sv.closes_at && new Date(sv.closes_at) < new Date())) throw new ApiError(410, "Bu anket artık cevap kabul etmiyor");
  if (sv.max_responses && sv.response_count >= sv.max_responses) throw new ApiError(410, "Bu anket yeterli sayıda cevaba ulaştı");
  // Bal küpü (gizli alan) doluysa veya 3 saniyeden kısa sürede gönderildiyse sessizce kabul edilmiş gibi davran
  if (b.website || (b.seconds !== undefined && b.seconds < 3)) return json({ ok: true });
  const since = new Date(Date.now() - 10_000).toISOString();
  const { count: burst } = await db.from("survey_responses").select("id", { count: "exact", head: true }).eq("survey_id", sv.id).gte("created_at", since);
  if ((burst ?? 0) >= 30) throw new ApiError(429, "Çok yoğun bir an; lütfen birkaç saniye sonra tekrar gönderin.");
  const v = validateAnswers(sv.questions as Question[], b.answers);
  if (!v.ok) throw new ApiError(422, v.message, v.questionId);
  const { error } = await db.from("survey_responses").insert({ survey_id: sv.id, user_id: sv.user_id, answers: v.answers, duration_seconds: b.seconds ?? null });
  if (error) throw error;
  const { count } = await db.from("survey_responses").select("id", { count: "exact", head: true }).eq("survey_id", sv.id);
  await db.from("surveys").update({ response_count: count ?? sv.response_count + 1 }).eq("id", sv.id);
  return json({ ok: true });
});
