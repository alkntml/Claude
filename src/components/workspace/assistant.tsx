"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, BarChart3, Check, ListOrdered, Mic, MicOff, BookOpen, Brain, ChevronDown, ClipboardCopy, Database, FilePlus2, Lightbulb, Loader2, RefreshCw, Replace, SearchCheck, Sparkles, Square, TriangleAlert } from "lucide-react";
import { useCallback, useMemo, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { quickActions } from "@/lib/workflows/quick-actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { cn } from "@/components/ui/cn";
import { Dots } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { ASSISTANT_ACTIONS, type AssistantAction } from "@/lib/ai/prompts";
import { api } from "@/lib/client";
import { PHASES, shouldWarnOnce, streamChat, type ChatPhase } from "@/lib/ai/chat-client";
import type { StageDef } from "@/lib/workflows";
import { Markdown, parseAnswer } from "./markdown";
import { analyzeRepetition, isRepetitive } from "@/lib/quality/repetition";
import { LANG_TAG, writingLang } from "@/lib/writing-lang";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Msg { id: string; role: "user" | "assistant"; content: string; sourceMap: Record<string, string>; error?: boolean; memoryAdded?: number; status?: string[]; added?: { title: string; verified: boolean; year: number | null }[]; post?: string[]; gapAdded?: { title: string; verified: boolean; year: number | null }[]; phase?: ChatPhase; phasesSeen?: ChatPhase[]; permission?: { queries: string[]; retry: { text: string; action: AssistantAction; extra?: string; sel?: string } } }

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
  /** Alt başlık oluştur penceresi (D83); verilmezse (ör. en derin düzeyde) düğme görünmez */
  onOpenOutline?: () => void;
  /** Editörde açık olan alt başlık (D83): yazım istekleri yalnızca bu alt başlık için yapılır */
  focus?: { number: string; title: string; index?: number } | null;
  /** D149: çalışmanın araştırma tercihleri (“her zaman izin ver” modu değiştirirken diğer ayarlar korunur) */
  researchPrefs?: Record<string, unknown>;
  /** Word’den içe aktar penceresi (D87) */
  onOpenImport?: () => void;
  /** Projede kapsam için yeterli kaynak yok (literatür kısayolu her bölümde görünür) */
  lowSources?: boolean;
  /** Kurgudaki bölüm hedefi (kelime); uzun bölümlerde “Alt başlıklarla yaz” */
  targetWords?: number;
  onOpenAnalysis?: () => void;
  /** Dış bileşenlerin (yorumlar vb.) asistana istek göndermesi için */
  registerSend?: (fn: (text: string, action?: AssistantAction, selection?: string) => void) => void;
  language?: string;
}

/** Uzun bölümler: alt başlıklarla yazım kısayolu */
const LONG_STAGES = new Set(["literature", "theory", "concepts", "review_synthesis", "method", "methods_article", "findings", "results_article", "discussion", "discussion_article", "grant_method"]);
const SELECTION_ACTIONS: AssistantAction[] = ["expand", "shorten", "academic_tone", "restructure", "reduce_repetition"];
const USAGE_LABEL: Record<string, string> = { ai_requests: "yapay zekâ isteği", tokens: "token", source_searches: "kaynak tarama", storage_mb: "depolama" };
const PHASE_LABEL: Record<ChatPhase, string> = { plan: "Karar", search: "Arama", verify: "Doğrulama", read: "Okuma", write: "Yazım", gaps: "Eksikler" };

/** Uzun işlerde adımlı ilerleme: hangi aşamada olduğunu gösterir */
export function PhaseSteps({ phase, seen }: { phase?: ChatPhase; seen?: ChatPhase[] }) {
  const { t } = useT();
  if (!phase && !seen?.length) return null;
  const visible = PHASES.filter((p) => p === "plan" || p === "write" || seen?.includes(p));
  const cur = phase ? visible.indexOf(phase) : visible.length;
  return (
    <ol className="flex flex-wrap items-center gap-1 text-[11px] font-medium" aria-label={t("İlerleme")}>
      {visible.map((p, i) => (
        <li key={p} className="flex items-center gap-1">
          {i > 0 && <span className={cn("h-px w-3", i <= cur ? "bg-brand-300" : "bg-ink-200")} />}
          <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5", i < cur ? "bg-emerald-50 text-emerald-700" : i === cur ? "bg-brand-200 text-brand-950" : "bg-ink-100 text-ink-400")}>
            {i < cur ? <Check className="h-3 w-3" /> : i === cur ? <Loader2 className="h-3 w-3 animate-spin" /> : null}{t(PHASE_LABEL[p])}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function AssistantPanel({ researchPrefs, projectId, stage, def, selection, files, onInsert, onOpenResearch, onMemoryChanged, onSourcesAdded, onOpenOutline, onOpenAnalysis, registerSend, language, lowSources = false, targetWords = 0, focus = null, onOpenImport }: Props) {
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

  const send = useCallback(async (text: string, action: AssistantAction = "chat", extra?: string, selOverride?: string, research?: "allow" | "skip") => {
    if (!text.trim() || busy) return;
    const sel = selOverride ?? selection;
    const useSel = selOverride !== undefined || SELECTION_ACTIONS.includes(action) || (action === "chat" && sel.length > 0 && sel.length < 30000);
    const userMsg: Msg = { id: `u${Date.now()}`, role: "user", content: text, sourceMap: {} };
    const aiMsg: Msg = { id: `a${Date.now()}`, role: "assistant", content: "", sourceMap: {} };
    // D149: izin kartından devam — kullanıcı mesajı zaten görünüyor; izin kartı yanıtla değişir
    if (research) setMsgs((m) => [...m.filter((x) => !x.permission), aiMsg]);
    else setMsgs((m) => [...m, userMsg, aiMsg]);
    setInput("");
    setBusy(true);
    setGuideOpen(false);
    abort.current = new AbortController();
    const patch = (fn: (x: Msg) => Msg) => setMsgs((m) => m.map((x) => (x.id === aiMsg.id ? fn(x) : x)));
    try {
      await streamChat(
        { projectId, stageId: stage?.id ?? null, conversationId, message: [text, extra, focusNote(action, useSel)].filter(Boolean).join("\n\n"), action, selection: useSel ? sel : undefined, focusIndex: focus && !useSel ? focus.index ?? null : null, ...(research ? { research } : {}) },
        abort.current.signal,
        (event, data) => {
          // Yanıt başladıktan sonra gelen durum mesajları (eksik konu araması) yanıtın altında gösterilir
          if (event === "status") patch((x) => (x.content ? { ...x, post: [...(x.post ?? []), data.text] } : { ...x, status: [...(x.status ?? []), data.text] }));
          else if (event === "phase") patch((x) => ({ ...x, phase: data.phase, phasesSeen: [...new Set([...(x.phasesSeen ?? []), data.phase as ChatPhase])] }));
          else if (event === "sources_added") {
            onSourcesAdded(data.sources);
            patch((x) => ({ ...x, added: data.sources.map((r: any) => ({ title: r.title, verified: r.verified, year: r.year })) }));
          }
          else if (event === "fulltext_read") onSourcesAdded(data.sources);
          else if (event === "research_permission") patch((x) => ({ ...x, permission: { queries: data.queries ?? [], retry: { text, action, extra, sel: selOverride } } }));
          else if (event === "gap_sources") {
            onSourcesAdded(data.sources);
            patch((x) => ({ ...x, gapAdded: data.sources.map((r: any) => ({ title: r.title, verified: r.verified, year: r.year })) }));
          }
          else if (event === "meta") { setConversationId(data.conversationId); patch((x) => ({ ...x, sourceMap: data.sourceMap })); }
          else if (event === "text") patch((x) => ({ ...x, content: x.content + data.text }));
          // Taslak hedef uzunluğa tamamlanınca (D97) birleşik metin gelir
          else if (event === "replace") patch((x) => ({ ...x, content: data.text }));
          else if (event === "done") {
            patch((x) => ({ ...x, phase: undefined }));
            if (data.memoryAdded) { onMemoryChanged(); patch((x) => ({ ...x, memoryAdded: data.memoryAdded })); }
            for (const w of data.warnings ?? []) {
              if (!shouldWarnOnce(`${w.kind}:${w.pct >= 100 ? 100 : 80}`)) continue;
              // Yapay zekâ sınırı sayı olarak gösterilmez (D49)
              if (w.kind === "pages") toast({ tone: "warning", title: t("Bu ayki sayfa hakkınızın %{pct} kadarını kullandınız", { pct: w.pct }), detail: t("Hakkınız dolduğunda paket seçenekleri gösterilir.") });
              else if (w.kind === "ai_requests" || w.kind === "tokens") toast({ tone: "warning", title: t("Bu ayki yapay zekâ kullanım hakkınızın sonuna yaklaşıyorsunuz"), detail: t("Hakkınız dolduğunda paket seçenekleri gösterilir.") });
              else toast({ tone: "warning", title: t("Bu ay {item} limitinizin %{pct} kadarını kullandınız", { item: t(USAGE_LABEL[w.kind] ?? w.kind), pct: w.pct }), detail: t("{used} / {limit}. Paketinizi Hesap sayfasından yükseltebilirsiniz.", { used: w.used, limit: w.limit }) });
            }
          }
        },
        t("Hata"),
      );
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      patch((x) => ({ ...x, content: (e as Error).message, error: true }));
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }, [busy, conversationId, onMemoryChanged, onSourcesAdded, projectId, selection, stage, t, toast, focus]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Alt başlığa odaklanıldığında yazım isteği yalnızca o alt başlık için yapılır (D83) */
  function focusNote(action: AssistantAction, withSelection: boolean): string {
    if (!focus || withSelection || action === "outline" || action === "abstract") return "";
    const name = `${focus.number ? `${focus.number} ` : ""}${focus.title}`;
    return t("ODAK: Şu anda yalnızca “{name}” alt başlığı üzerinde çalışılıyor. Taslak verirsen yalnızca bu alt başlığın metnini yaz; başlığı tekrar yazma, yeni alt başlık açma ve diğer alt başlıkların konusuna girme. Uzunluğu bölüm hedefi içinde bu alt başlığa düşen paya göre ayarla.", { name });
  }

  useEffect(() => { registerSend?.((text, action = "chat", sel) => send(text, action, undefined, sel)); }, [registerSend, send]);

  // Sesle not alma (tarayıcının konuşma tanıma özelliği; ses sunucuya gönderilmez)
  const [listening, setListening] = useState(false);
  const recog = useRef<any>(null);
  const speechSupported = typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  function toggleDictation() {
    if (listening) { recog.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast({ tone: "warning", title: t("Tarayıcınız sesle yazmayı desteklemiyor"), detail: t("Chrome, Edge veya Safari’nin güncel sürümünü deneyin.") }); return; }
    const r = new SR();
    r.lang = LANG_TAG[writingLang(language)];
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e: any) => {
      let txt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) txt += e.results[i][0].transcript;
      if (txt.trim()) setInput((v) => `${v}${v && !v.endsWith(" ") ? " " : ""}${txt.trim()}`);
    };
    r.onerror = (e: any) => { if (e.error !== "no-speech" && e.error !== "aborted") toast({ tone: "error", title: t("Mikrofon kullanılamadı"), detail: e.error === "not-allowed" ? t("Tarayıcı ayarlarından mikrofon izni verin.") : String(e.error) }); };
    r.onend = () => setListening(false);
    recog.current = r;
    r.start();
    setListening(true);
  }
  useEffect(() => () => recog.current?.stop?.(), []);

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
  const chip = "shrink-0 rounded-lg border px-3 py-1.5 text-[12.5px] font-medium transition disabled:opacity-50 lg:px-2.5 lg:py-1 lg:text-[12.5px]";

  return (
    <div className="flex h-full flex-col">
      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-3 pb-4 pt-3 sm:px-4">
        {def && (
          <div className="overflow-hidden rounded-xl border border-ink-200/80 bg-white">
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

        {conversationId && msgs.length > 0 && !busy && (
          <div className="flex justify-end">
            <DeleteButton withText label={t("Sohbeti sil")} confirmText={t("Bu bölümdeki asistan sohbeti ve tüm mesajları kalıcı olarak silinsin mi? Metninize eklediğiniz yazılar etkilenmez.")} onDelete={() => api(`/api/ai/chat?conversationId=${conversationId}`, { method: "DELETE" })} onDone={() => { setMsgs([]); setConversationId(null); }} />
          </div>
        )}

        {msgs.length === 0 && <p className="px-4 pt-4 text-center text-[13px] text-ink-400">{t("Asistana çalışmanızla ilgili her şeyi sorabilirsiniz. Gerekirse kaynakları kendisi arar ve projeye ekler.")}</p>}

        {msgs.map((m) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            {m.role === "user" ? (
              <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-ink-100 px-3.5 py-2.5 text-[14px] text-ink-900 sm:text-[14px]">{m.content.length > 1200 ? `${m.content.slice(0, 1200)}…` : m.content}</div>
            ) : (
              <AssistantBubble msg={m} streaming={busy && m === msgs[msgs.length - 1]} onInsert={onInsert} onUpdateDraft={() => send(t("Yeni eklenen kaynakları kullanarak az önceki taslağı güncelle; önceki taslakta eksik kalan konuları bu kaynaklarla destekle."), "draft")} onReduce={(text) => send(t("Tekrarları azalt"), "reduce_repetition", undefined, text)} busy={busy}
                onPermission={async (choice) => {
                  const rt = m.permission?.retry; if (!rt) return;
                  if (choice === "always") await api(`/api/projects/${projectId}`, { method: "PATCH", json: { context: { research: { ...(researchPrefs ?? {}), mode: "auto" } } } }).catch(() => {});
                  send(rt.text, rt.action, rt.extra, rt.sel, choice === "skip" ? "skip" : "allow");
                }} />
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
          {/* Aşamaya özel kısayollar (D75) */}
          {/* Alt başlık oluştur (D83): her bölümde ve alt başlıkta; sayı sorulur, sonra her birine ayrı girilir */}
          {onOpenOutline && <button disabled={busy} onClick={onOpenOutline} className={cn(chip, "flex items-center gap-1 border-ink-200 bg-white text-ink-700 hover:bg-ink-50")}><ListOrdered className="h-3.5 w-3.5" /> {focus ? t("Alt-alt başlık oluştur") : t("Alt başlık oluştur")}</button>}
          {quickActions(stage?.key, { lowSources, hasData: dataFiles.length > 0, longSection: targetWords >= 1500 || LONG_STAGES.has(stage?.key ?? "") }).map((q) => {
            if (q === "outline") return null;
            if (q === "analysis") return onOpenAnalysis ? <button key={q} disabled={busy} onClick={onOpenAnalysis} className={cn(chip, "flex items-center gap-1 border-ink-200 bg-white text-ink-700 hover:bg-ink-50")}><BarChart3 className="h-3.5 w-3.5" /> {t("İstatistik analizi")}</button> : null;
            if (q === "research") return <button key={q} onClick={() => onOpenResearch(input)} className={cn(chip, "flex items-center gap-1 border-ink-200 bg-white text-ink-700 hover:bg-ink-50")}><SearchCheck className="h-3.5 w-3.5" /> {t("Literatür araştır")}</button>;
            // Bulgu yorumlama yalnızca kullanıcı verisi gereken bölümde veya veri dosyası varken
            if (q === "interpret" && !def?.requiresUserData && !dataFiles.length) return null;
            return <button key={q} disabled={busy} onClick={() => send(input.trim() || t(ASSISTANT_ACTIONS[q].label), q)} className={cn(chip, q === "draft" ? "border-brand-300 bg-brand-200 text-brand-950 hover:bg-brand-300" : "border-ink-200 bg-white text-ink-700 hover:bg-ink-50")}>{t(ASSISTANT_ACTIONS[q].label)}</button>;
          })}
          {onOpenImport && <button disabled={busy} onClick={onOpenImport} className={cn(chip, "flex items-center gap-1 border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:text-ink-900")}><FilePlus2 className="h-3.5 w-3.5" /> {t("Word’den içe aktar")}</button>}
          {input.trim().length > 20 && <button disabled={busy} onClick={() => send(input, "from_notes")} className={cn(chip, "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100")}>{t(ASSISTANT_ACTIONS.from_notes.label)}</button>}
        </div>
        <div className="flex items-end gap-1.5 rounded-2xl border border-ink-200 bg-white p-2 transition focus-within:border-ink-300 focus-within:shadow-sm">
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
          <button type="button" onClick={toggleDictation} className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition", listening ? "animate-pulse bg-rose-500 text-white" : "text-ink-500 hover:bg-ink-100", !speechSupported && "opacity-50")} aria-label={listening ? t("Dinlemeyi durdur") : t("Sesle yaz")} title={listening ? t("Dinlemeyi durdur") : t("Sesle yaz")}>{listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
          <textarea id="assistant-input" ref={ta} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(min-width: 1024px)").matches) { e.preventDefault(); send(input); } }}
            placeholder={listening ? t("Dinleniyor… konuşun") : stage ? t("“{title}” hakkında yazın…", { title: focus ? `${focus.number ? `${focus.number} ` : ""}${focus.title}` : stage.title }) : t("Mesajınızı yazın…")}
            aria-label={t("Asistana mesaj")}
            className="max-h-40 min-h-[36px] flex-1 resize-none bg-transparent px-2 py-2 text-[16px] leading-snug text-ink-900 outline-none placeholder:text-ink-400 sm:text-[14px]" />
          {busy
            ? <button onClick={() => abort.current?.abort()} className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-ink-100 px-3 text-[13px] font-medium text-ink-700 hover:bg-ink-200" aria-label={t("Durdur")}><Square className="h-3 w-3" /><span className="hidden sm:inline">{t("Durdur")}</span></button>
            : <button onClick={() => send(input)} disabled={!input.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-200 text-brand-950 transition hover:bg-brand-300 disabled:bg-ink-200" aria-label={t("Gönder")}><ArrowUp className="h-4 w-4" /></button>}
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

/** Taslakta tekrar eden kalıplar varsa uyarı ve tek tıkla düzeltme */
function RepetitionNote({ text, busy, onReduce }: { text: string; busy: boolean; onReduce: (text: string) => void }) {
  const { t } = useT();
  const r = useMemo(() => analyzeRepetition(text, { minCount: 3 }), [text]);
  if (!isRepetitive(r)) return null;
  const example = r.openers[0] ? `${r.openers[0].opener}…` : r.phrases[0]?.phrase ?? "";
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-amber-100 bg-amber-50/70 px-3.5 py-2 text-[12.5px] text-amber-800">
      <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1">{r.nearDuplicates.length >= 2 ? t("Bu taslakta birbirine çok benzeyen cümleler var.") : t("Bu taslakta tekrar eden ifadeler var (ör. “{e}”).", { e: example })}</span>
      <button disabled={busy} onClick={() => onReduce(text)} className="rounded-lg border border-amber-200 bg-white px-2.5 py-1 font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50">{t("Tekrarları azalt")}</button>
    </div>
  );
}

function AssistantBubble({ msg, streaming, onInsert, onUpdateDraft, onReduce, busy, onPermission }: { msg: Msg; streaming: boolean; onInsert: Props["onInsert"]; onUpdateDraft: () => void; onReduce: (text: string) => void; busy: boolean; onPermission: (choice: "skip" | "once" | "always") => void }) {
  const { t } = useT();
  const toast = useToast();
  if (msg.error) return <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-[13.5px] text-rose-700"><TriangleAlert className="mr-1.5 inline h-4 w-4" />{msg.content}</div>;
  const research = (msg.status?.length || msg.added?.length || msg.phase) ? (
    <div className="space-y-1.5 rounded-2xl border border-ink-100 bg-ink-50/70 px-3.5 py-2.5 text-[12.5px] text-ink-600">
      {streaming && <PhaseSteps phase={msg.phase} seen={msg.phasesSeen} />}
      {msg.status?.map((st, i) => (
        <p key={i} className="flex items-start gap-2">
          {streaming && !msg.content && i === (msg.status?.length ?? 0) - 1 && !msg.added ? <Loader2 className="mt-0.5 h-3.5 w-3.5 shrink-0 animate-spin text-brand-500" /> : <SearchCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />}
          <span className="min-w-0 break-words">{st}</span>
        </p>
      ))}
      {msg.added && msg.added.length > 0 && <AddedList items={msg.added} title={t("{n} kaynak projeye eklendi (Kaynaklar sekmesinden çıkarabilirsiniz):", { n: msg.added.length })} />}
    </div>
  ) : null;
  // D149: “her seferinde sor” modunda tarama izni
  if (msg.permission) return (
    <div className="w-full max-w-[96%] space-y-2.5">
      {research}
      <div className="rounded-xl border border-ink-200/80 bg-white p-3.5">
        <p className="text-[13.5px] font-medium text-ink-900">{t("Akademik veri tabanlarında arama yapılsın mı?")}</p>
        {msg.permission.queries.length > 0 && <ul className="mt-1.5 space-y-0.5 text-[12.5px] text-ink-500">{msg.permission.queries.map((q) => <li key={q} className="flex items-center gap-1.5"><SearchCheck className="h-3.5 w-3.5 shrink-0 text-ink-400" /><span className="truncate">{q}</span></li>)}</ul>}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button disabled={busy} onClick={() => onPermission("skip")} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-600 hover:bg-ink-100">{t("Atla")}</button>
          <button disabled={busy} onClick={() => onPermission("always")} className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-ink-700 hover:bg-ink-100">{t("Her zaman izin ver")}</button>
          <button disabled={busy} onClick={() => onPermission("once")} className="rounded-lg bg-brand-200 px-3 py-1.5 text-[13px] font-medium text-brand-950 hover:bg-brand-300">{t("Bu sefer izin ver")}</button>
        </div>
      </div>
    </div>
  );
  if (!msg.content && streaming) return <div className="w-full max-w-[96%] space-y-2.5">{research}<div className="inline-block rounded-2xl rounded-bl-md border border-ink-100 bg-white px-4 py-3"><Dots /></div></div>;
  const parsed = parseAnswer(msg.content);
  const hasDraft = parsed.parts.some((p) => p.kind === "draft");
  return (
    <div className="w-full max-w-full space-y-2.5 sm:max-w-[96%]">
      <div className="flex items-center gap-1.5 text-[11px] font-medium text-ink-400"><Sparkles className="h-3 w-3 text-brand-500" /> {t("Akademik asistan")}</div>
      {research}
      {parsed.parts.map((p, i) =>
        p.kind === "text" ? (
          <div key={i} className="px-0.5 py-1 text-[14.5px] leading-relaxed text-ink-800"><Markdown text={p.text} sourceMap={msg.sourceMap} /></div>
        ) : (
          <div key={i} className="overflow-hidden rounded-xl border border-ink-200/80 bg-white">
            <div className="flex items-center justify-between gap-2 border-b border-brand-100 bg-brand-50/70 px-3.5 py-2">
              <span className="text-[12px] font-semibold text-brand-700">{t("Taslak metin")}</span>
              {(p.complete || !streaming) && <button onClick={() => { navigator.clipboard.writeText(p.text); toast({ tone: "success", title: t("Kopyalandı") }); }} className="rounded-lg p-1.5 text-ink-500 hover:bg-white" title={t("Kopyala")} aria-label={t("Kopyala")}><ClipboardCopy className="h-3.5 w-3.5" /></button>}
            </div>
            <div className="max-h-[50vh] overflow-y-auto px-4 py-3 text-ink-800 sm:max-h-[420px]"><Markdown text={p.text} sourceMap={msg.sourceMap} serif /></div>
            {(p.complete || !streaming) && <RepetitionNote text={p.text} busy={busy} onReduce={onReduce} />}
            {(p.complete || !streaming) && (
              <div className="flex flex-wrap justify-end gap-1.5 border-t border-brand-100 bg-brand-50/40 px-2.5 py-2">
                <button onClick={() => onInsert(p.text, msg.sourceMap, "replace")} className="flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 hover:border-ink-300 sm:h-8 sm:text-[12px]" title={t("Seçili metnin yerine koy")}><Replace className="h-3.5 w-3.5" /> {t("Seçimin yerine")}</button>
                <button onClick={() => onInsert(p.text, msg.sourceMap, "append")} className="flex h-9 items-center gap-1.5 rounded-xl bg-brand-200 px-3 text-[13px] font-medium text-brand-950 hover:bg-brand-300 sm:h-8 sm:text-[12px]"><FilePlus2 className="h-3.5 w-3.5" /> {t("Belgeye ekle")}</button>
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
