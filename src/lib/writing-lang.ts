/**
 * Çalışmanın yazım dili (project.language; D144). Arayüz dilinden (Locale) bağımsızdır: Almanca arayüzle Türkçe tez
 * yazılabilir. Yalnızca TR/EN içeriği olan motorlar (ör. örnek veri) için contentLang kullanılır.
 */
export type WritingLang = "tr" | "en" | "de";
export const WRITING_LANGS: readonly WritingLang[] = ["tr", "en", "de"];

/** Bilinmeyen/eksik değer Türkçe sayılır (eski çalışmalar) */
export const writingLang = (v: unknown): WritingLang => (v === "en" || v === "de" ? v : "tr");

/** Yapay zekâ talimatlarında dil adı (modelin anlayacağı biçim) */
export const LANG_NAME: Record<WritingLang, string> = { tr: "Türkçe", en: "English", de: "Deutsch" };
/** Türkçe talimat metinleri içinde dil adı */
export const LANG_NAME_TR: Record<WritingLang, string> = { tr: "Türkçe", en: "İngilizce", de: "Almanca" };
/** Konuşma tanıma / tarih biçimi için BCP-47 etiketi */
export const LANG_TAG: Record<WritingLang, string> = { tr: "tr-TR", en: "en-US", de: "de-DE" };
