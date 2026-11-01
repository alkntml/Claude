"use client";
import { motion } from "framer-motion";
import { AlertTriangle, Brain, Check, History, MessageSquare, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Empty } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { findDuplicates, missingFields, FIELD_LABELS } from "@/lib/citations/checks";
import type { CitationEngine } from "@/lib/citations/styles";
import { richToHtml } from "@/lib/citations/util";
import { api } from "@/lib/client";
import { sourceRowToItemClient } from "@/lib/sources/row";
import { timeAgo } from "@/components/dashboard/dashboard";

/* eslint-disable @typescript-eslint/no-explicit-any */
const KIND_LABEL: Record<string, string> = { fact: "Bilgi", decision: "Karar", concept: "Kavram", variable: "Değişken", question: "Araştırma sorusu", hypothesis: "Hipotez", note: "Not" };

export function MemoryPanel({ projectId, memory, setMemory }: { projectId: string; memory: any[]; setMemory: (fn: (m: any[]) => any[]) => void }) {
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
    } catch (e) { toast({ tone: "error", title: "Eklenemedi", detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function del(id: string) {
    await api(`/api/projects/${projectId}/memory`, { method: "DELETE", json: { itemId: id } }).catch(() => {});
    setMemory((m) => m.filter((x) => x.id !== id));
  }
  const grouped = Object.entries(KIND_LABEL).map(([k, l]) => ({ k, l, items: memory.filter((m) => m.kind === k) })).filter((g) => g.items.length);
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <p className="rounded-xl bg-violet-50 p-3 text-[12.5px] text-violet-800"><Brain className="mr-1 inline h-3.5 w-3.5" /> Proje hafızası her asistan isteğine eklenir. Bölümler arasında geçseniz de kararlarınız, kavram tanımlarınız ve hipotezleriniz korunur.</p>
        {grouped.length === 0 && <Empty icon={<Brain className="h-5 w-5" />} title="Hafıza boş">Asistanla çalıştıkça onayladığınız kararlar buraya eklenir. Ayrıca elle de ekleyebilirsiniz.</Empty>}
        {grouped.map((g) => (
          <div key={g.k}>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">{g.l}</p>
            <div className="space-y-1.5">
              {g.items.map((m) => (
                <motion.div layout key={m.id} className="group flex items-start gap-2 rounded-xl border border-ink-100 bg-white px-3 py-2 text-[13px] text-ink-700">
                  <span className="flex-1">{m.content}</span>
                  {m.source === "ai" && <Badge tone="violet" className="!text-[10px]">AI</Badge>}
                  <button onClick={() => del(m.id)} className="text-ink-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100" aria-label="Sil"><Trash2 className="h-3.5 w-3.5" /></button>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2 border-t border-ink-100 p-3">
        <select className="input !py-2 text-sm" value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <div className="flex gap-2"><input className="input !py-2 text-sm" placeholder="ör. Örneklem 18–30 yaş üniversite öğrencileri" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && text.trim() && add()} /><Button size="sm" onClick={add} loading={busy} disabled={!text.trim()} className="!h-10"><Plus className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}

export function CommentsPanel({ stageId, selection }: { stageId: string; selection: string }) {
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
  async function del(c: any) {
    await api(`/api/stages/${stageId}/comments`, { method: "PATCH", json: { commentId: c.id, delete: true } });
    setList((l) => l.filter((x) => x.id !== c.id));
  }
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {list.length === 0 && <Empty icon={<MessageSquare className="h-5 w-5" />} title="Yorum yok">Metinden bir bölüm seçip not bırakabilirsiniz (danışman geri bildirimi, yapılacaklar vb.).</Empty>}
        {list.map((c) => (
          <div key={c.id} className={`rounded-xl border p-3 text-[13px] ${c.resolved ? "border-ink-100 bg-ink-50 text-ink-400" : "border-amber-100 bg-amber-50/50 text-ink-700"}`}>
            {c.quote && <p className="mb-1.5 border-l-2 border-amber-300 pl-2 font-serif italic text-ink-500">“{c.quote.slice(0, 200)}”</p>}
            {c.author_name && <p className="mb-1 text-[11px] font-semibold text-brand-700">Danışman: {c.author_name}</p>}
            <p className={c.resolved ? "line-through" : ""}>{c.body}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px]"><span className="text-ink-400">{timeAgo(c.created_at)}</span><button onClick={() => toggle(c)} className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" />{c.resolved ? "Yeniden aç" : "Çözüldü"}</button><button onClick={() => del(c)} className="text-rose-500">Sil</button></div>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-100 p-3">
        {selection && <p className="mb-1.5 truncate text-[11px] text-ink-400">Seçili metne bağlanacak: “{selection.slice(0, 60)}”</p>}
        <div className="flex gap-2"><input className="input !py-2 text-sm" placeholder="Yorum ekle…" value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => e.key === "Enter" && body.trim() && add()} /><Button size="sm" className="!h-10" onClick={add} disabled={!body.trim()}><Plus className="h-4 w-4" /></Button></div>
      </div>
    </div>
  );
}

export function HistoryPanel({ stageId, onRestore, onSnapshot, version }: { stageId: string; onRestore: (stage: any) => void; onSnapshot: () => Promise<void>; version: number }) {
  const toast = useToast();
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<{ revisions: any[] }>(`/api/stages/${stageId}/revisions`).then((r) => setList(r.revisions)).catch(() => {}); }, [stageId, version]);
  async function restore(id: string) {
    if (!confirm("Bu sürüm geri yüklensin mi? Mevcut metin otomatik olarak yedeklenir.")) return;
    const { stage } = await api<{ stage: any }>(`/api/stages/${stageId}/revisions`, { method: "POST", json: { revisionId: id } });
    onRestore(stage);
    toast({ tone: "success", title: "Sürüm geri yüklendi" });
  }
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-100 p-3"><Button size="sm" variant="secondary" className="w-full" loading={busy} onClick={async () => { setBusy(true); await onSnapshot(); setBusy(false); }}><Save className="h-3.5 w-3.5" /> Şimdiki hâli sürüm olarak kaydet</Button></div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-4">
        {list.length === 0 && <Empty icon={<History className="h-5 w-5" />} title="Sürüm yok">Asistandan metin eklediğinizde ve elle kaydettiğinizde sürümler burada saklanır.</Empty>}
        {list.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink-800">{r.note || "Sürüm"}</p>
              <p className="text-[11px] text-ink-400">{new Date(r.created_at).toLocaleString("tr-TR")} · {r.word_count} kelime · {r.author === "ai" ? "AI ekleme" : r.author === "system" ? "Otomatik" : "Elle"}</p>
            </div>
            <button onClick={() => restore(r.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-800" title="Geri yükle"><RotateCcw className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BibliographyView({ engine, sources, citedOrder, title }: { engine: CitationEngine; sources: any[]; citedOrder: string[]; title: string }) {
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
      <p className="mt-2 text-sm text-ink-500">{engine.meta.label} stiline göre otomatik oluşturulur. Metinde atıf yapılan {entries.length} kaynak listelenir. Stili değiştirdiğinizde liste kendiliğinden güncellenir.</p>
      {(incomplete.length > 0 || dups.length > 0 || uncited.length > 0 || unverified.length > 0) && (
        <div className="mt-6 space-y-2">
          {incomplete.map(({ it, miss }) => <p key={it.id} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> <span><b>{it.title.slice(0, 70)}</b>: {miss.map((m) => FIELD_LABELS[m] ?? m).join(", ")} eksik</span></p>)}
          {unverified.map((s) => <p key={s.id} className="flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-800"><AlertTriangle className="h-4 w-4 shrink-0" /> <span><b>{s.title.slice(0, 70)}</b> doğrulanmadı</span></p>)}
          {dups.map((d, i) => <p key={i} className="flex gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-700"><AlertTriangle className="h-4 w-4 shrink-0" /> {d.ids.length} kayıt aynı eser olabilir ({d.reason === "doi" ? "aynı DOI" : "benzer başlık"}).</p>)}
          {uncited.length > 0 && <p className="flex gap-2 rounded-xl bg-ink-100 px-3 py-2 text-[13px] text-ink-600"><AlertTriangle className="h-4 w-4 shrink-0" /> {uncited.length} kaynak metinde atıf almadığı için kaynakçaya eklenmedi.</p>}
        </div>
      )}
      <ol className="mt-8 space-y-3.5 font-serif text-[16px] leading-7 text-ink-800">
        {entries.length === 0 && <p className="font-sans text-sm text-ink-400">Henüz metinde atıf yok. Bölümlerde kaynaklarınıza atıf yaptıkça kaynakça burada oluşur.</p>}
        {entries.map((e) => (
          <li key={e.id} className={engine.meta.family === "numeric" ? "flex gap-3" : "pl-8 -indent-8"}>
            {engine.meta.family === "numeric" && <span className="w-8 shrink-0 font-sans text-sm text-ink-400">[{e.number}]</span>}
            <span dangerouslySetInnerHTML={{ __html: richToHtml(e.rich) }} />
          </li>
        ))}
      </ol>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
