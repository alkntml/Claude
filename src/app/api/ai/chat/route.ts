import { z } from "zod";
import { ApiError, json, logError, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { buildContext, extractMemory } from "@/lib/ai/context";
import { ASSISTANT_ACTIONS, OUTPUT_PROTOCOL, type AssistantAction } from "@/lib/ai/prompts";
import { estimateCost, isProviderConfigured, resolveModel, streamWith } from "@/lib/ai/registry";
import { loadProjectBundle } from "@/lib/projects";
import { getSetting } from "@/lib/settings";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

export const maxDuration = 300;

const Schema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid().nullable().optional(),
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().trim().min(1).max(20000),
  action: z.enum(Object.keys(ASSISTANT_ACTIONS) as [AssistantAction, ...AssistantAction[]]).default("chat"),
  selection: z.string().max(30000).optional(),
});

const enc = new TextEncoder();
const sse = (event: string, data: unknown) => enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export const POST = route("ai.chat", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, Schema);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");

  const bundle = await loadProjectBundle(s.supabase, b.projectId, s.user.id);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");
  const stage = b.stageId ? bundle.stages.find((x) => x.id === b.stageId) ?? null : null;
  if (b.stageId && !stage) throw new ApiError(404, "Bölüm bulunamadı");

  const model = await resolveModel(s.profile.plan_id);
  if (!isProviderConfigured(model.provider)) {
    throw new ApiError(503, `Yapay zekâ sağlayıcısı (${model.provider}) yapılandırılmamış. Yönetici ${model.provider === "anthropic" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY"} tanımlamalıdır.`, "ai_not_configured");
  }

  // Sohbet kaydı
  let conversationId = b.conversationId ?? null;
  if (conversationId) {
    const { data } = await s.supabase.from("ai_conversations").select("id").eq("id", conversationId).eq("user_id", s.user.id).maybeSingle();
    if (!data) throw new ApiError(404, "Sohbet bulunamadı");
  } else {
    const { data, error } = await s.supabase.from("ai_conversations").insert({ project_id: b.projectId, stage_id: stage?.id ?? null, user_id: s.user.id, title: b.message.slice(0, 80) }).select("id").single();
    if (error) throw error;
    conversationId = data.id;
  }
  const { data: history } = await s.supabase.from("ai_messages").select("role, content").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(16);

  const [sysSetting, stagePrompts, models] = await Promise.all([getSetting("ai.system_prompt"), getSetting("ai.stage_prompts"), getSetting("ai.models")]);
  const ctx = await buildContext({ db: s.supabase, project: bundle.project, stage, stages: bundle.stages, sources: bundle.sources, memory: bundle.memory, query: `${b.message} ${b.selection ?? ""}` });

  const action = ASSISTANT_ACTIONS[b.action];
  const userContent = [
    action.instruction && `GÖREV: ${action.instruction}`,
    b.selection && `SEÇİLİ METİN:\n"""\n${b.selection}\n"""`,
    b.message,
  ].filter(Boolean).join("\n\n");

  const stagePrompt = stage ? stagePrompts[stage.key] : undefined;
  const system = [sysSetting.text, OUTPUT_PROTOCOL, stagePrompt && `BÖLÜME ÖZEL TALİMAT:\n${stagePrompt}`].filter(Boolean).join("\n\n");
  const messages = [...(history ?? []).reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content })), { role: "user" as const, content: userContent }];

  await s.supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: s.user.id, role: "user", content: b.message, meta: { action: b.action, hasSelection: !!b.selection } });

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(sse("meta", { conversationId, sourceMap: ctx.sourceMap, model: model.model, usedChunks: ctx.usedChunks }));
      let answer = "";
      let usage = { input: 0, output: 0 };
      let stopReason: string | null = null;
      let servedModel = model.model;
      try {
        for await (const ev of streamWith(model, { system, context: ctx.text, messages, maxTokens: models.max_output_tokens, effort: models.effort }, req.signal)) {
          if (ev.type === "text") { answer += ev.text; controller.enqueue(sse("text", { text: ev.text })); }
          else { usage = ev.usage; stopReason = ev.stopReason; servedModel = ev.model; }
        }
        if (stopReason === "refusal" && !answer) answer = "Bu istek güvenlik nedeniyle yanıtlanamadı. Lütfen isteğinizi farklı ifade edin.";
        const memory = extractMemory(answer);
        if (memory.length) {
          await s.supabase.from("project_memory").insert(memory.map((m) => ({ project_id: b.projectId, user_id: s.user.id, kind: m.kind, content: m.content, source: "ai" })));
        }
        const cost = await estimateCost(servedModel, usage.input, usage.output);
        await Promise.all([
          s.supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: s.user.id, role: "assistant", content: answer, meta: { sourceMap: ctx.sourceMap, model: servedModel, usage, stopReason, action: b.action } }),
          s.supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId),
          recordUsage(s.user.id, "ai_request", { tokensIn: usage.input, tokensOut: usage.output, costUsd: cost, provider: model.provider, model: servedModel, meta: { action: b.action, projectId: b.projectId } }),
        ]);
        controller.enqueue(sse("done", { usage, stopReason, memoryAdded: memory.length }));
      } catch (e) {
        await logError("ai.chat.stream", e, s.user.id);
        controller.enqueue(sse("error", { error: req.signal.aborted ? "İstek iptal edildi" : "Yapay zekâ yanıtı alınamadı. Lütfen tekrar deneyin." }));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
});

/** Sohbet geçmişi */
export const GET = route("ai.chat.history", async (req) => {
  const s = await requireUser();
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const stageId = url.searchParams.get("stageId");
  const conversationId = url.searchParams.get("conversationId");
  if (conversationId) {
    const { data } = await s.supabase.from("ai_messages").select("id, role, content, meta, created_at").eq("conversation_id", conversationId).eq("user_id", s.user.id).order("created_at");
    return json({ messages: data ?? [] });
  }
  let q = s.supabase.from("ai_conversations").select("id, title, stage_id, updated_at").eq("user_id", s.user.id).order("updated_at", { ascending: false }).limit(30);
  if (projectId) q = q.eq("project_id", projectId);
  if (stageId) q = q.eq("stage_id", stageId);
  const { data } = await q;
  return json({ conversations: data ?? [] });
});
