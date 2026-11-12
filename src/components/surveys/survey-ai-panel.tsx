"use client";
import { AlertTriangle, Check, ChevronDown, Clock3, Lightbulb, Loader2, SearchCheck, Sparkles, Undo2, Wand2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { estimateMinutes, surveyLint, type Question } from "@/lib/surveys";

interface Issue { question: number; item: number; kind: string; problem: string; suggestion: string; replacement: string }

const QUICK = ["Daha kısa yap (en önemli maddeler kalsın)", "Her ölçeğe 1–2 ters madde ekle", "Dili sadeleştir, lise öğrencileri anlayabilsin", "Sona 2 açık uçlu soru ekle", "Demografik sorulara eğitim düzeyi ve gelir ekle", "Tüm anketi İngilizceye çevir"];
const KIND: Record<string, string> = { leading: "Yönlendirici", double_barreled: "İki şeyi birden soruyor", ambiguous: "Belirsiz", negation: "Olumsuz ifade", jargon: "Teknik dil", options: "Seçenekler", sensitive: "Hassas soru", order: "Sıra etkisi", other: "Diğer" };

/**
 * Anket düzenleyicideki yapay zekâ paneli (D66): talimatla düzenleme (geri alınabilir), hakem gözüyle
 * inceleme + önerilen ifadeyi tek tıkla uygulama, kural tabanlı hızlı kontrol ve tahmini süre.
 */
export function SurveyAiPanel({ surveyId, qs, locked, lang, consent, description, onReplace }: {
  surveyId: string; qs: Question[]; locked: boolean; lang: "tr" | "en" | "de"; consent: string; description: string;
  /** Soruları değiştirir (düzenleyici “kaydedilmedi” olarak işaretler ve kartları yeniler) */
  onReplace: (next: Question[]) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [notes, setNotes] = useState<string[]>([]);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState<"revise" | "review" | null>(null);
  const [changes, setChanges] = useState<string[] | null>(null);
  const [undo, setUndo] = useState<Question[] | null>(null);
  const [review, setReview] = useState<{ summary: string; issues: Issue[] } | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());
  const [lintOpen, setLintOpen] = useState(false);

  useEffect(() => {
    try {
      const k = `survey-ai-notes:${surveyId}`;
      const v = sessionStorage.getItem(k);
      if (v) { setNotes(JSON.parse(v)); sessionStorage.removeItem(k); }
    } catch { /* yok say */ }
  }, [surveyId]);

  const lint = useMemo(() => surveyLint(qs, { consent, description }), [qs, consent, description]);
  const minutes = useMemo(() => estimateMinutes(qs), [qs]);
  const answerable = qs.filter((q) => q.type !== "info").length;
  const items = qs.reduce((n, q) => n + (q.type === "likert" ? q.items.length : q.type === "info" ? 0 : 1), 0);

  async function revise(text = instruction) {
    if (text.trim().length < 3) return;
    setBusy("revise"); setChanges(null);
    try {
      const r = await api<{ questions: Question[]; changes: string[] }>(`/api/surveys/${surveyId}/ai`, { method: "POST", json: { mode: "revise", instruction: text.trim(), questions: qs, lang } });
      setUndo(qs); onReplace(r.questions); setChanges(r.changes); setInstruction(""); setReview(null);
      toast({ tone: "success", title: t("Anket düzenlendi"), detail: t("Beğenmezseniz “Geri al” ile eski hâline dönebilirsiniz. Değişiklikler kaydedilene kadar taslaktır.") });
    } catch (e) { toast({ tone: "error", title: t("Düzenlenemedi"), detail: (e as Error).message }); } finally { setBusy(null); }
  }

  async function runReview() {
    setBusy("review"); setApplied(new Set());
    try {
      const r = await api<{ summary: string; issues: Issue[] }>(`/api/surveys/${surveyId}/ai`, { method: "POST", json: { mode: "review", questions: qs, lang } });
      setReview(r);
    } catch (e) { toast({ tone: "error", title: t("İnceleme yapılamadı"), detail: (e as Error).message }); } finally { setBusy(null); }
  }

  function apply(i: number, x: Issue) {
    const q = qs[x.question - 1];
    if (!q || !x.replacement) return;
    let next: Question | null = null;
    if (x.item > 0 && q.type === "likert" && x.item <= q.items.length) next = { ...q, items: q.items.map((it, k) => (k === x.item - 1 ? x.replacement : it)) };
    else if (x.item > 0 && (q.type === "single" || q.type === "multi") && x.item <= q.options.length) next = { ...q, options: q.options.map((o, k) => (k === x.item - 1 ? x.replacement : o)) };
    else if (x.item === 0) next = { ...q, title: x.replacement };
    if (!next) { toast({ tone: "warning", title: t("Bu öneri otomatik uygulanamıyor"), detail: t("Soruyu elle düzenleyin.") }); return; }
    onReplace(qs.map((y, k) => (k === x.question - 1 ? next! : y)));
    setApplied((s) => new Set(s).add(i));
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-100 bg-brand-50/60 px-4 py-3">
        <p className="flex items-center gap-2 font-semibold text-ink-900"><Sparkles className="h-4 w-4 text-brand-600" /> {t("Yapay zekâ asistanı")}</p>
        {qs.length > 0 && <span className="flex items-center gap-1 text-[13px] text-ink-600"><Clock3 className="h-3.5 w-3.5" /> {t("~{n} dk · {q} soru · {i} madde", { n: minutes, q: answerable, i: items })}</span>}
        <Button size="sm" variant="secondary" className="ml-auto" onClick={runReview} loading={busy === "review"} disabled={!qs.length || !!busy}><SearchCheck className="h-3.5 w-3.5" /> {t("Anketi incele")}</Button>
      </div>

      <div className="space-y-4 p-4">
        {notes.length > 0 && (
          <div className="relative rounded-xl bg-violet-50 p-3 pr-9 text-[13px] text-violet-900">
            <button onClick={() => setNotes([])} className="absolute right-2 top-2 rounded p-1 text-violet-500 hover:bg-violet-100" aria-label={t("Kapat")}><X className="h-3.5 w-3.5" /></button>
            <p className="mb-1 font-semibold">{t("Taslak hakkında notlar")}</p>
            <ul className="list-disc space-y-0.5 pl-4">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        )}

        {!locked ? (
          <div>
            <div className="flex gap-2">
              <input className="input !py-2 text-sm" value={instruction} onChange={(e) => setInstruction(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !busy && revise()} placeholder={t("Ne değiştirelim? ör. “Kaygı ölçeğini 6 maddeye indir”")} disabled={!!busy || !qs.length} />
              <Button size="sm" className="!h-10 shrink-0" onClick={() => revise()} loading={busy === "revise"} disabled={instruction.trim().length < 3 || !!busy}><Wand2 className="h-4 w-4" /> {t("Uygula")}</Button>
            </div>
            {qs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK.map((x) => <button key={x} type="button" disabled={!!busy} onClick={() => revise(t(x))} className="rounded-full border border-ink-200 px-2.5 py-1 text-[12px] text-ink-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50">{t(x)}</button>)}
              </div>
            )}
            {busy === "revise" && <p className="mt-2 flex items-center gap-2 text-[13px] text-ink-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("Anket düzenleniyor…")}</p>}
            {changes && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-[13px] text-emerald-900">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  <ul className="flex-1 space-y-0.5">{changes.map((c) => <li key={c}>{c}</li>)}</ul>
                  {undo && <button onClick={() => { onReplace(undo); setUndo(null); setChanges(null); }} className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 font-medium text-emerald-800 hover:bg-emerald-100"><Undo2 className="h-3.5 w-3.5" /> {t("Geri al")}</button>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-ink-500">{t("Anket cevap almaya başladığı için yapay zekâ soruları değiştiremez; yalnızca inceleme ve yazım düzeltmesi önerebilir.")}</p>
        )}

        {review && (
          <div className="space-y-2">
            <p className="text-[13px] text-ink-700"><b>{t("İnceleme:")}</b> {review.summary || t("Belirgin bir sorun bulunmadı.")}</p>
            {review.issues.map((x, i) => {
              const done = applied.has(i);
              return (
                <div key={i} className={cn("rounded-xl border p-3 text-[13px]", done ? "border-emerald-100 bg-emerald-50/60" : "border-amber-100 bg-amber-50/50")}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] text-ink-600 ring-1 ring-ink-100">{x.item > 0 ? t("Soru {n} · {k}. madde", { n: x.question, k: x.item }) : t("Soru {n}", { n: x.question })}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">{t(KIND[x.kind] ?? KIND.other)}</span>
                  </div>
                  <p className="mt-1.5 text-ink-800">{x.problem}</p>
                  {x.suggestion && <p className="mt-1 text-ink-500">{x.suggestion}</p>}
                  {x.replacement && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="flex-1 rounded-lg bg-white px-2.5 py-1.5 font-serif text-ink-800 ring-1 ring-ink-100">“{x.replacement}”</span>
                      <Button size="sm" variant={done ? "ghost" : "soft"} disabled={done} onClick={() => apply(i, x)}>{done ? <><Check className="h-3.5 w-3.5" /> {t("Uygulandı")}</> : t("Öneriyi uygula")}</Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {lint.length > 0 && (
          <div className="rounded-xl border border-ink-100">
            <button type="button" onClick={() => setLintOpen((v) => !v)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] font-medium text-ink-800">
              <Lightbulb className="h-4 w-4 text-amber-500" /> {t("Hızlı kontrol: {n} öneri", { n: lint.length })}
              <span className="text-[11px] font-normal text-ink-400">{t("(ücretsiz, hak harcamaz)")}</span>
              <ChevronDown className={cn("ml-auto h-4 w-4 text-ink-400 transition", lintOpen && "rotate-180")} />
            </button>
            {lintOpen && (
              <ul className="space-y-1.5 border-t border-ink-100 px-3 py-2.5">
                {lint.map((x, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700">
                    {x.level === "warning" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /> : <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />}
                    <span>{t(x.message, x.params)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
