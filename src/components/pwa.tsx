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
  const [env, setEnv] = useState<{ standalone: boolean; ios: boolean; platform: "ios" | "android" | "mac-safari" | "desktop" }>({ standalone: false, ios: false, platform: "desktop" });
  useEffect(() => {
    const f = () => force((x) => x + 1);
    listeners.add(f);
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const macSafari = !ios && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua);
    setEnv({ standalone: window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true, ios, platform: ios ? "ios" : android ? "android" : macSafari ? "mac-safari" : "desktop" });
    return () => { listeners.delete(f); };
  }, []);
  return { canPrompt: !!deferred, ...env };
}

/** “Uygulamayı yükle”: Android/Chrome’da sistem penceresi, iPhone’da adım adım yönerge */
export function InstallApp({ variant = "row", className }: { variant?: "row" | "banner"; className?: string }) {
  const { t } = useT();
  const { standalone, platform } = useInstall();
  const [help, setHelp] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { try { setHidden(variant === "banner" && !!localStorage.getItem("akademi:install-dismissed")); } catch { /* yok */ } }, [variant]);
  // Düğme her zaman görünür (uygulama olarak açılmadıysa); tarayıcı kendi kurulum penceresini sunmuyorsa platforma göre yönerge gösterilir
  if (standalone || hidden) return null;

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
          <span className="min-w-0 flex-1"><b className="block text-ink-900">{t("Academiana’yı telefonunuza kurun")}</b>{t("Ana ekrandan tek dokunuşla, tam ekran açılır.")}</span>
          <button onClick={install} className="shrink-0 rounded-xl bg-brand-200 px-3 py-2 text-[13px] font-medium text-brand-950">{t("Kur")}</button>
          <button onClick={dismiss} className="shrink-0 rounded-lg p-1 text-ink-400" aria-label={t("Kapat")}><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <button onClick={install} className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-ink-600 transition hover:bg-white hover:text-ink-900", className)}>
          <Download className="h-[18px] w-[18px]" /> {t("Uygulamayı yükle")}
        </button>
      )}
      <Modal open={help} onClose={() => setHelp(false)} title={platform === "ios" ? t("iPhone / iPad’e kurulum") : platform === "android" ? t("Android’e kurulum") : t("Bilgisayara kurulum")}>
        <ol className="space-y-3 text-[15px] text-ink-700">
          {(platform === "ios"
            ? [t("Bu sayfayı Safari’de açın (Chrome’da “Paylaş” menüsü de kullanılabilir)."), <>{t("Alttaki veya üstteki Paylaş düğmesine dokunun:")} <Share className="inline h-4 w-4 align-[-2px] text-brand-600" /></>, <>{t("Listeyi aşağı kaydırıp “Ana Ekrana Ekle”yi seçin:")} <SquarePlus className="inline h-4 w-4 align-[-2px] text-brand-600" /></>, t("Sağ üstteki “Ekle”ye dokunun. Academiana simgesi ana ekranınıza gelir.")]
            : platform === "android"
              ? [t("Bu sayfayı Chrome’da açın."), t("Sağ üstteki üç nokta (⋮) menüsüne dokunun."), t("“Uygulamayı yükle” veya “Ana ekrana ekle”yi seçin."), t("“Yükle”ye dokunun. Academiana simgesi ana ekranınıza gelir.")]
              : platform === "mac-safari"
                ? [t("Safari’de üst menüden “Dosya”yı açın (veya Paylaş düğmesine tıklayın)."), t("“Dock’a Ekle”yi seçin."), t("“Ekle”ye tıklayın. Academiana, Dock’ta ayrı bir uygulama olarak açılır.")]
                : [t("Chrome veya Edge kullanın."), t("Adres çubuğunun sağındaki kurulum simgesine (ekran ve ok) tıklayın ya da sağ üstteki menüden “Academiana’yı yükle” / “Uygulamayı yükle”yi seçin."), t("“Yükle”ye tıklayın. Academiana masaüstünüzde ve başlat menüsünde ayrı bir uygulama olarak açılır.")]
          ).map((step, i) => (
            <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-xs font-semibold text-white">{i + 1}</span><span>{step}</span></li>
          ))}
        </ol>
      </Modal>
    </>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
