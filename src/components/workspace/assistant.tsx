"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, BookOpen, Brain, ChevronDown, ClipboardCopy, Database, FilePlus2, Lightbulb, Loader2, RefreshCw, Replace, SearchCheck, Sparkles, Square, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { cn } from "@/components/ui/cn";
import { Dots } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { ASSISTANT_ACTIONS, type AssistantAction } from "@/lib/ai/prompts";
import { api } from "@/lib/client";
import type { StageDef } from "@/lib/workflows";
import { Markdown, parseAnswer } from "./markdown";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Msg { id: string; role: "user" | "assistant"; content: string; sourceMap: Record<string, string>; error?: boolean; memoryAdded?: number; status?: string[]; added?: { title: string; verified: boolean; year: number | null }[]; post?: string[]; gapAdded?: { title: string; verified: boolean; year: number | null }[] }

interface Props {
  projectId: string;
  stage: { id: string; key: string; title: string } | null;
  def: StageDef | undefined;
  selection: string;
  files: any[];
  onInsert: (markdown: string, sourceMap: Record<string, string>, mode: "append" | "replace") => void;
  onOpenResearch: (prefill: string) => void;
  onMemoryChanged: () => void;
  onSourcesAdded: (rows: any[]) => void;
}

const STAGE_ACTIONS: AssistantAction[] = ["plan", "draft", "synthesize", "research_questions", "hypotheses", "methodology", "interpret", "discussion", "consistency"];
const SELECTION_ACTIONS: AssistantAction[] = ["expand", "shorten", "academic_tone", "restructure"];

async function* readSSE(res: Response): AsyncGenerator<{ event: string; data: any }> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const ev = chunk.match(/^event: (.*)$/m)?.[1] ?? "message";
      const data = chunk.match(/^data: (.*)$/m)?.[1];
      if (data) yield { event: ev, data: JSON.parse(data) };
    }
  }
}

export function AssistantPanel({ projectId, stage, def, selection, files, onInsert, onOpenResearch, onMemoryChanged, onSourcesAdded }: Props) {
  const { t } = useT();
  const toast = useToast();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  // Mobilde rehber kapalı başlar (sohbet alanı görünür kalsın)
  const [guideOpen, setGuideOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!window.matchMedia("(min-width: 1024px)").matches) setGuideOpen(false); }, []);

  // Bölüm değişince o bölümün son sohbetini yükle
  useEffect(() => {
    let cancel = false;
    setMsgs([]);
    setConversationId(null);
    if (!stage) return;
    (async () => {
      try {
        const { conversations } = await api<{ conversations: { id: string }[] }>(`/api/ai/chat?projectId=${projectId}&stageId=${stage.id}`);
        if (cancel || !conversations[0]) return;
        const { messages } = await api<{ messages: any[] }>(`/api/ai/chat?conversationId=${conversations[0].id}`);
        if (cancel) return;
        setConversationId(conversations[0].id);
        setMsgs(messages.map((m) => ({ id: m.id, role: m.role, content: m.content, sourceMap: m.meta?.sourceMap ?? {} })));
        if (messages.length > 0) setGuideOpen(false);
      } catch { /* sessizce geç */ }
    })();
    return () => { cancel = true; };
    // Yalnızca bölüm kimliği değişince yeniden yükle (nesne her çizimde yeniden oluşur)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, stage?.id]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [msgs]);

  // Metin kutusu içeriğe göre büyür (mobilde ekranı kaplamaz)
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const send = useCallback(async (text: string, action: AssistantAction = "chat", extra?: string) => {
    if (!text.trim() || busy) return;
    const useSel = SELECTION_ACTIONS.includes(action) || (action === "chat" && selection.length > 0 && selection.length < 30000);
    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", content: text, sourceMap: {} };
    const aiMsg: Msg = { id: `a${Date.now()}`, role: "assistant", content: "", sourceMap: {} };
    setMsgs((m) => [...m, userMsg, aiMsg]);
    setInput("");
    setBusy(true);
    setGuideOpen(false);
    abort.current = new AbortController();
    const patch = (fn: (x: Msg) => Msg) => setMsgs((m) => m.map((x) => (x.id === aiMsg.id ? fn(x) : x)));
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", signal: abort.current.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stageId: stage?.id ?? null, conversationId, message: extra ? `${text}\n\n${extra}` : text, action, selection: useSel ? selection : undefined }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? t("Hata {n}", { n: res.status }));
      }
      for await (const ev of readSSE(res)) {
        // Yanıt başladıktan sonra gelen durum mesajları (eksik konu araması) yanıtın altında gösterilir
        if (ev.event === "status") patch((x) => (x.content ? { ...x, post: [...(x.post ?? []), ev.data.text] } : { ...x, status: [...(x.status ?? []), ev.data.text] }));
        else if (ev.event === "sources_added") {
          onSourcesAdded(ev.data.sources);
          patch((x) => ({ ...x, added: ev.data.sources.map((r: any) => ({ title: r.title, verified: r.verified, year: r.year })) }));
        }
        else if (ev.event === "fulltext_read") onSourcesAdded(ev.data.sources);
        else if (ev.event === "gap_sources") {
          onSourcesAdded(ev.data.sources);
          patch((x) => ({ ...x, gapAdded: ev.data.sources.map((r: any) => ({ title: r.title, verified: r.verified, year: r.year })) }));
        }
        else if (ev.event === "meta") { setConversationId(ev.data.conversationId); patch((x) => ({ ...x, sourceMap: ev.data.sourceMap })); }
        else if (ev.event === "text") patch((x) => ({ ...x, content: x.content + ev.data.text }));
        else if (ev.event === "done") { if (ev.data.memoryAdded) { onMemoryChanged(); patch((x) => ({ ...x, memoryAdded: ev.data.memoryAdded })); } }
        else if (ev.event === "error") throw new Error(ev.data.error);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      patch((x) => ({ ...x, content: (e as Error).message, error: true }));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }, [busy, conversationId, onMemoryChanged, onSourcesAdded, projectId, selection, stage, t]);

  async function attachData(fileId: string, name: string) {
    setDataOpen(false);
    try {
      const { summary } = await api<{ summary: any }>(`/api/files/${fileId}/stats`);
      const lines = [t("VERİ ÖZETİ — “{name}” (platform tarafından deterministik olarak hesaplandı, N = {n})", { name, n: summary.rows })];
      for (const c of summary.columns) {
        if (c.kind === "numeric") lines.push(`- ${c.name}: n=${c.n}, M=${c.mean}, SD=${c.sd}, Mdn=${c.median}, Min=${c.min}, Max=${c.max}${c.missing ? `, missing=${c.missing}` : ""}`);
        else lines.push(`- ${c.name} (${t("kategorik, {n} düzey", { n: c.distinct })}): ${c.levels.slice(0, 6).map((l: any) => `${l.value} ${l.count} (%${l.pct})`).join("; ")}`);
      }
      if (summary.correlations.length) lines.push(t("Pearson korelasyonları:"), ...summary.correlations.slice(0, 30).map((r: any) => `- ${r.a} × ${r.b}: r=${r.r} (n=${r.n})`));
      lines.push(t("Not: Anlamlılık testleri (p değerleri) bu özette yoktur; kendi istatistik yazılımınızın çıktısını ekleyin."));
      setInput((v) => `${v ? `${v}\n\n` : `${t("Aşağıdaki veri özetini bu bölüm için akademik dille raporlamama yardım et.")}\n\n`}${lines.join("\n")}`);
    } catch (e) {
      toast({ tone: "error", title: t("Veri özeti alınamadı"), detail: (e as Error).message });
    }
  }

  const dataFiles = files.filter((f) => /csv|sheet/.test(f.mime_type) || /\.(csv|xlsx)$/i.test(f.name));
  const chip = "shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition disabled:opacity-50 lg:px-2.5 lg:py-1 lg:text-[12px]";

  return (
    <div className="flex h-full flex-col">
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-3 sm:px-4">
        {def && (
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white">
            <button onClick={() => setGuideOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
              <BookOpen className="h-4 w-4 text-brand-600" />
              <span className="flex-1 text-sm font-semibold text-ink-900">{t("Bu bölümün rehberi")}</span>
              <ChevronDown className={cn("h-4 w-4 text-ink-400 transition", guideOpen && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {guideOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="space-y-3 px-4 pb-4 text-[13px] text-ink-600">
                    <p><b className="text-ink-800">{t("Amaç:")}</b> {t(def.purpose)}</p>
                    {def.steps.length > 0 && <div><b className="text-ink-800">{t("Nasıl ilerlemeli?")}</b><ol className="mt-1 list-decimal space-y-0.5 pl-4">{def.steps.map((s) => <li key={s}>{t(s)}</li>)}</ol></div>}
                    {def.rules.length > 0 && <div><b className="text-ink-800">{t("Yazım kuralları")}</b><ul className="mt-1 list-disc space-y-0.5 pl-4">{def.rules.map((s) => <li key={s}>{t(s)}</li>)}</ul></div>}
                    {def.example && <div className="rounded-xl border border-ink-100 bg-white p-3 font-serif text-[13.5px] italic text-ink-700"><span className="mb-1 block font-sans text-[11px] not-italic text-ink-400">{t("Örnek metin (biçim örneğidir, alıntılanmaz)")}</span>{t(def.example)}</div>}
                    {def.requiresUserData && <p className="flex gap-2 rounded-xl bg-amber-50 p-2.5 text-amber-800"><TriangleAlert className="h-4 w-4 shrink-0" /> {t("Bu bölüm sizin gerçek verinizi gerektirir; asistan bulgu üretmez.")}</p>}
                    {def.questions.length > 0 && (
                      <div><b className="text-ink-800">{t("Asistanın soruları")}</b>
                        <div className="mt-1.5 flex flex-col gap-1.5">{def.questions.map((q) => <button key={q} onClick={() => { setInput(`${t(q)}\n`); ta.current?.focus(); }} className="rounded-xl border border-ink-100 bg-white px-3 py-2 text-left text-ink-700 transition hover:border-brand-200 hover:bg-brand-50/50"><Lightbulb className="mr-1.5 inline h-3.5 w-3.5 text-amber-500" />{t(q)}</button>)}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {msgs.length === 0 && <p className="px-4 pt-4 text-center text-[13px] text-ink-400">{t("Asistana çalışmanızla ilgili her şeyi sorabilirsiniz. Gerekirse kaynakları kendisi arar ve projeye ekler.")}</p>}

        {msgs.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "user" ? (
              <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[14px] text-white sm:text-[13.5px]">{m.content.length > 1200 ? `${m.content.slice(0, 1200)}…` : m.content}</div>
            ) : (
              <AssistantBubble msg={m} streaming={busy && m === msgs[msgs.length - 1]} onInsert={onInsert} onUpdateDraft={() => send(t("Yeni eklenen kaynakları kullanarak az önceki taslağı güncelle; önceki taslakta eksik kalan konuları bu kaynaklarla destekle."), "draft")} busy={busy} />
            )}
          </motion.div>
        ))}
      </div>

      <div className="border-t border-ink-100 bg-white/95 px-2.5 pb-2.5 pt-2 backdrop-blur sm:px-3 sm:pb-3">
        {selection && (
          <div className="no-scrollbar mb-2 flex items-center gap-1.5 overflow-x-auto">
            <span className="shrink-0 text-[11px] font-medium text-ink-400">{t("Seçili metin:")}</span>
            {SELECTION_ACTIONS.map((a) => <button key={a} disabled={busy} onClick={() => send(t(ASSISTANT_ACTIONS[a].label), a)} className={cn(chip, "border-brand-100 bg-brand-50 text-brand-700 hover:bg-brand-100")}>{t(ASSISTANT_ACTIONS[a].label)}</button>)}
          </div>
        )}
        <div className="no-scrollbar -mx-2.5 mb-2 flex gap-1.5 overflow-x-auto px-2.5 sm:-mx-3 sm:px-3">
          <button onClick={() => onOpenResearch(input)} className={cn(chip, "flex items-center gap-1 border-ink-900 bg-ink-900 text-white hover:bg-ink-800")}><SearchCheck className="h-3.5 w-3.5" /> {t("Literatür araştır")}</button>
          {STAGE_ACTIONS.filter((a) => (a === "interpret" || a === "discussion" ? def?.requiresUserData : true)).map((a) => (
            <button key={a} disabled={busy} onClick={() => send(input.trim() || t(ASSISTANT_ACTIONS[a].label), a)} className={cn(chip, "border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900")}>{t(ASSISTANT_ACTIONS[a].label)}</button>
          ))}
        </div>
        <div className="flex items-end gap-1.5 rounded-2xl border border-ink-200 bg-white p-1.5 shadow-sm transition focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100">
          {dataFiles.length > 0 && (
            <div className="relative shrink-0">
              <button onClick={() => setDataOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-500 hover:bg-ink-100" title={t("Veri dosyası ekle")} aria-label={t("Veri dosyası ekle")}><Database className="h-4 w-4" /></button>
              {dataOpen && (
                <div className="absolute bottom-11 left-0 z-20 w-64 rounded-xl border border-ink-100 bg-white p-1.5 shadow-xl">
                  {dataFiles.map((f) => <button key={f.id} onClick={() => attachData(f.id, f.name)} className="block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-ink-50">{f.name}</button>)}
                </div>
              )}
            </div>
          )}
          <textarea ref={ta} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 1024px)").matches) { e.preventDefault(); send(input); } }}
            placeholder={stage ? t("“{title}” hakkında yazın…", { title: stage.title }) : t("Mesajınızı yazın…")}
            aria-label={t("Asistana mesaj")}
            className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-[16px] leading-snug text-ink-900 outline-none placeholder:text-ink-400 sm:text-[14px]" />
          {busy
            ? <button onClick={() => abort.current?.abort()} className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-ink-100 px-3 text-[13px] font-medium text-ink-700 hover:bg-ink-200" aria-label={t("Durdur")}><Square className="h-3 w-3" /><span className="hidden sm:inline">{t("Durdur")}</span></button>
            : <button onClick={() => send(input)} disabled={!input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:bg-ink-200" aria-label={t("Gönder")}><ArrowUp className="h-4 w-4" /></button>}
        </div>
        <p className="mt-1 hidden px-1 text-[10.5px] text-ink-400 lg:block">{t("Enter: gönder · Shift+Enter: yeni satır")}</p>
      </div>
    </div>
  );
}

type Added = { title: string; verified: boolean; year: number | null }[];
function AddedList({ items, title }: { items: Added; title: string }) {
  const { t } = useT();
  return (
    <div>
      <p className="font-medium text-ink-800">{title}</p>
      <ul className="mt-1 space-y-0.5">
        {items.map((a, i) => <li key={i} className="flex gap-1.5"><span className={a.verified ? "text-emerald-600" : "text-amber-600"}>{a.verified ? "✓" : "?"}</span><span className="line-clamp-1">{a.title} ({a.year ?? t("t.y.")})</span></li>)}
      </ul>
    </div>
  );
}

function AssistantBubble({ msg, streaming, onInsert, onUpdateDraft, busy }: { msg: Msg; streaming: boolean; onInsert: Props["onInsert"]; onUpdateDraft: () => void; busy: boolean }) {
  const { t } = useT();
  const toast = useToast();
  if (msg.error) return <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-[13.5px] text-rose-700"><TriangleAlert className="mr-1.5 inline h-4 w-4" />{msg.content}</div>;
  const research = (msg.status?.length || msg.added?.length) ? (
    <div className="space-y-1.5 rounded-2xl border border-ink-100 bg-ink-50/70 px-3.5 py-2.5 text-[12.5px] text-ink-600">
      {msg.status?.map((st, i) => (
        <p key={i} className="flex items-start gap-2">
          {streaming && !msg.content && i === (msg.status?.length ?? 0) - 1 && !msg.added ? <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-brand-500" /> : <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />}
          <span className="min-w-0 break-words">{st}</span>
        </p>
      ))}
      {msg.added && msg.added.length > 0 && <AddedList items={msg.added} title={t("{n} kaynak projeye eklendi (Kaynaklar sekmesinden çıkarabilirsiniz):", { n: msg.added.length })} />}
    </div>
  ) : null;
  if (!msg.content && streaming) return <div className="w-full max-w-[96%] space-y-2.5">{research}<div className="inline-block rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3"><Dots /></div></div>;
  const parsed = parseAnswer(msg.content);
  const hasDraft = parsed.parts.some((p) => p.kind === "draft");
  return (
    <div className="w-full max-w-full space-y-2.5 sm:max-w-[96%]">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400"><Sparkles className="h-3 w-3 text-brand-500" /> {t("Akademik asistan")}</div>
      {research}
      {parsed.parts.map((p, i) =>
        p.kind === "text" ? (
          <div key={i} className="rounded-2xl rounded-tl-md border border-ink-100 bg-white px-3.5 py-3 text-ink-700"><Markdown text={p.text} sourceMap={msg.sourceMap} /></div>
        ) : (
          <div key={i} className="overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-[0_10px_30px_-18px_rgb(39_71_220/0.5)]">
            <div className="flex items-center justify-between gap-2 border-b border-brand-100 bg-brand-50/70 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-brand-700">{t("Taslak metin")}</span>
              {(p.complete || !streaming) && <button onClick={() => { navigator.clipboard.writeText(p.text); toast({ tone: "success", title: t("Kopyalandı") }); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-white" title={t("Kopyala")} aria-label={t("Kopyala")}><ClipboardCopy className="h-3.5 w-3.5" /></button>}
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-4 py-3 text-ink-800 sm:max-h-[420px]"><Markdown text={p.text} sourceMap={msg.sourceMap} serif /></div>
            {(p.complete || !streaming) && (
              <div className="flex flex-wrap justify-end gap-1.5 border-t border-brand-100 bg-brand-50/40 px-2.5 py-2">
                <button onClick={() => onInsert(p.text, msg.sourceMap, "replace")} className="flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 hover:border-ink-300 sm:h-8 sm:text-[12px]" title={t("Seçili metnin yerine koy")}><Replace className="h-3.5 w-3.5" /> {t("Seçimin yerine")}</button>
                <button onClick={() => onInsert(p.text, msg.sourceMap, "append")} className="flex h-9 items-center gap-1.5 rounded-xl bg-brand-600 px-3 text-[13px] font-medium text-white hover:bg-brand-700 sm:h-8 sm:text-[12px]"><FilePlus2 className="h-3.5 w-3.5" /> {t("Belgeye ekle")}</button>
              </div>
            )}
          </div>
        ),
      )}
      {streaming && <Dots />}
      {(msg.post?.length || msg.gapAdded?.length) ? (
        <div className="space-y-2 rounded-2xl border border-amber-100 bg-amber-50/60 px-3.5 py-2.5 text-[12.5px] text-ink-600">
          {msg.post?.map((st, i) => (
            <p key={i} className="flex items-start gap-2">
              {streaming && i === (msg.post?.length ?? 0) - 1 && !msg.gapAdded ? <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-amber-600" /> : <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />}
              <span className="min-w-0 break-words">{st}</span>
            </p>
          ))}
          {msg.gapAdded && msg.gapAdded.length > 0 && (
            <>
              <AddedList items={msg.gapAdded} title={t("Eksik konular için {n} yeni kaynak eklendi:", { n: msg.gapAdded.length })} />
              {hasDraft && !streaming && <button disabled={busy} onClick={onUpdateDraft} className="flex h-9 items-center gap-1.5 rounded-xl bg-ink-900 px-3 text-[13px] font-medium text-white hover:bg-ink-800 disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /> {t("Taslağı yeni kaynaklarla güncelle")}</button>}
            </>
          )}
        </div>
      ) : !streaming && parsed.gaps.length > 0 ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 px-3.5 py-2.5 text-[12.5px] text-amber-800">
          <p className="font-medium">{t("Kaynakla desteklenemediği için taslağa kesin iddia olarak eklenmeyen konular:")}</p>
          <p className="mt-0.5">{parsed.gaps.join(" · ")}</p>
        </div>
      ) : null}
      {(parsed.memory.length > 0 || msg.memoryAdded) && (
        <div className="flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2 text-[12px] text-violet-700"><Brain className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{t("Proje hafızasına eklendi:")} {parsed.memory.join(" · ")}</span></div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
