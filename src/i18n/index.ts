/**
 * Sunucu tarafı çeviri: çekirdek + İngilizce sözlük. İstemci bileşenleri bunun yerine
 * "@/i18n/core" ve useT() kullanmalı (sözlük istemci paketine girmesin).
 */
import { EN } from "./en";
import { translateWith, type Locale, type TFn, type Vars } from "./core";

export * from "./core";

export function translate(locale: Locale, key: string, vars?: Vars): string {
  return translateWith(locale === "en" ? EN : null, key, vars);
}

export const makeT = (locale: Locale): TFn => (key, vars) => translate(locale, key, vars);
