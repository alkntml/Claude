"use client";
import { motion } from "framer-motion";
import { BadgeCheck, BookPlus, CircleAlert, ExternalLink, FileText, Filter, Loader2, Plus, Quote, Search, ShieldQuestion, Trash2, Unlock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Empty, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { PROVIDER_LABELS } from "@/lib/sources/labels";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ACCESS: Record<string, { label: string; tone: "ink" | "amber" | "green"; hint: string }> = {
  metadata: { label: "Yalnızca künye", tone: "ink", hint: "Yalnızca bibliyografik bilgi biliniyor; içerik okunmadı." },
  abstract: { label: "Özet okundu", tone: "amber", hint: "Yalnızca özet okundu; tam metin analiz edilmedi." },
  full_text: { label: "Tam metin okundu", tone: "green", hint: "Açık erişimli tam metin veya yüklediğiniz PDF analiz edildi." },
};

export function authorLine(authors: any[], max = 3) {
  const names = (authors ?? []).map((a) => a.literal ?? [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean);
  if (!names.length) return "Yazar bilgisi yok";
  return names.length > max ? `${names.slice(0, max).join(", ")} vd.` : names.join(", ");
}

/** Arama sonucu (SourceRecord) veya veritabanı satırı için ortak kart. */
export function SourceCard({ s, actions, compact, foundBy }: { s: any; actions?: React.ReactNode; compact?: boolean; foundBy?: string }) {
  const access = ACCESS[s.access_level ?? s.accessLevel ?? "metadata"];
  const container = s.container_title ?? s.containerTitle;
  const doi = s.doi;
  const verified = s.verified;
  const status = s.verification?.status;
  const origins: string[] = s.origins ?? (s.origin ? [s.origin] : []);
  return (
    <div className="group rounded-2xl border border-ink-100 bg-white p-3.5 transition hover:border-ink-200 hover:shadow-soft">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium leading-snug text-ink-900", compact ? "text-[13.5px]" : "text-[14.5px]")}>{s.title}</p>
          <p className="mt-1 text-[12.5px] text-ink-500">{authorLine(s.authors)} · {s.year ?? "t.y."}{container ? ` · ${container}` : ""}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge tone={access.tone}><span title={access.hint}>{access.label}</span></Badge>
            {verified === true && <Badge tone="green"><BadgeCheck className="h-3 w-3" /> Doğrulandı</Badge>}
            {verified === false && status && status !== "verified" && <Badge tone={status === "mismatch" || status === "not_found" ? "red" : "amber"}><ShieldQuestion className="h-3 w-3" /> {status === "no_identifier" ? "Tanımlayıcı yok" : status === "mismatch" ? "Eşleşmiyor" : status === "not_found" ? "Bulunamadı" : "Doğrulanmadı"}</Badge>}
            {(s.oa_url || s.oaUrl) && (s.access_level ?? s.accessLevel) !== "full_text" && <Badge tone="brand"><Unlock className="h-3 w-3" /> Açık erişim</Badge>}
            {s.citedByCount ? <Badge>{s.citedByCount} atıf</Badge> : null}
            {!compact && origins.map((o) => <span key={o} className="text-[11px] text-ink-400">{PROVIDER_LABELS[o as keyof typeof PROVIDER_LABELS] ?? o}</span>)}
          </div>
          {foundBy && <p className="mt-1.5 text-[11px] text-ink-400">Sorgu: “{foundBy}”</p>}
          {!compact && s.abstract && <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-ink-500">{s.abstract}</p>}
        </div>
        {doi && <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-ink-300 transition hover:bg-ink-100 hover:text-ink-700" title="DOI bağlantısı"><ExternalLink className="h-4 w-4" /></a>}
      </div>
      {actions && <div className="mt-3 flex flex-wrap gap-1.5">{actions}</div>}
    </div>
  );
}

export function toSourceInput(r: any) {
  return {
    type: r.type, title: r.title, authors: r.authors, year: r.year, month: r.month ?? null, containerTitle: r.containerTitle ?? null, volume: r.volume ?? null,
    issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null, doi: r.doi ?? null, pmid: r.pmid ?? null, pmcid: r.pmcid ?? null,
    arxivId: r.arxivId ?? null, isbn: r.isbn ?? null, openalexId: r.openalexId ?? null, url: r.url ?? null, oaUrl: r.oaUrl ?? null,
    abstract: r.abstract ?? null, license: r.license ?? null, language: r.language ?? null, origins: r.origins,
  };
}

/** Akademik veri tabanlarında arama (kaynak paneli ve /kaynaklar sayfası). */
export function SourceSearch({ projectId, onAdded, existingDois }: { projectId?: string; onAdded?: (rows: any[]) => void; existingDois: Set<string> }) {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [oa, setOa] = useState(false);
  const [filters, setFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [adding, setAdding] = useState<string | null>(null);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (q.trim().length < 2) return;
    setLoading(true);
    try {
      const r = await api<{ results: any[]; providers: any[] }>("/api/sources/search", { method: "POST", json: { query: q, yearFrom: yearFrom ? Number(yearFrom) : undefined, yearTo: yearTo ? Number(yearTo) : undefined, openAccessOnly: oa, limit: 15 } });
      setResults(r.results);
      setProviders(r.providers);
    } catch (err) {
      toast({ tone: "error", title: "Arama başarısız", detail: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  async function add(r: any) {
    if (!projectId) return;
    const key = r.doi ?? r.title;
    setAdding(key);
    try {
      const { sources } = await api<{ sources: any[] }>(`/api/projects/${projectId}/sources`, { method: "POST", json: { sources: [toSourceInput(r)] } });
      onAdded?.(sources);
      toast({ tone: "success", title: "Kaynak eklendi", detail: sources[0]?.verified ? "Kalıcı tanımlayıcı doğrulandı." : "Kaynak doğrulanamadı; künyeyi kontrol edin." });
    } catch (err) {
      toast({ tone: "error", title: "Eklenemedi", detail: (err as Error).message });
    } finally {
      setAdding(null);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input className="input pl-9 pr-24" placeholder="Konu, kavram veya başlık ara…" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 gap-1">
            <button type="button" onClick={() => setFilters((f) => !f)} className={cn("rounded-lg p-1.5 text-ink-400 hover:bg-ink-100", filters && "bg-ink-100 text-ink-700")} aria-label="Filtreler"><Filter className="h-4 w-4" /></button>
            <Button type="submit" size="sm" loading={loading}>Ara</Button>
          </div>
        </div>
        {filters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-2 gap-2">
            <input className="input !py-2 text-sm" placeholder="Başlangıç yılı" inputMode="numeric" value={yearFrom} onChange={(e) => setYearFrom(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <input className="input !py-2 text-sm" placeholder="Bitiş yılı" inputMode="numeric" value={yearTo} onChange={(e) => setYearTo(e.target.value.replace(/\D/g, "").slice(0, 4))} />
            <label className="col-span-2 flex items-center gap-2 text-[13px] text-ink-600"><input type="checkbox" checked={oa} onChange={(e) => setOa(e.target.checked)} /> Yalnızca açık erişimli</label>
          </motion.div>
        )}
      </form>

      {loading && <div className="mt-4 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" />)}</div>}
      {!loading && results && (
        <div className="mt-4 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {providers.map((p) => <span key={p.provider} title={p.error} className={cn("rounded-full px-2 py-0.5 text-[11px]", p.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>{PROVIDER_LABELS[p.provider as keyof typeof PROVIDER_LABELS]} {p.ok ? p.count : "×"}</span>)}
          </div>
          {results.length === 0 && <p className="py-6 text-center text-sm text-ink-400">Sonuç bulunamadı. Farklı anahtar kelimeler (tercihen İngilizce) deneyin.</p>}
          {results.map((r) => {
            const have = r.doi && existingDois.has(r.doi);
            return (
              <SourceCard key={(r.doi ?? "") + r.title} s={r} compact actions={projectId && (
                <Button size="sm" variant={have ? "ghost" : "soft"} disabled={have || adding !== null} loading={adding === (r.doi ?? r.title)} onClick={() => add(r)}>
                  {have ? "Projede var" : <><BookPlus className="h-3.5 w-3.5" /> Projeye ekle</>}
                </Button>
              )} />
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProjectSources({ projectId, sources, setSources, onCite, canCite }: { projectId: string; sources: any[]; setSources: (fn: (s: any[]) => any[]) => void; onCite: (id: string) => void; canCite: boolean }) {
  const toast = useToast();
  const [mode, setMode] = useState<"list" | "search" | "manual">("list");
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const existing = new Set(sources.map((s) => s.doi).filter(Boolean));

  async function run(id: string, fn: () => Promise<void>) {
    setBusy(id);
    try { await fn(); } catch (e) { toast({ tone: "error", title: "İşlem başarısız", detail: (e as Error).message }); } finally { setBusy(null); }
  }
  const verify = (id: string) => run(`v${id}`, async () => {
    const { source, verification } = await api<{ source: any; verification: any }>(`/api/sources/${id}/verify`, { method: "POST" });
    setSources((l) => l.map((x) => (x.id === id ? source : x)));
    toast({ tone: verification.status === "verified" ? "success" : "warning", title: verification.status === "verified" ? "Kaynak doğrulandı" : "Doğrulanamadı", detail: verification.message });
  });
  const fulltext = (id: string) => run(`f${id}`, async () => {
    const res = await fetch(`/api/sources/${id}/fulltext`, { method: "POST" });
    const j = await res.json();
    if (j.status === "ingested") {
      setSources((l) => l.map((x) => (x.id === id ? { ...x, access_level: "full_text" } : x)));
      toast({ tone: "success", title: "Tam metin analiz edildi", detail: j.message });
    } else toast({ tone: "warning", title: "Tam metin alınamadı", detail: j.message ?? j.error });
  });
  const remove = (id: string) => run(`d${id}`, async () => {
    await api(`/api/sources/${id}`, { method: "DELETE" });
    setSources((l) => l.filter((x) => x.id !== id));
  });

  const shown = sources.filter((s) => !filter || `${s.title} ${authorLine(s.authors, 10)}`.toLocaleLowerCase("tr").includes(filter.toLocaleLowerCase("tr")));

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1.5 border-b border-ink-100 px-4 py-2.5">
        {(["list", "search", "manual"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={cn("rounded-lg px-2.5 py-1 text-[12.5px] font-medium transition", mode === m ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100")}>
            {m === "list" ? `Projedeki kaynaklar (${sources.length})` : m === "search" ? "Veri tabanında ara" : "DOI / elle ekle"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {mode === "search" && <SourceSearch projectId={projectId} existingDois={existing} onAdded={(rows) => setSources((l) => [...l, ...rows])} />}
        {mode === "manual" && <ManualSource projectId={projectId} onAdded={(rows) => { setSources((l) => [...l, ...rows]); setMode("list"); }} />}
        {mode === "list" && (
          sources.length === 0 ? (
            <Empty icon={<FileText className="h-5 w-5" />} title="Henüz kaynak yok" action={<Button size="sm" onClick={() => setMode("search")}><Search className="h-3.5 w-3.5" /> Kaynak ara</Button>}>Asistan yalnızca bu listedeki kaynaklara atıf yapabilir.</Empty>
          ) : (
            <div className="space-y-2">
              <input className="input !py-2 text-sm" placeholder="Kaynaklarda filtrele…" value={filter} onChange={(e) => setFilter(e.target.value)} />
              {shown.map((s) => (
                <div key={s.id} id={`src-${s.id}`}>
                  <SourceCard s={s} compact actions={<>
                    <Button size="sm" variant="soft" disabled={!canCite} onClick={() => onCite(s.id)} title={canCite ? "İmlecin bulunduğu yere atıf ekle" : "Önce editörde bir yere tıklayın"}><Quote className="h-3.5 w-3.5" /> Atıf ekle</Button>
                    {!s.verified && <Button size="sm" variant="ghost" loading={busy === `v${s.id}`} onClick={() => verify(s.id)}><BadgeCheck className="h-3.5 w-3.5" /> Doğrula</Button>}
                    {s.access_level !== "full_text" && (s.oa_url || s.doi || s.arxiv_id || s.pmcid) && <Button size="sm" variant="ghost" loading={busy === `f${s.id}`} onClick={() => fulltext(s.id)}><Unlock className="h-3.5 w-3.5" /> Tam metni analiz et</Button>}
                    <Button size="sm" variant="ghost" loading={busy === `d${s.id}`} onClick={() => remove(s.id)} aria-label="Kaynağı sil"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </>} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ManualSource({ projectId, onAdded }: { projectId: string; onAdded: (rows: any[]) => void }) {
  const toast = useToast();
  const [id, setId] = useState("");
  const [lookup, setLookup] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "article-journal", title: "", authors: "", year: "", containerTitle: "", volume: "", issue: "", pages: "", publisher: "", doi: "", url: "" });

  async function find() {
    setLoading(true);
    try {
      const { record } = await api<{ record: any }>(`/api/sources/lookup?id=${encodeURIComponent(id.trim())}`);
      setLookup(record);
    } catch (e) {
      toast({ tone: "error", title: "Kayıt bulunamadı", detail: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }
  async function save(payload: any) {
    setLoading(true);
    try {
      const { sources } = await api<{ sources: any[] }>(`/api/projects/${projectId}/sources`, { method: "POST", json: { sources: [payload] } });
      onAdded(sources);
      toast({ tone: "success", title: "Kaynak eklendi" });
    } catch (e) {
      toast({ tone: "error", title: "Eklenemedi", detail: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }
  const manual = () => save({
    type: form.type, title: form.title, year: form.year ? Number(form.year) : null, containerTitle: form.containerTitle || null, volume: form.volume || null, issue: form.issue || null,
    pages: form.pages || null, publisher: form.publisher || null, doi: form.doi || null, url: form.url || null, origins: ["manual"],
    authors: form.authors.split(";").map((a) => a.trim()).filter(Boolean).map((a) => { const [family, given] = a.split(",").map((x) => x.trim()); return given ? { family, given } : { literal: family }; }),
  });

  return (
    <div className="space-y-6">
      <div>
        <label className="label">DOI, PMID veya arXiv kimliği ile ekle</label>
        <div className="flex gap-2"><input className="input" placeholder="10.1016/j.jocrd.2013.12.005" value={id} onChange={(e) => setId(e.target.value)} /><Button onClick={find} loading={loading} disabled={!id.trim()}>Bul</Button></div>
        {lookup && <div className="mt-3"><SourceCard s={{ ...lookup, verified: true }} compact actions={<Button size="sm" onClick={() => save(toSourceInput(lookup))} loading={loading}><Plus className="h-3.5 w-3.5" /> Bu kaynağı ekle</Button>} /></div>}
      </div>
      <div className="relative text-center text-xs text-ink-400"><span className="relative z-10 bg-white px-2">veya elle girin</span><span className="absolute inset-x-0 top-1/2 h-px bg-ink-100" /></div>
      <div className="grid grid-cols-2 gap-2.5">
        <select className="input col-span-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="article-journal">Dergi makalesi</option><option value="book">Kitap</option><option value="chapter">Kitap bölümü</option><option value="thesis">Tez</option><option value="paper-conference">Bildiri</option><option value="report">Rapor</option><option value="webpage">Web sayfası</option>
        </select>
        <input className="input col-span-2" placeholder="Başlık *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="input col-span-2" placeholder="Yazarlar: Soyad, Ad; Soyad, Ad" value={form.authors} onChange={(e) => setForm({ ...form, authors: e.target.value })} />
        <input className="input" placeholder="Yıl" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
        <input className="input" placeholder="Dergi / kitap adı" value={form.containerTitle} onChange={(e) => setForm({ ...form, containerTitle: e.target.value })} />
        <input className="input" placeholder="Cilt" value={form.volume} onChange={(e) => setForm({ ...form, volume: e.target.value })} />
        <input className="input" placeholder="Sayı" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} />
        <input className="input" placeholder="Sayfalar (ör. 12-30)" value={form.pages} onChange={(e) => setForm({ ...form, pages: e.target.value })} />
        <input className="input" placeholder="Yayınevi / kurum" value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} />
        <input className="input" placeholder="DOI" value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} />
        <input className="input" placeholder="URL (https://…)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
      </div>
      <p className="flex gap-2 text-xs text-ink-500"><CircleAlert className="h-4 w-4 shrink-0 text-amber-500" /> Elle eklenen kaynaklar DOI içermiyorsa doğrulanamaz ve kalite raporunda uyarı olarak görünür.</p>
      <Button onClick={manual} loading={loading} disabled={!form.title.trim()} className="w-full">Kaynağı ekle</Button>
    </div>
  );
}

/** Yapay zekâ destekli literatür araştırması: plan + gerçek veri tabanı sonuçları + kullanıcı seçimi. */
export function ResearchModal({ open, onClose, projectId, stageId, prefill, existing, onAdded }: { open: boolean; onClose: () => void; projectId: string; stageId: string | null; prefill: string; existing: Set<string>; onAdded: (rows: any[]) => void }) {
  const toast = useToast();
  const [request, setRequest] = useState(prefill);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{ plan: any; results: any[]; providers: any[] } | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);

  async function run() {
    setLoading(true);
    setData(null);
    try {
      const r = await api<{ plan: any; results: any[]; providers: any[] }>("/api/ai/research", { method: "POST", json: { projectId, stageId, request } });
      setData(r);
      setSelected(new Set(r.results.map((x, i) => (i < 8 && !(x.doi && existing.has(x.doi)) ? i : -1)).filter((i) => i >= 0)));
    } catch (e) {
      toast({ tone: "error", title: "Araştırma yapılamadı", detail: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }
  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      const picks = data.results.filter((_, i) => selected.has(i)).map(toSourceInput);
      const { sources, skipped } = await api<{ sources: any[]; skipped: number }>(`/api/projects/${projectId}/sources`, { method: "POST", json: { sources: picks } });
      onAdded(sources);
      toast({ tone: "success", title: `${sources.length} kaynak eklendi`, detail: `${sources.filter((s) => s.verified).length} tanesi doğrulandı${skipped ? `, ${skipped} tanesi zaten projedeydi` : ""}.` });
      onClose();
    } catch (e) {
      toast({ tone: "error", title: "Kaynaklar eklenemedi", detail: (e as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Literatür araştırması" wide footer={data ? <><span className="mr-auto self-center text-sm text-ink-500">{selected.size} kaynak seçildi</span><Button variant="ghost" onClick={onClose}>Vazgeç</Button><Button onClick={save} loading={saving} disabled={!selected.size}>Seçilenleri projeye ekle</Button></> : undefined}>
      <div className="space-y-3">
        <textarea className="input min-h-[90px]" placeholder="ör. Bu konuya uygun literatürü araştır ve kavramsal çerçeve için temel çalışmaları bul." value={request} onChange={(e) => setRequest(e.target.value)} />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-ink-500">Asistan konuyu analiz edip arama sorguları oluşturur. Sorgular OpenAlex, Crossref, PubMed ve diğer veri tabanlarında gerçekten çalıştırılır. Hangi kaynakların ekleneceğini siz seçersiniz.</p>
          <Button onClick={run} loading={loading} disabled={request.trim().length < 3}><Search className="h-4 w-4" /> Araştır</Button>
        </div>
      </div>
      {loading && <div className="mt-6 flex items-center gap-3 rounded-2xl bg-ink-50 p-4 text-sm text-ink-600"><Loader2 className="h-4 w-4 animate-spin text-brand-600" /> Konu analiz ediliyor ve veri tabanları taranıyor…</div>}
      {data && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4 text-sm">
            <div><p className="font-semibold text-ink-900">Konu analizi</p><p className="mt-1 text-ink-600">{data.plan.topicSummary}</p></div>
            <div><p className="font-semibold text-ink-900">Kavramlar</p><div className="mt-1.5 flex flex-wrap gap-1">{data.plan.concepts.map((c: string) => <Badge key={c} tone="brand">{c}</Badge>)}</div></div>
            <div><p className="font-semibold text-ink-900">Çalıştırılan sorgular</p><ul className="mt-1 space-y-1">{data.plan.queries.map((q: any) => <li key={q.query} className="rounded-lg bg-ink-50 px-2 py-1"><code className="text-[12px] text-ink-800">{q.query}</code><span className="block text-[11px] text-ink-500">{q.purpose}</span></li>)}</ul></div>
            <div><p className="font-semibold text-ink-900">Önerilen çalışma planı</p><ol className="mt-1 list-decimal space-y-1 pl-4 text-ink-600">{data.plan.plan.map((p: string) => <li key={p}>{p}</li>)}</ol></div>
          </div>
          <div className="space-y-2">
            {data.results.length === 0 && <p className="text-sm text-ink-500">Veri tabanlarında sonuç bulunamadı.</p>}
            {data.results.map((r, i) => {
              const have = r.doi && existing.has(r.doi);
              return (
                <label key={i} className={cn("flex cursor-pointer gap-3 rounded-2xl transition", have && "opacity-50")}>
                  <input type="checkbox" className="mt-4 h-4 w-4" disabled={have} checked={selected.has(i)} onChange={(e) => setSelected((s) => { const n = new Set(s); if (e.target.checked) n.add(i); else n.delete(i); return n; })} />
                  <div className="flex-1"><SourceCard s={r} compact foundBy={r.foundBy} /></div>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
