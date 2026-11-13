/**
 * Hukuki belgeler (D154): adresler, başlıklar, sürümler ve kabul kuralları. İstemci ve sunucuda kullanılabilir (metin içermez).
 *
 * Sürüm yönetimi: bir belgenin metni değişince `version` artırılır (ör. "2026-11-13" → yeni tarih).
 * `requiresAcceptance: true` olan belgede kullanıcının kabul ettiği sürüm güncel sürümden farklıysa
 * uygulama sayfaları açılmadan önce yeniden kabul istenir (/sozlesme-onayi). Diğer belgeler yalnızca bilgilendirmedir;
 * bilgilendirmenin gösterildiği kayıt altına alınır (kind = "notice"), açık rıza sayılmaz.
 */
import type { LegalDocId } from "./types";

export type { LegalDocId } from "./types";
type L3 = { tr: string; en: string; de: string };

export interface LegalDocMeta {
  id: LegalDocId;
  /** Türkçe (öneksiz) adres; İngilizce /en, Almanca /de önekiyle */
  path: string;
  title: L3;
  /** Altbilgi ve gezinmede kısa ad (Türkçe; t() ile çevrilir) */
  label: string;
  /** Güncel sürüm (metin değişince değiştirin) */
  version: string;
  /** Asıl metnin dili; diğer diller çeviridir */
  original: "tr" | "en";
  /** Uygulamayı kullanmak için kabul zorunlu mu (sözleşme) */
  requiresAcceptance: boolean;
}

export const LEGAL_DOCS: LegalDocMeta[] = [
  { id: "kvkk", path: "/kvkk", label: "KVKK Aydınlatma Metni", version: "2026-11-14", original: "tr", requiresAcceptance: false,
    title: { tr: "KVKK Aydınlatma Metni", en: "KVKK Privacy Notice", de: "Datenschutzinformation nach KVKK" } },
  { id: "terms", path: "/kosullar", label: "Kullanım Koşulları", version: "2026-11-15", original: "tr", requiresAcceptance: true,
    title: { tr: "Kullanım Koşulları", en: "Terms of Use", de: "Nutzungsbedingungen" } },
  { id: "fair_use", path: "/adil-kullanim", label: "Adil Kullanım Politikası", version: "2026-11-14", original: "tr", requiresAcceptance: false,
    title: { tr: "Adil Kullanım Politikası", en: "Fair Use Policy", de: "Richtlinie zur fairen Nutzung" } },
  { id: "cookies", path: "/cerez-politikasi", label: "Çerez Politikası", version: "2026-11-14", original: "tr", requiresAcceptance: false,
    title: { tr: "Çerez ve Cihaz Tanımlayıcıları Politikası", en: "Cookie and Device Identifier Policy", de: "Richtlinie zu Cookies und Gerätekennungen" } },
  { id: "integrity", path: "/akademik-durustluk", label: "Akademik Dürüstlük", version: "2026-11-14", original: "tr", requiresAcceptance: false,
    title: { tr: "Akademik Dürüstlük ve Sorumlu Yapay Zekâ Kullanımı", en: "Academic Integrity and Responsible AI Use", de: "Wissenschaftliche Integrität und verantwortungsvolle KI-Nutzung" } },
  { id: "distance", path: "/mesafeli-sozlesmeler", label: "Mesafeli Sözleşmeler ve Ön Bilgilendirme", version: "2026-11-14", original: "tr", requiresAcceptance: false,
    title: { tr: "Mesafeli Sözleşmeler ve Ön Bilgilendirme", en: "Distance Contracts and Pre-Contractual Information", de: "Fernabsatzverträge und vorvertragliche Informationen" } },
  { id: "gdpr", path: "/gdpr", label: "GDPR / Data Protection", version: "2026-11-14", original: "en", requiresAcceptance: false,
    title: { tr: "GDPR / Veri Koruma Bildirimi", en: "GDPR / Data Protection Notice", de: "DSGVO / Datenschutzhinweis" } },
];

export const LEGAL_DOC_IDS = LEGAL_DOCS.map((d) => d.id);

export function legalDoc(id: LegalDocId): LegalDocMeta {
  return LEGAL_DOCS.find((d) => d.id === id)!;
}

/** Kabulün nereden geldiği (legal_acceptances.source) */
export const ACCEPTANCE_SOURCES = ["email", "google", "apple", "consent_page", "purchase"] as const;
export type AcceptanceSource = (typeof ACCEPTANCE_SOURCES)[number];

export interface AcceptanceRow { doc: string; version: string; kind: "accept" | "notice"; accepted_at: string }

/**
 * Yeniden kabul gereken belgeler: kabul zorunlu ve kullanıcının bu belge için güncel sürümde bir “accept” kaydı yok.
 * (Eski sürümü kabul etmiş olmak yetmez; yeni sürüm yayımlanınca yeniden sorulur.)
 */
export function pendingAcceptances(rows: AcceptanceRow[]): LegalDocMeta[] {
  return LEGAL_DOCS.filter((d) => d.requiresAcceptance && !rows.some((r) => r.doc === d.id && r.kind === "accept" && r.version === d.version));
}

/** Kayıtta (e-posta) kullanıcı meta verisine yazılan kabul özeti: { terms: "2026-11-13", kvkk: "2026-11-13" } */
export function signupAcceptanceMeta(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of LEGAL_DOCS) if (d.requiresAcceptance || d.id === "kvkk") out[d.id] = d.version;
  return out;
}

/** OAuth/e-posta sağlayıcısından kabul kaynağı */
export function sourceFromProvider(provider: string | null | undefined): AcceptanceSource {
  return provider === "google" ? "google" : provider === "apple" ? "apple" : provider === "email" ? "email" : "consent_page";
}
