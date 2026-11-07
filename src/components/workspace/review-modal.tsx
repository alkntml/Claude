"use client";
/**
 * Sistematik derleme / PRISMA 2020 (D122). Akış: Protokol → Kayıt toplama (Academiana araması, RIS/BibTeX içe aktarma)
 * → Başlık/özet tarama (yapay zekâ yalnızca öneri verir) → Tam metin uygunluğu → Akış şeması (belgeye şekil, PNG, CSV).
 */
import { Bot, CheckCircle2, Download, FilePlus2, FileUp, Filter, Loader2, Plus, RotateCcw, Search, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { EMPTY_PROTOCOL, prismaCounts, prismaSvg, reviewCsv, type ReviewProtocol, type ReviewRecord, type ReviewStage } from "@/lib/prisma";
import { svgToPng } from "@/lib/svg-png";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = "protocol" | "collect" | "screen" | "eligibility" | "diagram";
const STAGE_LABEL: Record<ReviewStage, string> = {
  identified: "Taranmayı bekliyor", duplicate: "Yinelenen", excluded_screening: "Taramada hariç", sought: "Tam metin değerlendirmesinde",
  not_retrieved: "Tam metne ulaşılamadı", excluded_eligibility: "Tam metinde hariç", included: "Dahil edildi",
};
const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const authorsOf = (r: ReviewRecord) => (r.record.authors ?? []).slice(0, 3).map((a) => a.family ?? a.literal ?? "").filter(Boolean).join(", ") + ((r.record.authors?.length ?? 0) > 3 ? " vd." : "");

function download(name: string, data: string | Blob, type = "text/plain") {
  const url = URL.createObjectURL(typeof data === "string" ? new Blob([data], { type }) : data);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ReviewModal({ open, onClose, projectId, language, onInsertFigure, onSourcesAdded }: {
  open: boolean; onClose: () => void; projectId: string; language: string;
  onInsertFigure?: (f: { title: string; src: string; alt: string; note: string }) => void; onSourcesAdded: (rows: any[]) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("protocol");
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [protocol, setProtocol] = useState<ReviewProtocol>(EMPTY_PROTOCOL);
  const [draft, setDraft] = useState({ question: "", inclusion: "", exclusion: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const lang = language === "en" ? "en" : "tr";

  const load = useCallback(async () => {
    try {
      const r = await api<{ records: ReviewRecord[]; protocol: ReviewProtocol }>(`/api/projects/${projectId}/review`);
      setRecords(r.records); setProtocol(r.protocol);
      setDraft({ question: r.protocol.question, inclusion: r.protocol.inclusion.join("\n"), exclusion: r.protocol.exclusion.join("\n") });
      if (r.records.length) setTab((x) => (x === "protocol" ? "screen" : x));
    } catch (e) { toast({ tone: "error", title: t("Yüklenemedi"), detail: (e as Error).message }); }
    finally { setLoading(false); }
  }, [projectId, toast, t]);
  useEffect(() => { if (open) load(); }, [open, load]);

  const counts = useMemo(() => prismaCounts(records), [records]);
  const reasons = useMemo(() => [...protocol.exclusion, t("Konu dışı"), t("Yayın türü uygun değil"), t("Dil ölçütü dışında")], [protocol.exclusion, t]);

  async function saveProtocol(next?: Partial<ReviewProtocol>) {
    const p = { ...protocol, question: draft.question, inclusion: lines(draft.inclusion), exclusion: lines(draft.exclusion), ...next };
    setBusy("protocol");
    try { const r = await api<{ protocol: ReviewProtocol }>(`/api/projects/${projectId}/review`, { method: "PUT", json: p }); setProtocol(r.protocol); toast({ tone: "success", title: t("Protokol kaydedildi") }); }
    catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); }
    finally { setBusy(null); }
  }
  async function decide(ids: string[], stage: ReviewStage, reason?: string | null) {
    if (!ids.length) return;
    setRecords((l) => l.map((r) => (ids.includes(r.id) ? { ...r, stage, reason: reason ?? null } : r)));
    try { await api(`/api/projects/${projectId}/review`, { method: "PATCH", json: { ids, stage, reason: reason ?? null } }); }
    catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); load(); }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Sistematik derleme (PRISMA 2020)")} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-[12px]">
          {([[t("Belirlenen"), counts.identified], [t("Yinelenen"), counts.duplicates], [t("Taramayı bekleyen"), counts.pendingScreening], [t("Tam metin değerlendirmesinde"), counts.pendingEligibility], [t("Dahil edilen"), counts.included]] as [string, number][]).map(([l, n]) => (
            <span key={l} className="rounded-full bg-ink-100 px-2.5 py-1 text-ink-700">{l}: <b className="tabular-nums">{n}</b></span>
          ))}
        </div>
        <Tabs compact value={tab} onChange={(v) => setTab(v as Tab)} tabs={[
          { id: "protocol", label: t("1. Protokol") }, { id: "collect", label: t("2. Kayıt toplama") }, { id: "screen", label: t("3. Başlık/özet tarama"), count: counts.pendingScreening },
          { id: "eligibility", label: t("4. Tam metin"), count: counts.pendingEligibility }, { id: "diagram", label: t("5. Akış şeması") },
        ]} />
        {loading ? <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Yükleniyor…")}</p> : (
          <>
            {tab === "protocol" && (
              <div className="space-y-3">
                <p className="text-[13px] text-ink-600">{t("Sistematik derleme önceden tanımlanmış bir protokole göre yürür. Sorunuzu ve ölçütlerinizi yazın; tarama kararlarında gerekçe olarak bu ölçütler kullanılır ve yöntem bölümünüzde raporlanır.")}</p>
                <div><label className="label">{t("Araştırma sorusu (ör. PICO)")}</label><textarea className="input min-h-[60px]" value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} placeholder={t("Ör. Ortaokul öğrencilerinde oyunlaştırma, matematik başarısını geleneksel öğretime göre artırır mı?")} /></div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><label className="label">{t("Dahil etme ölçütleri (her satıra bir)")}</label><textarea className="input min-h-[110px]" value={draft.inclusion} onChange={(e) => setDraft({ ...draft, inclusion: e.target.value })} placeholder={t("Deneysel veya yarı deneysel desen\n2010–2025 arası\nTürkçe veya İngilizce")} /></div>
                  <div><label className="label">{t("Hariç tutma ölçütleri (her satıra bir)")}</label><textarea className="input min-h-[110px]" value={draft.exclusion} onChange={(e) => setDraft({ ...draft, exclusion: e.target.value })} placeholder={t("Yanlış örneklem (yetişkinler)\nKontrol grubu yok\nTam metne ulaşılamadı")} /></div>
                </div>
                <Button onClick={() => saveProtocol()} loading={busy === "protocol"}>{t("Protokolü kaydet")}</Button>
                {protocol.searches.length > 0 && (
                  <div>
                    <p className="label">{t("Yapılan aramalar (yöntem bölümü için)")}</p>
                    <ul className="divide-y divide-ink-100 rounded-xl border border-ink-100 text-[12.5px]">{protocol.searches.map((s, i) => <li key={i} className="flex flex-wrap gap-2 px-3 py-1.5"><b>{s.database}</b><span className="text-ink-500">{s.date}</span><span className="min-w-0 flex-1 truncate font-mono">{s.query}</span><span>{t("{n} kayıt", { n: s.results })}</span></li>)}</ul>
                  </div>
                )}
              </div>
            )}
            {tab === "collect" && <Collect projectId={projectId} onAdded={load} />}
            {tab === "screen" && <Screen projectId={projectId} records={records} reasons={reasons} protocol={protocol} decide={decide} reload={load} setRecords={setRecords} />}
            {tab === "eligibility" && <Eligibility projectId={projectId} records={records} reasons={reasons} decide={decide} onSourcesAdded={(rows) => { onSourcesAdded(rows); load(); }} />}
            {tab === "diagram" && <Diagram counts={counts} lang={lang} records={records} onInsertFigure={onInsertFigure} />}
          </>
        )}
      </div>
    </Modal>
  );
}

function Collect({ projectId, onAdded }: { projectId: string; onAdded: () => void }) {
  const { t } = useT();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [res, setRes] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("Scopus");
  const [query2, setQuery2] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  async function search() {
    setBusy(true);
    try { const r = await api<{ results: any[] }>("/api/sources/search", { method: "POST", json: { query: q, limit: 50, projectId, ...(from ? { yearFrom: Number(from) } : {}) } }); setRes(r.results); }
    catch (e) { toast({ tone: "error", title: t("Arama yapılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function addAll() {
    if (!res?.length) return;
    setBusy(true);
    try {
      const map = (r: any) => ({ title: r.title, authors: r.authors, year: r.year, containerTitle: r.containerTitle ?? null, doi: r.doi ?? null, url: r.url ?? null, abstract: r.abstract ?? null, type: r.type, volume: r.volume ?? null, issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null, pmid: r.pmid ?? null, arxivId: r.arxivId ?? null, isbn: r.isbn ?? null });
      const r = await api<{ added: number; duplicates: number }>(`/api/projects/${projectId}/review`, { method: "POST", json: { action: "add", origin: "Academiana (OpenAlex, Crossref, PubMed…)", records: res.map(map), search: { database: "Academiana (OpenAlex, Crossref, PubMed…)", query: q, date: today, results: res.length } } });
      toast({ tone: "success", title: t("{a} kayıt eklendi, {d} yinelenen ayrıldı", { a: r.added, d: r.duplicates }) });
      setRes(null); onAdded();
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function importFile(f: File) {
    setBusy(true);
    try {
      const text = await f.text();
      const r = await api<{ added: number; duplicates: number }>(`/api/projects/${projectId}/review`, { method: "POST", json: { action: "import", origin, text, search: { database: origin, query: query2 || f.name, date: today, results: 0 } } });
      toast({ tone: "success", title: t("{a} kayıt eklendi, {d} yinelenen ayrıldı", { a: r.added, d: r.duplicates }) });
      onAdded();
    } catch (e) { toast({ tone: "error", title: t("İçe aktarılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); if (file.current) file.current.value = ""; }
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-2xl border border-ink-100 p-4">
        <p className="flex items-center gap-2 font-semibold text-ink-900"><Search className="h-4 w-4 text-brand-600" /> {t("Academiana’da ara")}</p>
        <p className="text-[12.5px] text-ink-500">{t("13 veri tabanında eşzamanlı arama; en fazla 50 sonuç derlemeye eklenir. Arama ifadesi yöntem bölümü için kaydedilir.")}</p>
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Ör. gamification AND mathematics achievement")} />
        <div className="flex gap-2"><input className="input w-32" value={from} onChange={(e) => setFrom(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder={t("Başlangıç yılı")} /><Button onClick={search} loading={busy && !res} disabled={q.trim().length < 2}><Search className="h-4 w-4" /> {t("Ara")}</Button></div>
        {res && <div className="flex items-center justify-between rounded-xl bg-ink-50 p-2.5 text-[13px]"><span>{t("{n} sonuç bulundu", { n: res.length })}</span><Button size="sm" onClick={addAll} loading={busy} disabled={!res.length}><Plus className="h-4 w-4" /> {t("Derlemeye ekle")}</Button></div>}
      </div>
      <div className="space-y-2 rounded-2xl border border-ink-100 p-4">
        <p className="flex items-center gap-2 font-semibold text-ink-900"><FileUp className="h-4 w-4 text-brand-600" /> {t("Veri tabanından içe aktar")}</p>
        <p className="text-[12.5px] text-ink-500">{t("Scopus, Web of Science, PubMed, ERIC veya ULAKBİM’den sonuçları RIS ya da BibTeX olarak dışa aktarıp yükleyin. Yinelenenler otomatik ayrılır.")}</p>
        <input className="input" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder={t("Veri tabanı adı")} />
        <input className="input" value={query2} onChange={(e) => setQuery2(e.target.value)} placeholder={t("Kullandığınız arama ifadesi (raporlama için)")} />
        <input ref={file} type="file" accept=".ris,.bib,.txt,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        <Button variant="secondary" onClick={() => file.current?.click()} loading={busy && !!origin && !res}><FileUp className="h-4 w-4" /> {t("RIS / BibTeX dosyası seç")}</Button>
      </div>
    </div>
  );
}

function RecordCard({ r, children }: { r: ReviewRecord; children?: React.ReactNode }) {
  const { t } = useT();
  const [more, setMore] = useState(false);
  return (
    <li className="rounded-2xl border border-ink-100 bg-white p-3">
      <p className="text-[14px] font-medium text-ink-900">{r.record.title}</p>
      <p className="text-[12px] text-ink-500">{[authorsOf(r), r.record.year, r.record.containerTitle].filter(Boolean).join(" · ")} · {r.origin}{r.record.doi && <> · <a className="text-brand-700 hover:underline" href={`https://doi.org/${r.record.doi}`} target="_blank" rel="noopener noreferrer">DOI</a></>}</p>
      {r.record.abstract ? <p className={cn("mt-1 text-[12.5px] leading-relaxed text-ink-600", !more && "line-clamp-3")} onClick={() => setMore((m) => !m)}>{r.record.abstract}</p> : <p className="mt-1 text-[12px] text-ink-400">{t("Özet yok")}</p>}
      {r.ai && <p className={cn("mt-1.5 inline-flex items-start gap-1 rounded-lg px-2 py-1 text-[12px]", r.ai.decision === "include" ? "bg-emerald-50 text-emerald-800" : r.ai.decision === "exclude" ? "bg-rose-50 text-rose-700" : "bg-ink-100 text-ink-600")}><Bot className="mt-0.5 h-3.5 w-3.5 shrink-0" />{t("YZ önerisi")}: <b>{r.ai.decision === "include" ? t("dahil") : r.ai.decision === "exclude" ? t("hariç") : t("emin değil")}</b> — {r.ai.reason}</p>}
      {children}
    </li>
  );
}

function ExcludeButton({ reasons, onPick, label }: { reasons: string[]; onPick: (r: string) => void; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative">
      <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}><XCircle className="h-4 w-4 text-rose-600" /> {label}</Button>
      {open && <span className="absolute left-0 top-9 z-20 w-64 rounded-xl border border-ink-100 bg-white p-1 shadow-xl">{reasons.map((x) => <button key={x} onClick={() => { setOpen(false); onPick(x); }} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-[12.5px] hover:bg-ink-50">{x}</button>)}</span>}
    </span>
  );
}

function Screen({ projectId, records, reasons, protocol, decide, reload, setRecords }: { projectId: string; records: ReviewRecord[]; reasons: string[]; protocol: ReviewProtocol; decide: (ids: string[], s: ReviewStage, r?: string | null) => void; reload: () => void; setRecords: React.Dispatch<React.SetStateAction<ReviewRecord[]>> }) {
  const { t } = useT();
  const toast = useToast();
  const [view, setView] = useState<"pending" | "done">("pending");
  const [busy, setBusy] = useState(false);
  const pending = records.filter((r) => r.stage === "identified");
  const done = records.filter((r) => r.stage === "excluded_screening" || r.stage === "duplicate");
  async function suggest() {
    const ids = pending.filter((r) => !r.ai).slice(0, 25).map((r) => r.id);
    if (!ids.length) { toast({ tone: "info", title: t("Önerisi olmayan kayıt kalmadı") }); return; }
    setBusy(true);
    try {
      const r = await api<{ suggestions: { id: string; ai: ReviewRecord["ai"] }[] }>(`/api/projects/${projectId}/review/screen`, { method: "POST", json: { ids } });
      setRecords((l) => l.map((x) => { const s = r.suggestions.find((y) => y.id === x.id); return s?.ai ? { ...x, ai: s.ai } : x; }));
    } catch (e) { toast({ tone: "error", title: t("Öneri alınamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  const aiInclude = pending.filter((r) => r.ai?.decision === "include");
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={suggest} loading={busy} disabled={!pending.length || (!protocol.inclusion.length && !protocol.exclusion.length)}><Bot className="h-4 w-4" /> {t("Yapay zekâ önerisi al (25 kayıt)")}</Button>
        {aiInclude.length > 0 && <Button size="sm" variant="secondary" onClick={() => decide(aiInclude.map((r) => r.id), "sought")}><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t("Önerisi “dahil” olan {n} kaydı tam metne geçir", { n: aiInclude.length })}</Button>}
        <span className="ml-auto flex gap-1 text-[12.5px]">
          <button onClick={() => setView("pending")} className={cn("rounded-full px-2.5 py-1", view === "pending" ? "bg-brand-50 text-brand-800" : "text-ink-500")}>{t("Bekleyen")} {pending.length}</button>
          <button onClick={() => setView("done")} className={cn("rounded-full px-2.5 py-1", view === "done" ? "bg-brand-50 text-brand-800" : "text-ink-500")}>{t("Hariç / yinelenen")} {done.length}</button>
        </span>
      </div>
      {!protocol.inclusion.length && !protocol.exclusion.length && <p className="rounded-xl bg-amber-50 p-2.5 text-[12.5px] text-amber-800">{t("Yapay zekâ önerisi için önce Protokol sekmesinde ölçütleri yazın.")}</p>}
      <p className="text-[12px] text-ink-500">{t("Öneriler yalnızca yardımcıdır; her kaydın kararını siz verirsiniz. Şüpheli kayıtları tam metin aşamasına geçirmeniz önerilir.")}</p>
      <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
        {(view === "pending" ? pending : done).slice(0, 200).map((r) => (
          <RecordCard key={r.id} r={r}>
            <div className="mt-2 flex flex-wrap gap-2">
              {view === "pending" ? (
                <>
                  <Button size="sm" onClick={() => decide([r.id], "sought")}><CheckCircle2 className="h-4 w-4" /> {t("Dahil (tam metne geç)")}</Button>
                  <ExcludeButton reasons={reasons} label={t("Hariç tut")} onPick={(x) => decide([r.id], "excluded_screening", x)} />
                  <Button size="sm" variant="ghost" onClick={() => decide([r.id], "duplicate")}>{t("Yinelenen")}</Button>
                </>
              ) : (
                <><span className="text-[12px] text-ink-500">{t(STAGE_LABEL[r.stage])}{r.reason ? ` — ${r.reason}` : ""}</span><Button size="sm" variant="ghost" onClick={() => decide([r.id], "identified")}><RotateCcw className="h-3.5 w-3.5" /> {t("Geri al")}</Button></>
              )}
            </div>
          </RecordCard>
        ))}
        {(view === "pending" ? pending : done).length === 0 && <li className="rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">{view === "pending" ? t("Taranmayı bekleyen kayıt yok. Kayıt toplama sekmesinden kayıt ekleyin veya tam metin aşamasına geçin.") : t("Henüz hariç tutulan kayıt yok.")}</li>}
      </ul>
      {pending.length > 200 && <p className="text-[12px] text-ink-500">{t("İlk 200 kayıt gösteriliyor; karar verdikçe sıradakiler görünür.")}</p>}
      <button onClick={reload} className="text-[12px] text-ink-400 hover:text-ink-700">{t("Listeyi yenile")}</button>
    </div>
  );
}

function Eligibility({ projectId, records, reasons, decide, onSourcesAdded }: { projectId: string; records: ReviewRecord[]; reasons: string[]; decide: (ids: string[], s: ReviewStage, r?: string | null) => void; onSourcesAdded: (rows: any[]) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const sought = records.filter((r) => r.stage === "sought");
  const decided = records.filter((r) => r.stage === "included" || r.stage === "excluded_eligibility" || r.stage === "not_retrieved");
  const toAdd = records.filter((r) => r.stage === "included" && !r.source_id);
  async function addSources() {
    setBusy(true);
    try {
      let all: any[] = [];
      for (let i = 0; i < toAdd.length; i += 30) { const r = await api<{ sources: any[] }>(`/api/projects/${projectId}/review/include`, { method: "POST", json: { ids: toAdd.slice(i, i + 30).map((x) => x.id) } }); all = all.concat(r.sources); }
      onSourcesAdded(all);
      toast({ tone: "success", title: t("{n} çalışma kaynaklara eklendi", { n: all.length }), detail: t("Kaynaklar doğrulanıyor; açık erişimli tam metinler arka planda okunur.") });
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-600">{t("Taramayı geçen çalışmaların tam metnini okuyup uygunluğa karar verin. Hariç tutulan her rapor için gerekçe akış şemasında raporlanır.")}</p>
      {toAdd.length > 0 && <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 text-[13px] text-emerald-900"><span>{t("{n} dahil edilen çalışma henüz kaynaklarda değil.", { n: toAdd.length })}</span><Button size="sm" onClick={addSources} loading={busy}><Plus className="h-4 w-4" /> {t("Kaynaklara ekle")}</Button></div>}
      <ul className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
        {sought.map((r) => (
          <RecordCard key={r.id} r={r}>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => decide([r.id], "included")}><CheckCircle2 className="h-4 w-4" /> {t("Dahil et")}</Button>
              <ExcludeButton reasons={reasons} label={t("Hariç tut")} onPick={(x) => decide([r.id], "excluded_eligibility", x)} />
              <Button size="sm" variant="ghost" onClick={() => decide([r.id], "not_retrieved")}>{t("Tam metne ulaşılamadı")}</Button>
              <Button size="sm" variant="ghost" onClick={() => decide([r.id], "identified")}><RotateCcw className="h-3.5 w-3.5" /> {t("Taramaya geri gönder")}</Button>
            </div>
          </RecordCard>
        ))}
        {!sought.length && <li className="rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">{t("Tam metin değerlendirmesi bekleyen çalışma yok.")}</li>}
      </ul>
      {decided.length > 0 && (
        <details className="rounded-xl border border-ink-100 p-3 text-[13px]">
          <summary className="cursor-pointer font-medium text-ink-800">{t("Karar verilenler ({n})", { n: decided.length })}</summary>
          <ul className="mt-2 space-y-1">{decided.map((r) => <li key={r.id} className="flex items-center gap-2"><span className={cn("h-2 w-2 shrink-0 rounded-full", r.stage === "included" ? "bg-emerald-500" : "bg-rose-400")} /><span className="min-w-0 flex-1 truncate">{r.record.title}</span><span className="shrink-0 text-ink-500">{t(STAGE_LABEL[r.stage])}{r.reason ? ` — ${r.reason}` : ""}</span><button onClick={() => decide([r.id], "sought")} className="shrink-0 text-ink-400 hover:text-ink-700" aria-label={t("Geri al")}><RotateCcw className="h-3.5 w-3.5" /></button></li>)}</ul>
        </details>
      )}
    </div>
  );
}

function Diagram({ counts, lang, records, onInsertFigure }: { counts: ReturnType<typeof prismaCounts>; lang: "tr" | "en"; records: ReviewRecord[]; onInsertFigure?: (f: { title: string; src: string; alt: string; note: string }) => void }) {
  const { t } = useT();
  const toast = useToast();
  const { svg, width, height } = useMemo(() => prismaSvg(counts, lang), [counts, lang]);
  const [busy, setBusy] = useState(false);
  const title = lang === "en" ? "PRISMA 2020 flow diagram" : "PRISMA 2020 akış şeması";
  const note = lang === "en" ? "Adapted from Page et al. (2021), The PRISMA 2020 statement." : "Page vd. (2021), PRISMA 2020 bildirgesinden uyarlanmıştır.";
  async function insert() {
    if (!onInsertFigure) return;
    setBusy(true);
    try { onInsertFigure({ title, src: await svgToPng(svg, width, height), alt: title, note }); toast({ tone: "success", title: t("Akış şeması belgeye eklendi") }); }
    finally { setBusy(false); }
  }
  return (
    <div className="space-y-3">
      {(counts.pendingScreening > 0 || counts.pendingEligibility > 0) && <p className="rounded-xl bg-amber-50 p-2.5 text-[12.5px] text-amber-800">{t("Henüz karar verilmeyen kayıtlar var; şema mevcut durumu gösterir.")}</p>}
      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white p-2" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="flex flex-wrap gap-2">
        {onInsertFigure && <Button onClick={insert} loading={busy}><FilePlus2 className="h-4 w-4" /> {t("Belgeye şekil olarak ekle")}</Button>}
        <Button variant="secondary" onClick={async () => { const png = await svgToPng(svg, width, height); download("prisma-akis-semasi.png", await (await fetch(png)).blob()); }}><Download className="h-4 w-4" /> PNG</Button>
        <Button variant="secondary" onClick={() => download("prisma-kayitlar.csv", reviewCsv(records, (s) => t(STAGE_LABEL[s])), "text/csv;charset=utf-8")}><Download className="h-4 w-4" /> {t("Kayıtlar (CSV)")}</Button>
      </div>
      <p className="flex items-start gap-1.5 text-[12px] text-ink-500"><Filter className="mt-0.5 h-3.5 w-3.5" />{t("Sayılar kararlarınızdan otomatik hesaplanır. Yöntem bölümünde arama tarihlerini ve ifadelerini (Protokol sekmesi) raporlamayı unutmayın.")}</p>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
