/** Fiyatlandırma ve paket yardımcıları (istemci ve sunucu ortak, saf fonksiyonlar). */

// D158: “Sınırsız Kullanım” (iç kimlik: single) en üst pakettir
export const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, premium: 3, single: 4 };
/**
 * Tek ödemeli paketler (fiyat aylık değil tek seferlik). D158: eski “Tek Proje” artık “Sınırsız Kullanım” adıyla
 * aylık/yıllık ödenen bir pakettir (iç kimliği “single” kaldı); tek ödemeli paket kalmadı.
 */
export const ONE_TIME_PLANS = new Set<string>();
/** D157/D158: Sınırsız Kullanım (single) aylık dönemi (gün) */
export const SINGLE_PLAN_DAYS = 30;
/** D158: Sınırsız Kullanım’da tek sınır: en fazla 5 proje (aylık) */
export const UNLIMITED_PLAN_PROJECTS = 5;
/** D159: Sınırsız Kullanım yıllık ödemede en fazla 60 proje */
export const UNLIMITED_PLAN_PROJECTS_YEARLY = 60;
/** Dönemine göre proje sınırı: yalnızca Sınırsız Kullanım (single) yıllıkta 60; diğer paketlerde proje sınırı dönemle değişmez */
export function projectLimitFor(planId: string, projects: number | null | undefined, yearly: boolean): number | null | undefined {
  return planId === "single" && yearly && projects != null ? UNLIMITED_PLAN_PROJECTS_YEARLY : projects;
}

/* ---------------------------------------------------------------------
 * D157: Aylık / yıllık ödeme. Yıllık ödeme güncel aylık fiyatın %20 indirimlisidir; kullanım hakları düşmez:
 * aylık hakların 12 katı paket başında tek seferde tanımlanır ve 1 yıl içinde dilediğiniz gibi kullanılır (aylık kısıt yok).
 * Ücretsiz paketin yıllık seçeneği yoktur (D158: Sınırsız Kullanım’ın vardır). Yıllık fiyat indirim kodu / ekip indirimiyle birleştirilmez.
 * ------------------------------------------------------------------- */
export type BillingPeriod = "monthly" | "yearly";
export const YEARLY_DISCOUNT_PERCENT = 20;
export const YEARLY_DAYS = 365;

export function hasYearlyOption(planId: string, priceMonthly: number): boolean {
  return priceMonthly > 0 && !isOneTimePlan(planId);
}
/** Yıllık ödemede aylık karşılık (tam TL’ye yuvarlanır) */
export function yearlyMonthlyPrice(priceMonthly: number): number {
  return Math.round(priceMonthly * (1 - YEARLY_DISCOUNT_PERCENT / 100));
}
/** Yıllık toplam = aylık karşılık × 12 (müşterinin gördüğü iki sayı birbiriyle tutarlı) */
export function yearlyTotalPrice(priceMonthly: number): number {
  return yearlyMonthlyPrice(priceMonthly) * 12;
}
/** Yıllık görünümde paket kartı satırı: aylık miktarlı satırlar 12 katına çevrilir (çeviri anahtarı + değişken) */
export function yearlyFeature(f: string): { key: string; vars?: Record<string, string | number> } {
  let m = f.match(/^Ayda (\d+) sayfa yapay zekâ destekli akademik metin/);
  if (m) return { key: "Yılda {n} sayfa yapay zekâ destekli akademik metin (12 aylık hak baştan tanımlanır, 1 yıl geçerli)", vars: { n: Number(m[1]) * 12 } };
  m = f.match(/^Aylık (\d+) kaynak taraması$/);
  if (m) return { key: "Yılda {n} kaynak taraması", vars: { n: Number(m[1]) * 12 } };
  // D159: Sınırsız Kullanım yıllıkta en fazla 60 proje
  if (f === "En fazla 5 proje") return { key: "En fazla {n} proje", vars: { n: UNLIMITED_PLAN_PROJECTS_YEARLY } };
  return { key: f };
}
export const isOneTimePlan = (id: string | null | undefined) => !!id && ONE_TIME_PLANS.has(id);

/** Kurum paketi kişisel paketten yüksekse kurum paketi geçerlidir */
export function higherPlan(personal: string, org: string | null | undefined): string {
  if (!org) return personal;
  return (PLAN_RANK[org] ?? 0) > (PLAN_RANK[personal] ?? 0) ? org : personal;
}

/** Üniversite e-postası mı? (ör. ali@ogr.hacettepe.edu.tr → "edu.tr" alan adı listesiyle eşleşir) */
export function isStudentEmail(email: string | null | undefined, domains: string[]): boolean {
  const host = String(email ?? "").toLowerCase().split("@")[1];
  if (!host) return false;
  return domains.some((d) => { const dd = d.toLowerCase().replace(/^[.@]/, ""); return host === dd || host.endsWith(`.${dd}`); });
}

export function discounted(price: number, percent: number): number {
  const p = Math.max(0, Math.min(90, percent));
  return Math.round(price * (1 - p / 100) * 100) / 100;
}

/** E-posta kurum alan adına uygun mu? (domain boşsa herkes) */
export function emailMatchesDomain(email: string | null | undefined, domain: string | null | undefined): boolean {
  if (!domain) return true;
  return isStudentEmail(email, [domain]);
}

/* ---------------------------------------------------------------------
 * Satış iletişimi: ödeme altyapısı şimdilik kapalı (D48). Paket yükseltme ve
 * ekip indirimi talepleri WhatsApp üzerinden alınır; yönetici paketi panelden tanımlar.
 * ------------------------------------------------------------------- */

/** WhatsApp numarası (uluslararası biçim, başında + ve 0 olmadan): 0542 526 66 50 */
export const WHATSAPP_NUMBER = "905425266650";

/** Akademik Ekip İndirimi: akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler */
/** En az 3 kişi; üst sınır yok (kurum lisansında kişi sayısı sınırsız, D70) */
/** D160: Akademik Ekip İndirimi %20 (önceden %30) */
export const TEAM_DISCOUNT = { percent: 20, minMembers: 3 } as const;

export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}


/* ---------------------------------------------------------------------
 * Para birimi (D59): İngilizce sayfalarda fiyatlar dolar. Dolar fiyatı TL fiyattan,
 * yönetim panelindeki kurla (billing.margin.usd_try) hesaplanır ve yukarı yuvarlanır (ör. 10,40 → 10,99).
 * ------------------------------------------------------------------- */
export const DEFAULT_USD_TRY = 48;

export function usdFromTry(tl: number, usdTry: number = DEFAULT_USD_TRY): number {
  if (!tl) return 0;
  return Math.ceil(tl / Math.max(1, usdTry)) - 0.01;
}

/** Fiyat metni: tr → “₺499”, en → “$10.99”, de → “10,99 $” (ödeme TL ile; yabancı dilde dolar karşılığı gösterilir) */
export function formatPrice(tl: number, locale: "tr" | "en" | "de", usdTry: number = DEFAULT_USD_TRY): string {
  const n = Number(tl) || 0;
  if (locale === "en") return n === 0 ? "$0" : `$${usdFromTry(n, usdTry).toFixed(2)}`;
  if (locale === "de") return n === 0 ? "0 $" : `${usdFromTry(n, usdTry).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
  return `₺${n.toLocaleString("tr-TR")}`;
}

export function priceNumber(tl: number, locale: "tr" | "en" | "de", usdTry: number = DEFAULT_USD_TRY): { amount: number; currency: "TRY" | "USD" } {
  return locale !== "tr" ? { amount: usdFromTry(Number(tl) || 0, usdTry), currency: "USD" } : { amount: Number(tl) || 0, currency: "TRY" };
}
