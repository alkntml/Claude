/**
 * D225: kartla ödemede sipariş tutarı ve süresi. Saf modül (istemci ve sunucu ortak). Tutar her zaman sunucuda,
 * veritabanındaki liste fiyatından hesaplanır; istemciden gelen fiyat kullanılmaz.
 * Kurallar yükseltme penceresiyle aynı: aylıkta kullanıcıya bağlı indirim kodu uygulanır; yıllık fiyat (%20 indirim)
 * indirim koduyla birleştirilmez. Aylık 30 gün, yıllık 365 gün (12 aylık hak baştan).
 */
import { discountedPrice, type DiscountCode } from "@/lib/discount";
import { hasYearlyOption, NO_DISCOUNT_PLANS, PLAN_RANK, SINGLE_PLAN_DAYS, YEARLY_DAYS, yearlyTotalPrice, type BillingPeriod } from "@/lib/pricing";

export const MONTHLY_DAYS = 30;

export interface OrderQuote { amount: number; list: number; days: number; discountCode: string | null }

export function orderQuote(plan: { id: string; price_monthly: number }, period: BillingPeriod, discount?: Pick<DiscountCode, "code" | "kind" | "value" | "plans"> | null): OrderQuote | null {
  const list = Number(plan.price_monthly) || 0;
  if (!(list > 0) || plan.id === "free") return null;
  if (period === "yearly") {
    if (!hasYearlyOption(plan.id, list)) return null;
    return { amount: yearlyTotalPrice(list), list: list * 12, days: YEARLY_DAYS, discountCode: null };
  }
  const d = NO_DISCOUNT_PLANS.has(plan.id) ? null : discountedPrice(list, discount, plan.id);
  const amount = d ?? list;
  if (!(amount > 0)) return null;
  return { amount, list, days: plan.id === "single" ? SINGLE_PLAN_DAYS : MONTHLY_DAYS, discountCode: d != null && discount ? discount.code : null };
}

/** Ödeme sonrası paketin bitiş tarihi: aynı paket ve dönem hâlâ sürüyorsa kalan sürenin üstüne eklenir, değilse bugünden başlar */
export function paidExpiry(profile: { plan_id: string | null; plan_expires_at: string | null; plan_period?: string | null }, order: { plan_id: string; period: BillingPeriod; days: number }, now = Date.now()): string {
  const samePlan = profile.plan_id === order.plan_id && (profile.plan_period === "yearly" ? "yearly" : "monthly") === order.period;
  const cur = profile.plan_expires_at ? Date.parse(profile.plan_expires_at) : NaN;
  const base = samePlan && Number.isFinite(cur) && cur > now ? cur : now;
  return new Date(base + order.days * 86400_000).toISOString();
}

/** Telefon: rakam ve + dışındakiler atılır; Türkiye’de 10–13 hane */
export function normalizePhone(s: string): string {
  return String(s ?? "").replace(/[^\d+]/g, "").slice(0, 20);
}
export const isValidPhone = (s: string) => /^\+?\d{10,15}$/.test(normalizePhone(s));

/**
 * D231: satın alma kuralı (sunucuda zorunlu). Süresi dolmamış bir paketi olan kullanıcı daha düşük bir pakete veya
 * yıllık paketinin yerine aynı paketin aylığına geçemez (kalan süresi ve hakları kaybolurdu). Aynı paketin aynı dönemi (uzatma)
 * ve daha yüksek paket serbesttir. Dolu mesaj dönerse satın alma reddedilir; boşsa serbest.
 */
export function purchaseBlockReason(
  profile: { plan_id: string | null; plan_expires_at: string | null; plan_period?: string | null },
  order: { plan_id: string; period: BillingPeriod },
  now = Date.now(),
): string | null {
  const cur = profile.plan_id ?? "free";
  const exp = profile.plan_expires_at ? Date.parse(profile.plan_expires_at) : NaN;
  const active = cur !== "free" && Number.isFinite(exp) && exp > now;
  if (!active) return null;
  if ((PLAN_RANK[order.plan_id] ?? 0) < (PLAN_RANK[cur] ?? 0)) return "Süresi devam eden paketinizden daha düşük bir paket satın alınamaz. Paketiniz bitince yeni paket alabilirsiniz.";
  if (order.plan_id === cur && order.period === "monthly" && profile.plan_period === "yearly") return "Yıllık paketiniz sürerken aynı paketin aylığı alınamaz. Yıllık paketinizi uzatabilir veya daha üst bir pakete geçebilirsiniz.";
  return null;
}
