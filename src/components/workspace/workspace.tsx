"use client";
import { createInlineSuggest } from "./inline-suggest";
import { captionNodes, formatCaption, maxCaptionNo, noteLabel } from "@/lib/citations/captions";
import { LanguageSwitch, useT } from "@/i18n/client";
import { minSourcesFor } from "@/lib/workflows/quick-actions";
import { academicOrder, chapterGroup, sameHeading, stagePrefixes, subheadingBudget } from "@/lib/workflows/structure";
import { addSiblingAfter, addSubheadings, insertImported, maxSectionLevel, removeSection, renameSection, replaceSectionBody, sectionDoc, sectionTree, type SectionInfo } from "@/lib/editor/sections";
import { SubheadingModal, type SubheadingParent } from "./subheadings";
import type { ImportResult } from "./import-doc";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { Compass,
  ArrowLeft, BookMarked, Bot, Brain, Check, ChevronDown, CloudCheck, CloudOff, Download, FileCheck2, GripVertical, History, ListTree, Loader2, Wand2, HelpCircle, GraduationCap, ExternalLink, MessageSquare, MoreHorizontal, PenSquare, Plus, Settings2, Trash2, Upload,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
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
import { api, handlePlanError, openUpgrade, setCurrentProject } from "@/lib/client";
import { FEATURE_MIN_PLAN, hasFeature } from "@/lib/features";
import { citedIdsInOrder, docToPlain, findPlaceholderBlocks, markdownToDoc, replaceBlockByText, wordCount, type JSONNode } from "@/lib/editor/doc";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { customStageDef, LEVEL_LABELS, STAGE_LIBRARY, stageDef, WORK_TYPES, type AcademicLevel } from "@/lib/workflows";
import { AssistantPanel } from "./assistant";
import { CitationContext } from "./citation-context";
import { AcademicEditor, Toolbar, useAcademicEditor } from "./editor";
import { BibliographyView, CommentsPanel, HistoryPanel, MemoryPanel } from "./panels";
import { ProjectSources, ResearchModal } from "./sources";
import { ShareButton } from "./share-modal";
import { Avatar, CoauthorsButton, type PresencePerson } from "./coauthors";
import { PRESENCE_INTERVAL_MS } from "@/lib/coauthors";
import { ClientApiError } from "@/lib/client";



import { GoalModal, GoalWidget } from "./goals";
import { shouldShowTour, Tour } from "./tour";





import { TOOL_FEATURE, ToolsMenu, type ToolId } from "./tools-menu";
import { SelectionBubble } from "./selection-bubble";
import { ASSISTANT_ACTIONS } from "@/lib/ai/prompts";
import type { LanguageTab } from "./language-modal";


import { completion, nextStage, shouldWaitFor, WRITE_LAST } from "@/lib/workflows/order";

// Açılır pencereler yalnızca gerektiğinde yüklenir (çalışma alanının ilk açılışı hızlansın)
const FixClaimsModal = dynamic(() => import("./fix-claims").then((m) => m.FixClaimsModal), { ssr: false });
const FormatModal = dynamic(() => import("./format-modal").then((m) => m.FormatModal), { ssr: false });
const AnalysisModal = dynamic(() => import("./analysis-modal").then((m) => m.AnalysisModal), { ssr: false });
const JournalModal = dynamic(() => import("./journal-modal").then((m) => m.JournalModal), { ssr: false });
const ChartModal = dynamic(() => import("./chart-modal").then((m) => m.ChartModal), { ssr: false });
const DefenseModal = dynamic(() => import("./defense-modal").then((m) => m.DefenseModal), { ssr: false });
const ReviewerModal = dynamic(() => import("./reviewer-modal").then((m) => m.ReviewerModal), { ssr: false });
const BlueprintScreen = dynamic(() => import("./blueprint").then((m) => m.BlueprintScreen), { ssr: false });
const TitleChooser = dynamic(() => import("./title-chooser").then((m) => m.TitleChooser), { ssr: false });
const ImportDocModal = dynamic(() => import("./import-doc").then((m) => m.ImportDocModal), { ssr: false });
const StageReviewModal = dynamic(() => import("./stage-review").then((m) => m.StageReviewModal), { ssr: false });
const ConsensusTool = dynamic(() => import("@/components/tools/consensus").then((m) => m.ConsensusTool), { ssr: false });
const LanguageModal = dynamic(() => import("./language-modal").then((m) => m.LanguageModal), { ssr: false });

/* eslint-disable @typescript-eslint/no-explicit-any */
type SaveState = "saved" | "dirty" | "saving" | "error" | "offline";
type RightTab = "assistant" | "sources" | "memory" | "comments" | "history";

const STATUS = [
  { id: "not_started", label: "Başlanmadı", dot: "bg-ink-200" },
  { id: "in_progress", label: "Devam ediyor", dot: "bg-brand-500" },
  { id: "review", label: "İncelemede", dot: "bg-amber-400" },
  { id: "done", label: "Tamamlandı", dot: "bg-emerald-500" },
] as const;

/** Çevrimdışı güvence: kaydedilmemiş bölüm metni bu cihazda saklanır */
const DRAFT_KEY = (id: string) => `akademi:draft:${id}`;
function saveDraft(id: string, doc: JSONNode) { try { localStorage.setItem(DRAFT_KEY(id), JSON.stringify({ at: Date.now(), doc })); } catch { /* depolama dolu veya kapalı */ } }
function readDraft(id: string): { at: number; doc: JSONNode } | null { try { const v = localStorage.getItem(DRAFT_KEY(id)); return v ? JSON.parse(v) : null; } catch { return null; } }
function clearDraft(id: string) { try { localStorage.removeItem(DRAFT_KEY(id)); } catch { /* yok */ } }

interface Props { project: any; stages: any[]; sources: any[]; memory: any[]; files: any[]; initialStageId?: string | null; planId?: string; role?: "owner" | "editor" | "commenter"; collaborative?: boolean }

export function Workspace(props: Props) {
  const { t, dl } = useT();
  const router = useRouter();
  const toast = useToast();
  const [project, setProject] = useState(props.project);
  const [stages, setStages] = useState<any[]>(props.stages);
  const [sources, setSources] = useState<any[]>(props.sources);
  const [memory, setMemory] = useState<any[]>(props.memory);
  const [files, setFiles] = useState<any[]>(props.files);
  const [activeId, setActiveId] = useState<string>(props.initialStageId && props.stages.some((s) => s.id === props.initialStageId) ? props.initialStageId : (nextStage(props.stages) ?? props.stages[0])?.id);
  const [selection, setSelection] = useState("");
  // Ortak yazım (D115): rol, kimler çalışmada, çakışma
  const role = props.role ?? "owner";
  const isOwner = role === "owner";
  const canEdit = role !== "commenter";
  const [collaborative, setCollaborative] = useState(!!props.collaborative);
  const collabRef = useRef(collaborative);
  collabRef.current = collaborative;
  const [present, setPresent] = useState<PresencePerson[]>([]);
  const [conflict, setConflict] = useState<{ stageId: string; mine: JSONNode; theirs: any; by: string } | null>(null);
  const [save, setSave] = useState<SaveState>("saved");
  const [tab, setTab] = useState<RightTab>(props.role === "commenter" ? "comments" : "assistant");
  const [mobilePane, setMobilePane] = useState<"nav" | "editor" | "panel">("editor");
  const [research, setResearch] = useState<{ open: boolean; prefill: string }>({ open: false, prefill: "" });
  const [addStage, setAddStage] = useState(false);
  const [settings, setSettings] = useState(false);
  const [footnote, setFootnote] = useState<string | null>(null);
  const [histVer, setHistVer] = useState(0);
  const [progress, setProgress] = useState<number>(props.project.progress);

  /** Editörde açık olan alt başlık (D83): başlık düğümünün belgedeki sırası; null ise bölümün tamamı */
  const [focus, setFocus] = useState<number | null>(null);
  const focusRef = useRef<number | null>(null);
  focusRef.current = focus;
  /** Odak varken bölümün tam belgesi (editördeki alt başlık metni buna geri yazılır) */
  const baseRef = useRef<JSONNode | null>(null);

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
  const citedSet = useMemo(() => new Set(citedOrder), [citedOrder]);
  const sourceIndex = useMemo(() => Object.fromEntries(sources.map((s) => [s.id, s])), [sources]);
  const citeCtx = useMemo(() => ({ engine, sources: sourceIndex, onOpenSource: (id: string) => { setTab("sources"); setTimeout(() => document.getElementById(`src-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 120); } }), [engine, sourceIndex]);

  // --- Otomatik kayıt
  const pending = useRef<{ id: string; doc: JSONNode } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async (snapshot?: { note: string; author: "user" | "ai" | "system" }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const p = pending.current;
    if (!p && !snapshot) return;
    const target = p ?? { id: activeId, doc: (editorRef.current ? fullDocRef.current() : undefined) ?? stages.find((s) => s.id === activeId)?.content };
    pending.current = null;
    setSave("saving");
    // Ortak yazımda sunucuya “bildiğim son sürüm” gönderilir; arada başkası kaydettiyse 409 döner (D115)
    const baseUpdatedAt = collabRef.current ? (stagesRef.current.find((x: any) => x.id === target.id)?.updated_at as string | undefined) : undefined;
    try {
      const r = await api<{ stage: any; progress: number }>(`/api/stages/${target.id}`, { method: "PATCH", json: { content: target.doc, ...(snapshot ? { snapshot } : {}), ...(baseUpdatedAt ? { baseUpdatedAt } : {}) } });
      // Yerel içerik korunur (kayıt sürerken yazılanlar kaybolmaz); yalnızca sunucu meta verisi alınır
      setStages((l) => l.map((s) => (s.id === r.stage.id ? { ...s, status: r.stage.status, word_count: r.stage.word_count, updated_at: r.stage.updated_at, ...(pending.current?.id === s.id ? {} : { content: r.stage.content, content_text: r.stage.content_text }) } : s)));
      setProgress(r.progress);
      setSave(pending.current ? "dirty" : "saved");
      if ((pending.current as { id: string } | null)?.id !== target.id) clearDraft(target.id);
      if (snapshot) setHistVer((v) => v + 1);
    } catch (e) {
      if (e instanceof ClientApiError && e.code === "stage_conflict" && e.extra?.stage) {
        saveDraft(target.id, target.doc as JSONNode);
        setConflict({ stageId: target.id, mine: target.doc as JSONNode, theirs: e.extra.stage, by: String(e.extra.by ?? "") });
        setSave("dirty");
        return;
      }
      pending.current = pending.current ?? target;
      saveDraft(target.id, target.doc as JSONNode);
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setSave(offline ? "offline" : "error");
      if (!offline) toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message });
    }
  }, [activeId, stages, toast, t]);

  const editorRef = useRef<Editor | null>(null);
  const flushRef = useRef(flush);
  flushRef.current = flush;

  // Satır içi otomatik tamamlama (D113): ayarı tarayıcıda hatırlanır; günlük sınır dolunca o oturumda kapanır
  const [autoSuggest, setAutoSuggest] = useState(true);
  useEffect(() => { try { setAutoSuggest(localStorage.getItem("acd_autosuggest") !== "0"); } catch { /* yok say */ } }, []);
  const suggestCtx = useRef({ projectId: props.project.id, stageTitle: "", focusTitle: null as string | null, on: true, blocked: false });
  const suggestExt = useMemo(() => [createInlineSuggest({
    enabled: () => suggestCtx.current.on && !suggestCtx.current.blocked && !!suggestCtx.current.stageTitle && props.role !== "commenter",
    fetch: async (before, signal) => {
      const c = suggestCtx.current;
      const res = await fetch(`/api/projects/${c.projectId}/complete`, { method: "POST", signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ before, stageTitle: c.stageTitle, focusTitle: c.focusTitle }) });
      if (res.status === 402 || res.status === 429) {
        const j = await res.json().catch(() => ({}));
        if (j?.code !== "rate_limited") { c.blocked = true; toast({ tone: "info", title: t("Otomatik tamamlama bugünlük durdu"), detail: j?.error ? t(j.error) : undefined }); }
        return "";
      }
      if (!res.ok) return "";
      return String((await res.json()).text ?? "");
    },
  })], []); // eslint-disable-line react-hooks/exhaustive-deps
  const editor = useAcademicEditor({
    extensions: suggestExt,
    content: active?.content ?? null,
    placeholder: focus != null && active?.content?.content?.[focus]?.type === "heading"
      ? t("“{title}” alt başlığını yazmaya başlayın veya asistandan yardım isteyin…", { title: docToPlain({ type: "doc", content: active.content.content[focus].content }).trim() })
      : def ? t("{title} bölümünü yazmaya başlayın veya asistandan yardım isteyin…", { title: active?.title ?? t(def.title) }) : t("Yazmaya başlayın…"),
    onSelection: setSelection,
    onUpdate: (edited) => {
      if (!activeId) return;
      const doc = mergeFocus(edited);
      pending.current = { id: activeId, doc };
      setSave("dirty");
      if (stateTimer.current) clearTimeout(stateTimer.current);
      stateTimer.current = setTimeout(() => {
        saveDraft(activeId, doc);
        const text = docToPlain(doc);
        setStages((l) => l.map((s) => (s.id === activeId ? { ...s, content: doc, content_text: text, word_count: wordCount(text) } : s)));
      }, 350);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => flushRef.current(), 1500);
    },
  });

  editorRef.current = editor;
  // Bölüm/alt başlık değişince yer tutucu yazı hemen güncellensin (boş işlem görünümü yeniden çizer; metin değişmez)
  useEffect(() => { if (editor && !editor.isDestroyed) editor.view.dispatch(editor.state.tr.setMeta("addToHistory", false)); }, [editor, focus, activeId]);

  /** Odak varsa editördeki alt başlık metnini bölümün tam belgesine geri yazar (D83) */
  function mergeFocus(edited: JSONNode): JSONNode {
    const f = focusRef.current;
    if (f == null || !baseRef.current) return edited;
    const merged = replaceSectionBody(baseRef.current, f, edited.content ?? []);
    baseRef.current = merged;
    return merged;
  }
  /** Etkin bölümün güncel tam belgesi */
  const fullDoc = (): JSONNode => {
    const ed = editorRef.current;
    if (!ed) return (stagesRef.current.find((x: any) => x.id === activeId)?.content as JSONNode) ?? { type: "doc", content: [] };
    return mergeFocus(ed.getJSON() as JSONNode);
  };
  const fullDocRef = useRef(fullDoc);
  fullDocRef.current = fullDoc;
  /** Etkin bölümün tam belgesini değiştirir, editörü (odak varsa yalnızca alt başlığı) yeniler ve kaydeder */
  async function setFullDoc(next: JSONNode, note: string, nextFocus: number | null = focusRef.current) {
    if (!editor) return;
    baseRef.current = next;
    setFocus(nextFocus);
    focusRef.current = nextFocus;
    editor.commands.setContent((nextFocus != null ? sectionDoc(next, nextFocus) : next) as object, { emitUpdate: false });
    const text = docToPlain(next);
    setStages((l) => l.map((x) => (x.id === activeId ? { ...x, content: next, content_text: text, word_count: wordCount(text) } : x)));
    pending.current = { id: activeId, doc: next };
    await flush({ note, author: "user" });
  }

  // Bağlantı geri gelince ve hata sonrası düzenli aralıklarla yeniden kaydet
  // Kilit penceresindeki “mevcut çalışmayı indir” mesajı hangi çalışma olduğunu bilsin (D50)
  useEffect(() => { setCurrentProject({ id: props.project.id, title: props.project.title }); return () => setCurrentProject(null); }, [props.project.id, props.project.title]);
  useEffect(() => {
    const on = () => { if (pending.current) flushRef.current(); else setSave((x) => (x === "offline" ? "saved" : x)); };
    const off = () => setSave((x) => (pending.current ? "offline" : x));
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => {
    if (save !== "error" && save !== "offline") return;
    const iv = setInterval(() => { if (navigator.onLine && pending.current) flushRef.current(); }, 15_000);
    return () => clearInterval(iv);
  }, [save]);

  // Açılışta: sunucudakinden yeni, kaydedilmemiş yerel taslak varsa geri yükle
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current || !editor) return;
    restored.current = true;
    let count = 0;
    for (const st of props.stages) {
      const d = readDraft(st.id);
      if (!d) continue;
      const serverAt = Date.parse(st.updated_at ?? "") || 0;
      if (d.at <= serverAt || JSON.stringify(d.doc) === JSON.stringify(st.content)) { clearDraft(st.id); continue; }
      count++;
      if (st.id === activeId) {
        editor.commands.setContent(d.doc as object, { emitUpdate: false });
        pending.current = { id: st.id, doc: d.doc };
        flushRef.current({ note: t("Cihazda saklanan taslak geri yüklendi"), author: "system" });
      } else {
        api(`/api/stages/${st.id}`, { method: "PATCH", json: { content: d.doc, snapshot: { note: t("Cihazda saklanan taslak geri yüklendi"), author: "system" } } })
          .then(() => { clearDraft(st.id); setStages((l) => l.map((x) => (x.id === st.id ? { ...x, content: d.doc } : x))); })
          .catch(() => {});
      }
    }
    if (count) toast({ tone: "info", title: t("Kaydedilmemiş değişiklikleriniz geri yüklendi"), detail: t("Bağlantı koptuğunda bu cihazda saklanan metin sunucuya kaydedildi.") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Sekme kapanırken kaydedilmemiş değişiklik uyarısı
  useEffect(() => {
    const fn = (e: BeforeUnloadEvent) => { if (pending.current) { e.preventDefault(); flushRef.current(); } };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);

  // --- Ortak yazım (D115): kim nerede + başkasının kaydettiği bölümü yenileme
  const activeIdRef = useRef(activeId);
  activeIdRef.current = activeId;
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => { if (editor && !editor.isDestroyed) editor.setEditable(canEdit); }, [editor, canEdit]);
  /** Sunucudaki (başkasının kaydettiği) bölümü yerel duruma ve açıksa editöre uygular */
  const applyRemote = useCallback((st: any) => {
    setStages((l) => l.map((x) => (x.id === st.id ? { ...x, ...st } : x)));
    if (st.id !== activeIdRef.current || !editorRef.current) return;
    baseRef.current = st.content;
    const f = focusRef.current;
    const valid = f != null && st.content?.content?.[f]?.type === "heading" ? f : null;
    if (valid !== f) { focusRef.current = valid; setFocus(valid); }
    editorRef.current.commands.setContent(((valid != null ? sectionDoc(st.content, valid) : st.content) ?? { type: "doc", content: [{ type: "paragraph" }] }) as object, { emitUpdate: false });
  }, []);
  const presenceTick = useRef<() => void>(() => {});
  useEffect(() => {
    if (!collaborative) { setPresent([]); return; }
    let stop = false;
    const tick = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        const r = await api<{ others: PresencePerson[]; stages: { id: string; updatedAt: string; by: string | null }[] }>(`/api/projects/${project.id}/presence`, { method: "POST", json: { stageId: activeIdRef.current ?? null } });
        if (stop) return;
        setPresent(r.others);
        // Başkasının eklediği bölümler listeye girer, sildiği bölümler (açık değilse) çıkar
        const remoteIds = new Set(r.stages.map((x) => x.id));
        const localIds = new Set(stagesRef.current.map((x: any) => x.id));
        const added = r.stages.filter((x) => !localIds.has(x.id));
        if (added.length) {
          const fresh = await Promise.all(added.map((x) => api<{ stage: any }>(`/api/stages/${x.id}`).then((y) => y.stage).catch(() => null)));
          setStages((l) => [...l, ...fresh.filter(Boolean)].sort((a, b) => a.position - b.position));
        }
        if (stagesRef.current.some((x: any) => !remoteIds.has(x.id) && x.id !== activeIdRef.current)) setStages((l) => l.filter((x) => remoteIds.has(x.id) || x.id === activeIdRef.current));
        for (const x of r.stages) {
          const local = stagesRef.current.find((y: any) => y.id === x.id);
          if (!local || !x.by || Date.parse(x.updatedAt) <= (Date.parse(local.updated_at ?? "") || 0) + 500) continue;
          // Yerelde kaydedilmemiş değişiklik varsa dokunulmaz: kayıtta çakışma penceresi açılır
          if (pending.current?.id === x.id || (x.id === activeIdRef.current && saveRef.current !== "saved")) continue;
          const { stage } = await api<{ stage: any }>(`/api/stages/${x.id}`);
          if (stop) return;
          applyRemote(stage);
          if (x.id === activeIdRef.current) toast({ tone: "info", title: t("{n} bu bölümü güncelledi", { n: x.by }), detail: t("Metin en güncel hâliyle yenilendi.") });
        }
      } catch { /* bağlantı yok: bir sonraki turda denenir */ }
    };
    presenceTick.current = tick;
    tick();
    const iv = setInterval(tick, PRESENCE_INTERVAL_MS);
    const vis = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", vis);
    return () => { stop = true; clearInterval(iv); document.removeEventListener("visibilitychange", vis); presenceTick.current = () => {}; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collaborative, project.id]);
  useEffect(() => { presenceTick.current(); }, [activeId]);

  /** Çakışma: başkasının sürümünü al (sizin metniniz sürüm geçmişine saklanır) */
  async function conflictTakeTheirs() {
    if (!conflict) return;
    try {
      await api(`/api/stages/${conflict.stageId}/revisions`, { method: "POST", json: { content: conflict.mine, note: t("Çakışmada saklanan sizin sürümünüz") } });
      pending.current = null;
      clearDraft(conflict.stageId);
      applyRemote(conflict.theirs);
      setSave("saved");
      setHistVer((v) => v + 1);
      setConflict(null);
      toast({ tone: "success", title: t("Güncel sürüm yüklendi"), detail: t("Sizin metniniz “Geçmiş” sekmesinde saklandı.") });
    } catch (e) { toast({ tone: "error", title: t("İşlem yapılamadı"), detail: (e as Error).message }); }
  }
  /** Çakışma: kendi sürümünüzle devam (diğer kişinin sürümü sunucuda geçmişe saklanır) */
  async function conflictKeepMine() {
    if (!conflict) return;
    try {
      const doc = conflict.stageId === activeId && editor ? fullDoc() : conflict.mine;
      const r = await api<{ stage: any; progress: number }>(`/api/stages/${conflict.stageId}`, { method: "PATCH", json: { content: doc, force: true } });
      pending.current = null;
      clearDraft(conflict.stageId);
      setStages((l) => l.map((x) => (x.id === r.stage.id ? { ...x, ...r.stage } : x)));
      setProgress(r.progress);
      setSave("saved");
      setHistVer((v) => v + 1);
      setConflict(null);
      toast({ tone: "success", title: t("Sizin sürümünüz kaydedildi"), detail: t("Diğer kişinin sürümü “Geçmiş” sekmesinde saklandı.") });
    } catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); }
  }

  /** Bölüme veya bölümün bir alt başlığına geçer (section: başlık düğümünün sırası; D83) */
  async function selectStage(id: string, section: number | null = null) {
    if (id === activeId && section === focusRef.current) return;
    if (stateTimer.current) clearTimeout(stateTimer.current);
    let current: JSONNode | null = null;
    if (editor) {
      current = fullDoc();
      if (pending.current) {
        const text = docToPlain(current);
        const cur = current;
        setStages((l) => l.map((s) => (s.id === activeId ? { ...s, content: cur, content_text: text, word_count: wordCount(text) } : s)));
      }
    }
    await flush();
    const nextDoc = (id === activeId ? current : (stages.find((s) => s.id === id)?.content as JSONNode | null)) ?? { type: "doc", content: [{ type: "paragraph" }] };
    const valid = section != null && nextDoc.content?.[section]?.type === "heading" ? section : null;
    baseRef.current = nextDoc;
    focusRef.current = valid;
    setFocus(valid);
    setActiveId(id);
    setSelection("");
    editor?.commands.setContent((valid != null ? sectionDoc(nextDoc, valid) : nextDoc) as object, { emitUpdate: false });
    setMobilePane("editor");
    router.replace(`/proje/${project.id}?bolum=${id}`, { scroll: false });
  }

  // --- Asistan çıktısını belgeye ekle
  const sourceIndexRef = useRef(sourceIndex);
  sourceIndexRef.current = sourceIndex;
  const stagesRef = useRef(stages);
  stagesRef.current = stages;
  const insertMarkdown = useCallback((md: string, map: Record<string, string>, mode: "append" | "replace", opts: { silent?: boolean } = {}) => {
    if (!editor || isBibliography) return;
    const doc = markdownToDoc(md, (sid) => (map[sid] && sourceIndexRef.current[map[sid]] ? map[sid] : null));
    // Bölüm adını tekrar eden ilk başlık eklenmez (belgede başlık zaten bölümden gelir; D76)
    const first = doc.content?.[0];
    const stageNow = stagesRef.current.find((x: { id: string }) => x.id === activeId) as { title: string } | undefined;
    if (first?.type === "heading" && stageNow && sameHeading((first.content ?? []).map((c) => c.text ?? "").join(""), stageNow.title)) doc.content = doc.content!.slice(1);
    // Alt başlığa odaklanılmışken eklenen metindeki başlıklar atılır (metin bu alt başlığa aittir; D83)
    if (focusRef.current != null) doc.content = (doc.content ?? []).filter((n) => n.type !== "heading");
    const { from, to } = editor.state.selection;
    if (mode === "replace" && from !== to) editor.chain().focus().insertContentAt({ from, to }, doc.content ?? []).run();
    else if (mode === "replace") { toast({ tone: "info", title: t("Önce editörde değiştirilecek metni seçin") }); return; }
    else editor.chain().focus("end").insertContent(doc.content ?? []).run();
    pending.current = { id: activeId, doc: fullDocRef.current() };
    flush({ note: mode === "replace" ? t("AI: seçili metin değiştirildi") : t("AI: taslak eklendi"), author: "ai" });
    if (opts.silent) return;
    toast({ tone: "success", title: t("Belgeye eklendi"), detail: t("Önceki hâl sürüm geçmişinde saklandı.") });
    setMobilePane("editor");
  }, [activeId, editor, flush, isBibliography, toast, t]);
  const insertRef = useRef(insertMarkdown);
  insertRef.current = insertMarkdown;
  const assistantSend = useRef<((text: string, action?: any, selection?: string) => void) | null>(null);
  const registerSend = useCallback((fn: (text: string, action?: any, selection?: string) => void) => { assistantSend.current = fn; }, []);
  const [fixOpen, setFixOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [defenseOpen, setDefenseOpen] = useState(false);
  const [reviewerOpen, setReviewerOpen] = useState(false);
  // Adım 1: başlık seçimi (seçilmediyse ilk açılışta sorulur; "sonra" denirse bu cihazda tekrar açılmaz)
  const [titleOpen, setTitleOpen] = useState(false);
  // Başlangıç: kurgu (D67). Henüz yazılmamış ve kurgusu onaylanmamış çalışmada önce kurgu açılır; sonra başlık, sonra bölümler.
  const [bpOpen, setBpOpen] = useState(false);
  const bpApproved = !!project.context?.blueprint?.approvedAt;
  // Kurgudaki bölüm hedef uzunlukları (D67)
  const targetOf = (stageId: string): number => Number((project.context?.blueprint?.chapters ?? []).find((c: any) => c.stageId === stageId)?.words) || 0;
  useEffect(() => {
    let laterBp = false, later = false;
    try { laterBp = !!localStorage.getItem(`akademi:blueprint-later:${project.id}`); later = !!localStorage.getItem(`akademi:title-later:${project.id}`); } catch { /* yok */ }
    const empty = !stages.some((x) => (x.word_count ?? 0) > 0);
    if (!bpApproved && empty && !laterBp) { setBpOpen(true); return; }
    if (project.context?.titleChosen) return;
    if (!later) setTitleOpen(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  function closeBlueprint() {
    setBpOpen(false);
    if (!project.context?.blueprint?.approvedAt) { try { localStorage.setItem(`akademi:blueprint-later:${project.id}`, "1"); } catch { /* yok */ } }
  }
  function blueprintApproved() {
    setBpOpen(false);
    // Onaydan sonra mevcut akış: başlık seçilmediyse başlık adımı, seçildiyse sıradaki bölüm
    if (!project.context?.titleChosen) setTitleOpen(true);
    else { const first = nextStage(stages); if (first && first.id !== activeId) selectStage(first.id); }
  }
  async function chooseTitle(title: string) {
    const p = await patchProject({ title, context: { titleChosen: true } });
    if (p) {
      const first = nextStage(stages);
      toast({ tone: "success", title: t("Başlık kaydedildi"), detail: first ? t("Sıradaki adım: {s}", { s: first.title }) : undefined });
      if (first && first.id !== activeId) selectStage(first.id);
    }
  }
  function closeTitle() {
    setTitleOpen(false);
    if (!project.context?.titleChosen) { try { localStorage.setItem(`akademi:title-later:${project.id}`, "1"); } catch { /* yok */ } }
  }
  // Bölümü tamamla: önce kontrol penceresi açılır; uygunsa (veya kullanıcı isterse) tamamlanır
  const [reviewOpen, setReviewOpen] = useState(false);
  async function startComplete() {
    if (!active) return;
    await flush();
    setReviewOpen(true);
  }
  function fixWithAssistant(issues: { title: string; detail: string; fix?: string }[]) {
    const list = issues.slice(0, 10).map((i, k) => `${k + 1}. ${i.title}: ${i.detail}${i.fix ? ` → ${i.fix}` : ""}`).join("\n");
    askAssistant(t("Bu bölümün kontrolünde şu sorunlar bulundu:\n{list}\n\nBölümü bu sorunları giderecek şekilde düzelt. Düzeltilmiş bölümü taslak olarak ver; mevcut atıfları ve sayfa bilgilerini koru, yeni bilgi veya kaynak uydurma. Neyi değiştirdiğini kısaca yaz.", { list }), "chat");
  }
  // Bölümü tamamla → önerilen sıradaki bölüme geç
  async function completeStage() {
    if (!active) return;
    await patchStage(active.id, { status: "done" });
    const next = nextStage(stages.map((x) => (x.id === active.id ? { ...x, status: "done" } : x)), active.id);
    if (next) { toast({ tone: "success", title: t("“{s}” tamamlandı", { s: active.title }), detail: t("Sıradaki bölüm: {s}", { s: next.title }) }); selectStage(next.id); }
    else toast({ tone: "success", title: t("Tüm bölümler tamamlandı!"), detail: t("Kalite kontrolünü çalıştırıp çalışmanızı Word veya PDF olarak indirebilirsiniz.") });
  }
  const [presenting, setPresenting] = useState(false);
  /** Savunma sunumu (.pptx) oluşturup indirir */
  async function makePresentation() {
    await flush();
    setPresenting(true);
    toast({ tone: "info", title: t("Sunum hazırlanıyor…"), detail: t("Çalışmanızın metninden slaytlar oluşturuluyor; bu 1 dakika kadar sürebilir.") });
    try {
      const res = await fetch(`/api/projects/${project.id}/presentation`, { method: "POST" });
      if (!res.ok) { const j = await res.json().catch(() => ({})); handlePlanError(res.status, j); throw new Error(j.error ?? t("Sunum oluşturulamadı")); }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = res.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] ?? "sunum.pptx";
      a.click();
      URL.revokeObjectURL(a.href);
      toast({ tone: "success", title: t("Sunum indirildi"), detail: t("Slaytları PowerPoint veya Google Slaytlar’da açıp düzenleyebilirsiniz. Konuşma notları her slaytın altında.") });
    } catch (e) {
      toast({ tone: "error", title: t("Sunum oluşturulamadı"), detail: (e as Error).message });
    } finally { setPresenting(false); }
  }
  /** Asistana dışarıdan istek gönderir (panel açık değilse önce açar) */
  function askAssistant(msg: string, action: string, selection?: string) {
    setTab("assistant");
    setMobilePane("panel");
    setTimeout(() => assistantSend.current?.(msg, action, selection), 350);
  }
  function openTool(id: ToolId) {
    // Pakete bağlı araçlar (D49): paket yetmiyorsa yükseltme penceresi
    const feature = TOOL_FEATURE[id];
    if (feature && !hasFeature(props.planId, feature)) { openUpgrade({ code: "feature_locked", feature, plan: FEATURE_MIN_PLAN[feature] }); return; }
    if (id === "language") {
      if (!active || isBibliography || !editor) { toast({ tone: "info", title: t("Önce bir bölüm açın"), detail: t("Kaynakça dışındaki bir bölüme veya alt başlığa girin.") }); return; }
      const { from, to } = editor.state.selection;
      flush(); setLang({ tab: "translate", range: to - from > 2 ? { from, to } : null });
      return;
    }
    if (id === "consensus") { setConsensusOpen(true); return; }
    if (id === "import") {
      if (!active || isBibliography) { toast({ tone: "info", title: t("Önce aktarılacak bölümü açın"), detail: t("Kaynakça dışındaki bir bölüme veya alt başlığa girin.") }); return; }
      flush(); setImportOpen(true);
    }
    else if (id === "chart") setChartOpen(true);
    else if (id === "analysis") setAnalysisOpen(true);
    else if (id === "reviewer") setReviewerOpen(true);
    else if (id === "defense") { flush(); setDefenseOpen(true); }
    else if (id === "survey") router.push(`/anketler?proje=${project.id}`);
  }
  // Şekil (D106): başlık atıf stiline göre (APA 7’de üstte, çoğu stilde altta) + görsel + not; imlecin bulunduğu yere eklenir.
  // Dışa aktarmada başlık güncel stile göre yeniden biçimlenir.
  function insertFigure(f: { title: string; src: string; alt: string; note: string }) {
    if (!editor || isBibliography) return;
    const lang = project.language === "en" ? "en" : "tr";
    const fmt = formatCaption(project.citation_style, "figure", nextFigureNo, f.title, lang);
    const cap = captionNodes(fmt);
    const fig = { type: "figure", attrs: { src: f.src, alt: f.alt } };
    const nl = noteLabel(project.citation_style, lang);
    const note = f.note ? [{ type: "paragraph", content: [{ type: "text", text: nl.text, ...(nl.italic ? { marks: [{ type: "italic" }] } : {}) }, { type: "text", text: ` ${f.note}` }] }] : [];
    editor.chain().focus().insertContent(fmt.position === "above" ? [...cap, fig, ...note] : [fig, ...cap, ...note]).run();
  }
  // Sonraki numara: tüm bölümlerdeki tablo/şekil başlıklarının (hangi stilde yazılmış olursa olsun) en büyüğü + 1
  const nextFigureNo = useMemo(() => 1 + Math.max(0, ...stages.map((st) => maxCaptionNo(String(st.content_text ?? ""), "figure"))), [stages]);
  const nextTableNo = useMemo(() => 1 + Math.max(0, ...stages.map((st) => maxCaptionNo(String(st.content_text ?? ""), "table"))), [stages]);
  // Rehberli tur, başlık seçim penceresi kapandıktan sonra başlar (iki pencere üst üste açılmasın)
  useEffect(() => { if (!titleOpen && !bpOpen && shouldShowTour()) { const tm = setTimeout(() => setTourOpen(true), 900); return () => clearTimeout(tm); } }, [titleOpen, bpOpen]);

  /** Editörde bir metni bulup seçer (danışman yorumunun alıntısı için). Bulursa seçili metni döndürür. */
  function selectQuote(quote: string): string | null {
    if (!editor || !quote.trim()) return null;
    const needle = quote.replace(/\s+/g, " ").trim().slice(0, 120);
    let found: { from: number; to: number } | null = null;
    editor.state.doc.descendants((node, pos) => {
      if (found || !node.isTextblock) return !found;
      // Metin konumlarını belge konumlarına eşle (atıf gibi atom düğümler 1 konum kaplar)
      let text = "";
      const map: number[] = [];
      node.forEach((child, offset) => {
        if (child.isText) for (let k = 0; k < (child.text ?? "").length; k++) { text += child.text![k]; map.push(pos + 1 + offset + k); }
      });
      const norm = text.replace(/\s/g, " ");
      const i = norm.indexOf(needle);
      if (i >= 0) {
        const fullLen = Math.min(quote.length, norm.length - i);
        found = { from: map[i], to: map[Math.min(i + fullLen, map.length) - 1] + 1 };
      }
      return false;
    });
    if (!found) return null;
    editor.chain().focus().setTextSelection(found).run();
    return editor.state.doc.textBetween((found as { from: number }).from, (found as { to: number }).to, "\n");
  }

  /** Danışman yorumunu asistana uygulatır: alıntılanan metni seçer, asistana yorumla birlikte gönderir */
  function applyComment(c: { body: string; quote: string | null }) {
    const sel = c.quote ? selectQuote(c.quote) : null;
    setTab("assistant");
    setMobilePane("panel");
    const msg = sel
      ? t("Danışman yorumu: “{c}”. Seçili metni bu yoruma göre düzelt; düzeltilmiş metni tek bir taslak olarak ver, mevcut atıfları koru. Yaptığın değişiklikleri kısaca açıkla.", { c: c.body })
      : t("Danışman yorumu: “{c}”. Bu bölümün mevcut metnini bu yoruma göre nasıl düzeltmem gerektiğini açıkla; gerekiyorsa düzeltilmiş paragrafları taslak olarak ver.", { c: c.body });
    setTimeout(() => assistantSend.current?.(msg, "chat", sel ?? undefined), 350);
    if (c.quote && !sel) toast({ tone: "info", title: t("Yorumdaki alıntı metinde bulunamadı"), detail: t("Asistan bölümün tamamına göre öneri verecek.") });
  }
  const placeholderCount = useMemo(() => stages.reduce((a, st) => a + findPlaceholderBlocks(st.content as JSONNode).length, 0), [stages]);

  /** Bir paragrafı (düz metniyle bulunur) yeni düğümlerle değiştirir; etkin bölümde editör, diğerlerinde API ile */
  const applyBlock = async (stageId: string, plain: string, nodes: JSONNode[]): Promise<boolean> => {
    const note = t("AI: kaynakla düzeltildi");
    if (stageId === activeId && editor) {
      const next = replaceBlockByText(fullDocRef.current(), plain, nodes);
      if (!next) return false;
      baseRef.current = next;
      editor.commands.setContent((focusRef.current != null ? sectionDoc(next, focusRef.current) : next) as object, { emitUpdate: false });
      pending.current = { id: activeId, doc: next };
      await flush({ note, author: "ai" });
      return true;
    }
    const st = stages.find((x) => x.id === stageId);
    const next = st && replaceBlockByText(st.content as JSONNode, plain, nodes);
    if (!next) return false;
    try {
      const r = await api<{ stage: any; progress: number }>(`/api/stages/${stageId}`, { method: "PATCH", json: { content: next, snapshot: { note, author: "ai" } } });
      setStages((l) => l.map((x) => (x.id === stageId ? { ...x, content: next, content_text: r.stage.content_text, word_count: r.stage.word_count } : x)));
      setProgress(r.progress);
      return true;
    } catch { return false; }
  };
  const applyBlockRef = useRef(applyBlock);
  applyBlockRef.current = applyBlock;

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
    orderTimer.current = setTimeout(() => {
      // Sürükleme bitince akademik sıra korunur (D84): aynı ana bölümün kısımları bitişik, kaynakça ve ekler sonda
      const fixed = academicOrder(next);
      if (fixed) {
        setStages(fixed.map((s, i) => ({ ...s, position: i })));
        toast({ tone: "info", title: t("Bölüm sırası akademik düzene göre ayarlandı"), detail: t("Aynı ana bölümün kısımları bir arada, kaynakça ve ekler en sonda kalır.") });
      }
      api(`/api/projects/${project.id}/stages`, { method: "PUT", json: { order: (fixed ?? next).map((s) => s.id) } }).catch(() => toast({ tone: "error", title: t("Sıralama kaydedilemedi") }));
    }, 600);
  }
  // Açılışta sıra bozuksa (ör. sonradan eklenen bir yöntem kısmı eklerin arkasında kaldıysa) düzeltilir (D84)
  useEffect(() => {
    const fixed = academicOrder(props.stages);
    if (!fixed) return;
    setStages(fixed.map((s, i) => ({ ...s, position: i })));
    api(`/api/projects/${props.project.id}/stages`, { method: "PUT", json: { order: fixed.map((s) => s.id) } })
      .then(() => toast({ tone: "info", title: t("Bölüm sırası akademik düzene göre düzeltildi"), detail: t("Aynı ana bölümün kısımları bir arada, kaynakça ve ekler en sonda kalır.") }))
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function removeStage(id: string) {
    const st = stages.find((s) => s.id === id);
    if (!st || !confirm(t("“{title}” bölümü ve içeriği silinsin mi? Bu işlem geri alınamaz.", { title: st.title }))) return;
    try { await api(`/api/stages/${id}`, { method: "DELETE" }); }
    catch (e) { toast({ tone: "error", title: t("Silinemedi"), detail: (e as Error).message }); return; }
    const rest = stages.filter((s) => s.id !== id);
    setStages(rest);
    if (id === activeId && rest[0]) { setActiveId(rest[0].id); focusRef.current = null; setFocus(null); baseRef.current = rest[0].content; editor?.commands.setContent((rest[0].content as object) ?? { type: "doc", content: [{ type: "paragraph" }] }, { emitUpdate: false }); }
  }

  async function exportAs(format: string, stageIds?: string[]) {
    await flush();
    try {
      const res = await fetch(`/api/projects/${project.id}/export?format=${format}${stageIds?.length ? `&stages=${stageIds.join(",")}` : ""}`);
      if (!res.ok) { const j = await res.json().catch(() => ({})); handlePlanError(res.status, j); throw new Error(j.error ?? t("Dışa aktarılamadı")); }
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
  // Belgedeki akademik yapıya göre numara öneki (GİRİŞ > Problem Durumu → 1.1; D76)
  const prefixes = useMemo(() => stagePrefixes(stages, Object.fromEntries(stages.map((s) => [s.key, stageDef(s.key)?.title]))), [stages]);
  const chapterNumber = active ? prefixes[active.id] ?? "" : "";
  // Alt başlıklar (D83): her aşamanın alt başlık ağacı, belgedeki numaralarıyla
  const trees = useMemo<Record<string, SectionInfo[]>>(() => Object.fromEntries(stages.map((s) => [s.id, sectionTree(s.content as JSONNode, prefixes[s.id] ?? "")])), [stages, prefixes]);
  const activeTree: SectionInfo[] = active ? trees[active.id] ?? [] : [];
  const focused = focus != null ? activeTree.find((x) => x.index === focus) ?? null : null;
  suggestCtx.current.stageTitle = !isBibliography && active ? active.title : "";
  suggestCtx.current.focusTitle = focused?.text ?? null;
  suggestCtx.current.on = autoSuggest;
  const maxLevel = active ? maxSectionLevel(!!chapterGroup(active.key) && !!prefixes[active.id]?.includes(".")) : 4;
  const [subOpen, setSubOpen] = useState(false);
  const subParent: SubheadingParent | null = focused ? { index: focused.index, title: focused.text, number: focused.number, level: focused.level } : null;
  // Başlıksız açılış metnindeki alt başlıklar da numaralanır, sonraki kısımlar kayar (D89)
  const canSubdivide = !isBibliography && (!focused || focused.level < maxLevel);
  const subSiblings = focused
    ? activeTree.filter((x) => x.index > focused.index && x.index < focused.end && x.level === focused.level + 1).map((x) => x.text)
    : activeTree.filter((x) => x.level === 2).map((x) => x.text);
  /** Onaylanan alt başlıkları belgeye ekler; odak korunur (eklenenler odaktan sonra geldiği için sıra kaymaz) */
  async function createSubheadings(titles: string[]) {
    if (!active) return;
    const base = fullDoc();
    const { doc: next, added } = addSubheadings(base, titles, focused ? focused.index : null, { maxLevel, same: sameHeading });
    if (!added.length) { toast({ tone: "info", title: t("Eklenecek yeni alt başlık yok"), detail: t("Aynı adlı alt başlıklar zaten var.") }); return; }
    const f = focusRef.current;
    const keep = f != null && f >= added[0] ? f + added.length : f;
    await setFullDoc(next, t("{n} alt başlık oluşturuldu", { n: added.length }), keep);
    toast({ tone: "success", title: t("{n} alt başlık oluşturuldu", { n: added.length }), detail: t("Soldaki listeden her birine ayrı ayrı girip yazabilirsiniz.") });
  }
  /** Sol listedeki “+”: alt başlığın arkasına aynı düzeyde yeni alt başlık (D86) */
  const [sibling, setSibling] = useState<{ index: number; level: number; number: string; title: string } | null>(null);
  const [siblingName, setSiblingName] = useState("");
  async function openSibling(stageId: string, sec: SectionInfo) {
    // Önce o alt başlığa girilir (kaydedilmemiş değişiklikler kaydedilir), sonra yeni başlığın adı sorulur
    if (stageId !== activeId || focusRef.current !== sec.index) await selectStage(stageId, sec.index);
    setSiblingName("");
    setSibling({ index: sec.index, level: sec.level, number: sec.number, title: sec.text });
  }
  async function addSibling() {
    if (!sibling || !siblingName.trim()) return;
    const r = addSiblingAfter(fullDoc(), sibling.index, siblingName);
    setSibling(null);
    if (r.index < 0) { toast({ tone: "error", title: t("Alt başlık eklenemedi") }); return; }
    await setFullDoc(r.doc, t("Alt başlık eklendi"), r.index);
  }
  /** Word’den içe aktar (D87): açık bölüme ya da alt başlığa yerleştirir; kaynaklar ve atıflar sunucuda hazırlanır */
  const [importOpen, setImportOpen] = useState(false);
  // Dil ve çeviri (D111): sekme ve açılırken seçili aralık
  const [consensusOpen, setConsensusOpen] = useState(false);
  const [lang, setLang] = useState<{ tab: LanguageTab; range: { from: number; to: number } | null } | null>(null);
  async function applyImport(r: ImportResult) {
    if (r.sources.length) addSources(r.sources);
    const next = insertImported(fullDoc(), r.nodes, focused ? focused.index : null);
    await setFullDoc(next, t("Word belgesinden içe aktarıldı"), focusRef.current);
  }
  async function renameFocused(title: string) {
    if (focus == null || !title.trim()) return;
    await setFullDoc(renameSection(fullDoc(), focus, title), t("Alt başlık yeniden adlandırıldı"), focus);
  }
  async function removeFocused() {
    if (!focused) return;
    if (!confirm(t("“{title}” alt başlığı, metni ve altındaki başlıklarla birlikte silinsin mi? Önceki hâl sürüm geçmişinde saklanır.", { title: focused.text }))) return;
    await setFullDoc(removeSection(fullDoc(), focused.index), t("Alt başlık silindi"), null);
  }

  const done = completion(stages);
  const nextId = nextStage(stages)?.id;
  const waitFor = active && !isBibliography && active.status !== "done" ? shouldWaitFor(stages, active) : undefined;
  const Nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ink-100 px-4 py-3.5">
        <div className="relative flex items-center justify-center"><ProgressRing value={progress} size={40} /><span className="absolute text-[10px] font-semibold">{progress}%</span></div>
        <div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-wider text-ink-400">{t("Yol haritası")}</p><p className="truncate text-[13px] text-ink-600">{t(wt?.title ?? "")} · {t(LEVEL_LABELS[project.academic_level as AcademicLevel])}</p></div>
      </div>
      <div data-tour="goal"><GoalWidget project={project} stages={stages} onOpen={() => setGoalOpen(true)} /></div>
      <div className="space-y-1.5 px-3 pt-2">
        <button onClick={() => setBpOpen(true)} className={cn("flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[13px] transition", bpApproved ? "border-emerald-100 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-50" : "border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100")}>
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", bpApproved ? "bg-emerald-500 text-white" : "bg-brand-600 text-white")}>{bpApproved ? <Check className="h-3 w-3" /> : <Compass className="h-3 w-3" />}</span>
          <span className="min-w-0 flex-1"><span className="block font-medium">{bpApproved ? t("Kurgu onaylandı") : project.context?.blueprint ? t("Kurgu taslağı: onayla") : t("Başlangıç: Kurguyu oluştur")}</span><span className="block truncate text-[11.5px] opacity-80">{t("Problem, amaç, yöntem ve bölüm planı")}</span></span>
        </button>
        <button onClick={() => setTitleOpen(true)} className={cn("flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[13px] transition", project.context?.titleChosen ? "border-emerald-100 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-50" : "border-brand-200 bg-brand-50 text-brand-800 hover:bg-brand-100")}>
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", project.context?.titleChosen ? "bg-emerald-500 text-white" : "bg-brand-600 text-white")}>{project.context?.titleChosen ? <Check className="h-3 w-3" /> : <Wand2 className="h-3 w-3" />}</span>
          <span className="min-w-0 flex-1"><span className="block font-medium">{project.context?.titleChosen ? t("Başlık seçildi") : t("Adım 1: Başlık seç")}</span><span className="block truncate text-[11.5px] opacity-80">{project.title}</span></span>
        </button>
        <p className="px-1 text-[11.5px] text-ink-500">{t("{d}/{n} bölüm tamamlandı", { d: done.done, n: done.total })}</p>
      </div>
      <Reorder.Group axis="y" values={stages} onReorder={reorder} className="mt-2 flex-1 space-y-0.5 overflow-y-auto border-t border-ink-100 p-2">
        {stages.map((s, i) => {
          const st = STATUS.find((x) => x.id === s.status) ?? STATUS[0];
          const sel = s.id === activeId;
          return (
            <Reorder.Item key={s.id} value={s} data-tour={s.key === "references" ? "stage-references" : undefined} className="group/item relative" whileDrag={{ scale: 1.02, boxShadow: "0 12px 30px -10px rgb(21 24 41 / 0.25)" }}>
              {/* Ana bölüm başlığı (ör. “1 GİRİŞ”): gruptaki ilk aşamanın üstünde */}
              {(() => { const g = chapterGroup(s.key); const prev = stages[i - 1]; if (!g || (prev && chapterGroup(prev.key)?.id === g.id)) return null; const major = (prefixes[s.id] ?? "").split(".")[0]; return <p className="px-2 pb-0.5 pt-2 text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">{major ? `${major} ` : ""}{g.title[project.language === "en" ? "en" : "tr"]}</p>; })()}
              <div className={cn("group relative flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2.5 transition-colors lg:py-2", sel && focus == null ? "bg-white shadow-sm ring-1 ring-ink-100" : sel ? "bg-white/70" : "hover:bg-white/70")} onClick={() => selectStage(s.id)}>
              <GripVertical className="hidden h-3.5 w-3.5 shrink-0 cursor-grab text-ink-200 opacity-0 transition group-hover:opacity-100 lg:block" />
              <span title={t("Adım {n}", { n: i + 1 })} className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold lg:h-6 lg:w-6 lg:text-[10.5px]", s.status === "done" ? "bg-emerald-500 text-white" : sel ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-500")}>{s.status === "done" ? <Check className="h-3 w-3" /> : i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[14px] leading-tight lg:text-[13px]", sel ? "font-semibold text-ink-900" : "text-ink-700")}>{prefixes[s.id] ? <span className="mr-1 font-mono text-[11.5px] font-medium text-ink-400">{prefixes[s.id]}</span> : null}{s.title}</span>
                <span className="flex items-center gap-1.5 text-[11px] text-ink-400"><span className={cn("h-1.5 w-1.5 rounded-full", st.dot)} />{s.status === "done" ? <span className="font-medium text-emerald-600">{t("Tamamlandı")}{s.word_count ? ` · ${t("{n} kelime", { n: s.word_count })}` : ""}</span> : targetOf(s.id) ? <span title={t("Kurgudaki hedef uzunluk")}>{t("{n} / ~{t} kelime", { n: (s.word_count ?? 0).toLocaleString(dl), t: targetOf(s.id).toLocaleString(dl) })}</span> : s.word_count ? t("{n} kelime", { n: s.word_count }) : t(st.label)}{s.id === nextId && s.status !== "done" && <span className="rounded-full bg-brand-600 px-1.5 py-px text-[10px] font-semibold text-white">{t("Sıradaki")}</span>}{WRITE_LAST.has(s.key) && s.status !== "done" && s.id !== nextId && <span className="text-[10px] text-ink-400">· {t("en son yazılır")}</span>}</span>
              </span>
              {present.some((p) => p.stageId === s.id) && <span className="flex -space-x-1" title={t("Bu bölümde: {n}", { n: present.filter((p) => p.stageId === s.id).map((p) => p.name).join(", ") })}>{present.filter((p) => p.stageId === s.id).slice(0, 2).map((p) => <Avatar key={p.userId} id={p.userId} name={p.name} size="sm" ring />)}</span>}
              {isOwner && <button onClick={(e) => { e.stopPropagation(); removeStage(s.id); }} className="rounded-md p-1.5 text-ink-300 transition hover:bg-rose-50 hover:text-rose-500 lg:opacity-0 lg:group-hover:opacity-100" aria-label={t("Bölümü sil")}><Trash2 className="h-3.5 w-3.5" /></button>}
              </div>
              {/* Alt başlıklar (D83): her birine ayrı ayrı girilir */}
              {(trees[s.id] ?? []).length > 0 && (
                <ul className="mb-1 ml-[22px] border-l border-ink-100 pl-1.5 lg:ml-[30px]">
                  {(trees[s.id] ?? []).map((sec: SectionInfo) => {
                    const on = sel && focus === sec.index;
                    return (
                      <li key={sec.index} className="group/sec relative">
                        <button onClick={() => selectStage(s.id, sec.index)} style={{ paddingLeft: `${(sec.level - 2) * 12 + 8}px` }} className={cn("flex w-full items-baseline gap-1.5 rounded-lg py-1.5 pr-8 text-left text-[12.5px] transition", on ? "bg-white font-semibold text-ink-900 shadow-sm ring-1 ring-ink-100" : "text-ink-600 hover:bg-white/70")}>
                          {sec.number && <span className="shrink-0 font-mono text-[11px] text-ink-400">{sec.number}</span>}
                          <span className="min-w-0 flex-1 truncate">{sec.text || t("(adsız alt başlık)")}</span>
                          <span className="shrink-0 text-[10.5px] text-ink-300">{sec.words ? sec.words.toLocaleString(dl) : "—"}</span>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openSibling(s.id, sec); }} title={t("Bunun arkasına aynı düzeyde alt başlık ekle")} aria-label={t("Bunun arkasına aynı düzeyde alt başlık ekle")} className="absolute right-1 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-400 transition hover:bg-brand-50 hover:text-brand-700 lg:opacity-0 lg:group-hover/sec:opacity-100 lg:focus:opacity-100"><Plus className="h-3.5 w-3.5" /></button>
                      </li>
                    );
                  })}
                </ul>
              )}
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
    canEdit
      ? { key: "assistant", label: t("Asistan"), icon: <Bot className="h-5 w-5" />, active: mobilePane === "panel" && tab === "assistant", onClick: () => go("panel", "assistant") }
      : { key: "comments", label: t("Yorum"), icon: <MessageSquare className="h-5 w-5" />, active: mobilePane === "panel" && tab === "comments", onClick: () => go("panel", "comments") },
    { key: "sources", label: t("Kaynaklar"), icon: <BookMarked className="h-5 w-5" />, active: mobilePane === "panel" && tab === "sources", onClick: () => go("panel", "sources"), badge: sources.length },
    { key: "more", label: t("Diğer"), icon: <MoreHorizontal className="h-5 w-5" />, active: mobilePane === "panel" && isMore, onClick: () => go("panel", isMore ? tab : "memory") },
  ];

  return (
    <CitationContext.Provider value={citeCtx}>
      <div className="flex h-[100dvh] flex-col bg-[rgb(var(--bg))]">
        {/* Üst çubuk */}
        <header className="relative z-30 flex h-14 shrink-0 items-center gap-1.5 border-b border-ink-100 bg-white/85 px-2 backdrop-blur sm:gap-2 sm:px-4" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
          <Link href="/panel" className="rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900" aria-label={t("Panele dön")}><ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4" /></Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-ink-900 sm:text-[14.5px]">{mobilePane !== "nav" && active ? <span className="lg:hidden">{active.title}</span> : null}<span className={mobilePane !== "nav" && active ? "hidden lg:inline" : ""}>{project.title}</span></p>
            <SaveIndicator state={save} />
          </div>
          <select aria-label={t("Atıf stili")} value={project.citation_style} onChange={(e) => changeStyle(e.target.value as CitationStyleId)} className="hidden h-9 rounded-xl border border-ink-200 bg-white px-2.5 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 md:block">
            {STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}
          </select>
          <Link href={`/proje/${project.id}/kalite`} onClick={() => flush()} className="hidden h-9 items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-700 transition hover:border-ink-300 lg:flex"><FileCheck2 className="h-4 w-4 text-emerald-600" /> {t("Kalite kontrol")}</Link>
          <CoauthorsButton projectId={project.id} isOwner={isOwner} planId={props.planId} present={present} onCountChange={(n) => setCollaborative(n > 0)} />
          {isOwner && <ShareButton projectId={project.id} />}
          {canEdit && <ToolsMenu onPick={openTool} workType={project.work_type} planId={props.planId} />}
          <span data-tour="export"><ExportMenu onExport={exportAs} stages={stages.filter((x) => x.key !== "references").map((x) => ({ id: x.id, title: x.title, prefix: prefixes[x.id] ?? "", words: x.word_count ?? 0 }))} onFormat={() => setFormatOpen(true)} onPresentation={makePresentation} onJournals={() => setJournalOpen(true)} presenting={presenting} /></span>
          <MobileMenu isOwner={isOwner} canEdit={canEdit} coauthors={<CoauthorsButton projectId={project.id} isOwner={isOwner} planId={props.planId} present={present} variant="row" onCountChange={(n) => setCollaborative(n > 0)} />} projectId={project.id} style={project.citation_style} onStyle={changeStyle} onQuality={() => flush()} onSettings={() => setSettings(true)} onTour={() => setTourOpen(true)} onTool={openTool} workType={project.work_type} planId={props.planId} />
          <button onClick={() => setTourOpen(true)} className="hidden rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 md:block" aria-label={t("Rehberli tur")} title={t("Rehberli tur")}><HelpCircle className="h-4 w-4" /></button>
          <button onClick={() => setSettings(true)} className="hidden rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900 md:block" aria-label={t("Proje ayarları")}><Settings2 className="h-4 w-4" /></button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] lg:grid-cols-[264px_minmax(0,1fr)_420px] xl:grid-cols-[280px_minmax(0,1fr)_460px]">
          <aside data-tour="nav" className={cn("min-h-0 border-r border-ink-100 bg-ink-50/50", mobilePane === "nav" ? "block" : "hidden lg:block")}>{Nav}</aside>

          <section className={cn("min-h-0 overflow-y-auto", mobilePane === "editor" ? "block" : "hidden lg:block")}>
            {active && (
              <div className="mx-auto max-w-[780px] px-4 pb-10 pt-4 sm:px-10 sm:pt-6">
                {isBibliography ? (
                  <BibliographyView engine={engine} sources={sources} citedOrder={citedOrder} title={engine.meta.bibliographyTitle[project.language === "en" ? "en" : "tr"]} stages={stages} onJump={jumpToCitation} />
                ) : (
                  <>
                    {placeholderCount > 0 && (
                      <button onClick={() => setFixOpen(true)} className="mb-3 flex w-full items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-left text-[13px] text-amber-900 transition hover:bg-amber-100">
                        <Wand2 className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="min-w-0 flex-1">{t("Projede {n} yerde “[KAYNAK GEREKLİ]” var.", { n: placeholderCount })} <b>{t("Kaynak bul ve düzelt")}</b></span>
                      </button>
                    )}
                    {waitFor && (
                      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50/70 px-3.5 py-2.5 text-[13px] text-ink-700">
                        <span className="min-w-0 flex-1">{t("Özet, çalışmanın tamamı yazıldıktan sonra yazılır; çünkü bütün bölümleri özetler. Önce sıradaki bölümü tamamlayın.")}</span>
                        <Button size="sm" onClick={() => selectStage(waitFor.id)}>{t("Sıradakine git: {s}", { s: waitFor.title })}</Button>
                      </div>
                    )}
                    {focused ? (
                      <div className="mb-3 sm:mb-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => selectStage(active.id, null)} className="inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white px-2.5 py-1 text-xs font-medium text-ink-600 transition hover:border-ink-300 hover:text-ink-900"><ArrowLeft className="h-3.5 w-3.5" /> {chapterNumber ? `${chapterNumber} ` : ""}{active.title}</button>
                          <Badge tone="brand">{focused.number || t("Alt başlık")}</Badge>
                          <span className="text-xs text-ink-400">{t("{n} kelime", { n: focused.words })}</span>
                          <button onClick={() => { flush(); setImportOpen(true); }} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100"><Upload className="h-3.5 w-3.5" /> {t("Word’den içe aktar")}</button>
                          <button onClick={removeFocused} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /> {t("Alt başlığı sil")}</button>
                        </div>
                        <input key={`${active.id}:${focused.index}`} defaultValue={focused.text} onBlur={(e) => e.target.value.trim() && e.target.value.trim() !== focused.text && renameFocused(e.target.value)} className="mt-2 w-full bg-transparent font-serif text-[22px] font-medium leading-tight tracking-tight text-ink-950 outline-none sm:mt-3 sm:text-[28px]" aria-label={t("Alt başlık")} />
                        <p className="mt-1 text-[13px] text-ink-500">{t("Yalnızca bu alt başlığın metni açık. Yazdıklarınız çalışmada bu başlığın altına kaydedilir; indirirken tüm çalışma tek belge olarak aktarılır.")}</p>
                      </div>
                    ) : (
                    <div className="mb-3 sm:mb-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{t("Adım {n}", { n: activeIndex + 1 })}</Badge>
                        {chapterNumber && <Badge>{t("Belgede {n}", { n: chapterNumber })}</Badge>}
                        <StatusPicker value={active.status} onChange={(v) => patchStage(active.id, { status: v })} />
                        <span className="text-xs text-ink-400">{t("{n} kelime", { n: active.word_count ?? 0 })}</span>
                        <button onClick={() => { flush(); setImportOpen(true); }} className="ml-auto inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100" title={t("Word belgesini kaynakları ve atıflarıyla bu bölüme aktar")}><Upload className="h-3.5 w-3.5" /> {t("Word’den içe aktar")}</button>
                        <span>{active.status === "done"
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"><Check className="h-3.5 w-3.5" /> {t("Bölüm tamamlandı")} · {t("{n} kelime", { n: active.word_count ?? 0 })}</span>
                          : <Button size="sm" variant="secondary" onClick={startComplete} disabled={!(active.word_count > 0)} title={!(active.word_count > 0) ? t("Önce bölümü yazın") : undefined}><Check className="h-3.5 w-3.5" /> {t("Bölümü tamamladım")}</Button>}</span>
                      </div>
                      <input key={active.id} defaultValue={active.title} onBlur={(e) => e.target.value.trim() && e.target.value !== active.title && patchStage(active.id, { title: e.target.value.trim() })} className="mt-2 w-full bg-transparent font-serif text-[24px] font-medium leading-tight tracking-tight text-ink-950 outline-none sm:mt-3 sm:text-[32px]" aria-label={t("Bölüm başlığı")} />
                      {def && <p className="mt-1 line-clamp-2 text-[13px] text-ink-500 sm:mt-1.5 sm:line-clamp-none sm:text-[14px]">{t(def.purpose)}</p>}
                    </div>
                    )}
                    {!canEdit && <p className="mb-3 rounded-2xl border border-ink-100 bg-ink-50 px-3.5 py-2.5 text-[13px] text-ink-600">{t("Bu çalışmada yorumcusunuz: metni okuyabilir, bir bölümü seçip “Yorum” sekmesinden not bırakabilirsiniz.")}</p>}
                    {present.some((p) => p.stageId === active.id) && (
                      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-2 text-[13px] text-emerald-900">
                        <span className="flex -space-x-1.5">{present.filter((p) => p.stageId === active.id).slice(0, 3).map((p) => <Avatar key={p.userId} id={p.userId} name={p.name} size="sm" ring />)}</span>
                        <span className="min-w-0 flex-1">{t("{n} şu an bu bölümde.", { n: present.filter((p) => p.stageId === active.id).map((p) => p.name).join(", ") })} <span className="text-emerald-700">{t("Farklı alt başlıklarda çalışmanız önerilir; aynı anda kaydederseniz hiçbir metin kaybolmaz.")}</span></span>
                      </div>
                    )}
                    <div data-tour="toolbar" className="sticky top-0 z-20 -mx-4 mb-4 bg-gradient-to-b from-[rgb(var(--bg))] via-[rgb(var(--bg))] to-transparent px-2 pb-2 pt-1 sm:-mx-2 sm:mb-6 sm:pb-3">
                      <Toolbar editor={editor} onFootnote={() => setFootnote("")} suggestOn={autoSuggest} onToggleSuggest={() => { const v = !autoSuggest; setAutoSuggest(v); suggestCtx.current.blocked = false; try { localStorage.setItem("acd_autosuggest", v ? "1" : "0"); } catch { /* yok say */ } toast({ tone: "info", title: v ? t("Otomatik tamamlama açık") : t("Otomatik tamamlama kapalı"), detail: v ? t("Paragrafın sonunda durunca gri öneri çıkar; Tab ile kabul edin.") : undefined }); }} />
                    </div>
                    <AcademicEditor editor={editor} chapter={chapterNumber} />
                    {editor && !isBibliography && (
                      <SelectionBubble
                        editor={editor}
                        onLanguage={(tab, range) => { flush(); setLang({ tab, range }); }}
                        onAssistant={(action, text) => {
                          if (action === "chat") { setTab("assistant"); setMobilePane("panel"); setTimeout(() => document.getElementById("assistant-input")?.focus(), 250); return; }
                          askAssistant(t(ASSISTANT_ACTIONS[action].label), action, text);
                        }}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          <aside className={cn("min-h-0 min-w-0 flex-col border-l border-ink-100 bg-white/60", mobilePane === "panel" ? "flex" : "hidden lg:flex")}>
            <div className={cn("border-b border-ink-100 p-2 sm:p-2.5", !isMore && "hidden lg:block")}>
              <div className="hidden lg:block" data-tour="panel-tabs">
                <Tabs compact value={tab} onChange={setTab} tabs={[
                  ...(canEdit ? [{ id: "assistant" as const, label: t("Asistan"), icon: <Bot className="h-3.5 w-3.5" /> }] : []),
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
                  {tab === "assistant" && <AssistantPanel projectId={project.id} stage={active ? { id: active.id, key: active.key, title: active.title } : null} def={def} selection={selection} files={files} onInsert={insertMarkdown} onOpenResearch={(prefill) => setResearch({ open: true, prefill: prefill || (active ? `${project.topic || project.title} — ${active.title}` : "") })} onMemoryChanged={() => api<{ memory: any[] }>(`/api/projects/${project.id}/memory`).then((r) => setMemory(r.memory)).catch(() => {})} onSourcesAdded={addSources} onOpenOutline={canSubdivide ? () => { flush(); setSubOpen(true); } : undefined} onOpenImport={!isBibliography ? () => { flush(); setImportOpen(true); } : undefined} focus={focused ? { number: focused.number, title: focused.text, index: focused.index } : null} onOpenAnalysis={() => setAnalysisOpen(true)} registerSend={registerSend} language={project.language} lowSources={sources.length < minSourcesFor(project.work_type, project.academic_level)} targetWords={active ? targetOf(active.id) : 0} />}
                  {tab === "sources" && <ProjectSources projectId={project.id} sources={sources} setSources={setSources} onCite={(id) => { cite(id); setMobilePane("editor"); }} canCite={!!editor && !isBibliography} language={project.language} citedIds={citedSet} onInsertMarkdown={!isBibliography && editor ? (md, map) => { insertMarkdown(md, map, "append"); setMobilePane("editor"); } : undefined} onInsertTable={!isBibliography && editor ? (node) => { editor.chain().focus().insertContent(node.content ?? []).run(); pending.current = { id: activeId, doc: fullDocRef.current() }; flush({ note: t("Literatür tablosu eklendi"), author: "ai" }); setMobilePane("editor"); } : undefined} />}
                  {tab === "memory" && <MemoryPanel projectId={project.id} memory={memory} setMemory={setMemory} />}
                  {tab === "comments" && active && <CommentsPanel stageId={active.id} selection={selection} onApply={canEdit ? applyComment : undefined} isOwner={isOwner} />}
                  {tab === "history" && active && <HistoryPanel stageId={active.id} version={histVer} onSnapshot={() => flush({ note: t("Elle kaydedilen sürüm"), author: "user" })} onRestore={(st) => { setStages((l) => l.map((s) => (s.id === st.id ? st : s))); baseRef.current = st.content; focusRef.current = null; setFocus(null); editor?.commands.setContent(st.content ?? { type: "doc", content: [{ type: "paragraph" }] }, { emitUpdate: false }); }} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </aside>
        </div>

        {/* Mobil alt gezinme */}
        <nav className="grid shrink-0 grid-cols-5 border-t border-ink-100 bg-white/95 backdrop-blur lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }} aria-label={t("Çalışma alanı gezinmesi")}>
          {MOBILE_NAV.map((n) => (
            <button key={n.key} data-tour={`m-${n.key}`} onClick={n.onClick} aria-current={n.active ? "page" : undefined} className={cn("relative flex flex-col items-center justify-center gap-0.5 py-2 text-[10.5px] font-medium transition-colors", n.active ? "text-brand-700" : "text-ink-400")}>
              {n.active && <motion.span layoutId="mnav" className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-brand-600" />}
              <span className="relative">{n.icon}{n.badge ? <span className="absolute -right-2.5 -top-1.5 rounded-full bg-brand-600 px-1 text-[9px] font-semibold leading-4 text-white">{n.badge}</span> : null}</span>
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      {lang && editor && <LanguageModal open onClose={() => setLang(null)} editor={editor} projectId={project.id} projectLanguage={project.language} glossary={Array.isArray(project.context?.glossary) ? project.context.glossary : []} stageTitle={active?.title ?? ""} scopeLabel={focused ? t("Bu alt başlık: {n} {t}", { n: focused.number, t: focused.text }) : t("Bu bölüm: {t}", { t: active?.title ?? "" })} initialTab={lang.tab} selectionRange={lang.range} onSnapshot={(note) => flush({ note, author: "user" })} onGlossarySaved={(g) => setProject((p: any) => ({ ...p, context: { ...(p.context ?? {}), glossary: g } }))} />}
      {conflict && (
        <Modal open onClose={() => {}} title={t("Bu bölüm başka biri tarafından da değiştirildi")}>
          <p className="text-[14px] leading-relaxed text-ink-700">{t("{n} siz yazarken “{s}” bölümünü kaydetti. Hangi sürümle devam etmek istersiniz? Seçmediğiniz sürüm silinmez, “Geçmiş” sekmesinde saklanır.", { n: conflict.by || t("Bir ortak yazar"), s: stages.find((x) => x.id === conflict.stageId)?.title ?? "" })}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={conflictTakeTheirs}>{t("Onun sürümünü yükle")}</Button>
            <Button onClick={conflictKeepMine}>{t("Benim sürümümle devam et")}</Button>
          </div>
          <p className="mt-3 text-[12.5px] text-ink-500">{t("İpucu: Aynı bölümde birlikte çalışırken farklı alt başlıkları açarsanız çakışma olmaz.")}</p>
        </Modal>
      )}
      <Modal open={consensusOpen} onClose={() => setConsensusOpen(false)} title={t("Araştırmalar ne diyor?")} wide>
        {consensusOpen && <ConsensusTool projectId={project.id} signedIn onAdded={addSources} />}
      </Modal>
      <ResearchModal key={research.open ? "open" : "closed"} open={research.open} onClose={() => setResearch({ open: false, prefill: "" })} projectId={project.id} stageId={active?.id ?? null} prefill={research.prefill} existing={existingDois} onAdded={(rows) => { setSources((l) => [...l, ...rows]); setTab("sources"); }} />
      <AddStageModal open={addStage} onClose={() => setAddStage(false)} existing={new Set(stages.map((s) => s.key))} projectId={project.id} afterPosition={activeIndex} onAdded={(st) => { const n = [...stages]; n.splice(activeIndex + 1, 0, st); const fixed = academicOrder(n); setStages((fixed ?? n).map((x, i) => ({ ...x, position: i }))); if (fixed) api(`/api/projects/${project.id}/stages`, { method: "PUT", json: { order: fixed.map((x) => x.id) } }).catch(() => {}); setAddStage(false); }} />
      {active && !isBibliography && importOpen && <ImportDocModal open={importOpen} onClose={() => setImportOpen(false)} projectId={project.id} target={focused ? `${focused.number ? `${focused.number} ` : ""}${focused.text}` : `${chapterNumber ? `${chapterNumber} ` : ""}${active.title}`} base={focused ? Math.min(maxLevel, focused.level + 1) : 2} max={maxLevel} dropTitle={focused ? focused.text : active.title} onImported={applyImport} />}
      {active && !isBibliography && subOpen && <SubheadingModal open={subOpen} onClose={() => setSubOpen(false)} projectId={project.id} stage={{ id: active.id, title: active.title }} parent={subParent} suggested={focused ? 3 : Math.max(2, subheadingBudget(active.key, targetOf(active.id)) || 3)} existing={subSiblings} onCreate={createSubheadings} />}
      <FixClaimsModal open={fixOpen} onClose={() => setFixOpen(false)} projectId={project.id} stages={stages} sourceExists={(id) => !!sourceIndexRef.current[id]} onSourcesAdded={addSources} applyBlock={(a, b, c) => applyBlockRef.current(a, b, c)} />
      <Tour open={tourOpen} onClose={() => setTourOpen(false)} />
      {journalOpen && <JournalModal open onClose={() => setJournalOpen(false)} projectId={project.id} hasGuideline={!!project.guideline_file_id}
        onCoverLetter={(j) => { setJournalOpen(false); askAssistant(t("Dergi: {name}{issn}. Bu dergiye gönderilecek makale için editöre ön yazı (cover letter) hazırla.", { name: j.name, issn: j.issn ? ` (ISSN ${j.issn})` : "" }), "cover_letter"); }}
        onChecklist={() => { setJournalOpen(false); askAssistant(t("Yüklediğim dergi yazar kılavuzuna göre çalışmamın gönderim öncesi kontrol listesini çıkar."), "journal_checklist"); }}
        onUploadGuideline={() => { setJournalOpen(false); setSettings(true); }} />}
      {analysisOpen && <AnalysisModal open onClose={() => setAnalysisOpen(false)} files={files} language={project.language} tableNo={nextTableNo} style={project.citation_style} onInsert={!isBibliography && editor ? (md) => insertRef.current(md, {}, "append") : undefined} />}
      {chartOpen && <ChartModal open onClose={() => setChartOpen(false)} files={files} language={project.language} figureNo={nextFigureNo} style={project.citation_style} onInsert={!isBibliography && editor ? insertFigure : undefined} />}
      {defenseOpen && <DefenseModal open onClose={() => setDefenseOpen(false)} projectId={project.id} language={project.language} />}
      {reviewerOpen && <ReviewerModal open={reviewerOpen} onClose={() => setReviewerOpen(false)} onSubmit={(c) => askAssistant(t("Hakem yorumlarına cevap mektubu hazırla"), "reviewer_response", c)} />}
      {active && reviewOpen && <StageReviewModal open onClose={() => setReviewOpen(false)} stageId={active.id} stageTitle={active.title} onComplete={completeStage} onFix={fixWithAssistant} />}
      {bpOpen && <BlueprintScreen open={bpOpen} onClose={closeBlueprint} project={project} stages={stages} onSaved={setProject} onApproved={blueprintApproved} />}
      {titleOpen && <TitleChooser open={titleOpen} onClose={closeTitle} projectId={project.id} currentTitle={project.title} onChoose={chooseTitle} />}
      {goalOpen && <GoalModal open onClose={() => setGoalOpen(false)} project={project} stages={stages} patch={patchProject} />}
      {formatOpen && <FormatModal open onClose={() => setFormatOpen(false)} project={project} patch={patchProject} />}
      <SettingsModal open={settings} onClose={() => setSettings(false)} project={project} patch={patchProject} files={files} setFiles={setFiles} onStagesAdded={(rows) => setStages((l) => [...l, ...rows])} />
      <Modal open={!!sibling} onClose={() => setSibling(null)} title={t("Alt başlık ekle")} footer={<><Button variant="ghost" onClick={() => setSibling(null)}>{t("Vazgeç")}</Button><Button disabled={!siblingName.trim()} onClick={addSibling}><Plus className="h-4 w-4" /> {t("Ekle")}</Button></>}>
        <p className="mb-3 text-[13.5px] text-ink-600">{t("“{p}” başlığından sonra aynı düzeyde yeni bir alt başlık eklenecek. Numaralar kendiliğinden güncellenir.", { p: sibling ? `${sibling.number ? `${sibling.number} ` : ""}${sibling.title}` : "" })}</p>
        <input autoFocus className="input" value={siblingName} onChange={(e) => setSiblingName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) addSibling(); }} placeholder={t("Alt başlığın adı")} aria-label={t("Alt başlığın adı")} />
      </Modal>
      <Modal open={footnote !== null} onClose={() => setFootnote(null)} title={t("Dipnot ekle")} footer={<><Button variant="ghost" onClick={() => setFootnote(null)}>{t("Vazgeç")}</Button><Button disabled={!footnote?.trim()} onClick={() => { editor?.chain().focus().insertContent({ type: "footnote", attrs: { text: footnote } }).run(); setFootnote(null); }}>{t("Ekle")}</Button></>}>
        <textarea autoFocus className="input min-h-[120px]" placeholder={t("Dipnot metni…")} value={footnote ?? ""} onChange={(e) => setFootnote(e.target.value)} />
      </Modal>
    </CitationContext.Provider>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const { t } = useT();
  const map = { saved: [CloudCheck, "Tüm değişiklikler kaydedildi", "text-ink-400"], dirty: [Loader2, "Değişiklikler kaydedilecek…", "text-ink-400"], saving: [Loader2, "Kaydediliyor…", "text-brand-600"], error: [CloudOff, "Kaydedilemedi, yeniden denenecek", "text-rose-600"], offline: [CloudOff, "Çevrimdışı: değişiklikler bu cihazda saklanıyor", "text-amber-600"] } as const;
  const [I, label, cls] = map[state];
  return <p className={cn("flex items-center gap-1 truncate text-[11px] sm:text-[11.5px]", cls)}><I className={cn("h-3 w-3 shrink-0", state === "saving" && "animate-spin")} /> <span className="truncate">{t(label)}</span></p>;
}

/** Mobil üst menü: atıf stili, kalite kontrol, paylaşım ve proje ayarları */
function MobileMenu({ projectId, style, onStyle, onQuality, onSettings, onTour, onTool, workType, planId, isOwner = true, canEdit = true, coauthors }: { isOwner?: boolean; canEdit?: boolean; coauthors?: React.ReactNode; projectId: string; style: string; onStyle: (s: CitationStyleId) => void; onQuality: () => void; onSettings: () => void; onTour: () => void; onTool: (id: ToolId) => void; workType: string; planId?: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button data-tour="m-more" onClick={() => setOpen(true)} className="rounded-xl p-2 text-ink-600 transition hover:bg-ink-100" aria-label={t("Daha fazla")}><MoreHorizontal className="h-5 w-5" /></button>
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
                {coauthors}
                {isOwner && <ShareButton projectId={projectId} variant="row" />}
                {canEdit && <ToolsMenu onPick={(id) => { setOpen(false); onTool(id); }} workType={workType} variant="rows" planId={planId} />}
                <button onClick={() => { setOpen(false); onSettings(); }} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><Settings2 className="h-5 w-5 text-ink-500" /> {t("Proje ayarları")}</button>
                <button onClick={() => { setOpen(false); onTour(); }} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><HelpCircle className="h-5 w-5 text-brand-600" /> {t("Rehberli tur")}</button>
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

function ExportMenu({ onExport, stages, onFormat, onPresentation, onJournals, presenting }: { onExport: (f: string, stageIds?: string[]) => Promise<void>; stages: { id: string; title: string; prefix: string; words: number }[]; onFormat: () => void; onPresentation: () => void; onJournals: () => void; presenting: boolean }) {
  const { t, dl } = useT();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  // Tüm çalışma ya da seçilen bölümler (D91); seçimde numaralar tüm çalışmadaki yerlerini korur
  const [scope, setScope] = useState<"all" | "some">("all");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const chosen = scope === "some" ? stages.filter((x) => picked.has(x.id)).map((x) => x.id) : undefined;
  const blocked = scope === "some" && !chosen?.length;
  const items = [["docx", "Microsoft Word (.docx)"], ["pdf", "PDF"], ["md", "Markdown"], ["txt", t("Düz metin (.txt)")]];
  return (
    <div className="relative">
      <Button size="sm" variant="dark" className="!h-9" onClick={() => setOpen((o) => !o)}><Download className="h-4 w-4" /><span className="hidden sm:inline">{t("Dışa aktar")}</span></Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-11 z-40 w-72 rounded-2xl border border-ink-100 bg-white p-1.5 shadow-2xl">
              <div className="mb-1 grid grid-cols-2 gap-1 rounded-xl bg-ink-100 p-0.5 text-[12.5px] font-medium">
                <button type="button" onClick={() => setScope("all")} className={cn("rounded-lg px-2 py-1.5", scope === "all" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}>{t("Tüm çalışma")}</button>
                <button type="button" onClick={() => setScope("some")} className={cn("rounded-lg px-2 py-1.5", scope === "some" ? "bg-white text-ink-900 shadow-sm" : "text-ink-500")}>{t("Seçili bölümler")}</button>
              </div>
              {scope === "some" && (
                <div className="mb-1 max-h-56 overflow-y-auto rounded-xl border border-ink-100 p-1">
                  <div className="flex justify-between px-2 py-1 text-[11.5px]"><button type="button" className="text-brand-700 hover:underline" onClick={() => setPicked(new Set(stages.map((x) => x.id)))}>{t("Tümünü seç")}</button><button type="button" className="text-ink-500 hover:underline" onClick={() => setPicked(new Set())}>{t("Temizle")}</button></div>
                  {stages.map((x) => (
                    <label key={x.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-ink-700 hover:bg-ink-50">
                      <input type="checkbox" checked={picked.has(x.id)} onChange={() => toggle(x.id)} />
                      <span className="min-w-0 flex-1 truncate">{x.prefix && <span className="mr-1 font-mono text-[11px] text-ink-400">{x.prefix}</span>}{x.title}</span>
                      <span className="shrink-0 text-[11px] text-ink-400">{x.words ? x.words.toLocaleString(dl) : "—"}</span>
                    </label>
                  ))}
                  <p className="px-2 pb-1 pt-1.5 text-[11px] text-ink-400">{t("Numaralar tüm çalışmadaki yerlerini korur; kaynakçada yalnızca seçilen bölümlerde atıf yapılan kaynaklar yer alır.")}</p>
                </div>
              )}
              {items.map(([f, l]) => <button key={f} disabled={blocked} onClick={async () => { setBusy(f); await onExport(f, chosen); setBusy(null); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13.5px] text-ink-700 transition hover:bg-ink-50 disabled:opacity-40">{l}{busy === f && <Loader2 className="h-4 w-4 animate-spin" />}</button>)}
              {blocked && <p className="px-3 pb-1 text-[11.5px] text-amber-700">{t("Aktarılacak en az bir bölüm seçin.")}</p>}
              <button onClick={() => { setOpen(false); onPresentation(); }} disabled={presenting} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[13.5px] text-ink-700 transition hover:bg-ink-50 disabled:opacity-50">{t("Savunma sunumu (.pptx)")}{presenting && <Loader2 className="h-4 w-4 animate-spin" />}</button>
              <button onClick={() => { setOpen(false); onJournals(); }} className="flex w-full items-center rounded-xl px-3 py-2 text-left text-[13.5px] text-ink-700 transition hover:bg-ink-50">{t("Dergi önerisi ve ön yazı")}</button>
              <button onClick={() => { setOpen(false); onFormat(); }} className="mt-1 flex w-full items-center gap-2 rounded-xl border-t border-ink-100 px-3 py-2 text-left text-[13.5px] font-medium text-brand-700 transition hover:bg-brand-50"><Settings2 className="h-4 w-4" /> {t("Biçim ve kapak ayarları")}</button>
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
      if (!res.ok) { handlePlanError(res.status, j); throw new Error(j.error); }
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
    await patch({ context: { format: { ...(project.context?.format ?? {}), fontFamily: f.fontFamily, fontSizePt: f.fontSizePt, lineSpacing: f.lineSpacing } }, ...(STYLE_IDS.includes(f.citationStyle) ? { citationStyle: f.citationStyle } : {}) });
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
    try { await api(`/api/projects/${project.id}`, { method: "DELETE" }); }
    catch (e) { toast({ tone: "error", title: t("Silinemedi"), detail: (e as Error).message }); return; }
    router.push("/panel");
    router.refresh();
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
