"use client";
/**
 * Sistematik derleme / PRISMA 2020 (D122). Akış: Protokol → Kayıt toplama (Academiana araması, RIS/BibTeX içe aktarma)
 * → Başlık/özet tarama (yapay zekâ yalnızca öneri verir) → Tam metin uygunluğu → Akış şeması (belgeye şekil, PNG, CSV).
 */
import { Bot, CheckCircle2, ChevronDown, Download, FilePlus2, FileText, FileUp, Filter, Loader2, Plus, RotateCcw, Search, Users, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { agreement, APPRAISAL_ITEMS, appraisalSummary, characteristicsMarkdown, EMPTY_PROTOCOL, EXTRACTION_FIELDS, EXTRACTION_LABELS, methodsMarkdown, prismaCounts, prismaSvg, reviewCsv, type Appraisal, type AppraisalAnswer, type Extraction, type ReviewProtocol, type ReviewRecord, type ReviewStage, type VoteDecision, type VotePhase } from "@/lib/prisma";
import { svgToPng } from "@/lib/svg-png";
import { writingLang } from "@/lib/writing-lang";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = "protocol" | "collect" | "screen" | "eligibility" | "extract" | "diagram";
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

export function ReviewModal({ open, onClose, projectId, language, onInsertFigure, onInsertMarkdown, onSourcesAdded }: {
  open: boolean; onClose: () => void; projectId: string; language: string;
  onInsertFigure?: (f: { title: string; src: string; alt: string; note: string }) => void; onSourcesAdded: (rows: any[]) => void;
  onInsertMarkdown?: (md: string, map: Record<string, string>) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("protocol");
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [protocol, setProtocol] = useState<ReviewProtocol>(EMPTY_PROTOCOL);
  const [draft, setDraft] = useState({ question: "", inclusion: "", exclusion: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [me, setMe] = useState("");
  const [upgraded, setUpgraded] = useState(true);
  const lang = writingLang(language);

  const load = useCallback(async () => {
    try {
      const r = await api<{ records: ReviewRecord[]; protocol: ReviewProtocol; me?: string; upgraded?: boolean }>(`/api/projects/${projectId}/review`);
      setRecords(r.records); setProtocol(r.protocol); setMe(r.me ?? ""); setUpgraded(r.upgraded !== false);
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
  async function vote(ids: string[], phase: VotePhase, decision: VoteDecision | null) {
    setRecords((l) => l.map((r) => {
      if (!ids.includes(r.id)) return r;
      const ph = { ...(r.votes?.[phase] ?? {}) };
      if (decision) ph[me] = { decision, at: new Date().toISOString(), name: t("Siz") }; else delete ph[me];
      return { ...r, votes: { ...(r.votes ?? {}), [phase]: ph } };
    }));
    try { await api(`/api/projects/${projectId}/review/vote`, { method: "POST", json: { ids, phase, decision } }); }
    catch (e) { toast({ tone: "error", title: t("Oy kaydedilemedi"), detail: (e as Error).message }); load(); }
  }
  const dual = !!protocol.dual && upgraded;

  return (
    <Modal open={open} onClose={onClose} title={t("Sistematik derleme (PRISMA 2020)")} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 text-[12px]">
          {([[t("Belirlenen"), counts.identified], [t("Yinelenen"), counts.duplicates], [t("Taramayı bekleyen"), counts.pendingScreening], [t("Tam metin değerlendirmesinde"), counts.pendingEligibility], [t("Dahil edilen"), counts.included]] as [string, number][]).map(([l, n]) => (
            <span key={l} className="rounded-full bg-ink-100 px-2.5 py-1 text-ink-700">{l}: <b className="tabular-nums">{n}</b></span>
          ))}
        </div>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <Tabs className="min-w-[760px]" value={tab} onChange={(v) => setTab(v as Tab)} tabs={[
            { id: "protocol", label: t("1. Protokol") }, { id: "collect", label: t("2. Kayıt toplama") }, { id: "screen", label: t("3. Tarama"), count: counts.pendingScreening },
            { id: "eligibility", label: t("4. Tam metin"), count: counts.pendingEligibility }, { id: "extract", label: t("5. Veri ve kalite"), count: counts.included || undefined }, { id: "diagram", label: t("6. Şema ve yöntem") },
          ]} />
        </div>
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
                <label className="flex items-start gap-2 rounded-xl border border-ink-100 p-3 text-[13px] text-ink-700">
                  <input type="checkbox" className="mt-0.5" checked={!!protocol.dual} disabled={!upgraded} onChange={(e) => saveProtocol({ dual: e.target.checked })} />
                  <span><b>{t("Çift değerlendirici modu")}</b> — {t("Ekipteki her araştırmacı (ortak yazarlar dahil) kayıtlara bağımsız oy verir; anlaşmazlıklar listelenir ve değerlendiriciler arası uyum (Cohen’in kappası) yöntem metnine yazılır. Sistematik derlemelerde önerilen yöntemdir.")}{!upgraded && <span className="block text-amber-700">{t("Bu özellik için veritabanı güncellemesi gerekiyor (migration 36).")}</span>}</span>
                </label>
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
            {tab === "screen" && <Screen projectId={projectId} records={records} reasons={reasons} protocol={protocol} decide={decide} reload={load} setRecords={setRecords} dual={dual} me={me} vote={vote} />}
            {tab === "eligibility" && <Eligibility projectId={projectId} records={records} reasons={reasons} decide={decide} onSourcesAdded={(rows) => { onSourcesAdded(rows); load(); }} dual={dual} me={me} vote={vote} />}
            {tab === "extract" && <ExtractTab projectId={projectId} records={records} setRecords={setRecords} lang={lang} upgraded={upgraded} onInsertMarkdown={onInsertMarkdown} sourceTitle={(r) => `${authorsOf(r) || r.record.title.slice(0, 50)}${r.record.year ? ` (${r.record.year})` : ""} — ${r.record.title}`} />}
            {tab === "diagram" && <Diagram counts={counts} lang={lang} records={records} protocol={protocol} onInsertFigure={onInsertFigure} onInsertMarkdown={onInsertMarkdown} />}
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
      const r = await api<{ added: number; duplicates: number; fuzzy?: number }>(`/api/projects/${projectId}/review`, { method: "POST", json: { action: "add", origin: "Academiana (OpenAlex, Crossref, PubMed…)", records: res.map(map), search: { database: "Academiana (OpenAlex, Crossref, PubMed…)", query: q, date: today, results: res.length } } });
      toast({ tone: "success", title: t("{a} kayıt eklendi, {d} yinelenen ayrıldı", { a: r.added, d: r.duplicates }), detail: r.fuzzy ? t("{n} kayıt benzer başlık ve yıl nedeniyle olası yinelenen sayıldı; “Hariç / yinelenen” listesinden kontrol edip geri alabilirsiniz.", { n: r.fuzzy }) : undefined });
      setRes(null); onAdded();
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function importFile(f: File) {
    setBusy(true);
    try {
      const text = await f.text();
      const r = await api<{ added: number; duplicates: number; fuzzy?: number }>(`/api/projects/${projectId}/review`, { method: "POST", json: { action: "import", origin, text, search: { database: origin, query: query2 || f.name, date: today, results: 0 } } });
      toast({ tone: "success", title: t("{a} kayıt eklendi, {d} yinelenen ayrıldı", { a: r.added, d: r.duplicates }), detail: r.fuzzy ? t("{n} kayıt benzer başlık ve yıl nedeniyle olası yinelenen sayıldı; “Hariç / yinelenen” listesinden kontrol edip geri alabilirsiniz.", { n: r.fuzzy }) : undefined });
      onAdded();
    } catch (e) { toast({ tone: "error", title: t("İçe aktarılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); if (file.current) file.current.value = ""; }
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 rounded-2xl border border-ink-100 p-4">
        <p className="flex items-center gap-2 font-semibold text-ink-900"><Search className="h-4 w-4 text-brand-600" /> {t("Academiana’da ara")}</p>
        <p className="text-[12.5px] text-ink-500">{t("16 veri tabanında eşzamanlı arama; en fazla 50 sonuç derlemeye eklenir. Arama ifadesi yöntem bölümü için kaydedilir.")}</p>
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

function Screen({ projectId, records, reasons, protocol, decide, reload, setRecords, dual, me, vote }: { projectId: string; records: ReviewRecord[]; reasons: string[]; protocol: ReviewProtocol; decide: (ids: string[], s: ReviewStage, r?: string | null) => void; reload: () => void; setRecords: React.Dispatch<React.SetStateAction<ReviewRecord[]>>; dual: boolean; me: string; vote: (ids: string[], phase: VotePhase, d: VoteDecision | null) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [view, setView] = useState<"pending" | "done" | "conflicts">("pending");
  const [busy, setBusy] = useState(false);
  const ag = useMemo(() => (dual ? agreement(records, "screening") : null), [dual, records]);
  const pendingAll = records.filter((r) => r.stage === "identified");
  const pending = view === "conflicts" ? pendingAll.filter((r) => ag?.conflicts.includes(r.id)) : pendingAll;
  const done = records.filter((r) => r.stage === "excluded_screening" || r.stage === "duplicate");
  async function suggest() {
    const ids = pendingAll.filter((r) => !r.ai).slice(0, 25).map((r) => r.id);
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
          <button onClick={() => setView("pending")} className={cn("rounded-full px-2.5 py-1", view === "pending" ? "bg-brand-50 text-brand-800" : "text-ink-500")}>{t("Bekleyen")} {pendingAll.length}</button>
          {dual && <button onClick={() => setView("conflicts")} className={cn("rounded-full px-2.5 py-1", view === "conflicts" ? "bg-rose-50 text-rose-800" : "text-ink-500")}>{t("Anlaşmazlık")} {ag?.conflicts.filter((id) => pendingAll.some((r) => r.id === id)).length ?? 0}</button>}
          <button onClick={() => setView("done")} className={cn("rounded-full px-2.5 py-1", view === "done" ? "bg-brand-50 text-brand-800" : "text-ink-500")}>{t("Hariç / yinelenen")} {done.length}</button>
        </span>
      </div>
      {!protocol.inclusion.length && !protocol.exclusion.length && <p className="rounded-xl bg-amber-50 p-2.5 text-[12.5px] text-amber-800">{t("Yapay zekâ önerisi için önce Protokol sekmesinde ölçütleri yazın.")}</p>}
      <p className="text-[12px] text-ink-500">{t("Öneriler yalnızca yardımcıdır; her kaydın kararını siz verirsiniz. Şüpheli kayıtları tam metin aşamasına geçirmeniz önerilir.")}</p>
      {dual && <AgreementPanel records={records} phase="screening" />}
      <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
        {(view !== "done" ? pending : done).slice(0, 200).map((r) => (
          <RecordCard key={r.id} r={r}>
            {dual && view !== "done" && <VoteBar r={r} phase="screening" me={me} onVote={vote} />}
            <div className="mt-2 flex flex-wrap gap-2">
              {view !== "done" ? (
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
        {(view !== "done" ? pending : done).length === 0 && <li className="rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">{view === "conflicts" ? t("Anlaşmazlık olan kayıt yok.") : view === "pending" ? t("Taranmayı bekleyen kayıt yok. Kayıt toplama sekmesinden kayıt ekleyin veya tam metin aşamasına geçin.") : t("Henüz hariç tutulan kayıt yok.")}</li>}
      </ul>
      {pending.length > 200 && <p className="text-[12px] text-ink-500">{t("İlk 200 kayıt gösteriliyor; karar verdikçe sıradakiler görünür.")}</p>}
      <button onClick={reload} className="text-[12px] text-ink-400 hover:text-ink-700">{t("Listeyi yenile")}</button>
    </div>
  );
}

function Eligibility({ projectId, records, reasons, decide, onSourcesAdded, dual, me, vote }: { projectId: string; records: ReviewRecord[]; reasons: string[]; decide: (ids: string[], s: ReviewStage, r?: string | null) => void; onSourcesAdded: (rows: any[]) => void; dual: boolean; me: string; vote: (ids: string[], phase: VotePhase, d: VoteDecision | null) => void }) {
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
      {dual && <AgreementPanel records={records} phase="eligibility" />}
      {toAdd.length > 0 && <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 text-[13px] text-emerald-900"><span>{t("{n} dahil edilen çalışma henüz kaynaklarda değil.", { n: toAdd.length })}</span><Button size="sm" onClick={addSources} loading={busy}><Plus className="h-4 w-4" /> {t("Kaynaklara ekle")}</Button></div>}
      <ul className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
        {sought.map((r) => (
          <RecordCard key={r.id} r={r}>
            {dual && <VoteBar r={r} phase="eligibility" me={me} onVote={vote} />}
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

function Diagram({ counts, lang, records, protocol, onInsertFigure, onInsertMarkdown }: { counts: ReturnType<typeof prismaCounts>; lang: "tr" | "en" | "de"; records: ReviewRecord[]; protocol: ReviewProtocol; onInsertFigure?: (f: { title: string; src: string; alt: string; note: string }) => void; onInsertMarkdown?: (md: string, map: Record<string, string>) => void }) {
  const { t } = useT();
  const toast = useToast();
  const { svg, width, height } = useMemo(() => prismaSvg(counts, lang), [counts, lang]);
  const [busy, setBusy] = useState(false);
  const title = lang === "en" ? "PRISMA 2020 flow diagram" : lang === "de" ? "PRISMA-2020-Flussdiagramm" : "PRISMA 2020 akış şeması";
  const note = lang === "en" ? "Adapted from Page et al. (2021), The PRISMA 2020 statement." : lang === "de" ? "Adaptiert nach Page et al. (2021), The PRISMA 2020 statement." : "Page vd. (2021), PRISMA 2020 bildirgesinden uyarlanmıştır.";
  const methods = useMemo(() => {
    const inc = records.filter((r) => r.stage === "included" && r.source_id);
    const map = Object.fromEntries(inc.map((r, i) => [`S${i + 1}`, r.source_id!]));
    const ag = protocol.dual ? agreement(records, "screening") : null;
    const md = methodsMarkdown({ protocol, counts, lang, agreement: ag, includedLabels: Object.keys(map), extracted: records.filter((r) => r.stage === "included" && r.extraction?.at).length, appraised: records.filter((r) => r.stage === "included" && appraisalSummary(r.appraisal).risk).length });
    return { md, map };
  }, [records, protocol, counts, lang]);
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
      <details className="rounded-2xl border border-ink-100 p-3">
        <summary className="flex cursor-pointer items-center gap-2 text-[13.5px] font-semibold text-ink-900"><FileText className="h-4 w-4 text-brand-600" /> {t("Yöntem ve sonuç metni (PRISMA 2020’ye uygun)")}</summary>
        <p className="mt-2 text-[12.5px] text-ink-500">{t("Protokolünüzden ve kararlarınızdan otomatik oluşturulur (yapay zekâ kullanılmaz): arama stratejisi, ölçütler, seçim süreci, sayılar, değerlendiriciler arası uyum ve arama tablosu. Kaynaklara eklenmiş dahil edilen çalışmalara canlı atıf yapılır.")}</p>
        <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-3 font-sans text-[12.5px] leading-relaxed text-ink-700">{methods.md.replace(/^#+\s*/gm, "").replace(/^\*(.+)\*$/gm, "$1").replace(/\[\[kaynak:[^\]]+\]\]/g, "[…]")}</pre>
        <div className="mt-2 flex flex-wrap gap-2">
          {onInsertMarkdown && <Button size="sm" onClick={() => { onInsertMarkdown(methods.md, methods.map); toast({ tone: "success", title: t("Yöntem metni belgeye eklendi") }); }}><FilePlus2 className="h-4 w-4" /> {t("Belgeye ekle")}</Button>}
          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(methods.md).then(() => toast({ tone: "success", title: t("Kopyalandı") }), () => {})}>{t("Kopyala")}</Button>
        </div>
      </details>
      <p className="flex items-start gap-1.5 text-[12px] text-ink-500"><Filter className="mt-0.5 h-3.5 w-3.5" />{t("Sayılar kararlarınızdan otomatik hesaplanır. Yöntem bölümünde arama tarihlerini ve ifadelerini (Protokol sekmesi) raporlamayı unutmayın.")}</p>
    </div>
  );
}

/* ---------------- D134: çift değerlendirici, veri çıkarma, kalite ---------------- */

function VoteBar({ r, phase, me, onVote }: { r: ReviewRecord; phase: VotePhase; me: string; onVote: (ids: string[], phase: VotePhase, d: VoteDecision | null) => void }) {
  const { t } = useT();
  const votes = r.votes?.[phase] ?? {};
  const mine = votes[me]?.decision;
  const others = Object.entries(votes).filter(([u]) => u !== me);
  const conflict = Object.values(votes).length >= 2 && new Set(Object.values(votes).map((v) => v.decision)).size > 1;
  const btn = (d: VoteDecision, label: string, cls: string) => (
    <button onClick={() => onVote([r.id], phase, mine === d ? null : d)} className={cn("rounded-lg border px-2 py-0.5 text-[12px] transition", mine === d ? cls : "border-ink-200 text-ink-600 hover:border-ink-300")}>{label}</button>
  );
  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-1.5 rounded-xl px-2 py-1.5 text-[12px]", conflict ? "bg-rose-50" : "bg-ink-50")}>
      <span className="flex items-center gap-1 font-medium text-ink-700"><Users className="h-3.5 w-3.5" /> {t("Oyum")}:</span>
      {btn("include", t("Dahil"), "border-emerald-300 bg-emerald-100 text-emerald-800")}
      {btn("exclude", t("Hariç"), "border-rose-300 bg-rose-100 text-rose-800")}
      {btn("unsure", t("Emin değilim"), "border-ink-300 bg-ink-200 text-ink-800")}
      {others.map(([u, v]) => <span key={u} className={cn("rounded-full px-2 py-0.5", v.decision === "include" ? "bg-emerald-100 text-emerald-800" : v.decision === "exclude" ? "bg-rose-100 text-rose-800" : "bg-ink-200 text-ink-700")}>{v.name || t("Ekip üyesi")}: {v.decision === "include" ? t("dahil") : v.decision === "exclude" ? t("hariç") : t("emin değil")}</span>)}
      {conflict && <span className="ml-auto font-semibold text-rose-700">{t("Anlaşmazlık")}</span>}
    </div>
  );
}

function AgreementPanel({ records, phase }: { records: ReviewRecord[]; phase: VotePhase }) {
  const { t } = useT();
  const a = useMemo(() => agreement(records, phase), [records, phase]);
  if (!a.raters) return <p className="rounded-xl bg-ink-50 p-2.5 text-[12.5px] text-ink-600">{t("Uyum hesabı için en az iki ekip üyesinin aynı kayıtlara oy vermesi gerekir. Ortak yazarlarınızı çalışmaya davet edip birbirinizin oyunu görmeden tarayın.")}</p>;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-ink-100 bg-white p-2.5 text-[12.5px]">
      <span className="font-semibold text-ink-900">{t("Değerlendiriciler arası uyum")}</span>
      <span>{t("Ortak oylanan")}: <b className="tabular-nums">{a.n}</b></span>
      {a.observed != null && <span>{t("Uyuşma")}: <b className="tabular-nums">%{Math.round(a.observed * 100)}</b></span>}
      {a.kappa != null && <span>Cohen κ: <b className="tabular-nums">{a.kappa.toFixed(2)}</b> <span className="text-ink-500">({t(a.label)})</span></span>}
      <span className={cn("rounded-full px-2 py-0.5", a.conflicts.length ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700")}>{t("Anlaşmazlık")}: {a.conflicts.length}</span>
    </div>
  );
}

const ANSWERS: [AppraisalAnswer, string][] = [["yes", "Evet"], ["no", "Hayır"], ["unclear", "Belirsiz"], ["na", "Uygulanamaz"]];
const RISK: Record<string, [string, string]> = { low: ["Düşük yanlılık riski", "bg-emerald-50 text-emerald-700"], moderate: ["Orta yanlılık riski", "bg-amber-50 text-amber-800"], high: ["Yüksek yanlılık riski", "bg-rose-50 text-rose-700"] };

function ExtractTab({ projectId, records, setRecords, lang, upgraded, onInsertMarkdown, sourceTitle }: {
  projectId: string; records: ReviewRecord[]; setRecords: React.Dispatch<React.SetStateAction<ReviewRecord[]>>; lang: "tr" | "en" | "de"; upgraded: boolean;
  onInsertMarkdown?: (md: string, map: Record<string, string>) => void; sourceTitle: (r: ReviewRecord) => string;
}) {
  const { t } = useT();
  const toast = useToast();
  const included = records.filter((r) => r.stage === "included");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const missing = included.filter((r) => !r.extraction?.at);

  async function fill(list: ReviewRecord[]) {
    setBusy(true);
    try {
      for (let i = 0; i < list.length; i += 5) {
        const r = await api<{ results: { id: string; extraction: Extraction }[] }>(`/api/projects/${projectId}/review/extract`, { method: "POST", json: { ids: list.slice(i, i + 5).map((x) => x.id) } });
        setRecords((l) => l.map((x) => { const y = r.results.find((z) => z.id === x.id); return y ? { ...x, extraction: y.extraction } : x; }));
      }
    } catch (e) { toast({ tone: "error", title: t("Veri çıkarılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  async function save(r: ReviewRecord, patch: { extraction?: Extraction; appraisal?: Appraisal }) {
    setRecords((l) => l.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    try { await api(`/api/projects/${projectId}/review/record`, { method: "PATCH", json: { id: r.id, ...patch } }); }
    catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); }
  }
  function tableMd() {
    const labeled = included.map((r, i) => ({ r, label: r.source_id ? `S${i + 1}` : null }));
    const map = Object.fromEntries(labeled.filter((x) => x.label).map((x) => [x.label!, x.r.source_id!]));
    return { md: characteristicsMarkdown(labeled.map(({ r, label }) => ({ label, title: r.record.title, year: r.record.year, extraction: r.extraction, appraisal: r.appraisal })), lang), map };
  }
  function csv() {
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = [t("Çalışma"), t("Yıl"), ...EXTRACTION_FIELDS.map((f) => EXTRACTION_LABELS[f][lang]), ...APPRAISAL_ITEMS.map((i) => i[lang]), t("Yanlılık riski"), t("Dayanak")];
    const rows = included.map((r) => { const s = appraisalSummary(r.appraisal); return [r.record.title, r.record.year ?? "", ...EXTRACTION_FIELDS.map((f) => r.extraction?.[f]?.value ?? ""), ...APPRAISAL_ITEMS.map((i) => r.appraisal?.answers?.[i.id] ?? ""), s.risk ? t(RISK[s.risk][0]) : "", r.extraction?.basedOn ?? ""]; });
    download("veri-cikarma.csv", "﻿" + [head, ...rows].map((x) => x.map(q).join(";")).join("\r\n"), "text/csv;charset=utf-8");
  }

  if (!upgraded) return <p className="rounded-xl bg-amber-50 p-3 text-[13px] text-amber-800">{t("Veri çıkarma ve kalite değerlendirmesi için veritabanı güncellemesi gerekiyor (migration 36). Yöneticinize bildirin.")}</p>;
  if (!included.length) return <p className="rounded-xl bg-ink-50 p-4 text-[13px] text-ink-600">{t("Henüz dahil edilen çalışma yok. Tam metin sekmesinde çalışmaları dahil ettikten sonra burada veri çıkarabilirsiniz.")}</p>;
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-ink-600">{t("Her dahil edilen çalışma için standart veri çıkarma formu ve kalite (yanlılık riski) değerlendirmesi. Yapay zekâ formu yalnızca okunan metinden taslak olarak doldurur, dayanak alıntısını gösterir; değerleri kontrol edip düzeltin. Tam metni okunmuş çalışmalarda sonuç daha isabetlidir: önce “Kaynaklara ekle” ile çalışmaları kaynaklarınıza alın.")}</p>
      <div className="flex flex-wrap gap-2">
        {missing.length > 0 && <Button size="sm" onClick={() => fill(missing)} loading={busy}><Bot className="h-4 w-4" /> {t("Yapay zekâ ile doldur ({n} çalışma)", { n: missing.length })}</Button>}
        {onInsertMarkdown && <Button size="sm" variant="secondary" onClick={() => { const x = tableMd(); onInsertMarkdown(x.md, x.map); toast({ tone: "success", title: t("Tablo belgeye eklendi") }); }}><FilePlus2 className="h-4 w-4" /> {t("Özellikler tablosunu belgeye ekle")}</Button>}
        <Button size="sm" variant="ghost" onClick={csv}><Download className="h-4 w-4" /> CSV</Button>
      </div>
      <ul className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
        {included.map((r) => {
          const sum = appraisalSummary(r.appraisal);
          const isOpen = open === r.id;
          return (
            <li key={r.id} className="rounded-2xl border border-ink-100 bg-white">
              <button onClick={() => setOpen(isOpen ? null : r.id)} className="flex w-full items-center gap-2 p-3 text-left">
                <span className="min-w-0 flex-1"><span className="line-clamp-1 text-[13.5px] font-medium text-ink-900">{sourceTitle(r)}</span><span className="text-[11.5px] text-ink-500">{r.extraction?.at ? (r.extraction.basedOn === "full_text" ? t("Tam metinden çıkarıldı") : r.extraction.basedOn === "abstract" ? t("Yalnızca özetten çıkarıldı") : t("İçerik okunmadı")) : t("Veri çıkarılmadı")}</span></span>
                {sum.risk && <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium", RISK[sum.risk][1])}>{t(RISK[sum.risk][0])}</span>}
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-ink-400 transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="space-y-3 border-t border-ink-100 p-3">
                  <div className="grid gap-2 md:grid-cols-2">
                    {EXTRACTION_FIELDS.map((f) => {
                      const c = r.extraction?.[f];
                      return (
                        <div key={f}>
                          <label className="label">{EXTRACTION_LABELS[f][lang]}</label>
                          <textarea className="input min-h-[52px] text-[13px]" defaultValue={c?.value ?? ""} onBlur={(e) => { const v = e.target.value.trim(); if (v === (c?.value ?? "")) return; save(r, { extraction: { ...(r.extraction ?? {}), [f]: { value: v, quote: c?.quote ?? null, page: c?.page ?? null, edited: true } } }); }} />
                          {c?.quote && <p className="mt-0.5 text-[11.5px] italic text-ink-500">“{c.quote}”{c.page ? ` (s. ${c.page})` : ""}</p>}
                        </div>
                      );
                    })}
                  </div>
                  {r.extraction?.at && <Button size="sm" variant="ghost" onClick={() => fill([r])} loading={busy}><RotateCcw className="h-3.5 w-3.5" /> {t("Yapay zekâ ile yeniden doldur")}</Button>}
                  <div>
                    <p className="label">{t("Kalite değerlendirmesi (JBI ve CASP’tan uyarlanmış 7 madde)")}</p>
                    <ul className="space-y-1">
                      {APPRAISAL_ITEMS.map((it) => (
                        <li key={it.id} className="flex flex-wrap items-center gap-2 text-[12.5px]">
                          <span className="min-w-0 flex-1 text-ink-700">{it[lang]}</span>
                          <span className="flex gap-1">{ANSWERS.map(([v, l]) => <button key={v} onClick={() => save(r, { appraisal: { ...(r.appraisal ?? { answers: {} }), answers: { ...(r.appraisal?.answers ?? {}), [it.id]: v } } })} className={cn("rounded-md border px-1.5 py-0.5 text-[11.5px]", r.appraisal?.answers?.[it.id] === v ? "border-brand-300 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-500 hover:border-ink-300")}>{t(l)}</button>)}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1.5 text-[11.5px] text-ink-500">{sum.score != null ? t("{y}/{a} madde karşılanıyor.", { y: sum.yes, a: sum.applicable }) : t("Risk düzeyi için en az üç maddeyi yanıtlayın.")} {t("“Evet” oranı %75 ve üstü düşük, %50–74 orta, altı yüksek yanlılık riski sayılır.")}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
