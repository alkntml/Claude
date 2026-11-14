import { ApiError, json, route } from "@/lib/api";
import { assertSingleProject } from "@/lib/single-project";
import { requireUser } from "@/lib/auth";
import { projectAccess } from "@/lib/project-access";
import { assertFeature } from "@/lib/usage";
import { runGuidelineAnalysis } from "@/lib/guideline";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

/**
 * Yüklenen yazım kılavuzunu analiz eder (D179): kılavuzda yazan biçim kuralları hemen uygulanır, bölüm yapısı önerisi
 * kullanıcının onayına sunulur. Dosya yüklenince kendiliğinden de çalışır (files route); bu uç yeniden analiz içindir.
 */
export const POST = route<Ctx>("stages.suggest", async (_req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "guideline");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  if (!acc.project.guideline_file_id) throw new ApiError(422, "Önce bir yazım kılavuzu yükleyin");
  await assertSingleProject(s, id);
  const r = await runGuidelineAnalysis(acc.db, { userId: s.user.id, planId: s.profile.plan_id, projectId: id, ownerId: acc.ownerId });
  if (r.skipped === "no_text") throw new ApiError(422, "Kılavuz metni okunamadı");
  if (r.skipped === "limit") throw new ApiError(402, "Yapay zekâ hakkınız doldu");
  if (r.skipped === "ai") throw new ApiError(503, "Yapay zekâ sağlayıcısı yapılandırılmamış", "ai_not_configured");
  return json({ suggestion: r.suggestion, fields: r.fields ?? [] });
});
