import "server-only";
import crypto from "node:crypto";

/**
 * D225: PayTR iFrame API. Kart bilgisi Academiana’ya hiç gelmez; kullanıcı kartını PayTR’nin güvenli sayfasında
 * (sitemizde bir çerçeve içinde) girer. Akış:
 *   1) Sunucu sipariş oluşturur ve PayTR’den ödeme anahtarı (token) alır (`requestToken`).
 *   2) Ödeme sayfası `https://www.paytr.com/odeme/guvenli/<token>` adresini çerçevede gösterir.
 *   3) PayTR sonucu panelde tanımlı “Bildirim URL”ye (/api/payments/paytr/callback) imzalı olarak POST eder;
 *      imza doğrulanınca paket tanımlanır ve yanıt olarak düz metin “OK” döner (aksi hâlde PayTR tekrar dener).
 * İmza: HMAC-SHA256 (anahtar: merchant_key), çıktı base64. Alan sırası PayTR belgesindeki sırayla aynıdır.
 * Gizli anahtarlar yalnızca ortam değişkenlerinden okunur (PAYTR_MERCHANT_ID, PAYTR_MERCHANT_KEY, PAYTR_MERCHANT_SALT).
 */

export const PAYTR_TOKEN_URL = "https://www.paytr.com/odeme/api/get-token";
export const PAYTR_IFRAME_BASE = "https://www.paytr.com/odeme/guvenli/";
/** Tek çekim (taksit yok) */
export const PAYTR_NO_INSTALLMENT = "1";
export const PAYTR_MAX_INSTALLMENT = "0";
export const PAYTR_CURRENCY = "TL";
/** Ödeme sayfasının geçerlilik süresi (dakika) */
export const PAYTR_TIMEOUT_MIN = 30;

export interface PaytrCreds { merchantId: string; merchantKey: string; merchantSalt: string; testMode: boolean }

/** Ortam değişkenlerinden PayTR bilgileri; eksikse null (kartla ödeme kapalı, WhatsApp akışı sürer) */
export function paytrCreds(e: Record<string, string | undefined> = process.env): PaytrCreds | null {
  const merchantId = (e.PAYTR_MERCHANT_ID ?? "").trim(), merchantKey = (e.PAYTR_MERCHANT_KEY ?? "").trim(), merchantSalt = (e.PAYTR_MERCHANT_SALT ?? "").trim();
  if (!merchantId || !merchantKey || !merchantSalt) return null;
  // Güvenli varsayılan: açıkça "0" yazılmadıkça test modu
  return { merchantId, merchantKey, merchantSalt, testMode: (e.PAYTR_TEST_MODE ?? "1").trim() !== "0" };
}

/**
 * D227: test modunda kartla ödeme yalnızca yöneticilere ve `PAYTR_TEST_EMAILS` (virgülle ayrılmış e-postalar) listesindekilere
 * açıktır. Böylece PayTR’nin herkese açık test kartlarıyla kimse ücretsiz paket alamaz. Canlı modda herkese açıktır.
 */
export function canPayByCard(c: PaytrCreds | null, who: { role?: string | null; email?: string | null }, e: Record<string, string | undefined> = process.env): boolean {
  if (!c) return false;
  if (!c.testMode) return true;
  return isPaymentTester(who, e);
}
/** Ödeme deneyebilenler: yöneticiler ve `PAYTR_TEST_EMAILS` listesindekiler (D227/D228: test modu ve 1 TL deneme paketi) */
export function isPaymentTester(who: { role?: string | null; email?: string | null }, e: Record<string, string | undefined> = process.env): boolean {
  if (who.role === "admin") return true;
  const list = (e.PAYTR_TEST_EMAILS ?? "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  return !!who.email && list.includes(who.email.trim().toLowerCase());
}

export const hmacB64 = (payload: string, key: string) => crypto.createHmac("sha256", key).update(payload, "utf8").digest("base64");

/** TL → kuruş (PayTR ondalık kabul etmez: 499 TL → 49900) */
export const toKurus = (tl: number) => Math.round(tl * 100);

/** Sepet: [[ad, birim fiyat (2 ondalık), adet]] → JSON → base64 */
export function encodeBasket(items: { name: string; priceTl: number; qty: number }[]): string {
  return Buffer.from(JSON.stringify(items.map((i) => [i.name, i.priceTl.toFixed(2), i.qty])), "utf8").toString("base64");
}

export interface TokenFields {
  userIp: string; merchantOid: string; email: string; paymentAmount: number; userBasket: string;
  noInstallment: string; maxInstallment: string; currency: string; testMode: string;
}
/** 1. adım imzası: merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode + merchant_salt */
export function tokenHash(c: Pick<PaytrCreds, "merchantId" | "merchantKey" | "merchantSalt">, f: TokenFields): string {
  return hmacB64(`${c.merchantId}${f.userIp}${f.merchantOid}${f.email}${f.paymentAmount}${f.userBasket}${f.noInstallment}${f.maxInstallment}${f.currency}${f.testMode}${c.merchantSalt}`, c.merchantKey);
}

/** Bildirim imzası: merchant_oid + merchant_salt + status + total_amount */
export function callbackHash(c: Pick<PaytrCreds, "merchantKey" | "merchantSalt">, merchantOid: string, status: string, totalAmount: string): string {
  return hmacB64(`${merchantOid}${c.merchantSalt}${status}${totalAmount}`, c.merchantKey);
}

export interface PaytrCallback {
  merchantOid: string; status: string; totalAmount: string; hash: string;
  paymentAmount: string; paymentType: string; currency: string; testMode: string;
  failedReasonCode: string; failedReasonMsg: string;
}
export function parseCallback(body: URLSearchParams): PaytrCallback {
  const g = (k: string) => (body.get(k) ?? "").trim();
  return {
    merchantOid: g("merchant_oid"), status: g("status"), totalAmount: g("total_amount"), hash: g("hash"),
    paymentAmount: g("payment_amount"), paymentType: g("payment_type"), currency: g("currency"), testMode: g("test_mode"),
    failedReasonCode: g("failed_reason_code"), failedReasonMsg: g("failed_reason_msg"),
  };
}
/** Bildirimin PayTR’den geldiğini doğrular (sabit süreli karşılaştırma) */
export function verifyCallback(c: Pick<PaytrCreds, "merchantKey" | "merchantSalt">, cb: Pick<PaytrCallback, "merchantOid" | "status" | "totalAmount" | "hash">): boolean {
  if (!cb.merchantOid || !cb.status || !cb.totalAmount || !cb.hash) return false;
  const a = Buffer.from(callbackHash(c, cb.merchantOid, cb.status, cb.totalAmount)), b = Buffer.from(cb.hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Sipariş numarası: yalnızca harf ve rakam (PayTR kuralı), tekil */
export function newMerchantOid(now = Date.now()): string {
  return `AC${now.toString(36).toUpperCase()}${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

/** Kullanıcının IP adresi (Vercel: x-forwarded-for’un ilk değeri). PayTR gerçek istemci IP’si ister. */
export function clientIp(headers: Headers): string {
  const xf = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (xf || headers.get("x-real-ip")?.trim() || "").slice(0, 39);
}

export interface TokenRequest {
  merchantOid: string; email: string; amountTl: number; basket: { name: string; priceTl: number; qty: number }[];
  userIp: string; userName: string; userAddress: string; userPhone: string;
  okUrl: string; failUrl: string; lang: "tr" | "en";
}
export type TokenResult = { ok: true; token: string } | { ok: false; reason: string };

/** Ödeme anahtarı (token) ister. Ağ/sunucu hatasında { ok: false } döner (fırlatmaz). */
export async function requestToken(c: PaytrCreds, r: TokenRequest, fetchImpl: typeof fetch = fetch): Promise<TokenResult> {
  const paymentAmount = toKurus(r.amountTl);
  const userBasket = encodeBasket(r.basket);
  const testMode = c.testMode ? "1" : "0";
  const fields: TokenFields = { userIp: r.userIp, merchantOid: r.merchantOid, email: r.email, paymentAmount, userBasket, noInstallment: PAYTR_NO_INSTALLMENT, maxInstallment: PAYTR_MAX_INSTALLMENT, currency: PAYTR_CURRENCY, testMode };
  const body = new URLSearchParams({
    merchant_id: c.merchantId, user_ip: r.userIp, merchant_oid: r.merchantOid, email: r.email,
    payment_amount: String(paymentAmount), paytr_token: tokenHash(c, fields), user_basket: userBasket,
    debug_on: c.testMode ? "1" : "0", no_installment: PAYTR_NO_INSTALLMENT, max_installment: PAYTR_MAX_INSTALLMENT,
    user_name: r.userName.slice(0, 60), user_address: r.userAddress.slice(0, 400), user_phone: r.userPhone.slice(0, 20),
    merchant_ok_url: r.okUrl, merchant_fail_url: r.failUrl, timeout_limit: String(PAYTR_TIMEOUT_MIN),
    currency: PAYTR_CURRENCY, test_mode: testMode, lang: r.lang,
  });
  try {
    const res = await fetchImpl(PAYTR_TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(20_000) });
    const j = (await res.json().catch(() => null)) as { status?: string; token?: string; reason?: string } | null;
    if (!res.ok || !j) return { ok: false, reason: `PayTR yanıtı okunamadı (HTTP ${res.status})` };
    if (j.status !== "success" || !j.token) return { ok: false, reason: String(j.reason ?? "PayTR ödeme anahtarı vermedi").slice(0, 300) };
    return { ok: true, token: j.token };
  } catch (e) {
    return { ok: false, reason: `PayTR’ye bağlanılamadı: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300) };
  }
}

export const iframeUrl = (token: string) => `${PAYTR_IFRAME_BASE}${encodeURIComponent(token)}`;
