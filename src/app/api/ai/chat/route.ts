import { makeT } from "@/i18n";
import { localeFromRequest } from "@/i18n/server";
import { z } from "zod";
import { ApiError, assertDeleted, json, logError, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { buildContext, extractGaps, extractMemory } from "@/lib/ai/context";
import { ACTION_EFFORT, ACTION_TIER, ASSISTANT_ACTIONS, OUTPUT_PROTOCOL, type AssistantAction } from "@/lib/ai/prompts";
import { compactHistory, HISTORY_LIMIT } from "@/lib/ai/history";
import { APP_GUIDE, HELP_SYSTEM, isHelpQuestion } from "@/lib/ai/help";
import type { Usage } from "@/lib/ai/types";
import { estimateCost, isProviderConfigured, resolveModel, streamWith } from "@/lib/ai/registry";
import { loadProjectBundle } from "@/lib/projects";
import { getSetting } from "@/lib/settings";
import { collectCitations, headings, type JSONNode } from "@/lib/editor/doc";
import { addSourcesToProject, executeSearch, providerHealthMeta, focusOf, ingestWithBudget, minSourcesFor, pickForAutoAdd, planResearch, rankSources, recordResearchUsage, recordToInput, researchGate } from "@/lib/research";
import { hasOpenAccessCandidate } from "@/lib/sources/fulltext";
import { assertFeature, assertWithinLimits, recordUsage, usageWarnings, searchesRemaining } from "@/lib/usage";

export const maxDuration = 300;

const Schema = z.object({
  projectId: z.string().uuid(),
  stageId: z.string().uuid().nullable().optional(),
  conversationId: z.string().uuid().nullable().optional(),
  message: z.string().trim().min(1).max(20000),
  action: z.enum(Object.keys(ASSISTANT_ACTIONS) as [AssistantAction, ...AssistantAction[]]).default("chat"),
  selection: z.string().max(30000).optional(),
});

/** Yazımdan önce açık erişimli tam metin okumanın yapıldığı eylemler (soru/cevapta beklenmez) */
const READ_ACTIONS = new Set<AssistantAction>(["draft", "synthesize", "discussion", "fix_claim", "research_questions", "hypotheses", "methodology"]);
/** Aynı odak konu için bu süre içinde tekrar otomatik tarama yapılmaz */
const RESEARCH_COOLDOWN_MS = 45 * 60_000;

/** Bir projeye otomatik eklenebilecek en fazla kaynak (tez başına 50+ kaynağa izin verir) */
const MAX_PROJECT_SOURCES = 150;
/** Yazımdan önce tam metin okumayı bekleme süresi */
const FULLTEXT_WAIT_MS = 15_000;

const enc = new TextEncoder();
const sse = (event: string, data: unknown) => enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

export const POST = route("ai.chat", async (req) => {
  const T = makeT(localeFromRequest(req));
  const s = await requireUser();
  const b = await parseBody(req, Schema);
  if (b.action === "reviewer_response") assertFeature(s.profile.plan_id, "reviewer");
  if (b.action === "journal_checklist") assertFeature(s.profile.plan_id, "journals");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "ai_request");

  const bundle = await loadProjectBundle(s.supabase, b.projectId, s.user.id);
  if (!bundle) throw new ApiError(404, "Proje bulunamadı");
  const stage = b.stageId ? bundle.stages.find((x) => x.id === b.stageId) ?? null : null;
  if (b.stageId && !stage) throw new ApiError(404, "Bölüm bulunamadı");

  const model = await resolveModel(s.profile.plan_id, ACTION_TIER[b.action]);
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
  const { data: history } = await s.supabase.from("ai_messages").select("role, content, meta, created_at").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(HISTORY_LIMIT);

  // Kullanım sorusu (D93): “Nereden grafik oluşturabilirim?” gibi sorular küçük modelle, yalnızca kullanım
  // rehberine göre yanıtlanır; proje bağlamı gönderilmez, literatür taraması yapılmaz.
  if (b.action === "chat" && !b.selection && isHelpQuestion(b.message)) {
    const helpModel = await resolveModel(s.profile.plan_id, "fast");
    if (isProviderConfigured(helpModel.provider)) {
      await s.supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: s.user.id, role: "user", content: b.message, meta: { action: "help" } });
      const helpMessages = [...compactHistory((history ?? []).slice(0, 4).reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content as string }))), { role: "user" as const, content: b.message }];
      const helpStream = new ReadableStream({
        async start(controller) {
          let answer = "";
          let usage: Usage = { input: 0, output: 0 };
          let servedModel = helpModel.model;
          try {
            controller.enqueue(sse("meta", { conversationId, sourceMap: {}, model: helpModel.model, usedChunks: [] }));
            controller.enqueue(sse("phase", { phase: "write" }));
            for await (const ev of streamWith(helpModel, { system: HELP_SYSTEM, messages: helpMessages, maxTokens: 800, effort: "low" }, req.signal)) {
              if (ev.type === "text") { answer += ev.text; controller.enqueue(sse("text", { text: ev.text })); }
              else { usage = ev.usage; servedModel = ev.model; }
            }
            const cost = await estimateCost(servedModel, usage.input, usage.output, usage);
            await Promise.all([
              s.supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: s.user.id, role: "assistant", content: answer, meta: { model: servedModel, usage, action: "help" } }),
              s.supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId),
              recordUsage(s.user.id, "ai_request", { tokensIn: usage.input, tokensOut: usage.output, costUsd: cost, provider: helpModel.provider, model: servedModel, meta: { action: "help", projectId: b.projectId } }),
            ]);
            controller.enqueue(sse("done", { usage, stopReason: null, memoryAdded: 0, gapAdded: 0, warnings: [] }));
          } catch (e) {
            await logError("ai.chat.help", e, s.user.id);
            controller.enqueue(sse("error", { error: req.signal.aborted ? T("İstek iptal edildi") : T("Yapay zekâ yanıtı alınamadı. Lütfen tekrar deneyin.") }));
          } finally {
            controller.close();
          }
        },
      });
      return new Response(helpStream, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
    }
  }

  // Otomatik kaynak taraması kararı (D75): soru/plan/düzeltmede tarama yok; yazımda yalnızca odak konu
  // mevcut kaynaklarla karşılanmıyorsa veya kapsam için kaynak azsa; aynı odakta kısa sürede tekrar yok.
  const stageHeads = stage ? headings(stage.content as JSONNode).map((h) => h.text).filter(Boolean).slice(0, 20) : [];
  const focus = focusOf(b.message, stageHeads);
  const focusKey = `${stage?.id ?? "genel"}|${focus.toLocaleLowerCase("tr")}`;
  const recentlySearchedFocus = (history ?? []).some((m) => m.role === "assistant" && (m.meta as { research?: { focusKey?: string } } | null)?.research?.focusKey === focusKey && Date.now() - new Date(m.created_at as string).getTime() < RESEARCH_COOLDOWN_MS);
  const gate = researchGate({ action: b.action, message: b.message, recentlySearchedFocus });
  let searchedQueries: string[] = [];
  let searchProviders: Awaited<ReturnType<typeof executeSearch>>["providers"] = [];

  const [sysSetting, stagePrompts, models] = await Promise.all([getSetting("ai.system_prompt"), getSetting("ai.stage_prompts"), getSetting("ai.models")]);

  const action = ASSISTANT_ACTIONS[b.action];
  const userContent = [
    action.instruction && `GÖREV: ${action.instruction}`,
    b.selection && `SEÇİLİ METİN:\n"""\n${b.selection}\n"""`,
    b.message,
  ].filter(Boolean).join("\n\n");

  const stagePrompt = stage ? stagePrompts[stage.key] : undefined;
  // Sistem talimatı her istekte aynıdır (önbellek, D78); bölüme özel talimat değişken bağlama girer
  const system = [sysSetting.text, OUTPUT_PROTOCOL, `KULLANIM SORULARI: Kullanıcı platformun nasıl kullanılacağını sorarsa (ör. “grafiği nereden oluştururum?”) yalnızca aşağıdaki rehbere göre kısa ve adım adım cevap ver; rehberde olmayan menü veya düğme adı uydurma.\n\n${APP_GUIDE}`].filter(Boolean).join("\n\n");
  // Geçmişteki eski taslaklar kısa notla özetlenir; bölümün güncel metni zaten bağlamda (D78)
  const messages = [...compactHistory((history ?? []).reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content as string }))), { role: "user" as const, content: userContent }];

  await s.supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: s.user.id, role: "user", content: b.message, meta: { action: b.action, hasSelection: !!b.selection } });

  const stream = new ReadableStream({
    async start(controller) {
      // 1) Otomatik literatür araştırması: hızlı model, araştırma gerekip gerekmediğine karar verir ve sorguları üretir.
      //    Gerekiyorsa sorgular gerçek veri tabanlarında çalıştırılır, en uygun kaynaklar doğrulanıp projeye eklenir.
      if (gate !== "skip") {
        controller.enqueue(sse("phase", { phase: "plan" }));
        try {
          // Karar, projenin toplamına değil yazılacak alt başlığa (odak) göre verilir; başlıklar dil farkına rağmen anlamca değerlendirilir
          const relevanceQuery = `${b.message} ${b.selection?.slice(0, 600) ?? ""} ${stage?.title ?? ""} ${focus}`;
          const citedHere = new Set(stage ? collectCitations(stage.content as JSONNode).flatMap((c) => c.ids) : []);
          const relevant = rankSources(bundle.sources, relevanceQuery, citedHere).slice(0, 40);
          const planned = await planResearch({
            planId: s.profile.plan_id, project: bundle.project, stageTitle: stage?.title,
            request: `${b.action !== "chat" ? `[${action.label}] ` : ""}${b.message}${b.selection ? `\n(Seçili metin: ${b.selection.slice(0, 400)})` : ""}`,
            existingTitles: bundle.sources.map((x) => x.title), relevantTitles: relevant.map((x) => x.title), stageHeadings: stageHeads,
            focus, force: gate === "force", scopeLow: bundle.sources.length < minSourcesFor(bundle.project.work_type, bundle.project.academic_level),
          });
          let queries: string[] = [];
          if (planned.plan.needsSearch && planned.plan.queries.length && bundle.sources.length < MAX_PROJECT_SOURCES) {
            try {
              await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
              // Kalan tarama hakkından fazla sorgu çalıştırılmaz (D51)
              const left = await searchesRemaining(s.user.id, s.profile.plan_id);
              if (left != null) planned.plan.queries = planned.plan.queries.slice(0, Math.max(1, left));
              queries = planned.plan.queries.map((q) => q.query);
              controller.enqueue(sse("phase", { phase: "search" }));
              controller.enqueue(sse("status", { text: T("Akademik veri tabanları taranıyor: {q}", { q: queries.join(" · ") }) }));
              const { results, providers } = await executeSearch(planned.plan.queries, { limitPerQuery: 8 });
              searchProviders = providers;
              const existing = new Set(bundle.sources.map((x) => x.doi).filter(Boolean));
              const picks = pickForAutoAdd(results, existing, Math.min(8, MAX_PROJECT_SOURCES - bundle.sources.length));
              if (picks.length) {
                controller.enqueue(sse("phase", { phase: "verify" }));
                controller.enqueue(sse("status", { text: T("{n} sonuç bulundu; en uygun {k} kaynak doğrulanıyor…", { n: results.length, k: picks.length }) }));
                const added = await addSourcesToProject(s.supabase, b.projectId, s.user.id, picks.map(recordToInput), { deferFulltext: true });
                bundle.sources.push(...added.sources);
                controller.enqueue(sse("sources_added", { sources: added.sources, queries }));
              } else {
                controller.enqueue(sse("status", { text: T("Veri tabanlarında uygun yeni kaynak bulunamadı.") }));
              }
            } catch (e) {
              const msg = e instanceof ApiError ? T(e.message) : T("Kaynak araması şu an yapılamadı.");
              controller.enqueue(sse("status", { text: msg }));
            }
          }
          searchedQueries = queries;
          await recordResearchUsage(s.user.id, planned, queries, { countAsRequest: false, providers: searchProviders });
        } catch (e) {
          await logError("ai.chat.research", e, s.user.id);
        }
      }

      if (READ_ACTIONS.has(b.action) || gate === "force") {
        // Yazmadan önce oku: bu istekle en ilgili, açık erişimli ve henüz okunmamış kaynakların tam metni
        // (sayfa numaralı atıf için). Süre sınırlı; bitmeyenler arka planda tamamlanır.
        try {
          const citedHere = new Set(stage ? collectCitations(stage.content as JSONNode).flatMap((c) => c.ids) : []);
          const toRead = rankSources(bundle.sources, `${b.message} ${stage?.title ?? ""}`, citedHere)
            .filter((x) => x.access_level !== "full_text" && hasOpenAccessCandidate(x) && (!x.fulltext_status || x.fulltext_status === "none" || x.fulltext_status === "queued"))
            .slice(0, 6);
          if (toRead.length) {
            controller.enqueue(sse("phase", { phase: "read" }));
            controller.enqueue(sse("status", { text: T("{n} kaynağın açık erişimli tam metni okunuyor…", { n: toRead.length }) }));
            const readIds = await ingestWithBudget(toRead, FULLTEXT_WAIT_MS);
            if (readIds.length) {
              const { data: fresh } = await s.supabase.from("sources").select("*").in("id", readIds).eq("project_id", b.projectId);
              for (const row of fresh ?? []) { const i = bundle.sources.findIndex((x) => x.id === row.id); if (i >= 0) bundle.sources[i] = row; }
              controller.enqueue(sse("fulltext_read", { sources: fresh ?? [] }));
              controller.enqueue(sse("status", { text: T("{n} kaynağın tam metni okundu; atıflarda sayfa numarası kullanılabilecek.", { n: readIds.length }) }));
            }
          }
        } catch (e) {
          await logError("ai.chat.fulltext", e, s.user.id);
        }
      }

      let answer = "";
      /** Yanıt yarıda kesilse (iptal/hata) bile harcanan istek sayılır (D51) */
      let usageRecorded = false;
      let usage: Usage = { input: 0, output: 0 };
      let stopReason: string | null = null;
      let servedModel = model.model;
      try {
        controller.enqueue(sse("phase", { phase: "write" }));
        const wholeWork = b.action === "abstract" || b.action === "ethics_docs" || b.action === "cover_letter" || b.action === "journal_checklist" || b.action === "reviewer_response";
        // Bölümün tamamı seçili metin olarak geldiyse (ör. toplu düzeltme) mevcut metin bağlama ikinci kez eklenmez
        const currentLen = String(stage?.content_text ?? "").length;
        const omitCurrentText = !!b.selection && currentLen > 0 && b.selection.length >= currentLen * 0.8;
        const ctx = await buildContext({ db: s.supabase, project: bundle.project, stage, stages: bundle.stages, sources: bundle.sources, memory: bundle.memory, query: `${b.message} ${b.selection ?? ""}`, otherChars: wholeWork ? 3500 : undefined, omitCurrentText, stagePrompt });
        if (b.action === "journal_checklist") {
          // Yüklenen dergi/kılavuz metni karşılaştırma için bağlama eklenir
          const { data: g } = bundle.project.guideline_file_id
            ? await s.supabase.from("files").select("name, extracted_text").eq("id", bundle.project.guideline_file_id).eq("user_id", s.user.id).maybeSingle()
            : { data: null };
          ctx.tail += g?.extracted_text ? `\n\n## YÜKLENEN DERGİ / KILAVUZ METNİ (${g.name})\n${String(g.extracted_text).slice(0, 20000)}` : "\n\n## YÜKLENEN DERGİ / KILAVUZ METNİ\n(Kılavuz yüklenmemiş.)";
        }
        controller.enqueue(sse("meta", { conversationId, sourceMap: ctx.sourceMap, model: model.model, usedChunks: ctx.usedChunks }));
        const effort = ACTION_EFFORT[b.action] ?? models.effort;
        for await (const ev of streamWith(model, { system, context: ctx.head, contextTail: ctx.tail, messages, maxTokens: models.max_output_tokens, effort }, req.signal)) {
          if (ev.type === "text") { answer += ev.text; controller.enqueue(sse("text", { text: ev.text })); }
          else { usage = ev.usage; stopReason = ev.stopReason; servedModel = ev.model; }
        }
        if (stopReason === "refusal" && !answer) answer = T("Bu istek güvenlik nedeniyle yanıtlanamadı. Lütfen isteğinizi farklı ifade edin.");
        const memory = extractMemory(answer);
        if (memory.length) {
          await s.supabase.from("project_memory").insert(memory.map((m) => ({ project_id: b.projectId, user_id: s.user.id, kind: m.kind, content: m.content, source: "ai" })));
        }
        const cost = await estimateCost(servedModel, usage.input, usage.output, usage);
        usageRecorded = true;
        await Promise.all([
          s.supabase.from("ai_messages").insert({ conversation_id: conversationId, user_id: s.user.id, role: "assistant", content: answer, meta: { sourceMap: ctx.sourceMap, model: servedModel, usage, stopReason, action: b.action, ...(searchedQueries.length ? { research: { focusKey, queries: searchedQueries } } : {}) } }),
          s.supabase.from("ai_conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId),
          recordUsage(s.user.id, "ai_request", { tokensIn: usage.input, tokensOut: usage.output, costUsd: cost, provider: model.provider, model: servedModel, meta: { action: b.action, projectId: b.projectId } }),
        ]);
        // 3) Eksik konular: asistanın :::eksik bloğundaki sorgularla ek kaynak araması (mesaj başına bir kez)
        let gapAdded = 0;
        let gaps = extractGaps(answer);
        // Eksik konu araması yalnızca yazım eylemlerinde veya açık istekte (soru/cevapta yapılmaz)
        if (gaps.length && (READ_ACTIONS.has(b.action) || gate === "force") && !recentlySearchedFocus) {
          try {
            await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
            const leftGap = await searchesRemaining(s.user.id, s.profile.plan_id);
            if (leftGap != null) gaps = gaps.slice(0, Math.max(1, leftGap));
            controller.enqueue(sse("phase", { phase: "gaps" }));
            controller.enqueue(sse("status", { text: T("Taslakta kaynağı eksik kalan konular aranıyor: {q}", { q: gaps.join(" · ") }) }));
            const { results, providers: gapProviders } = await executeSearch(gaps.map((q) => ({ query: q })), { limitPerQuery: 8 });
            const existing = new Set(bundle.sources.map((x) => x.doi).filter(Boolean));
            const picks = pickForAutoAdd(results, existing, 6);
            if (picks.length) {
              const added = await addSourcesToProject(s.supabase, b.projectId, s.user.id, picks.map(recordToInput));
              gapAdded = added.sources.length;
              if (gapAdded) controller.enqueue(sse("gap_sources", { sources: added.sources, queries: gaps }));
            }
            if (!gapAdded) controller.enqueue(sse("status", { text: T("Eksik konular için veri tabanlarında uygun yeni kaynak bulunamadı. Bu konular taslağa kesin iddia olarak eklenmedi.") }));
            await recordUsage(s.user.id, "source_search", { quantity: gaps.length, meta: { queries: gaps, kind: "gap", providers: providerHealthMeta(gapProviders) } });
          } catch (e) {
            controller.enqueue(sse("status", { text: e instanceof ApiError ? T(e.message) : T("Eksik konular için kaynak araması yapılamadı.") }));
          }
        }
        const warnings = await usageWarnings(s.user.id, s.profile.plan_id).catch(() => []);
        controller.enqueue(sse("done", { usage, stopReason, memoryAdded: memory.length, gapAdded, warnings }));
      } catch (e) {
        await logError("ai.chat.stream", e, s.user.id);
        if (!usageRecorded && answer) {
          // Akış başladıysa model çalışmıştır: kesin token bilinmiyorsa metin uzunluğundan tahmin edilir
          const out = usage.output || Math.ceil(answer.length / 3.5);
          await recordUsage(s.user.id, "ai_request", { tokensIn: usage.input || Math.ceil(system.length / 3.5), tokensOut: out, provider: model.provider, model: servedModel, meta: { action: b.action, projectId: b.projectId, partial: true } }).catch(() => {});
        }
        controller.enqueue(sse("error", { error: req.signal.aborted ? T("İstek iptal edildi") : T("Yapay zekâ yanıtı alınamadı. Lütfen tekrar deneyin.") }));
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

/** Bir sohbeti ve tüm mesajlarını kalıcı olarak siler (mesajlar ON DELETE CASCADE ile kalkar). */
export const DELETE = route("ai.chat.delete", async (req) => {
  const s = await requireUser();
  const id = z.string().uuid().safeParse(new URL(req.url).searchParams.get("conversationId"));
  if (!id.success) throw new ApiError(400, "Geçersiz istek");
  assertDeleted(await s.supabase.from("ai_conversations").delete().eq("id", id.data).eq("user_id", s.user.id).select("id"), "Sohbet bulunamadı");
  return json({ ok: true });
});
