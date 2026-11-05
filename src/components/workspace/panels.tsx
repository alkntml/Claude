"use client";
import { useT } from "@/i18n/client";
import { motion } from "framer-motion";
import { Wand2, AlertTriangle, ArrowRight, Brain, Check, ChevronDown, FileUp, History, Loader2, MessageSquare, Plus, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Empty } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { DeleteButton } from "@/components/ui/delete-button";
import { findDuplicates, missingFields, FIELD_LABELS } from "@/lib/citations/checks";
import type { CitationEngine } from "@/lib/citations/styles";
import { richToHtml } from "@/lib/citations/util";
import { api, handlePlanError } from "@/lib/client";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { citationUsages, type JSONNode } from "@/lib/editor/doc";
import { cn } from "@/components/ui/cn";
import { timeAgo } from "@/components/dashboard/dashboard";

/* eslint-disable @typescript-eslint/no-explicit-any */
const KIND_LABEL: Record<string, string> = { fact: "Bilgi", decision: "Karar", concept: "Kavram", variable: "Değişken", question: "Araştırma sorusu", hypothesis: "Hipotez", note: "Not" };

export function MemoryPanel({ projectId, memory, setMemory }: { projectId: string; memory: any[]; setMemory: (fn: (m: any[]) => any[]) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [kind, setKind] = useState("decision");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  async function add() {
    setBusy(true);
    try {
      const { item } = await api<{ item: any }>(`/api/projects/${projectId}/memory`, { method: "POST", json: { kind, content: text } });
      setMemory((m) => [...m, item]);
      setText("");
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  // Belgeden öğren (D88): belge okunur, önemli bilgiler hafızaya eklenir
  const fileRef = useRef<HTMLInputElement>(null);
  const [learning, setLearning] = useState<string | null>(null);
  async function learn(file: File) {
    setLearning(file.name);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/projects/${projectId}/memory/learn`, { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { handlePlanError(res.status, j); throw new Error(j.error ?? t("Belge okunamadı")); }
      const items = (j.items ?? []) as any[];
      setMemory((m) => [...m, ...items]);
      toast(items.length
        ? { tone: "success", title: t("{n} bilgi hafızaya eklendi", { n: items.length }), detail: j.truncated ? t("Belge uzun olduğu için ilk bölümü okundu.") : t("Asistan bundan sonraki isteklerde bu bilgileri kullanacak.") }
        : { tone: "info", title: t("Belgede hafızaya eklenecek yeni bilgi bulunamadı") });
    } catch (e) { toast({ tone: "error", title: t("Belgeden öğrenilemedi"), detail: (e as Error).message }); }
    finally { setLearning(null); if (fileRef.current) fileRef.current.value = ""; }
  }
  const grouped = Object.entries(KIND_LABEL).map(([k, l]) => ({ k, l, items: memory.filter((m) => m.kind === k) })).filter((g) => g.items.length);
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="rounded-xl bg-violet-50 p-3 text-[12.5px] text-violet-800"><Brain className="mr-1 inline h-3.5 w-3.5" /> {t("Proje hafızası her asistan isteğine eklenir. Bölümler arasında geçseniz de kararlarınız, kavram tanımlarınız ve hipotezleriniz korunur.")}</p>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) learn(f); }} />
        <button type="button" disabled={!!learning} onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-violet-200 bg-white px-3 py-2.5 text-left text-[13px] transition hover:border-violet-400 hover:bg-violet-50/50 disabled:opacity-70">
          {learning ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-violet-600" /> : <FileUp className="h-4 w-4 shrink-0 text-violet-600" />}
          <span className="min-w-0 flex-1"><span className="block font-medium text-ink-800">{learning ? t("“{n}” okunuyor…", { n: learning }) : t("Belgeden öğren")}</span><span className="block text-[11.5px] text-ink-500">{t("PDF, Word veya metin yükleyin; asistan okuyup önemli bilgileri hafızaya kaydeder.")}</span></span>
        </button>
        {grouped.length === 0 && <Empty icon={<Brain className="h-5 w-5" />} title={t("Hafıza boş")}>{t("Asistanla çalıştıkça onayladığınız kararlar buraya eklenir. Ayrıca elle de ekleyebilirsiniz.")}</Empty>}
        {grouped.map((g) => (
          <div key={g.k}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{t(g.l)}</p>
            <div className="space-y-1.5">
              {g.items.map((m) => (
                <motion.div layout key={m.id} className="group flex items-start gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 text-[13px] text-ink-700">
                  <span className="flex-1">{m.content}</span>
                  {m.source === "ai" && <Badge tone="violet" className="!text-[10px]">{t("AI")}</Badge>}
                  <DeleteButton className="-m-1 sm:opacity-0 sm:group-hover:opacity-100" confirmText={t("Bu hafıza kaydı kalıcı olarak silinsin mi?")} onDelete={() => api(`/api/projects/${projectId}/memory`, { method: "DELETE", json: { itemId: m.id } })} onDone={() => setMemory((l) => l.filter((x) => x.id !== m.id))} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-ink-100 p-3">
        <select className="input !py-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{t(l)}</option>)}</select>
        <div className="flex gap-2"><input className="input !py-2 text-sm" placeholder={t("ör. Örneklem 18–30 yaş üniversite öğrencileri")} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && text.trim() && add()} /><Button size="sm" onClick={add} loading={busy} disabled={!text.trim()} className="!h-10"><Plus className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}

export function CommentsPanel({ stageId, selection, onApply }: { stageId: string; selection: string; onApply?: (c: { body: string; quote: string | null }) => void }) {
  const { t, dl } = useT();
  const [list, setList] = useState<any[]>([]);
  const [body, setBody] = useState("");
  useEffect(() => { api<{ comments: any[] }>(`/api/stages/${stageId}/comments`).then((r) => setList(r.comments)).catch(() => {}); }, [stageId]);
  async function add() {
    const { comment } = await api<{ comment: any }>(`/api/stages/${stageId}/comments`, { method: "POST", json: { body, quote: selection.slice(0, 1000) } });
    setList((l) => [...l, comment]);
    setBody("");
  }
  async function toggle(c: any) {
    await api(`/api/stages/${stageId}/comments`, { method: "PATCH", json: { commentId: c.id, resolved: !c.resolved } });
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, resolved: !x.resolved } : x)));
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {list.length === 0 && <Empty icon={<MessageSquare className="h-5 w-5" />} title={t("Yorum yok")}>{t("Metinden bir bölüm seçip not bırakabilirsiniz (danışman geri bildirimi, yapılacaklar vb.).")}</Empty>}
        {list.map((c) => (
          <div key={c.id} className={`rounded-xl border p-3 text-[13px] ${c.resolved ? "border-ink-100 bg-ink-50 text-ink-400" : "border-amber-100 bg-amber-50/50 text-ink-700"}`}>
            {c.quote && <p className="mb-1.5 border-l-2 border-amber-300 pl-2 font-serif italic text-ink-500">“{c.quote.slice(0, 200)}”</p>}
            {c.author_name && <p className="mb-1 text-[11px] font-semibold text-brand-700">{t("Danışman:")} {c.author_name}</p>}
            <p className={c.resolved ? "line-through" : ""}>{c.body}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px]"><span className="text-ink-400">{timeAgo(c.created_at, t, dl)}</span><button onClick={() => toggle(c)} className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" />{c.resolved ? t("Yeniden aç") : t("Çözüldü")}</button><DeleteButton className="-my-1 !p-1 text-rose-500" withText confirmText={t("Bu yorum kalıcı olarak silinsin mi?")} onDelete={() => api(`/api/stages/${stageId}/comments`, { method: "PATCH", json: { commentId: c.id, delete: true } })} onDone={() => setList((l) => l.filter((x) => x.id !== c.id))} />{!c.resolved && onApply && <button onClick={() => { onApply({ body: c.body, quote: c.quote ?? null }); toggle(c); }} className="ml-auto flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 font-medium text-white hover:bg-brand-700"><Wand2 className="h-3 w-3" />{t("Asistanla uygula")}</button>}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100 p-3">
        {selection && <p className="mb-1.5 truncate text-[11px] text-ink-400">{t("Seçili metne bağlanacak:")} “{selection.slice(0, 60)}”</p>}
        <div className="flex gap-2"><input className="input !py-2 text-sm" placeholder={t("Yorum ekle…")} value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => e.key === "Enter" && body.trim() && add()} /><Button size="sm" className="!h-10" onClick={add} disabled={!body.trim()}><Plus className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}

export function HistoryPanel({ stageId, onRestore, onSnapshot, version }: { stageId: string; onRestore: (stage: any) => void; onSnapshot: () => Promise<void>; version: number }) {
  const { t, dl } = useT();
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ revisions: any[] }>(`/api/stages/${stageId}/revisions`).then((r) => setList(r.revisions)).catch(() => {}); }, [stageId, version]);
  async function restore(id: string) {
    if (!confirm(t("Bu sürüm geri yüklensin mi? Mevcut metin otomatik olarak yedeklenir."))) return;
    const { stage } = await api<{ stage: any }>(`/api/stages/${stageId}/revisions`, { method: "POST", json: { revisionId: id } });
    onRestore(stage);
    toast({ tone: "success", title: t("Sürüm geri yüklendi") });
  }
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-100 p-3"><Button size="sm" variant="secondary" className="w-full" loading={busy} onClick={async () => { setBusy(true); await onSnapshot(); setBusy(false); }}><Save className="h-3.5 w-3.5" /> {t("Şimdiki hâli sürüm olarak kaydet")}</Button></div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {list.length === 0 && <Empty icon={<History className="h-5 w-5" />} title={t("Sürüm yok")}>{t("Asistandan metin eklediğinizde ve elle kaydettiğinizde sürümler burada saklanır.")}</Empty>}
        {list.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink-800">{r.note ? t(r.note) : t("Sürüm")}</p>
              <p className="text-[11px] text-ink-400">{new Date(r.created_at).toLocaleString(dl)} · {t("{n} kelime", { n: r.word_count })} · {r.author === "ai" ? t("AI ekleme") : r.author === "system" ? t("Otomatik") : t("Elle")}</p>
            </div>
            <button onClick={() => restore(r.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-800" title={t("Geri yükle")}><RotateCcw className="h-4 w-4" /></button>
            <DeleteButton label={t("Sürümü sil")} confirmText={t("Bu sürüm kalıcı olarak silinsin mi? Bölümün şimdiki metni etkilenmez.")} onDelete={() => api(`/api/stages/${stageId}/revisions`, { method: "DELETE", json: { revisionId: r.id } })} onDone={() => setList((l) => l.filter((x) => x.id !== r.id))} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function BibliographyView({ engine, sources, citedOrder, title, stages, onJump }: { engine: CitationEngine; sources: any[]; citedOrder: string[]; title: string; stages: { id: string; title: string; content: any }[]; onJump: (stageId: string, sourceId: string, occurrence: number) => void }) {
  const { t } = useT();
  const [open, setOpen] = useState<string | null>(null);
  const usages = useMemo(() => citationUsages(stages.map((s) => ({ id: s.id, title: s.title, content: s.content as JSONNode }))), [stages]);
  const srcById = useMemo(() => Object.fromEntries(sources.map((s) => [s.id, s])), [sources]);
  const items = sources.map(sourceRowToItemClient);
  const cited = new Set(citedOrder);
  const entries = engine.bibliography(citedOrder.filter((id) => sources.some((s) => s.id === id)));
  const uncited = sources.filter((s) => !cited.has(s.id));
  const dups = findDuplicates(items);
  const incomplete = items.filter((it) => cited.has(it.id)).map((it) => ({ it, miss: missingFields(it) })).filter((x) => x.miss.length);
  const unverified = sources.filter((s) => cited.has(s.id) && !s.verified);
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="font-serif text-3xl font-medium text-ink-950">{title}</h2>
      <p className="mt-2 text-sm text-ink-500">{t("{style} stiline göre otomatik oluşturulur. Metinde atıf yapılan {n} kaynak listelenir. Stili değiştirdiğinizde liste kendiliğinden güncellenir.", { style: engine.meta.label, n: entries.length })}</p>
      {(incomplete.length > 0 || dups.length > 0 || uncited.length > 0 || unverified.length > 0) && (
        <div className="mt-6 space-y-2">
          {incomplete.map(({ it, miss }) => <p key={it.id} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> <span><b>{it.title.slice(0, 70)}</b>: {miss.map((m) => FIELD_LABELS[m] ?? m).join(", ")} eksik</span></p>)}
          {unverified.map((s) => <p key={s.id} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> <span><b>{s.title.slice(0, 70)}</b> {t("doğrulanmadı")}</span></p>)}
          {dups.map((d, i) => <p key={i} className="flex gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-700"><AlertTriangle className="h-4 w-4 shrink-0" /> {t("{n} kayıt aynı eser olabilir ({reason}).", { n: d.ids.length, reason: d.reason === "doi" ? t("aynı DOI") : t("benzer başlık") })}</p>)}
          {uncited.length > 0 && <p className="flex gap-2 rounded-xl bg-ink-100 px-3 py-2 text-[13px] text-ink-600"><AlertTriangle className="h-4 w-4 shrink-0" /> {t("{n} kaynak metinde atıf almadığı için kaynakçaya eklenmedi.", { n: uncited.length })}</p>}
        </div>
      )}
      <ol className="mt-8 space-y-2 font-serif text-[16px] leading-7 text-ink-800">
        {entries.length === 0 && <p className="font-sans text-sm text-ink-400">{t("Henüz metinde atıf yok. Bölümlerde kaynaklarınıza atıf yaptıkça kaynakça burada oluşur.")}</p>}
        {entries.map((e) => {
          const list = usages.get(e.id) ?? [];
          const isOpen = open === e.id;
          const src = srcById[e.id];
          return (
            <li key={e.id} className="group">
              <button type="button" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen} className={cn("w-full rounded-xl px-2 py-1.5 text-left transition hover:bg-brand-50/60", isOpen && "bg-brand-50/70", engine.meta.family === "numeric" ? "flex gap-3" : "")}>
                {engine.meta.family === "numeric" && <span className="w-8 shrink-0 font-sans text-sm text-ink-400">[{e.number}]</span>}
                <span className={engine.meta.family === "numeric" ? "" : "block pl-8 -indent-8"}>
                  <span dangerouslySetInnerHTML={{ __html: richToHtml(e.rich) }} />
                  <span className="ml-2 inline-flex translate-y-[-1px] items-center gap-1 whitespace-nowrap rounded-full bg-ink-100 px-2 py-0.5 indent-0 font-sans text-[11px] font-medium text-ink-500 group-hover:bg-white">{t("{n} yerde kullanıldı", { n: list.length })}<ChevronDown className={cn("h-3 w-3 transition", isOpen && "rotate-180")} /></span>
                </span>
              </button>
              {isOpen && (
                <div className="mb-2 ml-2 mt-1 space-y-1.5 border-l-2 border-brand-100 pl-3 font-sans text-[13px] leading-snug">
                  {src && <p className="text-[11.5px] text-ink-400">{t(src.access_level === "full_text" ? "Tam metin okundu" : src.access_level === "abstract" ? "Özet okundu" : "Yalnızca künye")}{src.access_level === "full_text" ? "" : ` · ${t("sayfa numarası yalnızca tam metni okunan kaynaklarda yazılır")}`}</p>}
                  {list.map((u, i) => (
                    <div key={i} className="rounded-xl border border-ink-100 bg-white p-2.5">
                      <div className="flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-700">{u.stageTitle}{u.heading ? ` › ${u.heading}` : ""}</p>
                        {u.locator && <Badge tone="brand">{t("s. {p}", { p: u.locator })}</Badge>}
                        <button type="button" onClick={() => onJump(u.stageId, e.id, u.occurrence)} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-50">{t("Git")}<ArrowRight className="h-3.5 w-3.5" /></button>
                      </div>
                      <p className="mt-1 text-ink-500">{u.snippet.split("⟦…⟧").map((part, k, arr) => <span key={k}>{part}{k < arr.length - 1 && <mark className="rounded bg-brand-100 px-1 text-brand-800">{t("atıf")}</mark>}</span>)}</p>
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
