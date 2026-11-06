import { z } from "zod";
import { assertSingleProject } from "@/lib/single-project";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { complete, estimateCost, isProviderConfigured, resolveModel } from "@/lib/ai/registry";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 120;

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["purpose", "method", "sample", "findings", "relevance"],
  properties: { purpose: { type: "string" }, method: { type: "string" }, sample: { type: "string" }, findings: { type: "string" }, relevance: { type: "string" } },
};
const METHOD_HINT = /method|participant|sample|procedure|design|results?|findings|conclusion|yöntem|örneklem|katılımcı|bulgu|sonuç/i;

/**
 * Literatür matrisi: seçilen kaynaklar için amaç, yöntem, örneklem, bulgular ve çalışmayla ilişkisi.
 * Yalnızca okunan içerikten (özet / tam metin) üretilir; künye düzeyindeki kaynaklar için içerik uydurulmaz.
 */
export const POST = route<Ctx>("project.matrix", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "matrix");
  const { id } = await params;
  const b = await parseBody(req, z.object({ sourceIds: z.array(z.string().uuid()).min(1).max(4) }));
  const { data: project } = await s.supabase.from("projects").select("id, title, topic, language").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!project) throw new ApiError(404, "Proje bulunamadı");
  const { data: sources } = await s.supabase.from("sources").select("*").eq("project_id", id).eq("user_id", s.user.id).in("id", b.sourceIds);
  const model = await resolveModel(s.profile.plan_id, "fast");
  if (!isProviderConfigured(model.provider)) throw new ApiError(503, "Yapay zekâ sağlayıcısı yapılandırılmamış");

  const out: unknown[] = [];
  for (const src of sources ?? []) {
    if (src.access_level === "metadata" || (!src.abstract && src.access_level !== "full_text")) {
      const summary = { basedOn: "metadata", generatedAt: new Date().toISOString() };
      const { data, error } = await s.supabase.from("sources").update({ summary }).eq("id", src.id).select().single();
      if (error) throw migrationError(error);
      out.push(data);
      continue;
    }
    await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request", { costOnly: true });
    await assertSingleProject(s, id);
    let material = src.access_level !== "metadata" && src.abstract ? `ÖZET:\n${String(src.abstract).slice(0, 3000)}` : "";
    if (src.access_level === "full_text") {
      const { data: chunks } = await s.supabase.from("source_chunks").select("content, page_hint, chunk_index").eq("source_id", src.id).order("chunk_index").limit(1500);
      const list = chunks ?? [];
      const picked = [...list.slice(0, 2), ...list.filter((c) => METHOD_HINT.test(c.content.slice(0, 400))).slice(0, 6)];
      const seen = new Set<number>();
      material += "\n\nTAM METİNDEN PARÇALAR:\n" + picked.filter((c) => !seen.has(c.chunk_index) && seen.add(c.chunk_index)).map((c) => `[${c.page_hint ?? "-"}] ${c.content.slice(0, 1400)}`).join("\n\n");
    }
    const lang = project.language === "en" ? "English" : "Türkçe";
    const res = await complete(model, {
      system: `Akademik literatür matrisi hazırlayan titiz bir araştırmacısın. YALNIZCA verilen metne dayan; metinde açıkça olmayan bilgi için ilgili alanı boş bırak (""). Sayı, örneklem büyüklüğü veya bulgu UYDURMA. Her alan en fazla 2 kısa cümle, ${lang}.
purpose: çalışmanın amacı · method: desen/yöntem/analiz · sample: örneklem/katılımcılar (sayı ve özellikler) · findings: temel bulgular · relevance: "${project.title}" çalışmasıyla ilişkisi (yalnızca metinden çıkarılabiliyorsa).`,
      messages: [{ role: "user", content: `KAYNAK: ${src.title} (${src.year ?? "t.y."})\nERİŞİM: ${src.access_level}\n\n${material}` }],
      maxTokens: 900, effort: "low", jsonSchema: SCHEMA,
    });
    // Maliyet, sonraki adımlar hata verse de kaybolmasın diye hemen kaydedilir (D94)
    await recordUsage(s.user.id, "ai_request", { quantity: 0, usage: res.usage, costUsd: await estimateCost(res.model, res.usage.input, res.usage.output, res.usage), provider: model.provider, model: res.model, meta: { action: "literature_matrix", sourceId: src.id } });
    let parsed: Record<string, string> = {};
    try { parsed = JSON.parse(res.text); } catch { /* boş bırak */ }
    const summary = { ...parsed, basedOn: src.access_level, generatedAt: new Date().toISOString() };
    const { data, error } = await s.supabase.from("sources").update({ summary }).eq("id", src.id).select().single();
    if (error) throw migrationError(error);
    out.push(data);
  }
  return json({ sources: out });
});

function migrationError(e: { code?: string; message?: string }) {
  if (e.code === "42703" || /summary/.test(e.message ?? "")) return new ApiError(409, "Bu özellik için veritabanı güncellemesi gerekiyor (20261103000006_source_summary.sql).");
  return e;
}
