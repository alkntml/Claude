"use client";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, ClipboardList, Gavel, LineChart, MessageSquareReply, Wrench } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";

export type ToolId = "chart" | "analysis" | "survey" | "reviewer" | "defense";
const TOOLS: { id: ToolId; label: string; hint: string; Icon: typeof Wrench; types?: string[] }[] = [
  { id: "chart", label: "Grafik oluştur", hint: "Verinizden APA biçiminde şekil", Icon: LineChart },
  { id: "analysis", label: "İstatistik analizi", hint: "t testi, ANOVA, korelasyon, regresyon…", Icon: BarChart3 },
  { id: "survey", label: "Anket oluştur", hint: "Bağlantıyla veri toplayın, analize aktarın", Icon: ClipboardList },
  { id: "reviewer", label: "Hakem yorumlarına cevap", hint: "Madde madde cevap mektubu", Icon: MessageSquareReply, types: ["research_article", "journal_article", "literature_review", "grant_proposal"] },
  { id: "defense", label: "Savunma provası", hint: "Yapay zekâ jüri soruları ve geri bildirim", Icon: Gavel },
];

/** Çalışma alanı araçları: masaüstünde açılır menü, mobil menüde satırlar */
export function ToolsMenu({ onPick, workType, variant = "button" }: { onPick: (id: ToolId) => void; workType: string; variant?: "button" | "rows" }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  // Hakem cevabı her türde erişilebilir; makale türlerinde üstte gösterilir
  const tools = [...TOOLS].sort((a, b) => Number(!!b.types?.includes(workType)) - Number(!!a.types?.includes(workType)));
  if (variant === "rows") {
    return (
      <>
        {tools.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => onPick(id)} className="flex items-center gap-3 rounded-2xl border border-ink-100 px-4 py-3 text-left text-[15px] font-medium text-ink-800"><Icon className="h-5 w-5 text-brand-600" /> {t(label)}</button>
        ))}
      </>
    );
  }
  return (
    <div className="relative hidden lg:block">
      <Button size="sm" variant="secondary" className="!h-9" onClick={() => setOpen((o) => !o)}><Wrench className="h-4 w-4" /> {t("Araçlar")}</Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 top-11 z-40 w-72 rounded-2xl border border-ink-100 bg-white p-1.5 shadow-2xl">
              {tools.map(({ id, label, hint, Icon }) => (
                <button key={id} onClick={() => { setOpen(false); onPick(id); }} className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-ink-50">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span><span className="block text-[13.5px] font-medium text-ink-800">{t(label)}</span><span className="block text-[12px] text-ink-500">{t(hint)}</span></span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
