"use client";
import { useT } from "@/i18n/client";
import { ArrowUpRight } from "lucide-react";
import Link from "@/components/l-link";
import { WORK_ICONS } from "@/components/icons";
import { WORK_TYPES } from "@/lib/workflows";

export function WorkTypePicker({ signedIn, compact = false }: { signedIn: boolean; compact?: boolean }) {
  const { t } = useT();
  return (
    <div className={`grid gap-4 ${compact ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {WORK_TYPES.map((w, i) => {
        const Icon = WORK_ICONS[w.icon];
        const href = signedIn ? `/yeni?tur=${w.id}` : `/kayit?next=${encodeURIComponent(`/yeni?tur=${w.id}`)}`;
        return (
          <div key={w.id} className="animate-rise" style={{ animationDelay: `${i * 0.05}s` }}>
            <Link href={href} className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-glow">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-brand-100 to-sky-100 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50 text-brand-600 ring-1 ring-brand-100 transition duration-300 group-hover:scale-110 group-hover:from-brand-500 group-hover:to-indigo-500 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </div>
              <h3 className="relative mt-4 font-semibold text-ink-900">{t(w.title)}</h3>
              <p className="relative text-[12.5px] font-medium text-brand-600/80">{t(w.short)}</p>
              <p className="relative mt-2 text-[13.5px] leading-relaxed text-ink-500">{t(w.description)}</p>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
