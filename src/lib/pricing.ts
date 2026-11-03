/** Fiyatlandırma ve paket yardımcıları (istemci ve sunucu ortak, saf fonksiyonlar). */

export const PLAN_RANK: Record<string, number> = { free: 0, basic: 1, pro: 2, premium: 3 };

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
export const TEAM_DISCOUNT = { percent: 30, minMembers: 3 } as const;

export function whatsappLink(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Kilitli çalışmayı (aboneliksiz) bir kez indirme ücreti, TL (D50) */
export const DOWNLOAD_PRICE_TL = 100;

/* ---------------------------------------------------------------------
 * Para birimi (D59): İngilizce sayfalarda fiyatlar dolar. Dolar fiyatı TL fiyattan,
 * yönetim panelindeki kurla (billing.margin.usd_try) hesaplanır ve yukarı yuvarlanır (ör. 10,40 → 10,99).
 * ------------------------------------------------------------------- */
export const DEFAULT_USD_TRY = 48;

export function usdFromTry(tl: number, usdTry: number = DEFAULT_USD_TRY): number {
  if (!tl) return 0;
  return Math.ceil(tl / Math.max(1, usdTry)) - 0.01;
}

/** Fiyat metni: tr → “₺499”, en → “$10.99” */
export function formatPrice(tl: number, locale: "tr" | "en", usdTry: number = DEFAULT_USD_TRY): string {
  const n = Number(tl) || 0;
  if (locale === "en") return n === 0 ? "$0" : `$${usdFromTry(n, usdTry).toFixed(2)}`;
  return `₺${n.toLocaleString("tr-TR")}`;
}

export function priceNumber(tl: number, locale: "tr" | "en", usdTry: number = DEFAULT_USD_TRY): { amount: number; currency: "TRY" | "USD" } {
  return locale === "en" ? { amount: usdFromTry(Number(tl) || 0, usdTry), currency: "USD" } : { amount: Number(tl) || 0, currency: "TRY" };
}
