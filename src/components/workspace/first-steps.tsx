"use client";
/**
 * D213: İlk adımlar rehberi. Yeni çalışmada sol menüde dört adım: kurgu, kaynak, ilk bölüm (Zenit), denetim (Mizan).
 * Adımlar çalışmanın gerçek durumundan kendiliğinden işaretlenir; Mizan adımı denetim ilk açıldığında işaretlenir.
 * Kapatma ve Mizan işareti tarayıcı belleğinde çalışma başına tutulur (akademi:onboarding:<id>, consent.ts envanterinde).
 */
import { Check, ChevronDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { WithMarks } from "@/components/brand-mark";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";

export interface FirstStep { id: string; label: string; hint: string; done: boolean; onClick: () => void }

const keyOf = (projectId: string) => `akademi:onboarding:${projectId}`;
type Saved = { dismissed?: boolean; mizan?: boolean; collapsed?: boolean };
export function readFirstSteps(projectId: string): Saved {
  try { return JSON.parse(localStorage.getItem(keyOf(projectId)) ?? "{}") as Saved; } catch { return {}; }
}
export function saveFirstSteps(projectId: string, patch: Saved) {
  try { localStorage.setItem(keyOf(projectId), JSON.stringify({ ...readFirstSteps(projectId), ...patch })); } catch { /* yok say */ }
}

export function FirstSteps({ projectId, steps }: { projectId: string; steps: FirstStep[] }) {
  const { t } = useT();
  const [saved, setSaved] = useState<Saved | null>(null);
  useEffect(() => { setSaved(readFirstSteps(projectId)); }, [projectId]);
  if (!saved || saved.dismissed) return null;
  const done = steps.filter((s) => s.done).length;
  if (done === steps.length) return null;
  const next = steps.find((s) => !s.done);
  const set = (p: Saved) => { saveFirstSteps(projectId, p); setSaved((x) => ({ ...x, ...p })); };
  return (
    <div className="mx-3 mt-2 rounded-2xl border border-brand-100 bg-brand-50/40 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => set({ collapsed: !saved.collapsed })} className="flex min-w-0 flex-1 items-center gap-2 text-left" aria-expanded={!saved.collapsed}>
          <span className="text-[13px] font-semibold text-ink-900">{t("İlk adımlar")}</span>
          <span className="text-[12px] tabular-nums text-ink-500">{done}/{steps.length}</span>
          <ChevronDown className={cn("ml-auto h-3.5 w-3.5 text-ink-400 transition", saved.collapsed && "-rotate-90")} />
        </button>
        <button onClick={() => set({ dismissed: true })} className="rounded p-0.5 text-ink-400 hover:bg-white hover:text-ink-700" aria-label={t("İlk adımlar rehberini kapat")} title={t("Kapat")}><X className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${(done / steps.length) * 100}%` }} /></div>
      {!saved.collapsed && (
        <ol className="mt-2.5 space-y-1">
          {steps.map((s, i) => (
            <li key={s.id}>
              <button onClick={s.onClick} disabled={s.done} className={cn("flex w-full items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition", s.done ? "cursor-default" : "hover:bg-white", s === next && "bg-white shadow-sm")}>
                <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold", s.done ? "bg-emerald-50 text-emerald-600" : s === next ? "bg-brand-600 text-white" : "bg-ink-100 text-ink-500")}>
                  {s.done ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-[13px] font-medium", s.done ? "text-ink-400 line-through" : "text-ink-800")}><WithMarks text={t(s.label)} /></span>
                  {s === next && <span className="block text-[11.5px] leading-snug text-ink-500">{t(s.hint)}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
