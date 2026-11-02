"use client";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, Loader2, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface Issue { severity: "info" | "warning" | "error"; title: string; detail: string; fix?: string; source: "rule" | "ai" }
export interface Review { verdict: "ok" | "minor" | "major"; summary: string; strengths: string[]; issues: Issue[]; aiRan: boolean }

/** “Bölümü tamamladım” sonrası kontrol: uygunsa tamamlanır, değilse sorunlar ve düzeltme seçenekleri */
export function StageReviewModal({ open, onClose, stageId, stageTitle, onComplete, onFix }: { open: boolean; onClose: () => void; stageId: string; stageTitle: string; onComplete: () => void; onFix: (issues: Issue[]) => void }) {
  const { t } = useT();
  const [review, setReview] = useState<Review | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReview(null); setError(null); setAiError(null);
    api<{ review: Review; aiError: string | null }>(`/api/stages/${stageId}/review`, { method: "POST", json: {} })
      .then((r) => { setReview(r.review); setAiError(r.aiError); })
      .catch((e) => setError((e as Error).message));
  }, [open, stageId]);

  const v = review?.verdict;
  const head = v === "ok"
    ? { cls: "border-emerald-200 bg-emerald-50 text-emerald-800", Icon: CheckCircle2, text: t("Bölüm uygun görünüyor") }
    : v === "minor"
      ? { cls: "border-amber-200 bg-amber-50 text-amber-900", Icon: AlertTriangle, text: t("Küçük düzeltmeler önerilir") }
      : { cls: "border-rose-200 bg-rose-50 text-rose-800", Icon: CircleAlert, text: t("Bölümde önemli eksikler var") };

  return (
    <Modal open={open} onClose={onClose} title={t("Bölüm kontrolü: {s}", { s: stageTitle })} wide footer={review || error ? <>
      {v !== "ok" && <Button variant="ghost" onClick={() => { onComplete(); onClose(); }}>{t("Yine de tamamlandı işaretle")}</Button>}
      {v === "ok" || error
        ? <Button onClick={() => { onComplete(); onClose(); }}><CheckCircle2 className="h-4 w-4" /> {t("Tamamla ve sıradakine geç")}</Button>
        : <Button onClick={() => { onFix(review!.issues); onClose(); }}><Wand2 className="h-4 w-4" /> {t("Asistanla düzelt")}</Button>}
    </> : undefined}>
      {!review && !error && (
        <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-ink-500">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          <p>{t("Bölüm kontrol ediliyor: kaynak işaretleri, tekrarlar, akademik dil ve bölümün amacına uygunluk…")}</p>
        </div>
      )}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{t("Kontrol yapılamadı:")} {error}</p>}
      {review && (
        <div className="space-y-4">
          <div className={cn("flex items-start gap-3 rounded-2xl border p-4", head.cls)}>
            <head.Icon className="mt-0.5 h-5 w-5 shrink-0" />
            <div><p className="font-semibold">{head.text}</p>{review.summary && <p className="mt-0.5 text-[13.5px] opacity-90">{review.summary}</p>}</div>
          </div>
          {review.strengths.length > 0 && (
            <div className="text-[13.5px]"><p className="mb-1 font-semibold text-ink-900">{t("İyi yanlar")}</p><ul className="space-y-1 text-ink-700">{review.strengths.map((s, i) => <li key={i} className="ml-4 list-disc">{s}</li>)}</ul></div>
          )}
          {review.issues.length > 0 && (
            <div>
              <p className="mb-2 text-[13.5px] font-semibold text-ink-900">{t("Bulunan sorunlar ({n})", { n: review.issues.length })}</p>
              <ul className="space-y-2">
                {review.issues.map((i, k) => {
                  const Icon = i.severity === "error" ? CircleAlert : i.severity === "warning" ? AlertTriangle : Info;
                  return (
                    <li key={k} className="flex items-start gap-2.5 rounded-xl border border-ink-100 p-3 text-[13.5px]">
                      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", i.severity === "error" ? "text-rose-500" : i.severity === "warning" ? "text-amber-500" : "text-ink-400")} />
                      <div className="min-w-0">
                        <p className="font-medium text-ink-900">{i.title}</p>
                        <p className="text-ink-600">{i.detail}</p>
                        {i.fix && <p className="mt-1 text-ink-500"><b>{t("Öneri:")}</b> {i.fix}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {!review.aiRan && <p className="text-xs text-ink-400">{aiError ? `${t("Yapay zekâ incelemesi yapılamadı; yalnızca otomatik kontroller gösteriliyor.")} (${aiError})` : t("Yapay zekâ incelemesi yapılamadı; yalnızca otomatik kontroller gösteriliyor.")}</p>}
          <p className="text-xs text-ink-400">{t("Kontrol yol göstericidir; son karar sizin ve danışmanınızındır.")}</p>
        </div>
      )}
    </Modal>
  );
}
