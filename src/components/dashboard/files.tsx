"use client";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BookPlus, Download, FileSpreadsheet, FileText, FolderOpen, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
const PURPOSE: Record<string, string> = { guideline: "Yazım kılavuzu", chapter: "Önceki bölüm", article: "Akademik makale", data: "Veri tablosu", other: "Diğer" };

export function FilesView({ files: initial, projects }: { files: any[]; projects: any[] }) {
  const toast = useToast();
  const [files, setFiles] = useState(initial);
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [purpose, setPurpose] = useState("article");
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [stats, setStats] = useState<{ name: string; summary: any } | null>(null);
  const [toSource, setToSource] = useState<any | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const titles = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  async function upload(list: FileList | null) {
    if (!list) return;
    for (const f of Array.from(list)) {
      setUploading((u) => [...u, f.name]);
      try {
        const fd = new FormData();
        fd.set("file", f);
        if (projectId) fd.set("projectId", projectId);
        fd.set("purpose", /\.(csv|xlsx)$/i.test(f.name) ? "data" : purpose);
        const res = await fetch("/api/files", { method: "POST", body: fd });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error);
        setFiles((l) => [j.file, ...l]);
        if (j.file.extraction_meta?.warning) toast({ tone: "warning", title: f.name, detail: j.file.extraction_meta.warning });
      } catch (e) {
        toast({ tone: "error", title: `${f.name} yüklenemedi`, detail: (e as Error).message });
      } finally {
        setUploading((u) => u.filter((x) => x !== f.name));
      }
    }
  }
  async function del(id: string) {
    if (!confirm("Dosya kalıcı olarak silinsin mi?")) return;
    await api(`/api/files/${id}`, { method: "DELETE" });
    setFiles((l) => l.filter((f) => f.id !== id));
  }
  async function download(id: string) {
    const { downloadUrl } = await api<{ downloadUrl: string }>(`/api/files/${id}`);
    if (downloadUrl) window.open(downloadUrl, "_blank", "noopener");
  }
  async function showStats(f: any) {
    try { setStats({ name: f.name, summary: (await api<{ summary: any }>(`/api/files/${f.id}/stats`)).summary }); }
    catch (e) { toast({ tone: "error", title: "Analiz yapılamadı", detail: (e as Error).message }); }
  }

  return (
    <div>
      <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">Dosyalarım</h1>
      <p className="mt-1 max-w-2xl text-ink-500">Tez yazım kılavuzunu, önceki bölümlerinizi, makaleleri ve veri tablolarını yükleyin. Metinler projede aranabilir hâle gelir ve asistan bunları bağlam olarak kullanır. Dosyalar yalnızca size açık, şifreli bir alanda saklanır.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }} onClick={() => input.current?.click()} className={cn("flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition duration-300", drag ? "scale-[1.01] border-brand-400 bg-brand-50" : "border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/30")}>
          <motion.div animate={drag ? { y: -6, scale: 1.1 } : { y: 0, scale: 1 }} className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><UploadCloud className="h-6 w-6" /></motion.div>
          <p className="mt-3 font-medium text-ink-800">Dosyaları sürükleyip bırakın veya seçin</p>
          <p className="text-sm text-ink-500">PDF, DOCX, XLSX, CSV, TXT. Dosya başına en fazla 25 MB.</p>
          <input ref={input} type="file" multiple accept=".pdf,.docx,.xlsx,.csv,.txt,.md" className="hidden" onChange={(e) => upload(e.target.files)} />
          <AnimatePresence>{uploading.map((u) => <motion.p key={u} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-2 flex items-center gap-2 text-sm text-brand-700"><Loader2 className="h-4 w-4 animate-spin" /> {u} yükleniyor ve analiz ediliyor…</motion.p>)}</AnimatePresence>
        </div>
        <div className="card space-y-3 p-5">
          <div><label className="label">Proje</label><select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">Projeye bağlama</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
          <div><label className="label">Dosya türü</label><select className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)}>{Object.entries(PURPOSE).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <p className="text-xs text-ink-500">CSV ve XLSX dosyaları otomatik olarak “Veri tablosu” kabul edilir.</p>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {files.length === 0 && <Empty icon={<FolderOpen className="h-5 w-5" />} title="Henüz dosya yok" />}
        {files.map((f) => {
          const isData = /csv|sheet/.test(f.mime_type) || /\.(csv|xlsx)$/i.test(f.name);
          return (
            <motion.div layout key={f.id} className="card flex flex-wrap items-center gap-3 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-600">{isData ? <FileSpreadsheet className="h-5 w-5" /> : <FileText className="h-5 w-5" />}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">{f.name}</p>
                <p className="text-xs text-ink-500">{PURPOSE[f.purpose]} · {(f.size_bytes / 1048576).toFixed(2)} MB{f.project_id ? ` · ${titles[f.project_id] ?? ""}` : ""}{f.extraction_meta?.pages ? ` · ${f.extraction_meta.pages} sayfa` : ""}</p>
              </div>
              <Badge tone={f.extraction_status === "done" ? "green" : f.extraction_status === "failed" ? "red" : "ink"}>{f.extraction_status === "done" ? "Metin çıkarıldı" : f.extraction_status === "failed" ? "Okunamadı" : "Bekliyor"}</Badge>
              <div className="flex gap-1">
                {isData && <Button size="sm" variant="soft" onClick={() => showStats(f)}><BarChart3 className="h-3.5 w-3.5" /> İstatistik</Button>}
                {!isData && f.project_id && f.extraction_status === "done" && <Button size="sm" variant="ghost" onClick={() => setToSource(f)}><BookPlus className="h-3.5 w-3.5" /> Kaynak olarak ekle</Button>}
                <Button size="sm" variant="ghost" onClick={() => download(f.id)} aria-label="İndir"><Download className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" onClick={() => del(f.id)} aria-label="Sil"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal open={!!stats} onClose={() => setStats(null)} title={`Betimsel istatistikler — ${stats?.name ?? ""}`} wide>
        {stats && <StatsTable summary={stats.summary} />}
      </Modal>
      <ToSourceModal file={toSource} onClose={() => setToSource(null)} />
    </div>
  );
}

function StatsTable({ summary }: { summary: any }) {
  const num = summary.columns.filter((c: any) => c.kind === "numeric");
  const cat = summary.columns.filter((c: any) => c.kind === "categorical");
  return (
    <div className="space-y-6 text-sm">
      <p className="text-ink-500">N = {summary.rows} satır. Değerler sunucuda deterministik olarak hesaplanmıştır (yapay zekâ üretmemiştir). Anlamlılık testleri için istatistik yazılımınızın çıktısını kullanın.</p>
      {num.length > 0 && (
        <div className="overflow-x-auto"><table className="w-full text-left"><thead className="border-b border-ink-200 text-xs uppercase text-ink-500"><tr>{["Değişken", "n", "Ort.", "SS", "Medyan", "Min", "Maks", "Kayıp"].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
          <tbody>{num.map((c: any) => <tr key={c.name} className="border-b border-ink-100"><td className="px-2 py-1.5 font-medium">{c.name}</td><td className="px-2">{c.n}</td><td className="px-2">{c.mean}</td><td className="px-2">{c.sd}</td><td className="px-2">{c.median}</td><td className="px-2">{c.min}</td><td className="px-2">{c.max}</td><td className="px-2">{c.missing}</td></tr>)}</tbody></table></div>
      )}
      {cat.map((c: any) => <div key={c.name}><p className="font-medium">{c.name} <span className="text-ink-400">({c.distinct} düzey)</span></p><div className="mt-1 flex flex-wrap gap-1.5">{c.levels.map((l: any) => <Badge key={l.value}>{l.value}: {l.count} (%{l.pct})</Badge>)}</div></div>)}
      {summary.correlations.length > 0 && <div><p className="mb-1 font-medium">Pearson korelasyonları</p><div className="grid gap-1 sm:grid-cols-2">{summary.correlations.map((r: any) => <p key={r.a + r.b} className="rounded-lg bg-ink-50 px-2.5 py-1.5">{r.a} × {r.b}: <b>r = {r.r}</b> <span className="text-ink-400">(n = {r.n})</span></p>)}</div></div>}
    </div>
  );
}

function ToSourceModal({ file, onClose }: { file: any | null; onClose: () => void }) {
  const toast = useToast();
  const [doi, setDoi] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      const { source } = await api<{ source: any }>(`/api/files/${file.id}/to-source`, { method: "POST", json: { source: { doi: doi || null, title: title || undefined } } });
      toast({ tone: "success", title: "Tam metinli kaynak eklendi", detail: source.verified ? "Künye DOI ile doğrulandı." : "Künyeyi proje kaynaklarından tamamlayın." });
      onClose();
    } catch (e) { toast({ tone: "error", title: "Eklenemedi", detail: (e as Error).message }); } finally { setBusy(false); }
  }
  return (
    <Modal open={!!file} onClose={onClose} title="Makaleyi kaynak olarak ekle" footer={<><Button variant="ghost" onClick={onClose}>Vazgeç</Button><Button onClick={save} loading={busy}>Ekle</Button></>}>
      <p className="mb-4 text-sm text-ink-500">Yüklediğiniz PDF projeye <b>tam metin okundu</b> erişim seviyesiyle bağlanır. Asistan doğrudan alıntıyı ve sayfa numarasını yalnızca böyle kaynaklardan yapabilir. DOI girerseniz künye otomatik doldurulur ve doğrulanır.</p>
      <div className="space-y-3"><div><label className="label">DOI (önerilir)</label><input className="input" value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.xxxx/xxxxx" /></div><div><label className="label">Başlık (DOI yoksa)</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div></div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
