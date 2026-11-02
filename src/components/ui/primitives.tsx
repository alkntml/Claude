"use client";
import { useT } from "@/i18n/client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

export function Badge({ tone = "ink", children, className }: { tone?: "ink" | "brand" | "green" | "amber" | "red" | "violet"; children: React.ReactNode; className?: string }) {
  const tones = {
    ink: "bg-ink-100 text-ink-600",
    brand: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
    red: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
    violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100",
  };
  return <span className={cn("chip", tones[tone], className)}>{children}</span>;
}

export function ProgressRing({ value, size = 44, stroke = 4, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className={cn("-rotate-90", className)} aria-label={`%${value}`}>
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-ink-100" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} strokeLinecap="round"
        className="fill-none stroke-brand-500"
        initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - (c * Math.min(100, Math.max(0, value))) / 100 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={{ strokeDasharray: c }}
      />
    </svg>
  );
}

export function ProgressBar({ value, max = 100, tone = "brand", className }: { value: number; max?: number | null; tone?: "brand" | "amber" | "red"; className?: string }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0;
  const color = pct > 90 ? "from-rose-400 to-rose-500" : pct > 70 ? "from-amber-400 to-amber-500" : tone === "brand" ? "from-brand-400 to-indigo-500" : "from-amber-400 to-amber-500";
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ink-100", className)}>
      <motion.div className={cn("h-full rounded-full bg-gradient-to-r", color)} initial={{ width: 0 }} animate={{ width: `${max ? pct : 4}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode }) {
  const { t } = useT();
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
  // Pencere her zaman sayfa köküne çizilir (dönüşümlü/bulanık üst öğelerin içinde konumu bozulmasın)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={cn("relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl", wide ? "sm:max-w-4xl" : "sm:max-w-lg")}
            initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
              <h2 className="text-[17px] font-semibold text-ink-900">{title}</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700" aria-label={t("Kapat")}><X className="h-5 w-5" /></button>
            </div>
            <div className="overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-ink-100 bg-ink-50/60 px-4 py-3.5 sm:px-6" style={{ paddingBottom: "max(14px, env(safe-area-inset-bottom, 0px))" }}>{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function Tabs<T extends string>({ tabs, value, onChange, className, compact }: { tabs: { id: T; label: string; icon?: React.ReactNode; count?: number }[]; value: T; onChange: (v: T) => void; className?: string; compact?: boolean }) {
  return (
    <div className={cn("relative flex gap-1 rounded-xl bg-ink-100/70 p-1", className)} role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} aria-label={t.label} title={t.label} onClick={() => onChange(t.id)} className={cn("relative z-10 flex items-center justify-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-medium transition-colors", compact ? (value === t.id ? "flex-[2.2]" : "flex-1") : "flex-1", value === t.id ? "text-ink-900" : "text-ink-500 hover:text-ink-800")}>
          {value === t.id && <motion.span layoutId={`tab-${tabs.map((x) => x.id).join("")}`} className="absolute inset-0 -z-10 rounded-[10px] bg-white shadow-sm" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
          {t.icon}
          {(!compact || value === t.id) && <span className="truncate">{t.label}</span>}
          {t.count !== undefined && t.count > 0 && <span className="rounded-full bg-ink-200/80 px-1.5 text-[10px] text-ink-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon, title, children, action }: { icon: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">{icon}</div>
      <h3 className="font-semibold text-ink-800">{title}</h3>
      {children && <p className="mt-1 max-w-sm text-sm text-ink-500">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export { FadeIn } from "./fade-in";

export function Dots() {
  const { t } = useT();
  return (
    <span className="inline-flex gap-1" aria-label={t("yükleniyor")}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-brand-500" animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  );
}
