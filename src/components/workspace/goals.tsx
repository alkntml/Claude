"use client";
import { CalendarDays, Target } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { daysLeft, deadlinePlan, neededPerWeek, wordsThisWeek, type Goal } from "@/lib/goals";

/* eslint-disable @typescript-eslint/no-explicit-any */
function useWeekly(project: any, stages: any[]) {
  const total = stages.reduce((a, s) => a + (s.word_count ?? 0), 0);
  const initial = useRef(total);
  const log = project.context?.wordLog ?? {};
  const now = new Date();
  // Kayıt yoksa (ilk kullanım) oturum başındaki toplam temel alınır
  const week = Object.keys(log).length ? wordsThisWeek(log, now, total) : Math.max(0, total - initial.current);
  return { total, week, now };
}

/** Yol haritası altında: haftalık kelime hedefi ve teslim tarihine kalan gün */
export function GoalWidget({ project, stages, onOpen }: { project: any; stages: any[]; onOpen: () => void }) {
  const { t } = useT();
  const goal: Goal = project.context?.goal ?? {};
  const { week, now } = useWeekly(project, stages);
  const left = daysLeft(goal.deadline, now);
  if (!goal.weeklyWords && !goal.deadline) {
    return <button onClick={onOpen} className="mx-3 mt-2 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl border border-dashed border-ink-200 px-3 py-2 text-left text-[12.5px] text-ink-500 transition hover:border-brand-300 hover:text-brand-700"><Target className="h-4 w-4" /> {t("Haftalık hedef ve teslim tarihi belirle")}</button>;
  }
  const pct = goal.weeklyWords ? Math.min(100, Math.round((week / goal.weeklyWords) * 100)) : 0;
  return (
    <button onClick={onOpen} className="mx-3 mt-2 block w-[calc(100%-1.5rem)] rounded-xl bg-white px-3 py-2.5 text-left ring-1 ring-ink-100 transition hover:ring-brand-200">
      {goal.weeklyWords ? (
        <>
          <div className="flex items-baseline justify-between text-[12px]"><span className="font-medium text-ink-700">{t("Bu hafta")}</span><span className="text-ink-500">{t("{w} / {g} kelime", { w: week.toLocaleString(), g: goal.weeklyWords.toLocaleString() })}</span></div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink-100"><div className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-brand-500")} style={{ width: `${pct}%` }} /></div>
        </>
      ) : null}
      {left !== null && <p className={cn("flex items-center gap-1 text-[11.5px]", goal.weeklyWords && "mt-1.5", left < 14 ? "text-rose-600" : "text-ink-500")}><CalendarDays className="h-3.5 w-3.5" /> {left > 0 ? t("Teslime {n} gün", { n: left }) : t("Teslim tarihi geçti")}</p>}
    </button>
  );
}

/** Hedef ayarı ve teslim tarihine göre haftalık bölüm takvimi */
export function GoalModal({ open, onClose, project, stages, patch }: { open: boolean; onClose: () => void; project: any; stages: any[]; patch: (u: Record<string, unknown>) => Promise<any> }) {
  const { t, dl } = useT();
  const toast = useToast();
  const g: Goal = project.context?.goal ?? {};
  const [weekly, setWeekly] = useState(String(g.weeklyWords ?? ""));
  const [deadline, setDeadline] = useState(g.deadline ?? "");
  const [target, setTarget] = useState(String(g.targetWords ?? ""));
  const { total, week, now } = useWeekly(project, stages);
  const plan = useMemo(() => deadlinePlan(stages, deadline || null, new Date()), [stages, deadline]);
  const goalNow: Goal = { weeklyWords: Number(weekly) || null, deadline: deadline || null, targetWords: Number(target) || null };
  const need = neededPerWeek(goalNow, total, now);
  const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(dl, { day: "numeric", month: "short" });

  async function save() {
    const ok = await patch({ context: { goal: goalNow } });
    if (ok) { toast({ tone: "success", title: t("Hedef kaydedildi") }); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Yazım hedefi ve takvim")} wide footer={<><Button variant="ghost" onClick={onClose}>{t("Vazgeç")}</Button><Button onClick={save}>{t("Kaydet")}</Button></>}>
      <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
        <div className="space-y-3">
          <label className="block"><span className="label">{t("Haftalık kelime hedefi")}</span><input type="number" min={0} step={100} className="input" placeholder="2000" value={weekly} onChange={(e) => setWeekly(e.target.value)} /></label>
          <label className="block"><span className="label">{t("Teslim tarihi")}</span><input type="date" className="input" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label>
          <label className="block"><span className="label">{t("Hedeflenen toplam kelime (isteğe bağlı)")}</span><input type="number" min={0} step={1000} className="input" placeholder="25000" value={target} onChange={(e) => setTarget(e.target.value)} /></label>
          <div className="rounded-xl bg-ink-50 p-3 text-[13px] text-ink-600">
            <p>{t("Şu an toplam {n} kelime; bu hafta {w} kelime yazıldı.", { n: total.toLocaleString(), w: week.toLocaleString() })}</p>
            {need !== null && <p className="mt-1 font-medium text-ink-800">{t("Hedefe ulaşmak için haftada yaklaşık {n} kelime gerekiyor.", { n: need.toLocaleString() })}</p>}
          </div>
        </div>
        <div>
          <p className="mb-2 font-medium text-ink-900">{t("Önerilen takvim")}</p>
          {!deadline ? <p className="text-sm text-ink-400">{t("Teslim tarihi girin; kalan bölümler haftalara dağıtılır.")}</p>
            : !plan.length ? <p className="text-sm text-rose-600">{t("Teslim tarihi geçmiş görünüyor.")}</p>
            : (
              <ol className="max-h-[50vh] space-y-1.5 overflow-y-auto">
                {plan.map((w, i) => (
                  <li key={w.start} className="rounded-xl border border-ink-100 px-3 py-2 text-[13px]">
                    <p className="text-xs font-semibold text-ink-500">{t("{n}. hafta", { n: i + 1 })} · {fmt(w.start)} – {fmt(w.end)}</p>
                    <p className="mt-0.5 text-ink-800">{w.stages.length ? w.stages.join(" · ") : i === plan.length - 1 ? t("Genel okuma, düzeltme ve danışmana teslim") : t("Ara / tampon hafta")}</p>
                  </li>
                ))}
              </ol>
            )}
        </div>
      </div>
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
