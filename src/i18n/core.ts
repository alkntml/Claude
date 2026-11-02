/**
 * Çok dillilik çekirdeği (sözlüksüz). İstemci bu dosyayı kullanır; İngilizce sözlük yalnızca
 * İngilizce sayfalarda sağlayıcıya prop olarak gelir, böylece ~180 KB her sayfaya yüklenmez.
 *
 * Çok dillilik: kaynak metinler Türkçe yazılır ve t("…") ile sarılır.
 * İngilizce karşılıklar en.ts sözlüğündedir; karşılığı olmayan metin Türkçe gösterilir.
 * Değişkenler {ad} biçiminde: t("{n} kaynak eklendi", { n: 3 })
 */

export type Locale = "tr" | "en";
export const LOCALES: Locale[] = ["tr", "en"];
export const LOCALE_COOKIE = "lang";

export type Vars = Record<string, string | number | null | undefined>;

function fill(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined || vars[k] === null ? "" : String(vars[k])));
}

export type Dict = Record<string, string>;

/** Sözlükle çeviri: sözlük yoksa (Türkçe) anahtar olduğu gibi döner */
export function translateWith(dict: Dict | null | undefined, key: string, vars?: Vars): string {
  return fill(dict?.[key] ?? key, vars);
}

export type TFn = (key: string, vars?: Vars) => string;
export const makeDictT = (dict: Dict | null | undefined): TFn => (key, vars) => translateWith(dict, key, vars);

/** Ziyaretçinin ülkesine göre varsayılan dil: Türkiye (veya bilinmeyen) → Türkçe, diğer ülkeler → İngilizce. */
export function localeForCountry(country: string | null | undefined): Locale {
  if (!country) return "tr";
  return country.toUpperCase() === "TR" ? "tr" : "en";
}

export function normalizeLocale(v: string | null | undefined): Locale | null {
  return v === "tr" || v === "en" ? v : null;
}

export const dateLocale = (l: Locale) => (l === "en" ? "en-US" : "tr-TR");
