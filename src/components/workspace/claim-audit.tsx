"use client";
/**
 * İddia denetimi penceresi (D119). Kaynağın var olması ile cümleyi gerçekten desteklemesi ayrı şeylerdir:
 * burada atıflı her cümlenin kaynağın okunan metninde desteklenip desteklenmediği, dayanak pasajı ve sayfasıyla gösterilir.
 */
import type { Editor } from "@tiptap/react";
import { AlertTriangle, BookOpen, CheckCircle2, CircleHelp, Crosshair, Eraser, FileWarning, Loader2, ShieldCheck, Wand2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import type { AuditItem, ClaimAudit, ClaimVerdict } from "@/lib/claims";
import { api } from "@/lib/client";
import { findSentence, setClaimMarks, type ClaimMark, type MarkTone } from "./claim-marks";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Filter = "problems" | "all" | ClaimVerdict | "uncited" | "marked";
const VERDICT: Record<ClaimVerdict, { label: string; tone: MarkTone; cls: string; Icon: typeof CheckCircle2 }> = {
  supports: { label: "Destekleniyor", tone: "good", cls: "bg-emerald-50 text-emerald-700", Icon: CheckCircle2 },
  partial: { label: "Kısmen destekleniyor", tone: "partial", cls: "bg-amber-50 text-amber-800", Icon: AlertTriangle },
  not_supported: { label: "Desteklenmiyor", tone: "bad", cls: "bg-rose-50 text-rose-700", Icon: XCircle },
  insufficient: { label: "Kaynak metni yetersiz", tone: "unknown", cls: "bg-ink-100 text-ink-600", Icon: CircleHelp },
};
const ACCESS: Record<string, string> = { full_text: "Tam metin okundu", abstract: "Yalnızca özet okundu", metadata: "Yalnızca künye" };

function toneOf(it: AuditItem): MarkTone {
  if (it.kind === "uncited" || it.kind === "marked") return "uncited";
  return it.verdict ? VERDICT[it.verdict].tone : "unknown";
}

export function ClaimAuditModal({ open, onClose, editor, stageId, scopeLabel, focus, sources, onFix }: {
  open: boolean; onClose: () => void; editor: Editor; stageId: string; scopeLabel: string; focus: number | null;
  sources: Record<string, any>; onFix: (item: AuditItem, hint: string) => void;
}) {
  const { t, dl } = useT();
  const toast = useToast();
  const [audit, setAudit] = useState<ClaimAudit | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("problems");
  const [marks, setMarks] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api<{ audit: ClaimAudit | null }>(`/api/stages/${stageId}/claim-audit`).then((r) => setAudit(r.audit)).catch(() => setAudit(null)).finally(() => setLoading(false));
  }, [open, stageId]);

  const applyMarks = (a: ClaimAudit | null, on: boolean) => {
    if (!editor || editor.isDestroyed) return;
    const list: ClaimMark[] = on && a ? a.results.filter((x) => x.verdict !== "supports").map((x) => ({ text: x.text, tone: toneOf(x), title: x.kind === "cited" && x.verdict ? t(VERDICT[x.verdict].label) : t("Kaynak gerektirebilir") })) : [];
    setClaimMarks(editor.view, list);
  };

  async function run() {
    setBusy(true);
    try {
      const r = await api<{ audit: ClaimAudit }>(`/api/stages/${stageId}/claim-audit`, { method: "POST", json: { focus } });
      setAudit(r.audit);
      applyMarks(r.audit, marks);
      const s = r.audit.summary;
      if (!s.total) toast({ tone: "info", title: t("Denetlenecek iddia bulunamadı"), detail: t("Bu kısımda atıflı cümle veya kaynak gerektirebilecek kesin ifade yok.") });
    } catch (e) { toast({ tone: "error", title: t("Denetim yapılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }

  const items = useMemo(() => {
    const all = audit?.results ?? [];
    const order = (x: AuditItem) => (x.kind !== "cited" ? 1 : x.verdict === "not_supported" ? 0 : x.verdict === "partial" ? 2 : x.verdict === "insufficient" ? 3 : x.verdict ? 5 : 4);
    const f = all.filter((x) => filter === "all" ? true
      : filter === "problems" ? !(x.kind === "cited" && x.verdict === "supports")
      : filter === "uncited" || filter === "marked" ? x.kind === filter
      : x.kind === "cited" && x.verdict === filter);
    return [...f].sort((a, b) => order(a) - order(b));
  }, [audit, filter]);

  function goTo(it: AuditItem) {
    const r = findSentence(editor.state.doc, it.text);
    if (!r) { toast({ tone: "info", title: t("Cümle metinde bulunamadı"), detail: t("Metin denetimden sonra değişmiş olabilir; denetimi yeniden çalıştırın.") }); return; }
    editor.chain().focus().setTextSelection(r).scrollIntoView().run();
    onClose();
  }

  const s = audit?.summary;
  const bar: [keyof typeof VERDICT | "uncited", number, string][] = s ? [["not_supported", s.not_supported, "bg-rose-500"], ["partial", s.partial, "bg-amber-400"], ["insufficient", s.insufficient, "bg-ink-300"], ["uncited", s.uncited + s.marked, "bg-orange-400"], ["supports", s.supports, "bg-emerald-500"]] : [];

  return (
    <Modal open={open} onClose={onClose} title={t("İddia denetimi")} wide>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-3.5 text-[13px] text-ink-700">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="min-w-0 flex-1">{t("Bir kaynağın var olması, cümlenizi desteklediği anlamına gelmez. Atıflı her cümle, atıf yaptığı kaynağın okunan metniyle (tam metin veya özet) karşılaştırılır; dayanak pasajı ve sayfası gösterilir. Atıfsız kesin ifadeler de işaretlenir.")} <b>{scopeLabel}</b></p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={run} loading={busy}><ShieldCheck className="h-4 w-4" /> {audit ? t("Yeniden denetle") : t("Denetimi başlat")}</Button>
          {audit?.id && <span className="text-[12.5px] text-ink-500">{t("Son denetim: {d}", { d: new Date(audit.created_at).toLocaleString(dl) })}</span>}
          {audit && (
            <label className="ml-auto flex items-center gap-2 text-[13px] text-ink-600">
              <input type="checkbox" checked={marks} onChange={(e) => { setMarks(e.target.checked); applyMarks(audit, e.target.checked); }} /> {t("Sorunlu cümleleri metinde işaretle")}
            </label>
          )}
          {audit && <button onClick={() => applyMarks(null, false)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12.5px] text-ink-500 hover:bg-ink-100"><Eraser className="h-3.5 w-3.5" /> {t("İşaretleri temizle")}</button>}
        </div>
        {busy && <p className="flex items-center gap-2 text-[13px] text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Cümleler kaynaklarla karşılaştırılıyor… Değişmeyen cümleler yeniden denetlenmez.")}</p>}
        {loading && !audit && <p className="text-[13px] text-ink-400">{t("Yükleniyor…")}</p>}
        {!loading && !audit && !busy && <p className="rounded-xl bg-ink-50 p-4 text-[13.5px] text-ink-600">{t("Bu bölüm henüz denetlenmedi. “Denetimi başlat” ile atıflı cümlelerinizi kaynaklarıyla karşılaştırın. Her kaynak için bir yapay zekâ isteği kullanılır; aynı cümle ikinci kez ücretlendirilmez.")}</p>}

        {s && s.total > 0 && (
          <>
            <div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-ink-100">{bar.map(([k, n, c]) => n > 0 && <span key={k} className={c} style={{ width: `${(n / s.total) * 100}%` }} />)}</div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[12.5px]">
                {([["problems", t("Sorunlular"), s.total - s.supports], ["not_supported", t("Desteklenmiyor"), s.not_supported], ["partial", t("Kısmen"), s.partial], ["insufficient", t("Okunamadı"), s.insufficient], ["uncited", t("Atıfsız iddia"), s.uncited], ["marked", t("[KAYNAK GEREKLİ]"), s.marked], ["supports", t("Destekleniyor"), s.supports], ["all", t("Tümü"), s.total]] as [Filter, string, number][]).map(([k, l, n]) => (
                  <button key={k} onClick={() => setFilter(k)} className={cn("rounded-full border px-2.5 py-1 transition", filter === k ? "border-brand-300 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600 hover:border-ink-300")}>{l} <b className="tabular-nums">{n}</b></button>
                ))}
              </div>
              {!!s.skipped && <p className="mt-2 text-[12px] text-amber-700">{t("{n} cümle–kaynak eşleşmesi bu turda denetlenmedi (tek seferde en fazla 40). Kalanlar için yeniden denetleyin.", { n: s.skipped })}</p>}
            </div>

            <ul className="max-h-[52vh] space-y-2.5 overflow-y-auto pr-1">
              {items.length === 0 && <li className="rounded-xl bg-emerald-50 p-4 text-[13.5px] text-emerald-800">{t("Bu filtrede cümle yok.")}</li>}
              {items.map((it) => (
                <li key={it.id} className="rounded-2xl border border-ink-100 bg-white p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {it.kind === "cited" && it.verdict ? (() => { const V = VERDICT[it.verdict]; return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold", V.cls)}><V.Icon className="h-3.5 w-3.5" />{t(V.label)}</span>; })()
                      : it.kind === "cited" ? <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[11.5px] text-ink-600">{t("Denetlenmedi")}</span>
                      : <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11.5px] font-semibold text-orange-700"><FileWarning className="h-3.5 w-3.5" />{it.kind === "marked" ? t("Kaynak gerekli işaretli") : t("Atıfsız iddia: kaynak gerektirebilir")}</span>}
                    <button onClick={() => goTo(it)} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] text-ink-500 hover:bg-ink-100"><Crosshair className="h-3.5 w-3.5" /> {t("Cümleye git")}</button>
                    {(it.kind !== "cited" || (it.verdict && it.verdict !== "supports")) && (
                      <button onClick={() => onFix(it, it.checks.map((c) => c.quote ? `“${c.quote}”${c.quotePage ? ` (s. ${c.quotePage})` : ""}` : c.explanation).join(" / "))} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-[12px] font-medium text-brand-700 hover:bg-brand-100"><Wand2 className="h-3.5 w-3.5" /> {t("Asistanla düzelt")}</button>
                    )}
                  </div>
                  <p className="mt-2 font-serif text-[14.5px] leading-relaxed text-ink-900">{it.text}</p>
                  {it.checks.map((c) => (
                    <div key={c.sourceId} className="mt-2 rounded-xl bg-ink-50/70 p-2.5 text-[12.5px] text-ink-700">
                      <p className="flex flex-wrap items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-ink-400" /><span className="font-medium">{sources[c.sourceId]?.title ?? t("Kaynak")}</span><span className="text-ink-400">· {t(ACCESS[c.access] ?? "")}</span>{it.checks.length > 1 && <span className={cn("rounded-full px-1.5 text-[11px]", VERDICT[c.verdict].cls)}>{t(VERDICT[c.verdict].label)}</span>}</p>
                      <p className="mt-1">{c.explanation}</p>
                      {c.quote && <blockquote className="mt-1.5 border-l-2 border-brand-300 pl-2 italic text-ink-600">“{c.quote}”{c.quotePage ? ` (s. ${c.quotePage})` : ""}</blockquote>}
                      {c.access === "metadata" && <p className="mt-1 text-[12px] text-ink-500">{t("Bu kaynağın içeriği okunmadı. Kaynaklar sekmesinden tam metni getirin veya PDF’ini yükleyin, sonra yeniden denetleyin.")}</p>}
                    </div>
                  ))}
                  {it.kind === "uncited" && <p className="mt-1.5 text-[12.5px] text-ink-500">{t("Sayı, oran veya “araştırmalar göstermektedir” gibi kesin bir ifade içeriyor ama atıf yok. Kendi bulgunuzsa sorun değil; değilse kaynak ekleyin.")}</p>}
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="text-[12px] leading-relaxed text-ink-400">{t("Karar yalnızca kaynağın okunan metnine dayanır ve yapay zekâ değerlendirmesidir; son kararı siz verirsiniz. Alıntılar kaynak metninde birebir doğrulanmadıysa gösterilmez.")}</p>
      </div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
