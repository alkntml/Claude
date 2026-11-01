"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type Tone = "success" | "error" | "info" | "warning";
interface Toast { id: number; tone: Tone; title: string; detail?: string }
const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setList((l) => [...l.slice(-3), { ...t, id }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), t.tone === "error" ? 7000 : 4200);
  }, []);
  const icon = { success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, error: <XCircle className="h-5 w-5 text-rose-500" />, info: <Info className="h-5 w-5 text-brand-500" />, warning: <AlertTriangle className="h-5 w-5 text-amber-500" /> };
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {list.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }} className="pointer-events-auto flex gap-3 rounded-2xl border border-ink-100 bg-white/95 p-3.5 shadow-xl backdrop-blur">
              {icon[t.tone]}
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">{t.title}</p>
                {t.detail && <p className="mt-0.5 text-[13px] text-ink-500">{t.detail}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
