/**
 * Çok dillilik çekirdeği (sözlüksüz). İstemci bu dosyayı kullanır; İngilizce sözlük yalnızca
 * İngilizce sayfalarda sağlayıcıya prop olarak gelir, böylece ~180 KB her sayfaya yüklenmez.
 *
 * Çok dillilik: kaynak metinler Türkçe yazılır ve t("…") ile sarılır.
 * İngilizce karşılıklar en.ts sözlüğündedir; karşılığı olmayan metin Türkçe gösterilir.
 * Değişkenler {ad} biçiminde: t("{n} kaynak eklendi", { n: 3 })
 */

export type Locale = "tr" | "en" | "de";
export const LOCALES: Locale[] = ["tr", "en", "de"];
/** Herkese açık sayfalarda adres öneki olan diller (Türkçe öneksiz) */
export const PREFIXED_LOCALES: Exclude<Locale, "tr">[] = ["en", "de"];
/** Dilin kendi adıyla görünen adı (dil seçici) */
export const LOCALE_NAME: Record<Locale, string> = { tr: "Türkçe", en: "English", de: "Deutsch" };
/** Yapay zekâya “şu dilde yanıt ver” derken kullanılan ad */
export const AI_LANGUAGE: Record<Locale, string> = { tr: "Türkçe", en: "English", de: "Deutsch (German)" };
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

/** Almanca konuşulan ülkeler (Almanya, Avusturya, İsviçre, Lihtenştayn) */
export const GERMAN_COUNTRIES = ["DE", "AT", "CH", "LI"];

/** Ziyaretçinin ülkesine göre varsayılan dil: Türkiye (veya bilinmeyen) → Türkçe, Almanca konuşulan ülkeler → Almanca, diğerleri → İngilizce. */
export function localeForCountry(country: string | null | undefined): Locale {
  if (!country) return "tr";
  const c = country.toUpperCase();
  if (c === "TR") return "tr";
  return GERMAN_COUNTRIES.includes(c) ? "de" : "en";
}

export function normalizeLocale(v: string | null | undefined): Locale | null {
  return v === "tr" || v === "en" || v === "de" ? v : null;
}

export const dateLocale = (l: Locale) => (l === "en" ? "en-US" : l === "de" ? "de-DE" : "tr-TR");

/**
 * Yalnızca Türkçe/İngilizce üretilebilen içerik (APA istatistik metni, grafik etiketleri, PRISMA şeması, anket):
 * Almanca arayüzde İngilizce üretilir (uluslararası akademik standart).
 */
export const contentLang = (l: Locale): "tr" | "en" => (l === "tr" ? "tr" : "en");

/** Üç dilli içerikten seçim; Almanca yoksa İngilizceye düşer */
export function pick<T>(x: { tr: T; en: T; de?: T }, l: Locale): T {
  return l === "tr" ? x.tr : l === "de" ? (x.de ?? x.en) : x.en;
}
