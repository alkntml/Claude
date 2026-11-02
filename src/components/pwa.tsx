"use client";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { cn } from "@/components/ui/cn";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Servis çalışanı kaydı (yalnızca üretimde) */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);
  return null;
}

let deferred: any = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e; listeners.forEach((f) => f()); });
  window.addEventListener("appinstalled", () => { deferred = null; listeners.forEach((f) => f()); });
}

function useInstall() {
  const [, force] = useState(0);
  const [env, setEnv] = useState({ standalone: false, ios: false });
  useEffect(() => {
    const f = () => force((x) => x + 1);
    listeners.add(f);
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setEnv({ standalone: window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true, ios });
    return () => { listeners.delete(f); };
  }, []);
  return { canPrompt: !!deferred, ...env };
}

/** “Uygulamayı yükle”: Android/Chrome’da sistem penceresi, iPhone’da adım adım yönerge */
export function InstallApp({ variant = "row", className }: { variant?: "row" | "banner"; className?: string }) {
  const { t } = useT();
  const { canPrompt, standalone, ios } = useInstall();
  const [help, setHelp] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { setHidden(variant === "banner" && !!localStorage.getItem("akademi:install-dismissed")); } catch { /* yok */ } }, [variant]);
  if (standalone || hidden || (!canPrompt && !ios)) return null;

  async function install() {
    if (deferred) { deferred.prompt(); await deferred.userChoice.catch(() => null); deferred = null; listeners.forEach((f) => f()); }
    else setHelp(true);
  }
  const dismiss = () => { setHidden(true); try { localStorage.setItem("akademi:install-dismissed", "1"); } catch { /* yok */ } };

  return (
    <>
      {variant === "banner" ? (
        <div className={cn("flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/80 p-3 text-[13.5px] text-ink-700 lg:hidden", className)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="h-10 w-10 shrink-0 rounded-xl" />
          <span className="min-w-0 flex-1"><b className="block text-ink-900">{t("Akademi AI’ı telefonunuza kurun")}</b>{t("Ana ekrandan tek dokunuşla, tam ekran açılır.")}</span>
          <button onClick={install} className="shrink-0 rounded-xl bg-brand-600 px-3 py-2 text-[13px] font-medium text-white">{t("Kur")}</button>
          <button onClick={dismiss} className="shrink-0 rounded-lg p-1 text-ink-400" aria-label={t("Kapat")}><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <button onClick={install} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink-600 transition hover:bg-white hover:text-ink-900", className)}>
          <Download className="h-[18px] w-[18px]" /> {t("Uygulamayı yükle")}
        </button>
      )}
      <Modal open={help} onClose={() => setHelp(false)} title={t("iPhone / iPad’e kurulum")}>
        <ol className="space-y-3 text-[15px] text-ink-700">
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">1</span><span>{t("Bu sayfayı Safari’de açın (Chrome’da “Paylaş” menüsü de kullanılabilir).")}</span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">2</span><span>{t("Alttaki veya üstteki Paylaş düğmesine dokunun:")} <Share className="inline h-4 w-4 align-[-2px] text-brand-600" /></span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">3</span><span>{t("Listeyi aşağı kaydırıp “Ana Ekrana Ekle”yi seçin:")} <SquarePlus className="inline h-4 w-4 align-[-2px] text-brand-600" /></span></li>
          <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">4</span><span>{t("Sağ üstteki “Ekle”ye dokunun. Akademi AI simgesi ana ekranınıza gelir.")}</span></li>
        </ol>
      </Modal>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
