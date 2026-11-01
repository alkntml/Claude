"use client";
import { CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { LanguageSwitch, useT } from "@/i18n/client";
import { validateAnswers, type Question } from "@/lib/surveys";

/** Katılımcı formu: kimlik bilgisi istenmez; onam (varsa) → sorular → teşekkür */
export function SurveyForm({ token, title, description, consent, questions, accepting, preview }: { token: string; title: string; description: string; consent: string; questions: Question[]; accepting: boolean; preview: boolean }) {
  const { t } = useT();
  const [step, setStep] = useState<"consent" | "form" | "done">(consent.trim() ? "consent" : "form");
  const [agree, setAgree] = useState(false);
  const [a, setA] = useState<Record<string, unknown>>({});
  const [err, setErr] = useState<{ id: string; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [website, setWebsite] = useState("");
  const started = useRef(Date.now());
  const set = (k: string, v: unknown) => { setA((x) => ({ ...x, [k]: v })); if (err?.id && k.startsWith(err.id)) setErr(null); };

  async function submit() {
    const v = validateAnswers(questions, a);
    if (!v.ok) { setErr({ id: v.questionId, msg: t(v.message) }); document.getElementById(`q-${v.questionId}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (preview) { setStep("done"); return; }
    setBusy(true);
    try {
      const res = await fetch(`/api/public/survey/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: a, website, seconds: Math.round((Date.now() - started.current) / 1000) }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(j.code ? { id: j.code, msg: j.error } : { id: "", msg: j.error ?? t("Gönderilemedi, lütfen tekrar deneyin.") }); return; }
      setStep("done");
      window.scrollTo({ top: 0 });
    } catch { setErr({ id: "", msg: t("Bağlantı hatası, lütfen tekrar deneyin.") }); } finally { setBusy(false); }
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[rgb(var(--bg))] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between"><Logo /><LanguageSwitch /></div>
        {preview && <p className="mb-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800">{t("Önizleme: cevaplar kaydedilmez.")}</p>}
        <div className="card p-6 sm:p-8">{children}</div>
        <p className="mt-6 text-center text-xs text-ink-400">{t("Bu form Akademi AI ile hazırlandı. Kimlik bilgisi (ad, e-posta, IP adresi) toplanmaz.")}</p>
      </div>
    </div>
  );

  if (!accepting && !preview) return shell(<><h1 className="font-serif text-2xl font-medium text-ink-950">{title}</h1><p className="mt-3 text-ink-600">{t("Bu anket şu anda cevap kabul etmiyor. Teşekkür ederiz.")}</p></>);
  if (step === "done") return shell(<div className="py-6 text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" /><h1 className="mt-3 font-serif text-2xl font-medium text-ink-950">{t("Teşekkürler!")}</h1><p className="mt-2 text-ink-600">{t("Cevaplarınız kaydedildi. Bu sayfayı kapatabilirsiniz.")}</p></div>);
  if (step === "consent") return shell(
    <>
      <h1 className="font-serif text-2xl font-medium text-ink-950 sm:text-3xl">{title}</h1>
      <h2 className="mt-5 font-semibold text-ink-900">{t("Bilgilendirilmiş onam")}</h2>
      <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">{consent}</p>
      <label className="mt-5 flex items-start gap-2.5 text-[15px] text-ink-800"><input type="checkbox" className="mt-1 h-4 w-4" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> {t("Yukarıdaki bilgileri okudum ve araştırmaya gönüllü olarak katılmayı kabul ediyorum.")}</label>
      <Button className="mt-5" size="lg" disabled={!agree} onClick={() => setStep("form")}>{t("Ankete başla")}</Button>
    </>,
  );
  return shell(
    <>
      <h1 className="font-serif text-2xl font-medium text-ink-950 sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 whitespace-pre-line text-ink-600">{description}</p>}
      <input type="text" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="mt-6 space-y-7">
        {questions.map((q, qi) => {
          const bad = err?.id === q.id;
          const num = questions.slice(0, qi + 1).filter((x) => x.type !== "info").length;
          return (
            <fieldset key={q.id} id={`q-${q.id}`} className={cn("scroll-mt-24 rounded-2xl", bad && "ring-2 ring-rose-300 ring-offset-4")}>
              {q.type === "info" ? <p className="whitespace-pre-line text-[15px] text-ink-700">{q.title}</p> : (
                <legend className="mb-2.5 text-[15.5px] font-medium text-ink-900">{num}. {q.title}{q.required && <span className="ml-0.5 text-rose-500">*</span>}</legend>
              )}
              {q.help && <p className="-mt-1 mb-2 text-sm text-ink-500">{q.help}</p>}
              {q.type === "single" && <div className="space-y-1.5">{q.options.map((o, k) => <label key={k} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[15px]", a[q.id] === k ? "border-brand-400 bg-brand-50" : "border-ink-200")}><input type="radio" name={q.id} checked={a[q.id] === k} onChange={() => set(q.id, k)} /> {o}</label>)}</div>}
              {q.type === "multi" && <div className="space-y-1.5">{q.options.map((o, k) => { const cur = (a[q.id] as number[] | undefined) ?? []; const on = cur.includes(k); return <label key={k} className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-[15px]", on ? "border-brand-400 bg-brand-50" : "border-ink-200")}><input type="checkbox" checked={on} onChange={() => set(q.id, on ? cur.filter((x) => x !== k) : [...cur, k])} /> {o}</label>; })}</div>}
              {q.type === "number" && <input className="input max-w-[200px]" inputMode="decimal" value={String(a[q.id] ?? "")} onChange={(e) => set(q.id, e.target.value)} />}
              {q.type === "text" && (q.long ? <textarea className="input min-h-[110px]" maxLength={5000} value={String(a[q.id] ?? "")} onChange={(e) => set(q.id, e.target.value)} /> : <input className="input" maxLength={500} value={String(a[q.id] ?? "")} onChange={(e) => set(q.id, e.target.value)} />)}
              {q.type === "likert" && (
                <div className="space-y-3">
                  <div className="hidden grid-cols-[1fr_repeat(var(--k),minmax(0,64px))] gap-1 text-center text-[11.5px] leading-tight text-ink-500 sm:grid" style={{ ["--k" as string]: q.points }}><span />{q.labels.map((l, k) => <span key={k}>{l}</span>)}</div>
                  {q.items.map((it, i) => {
                    const key = `${q.id}:${i}`;
                    return (
                      <div key={i} className={cn("rounded-xl border border-ink-100 p-3 sm:grid sm:grid-cols-[1fr_repeat(var(--k),minmax(0,64px))] sm:items-center sm:gap-1 sm:border-0 sm:border-b sm:p-0 sm:pb-2", bad && a[key] === undefined && "border-rose-200 bg-rose-50/50")} style={{ ["--k" as string]: q.points }}>
                        <p className="mb-2 text-[15px] text-ink-800 sm:mb-0">{i + 1}. {it}</p>
                        <div className="grid grid-cols-[repeat(var(--k),minmax(0,1fr))] gap-1 sm:contents" style={{ ["--k" as string]: q.points }}>
                          {Array.from({ length: q.points }, (_, k) => (
                            <label key={k} className="flex cursor-pointer flex-col items-center gap-1 text-[11px] text-ink-500" title={q.labels[k]}>
                              <input type="radio" name={key} className="h-5 w-5" checked={a[key] === k + 1} onChange={() => set(key, k + 1)} aria-label={`${it}: ${q.labels[k]}`} />
                              <span className="sm:hidden">{k + 1}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-ink-400 sm:hidden">{q.labels.map((l, k) => `${k + 1} = ${l}`).join(" · ")}</p>
                </div>
              )}
              {bad && <p className="mt-2 text-sm text-rose-600">{err!.msg}</p>}
            </fieldset>
          );
        })}
      </div>
      {err && !err.id && <p className="mt-5 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{err.msg}</p>}
      <Button className="mt-8 w-full sm:w-auto" size="lg" loading={busy} onClick={submit}>{t("Gönder")}</Button>
    </>,
  );
}
