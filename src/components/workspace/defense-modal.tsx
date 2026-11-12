"use client";
import { ChevronRight, Gavel, Mic, MicOff, RotateCcw, Star } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { LANG_TAG, writingLang } from "@/lib/writing-lang";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Q { q: string; category: string; why: string }
interface F { score: number; strengths: string[]; improvements: string[]; outline: string[]; followUp: string }
type Level = "kind" | "standard" | "tough";
const LEVELS: { id: Level; label: string }[] = [{ id: "kind", label: "Destekleyici" }, { id: "standard", label: "Standart jüri" }, { id: "tough", label: "Zorlayıcı" }];

/** Tarayıcının konuşma tanıma özelliğiyle sesli cevap (ses sunucuya gönderilmez) */
function useDictation(language: string, onText: (s: string) => void) {
  const { t } = useT();
  const toast = useToast();
  const [listening, setListening] = useState(false);
  const rec = useRef<any>(null);
  function toggle() {
    if (listening) { rec.current?.stop(); return; }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast({ tone: "warning", title: t("Tarayıcınız sesle yazmayı desteklemiyor"), detail: t("Chrome, Edge veya Safari’nin güncel sürümünü deneyin.") }); return; }
    const r = new SR();
    r.lang = LANG_TAG[writingLang(language)];
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e: any) => { let s = ""; for (let i = e.resultIndex; i < e.results.length; i++) if (e.results[i].isFinal) s += e.results[i][0].transcript; if (s.trim()) onText(s.trim()); };
    r.onerror = (e: any) => { if (e.error !== "no-speech" && e.error !== "aborted") toast({ tone: "error", title: t("Mikrofon kullanılamadı"), detail: e.error === "not-allowed" ? t("Tarayıcı ayarlarından mikrofon izni verin.") : String(e.error) }); };
    r.onend = () => setListening(false);
    rec.current = r; r.start(); setListening(true);
  }
  return { listening, toggle, stop: () => rec.current?.stop() };
}

export function DefenseModal({ open, onClose, projectId, language }: { open: boolean; onClose: () => void; projectId: string; language: string }) {
  const { t } = useT();
  const toast = useToast();
  const [level, setLevel] = useState<Level>("standard");
  const [count, setCount] = useState(8);
  const [focus, setFocus] = useState("");
  const [questions, setQuestions] = useState<Q[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Record<number, F>>({});
  const [busy, setBusy] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const dict = useDictation(language, (s) => setAnswer((v) => `${v}${v && !v.endsWith(" ") ? " " : ""}${s}`));

  async function start() {
    setBusy(true);
    try {
      const r = await api<{ questions: Q[] }>(`/api/projects/${projectId}/defense`, { method: "POST", json: { mode: "questions", count, level, focus: focus.trim() || undefined } });
      setQuestions(r.questions); setIdx(0); setAnswer(""); setFeedback({});
    } catch (e) { toast({ tone: "error", title: t("Sorular hazırlanamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function evaluate() {
    if (!questions) return;
    dict.stop();
    setBusy(true);
    try {
      const r = await api<{ feedback: F }>(`/api/projects/${projectId}/defense`, { method: "POST", json: { mode: "evaluate", question: questions[idx].q, answer } });
      setFeedback((f) => ({ ...f, [idx]: r.feedback }));
    } catch (e) { toast({ tone: "error", title: t("Değerlendirilemedi"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  function next() { dict.stop(); setIdx((i) => i + 1); setAnswer(""); setShowWhy(false); }
  const done = questions && idx >= questions.length;
  const scores = Object.values(feedback).map((f) => f.score);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const cur = questions && !done ? questions[idx] : null;
  const fb = feedback[idx];

  return (
    <Modal open={open} onClose={() => { dict.stop(); onClose(); }} title={t("Savunma provası")} wide>
      {!questions ? (
        <div className="space-y-4">
          <p className="text-[13.5px] text-ink-600">{t("Yapay zekâ jüri, çalışmanızın metnini okuyup savunmada sorulabilecek soruları hazırlar. Her soruya yazarak veya konuşarak cevap verin; cevabınızın güçlü ve eksik yönlerini ve daha iyi bir cevabın iskeletini görün.")}</p>
          <div>
            <span className="label">{t("Jüri tutumu")}</span>
            <div className="flex flex-wrap gap-2">{LEVELS.map((l) => <button key={l.id} onClick={() => setLevel(l.id)} className={cn("rounded-xl border px-3.5 py-2 text-sm font-medium transition", level === l.id ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-ink-300")}>{t(l.label)}</button>)}</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <label className="block"><span className="label">{t("Soru sayısı")}</span><select className="input" value={count} onChange={(e) => setCount(Number(e.target.value))}>{[5, 8, 10, 12, 15].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
            <label className="block"><span className="label">{t("Odaklanılacak konu (isteğe bağlı)")}</span><input className="input" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder={t("ör. örneklem büyüklüğü, ölçeğin geçerliği")} /></label>
          </div>
          <Button onClick={start} loading={busy}><Gavel className="h-4 w-4" /> {t("Provayı başlat")}</Button>
          <p className="text-xs text-ink-400">{t("Sorular yalnızca çalışmanızda yazılı olanlara dayanır. Konuşarak cevap verirken ses tarayıcınızda yazıya çevrilir, ses kaydı sunucuya gönderilmez.")}</p>
        </div>
      ) : done ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-ink-50 p-5 text-center">
            <p className="text-sm text-ink-500">{t("Prova tamamlandı")}</p>
            {scores.length > 0 && <p className="mt-1 font-serif text-4xl font-medium text-ink-950">{avg.toFixed(1)} <span className="text-lg text-ink-400">/ 5</span></p>}
            <p className="mt-1 text-sm text-ink-500">{t("{a}/{n} soru değerlendirildi", { a: scores.length, n: questions.length })}</p>
          </div>
          <ul className="space-y-2">
            {questions.map((q, i) => <li key={i} className="flex items-start gap-3 rounded-xl border border-ink-100 p-3 text-[13.5px]"><span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", feedback[i] ? (feedback[i].score >= 4 ? "bg-emerald-100 text-emerald-700" : feedback[i].score >= 3 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700") : "bg-ink-100 text-ink-400")}>{feedback[i]?.score ?? "–"}</span><span className="text-ink-700">{q.q}</span></li>)}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => { setIdx(0); setAnswer(""); setFeedback({}); }}><RotateCcw className="h-4 w-4" /> {t("Aynı sorularla tekrar")}</Button>
            <Button variant="ghost" onClick={() => setQuestions(null)}>{t("Yeni prova")}</Button>
          </div>
        </div>
      ) : cur && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 text-xs text-ink-500">
            <span>{t("Soru {i} / {n}", { i: idx + 1, n: questions.length })}</span>
            {cur.category && <Badge tone="violet">{cur.category}</Badge>}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-ink-100"><div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${(idx / questions.length) * 100}%` }} /></div>
          <p className="font-serif text-[21px] font-medium leading-snug text-ink-950">{cur.q}</p>
          {cur.why && <button onClick={() => setShowWhy((v) => !v)} className="text-xs text-brand-700 hover:underline">{showWhy ? cur.why : t("Jüri bunu neden soruyor?")}</button>}
          {!fb ? (
            <>
              <div className="relative">
                <textarea className="input min-h-[150px] pr-12" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder={t("Cevabınızı yazın veya mikrofona basıp konuşun…")} />
                <button type="button" onClick={dict.toggle} className={cn("absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl transition", dict.listening ? "animate-pulse bg-rose-500 text-white" : "text-ink-500 hover:bg-ink-100")} aria-label={dict.listening ? t("Dinlemeyi durdur") : t("Sesle yaz")}>{dict.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}</button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={evaluate} loading={busy} disabled={answer.trim().length < 5}>{t("Cevabımı değerlendir")}</Button>
                <Button variant="ghost" onClick={next}>{t("Bu soruyu atla")}</Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1" aria-label={t("Puan: {s}/5", { s: fb.score })}>{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={cn("h-5 w-5", n <= fb.score ? "fill-amber-400 text-amber-400" : "text-ink-200")} />)}<span className="ml-2 text-sm text-ink-500">{fb.score}/5</span></div>
              {fb.strengths.length > 0 && <FbList title={t("Güçlü yönler")} items={fb.strengths} tone="emerald" />}
              {fb.improvements.length > 0 && <FbList title={t("Geliştirilecek noktalar")} items={fb.improvements} tone="amber" />}
              {fb.outline.length > 0 && <FbList title={t("Daha güçlü bir cevabın iskeleti")} items={fb.outline} tone="brand" />}
              {fb.followUp && <p className="rounded-xl border border-ink-100 p-3 text-[13.5px] text-ink-700"><b>{t("Jürinin takip sorusu:")}</b> {fb.followUp}</p>}
              <div className="flex flex-wrap gap-2">
                <Button onClick={next}>{idx + 1 < questions.length ? t("Sonraki soru") : t("Sonucu gör")} <ChevronRight className="h-4 w-4" /></Button>
                <Button variant="ghost" onClick={() => setFeedback((f) => { const n = { ...f }; delete n[idx]; return n; })}>{t("Tekrar cevapla")}</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function FbList({ title, items, tone }: { title: string; items: string[]; tone: "emerald" | "amber" | "brand" }) {
  const c = { emerald: "border-emerald-100 bg-emerald-50/60", amber: "border-amber-100 bg-amber-50/60", brand: "border-brand-100 bg-brand-50/60" }[tone];
  return (
    <div className={cn("rounded-xl border p-3 text-[13.5px] text-ink-700", c)}>
      <p className="mb-1 font-semibold text-ink-900">{title}</p>
      <ul className="space-y-1">{items.map((x, i) => <li key={i} className="ml-4 list-disc">{x}</li>)}</ul>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
