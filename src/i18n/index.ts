/**
 * Çok dillilik: kaynak metinler Türkçe yazılır ve t("…") ile sarılır.
 * İngilizce karşılıklar en.ts sözlüğündedir; karşılığı olmayan metin Türkçe gösterilir.
 * Değişkenler {ad} biçiminde: t("{n} kaynak eklendi", { n: 3 })
 */
import { EN } from "./en";

export type Locale = "tr" | "en";
export const LOCALES: Locale[] = ["tr", "en"];
export const LOCALE_COOKIE = "lang";

export type Vars = Record<string, string | number | null | undefined>;

function fill(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined || vars[k] === null ? "" : String(vars[k])));
}

export function translate(locale: Locale, key: string, vars?: Vars): string {
  if (locale === "en") return fill(EN[key] ?? key, vars);
  return fill(key, vars);
}

export type TFn = (key: string, vars?: Vars) => string;
export const makeT = (locale: Locale): TFn => (key, vars) => translate(locale, key, vars);

/** Ziyaretçinin ülkesine göre varsayılan dil: Türkiye (veya bilinmeyen) → Türkçe, diğer ülkeler → İngilizce. */
export function localeForCountry(country: string | null | undefined): Locale {
  if (!country) return "tr";
  return country.toUpperCase() === "TR" ? "tr" : "en";
}

export function normalizeLocale(v: string | null | undefined): Locale | null {
  return v === "tr" || v === "en" ? v : null;
}

export const dateLocale = (l: Locale) => (l === "en" ? "en-US" : "tr-TR");
