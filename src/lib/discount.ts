/**
 * İndirim kodları (D145). Yönetici kod oluşturur (yüzde veya TL tutarı; isteğe bağlı paket, son tarih, kullanım sınırı).
 * Kayıt olurken kodu giren kullanıcının hesabına kod kalıcı olarak bağlanır (profiles.discount_code, veritabanı
 * fonksiyonu claim_discount_code). Ödeme WhatsApp üzerinden olduğundan indirimli fiyat yükseltme penceresinde,
 * Hesap sayfasında ve hazır WhatsApp mesajında gösterilir; yönetici paketi atarken kullanıcının kodunu görür.
 * Kodun “etkin / son tarih / kullanım sınırı” kuralları yalnızca yeni kayıtlar içindir; bağlanmış kullanıcının
 * hakkı sürer (kod silinirse kalkar). Saf modül: istemci ve sunucu birlikte kullanır.
 */
export type DiscountKind = "percent" | "amount_try";

export interface DiscountCode {
  code: string;
  kind: DiscountKind;
  value: number;
  /** Boşsa tüm ücretli paketler */
  plans: string[];
  active?: boolean;
  max_uses?: number | null;
  uses?: number;
  expires_at?: string | null;
  note?: string;
}

export const CODE_RE = /^[A-Z0-9_-]{3,32}$/;

/** Kullanıcının yazdığı kodu biçime getirir (büyük harf, boşluksuz) */
export function normalizeCode(s: string | null | undefined): string {
  return String(s ?? "").trim().toLocaleUpperCase("tr-TR").replace(/İ/g, "I").replace(/[^A-Z0-9_-]/g, "").slice(0, 32);
}

/** Kod bu pakete uygulanır mı? (ücretsiz pakete uygulanmaz) */
export function appliesTo(d: Pick<DiscountCode, "plans"> | null | undefined, planId: string, price: number): boolean {
  if (!d || !(price > 0)) return false;
  return !d.plans?.length || d.plans.includes(planId);
}

/** İndirimli fiyat (TL, tam sayıya yuvarlanır); uygulanmıyorsa null */
export function discountedPrice(price: number, d: Pick<DiscountCode, "kind" | "value" | "plans"> | null | undefined, planId: string): number | null {
  if (!d || !appliesTo(d, planId, price)) return null;
  const off = d.kind === "percent" ? price * (Math.min(100, Math.max(0, d.value)) / 100) : Math.max(0, d.value);
  return Math.max(0, Math.round(price - off));
}

/** İndirim tutarı (TL) */
export function discountAmount(price: number, d: Pick<DiscountCode, "kind" | "value" | "plans"> | null | undefined, planId: string): number {
  const p = discountedPrice(price, d, planId);
  return p == null ? 0 : Math.round(price) - p;
}

/** Yeni kayıtta kullanılabilir mi? (etkin, süresi dolmamış, kullanım sınırı aşılmamış) */
export function isClaimable(d: DiscountCode, now = new Date()): boolean {
  if (d.active === false) return false;
  if (d.expires_at && new Date(d.expires_at).getTime() <= now.getTime()) return false;
  if (d.max_uses != null && (d.uses ?? 0) >= d.max_uses) return false;
  return true;
}

/** Kısa etiket: “%20” veya “250 TL” */
export function discountLabel(d: Pick<DiscountCode, "kind" | "value">): string {
  return d.kind === "percent" ? `%${Number(d.value)}` : `${Number(d.value).toLocaleString("tr-TR")} TL`;
}
