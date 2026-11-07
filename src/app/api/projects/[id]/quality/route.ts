import { z } from "zod";
import { assertSingleProject } from "@/lib/single-project";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { citedIdsInOrder, type JSONNode } from "@/lib/editor/doc";
import { loadProjectBundle, sourceRowToItem } from "@/lib/projects";
import { projectAccess } from "@/lib/project-access";
import { runQualityChecks } from "@/lib/quality/checks";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";
import { stageDef } from "@/lib/workflows";
import { localeFromRequest } from "@/i18n/server";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const AI_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["issues"],
  properties: {
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["category", "severity", "title", "detail", "stageKey"],
        properties: {
          category: { type: "string", enum: ["consistency", "alignment", "structure", "language"] },
          severity: { type: "string", enum: ["info", "warning", "error"] },
          title: { type: "string" },
          detail: { type: "string" },
          stageKey: { type: "string" },
        },
      },
    },
  },
};

export const GET = route<Ctx>("quality.latest", async (_req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const acc = await projectAccess(s, id, "read");
  const { data } = await acc.db.from("quality_reports").select("*").eq("project_id", id).eq("user_id", acc.ownerId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return json({ report: data });
});

export const POST = route<Ctx>("quality.run", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const { withAi } = await parseBody(req, z.object({ withAi: z.boolean().default(false) }));
  const acc = await projectAccess(s, id, "edit");
  const bundle = await loadProjectBundle(acc.db, id, acc.ownerId);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");

  const stages = bundle.stages.map((st) => {
    const def = stageDef(st.key);
    return { key: st.key, title: st.title, text: st.content_text ?? "", citedIds: citedIdsInOrder([st.content as JSONNode]), needsLiterature: def?.needsLiterature, requiresUserData: def?.requiresUserData, generated: !!def?.generated };
  });
  const sources = bundle.sources.map((r) => ({ ...sourceRowToItem(r), verified: r.verified, accessLevel: r.access_level }));
  const uiLocale = localeFromRequest(req);
  const report = runQualityChecks(stages, sources, { language: bundle.project.language, uiLocale });

  let aiReview: { ran: boolean; error?: string } = { ran: false };
  if (withAi) {
    assertFeature(s.profile.plan_id, "quality_ai");
    await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
    await assertSingleProject(s, id);
    const model = await resolveModel(s.profile.plan_id, "default"); // karmaşık: bütün çalışmanın değerlendirmesi
    if (!isProviderConfigured(model.provider)) aiReview = { ran: false, error: "Yapay zekâ sağlayıcısı yapılandırılmamış" };
    else {
      const summary = stages.filter((x) => x.text).map((x) => `### ${x.key} — ${x.title}\n${x.text.slice(0, 6000)}`).join("\n\n");
      const res = await complete(model, {
        system: `Deneyimli bir tez jürisi üyesi gibi akademik çalışmayı değerlendir. Yalnızca mantıksal bütünlük, bilimsel tutarlılık, bölümler arası uyum, araştırma soruları–yöntem uyumu ve hipotez–amaç ilişkisi sorunlarını bildir. Somut ve uygulanabilir ol; metinde olmayan şeyleri varsayma. Cümle uzunluğu, noktalama ve boşluk konularını bildirme. ${uiLocale === "en" ? "İngilizce" : "Türkçe"} yaz. En fazla 15 sorun.`,
        messages: [{ role: "user", content: `Çalışma: ${bundle.project.title}\nTür: ${bundle.project.work_type}\n\n${summary}` }],
        maxTokens: 6000,
        effort: "medium",
        jsonSchema: AI_SCHEMA,
      });
      try {
        const parsed = JSON.parse(res.text) as { issues: { category: string; severity: "info" | "warning" | "error"; title: string; detail: string; stageKey: string }[] };
        parsed.issues.slice(0, 15).forEach((it, k) => report.issues.push({ id: `ai-${k}`, category: it.category as "consistency", severity: it.severity, title: it.title, detail: it.detail, stageKey: it.stageKey || undefined }));
        aiReview = { ran: true };
      } catch {
        aiReview = { ran: false, error: "Yapay zekâ değerlendirmesi okunamadı" };
      }
      await recordUsage(s.user.id, "ai_request", { usage: res.usage, costUsd: await estimateCost(res.model, res.usage.input, res.usage.output, res.usage), provider: model.provider, model: res.model, meta: { action: "quality_review" } });
    }
  }
  await recordUsage(s.user.id, "quality_check");
  const { data } = await acc.db.from("quality_reports").insert({ project_id: id, user_id: acc.ownerId, score: report.score, report: { ...report, aiReview } }).select().single();
  return json({ report: data });
});
