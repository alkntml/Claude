import type { Locale } from "@/i18n/core";
import type { LegalContent } from "./types";
import { CONTENT as TR } from "./content-tr";
import { CONTENT as EN } from "./content-en";
import { CONTENT as DE } from "./content-de";

/** Hukuki metinler: Türkçe ve GDPR İngilizcesi asıl metin, diğerleri çeviri (D154). Yalnızca sunucu bileşenlerinde kullanın (paket boyutu). */
export function legalContent(locale: Locale): LegalContent {
  return locale === "en" ? EN : locale === "de" ? DE : TR;
}
