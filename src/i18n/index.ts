/**
 * Sunucu tarafı çeviri: çekirdek + İngilizce sözlük. İstemci bileşenleri bunun yerine
 * "@/i18n/core" ve useT() kullanmalı (sözlük istemci paketine girmesin).
 */
import { EN } from "./en";
import { DE } from "./de";
import { translateWith, type Locale, type TFn, type Vars } from "./core";

export * from "./core";

export function translate(locale: Locale, key: string, vars?: Vars): string {
  return translateWith(dictFor(locale), key, vars);
}

/** Dilin sözlüğü (Türkçe kaynak dil olduğundan sözlüğü yok) */
export function dictFor(locale: Locale) { return locale === "en" ? EN : locale === "de" ? DE : null; }

export const makeT = (locale: Locale): TFn => (key, vars) => translate(locale, key, vars);
