import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { loadProjectBundle } from "@/lib/projects";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";
import { STAGE_LIBRARY } from "@/lib/workflows";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["stages", "formatting", "notes"],
  properties: {
    stages: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "libraryKey", "description"], properties: { title: { type: "string" }, libraryKey: { type: "string" }, description: { type: "string" } } } },
    formatting: { type: "object", additionalProperties: false, required: ["fontFamily", "fontSizePt", "lineSpacing", "citationStyle"], properties: { fontFamily: { type: "string" }, fontSizePt: { type: "number" }, lineSpacing: { type: "number" }, citationStyle: { type: "string" } } },
    notes: { type: "array", items: { type: "string" } },
  },
};

/** Yüklenen üniversite tez yazım kılavuzundan bölüm yapısı ve biçim kuralları önerir (uygulanmadan önce kullanıcıya gösterilir). */
export const POST = route<Ctx>("stages.suggest", async (_req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "guideline");
  const { id } = await params;
  const bundle = await loadProjectBundle(s.supabase, id, s.user.id);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");
  if (!bundle.project.guideline_file_id) throw new ApiError(422, "Önce bir yazım kılavuzu yükleyin");
  const { data: f } = await s.supabase.from("files").select("extracted_text").eq("id", bundle.project.guideline_file_id).eq("user_id", s.user.id).maybeSingle();
  if (!f?.extracted_text) throw new ApiError(422, "Kılavuz metni okunamadı");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const model = await resolveModel(s.profile.plan_id, "balanced"); // orta: kılavuzdan yapı çıkarma
  if (!isProviderConfigured(model.provider)) throw new ApiError(503, "Yapay zekâ sağlayıcısı yapılandırılmamış", "ai_not_configured");

  const keys = Object.keys(STAGE_LIBRARY).join(", ");
  const res = await complete(model, {
    system: `Üniversite tez/makale yazım kılavuzlarını analiz eden bir uzmansın. Kılavuzdaki ZORUNLU bölüm sırasını çıkar. Her bölüm için uygun kütüphane anahtarını seç (${keys}); uygun yoksa "custom" yaz. Biçim kurallarını (yazı tipi, punto, satır aralığı, atıf stili: apa7, apa6, chicago, mla, harvard, vancouver, ieee, ama, turabian) kılavuzda yazdığı kadarıyla ver; belirtilmemişse makul varsayılanı yaz ve notlarda belirt. Kılavuzda olmayan kural uydurma.`,
    messages: [{ role: "user", content: `Çalışma türü: ${bundle.project.work_type}\n\nKILAVUZ:\n${f.extracted_text.slice(0, 120000)}` }],
    maxTokens: 6000,
    effort: "medium",
    jsonSchema: SCHEMA,
  });
  await recordUsage(s.user.id, "ai_request", { usage: res.usage, costUsd: await estimateCost(res.model, res.usage.input, res.usage.output, res.usage), provider: model.provider, model: res.model, meta: { action: "guideline" } });
  try {
    try { return json({ suggestion: JSON.parse(res.text) }); } catch { throw new ApiError(502, "Öneri okunamadı, lütfen tekrar deneyin"); }
  } catch {
    throw new ApiError(502, "Kılavuz analizi okunamadı");
  }
});
