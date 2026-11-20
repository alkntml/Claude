import "server-only";
import crypto from "node:crypto";
import { hmacB64, type PaytrCreds } from "@/lib/payments/paytr";

/**
 * D234: PayTR kart saklama ve kayıtlı kartla tekrarlayan ödeme (otomatik yenileme).
 *
 * Kart bilgisi Academiana’ya hiç gelmez: kullanıcı kartını PayTR’nin ödeme sayfasında girer ve orada saklanmasını onaylar;
 * Academiana yalnızca PayTR’nin verdiği kullanıcı anahtarı (utoken) ile kart anahtarını (ctoken) tutar.
 *   - listCards  : utoken’a bağlı kayıtlı kartlar (ödeme sonrası ctoken alınır)
 *   - chargeStoredCard : kayıtlı kartla, 3D’siz ve tekrarlayan ödeme olarak tahsilat (Direkt API)
 *   - deleteCard : kayıtlı kartı PayTR’den siler
 * Sonuç, tahsilatın kendisinde olduğu gibi PayTR’nin “Bildirim URL”ine de imzalı olarak gelir; paketi yalnızca o bildirim
 * tanımlar (lib/payments/apply.ts). Bu modüldeki uç noktalar ve imza alanları PayTR’nin “Kart Saklama” ve “Direkt API”
 * belgelerine göre yazılmıştır; mağaza hesabında bu hizmetlerin PayTR tarafından açılmış olması gerekir ve ilk canlı
 * yenilemeden önce PayTR ile teyit edilmelidir. Hata hâlinde hiçbir tahsilat/paket işlemi yapılmaz (güvenli başarısızlık).
 */
export const PAYTR_CARD_LIST_URL = "https://www.paytr.com/odeme/capi/list";
export const PAYTR_CARD_DELETE_URL = "https://www.paytr.com/odeme/capi/delete";
export const PAYTR_DIRECT_URL = "https://www.paytr.com/odeme";

/** Otomatik yenileme yalnızca PAYTR_RECURRING=1 iken sunulur (PayTR kart saklama hizmeti açıldıktan ve teyit edildikten sonra) */
export const recurringEnabled = (e: Record<string, string | undefined> = process.env) => (e.PAYTR_RECURRING ?? "").trim() === "1";

/** Kullanıcıya özel, kalıcı anahtar (harf-rakam; PayTR utoken kuralı) */
export const newUtoken = () => crypto.randomBytes(16).toString("hex");

export interface StoredCard { ctoken: string; last4: string; brand: string; bank: string; label: string }

const post = async (url: string, body: URLSearchParams, fetchImpl: typeof fetch) => {
  const res = await fetchImpl(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(20_000) });
  const text = await res.text();
  let json: unknown = null;
  try { json = JSON.parse(text); } catch { /* JSON değil */ }
  return { ok: res.ok, status: res.status, text, json };
};

/** İmza: utoken + merchant_salt */
export const listHash = (c: Pick<PaytrCreds, "merchantKey" | "merchantSalt">, utoken: string) => hmacB64(`${utoken}${c.merchantSalt}`, c.merchantKey);
/** İmza: ctoken + utoken + merchant_salt */
export const deleteHash = (c: Pick<PaytrCreds, "merchantKey" | "merchantSalt">, utoken: string, ctoken: string) => hmacB64(`${ctoken}${utoken}${c.merchantSalt}`, c.merchantKey);
/** Direkt API imzası: merchant_id + user_ip + merchant_oid + email + payment_amount + payment_type + installment_count + currency + test_mode + non_3d + merchant_salt */
export function directHash(c: PaytrCreds, f: { userIp: string; merchantOid: string; email: string; paymentAmount: string; testMode: string }): string {
  return hmacB64(`${c.merchantId}${f.userIp}${f.merchantOid}${f.email}${f.paymentAmount}card0TL${f.testMode}1${c.merchantSalt}`, c.merchantKey);
}

export async function listCards(c: PaytrCreds, utoken: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: true; cards: StoredCard[] } | { ok: false; reason: string }> {
  try {
    const r = await post(PAYTR_CARD_LIST_URL, new URLSearchParams({ merchant_id: c.merchantId, utoken, paytr_token: listHash(c, utoken) }), fetchImpl);
    if (!r.ok || r.json == null) return { ok: false, reason: `PayTR kart listesi okunamadı (HTTP ${r.status})` };
    if (!Array.isArray(r.json)) return { ok: false, reason: String((r.json as { reason?: string }).reason ?? "PayTR kart listesi vermedi").slice(0, 300) };
    const cards = (r.json as Record<string, unknown>[]).filter((x) => typeof x.ctoken === "string" && x.ctoken).map((x) => {
      const last4 = String(x.last_4 ?? "").slice(-4), brand = String(x.schema ?? x.c_brand ?? "").slice(0, 20), bank = String(x.c_bank ?? "").slice(0, 30);
      return { ctoken: String(x.ctoken), last4, brand, bank, label: `${brand || "Kart"} •••• ${last4 || "????"}`.slice(0, 60) };
    });
    return { ok: true, cards };
  } catch (e) {
    return { ok: false, reason: `PayTR’ye bağlanılamadı: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300) };
  }
}

export async function deleteCard(c: PaytrCreds, utoken: string, ctoken: string, fetchImpl: typeof fetch = fetch): Promise<{ ok: boolean; reason?: string }> {
  try {
    const r = await post(PAYTR_CARD_DELETE_URL, new URLSearchParams({ merchant_id: c.merchantId, utoken, ctoken, paytr_token: deleteHash(c, utoken, ctoken) }), fetchImpl);
    const j = r.json as { status?: string; err_msg?: string; reason?: string } | null;
    if (r.ok && j?.status === "success") return { ok: true };
    return { ok: false, reason: String(j?.err_msg ?? j?.reason ?? `HTTP ${r.status}`).slice(0, 300) };
  } catch (e) {
    return { ok: false, reason: `PayTR’ye bağlanılamadı: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300) };
  }
}

export interface ChargeRequest {
  merchantOid: string; email: string; amountTl: number; userIp: string; userName: string; userAddress: string; userPhone: string;
  utoken: string; ctoken: string; basketName: string; okUrl: string; failUrl: string;
}
/**
 * Kayıtlı kartla tahsilat başlatır. `failed`: PayTR tahsilatı hemen reddetti (sipariş başarısız sayılır);
 * `accepted`: istek kabul edildi, sonuç Bildirim URL’ye gelecek (paketi o tanımlar).
 */
export async function chargeStoredCard(c: PaytrCreds, r: ChargeRequest, fetchImpl: typeof fetch = fetch): Promise<{ result: "accepted" } | { result: "failed"; reason: string }> {
  const testMode = c.testMode ? "1" : "0";
  const paymentAmount = r.amountTl.toFixed(2);
  const body = new URLSearchParams({
    merchant_id: c.merchantId, user_ip: r.userIp, merchant_oid: r.merchantOid, email: r.email, payment_type: "card", payment_amount: paymentAmount,
    installment_count: "0", currency: "TL", test_mode: testMode, non_3d: "1", recurring_payment: "1",
    merchant_ok_url: r.okUrl, merchant_fail_url: r.failUrl, user_name: r.userName.slice(0, 60), user_address: r.userAddress.slice(0, 400), user_phone: r.userPhone.slice(0, 20),
    user_basket: Buffer.from(JSON.stringify([[r.basketName.slice(0, 100), paymentAmount, 1]]), "utf8").toString("base64"),
    debug_on: c.testMode ? "1" : "0", client_lang: "tr", utoken: r.utoken, ctoken: r.ctoken,
    paytr_token: directHash(c, { userIp: r.userIp, merchantOid: r.merchantOid, email: r.email, paymentAmount, testMode }),
  });
  try {
    const x = await post(PAYTR_DIRECT_URL, body, fetchImpl);
    const j = x.json as { status?: string; reason?: string; failed_reason_msg?: string } | null;
    if (!x.ok) return { result: "failed", reason: `PayTR HTTP ${x.status}` };
    if (j && (j.status === "failed" || j.status === "error")) return { result: "failed", reason: String(j.reason ?? j.failed_reason_msg ?? "PayTR tahsilatı reddetti").slice(0, 300) };
    if (j && j.status === "success") return { result: "accepted" };
    // Yanıt JSON değilse (ör. 3D yönlendirmesi) kayıtlı kartla sessiz tahsilat yapılamamıştır
    return { result: "failed", reason: "PayTR yanıtı tahsilat onayı içermiyor (3D doğrulama gerekebilir)" };
  } catch (e) {
    return { result: "failed", reason: `PayTR’ye bağlanılamadı: ${e instanceof Error ? e.message : String(e)}`.slice(0, 300) };
  }
}
