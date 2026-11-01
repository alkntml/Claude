import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { checkEvidence } from "@/lib/ai/evidence";
import { localeFromRequest } from "@/i18n/server";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

const Body = z.object({ sentence: z.string().trim().min(5).max(3000), locator: z.string().max(40).nullable().optional() });

/** Atıf doğrulama: cümle kaynakta destekleniyor mu? Kanıt parçaları ve sayfası ile döner. */
export const POST = route<Ctx>("source.evidence", async (req, { params }) => {
  const s = await requireUser();
  const { id } = await params;
  const b = await parseBody(req, Body);
  const { data: src } = await s.supabase.from("sources").select("id, title, abstract, access_level").eq("id", id).eq("user_id", s.user.id).maybeSingle();
  if (!src) throw new ApiError(404, "Kaynak bulunamadı");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");
  const { data: chunks } = src.access_level === "full_text"
    ? await s.supabase.from("source_chunks").select("content, page_hint").eq("source_id", id).eq("user_id", s.user.id).order("chunk_index").limit(1500)
    : { data: [] };
  const { result, usage } = await checkEvidence({
    planId: s.profile.plan_id, uiLanguage: localeFromRequest(req), sentence: b.sentence, locator: b.locator ?? null,
    source: { title: src.title, abstract: src.access_level === "metadata" ? null : src.abstract, access_level: src.access_level },
    chunks: chunks ?? [],
  });
  if (usage.tokensIn) await recordUsage(s.user.id, "ai_request", { tokensIn: usage.tokensIn, tokensOut: usage.tokensOut, costUsd: usage.cost, provider: usage.provider, model: usage.model, meta: { action: "evidence_check", sourceId: id } });
  return json(result);
});
