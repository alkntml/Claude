"use client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import {
  ArrowLeft, BookMarked, Bot, Brain, Check, ChevronDown, CloudCheck, CloudOff, Download, FileCheck2, GripVertical, History, ListTree, Loader2, MessageSquare, MoreHorizontal, PenSquare, Plus, Settings2, Trash2, Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Modal, ProgressRing, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { CitationEngine, STYLES, STYLE_IDS } from "@/lib/citations/styles";
import type { CitationStyleId } from "@/lib/citations/types";
import { api } from "@/lib/client";
import { citedIdsInOrder, docToPlain, markdownToDoc, wordCount, type JSONNode } from "@/lib/editor/doc";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { customStageDef, LEVEL_LABELS, STAGE_LIBRARY, stageDef, WORK_TYPES, type AcademicLevel } from "@/lib/workflows";
import { AssistantPanel } from "./assistant";
import { CitationContext } from "./citation-context";
import { AcademicEditor, Toolbar, useAcademicEditor } from "./editor";
import { BibliographyView, CommentsPanel, HistoryPanel, MemoryPanel } from "./panels";
import { ProjectSources, ResearchModal } from "./sources";
import { ShareButton } from "./share-modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
type SaveState = "saved" | "dirty" | "saving" | "error";
type RightTab = "assistant" | "sources" | "memory" | "comments" | "history";

const STATUS = [
  { id: "not_started", label: "Başlanmadı", dot: "bg-ink-200" },
  { id: "in_progress", label: "Devam ediyor", dot: "bg-brand-500" },
  { id: "review", label: "İncelemede", dot: "bg-amber-400" },
  { id: "done", label: "Tamamlandı", dot: "bg-emerald-500" },
] as const;

interface Props { project: any; stages: any[]; sources: any[]; memory: any[]; files: any[]; initialStageId?: string | null }

export function Workspace(props: Props) {
  const { t } = useT();
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState(props.project);
  const [stages, setStages] = useState<any[]>(props.stages);
  const [sources, setSources] = useState<any[]>(props.sources);
  const [memory, setMemory] = useState<any[]>(props.memory);
  const [files, setFiles] = useState<any[]>(props.files);
  const [activeId, setActiveId] = useState<string>(props.initialStageId && props.stages.some((s) => s.id === props.initialStageId) ? props.initialStageId : (props.stages.find((s) => s.status !== "done") ?? props.stages[0])?.id);
  const [selection, setSelection] = useState("");
  const [save, setSave] = useState<SaveState>("saved");
  const [tab, setTab] = useState<RightTab>("assistant");
  const [mobilePane, setMobilePane] = useState<"nav" | "editor" | "panel">("editor");
  const [research, setResearch] = useState<{ open: boolean; prefill: string }>({ open: false, prefill: "" });
  const [addStage, setAddStage] = useState(false);
  const [settings, setSettings] = useState(false);
  const [footnote, setFootnote] = useState<string | null>(null);
  const [histVer, setHistVer] = useState(0);
  const [progress, setProgress] = useState<number>(props.project.progress);

  const active = stages.find((s) => s.id === activeId) ?? null;
  const activeIndex = stages.findIndex((s) => s.id === activeId);
  const def = active ? stageDef(active.key) ?? customStageDef(active.key, active.title, active.description) : undefined;
  const isBibliography = def?.generated === "bibliography";

  // --- Atıf motoru (stil değişince tüm metin anında yeni stile döner)
  const citedOrder = useMemo(() => citedIdsInOrder(stages.map((s) => s.content as JSONNode)), [stages]);
  const engine = useMemo(
    () => new CitationEngine(project.citation_style as CitationStyleId, sources.map(sourceRowToItemClient), { locale: project.language === "en" ? "en" : "tr", citedOrder }),
    [project.citation_style, project.language, sources, citedOrder],
  );
  const sourceIndex = useMemo(() => Object.fromEntries(sources.map((s) => [s.id, s])), [sources]);
  const citeCtx = useMemo(() => ({ engine, sources: sourceIndex, onOpenSource: (id: string) => { setTab("sources"); setTimeout(() => document.getElementById(`src-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120); } }), [engine, sourceIndex]);

  // --- Otomatik kayıt
  const pending = useRef<{ id: string; doc: JSONNode } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (snapshot?: { note: string; author: "user" | "ai" }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const p = pending.current;
    if (!p && !snapshot) return;
    const target = p ?? { id: activeId, doc: (editorRef.current?.getJSON() as JSONNode | undefined) ?? stages.find((s) => s.id === activeId)?.content };
    pending.current = null;
    setSave("saving");
    try {
      const r = await api<{ stage: any; progress: number }>(`/api/stages/${target.id}`, { method: "PATCH", json: { content: target.doc, ...(snapshot ? { snapshot } : {}) } });
      // Yerel içerik korunur (kayıt sürerken yazılanlar kaybolmaz); yalnızca sunucu meta verisi alınır
      setStages((l) => l.map((s) => (s.id === r.stage.id ? { ...s, status: r.stage.status, word_count: r.stage.word_count, updated_at: r.stage.updated_at, ...(pending.current?.id === s.id ? {} : { content: r.stage.content, content_text: r.stage.content_text }) } : s)));
      setProgress(r.progress);
      setSave(pending.current ? "dirty" : "saved");
      if (snapshot) setHistVer((v) => v + 1);
    } catch (e) {
      pending.current = pending.current ?? target;
      setSave("error");
      toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message });
    }
  }, [activeId, stages, toast, t]);

  const editorRef = useRef<Editor | null>(null);
  const flushRef = useRef(flush);
  flushRef.current = flush;

  const editor = useAcademicEditor({
    content: active?.content ?? null,
    placeholder: def ? t("{title} bölümünü yazmaya başlayın veya asistandan yardım isteyin…", { title: active?.title ?? t(def.title) }) : t("Yazmaya başlayın…"),
    onSelection: setSelection,
    onUpdate: (doc) => {
      if (!activeId) return;
      pending.current = { id: activeId, doc };
      setSave("dirty");
      if (stateTimer.current) clearTimeout(stateTimer.current);
      stateTimer.current = setTimeout(() => {
        const text = docToPlain(doc);
        setStages((l) => l.map((s) => (s.id === activeId ? { ...s, content: doc, content_text: text, word_count: wordCount(text) } : s)));
      }, 350);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => flushRef.current(), 1500);
    },
  });

  editorRef.current = editor;

  // Sekme kapanırken kaydedilmemiş değişiklik uyarısı
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => { if (pending.current) { e.preventDefault(); flushRef.current(); } };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);

  async function selectStage(id: string) {
    if (id === activeId) return;
    if (stateTimer.current) clearTimeout(stateTimer.current);
    if (pending.current && editor) {
      const doc = editor.getJSON() as JSONNode;
      const text = docToPlain(doc);
      setStages((l) => l.map((s) => (s.id === activeId ? { ...s, content: doc, content_text: text, word_count: wordCount(text) } : s)));
    }
    await flush();
    const next = stages.find((s) => s.id === id);
    setActiveId(id);
    setSelection("");
    editor?.commands.setContent((next?.content as object) ?? { type: "doc", content: [{ type: "paragraph" }] }, false);
    setMobilePane("editor");
    router.replace(`/proje/${project.id}?bolum=${id}`, { scroll: false });
  }

  // --- Asistan çıktısını belgeye ekle
  const insertMarkdown = useCallback((md: string, map: Record<string, string>, mode: "append" | "replace") => {
    if (!editor || isBibliography) return;
    const doc = markdownToDoc(md, (sid) => (map[sid] && sourceIndex[map[sid]] ? map[sid] : null));
    const { from, to } = editor.state.selection;
    if (mode === "replace" && from !== to) editor.chain().focus().insertContentAt({ from, to }, doc.content ?? []).run();
    else if (mode === "replace") { toast({ tone: "info", title: t("Önce editörde değiştirilecek metni seçin") }); return; }
    else editor.chain().focus("end").insertContent(doc.content ?? []).run();
    pending.current = { id: activeId, doc: editor.getJSON() as JSONNode };
    flush({ note: mode === "replace" ? t("AI: seçili metin değiştirildi") : t("AI: taslak eklendi"), author: "ai" });
    toast({ tone: "success", title: t("Belgeye eklendi"), detail: t("Önceki hâl sürüm geçmişinde saklandı.") });
    setMobilePane("editor");
  }, [activeId, editor, flush, isBibliography, sourceIndex, toast, t]);

  function cite(id: string) {
    if (!editor) return;
    editor.chain().focus().insertContent({ type: "citation", attrs: { ids: [id], locator: null, narrative: false } }).insertContent(" ").run();
  }

  // --- Proje ayarları
  async function patchProject(update: Record<string, unknown>) {
    try {
      const { project: p } = await api<{ project: any }>(`/api/projects/${project.id}`, { method: "PATCH", json: update });
      setProject(p);
      return p;
    } catch (e) {
      toast({ tone: "error", title: t("Güncellenemedi"), detail: (e as Error).message });
    }
  }
  /** Atıf stili iyimser olarak uygulanır: metin anında yeni stile döner, kayıt başarısız olursa geri alınır. */
  async function changeStyle(style: CitationStyleId) {
    const prev = project.citation_style;
    setProject((p: any) => ({ ...p, citation_style: style }));
    const ok = await patchProject({ citationStyle: style });
    if (ok) toast({ tone: "success", title: t("Atıf stili: {style}", { style: t(STYLES[style].label) }), detail: t("Tüm metin içi atıflar ve kaynakça yeni stile dönüştürüldü.") });
    else setProject((p: any) => ({ ...p, citation_style: prev }));
  }

  async function patchStage(id: string, update: Record<string, unknown>) {
    try {
      const r = await api<{ stage: any; progress: number }>(`/api/stages/${id}`, { method: "PATCH", json: update });
      setStages((l) => l.map((s) => (s.id === id ? { ...s, title: r.stage.title, status: r.stage.status } : s)));
      setProgress(r.progress);
    } catch (e) {
      toast({ tone: "error", title: t("Güncellenemedi"), detail: (e as Error).message });
    }
  }

  // --- Sıralama
  const orderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function reorder(next: any[]) {
    setStages(next.map((s, i) => ({ ...s, position: i })));
    if (orderTimer.current) clearTimeout(orderTimer.current);
    orderTimer.current = setTimeout(() => api(`/api/projects/${project.id}/stages`, { method: "PUT", json: { order: next.map((s) => s.id) } }).catch(() => toast({ tone: "error", title: t("Sıralama kaydedilemedi") })), 600);
  }
  async function removeStage(id: string) {
    const st = stages.find((s) => s.id === id);
    if (!st || !confirm(t("“{title}” bölümü ve içeriği silinsin mi? Bu işlem geri alınamaz.", { title: st.title }))) return;
    await api(`/api/stages/${id}`, { method: "DELETE" });
    const rest = stages.filter((s) => s.id !== id);
    setStages(rest);
    if (id === activeId && rest[0]) { setActiveId(rest[0].id); editor?.commands.setContent((rest[0].content as object) ?? { type: "doc", content: [{ type: "paragraph" }] }, false); }
  }

  async function exportAs(format: string) {
    await flush();
    try {
      const res = await fetch(`/api/projects/${project.id}/export?format=${format}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? t("Dışa aktarılamadı"));
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1]) ?? `calisma.${format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      toast({ tone: "error", title: t("Dışa aktarma başarısız"), detail: (e as Error).message });
    }
  }

  // Yeni kaynakları ekler, mevcutları günceller (ör. tam metni okunan kaynak)
  const addSources = useCallback((rows: any[]) => setSources((l) => [...l.map((x) => rows.find((r) => r.id === x.id) ?? x), ...rows.filter((r) => !l.some((x) => x.id === r.id))]), []);

  /** Kaynakçadan atfın geçtiği yere git: bölümü aç, atfı ekrana kaydır ve vurgula */
  async function jumpToCitation(stageId: string, sourceId: string, occurrence: number) {
    await selectStage(stageId);
    setTimeout(() => {
      const nodes = [...document.querySelectorAll<HTMLElement>(".ProseMirror .citation-node")].filter((el) => (el.dataset.ids ?? "").split(",").includes(sourceId));
      const el = nodes[occurrence] ?? nodes[0];
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("flash");
      void el.offsetWidth;
      el.classList.add("flash");
    }, 350);
  }
  const existingDois = useMemo(() => new Set(sources.map((s) => s.doi).filter(Boolean)), [sources]);
  const wt = WORK_TYPES.find((w) => w.id === project.work_type);
  const chapterNumber = stages.filter((s, i) => i <= activeIndex && (s.content_text ?? "").trim() && s.key !== "references").length || activeIndex + 1;

  const Nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
        <div className="relative flex items-center justify-center"><ProgressRing value={progress} size={40} /><span className="absolute text-[10px] font-semibold">{progress}%</span></div>
        <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">{t("Yol haritası")}</p><p className="truncate text-[13px] text-ink-600">{t(wt?.title ?? "")} · {t(LEVEL_LABELS[project.academic_level as AcademicLevel])}</p></div>
      </div>
      <Reorder.Group axis="y" values={stages} onReorder={reorder} className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {stages.map((s, i) => {
          const st = STATUS.find((x) => x.id === s.status) ?? STATUS[0];
          const sel = s.id === activeId;
          return (
            <Reorder.Item key={s.id} value={s} className={cn("group relative flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2.5 transition-colors lg:py-2", sel ? "bg-white shadow-sm ring-1 ring-ink-100" : "hover:bg-white/70")} onClick={() => selectStage(s.id)} whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px -10px rgb(21 24 41 / 0.25)" }}>
              <GripVertical className="hidden h-3.5 w-3.5 shrink-0 cursor-grab text-ink-200 opacity-0 transition group-hover:opacity-100 lg:block" />
              <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold lg:h-6 lg:w-6 lg:text-[10.5px]", s.status === "done" ? "bg-emerald-500 text-white" : sel ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-500")}>{s.status === "done" ? <Check className="h-3 w-3" /> : i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[14px] leading-tight lg:text-[13px]", sel ? "font-semibold text-ink-900" : "text-ink-700")}>{s.title}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-ink-400"><span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />{s.word_count ? t("{n} kelime", { n: s.word_count }) : t(st.label)}</span>
              </span>
              <button onClick={(e) => { e.stopPropagation(); removeStage(s.id); }} className="rounded-md p-1.5 text-ink-300 transition hover:bg-rose-50 hover:text-rose-500 lg:opacity-0 lg:group-hover:opacity-100" aria-label={t("Bölümü sil")}><Trash2 className="h-3.5 w-3.5" /></button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <div className="border-t border-ink-100 p-2"><button onClick={() => setAddStage(true)} className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-medium text-ink-500 transition hover:bg-white hover:text-ink-900"><Plus className="h-4 w-4" /> {t("Bölüm ekle")}</button></div>
    </div>
  );

  const isMore = tab === "memory" || tab === "comments" || tab === "history";
  const go = (pane: "nav" | "editor" | "panel", t2?: RightTab) => { setMobilePane(pane); if (t2) setTab(t2); };
  const MOBILE_NAV: { key: string; label: string; icon: React.ReactNode; active: boolean; onClick: () => void; badge?: number }[] = [
    { key: "nav", label: t("Bölümler"), icon: <ListTree className="h-5 w-5" />, active: mobilePane === "nav", onClick: () => go("nav") },
    { key: "editor", label: t("Metin"), icon: <PenSquare className="h-5 w-5" />, active: mobilePane === "editor", onClick: () => go("editor") },
    { key: "assistant", label: t("Asistan"), icon: <Bot className="h-5 w-5" />, active: mobilePane === "panel" && tab === "assistant", onClick: () => go("panel", "assistant") },
    { key: "sources", label: t("Kaynaklar"), icon: <BookMarked className="h-5 w-5" />, active: mobilePane === "panel" && tab === "sources", onClick: () => go("panel", "sources"), badge: sources.length },
    { key: "more", label: t("Diğer"), icon: <MoreHorizontal className="h-5 w-5" />, active: mobilePane === "panel" && isMore, onClick: () => go("panel", isMore ? tab : "memory") },
  ];

  return (
    <CitationContext.Provider value={citeCtx}>
      <div className="flex h-[100dvh] flex-col bg-[rgb(var(--bg))]">
        {/* Üst çubuk */}
        <header className="flex h-14 shrink-0 items-center gap-1.5 border-b border-ink-100 bg-white/85 px-2 backdrop-blur sm:gap-2 sm:px-4" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <Link href="/panel" className="rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900" aria-label={t("Panele dön")}><ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" /></Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink-900 sm:text-[14.5px]">{mobilePane !== "nav" && active ? <span className="lg:hidden">{active.title}</span> : null}<span className={mobilePane !== "nav" && active ? "hidden lg:inline" : ""}>{project.title}</span></p>
            <SaveIndicator state={save} />
          </div>
          <select aria-label={t("Atıf stili")} value={project.citation_style} onChange={(e) => changeStyle(e.target.value as CitationStyleId)} className="hidden h-9 rounded-xl border border-ink-200 bg-white px-2.5 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 md:block">
            {STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}
          </select>
          <Link href={`/proje/${project.id}/kalite`} onClick={() => flush()} className="hidden h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 lg:flex"><FileCheck2 className="h-4 w-4 text-emerald-600" /> {t("Kalite kontrol")}</Link>
          <ShareButton projectId={project.id} />
          <ExportMenu onExport={exportAs} />
          <MobileMenu projectId={project.id} style={project.citation_style} onStyle={changeStyle} onQuality={() => flush()} onSettings={() => setSettings(true)} />
          <button onClick={() => setSettings(true)} className="hidden rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 md:block" aria-label={t("Proje ayarları")}><Settings2 className="h-4 w-4" /></button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[264px_minmax(0,1fr)_420px] xl:grid-cols-[280px_minmax(0,1fr)_460px]">
          <aside className={cn("min-h-0 border-r border-ink-100 bg-ink-50/50", mobilePane === "nav" ? "block" : "hidden lg:block")}>{Nav}</aside>

          <section className={cn("min-h-0 overflow-y-auto", mobilePane === "editor" ? "block" : "hidden lg:block")}>
            {active && (
              <div className="mx-auto max-w-[780px] px-4 pb-10 pt-4 sm:px-10 sm:pt-6">
                {isBibliography ? (
                  <BibliographyView engine={engine} sources={sources} citedOrder={citedOrder} title={engine.meta.bibliographyTitle[project.language === "en" ? "en" : "tr"]} stages={stages} onJump={jumpToCitation} />
                ) : (
                  <>
                    <div className="mb-3 sm:mb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{t("Bölüm {n}", { n: activeIndex + 1 })}</Badge>
                        <StatusPicker value={active.status} onChange={(v) => patchStage(active.id, { status: v })} />
                        <span className="text-xs text-ink-400">{t("{n} kelime", { n: active.word_count ?? 0 })}</span>
                      </div>
                      <input key={active.id} defaultValue={active.title} onBlur={(e) => e.target.value.trim() && e.target.value !== active.title && patchStage(active.id, { title: e.target.value.trim() })} className="mt-2 w-full bg-transparent font-serif text-[24px] font-medium leading-tight tracking-tight text-ink-950 outline-none sm:mt-3 sm:text-[32px]" aria-label={t("Bölüm başlığı")} />
                      {def && <p className="mt-1 line-clamp-2 text-[13px] text-ink-500 sm:mt-1.5 sm:line-clamp-none sm:text-[14px]">{t(def.purpose)}</p>}
                    </div>
                    <div className="sticky top-0 z-20 -mx-4 mb-4 bg-gradient-to-b from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-transparent px-2 pb-2 pt-1 sm:-mx-2 sm:mb-6 sm:pb-3">
                      <Toolbar editor={editor} onFootnote={() => setFootnote("")} />
                    </div>
                    <AcademicEditor editor={editor} chapter={chapterNumber} />
                  </>
                )}
              </div>
            )}
          </section>

          <aside className={cn("min-h-0 min-w-0 flex-col border-l border-ink-100 bg-white/60", mobilePane === "panel" ? "flex" : "hidden lg:flex")}>
            <div className={cn("border-b border-ink-100 p-2 sm:p-2.5", !isMore && "hidden lg:block")}>
              <div className="hidden lg:block">
                <Tabs compact value={tab} onChange={setTab} tabs={[
                  { id: "assistant", label: t("Asistan"), icon: <Bot className="h-3.5 w-3.5" /> },
                  { id: "sources", label: t("Kaynaklar"), icon: <BookMarked className="h-3.5 w-3.5" />, count: sources.length },
                  { id: "memory", label: t("Hafıza"), icon: <Brain className="h-3.5 w-3.5" /> },
                  { id: "comments", label: t("Yorum"), icon: <MessageSquare className="h-3.5 w-3.5" /> },
                  { id: "history", label: t("Geçmiş"), icon: <History className="h-3.5 w-3.5" /> },
                ]} />
              </div>
              <div className="lg:hidden">
                <Tabs value={tab} onChange={setTab} tabs={[
                  { id: "memory", label: t("Hafıza"), icon: <Brain className="h-3.5 w-3.5" /> },
                  { id: "comments", label: t("Yorum"), icon: <MessageSquare className="h-3.5 w-3.5" /> },
                  { id: "history", label: t("Geçmiş"), icon: <History className="h-3.5 w-3.5" /> },
                ]} />
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div key={tab} className="h-full" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  {tab === "assistant" && <AssistantPanel projectId={project.id} stage={active ? { id: active.id, key: active.key, title: active.title } : null} def={def} selection={selection} files={files} onInsert={insertMarkdown} onOpenResearch={(prefill) => setResearch({ open: true, prefill: prefill || (active ? `${project.topic || project.title} — ${active.title}` : "") })} onMemoryChanged={() => api<{ memory: any[] }>(`/api/projects/${project.id}/memory`).then((r) => setMemory(r.memory)).catch(() => {})} onSourcesAdded={addSources} />}
                  {tab === "sources" && <ProjectSources projectId={project.id} sources={sources} setSources={setSources} onCite={(id) => { cite(id); setMobilePane("editor"); }} canCite={!!editor && !isBibliography} />}
                  {tab === "memory" && <MemoryPanel projectId={project.id} memory={memory} setMemory={setMemory} />}
                  {tab === "comments" && active && <CommentsPanel stageId={active.id} selection={selection} />}
                  {tab === "history" && active && <HistoryPanel stageId={active.id} version={histVer} onSnapshot={() => flush({ note: t("Elle kaydedilen sürüm"), author: "user" })} onRestore={(st) => { setStages((l) => l.map((s) => (s.id === st.id ? st : s))); editor?.commands.setContent(st.content ?? { type: "doc", content: [{ type: "paragraph" }] }, false); }} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        </div>

        {/* Mobil alt gezinme */}
        <nav className="grid shrink-0 grid-cols-5 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} aria-label={t("Çalışma alanı gezinmesi")}>
          {MOBILE_NAV.map((n) => (
            <button key={n.key} onClick={n.onClick} aria-current={n.active ? "page" : undefined} className={cn("relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px] font-medium transition-colors", n.active ? "text-brand-700" : "text-ink-400")}>
              {n.active && <motion.span layoutId="mnav" className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand-600" />}
              <span className="relative">{n.icon}{n.badge ? <span className="absolute -right-2.5 -top-1.5 rounded-full bg-brand-600 px-1 text-[9px] font-semibold leading-4 text-white">{n.badge}</span> : null}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      <ResearchModal key={research.open ? "open" : "closed"} open={research.open} onClose={() => setResearch({ open: false, prefill: "" })} projectId={project.id} stageId={active?.id ?? null} prefill={research.prefill} existing={existingDois} onAdded={(rows) => { setSources((l) => [...l, ...rows]); setTab("sources"); }} />
      <AddStageModal open={addStage} onClose={() => setAddStage(false)} existing={new Set(stages.map((s) => s.key))} projectId={project.id} afterPosition={activeIndex} onAdded={(st) => { setStages((l) => { const n = [...l]; n.splice(activeIndex + 1, 0, st); return n.map((x, i) => ({ ...x, position: i })); }); setAddStage(false); }} />
      <SettingsModal open={settings} onClose={() => setSettings(false)} project={project} patch={patchProject} files={files} setFiles={setFiles} onStagesAdded={(rows) => setStages((l) => [...l, ...rows])} />
      <Modal open={footnote !== null} onClose={() => setFootnote(null)} title={t("Dipnot ekle")} footer={<><Button variant="ghost" onClick={() => setFootnote(null)}>{t("Vazgeç")}</Button><Button disabled={!footnote?.trim()} onClick={() => { editor?.chain().focus().insertContent({ type: "footnote", attrs: { text: footnote } }).run(); setFootnote(null); }}>{t("Ekle")}</Button></>}>
        <textarea autoFocus className="input min-h-[120px]" placeholder={t("Dipnot metni…")} value={footnote ?? ""} onChange={(e) => setFootnote(e.target.value)} />
      </Modal>
    </CitationContext.Provider>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const { t } = useT();
  const map = { saved: [CloudCheck, "Tüm değişiklikler kaydedildi", "text-ink-400"], dirty: [Loader2, "Değişiklikler kaydedilecek…", "text-ink-400"], saving: [Loader2, "Kaydediliyor…", "text-brand-600"], error: [CloudOff, "Kaydedilemedi, yeniden denenecek", "text-rose-600"] } as const;
  const [I, label, cls] = map[state];
  return <p className={cn("flex items-center gap-1 truncate text-[11px] sm:text-[11.5px]", cls)}><I className={cn("h-3 w-3 shrink-0", state === "saving" && "animate-spin")} /> <span className="truncate">{t(label)}</span></p>;
}

/** Mobil üst menü: atıf stili, kalite kontrol, paylaşım ve proje ayarları */
function MobileMenu({ projectId, style, onStyle, onQuality, onSettings }: { projectId: string; style: string; onStyle: (s: CitationStyleId) => void; onQuality: () => void; onSettings: () => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-ink-600 transition hover:bg-ink-100" aria-label={t("Daha fazla")}><MoreHorizontal className="h-5 w-5" /></button>
      {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink-950/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-2xl" style={{ paddingBottom: "max(16px, env(safe-area-inset-bottom, 0px))" }} initial={{ y: 320 }} animate={{ y: 0 }} exit={{ y: 320 }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-200" />
              <label className="label" htmlFor="m-style">{t("Atıf stili")}</label>
              <select id="m-style" className="input" value={style} onChange={(e) => { onStyle(e.target.value as CitationStyleId); setOpen(false); }}>
                {STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}
              </select>
              <div className="mt-4 grid gap-2">
                <Link href={`/proje/${projectId}/kalite`} onClick={onQuality} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-[15px] font-medium text-ink-800"><FileCheck2 className="h-5 w-5 text-emerald-600" /> {t("Kalite kontrol")}</Link>
                <ShareButton projectId={projectId} variant="row" />
                <button onClick={() => { setOpen(false); onSettings(); }} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><Settings2 className="h-5 w-5 text-ink-500" /> {t("Proje ayarları")}</button>
                <div className="flex items-center justify-between rounded-2xl border border-ink-100 px-4 py-3 text-[15px] font-medium text-ink-800">{t("Dil")} <LanguageSwitch /></div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>, document.body)}
    </div>
  );
}

function StatusPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const cur = STATUS.find((s) => s.id === value) ?? STATUS[0];
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-xs font-medium text-ink-600 transition hover:border-ink-300"><span className={cn("h-2 w-2 rounded-full", cur.dot)} />{t(cur.label)}<ChevronDown className="h-3 w-3" /></button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute left-0 top-7 z-30 w-44 rounded-xl border border-ink-100 bg-white p-1 shadow-xl">
            {STATUS.map((s) => <button key={s.id} onClick={() => { onChange(s.id); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-ink-50"><span className={cn("h-2 w-2 rounded-full", s.dot)} />{t(s.label)}</button>)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ExportMenu({ onExport }: { onExport: (f: string) => Promise<void> }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const items = [["docx", "Microsoft Word (.docx)"], ["pdf", "PDF"], ["md", "Markdown"], ["txt", t("Düz metin (.txt)")]];
  return (
    <div className="relative">
      <Button size="sm" variant="dark" className="!h-9" onClick={() => setOpen((o) => !o)}><Download className="h-4 w-4" /><span className="hidden sm:inline">{t("Dışa aktar")}</span></Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-11 z-40 w-60 rounded-2xl border border-ink-100 bg-white p-1.5 shadow-2xl">
              {items.map(([f, l]) => <button key={f} onClick={async () => { setBusy(f); await onExport(f); setBusy(null); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13.5px] text-ink-700 transition hover:bg-ink-50">{l}{busy === f && <Loader2 className="h-4 w-4 animate-spin" />}</button>)}
              <p className="px-3 pb-1.5 pt-1 text-[11px] text-ink-400">{t("Kapak, içindekiler, numaralandırma, dipnotlar ve kaynakça eklenir.")}</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddStageModal({ open, onClose, existing, projectId, afterPosition, onAdded }: { open: boolean; onClose: () => void; existing: Set<string>; projectId: string; afterPosition: number; onAdded: (s: any) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const lib = Object.values(STAGE_LIBRARY).filter((s) => !existing.has(s.key));
  async function add(libraryKey?: string, libTitle?: string) {
    setBusy(true);
    try {
      const { stage } = await api<{ stage: any }>(`/api/projects/${projectId}/stages`, { method: "POST", json: { title: libTitle ?? title, libraryKey, afterPosition } });
      onAdded(stage);
      setTitle("");
    } catch (e) { toast({ tone: "error", title: t("Bölüm eklenemedi"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title={t("Bölüm ekle")}>
      <label className="label">{t("Özel bölüm")}</label>
      <div className="flex gap-2"><input className="input" placeholder={t("ör. Kısaltmalar listesi")} value={title} onChange={(e) => setTitle(e.target.value)} /><Button onClick={() => add()} loading={busy} disabled={!title.trim()}>{t("Ekle")}</Button></div>
      <p className="mb-2 mt-6 text-sm font-medium text-ink-700">{t("Hazır bölüm şablonları")}</p>
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {lib.map((s) => <button key={s.key} onClick={() => add(s.key, t(s.title))} disabled={busy} className="block w-full rounded-xl border border-ink-100 px-3 py-2 text-left transition hover:border-brand-200 hover:bg-brand-50/40"><span className="block text-sm font-medium text-ink-800">{t(s.title)}</span><span className="block text-xs text-ink-500">{t(s.purpose)}</span></button>)}
      </div>
    </Modal>
  );
}

function SettingsModal({ open, onClose, project, patch, files, setFiles, onStagesAdded }: { open: boolean; onClose: () => void; project: any; patch: (u: Record<string, unknown>) => Promise<any>; files: any[]; setFiles: (fn: (f: any[]) => any[]) => void; onStagesAdded: (rows: any[]) => void }) {
  const { t } = useT();
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState(project.title);
  const [topic, setTopic] = useState(project.topic ?? "");
  const [keywords, setKeywords] = useState((project.keywords ?? []).join(", "));
  const [discipline, setDiscipline] = useState(project.discipline ?? "");
  const [language, setLanguage] = useState(project.language);
  const [uploading, setUploading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestion, setSuggestion] = useState<any | null>(null);
  const guideline = files.find((f) => f.id === project.guideline_file_id);

  async function saveAll() {
    await patch({ title, topic, discipline, language, keywords: keywords.split(",").map((k: string) => k.trim()).filter(Boolean) });
    toast({ tone: "success", title: t("Proje güncellendi") });
    onClose();
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", f); fd.set("projectId", project.id); fd.set("purpose", "guideline");
      const res = await fetch("/api/files", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      setFiles((l) => [j.file, ...l]);
      await patch({});
      router.refresh();
      toast({ tone: "success", title: t("Kılavuz yüklendi"), detail: t("Asistan artık kılavuzdaki kuralları dikkate alır.") });
    } catch (err) { toast({ tone: "error", title: t("Yüklenemedi"), detail: (err as Error).message }); } finally { setUploading(false); }
  }
  async function suggest() {
    setSuggesting(true);
    try { setSuggestion((await api<{ suggestion: any }>(`/api/projects/${project.id}/stages/suggest`, { method: "POST" })).suggestion); }
    catch (e) { toast({ tone: "error", title: t("Analiz yapılamadı"), detail: (e as Error).message }); } finally { setSuggesting(false); }
  }
  async function applySuggestion() {
    const added: any[] = [];
    for (const s of suggestion.stages) {
      try {
        const { stage } = await api<{ stage: any }>(`/api/projects/${project.id}/stages`, { method: "POST", json: { title: s.title, description: s.description, libraryKey: s.libraryKey !== "custom" ? s.libraryKey : undefined } });
        added.push(stage);
      } catch { /* aynı anahtar varsa atla */ }
    }
    const f = suggestion.formatting;
    await patch({ context: { format: { fontFamily: f.fontFamily, fontSizePt: f.fontSizePt, lineSpacing: f.lineSpacing } }, ...(STYLE_IDS.includes(f.citationStyle) ? { citationStyle: f.citationStyle } : {}) });
    onStagesAdded(added);
    toast({ tone: "success", title: t("Kılavuz uygulandı"), detail: t("{n} bölüm eklendi; biçim kuralları dışa aktarmada kullanılacak. Gereksiz bölümleri silebilir, sırayı değiştirebilirsiniz.", { n: added.length }) });
    setSuggestion(null);
  }
  async function setStatus(status: string) {
    await patch({ status });
    toast({ tone: "success", title: status === "completed" ? t("Çalışma tamamlandı olarak işaretlendi") : t("Çalışma arşivlendi") });
  }
  async function del() {
    if (prompt(t("Silmek için proje başlığını yazın: {title}", { title: project.title })) !== project.title) return;
    await api(`/api/projects/${project.id}`, { method: "DELETE" });
    router.push("/panel");
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Proje ayarları")} wide footer={<><Button variant="ghost" onClick={onClose}>{t("Kapat")}</Button><Button onClick={saveAll}>{t("Kaydet")}</Button></>}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div><label className="label">{t("Başlık")}</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className="label">{t("Araştırma konusu")}</label><textarea className="input min-h-[90px]" value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
          <div><label className="label">{t("Anahtar kelimeler")}</label><input className="input" value={keywords} onChange={(e) => setKeywords(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">{t("Disiplin")}</label><input className="input" value={discipline} onChange={(e) => setDiscipline(e.target.value)} /></div>
            <div><label className="label">{t("Dil")}</label><select className="input" value={language} onChange={(e) => setLanguage(e.target.value)}><option value="tr">{t("Türkçe")}</option><option value="en">{t("İngilizce")}</option></select></div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-ink-100 p-4">
            <p className="font-medium text-ink-900">{t("Üniversite / dergi yazım kılavuzu")}</p>
            <p className="mt-1 text-[13px] text-ink-500">{t("Kılavuzu (PDF/DOCX) yükleyin. Asistan bölüm yapısını ve biçim kurallarını kılavuza göre önersin.")}</p>
            {guideline && <p className="mt-2 text-[13px] text-emerald-700">✓ {guideline.name}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 hover:bg-ink-50">{uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} {t("Kılavuz yükle")}<input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={upload} /></label>
              {project.guideline_file_id && <Button size="sm" variant="soft" loading={suggesting} onClick={suggest}>{t("Bölüm yapısı öner")}</Button>}
            </div>
            {suggestion && (
              <div className="mt-4 space-y-2 rounded-xl bg-ink-50 p-3 text-[13px]">
                <p className="font-medium">{t("Önerilen bölümler")}</p>
                <ol className="list-decimal pl-5 text-ink-600">{suggestion.stages.map((s: any) => <li key={s.title}>{s.title}</li>)}</ol>
                <p className="text-ink-600">{t("Biçim: {font}, {size} punto, {spacing} satır aralığı, {style}", { font: suggestion.formatting.fontFamily, size: suggestion.formatting.fontSizePt, spacing: suggestion.formatting.lineSpacing, style: suggestion.formatting.citationStyle })}</p>
                {suggestion.notes?.map((n: string) => <p key={n} className="text-ink-500">• {n}</p>)}
                <Button size="sm" onClick={applySuggestion}>{t("Öneriyi uygula")}</Button>
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-ink-100 p-4">
            <p className="font-medium text-ink-900">{t("Proje durumu")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.status !== "completed" ? <Button size="sm" variant="soft" onClick={() => setStatus("completed")}>{t("Tamamlandı olarak işaretle")}</Button> : <Button size="sm" variant="secondary" onClick={() => setStatus("active")}>{t("Yeniden etkinleştir")}</Button>}
              <Button size="sm" variant="ghost" onClick={() => setStatus("archived")}><MoreHorizontal className="h-3.5 w-3.5" /> {t("Arşivle")}</Button>
              <Button size="sm" variant="danger" onClick={del}><Trash2 className="h-3.5 w-3.5" /> {t("Projeyi sil")}</Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
