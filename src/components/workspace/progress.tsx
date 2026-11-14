"use client";
/**
 * D191: Danışman görünümü — çalışmanın bölüm bölüm ilerlemesi. Çalışma alanında (sahip, ortak yazar, yorumcu, danışman)
 * pencere olarak; danışman paylaşım bağlantısında yan panelde gösterilir.
 */
import { BarChart3, CheckCircle2, Circle, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import type { ProjectProgress, StageStatus } from "@/lib/progress";

const STATUS: Record<StageStatus, { label: string; tone: string }> = {
  empty: { label: "Başlanmadı", tone: "bg-ink-100 text-ink-500" },
  started: { label: "Sürüyor", tone: "bg-amber-50 text-amber-700" },
  written: { label: "Yazıldı", tone: "bg-sky-50 text-sky-700" },
  done: { label: "Hedefe ulaştı", tone: "bg-emerald-50 text-emerald-700" },
};

export function ProgressView({ data, compact }: { data: ProjectProgress; compact?: boolean }) {
  const { t, dl } = useT();
  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(dl, { day: "numeric", month: "short" }) : "—");
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90"><circle cx="40" cy="40" r={r} className="fill-none stroke-ink-100" strokeWidth="8" /><circle cx="40" cy="40" r={r} className="fill-none stroke-brand-500" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - data.percent / 100)} /></svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-ink-900">%{data.percent}</span>
        </div>
        <div className="min-w-0 text-[13px] text-ink-600">
          <p><b className="text-ink-900">{data.totalWords.toLocaleString(dl)}</b> {t("kelime yazıldı")}{data.targetWords ? ` · ${t("hedef")} ${data.targetWords.toLocaleString(dl)}` : ""}</p>
          <p className="mt-0.5">{t("Son çalışma: {d}", { d: date(data.lastActivity) })}</p>
          <p className="mt-0.5">{data.quality ? t("Son kalite puanı: {s} ({d})", { s: data.quality.score ?? "—", d: date(data.quality.at) }) : t("Henüz kalite kontrolü yapılmadı")}</p>
          {data.openComments > 0 && <p className="mt-0.5 font-medium text-amber-700">{t("{n} açık yorum", { n: data.openComments })}</p>}
        </div>
      </div>
      <ul className={cn("divide-y divide-ink-100 rounded-2xl border border-ink-100", compact && "text-[12.5px]")}>
        {data.stages.map((s) => (
          <li key={s.id} className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              {s.status === "done" || s.status === "written" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> : <Circle className="h-4 w-4 shrink-0 text-ink-300" />}
              <span className="min-w-0 flex-1 truncate font-medium text-ink-800">{s.title}</span>
              {s.openComments > 0 && <span className="inline-flex items-center gap-1 text-[11.5px] text-amber-700"><MessageSquare className="h-3 w-3" />{s.openComments}</span>}
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS[s.status].tone)}>{t(STATUS[s.status].label)}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 pl-6 text-[11.5px] text-ink-500">
              <span className="h-1.5 flex-1 rounded-full bg-ink-100"><span className="block h-1.5 rounded-full bg-brand-500" style={{ width: `${s.pct ?? (s.words ? 100 : 0)}%`, opacity: s.pct == null ? 0.35 : 1 }} /></span>
              <span className="shrink-0 tabular-nums">{s.words.toLocaleString(dl)}{s.target ? ` / ${s.target.toLocaleString(dl)}` : ""} {t("kelime")}</span>
              {!compact && <span className="shrink-0">{date(s.updatedAt)}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProgressButton({ projectId, highlight }: { projectId: string; highlight?: boolean }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ProjectProgress | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { if (open) api<ProjectProgress>(`/api/projects/${projectId}/progress`).then(setData).catch((e) => setErr((e as Error).message)); }, [open, projectId]);
  return (
    <>
      <button onClick={() => setOpen(true)} className={cn("hidden h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13.5px] font-medium transition lg:flex", highlight ? "bg-brand-50 text-brand-700 hover:bg-brand-100" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900")}>
        <BarChart3 className="h-4 w-4" /> {t("İlerleme")}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={t("Çalışmanın ilerlemesi")}>
        {err ? <p className="text-[13px] text-rose-600">{err}</p> : data ? <ProgressView data={data} /> : <p className="text-[13px] text-ink-400">{t("Yükleniyor…")}</p>}
      </Modal>
    </>
  );
}
