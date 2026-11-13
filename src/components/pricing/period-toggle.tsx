"use client";
import { useT } from "@/i18n/client";
import { cn } from "@/components/ui/cn";
import { YEARLY_DISCOUNT_PERCENT, type BillingPeriod } from "@/lib/pricing";

/** D157: Aylık / Yıllık ödeme seçimi (fiyat kartları ve yükseltme penceresi) */
export function PeriodToggle({ value, onChange, className }: { value: BillingPeriod; onChange: (v: BillingPeriod) => void; className?: string }) {
  const { t } = useT();
  const opt = (v: BillingPeriod, label: React.ReactNode) => (
    <button type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}
      className={cn("inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition", value === v ? "bg-brand-200 text-brand-950 shadow-sm" : "text-ink-600 hover:text-ink-900")}>
      {label}
    </button>
  );
  return (
    <div role="radiogroup" aria-label={t("Ödeme dönemi")} className={cn("inline-flex items-center gap-1 rounded-full border border-ink-200 bg-white p-1", className)}>
      {opt("monthly", t("Aylık"))}
      {opt("yearly", <>{t("Yıllık")} <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-700">{t("%{p} indirim", { p: YEARLY_DISCOUNT_PERCENT })}</span></>)}
    </div>
  );
}
