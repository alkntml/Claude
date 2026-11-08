"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { LOCALE_COOKIE, LOCALES, LOCALE_NAME, dateLocale, makeDictT, type Dict, type Locale, type TFn } from "./core";

interface Ctx { locale: Locale; t: TFn; setLocale: (l: Locale) => void; dl: string }
const I18nContext = createContext<Ctx>({ locale: "tr", t: makeDictT(null), setLocale: () => {}, dl: "tr-TR" });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict?: Dict | null; children: React.ReactNode }) {
  const setLocale = useCallback((l: Locale) => {
    try {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch { /* çerez engelli olabilir */ }
    // Sayfanın bu dildeki adresi varsa (hreflang) oraya git; yoksa (uygulama sayfaları) yenile
    const alt = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${l}"]`);
    if (alt?.href) { const u = new URL(alt.href); window.location.href = `${u.pathname}${window.location.search}${window.location.hash}`; return; }
    window.location.reload();
  }, []);
  const value = useMemo(() => ({ locale, t: makeDictT(locale === "tr" ? null : dict), setLocale, dl: dateLocale(locale) }), [locale, dict, setLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useT = () => useContext(I18nContext);

/** Dil seçici: TR | EN | DE */
export function LanguageSwitch({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const { locale, setLocale } = useT();
  return (
    <div className={`inline-flex rounded-lg p-0.5 text-[12px] font-semibold ${dark ? "bg-white/10" : "bg-ink-100"} ${className}`} role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button key={l} type="button" onClick={() => l !== locale && setLocale(l)} aria-pressed={l === locale} title={LOCALE_NAME[l]} lang={l}
          className={`rounded-md px-2 py-0.5 uppercase transition ${l === locale ? (dark ? "bg-white text-ink-900" : "bg-white text-ink-900 shadow-sm") : dark ? "text-white/60 hover:text-white" : "text-ink-500 hover:text-ink-800"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}
