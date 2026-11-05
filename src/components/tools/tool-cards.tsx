"use client";
import { BookMarked, Calculator, ClipboardList, Repeat2, Sigma, ShieldCheck } from "lucide-react";
import Link from "@/components/l-link";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { TOOLS } from "@/lib/tools";

const ICON: Record<string, typeof BookMarked> = { fake_check: ShieldCheck, bibliography: BookMarked, convert: Repeat2, sample_size: Calculator, alpha: Sigma, survey_builder: ClipboardList };

/** Ücretsiz araç kartları (ana sayfa ve /araclar); `exclude` o an açık olan aracı gizler */
export function ToolCards({ exclude, compact }: { exclude?: string; compact?: boolean }) {
  const { t } = useT();
  return (
    <ul className={cn("grid gap-4", compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {TOOLS.filter((x) => x.id !== exclude).map((x) => {
        const Icon = ICON[x.id] ?? BookMarked;
        return (
          <li key={x.id}>
            <Link href={x.path} className="card group flex h-full flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon className="h-5 w-5" /></span>
              <span className="font-semibold text-ink-950">{t(x.title)}</span>
              <span className="text-[14px] leading-relaxed text-ink-500">{t(x.short)}</span>
              <span className="mt-auto text-sm font-medium text-brand-700 group-hover:underline">{t("Ücretsiz kullan")} →</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
