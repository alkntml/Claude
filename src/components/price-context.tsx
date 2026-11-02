"use client";
import { createContext, useCallback, useContext } from "react";
import { useT } from "@/i18n/client";
import { DEFAULT_USD_TRY, formatPrice } from "@/lib/pricing";

const RateContext = createContext<number>(DEFAULT_USD_TRY);

/** Kök düzende dolar kurunu istemciye verir (D59) */
export function PriceProvider({ usdTry, children }: { usdTry: number; children: React.ReactNode }) {
  return <RateContext.Provider value={usdTry}>{children}</RateContext.Provider>;
}

/** Dile göre fiyat biçimlendirici: Türkçe ₺, İngilizce $ */
export function usePrice() {
  const { locale } = useT();
  const rate = useContext(RateContext);
  return useCallback((tl: number) => formatPrice(tl, locale, rate), [locale, rate]);
}
