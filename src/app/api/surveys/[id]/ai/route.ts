import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { improveQuestion, reviewSurvey, reviseSurvey } from "@/lib/survey-ai";
import { QuestionSchema, type Question } from "@/lib/surveys";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";
import { singleScope } from "@/lib/single-project";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

// Editördeki kaydedilmemiş taslak da gönderilebilir; boş başlıklı sorular gönderilmeden ayıklanır
const Draft = z.array(z.unknown()).max(150).transform((l) => l.map((q) => QuestionSchema.safeParse(q)).filter((r) => r.success).map((r) => r.data as Question));

/**
 * Mevcut ankette yapay zekâ desteği (D66):
 * - revise: serbest talimatla tüm anketi düzenler (cevap almaya başlamış ankette kapalı)
 * - improve: tek soruyu iyileştirir / boş ölçeğe madde yazar
 * - review: hakem gözüyle inceleme ve önerilen yeni ifadeler
 * Sonuç kaydedilmez; editör gösterir, kullanıcı onaylayıp kaydeder.
 */
export const POST = route<Ctx>("surveys.ai", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "surveys");
  const { id } = await params;
  const b = await parseBody(req, z.discriminatedUnion("mode", [
    z.object({ mode: z.literal("revise"), instruction: z.string().trim().min(3).max(1000), questions: Draft, lang: z.enum(["tr", "en", "de"]).default("tr") }),
    z.object({ mode: z.literal("improve"), question: z.unknown(), instruction: z.string().trim().max(500).optional(), lang: z.enum(["tr", "en", "de"]).default("tr") }),
    z.object({ mode: z.literal("review"), questions: Draft, lang: z.enum(["tr", "en", "de"]).default("tr") }),
  ]));
  const { data: survey } = await s.supabase.from("surveys").select("id, title, description, response_count, project_id").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!survey) throw new ApiError(404, "Anket bulunamadı");
  if (b.mode !== "review" && survey.response_count > 0) throw new ApiError(409, "Cevap almaya başlamış ankette sorular değiştirilemez; yeni sorular için anketin kopyasını oluşturun");
  if (b.mode !== "improve" && !b.questions.length) throw new ApiError(422, "Önce en az bir soru ekleyin");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const off = await singleScope(s, "ai_request", survey.project_id);

  const planId = s.profile.plan_id;
  const record = (o: { usage: { input: number; output: number }; cost: number; provider: string; model: string }) =>
    recordUsage(s.user.id, "ai_request", { usage: o.usage, costUsd: o.cost, provider: o.provider, model: o.model, meta: { action: `survey_${b.mode}`, surveyId: id, ...(off ? { offProject: true } : {}) } });
  try {
    if (b.mode === "revise") {
      const out = await reviseSurvey(planId, { questions: b.questions, instruction: b.instruction, lang: b.lang, title: survey.title });
      await record(out);
      return json({ questions: out.questions, changes: out.changes });
    }
    if (b.mode === "improve") {
      const q = QuestionSchema.safeParse(b.question);
      // Boş Likert bloğu (madde yok) şemadan geçmez; maddesiz hâliyle de kabul et
      const raw = b.question as Question;
      const question = q.success ? (q.data as Question) : raw && typeof raw === "object" && raw.type === "likert" && String(raw.title ?? "").trim() ? ({ ...raw, items: [] } as Question) : null;
      if (!question || !String(question.title ?? "").trim()) throw new ApiError(422, "Önce soru metnini yazın");
      const out = await improveQuestion(planId, { question, instruction: b.instruction, lang: b.lang, context: `${survey.title}${survey.description ? ` — ${survey.description}` : ""}` });
      await record(out);
      return json({ question: out.question, note: out.note });
    }
    const out = await reviewSurvey(planId, { questions: b.questions, lang: b.lang, title: survey.title });
    await record(out);
    return json({ summary: out.summary, issues: out.issues });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(422, e instanceof Error ? e.message : "Yapay zekâ isteği tamamlanamadı");
  }
});
