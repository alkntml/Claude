"use client";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Brain, ChevronDown, ClipboardCopy, Database, FilePlus2, Lightbulb, Replace, SearchCheck, Send, Sparkles, Square, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Dots } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { ASSISTANT_ACTIONS, type AssistantAction } from "@/lib/ai/prompts";
import { api } from "@/lib/client";
import type { StageDef } from "@/lib/workflows";
import { Markdown, parseAnswer } from "./markdown";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Msg { id: string; role: "user" | "assistant"; content: string; sourceMap: Record<string, string>; error?: boolean; memoryAdded?: number }

interface Props {
  projectId: string;
  stage: { id: string; key: string; title: string } | null;
  def: StageDef | undefined;
  selection: string;
  files: any[];
  onInsert: (markdown: string, sourceMap: Record<string, string>, mode: "append" | "replace") => void;
  onOpenResearch: (prefill: string) => void;
  onMemoryChanged: () => void;
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

export function AssistantPanel({ projectId, stage, def, selection, files, onInsert, onOpenResearch, onMemoryChanged }: Props) {
  const toast = useToast();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);
  const [dataOpen, setDataOpen] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

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
        setGuideOpen(messages.length === 0);
      } catch { /* sessizce geç */ }
    })();
    return () => { cancel = true; };
    // Yalnızca bölüm kimliği değişince yeniden yükle (nesne her çizimde yeniden oluşur)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, stage?.id]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [msgs]);

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
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST", signal: abort.current.signal, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, stageId: stage?.id ?? null, conversationId, message: extra ? `${text}\n\n${extra}` : text, action, selection: useSel ? selection : undefined }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `Hata ${res.status}`);
      }
      for await (const ev of readSSE(res)) {
        if (ev.event === "meta") { setConversationId(ev.data.conversationId); setMsgs((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, sourceMap: ev.data.sourceMap } : x))); }
        else if (ev.event === "text") setMsgs((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, content: x.content + ev.data.text } : x)));
        else if (ev.event === "done") { if (ev.data.memoryAdded) { onMemoryChanged(); setMsgs((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, memoryAdded: ev.data.memoryAdded } : x))); } }
        else if (ev.event === "error") throw new Error(ev.data.error);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMsgs((m) => m.map((x) => (x.id === aiMsg.id ? { ...x, content: (e as Error).message, error: true } : x)));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }, [busy, conversationId, onMemoryChanged, projectId, selection, stage]);

  async function attachData(fileId: string, name: string) {
    setDataOpen(false);
    try {
      const { summary } = await api<{ summary: any }>(`/api/files/${fileId}/stats`);
      const lines = [`VERİ ÖZETİ — "${name}" (platform tarafından deterministik olarak hesaplandı, N = ${summary.rows})`];
      for (const c of summary.columns) {
        if (c.kind === "numeric") lines.push(`- ${c.name}: n=${c.n}, Ort=${c.mean}, SS=${c.sd}, Medyan=${c.median}, Min=${c.min}, Maks=${c.max}${c.missing ? `, kayıp=${c.missing}` : ""}`);
        else lines.push(`- ${c.name} (kategorik, ${c.distinct} düzey): ${c.levels.slice(0, 6).map((l: any) => `${l.value} ${l.count} (%${l.pct})`).join("; ")}`);
      }
      if (summary.correlations.length) lines.push("Pearson korelasyonları:", ...summary.correlations.slice(0, 30).map((r: any) => `- ${r.a} × ${r.b}: r=${r.r} (n=${r.n})`));
      lines.push("Not: Anlamlılık testleri (p değerleri) bu özette yoktur; kendi istatistik yazılımınızın çıktısını ekleyin.");
      setInput((v) => `${v ? `${v}\n\n` : "Aşağıdaki veri özetini bu bölüm için akademik dille raporlamama yardım et.\n\n"}${lines.join("\n")}`);
    } catch (e) {
      toast({ tone: "error", title: "Veri özeti alınamadı", detail: (e as Error).message });
    }
  }

  const dataFiles = files.filter((f) => /csv|sheet/.test(f.mime_type) || /\.(csv|xlsx)$/i.test(f.name));

  return (
    <div className="flex h-full flex-col">
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 pt-3">
        {def && (
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white">
            <button onClick={() => setGuideOpen((o) => !o)} className="flex w-full items-center gap-2 px-4 py-3 text-left">
              <BookOpen className="h-4 w-4 text-brand-600" />
              <span className="flex-1 text-sm font-semibold text-ink-900">Bu bölümün rehberi</span>
              <ChevronDown className={cn("h-4 w-4 text-ink-400 transition", guideOpen && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {guideOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="space-y-3 px-4 pb-4 text-[13px] text-ink-600">
                    <p><b className="text-ink-800">Amaç:</b> {def.purpose}</p>
                    {def.steps.length > 0 && <div><b className="text-ink-800">Nasıl ilerlemeli?</b><ol className="mt-1 list-decimal space-y-0.5 pl-4">{def.steps.map((s) => <li key={s}>{s}</li>)}</ol></div>}
                    {def.rules.length > 0 && <div><b className="text-ink-800">Yazım kuralları</b><ul className="mt-1 list-disc space-y-0.5 pl-4">{def.rules.map((s) => <li key={s}>{s}</li>)}</ul></div>}
                    {def.example && <div className="rounded-xl border border-ink-100 bg-white p-3 font-serif text-[13.5px] italic text-ink-700"><span className="mb-1 block font-sans text-[11px] not-italic text-ink-400">Örnek metin (biçim örneğidir, alıntılanmaz)</span>{def.example}</div>}
                    {def.requiresUserData && <p className="flex gap-2 rounded-xl bg-amber-50 p-2.5 text-amber-800"><TriangleAlert className="h-4 w-4 shrink-0" /> Bu bölüm sizin gerçek verinizi gerektirir; asistan bulgu üretmez.</p>}
                    {def.questions.length > 0 && (
                      <div><b className="text-ink-800">Asistanın soruları</b>
                        <div className="mt-1.5 flex flex-col gap-1.5">{def.questions.map((q) => <button key={q} onClick={() => setInput(`${q}\n`)} className="rounded-xl border border-ink-100 bg-white px-3 py-2 text-left text-ink-700 transition hover:border-brand-200 hover:bg-brand-50/50"><Lightbulb className="mr-1.5 inline h-3.5 w-3.5 text-amber-500" />{q}</button>)}</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {msgs.length === 0 && !def && <p className="pt-6 text-center text-sm text-ink-400">Asistana çalışmanızla ilgili her şeyi sorabilirsiniz.</p>}

        {msgs.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "user" ? (
              <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13.5px] text-white">{m.content.length > 1200 ? `${m.content.slice(0, 1200)}…` : m.content}</div>
            ) : (
              <AssistantBubble msg={m} streaming={busy && m === msgs[msgs.length - 1]} onInsert={onInsert} />
            )}
          </motion.div>
        ))}
      </div>

      <div className="border-t border-ink-100 bg-white/90 p-3 backdrop-blur">
        {selection && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-ink-400">Seçili metin:</span>
            {SELECTION_ACTIONS.map((a) => <button key={a} disabled={busy} onClick={() => send(ASSISTANT_ACTIONS[a].label, a)} className="rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[12px] font-medium text-brand-700 transition hover:bg-brand-100 disabled:opacity-50">{ASSISTANT_ACTIONS[a].label}</button>)}
          </div>
        )}
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
          <button onClick={() => onOpenResearch(input)} className="flex shrink-0 items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[12px] font-medium text-white transition hover:bg-ink-800"><SearchCheck className="h-3.5 w-3.5" /> Literatür araştır</button>
          {STAGE_ACTIONS.filter((a) => (a === "interpret" || a === "discussion" ? def?.requiresUserData : true)).map((a) => (
            <button key={a} disabled={busy} onClick={() => send(input.trim() || ASSISTANT_ACTIONS[a].label, a)} className="shrink-0 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[12px] font-medium text-ink-600 transition hover:border-ink-300 hover:text-ink-900 disabled:opacity-50">{ASSISTANT_ACTIONS[a].label}</button>
          ))}
        </div>
        <div className="relative">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder={stage ? `“${stage.title}” hakkında yazın… (Enter: gönder)` : "Mesajınızı yazın…"} className="input max-h-48 min-h-[76px] resize-none pb-11 pr-3 text-[14px]" />
          <div className="absolute bottom-2 left-2 flex gap-1">
            {dataFiles.length > 0 && (
              <div className="relative">
                <button onClick={() => setDataOpen((o) => !o)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-ink-500 hover:bg-ink-100" title="Veri dosyası ekle"><Database className="h-3.5 w-3.5" /> Veri</button>
                {dataOpen && (
                  <div className="absolute bottom-8 left-0 z-20 w-64 rounded-xl border border-ink-100 bg-white p-1.5 shadow-xl">
                    {dataFiles.map((f) => <button key={f.id} onClick={() => attachData(f.id, f.name)} className="block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-ink-50">{f.name}</button>)}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="absolute bottom-2 right-2">
            {busy ? <Button size="sm" variant="secondary" onClick={() => abort.current?.abort()}><Square className="h-3 w-3" /> Durdur</Button> : <Button size="sm" onClick={() => send(input)} disabled={!input.trim()}><Send className="h-3.5 w-3.5" /> Gönder</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function AssistantBubble({ msg, streaming, onInsert }: { msg: Msg; streaming: boolean; onInsert: Props["onInsert"] }) {
  const toast = useToast();
  if (msg.error) return <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-[13.5px] text-rose-700"><TriangleAlert className="mr-1.5 inline h-4 w-4" />{msg.content}</div>;
  if (!msg.content && streaming) return <div className="rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3"><Dots /></div>;
  const parsed = parseAnswer(msg.content);
  return (
    <div className="w-full max-w-[96%] space-y-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400"><Sparkles className="h-3 w-3 text-brand-500" /> Akademik asistan</div>
      {parsed.parts.map((p, i) =>
        p.kind === "text" ? (
          <div key={i} className="rounded-2xl rounded-tl-md border border-ink-100 bg-white px-3.5 py-3 text-ink-700"><Markdown text={p.text} sourceMap={msg.sourceMap} /></div>
        ) : (
          <div key={i} className="overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-[0_10px_30px_-18px_rgb(39_71_220/0.5)]">
            <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/70 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-brand-700">Taslak metin</span>
              {(p.complete || !streaming) && (
                <div className="flex gap-1">
                  <button onClick={() => { navigator.clipboard.writeText(p.text); toast({ tone: "success", title: "Kopyalandı" }); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-white" title="Kopyala"><ClipboardCopy className="h-3.5 w-3.5" /></button>
                  <button onClick={() => onInsert(p.text, msg.sourceMap, "replace")} className="flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-ink-600 hover:bg-white" title="Seçili metnin yerine koy"><Replace className="h-3.5 w-3.5" /> Seçimin yerine</button>
                  <button onClick={() => onInsert(p.text, msg.sourceMap, "append")} className="flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-[12px] font-medium text-white hover:bg-brand-700"><FilePlus2 className="h-3.5 w-3.5" /> Belgeye ekle</button>
                </div>
              )}
            </div>
            <div className="max-h-[420px] overflow-y-auto px-4 py-3 text-ink-800"><Markdown text={p.text} sourceMap={msg.sourceMap} serif /></div>
          </div>
        ),
      )}
      {streaming && <Dots />}
      {(parsed.memory.length > 0 || msg.memoryAdded) && (
        <div className="flex items-start gap-2 rounded-xl bg-violet-50 px-3 py-2 text-[12px] text-violet-700"><Brain className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>Proje hafızasına eklendi: {parsed.memory.join(" · ")}</span></div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
