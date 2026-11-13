"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckCircle2, CircleDashed, Download, ExternalLink, FileUp, Loader2, Pause, Play, Plus, Rocket, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { BlueprintScreen } from "@/components/workspace/blueprint";
import { useT } from "@/i18n/client";
import { newState, TARGET_SCORE, type AutoState, type PendingIssue } from "@/lib/autopilot";
import { STYLE_IDS, STYLES } from "@/lib/citations/styles";
import { api } from "@/lib/client";
import { LEVEL_LABELS, METHODOLOGY_LABELS, WORK_TYPES, type AcademicLevel, type Methodology } from "@/lib/workflows";
import { Autopilot, type Live } from "./autopilot-engine";

type Purpose = "article" | "guideline" | "data" | "other";
const PURPOSE: Record<Purpose, string> = { article: "Makale / kaynak (kaynak olarak eklenir)", guideline: "Yazım kılavuzu", data: "Araştırma verisi (CSV/XLSX)", other: "Diğer belge (taslak, notlar)" };
const guess = (name: string): Purpose => (/\.(csv|xlsx)$/i.test(name) ? "data" : /kılavuz|kilavuz|guide|yazım|yazim/i.test(name) ? "guideline" : /\.pdf$/i.test(name) ? "article" : "other");
const STATUS_LABEL: Record<string, string> = { blueprint: "Kurgu onayı bekliyor", running: "Çalışıyor", paused: "Duraklatıldı", review: "Onayınız bekleniyor", done: "Teslim edildi", failed: "Hata" };

/**
 * Yönetici modülü (D77): kurgu (konu, kelime, belgeler) yöneticiye sorulur; onaydan sonra çalışma
 * baştan sona otomatik yazılır, kalite kontrolü yapılır, puan 85’in altındaysa düzeltilir ve teslim edilir.
 */
export function AutopilotTab() {
  const [view, setView] = useState<{ kind: "list" } | { kind: "setup" } | { kind: "blueprint"; project: any; stages: any[] } | { kind: "run"; projectId: string }>({ kind: "list" });
  if (view.kind === "setup") return <Setup onCancel={() => setView({ kind: "list" })} onReady={(project, stages) => setView({ kind: "blueprint", project, stages })} />;
  if (view.kind === "blueprint") return (
    <BlueprintStep project={view.project} stages={view.stages} onClose={() => setView({ kind: "list" })} onApproved={() => setView({ kind: "run", projectId: view.project.id })} />
  );
  if (view.kind === "run") return <Runner projectId={view.projectId} onBack={() => setView({ kind: "list" })} />;
  return <JobList onNew={() => setView({ kind: "setup" })} onOpen={async (id, status) => {
    if (status === "blueprint") {
      const [{ project }, { stages }] = await Promise.all([api<{ project: any }>(`/api/projects/${id}`), api<{ stages: any[] }>(`/api/projects/${id}/stages`)]);
      setView({ kind: "blueprint", project, stages });
    } else setView({ kind: "run", projectId: id });
  }} />;
}

function JobList({ onNew, onOpen }: { onNew: () => void; onOpen: (id: string, status: string) => void }) {
  const [rows, setRows] = useState<any[] | null>(null);
  useEffect(() => { api<{ projects: any[] }>("/api/projects?autopilot=1").then((r) => setRows(r.projects)).catch(() => setRows([])); }, []);
  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center gap-4 p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><Rocket className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">Otomatik çalışma</p>
          <p className="text-sm text-ink-500">Kurguyu siz verin; çalışma bütün aşamalarıyla sitenin kurallarına göre yazılır, kalite kontrolünden {TARGET_SCORE}+ puanla geçince teslim edilir. Yalnızca yöneticiler görür.</p>
        </div>
        <Button onClick={onNew}><Plus className="h-4 w-4" /> Yeni otomatik çalışma</Button>
      </div>
      {rows === null ? <p className="text-sm text-ink-500">Yükleniyor…</p> : rows.length === 0 ? <Empty icon={<Rocket className="h-5 w-5" />} title="Henüz otomatik çalışma yok" /> : (
        <div className="space-y-2">
          {rows.map((r) => {
            const a = r.autopilot as AutoState;
            return (
              <div key={r.id} className="card flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{r.title}</p>
                  <p className="text-xs text-ink-500">{WORK_TYPES.find((w) => w.id === r.work_type)?.title} · %{r.progress} · {new Date(r.updated_at).toLocaleString("tr-TR")}</p>
                </div>
                <Badge tone={a?.status === "done" ? "green" : a?.status === "failed" ? "red" : a?.status === "running" ? "brand" : "amber"}>{STATUS_LABEL[a?.status] ?? a?.status}</Badge>
                {a?.score != null && <Badge tone={a.score >= TARGET_SCORE ? "green" : "amber"}>Puan {a.score}</Badge>}
                <Button size="sm" variant="secondary" onClick={() => onOpen(r.id, a?.status)}>{a?.status === "done" ? "Görüntüle" : a?.status === "blueprint" ? "Kurguyu aç" : "Aç / sürdür"}</Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Setup({ onCancel, onReady }: { onCancel: () => void; onReady: (project: any, stages: any[]) => void }) {
  const toast = useToast();
  const [workType, setWorkType] = useState("thesis");
  const wt = WORK_TYPES.find((w) => w.id === workType)!;
  const [level, setLevel] = useState<AcademicLevel>("master");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [methodology, setMethodology] = useState<Methodology>("quantitative");
  const [language, setLanguage] = useState<"tr" | "en">("tr");
  const [style, setStyle] = useState("apa7");
  const [university, setUniversity] = useState("");
  const [words, setWords] = useState(20000);
  const [idea, setIdea] = useState("");
  const [files, setFiles] = useState<{ file: File; purpose: Purpose }[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function start() {
    try {
      setBusy("Çalışma oluşturuluyor…");
      // D170: veri dosyası yüklenmeden otomatik yazılan makale kaynaklara dayalı (kuramsal) yapıda kurulur:
      // Giriş → içeriğe özgü konu bölümleri → Sonuç; Yöntem/Bulgular ve [VERİ GİRİLECEK] olmaz
      const hasData = files.some((x) => x.purpose === "data");
      const meth: Methodology = (workType === "journal_article" || workType === "research_article") && !hasData ? "theoretical" : methodology;
      const { project } = await api<{ project: any }>("/api/projects", { method: "POST", json: {
        title: (title.trim() || topic.trim()).slice(0, 300), workType, level: wt.levels.includes(level) ? level : wt.levels[0], methodology: meth, discipline, language, citationStyle: style, topic: topic.trim(), university: university.trim() || undefined,
      } });
      await api(`/api/projects/${project.id}`, { method: "PATCH", json: { context: { autopilot: newState() } } });
      // Belgeler: makaleler kaynak olarak, kılavuz ve diğer belgeler proje içinde aranabilir metin olarak
      const notes: string[] = [];
      for (const [i, f] of files.entries()) {
        setBusy(`Belgeler yükleniyor (${i + 1}/${files.length}): ${f.file.name}`);
        const fd = new FormData();
        fd.append("file", f.file); fd.append("projectId", project.id); fd.append("purpose", f.purpose === "article" ? "article" : f.purpose === "guideline" ? "guideline" : f.purpose === "data" ? "data" : "other");
        const res = await fetch("/api/files", { method: "POST", body: fd });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) { toast({ tone: "warning", title: `${f.file.name} yüklenemedi`, detail: j.error }); continue; }
        if (f.purpose === "article") await api(`/api/files/${j.file.id}/to-source`, { method: "POST", json: { source: {} } }).catch((e) => toast({ tone: "warning", title: `${f.file.name} kaynak olarak eklenemedi`, detail: (e as Error).message }));
        notes.push(`${PURPOSE[f.purpose]}: ${f.file.name}`);
      }
      setBusy("Kurgu hazırlanıyor (20–60 sn)…");
      const input = [idea.trim(), notes.length ? `Yüklenen belgeler (projeye eklendi; kılavuz ve belgelerdeki kurallara uy):\n- ${notes.join("\n- ")}` : ""].filter(Boolean).join("\n\n");
      const { blueprint } = await api<{ blueprint: any }>(`/api/projects/${project.id}/blueprint`, { method: "POST", json: { mode: "generate", input: input.slice(0, 2000), targetWords: words } });
      await api(`/api/projects/${project.id}/blueprint`, { method: "PUT", json: { blueprint } });
      const [{ project: fresh }, { stages }] = await Promise.all([api<{ project: any }>(`/api/projects/${project.id}`), api<{ stages: any[] }>(`/api/projects/${project.id}/stages`)]);
      onReady(fresh, stages);
    } catch (e) {
      toast({ tone: "error", title: "Başlatılamadı", detail: (e as Error).message });
    } finally { setBusy(null); }
  }

  if (busy) return <div className="card flex items-center gap-3 p-8 text-ink-700"><Loader2 className="h-5 w-5 animate-spin text-brand-600" /> {busy}</div>;

  return (
    <div className="card space-y-5 p-6">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Yeni otomatik çalışma: kurgu bilgileri</h2><button onClick={onCancel} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100" aria-label="Kapat"><X className="h-4 w-4" /></button></div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block"><span className="label">Çalışma türü</span><select className="input" value={workType} onChange={(e) => setWorkType(e.target.value)}>{WORK_TYPES.filter((w) => w.id !== "text_editing" && w.id !== "source_research").map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}</select></label>
        <label className="block"><span className="label">Seviye</span><select className="input" value={level} onChange={(e) => setLevel(e.target.value as AcademicLevel)}>{wt.levels.map((l) => <option key={l} value={l}>{LEVEL_LABELS[l as AcademicLevel]}</option>)}</select></label>
        <label className="block"><span className="label">Yöntem yaklaşımı</span><select className="input" value={methodology} onChange={(e) => setMethodology(e.target.value as Methodology)}>{Object.entries(METHODOLOGY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>{(workType === "journal_article" || workType === "research_article") && !files.some((x) => x.purpose === "data") && <span className="mt-1 block text-xs text-ink-500">Veri dosyası yüklenmediği için makale kaynaklara dayalı yazılır: Giriş → içeriğe özgü konu bölümleri → Sonuç (Yöntem/Bulgular yok).</span>}</label>
      </div>
      <label className="block"><span className="label">Konu ve kapsam (zorunlu)</span><textarea className="input min-h-[90px]" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="ör. Kablo kanallarında kablo çekme işlemini otomatikleştiren mobil robotun tasarımı ve saha performansının değerlendirilmesi" /></label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block"><span className="label">Geçici başlık (isteğe bağlı)</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="block"><span className="label">Disiplin</span><input className="input" value={discipline} onChange={(e) => setDiscipline(e.target.value)} placeholder="ör. Makine mühendisliği" /></label>
        <label className="block"><span className="label">Üniversite / enstitü (isteğe bağlı)</span><input className="input" value={university} onChange={(e) => setUniversity(e.target.value)} /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="block"><span className="label">Hedef uzunluk (toplam kelime)</span><input className="input" inputMode="numeric" value={words || ""} onChange={(e) => setWords(Math.min(200000, Number(e.target.value.replace(/\D/g, "")) || 0))} /><span className="mt-1 block text-xs text-ink-400">≈ {Math.round((words || 0) / 275)} sayfa; bölümlere otomatik dağıtılır</span></label>
        <label className="block"><span className="label">Dil</span><select className="input" value={language} onChange={(e) => setLanguage(e.target.value as "tr" | "en")}><option value="tr">Türkçe</option><option value="en">İngilizce</option></select></label>
        <label className="block"><span className="label">Atıf stili</span><select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLE_IDS.map((s) => <option key={s} value={s}>{STYLES[s].label}</option>)}</select></label>
      </div>
      <label className="block"><span className="label">Fikir, danışman notları, kısıtlar (isteğe bağlı)</span><textarea className="input min-h-[80px]" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="ör. Karma yöntem; prototip saha testleri ve 10 teknisyenle görüşme. Hipotezler robot ile manuel döşemenin karşılaştırılmasına dayansın." /></label>

      <div className="rounded-2xl border border-dashed border-ink-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="flex-1 text-sm font-medium text-ink-800">Elinizdeki belgeler (makaleler, yazım kılavuzu, veri dosyası, taslaklar)</p>
          <input ref={fileInput} type="file" multiple className="hidden" accept=".pdf,.docx,.txt,.md,.csv,.xlsx" onChange={(e) => { const l = Array.from(e.target.files ?? []); setFiles((x) => [...x, ...l.map((file) => ({ file, purpose: guess(file.name) }))]); e.target.value = ""; }} />
          <Button size="sm" variant="secondary" onClick={() => fileInput.current?.click()}><FileUp className="h-4 w-4" /> Belge ekle</Button>
        </div>
        {files.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {files.map((f, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink-700">{f.file.name}</span>
                <select className="input !h-9 !w-auto !py-1 text-[13px]" value={f.purpose} onChange={(e) => setFiles((x) => x.map((y, k) => (k === i ? { ...y, purpose: e.target.value as Purpose } : y)))}>{Object.entries(PURPOSE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                <button onClick={() => setFiles((x) => x.filter((_, k) => k !== i))} className="rounded p-1 text-ink-400 hover:text-rose-600" aria-label="Kaldır"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-xs text-ink-400">Veri dosyası yüklenmezse bulgular uydurulmaz; ilgili yerlere [VERİ GİRİLECEK] yazılır (bu durumda kalite puanı düşük kalabilir).</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Vazgeç</Button>
        <Button onClick={start} disabled={topic.trim().length < 10 || !words}><Rocket className="h-4 w-4" /> Kurguyu hazırla</Button>
      </div>
    </div>
  );
}

function BlueprintStep({ project, stages, onClose, onApproved }: { project: any; stages: any[]; onClose: () => void; onApproved: () => void }) {
  const [p, setP] = useState(project);
  return <BlueprintScreen open project={p} stages={stages} onSaved={setP} onClose={onClose} onApproved={onApproved} />;
}

function Runner({ projectId, onBack }: { projectId: string; onBack: () => void }) {
  const { t } = useT();
  const [state, setState] = useState<AutoState | null>(null);
  const [live, setLive] = useState<Live>({ sourcesAdded: 0 });
  const [project, setProject] = useState<any>(null);
  const [stages, setStages] = useState<any[]>([]);
  const engine = useRef<Autopilot | null>(null);
  const refresh = () => {
    api<{ stages: any[] }>(`/api/projects/${projectId}/stages`).then((r) => setStages(r.stages)).catch(() => {});
    api<{ project: any }>(`/api/projects/${projectId}`).then((r) => setProject(r.project)).catch(() => {});
  };

  useEffect(() => {
    let alive = true;
    api<{ project: any }>(`/api/projects/${projectId}`).then(({ project }) => {
      if (!alive) return;
      setProject(project);
      const st: AutoState = project.context?.autopilot ?? newState();
      setState(st);
      engine.current = new Autopilot(projectId, st, t, (s, l) => { setState(s); setLive(l); });
      if (st.status !== "done" && st.status !== "review") void start();
    });
    refresh();
    const iv = setInterval(refresh, 15000);
    const warn = (e: BeforeUnloadEvent) => { if (engine.current && !engine.current.stopped && state?.status === "running") { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => { alive = false; clearInterval(iv); engine.current?.stop(); window.removeEventListener("beforeunload", warn); };
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() { await engine.current?.run(); refresh(); }
  const running = state?.status === "running";
  const doneCount = stages.filter((s) => s.key !== "references" && s.status === "done").length;
  const total = stages.filter((s) => s.key !== "references").length;

  return (
    <div className="space-y-4">
      <div className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { engine.current?.stop(); onBack(); }} className="text-sm text-ink-500 hover:text-ink-800">← Otomatik çalışmalar</button>
          <Badge tone={state?.status === "done" ? "green" : state?.status === "failed" ? "red" : running ? "brand" : "amber"}>{STATUS_LABEL[state?.status ?? "running"]}</Badge>
          {state?.score != null && <Badge tone={state.score >= TARGET_SCORE ? "green" : "amber"}>Kalite puanı {state.score}</Badge>}
          <div className="ml-auto flex gap-2">
            {running ? <Button size="sm" variant="secondary" onClick={() => engine.current?.stop()}><Pause className="h-4 w-4" /> Duraklat</Button>
              : state?.status !== "done" && state?.status !== "review" && <Button size="sm" onClick={start}><Play className="h-4 w-4" /> Sürdür</Button>}
            <a href={`/proje/${projectId}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-sm font-medium text-ink-800 hover:bg-ink-50"><ExternalLink className="h-4 w-4" /> Çalışmayı aç</a>
            {state?.status === "done" && <a href={`/api/projects/${projectId}/export?format=docx`} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-ink-900 px-3 text-sm font-medium text-white hover:bg-ink-800"><Download className="h-4 w-4" /> Word</a>}
          </div>
        </div>
        <p className="font-serif text-xl text-ink-950">{project?.title ?? "…"}</p>
        <div>
          <div className="mb-1 flex justify-between text-xs text-ink-500"><span>{doneCount}/{total} bölüm</span><span>{live.sourcesAdded ? `${live.sourcesAdded} yeni kaynak eklendi` : ""}</span></div>
          <div className="h-2 rounded-full bg-ink-100"><div className="h-2 rounded-full bg-brand-500 transition-all" style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }} /></div>
        </div>
        {running && (
          <div className="rounded-xl bg-brand-50/60 p-3 text-sm text-ink-800">
            <p className="flex items-center gap-2 font-medium"><Loader2 className="h-4 w-4 animate-spin text-brand-600" /> {live.stage}{live.step ? ` · ${live.step}` : ""}</p>
            {live.status && <p className="mt-1 text-[13px] text-ink-500">{live.status}</p>}
            <p className="mt-1 text-xs text-ink-400">Bu sekmeyi açık tutun. Kapatırsanız iş durur; buradan “Sürdür” ile kaldığı yerden devam eder. Uzun bir tez 1–2 saat sürebilir.</p>
          </div>
        )}
        {state?.status === "review" && (
          <ReviewPanel
            pending={state.pending ?? []}
            score={state.score}
            stageTitle={(k) => stages.find((s) => s.key === k)?.title}
            onContinue={async (fix) => { await engine.current?.resolveReview(fix); refresh(); }}
            onDeliver={async () => { await engine.current?.deliverAsIs(); refresh(); }}
          />
        )}
        {state?.status === "done" && (
          <div className={cn("rounded-xl p-3 text-sm", (state.score ?? 0) >= TARGET_SCORE ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900")}>
            {(state.score ?? 0) >= TARGET_SCORE ? `Çalışma kalite kontrolünden ${state.score} puanla geçti ve teslime hazır.` : state.note || `Çalışma tamamlandı; puan ${state.score}.`}
            {" "}<a className="font-medium underline" href={`/proje/${projectId}/kalite`} target="_blank" rel="noopener noreferrer">Kalite raporunu gör</a>
          </div>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="card p-4">
          <p className="mb-2 text-sm font-semibold text-ink-900">Aşamalar</p>
          <ul className="space-y-1">
            {stages.filter((s) => s.key !== "references").map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-[13.5px]">
                {s.status === "done" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : live.stage === s.title && running ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-600" /> : <CircleDashed className="h-4 w-4 shrink-0 text-ink-300" />}
                <span className="min-w-0 flex-1 truncate text-ink-800">{s.title}</span>
                {s.word_count > 0 && <span className="text-xs text-ink-400">{s.word_count.toLocaleString("tr-TR")} kelime</span>}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <p className="mb-2 text-sm font-semibold text-ink-900">Günlük</p>
          <ul className="max-h-[420px] space-y-1 overflow-y-auto text-[13px]">
            {[...(state?.log ?? [])].reverse().map((l, i) => <li key={i} className="flex gap-2"><span className="shrink-0 font-mono text-[11px] text-ink-400">{new Date(l.at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span><span className="text-ink-700">{l.text}</span></li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

const REASON: Record<PendingIssue["reason"], string> = {
  data: "Gerçek araştırma verisi gerekiyor; sistem veri uyduramaz. Veriyi siz girebilirsiniz.",
  attempted: "Otomatik düzeltme bir kez denendi, bulgu sürüyor.",
  manual: "Otomatik düzeltme kapsamında değil.",
};

/**
 * Döngü önleme (D78): otomatik düzeltilemeyen veya düzeltmeye rağmen süren bulgular listelenir; yönetici
 * hangilerinin bir kez daha düzeltileceğini, hangilerinin olduğu gibi kalacağını seçer.
 */
function ReviewPanel({ pending, score, stageTitle, onContinue, onDeliver }: { pending: PendingIssue[]; score: number | null; stageTitle: (k: string) => string | undefined; onContinue: (fix: string[]) => Promise<void>; onDeliver: () => Promise<void> }) {
  const [fix, setFix] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const toggle = (k: string) => setFix((f) => { const n = new Set(f); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const go = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };
  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-sm">
      <div>
        <p className="font-semibold text-ink-900">Kalite puanı {score ?? "—"}: {pending.length} bulgu otomatik olarak giderilemedi</p>
        <p className="mt-0.5 text-[13px] text-ink-600">Sistem aynı bulgular için tekrar tekrar düzeltme yapmaz. Bir kez daha düzeltilmesini istediklerinizi işaretleyin; işaretlemedikleriniz olduğu gibi kalır ve bir daha sorulmaz.</p>
      </div>
      <ul className="max-h-[360px] space-y-1.5 overflow-y-auto">
        {pending.map((p) => (
          <li key={p.key} className="flex gap-2.5 rounded-lg bg-white/80 p-2.5">
            <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0" disabled={!p.fixable || busy} checked={fix.has(p.key)} onChange={() => toggle(p.key)} aria-label="Yeniden düzelt" />
            <div className="min-w-0">
              <p className="font-medium text-ink-900">
                <span className={cn("mr-1.5 inline-block h-2 w-2 rounded-full", p.severity === "error" ? "bg-red-500" : p.severity === "warning" ? "bg-amber-500" : "bg-ink-300")} />
                {p.title}{p.stageKey && stageTitle(p.stageKey) ? <span className="font-normal text-ink-500"> · {stageTitle(p.stageKey)}</span> : null}
              </p>
              {p.detail && <p className="text-[13px] text-ink-600">{p.detail}</p>}
              <p className="text-xs text-ink-400">{REASON[p.reason]}{!p.fixable && p.reason !== "data" ? " Elle düzeltilmesi gerekir." : ""}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => go(() => onContinue([...fix]))}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} {fix.size ? `${fix.size} bulguyu düzelt, diğerleri kalsın` : "Hepsi olduğu gibi kalsın"}</Button>
        <Button size="sm" variant="secondary" disabled={busy} onClick={() => go(onDeliver)}>Bu hâliyle teslim et</Button>
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
