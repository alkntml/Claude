/**
 * D225 — PayTR kartla ödeme: imzalar (beklenen değerler openssl ile bağımsız üretildi), sepet, sipariş no,
 * tutar/süre kuralları ve bildirimin paketi yalnızca bir kez tanımlaması (sahte veritabanıyla).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callbackHash, canPayByCard, clientIp, encodeBasket, newMerchantOid, parseCallback, paytrCreds, requestToken, tokenHash, verifyCallback } from "@/lib/payments/paytr";
import { orderQuote, paidExpiry, isValidPhone, purchaseBlockReason } from "@/lib/payments/order";

const C = { merchantId: "M123", merchantKey: "KEYABC", merchantSalt: "SALTXYZ", testMode: true };
const BASKET = "W1siQWNhZGVtaWFuYSBQcm8gKEF5bMSxaykiLCI0OTkuMDAiLDFdXQ==";

describe("PayTR imzaları", () => {
  it("sepet base64 JSON, fiyat 2 ondalık", () => {
    expect(encodeBasket([{ name: "Academiana Pro (Aylık)", priceTl: 499, qty: 1 }])).toBe(BASKET);
  });
  it("token imzası (1. adım) openssl ile aynı", () => {
    const h = tokenHash(C, { userIp: "198.51.100.7", merchantOid: "ACTEST0001", email: "ali@example.com", paymentAmount: 49900, userBasket: BASKET, noInstallment: "1", maxInstallment: "0", currency: "TL", testMode: "1" });
    expect(h).toBe("YqKuRI4Lx4lADlHCmR+8vmZt6htT3ZqyIDLBWmEPosI=");
  });
  it("bildirim imzası openssl ile aynı; değiştirilmiş bildirim reddedilir", () => {
    expect(callbackHash(C, "ACTEST0001", "success", "49900")).toBe("hPIPt9Ki3eZ6N/IdKy8ep0bAXlVFDI4SVelX34UNGFA=");
    const ok = { merchantOid: "ACTEST0001", status: "success", totalAmount: "49900", hash: "hPIPt9Ki3eZ6N/IdKy8ep0bAXlVFDI4SVelX34UNGFA=" };
    expect(verifyCallback(C, ok)).toBe(true);
    expect(verifyCallback(C, { ...ok, totalAmount: "100" })).toBe(false);
    expect(verifyCallback(C, { ...ok, status: "failed" })).toBe(false);
    expect(verifyCallback(C, { ...ok, hash: "" })).toBe(false);
    expect(verifyCallback({ ...C, merchantKey: "BASKA" }, ok)).toBe(false);
  });
  it("sipariş no yalnızca harf/rakam ve tekil", () => {
    const a = newMerchantOid(), b = newMerchantOid();
    expect(a).toMatch(/^[A-Za-z0-9]{8,64}$/);
    expect(a).not.toBe(b);
  });
  it("ortam değişkenleri: eksikse kapalı, varsayılan test modu", () => {
    expect(paytrCreds({})).toBeNull();
    expect(paytrCreds({ PAYTR_MERCHANT_ID: "1", PAYTR_MERCHANT_KEY: "k", PAYTR_MERCHANT_SALT: "s" })?.testMode).toBe(true);
    expect(paytrCreds({ PAYTR_MERCHANT_ID: "1", PAYTR_MERCHANT_KEY: "k", PAYTR_MERCHANT_SALT: "s", PAYTR_TEST_MODE: "0" })?.testMode).toBe(false);
  });
  it("test modunda kartla ödeme yalnızca yönetici ve test listesine açık; canlıda herkese (D227)", () => {
    expect(canPayByCard(null, { role: "admin" })).toBe(false);
    expect(canPayByCard(C, { role: "user", email: "x@y.com" }, {})).toBe(false);
    expect(canPayByCard(C, { role: "admin", email: "x@y.com" }, {})).toBe(true);
    expect(canPayByCard(C, { role: "user", email: "Test@Ornek.com" }, { PAYTR_TEST_EMAILS: "a@b.c, test@ornek.com" })).toBe(true);
    expect(canPayByCard({ ...C, testMode: false }, { role: "user", email: "x@y.com" }, {})).toBe(true);
  });
  it("istemci IP’si ve bildirim gövdesi", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" }))).toBe("203.0.113.5");
    const cb = parseCallback(new URLSearchParams("merchant_oid=ACX1&status=success&total_amount=49900&hash=abc&payment_amount=49900&test_mode=1"));
    expect(cb).toMatchObject({ merchantOid: "ACX1", status: "success", totalAmount: "49900", paymentAmount: "49900", testMode: "1" });
  });
  it("token isteği: doğru alanlar gönderilir, gizli anahtarlar gönderilmez", async () => {
    let sent: URLSearchParams | null = null;
    const fake = (async (_u: string, init: RequestInit) => { sent = init.body as URLSearchParams; return new Response(JSON.stringify({ status: "success", token: "TOK" })); }) as unknown as typeof fetch;
    const r = await requestToken(C, { merchantOid: "ACTEST0001", email: "ali@example.com", amountTl: 499, basket: [{ name: "Academiana Pro (Aylık)", priceTl: 499, qty: 1 }], userIp: "198.51.100.7", userName: "Ali Veli", userAddress: "Ankara", userPhone: "05001112233", okUrl: "https://x/ok", failUrl: "https://x/fail", lang: "tr" }, fake);
    expect(r).toEqual({ ok: true, token: "TOK" });
    expect(sent!.get("payment_amount")).toBe("49900");
    expect(sent!.get("paytr_token")).toBe("YqKuRI4Lx4lADlHCmR+8vmZt6htT3ZqyIDLBWmEPosI=");
    expect(sent!.get("merchant_key")).toBeNull();
    expect(sent!.get("merchant_salt")).toBeNull();
    const bad = (async () => new Response(JSON.stringify({ status: "failed", reason: "x" }))) as unknown as typeof fetch;
    expect(await requestToken(C, { merchantOid: "A1234567", email: "a@b.c", amountTl: 1, basket: [], userIp: "1.1.1.1", userName: "a", userAddress: "b", userPhone: "1", okUrl: "", failUrl: "", lang: "tr" }, bad)).toEqual({ ok: false, reason: "x" });
  });
});

describe("Sipariş tutarı ve süresi", () => {
  const pro = { id: "pro", price_monthly: 899 };
  it("aylık: liste fiyatı, indirim kodu uygulanır; yıllık: %20 indirimli toplam, kod uygulanmaz", () => {
    expect(orderQuote(pro, "monthly")).toEqual({ amount: 899, list: 899, days: 30, discountCode: null });
    expect(orderQuote(pro, "monthly", { code: "HOS20", kind: "percent", value: 20, plans: [] })).toEqual({ amount: 719, list: 899, days: 30, discountCode: "HOS20" });
    expect(orderQuote(pro, "yearly", { code: "HOS20", kind: "percent", value: 20, plans: [] })).toEqual({ amount: 719 * 12, list: 899 * 12, days: 365, discountCode: null });
    expect(orderQuote({ id: "free", price_monthly: 0 }, "monthly")).toBeNull();
    expect(orderQuote({ id: "single", price_monthly: 3999 }, "monthly")?.days).toBe(30);
    // D236: İstatistik paketi (1 TL): yalnızca aylık, indirim kodu uygulanmaz (tutar hep 1 TL)
    expect(orderQuote({ id: "istatistik", price_monthly: 1 }, "monthly")).toEqual({ amount: 1, list: 1, days: 30, discountCode: null });
    expect(orderQuote({ id: "istatistik", price_monthly: 1 }, "yearly")).toBeNull();
    expect(orderQuote({ id: "istatistik", price_monthly: 1 }, "monthly", { code: "HOS50", kind: "percent", value: 50, plans: [] })).toEqual({ amount: 1, list: 1, days: 30, discountCode: null });
    expect(orderQuote({ id: "istatistik", price_monthly: 1 }, "monthly", { code: "BIR", kind: "amount_try", value: 1, plans: [] })?.amount).toBe(1);
  });
  it("bitiş: aynı paket sürüyorsa kalan sürenin üstüne, değilse bugünden", () => {
    const now = Date.parse("2026-11-20T00:00:00Z");
    const future = "2026-11-30T00:00:00.000Z";
    expect(paidExpiry({ plan_id: "pro", plan_expires_at: future, plan_period: "monthly" }, { plan_id: "pro", period: "monthly", days: 30 }, now)).toBe("2026-12-30T00:00:00.000Z");
    expect(paidExpiry({ plan_id: "basic", plan_expires_at: future, plan_period: "monthly" }, { plan_id: "pro", period: "monthly", days: 30 }, now)).toBe("2026-12-20T00:00:00.000Z");
    expect(paidExpiry({ plan_id: "pro", plan_expires_at: future, plan_period: "monthly" }, { plan_id: "pro", period: "yearly", days: 365 }, now)).toBe("2027-11-20T00:00:00.000Z");
  });
  it("telefon doğrulaması", () => {
    expect(isValidPhone("0532 111 22 33")).toBe(true);
    expect(isValidPhone("+90 532 111 22 33")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
  });
});

/* ---------- bildirim: sahte veritabanı ---------- */
type Row = Record<string, unknown>;
const T: Record<string, Row[]> = {};
function q(table: string) {
  const f: ((r: Row) => boolean)[] = [];
  let op: { kind: "select" | "update" | "insert"; data?: Row } = { kind: "select" };
  let ret = false;
  const rows = () => (T[table] ??= []).filter((r) => f.every((x) => x(r)));
  const run = () => {
    if (op.kind === "insert") { (T[table] ??= []).push({ ...op.data }); return { data: null, error: null }; }
    if (op.kind === "update") { const hit = rows(); hit.forEach((r) => Object.assign(r, op.data)); return { data: ret ? hit.map((r) => ({ ...r })) : null, error: null }; }
    return { data: rows(), error: null };
  };
  const b = {
    select: () => { if (op.kind === "update") ret = true; return b; },
    update: (d: Row) => { op = { kind: "update", data: d }; return b; },
    insert: (d: Row) => { op = { kind: "insert", data: d }; return b; },
    eq: (k: string, v: unknown) => { f.push((r) => r[k] === v); return b; },
    neq: (k: string, v: unknown) => { f.push((r) => r[k] !== v); return b; },
    is: (k: string, v: unknown) => { f.push((r) => (r[k] ?? null) === v); return b; },
    maybeSingle: async () => ({ data: rows()[0] ? { ...rows()[0] } : null, error: null }),
    then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(run()).then(res, rej),
  };
  return b;
}
vi.mock("@/lib/supabase/admin", () => ({ adminClient: () => ({ from: (t: string) => q(t) }) }));
vi.mock("@/lib/api", () => ({ logError: vi.fn(async () => {}) }));
vi.mock("@/lib/usage", () => ({ setWorkLock: vi.fn(async () => {}) }));

describe("PayTR bildirimi", () => {
  const signed = (status: string, total: string, oid = "ACORDER001") => ({ merchantOid: oid, status, totalAmount: total, hash: callbackHash(C, oid, status, total), paymentAmount: total, paymentType: "card", currency: "TL", testMode: "1", failedReasonCode: "", failedReasonMsg: "" });
  beforeEach(() => {
    for (const k of Object.keys(T)) delete T[k];
    T.payment_orders = [{ merchant_oid: "ACORDER001", user_id: "u1", plan_id: "pro", period: "monthly", days: 30, amount_try: 899, status: "pending", payer_name: "Ali Veli", payer_phone: "05321112233", test_mode: true, applied_at: null }];
    T.profiles = [{ id: "u1", plan_id: "free", plan_expires_at: null, plan_period: "monthly" }];
    T.plans = [{ id: "pro", name: "Pro" }];
  });

  it("başarılı ödeme paketi bir kez tanımlar; tekrar gelen bildirim ikinci kez tanımlamaz", async () => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    expect(await handlePaytrCallback(C, signed("success", "89900"))).toBe("paid");
    expect(T.profiles[0]).toMatchObject({ plan_id: "pro", plan_period: "monthly" });
    const exp1 = T.profiles[0].plan_expires_at;
    expect(T.payment_orders[0]).toMatchObject({ status: "paid", paid_amount_try: 899 });
    expect(T.plan_purchases).toHaveLength(1);
    expect(T.notifications).toHaveLength(1);
    expect(await handlePaytrCallback(C, signed("success", "89900"))).toBe("already_applied");
    expect(T.profiles[0].plan_expires_at).toBe(exp1);
    expect(T.plan_purchases).toHaveLength(1);
  });
  it("imza geçersizse paket tanımlanmaz", async () => {
    const { handlePaytrCallback, BadSignatureError } = await import("@/lib/payments/apply");
    await expect(handlePaytrCallback(C, { ...signed("success", "89900"), hash: "sahte" })).rejects.toBeInstanceOf(BadSignatureError);
    expect(T.profiles[0].plan_id).toBe("free");
  });
  it("eksik tutar kabul edilmez", async () => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    expect(await handlePaytrCallback(C, signed("success", "100"))).toBe("amount_mismatch");
    expect(T.profiles[0].plan_id).toBe("free");
    expect(T.payment_orders[0].status).toBe("failed");
  });
  it("başarısız ödeme siparişi kapatır, paket değişmez", async () => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    expect(await handlePaytrCallback(C, signed("failed", "89900"))).toBe("failed");
    expect(T.payment_orders[0].status).toBe("failed");
    expect(T.profiles[0].plan_id).toBe("free");
  });
  it("canlı modda test ödemesi ve TL dışı para birimi kabul edilmez (D227)", async () => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    const live = { ...C, testMode: false };
    expect(await handlePaytrCallback(live, signed("success", "89900"))).toBe("ignored");
    expect(T.profiles[0].plan_id).toBe("free");
    T.payment_orders[0].status = "pending";
    expect(await handlePaytrCallback(C, { ...signed("success", "89900"), currency: "USD" })).toBe("amount_mismatch");
    expect(T.profiles[0].plan_id).toBe("free");
  });
  it("bilinmeyen sipariş sessizce kaydedilir", async () => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    expect(await handlePaytrCallback(C, signed("success", "89900", "ACYOK00001"))).toBe("unknown_order");
  });
});

describe("D231: her paket ve dönem için doğru paket, süre ve tutar tanımlanır", () => {
  const plans = [{ id: "istatistik", price: 1 }, { id: "basic", price: 749 }, { id: "pro", price: 1349 }, { id: "premium", price: 2249 }, { id: "single", price: 3999 }];
  // İstatistik paketi (1 TL) yalnızca aylıktır
  const cases = plans.flatMap((p) => (p.id === "istatistik" ? (["monthly"] as const) : (["monthly", "yearly"] as const)).map((period) => ({ ...p, period })));
  beforeEach(() => { for (const k of Object.keys(T)) delete T[k]; });
  it.each(cases)("$id / $period", async ({ id, price, period }) => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    const quote = orderQuote({ id, price_monthly: price }, period)!;
    // Beklenen: aylık 30 gün ve liste fiyatı; yıllık 365 gün ve %20 indirimli aylık × 12
    expect(quote.days).toBe(period === "yearly" ? 365 : 30);
    expect(quote.amount).toBe(period === "yearly" ? Math.round(price * 0.8) * 12 : price);
    T.payment_orders = [{ merchant_oid: "ACMATRIX01", user_id: "u1", plan_id: id, period, days: quote.days, amount_try: quote.amount, status: "pending", payer_name: "Ali Veli", payer_phone: "05321112233", test_mode: true, applied_at: null }];
    T.profiles = [{ id: "u1", plan_id: "free", plan_expires_at: null, plan_period: "monthly" }];
    T.plans = [{ id, name: id }];
    const kurus = String(Math.round(quote.amount * 100));
    const cb = { merchantOid: "ACMATRIX01", status: "success", totalAmount: kurus, hash: callbackHash(C, "ACMATRIX01", "success", kurus), paymentAmount: kurus, paymentType: "card", currency: "TL", testMode: "1", failedReasonCode: "", failedReasonMsg: "" };
    const t0 = Date.now();
    expect(await handlePaytrCallback(C, cb)).toBe("paid");
    const prof = T.profiles[0] as { plan_id: string; plan_period: string; plan_expires_at: string; plan_started_at: string };
    expect(prof.plan_id).toBe(id);
    expect(prof.plan_period).toBe(period);
    const days = (Date.parse(prof.plan_expires_at) - Date.parse(prof.plan_started_at)) / 86400_000;
    expect(Math.round(days)).toBe(quote.days);
    expect(Math.abs(Date.parse(prof.plan_started_at) - t0)).toBeLessThan(5000);
    expect(T.plan_purchases).toHaveLength(1);
    expect(T.plan_purchases[0]).toMatchObject({ user_id: "u1", plan_id: id, amount_try: quote.amount });
    // Satın alan kişiye tanımlanan paketin hakları: hasFeature paket kimliğiyle (profildeki plan_id) hesaplanır
    const { hasFeature } = await import("@/lib/features");
    expect(hasFeature(prof.plan_id, "stats")).toBe(true);
    expect(hasFeature(prof.plan_id, "surveys")).toBe(id !== "istatistik");
    expect(hasFeature(prof.plan_id, "prisma")).toBe(["pro", "premium", "single"].includes(id));
    expect(T.notifications[0]).toMatchObject({ user_id: "u1", kind: "payment_success" });
    expect((T.notifications[0].data as { plan_id: string; period: string }).plan_id).toBe(id);
    // tekrar gelen bildirim paketi ikinci kez uzatmaz
    expect(await handlePaytrCallback(C, cb)).toBe("already_applied");
    expect(T.profiles[0].plan_expires_at).toBe(prof.plan_expires_at);
  });
  it("aynı pakette uzatma: kalan süre korunur ve yeni süre eklenir; farklı pakette bugünden başlar", async () => {
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    const future = new Date(Date.now() + 10 * 86400_000).toISOString();
    T.payment_orders = [{ merchant_oid: "ACRENEW001", user_id: "u1", plan_id: "pro", period: "monthly", days: 30, amount_try: 1349, status: "pending", payer_name: "A", payer_phone: "05321112233", test_mode: true, applied_at: null }];
    T.profiles = [{ id: "u1", plan_id: "pro", plan_expires_at: future, plan_period: "monthly" }];
    T.plans = [{ id: "pro", name: "Pro" }];
    expect(await handlePaytrCallback(C, { merchantOid: "ACRENEW001", status: "success", totalAmount: "134900", hash: callbackHash(C, "ACRENEW001", "success", "134900"), paymentAmount: "134900", paymentType: "card", currency: "TL", testMode: "1", failedReasonCode: "", failedReasonMsg: "" })).toBe("paid");
    expect(Math.round((Date.parse(T.profiles[0].plan_expires_at as string) - Date.parse(future)) / 86400_000)).toBe(30);
  });
});

describe("D231: satın alma kuralı (düşük pakete / yıllığın yerine aylığa geçiş engellenir)", () => {
  const now = Date.parse("2026-11-20T00:00:00Z");
  const active = "2026-12-20T00:00:00.000Z";
  it("süren paketten düşük paket reddedilir; aynı veya üst paket serbest", () => {
    expect(purchaseBlockReason({ plan_id: "premium", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "basic", period: "monthly" }, now)).toMatch(/daha düşük/);
    expect(purchaseBlockReason({ plan_id: "pro", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "pro", period: "monthly" }, now)).toBeNull();
    expect(purchaseBlockReason({ plan_id: "pro", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "premium", period: "yearly" }, now)).toBeNull();
    expect(purchaseBlockReason({ plan_id: "pro", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "pro", period: "yearly" }, now)).toBeNull();
  });
  it("yıllık paket sürerken aynı paketin aylığı reddedilir; üst paketin aylığı serbest", () => {
    expect(purchaseBlockReason({ plan_id: "pro", plan_expires_at: "2027-06-01T00:00:00.000Z", plan_period: "yearly" }, { plan_id: "pro", period: "monthly" }, now)).toMatch(/Yıllık paketiniz/);
    expect(purchaseBlockReason({ plan_id: "pro", plan_expires_at: "2027-06-01T00:00:00.000Z", plan_period: "yearly" }, { plan_id: "premium", period: "monthly" }, now)).toBeNull();
  });
  it("İstatistik paketi (1 TL): ücretsiz veya kendisi olan alabilir; Basic ve üstü olan düşük pakete geçemez", () => {
    expect(purchaseBlockReason({ plan_id: "free", plan_expires_at: null }, { plan_id: "istatistik", period: "monthly" }, now)).toBeNull();
    expect(purchaseBlockReason({ plan_id: "istatistik", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "istatistik", period: "monthly" }, now)).toBeNull();
    expect(purchaseBlockReason({ plan_id: "istatistik", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "basic", period: "monthly" }, now)).toBeNull();
    expect(purchaseBlockReason({ plan_id: "basic", plan_expires_at: active, plan_period: "monthly" }, { plan_id: "istatistik", period: "monthly" }, now)).toMatch(/daha düşük/);
  });
  it("paket bitmişse veya ücretsizse her paket alınabilir", () => {
    expect(purchaseBlockReason({ plan_id: "premium", plan_expires_at: "2026-11-01T00:00:00.000Z", plan_period: "yearly" }, { plan_id: "basic", period: "monthly" }, now)).toBeNull();
    expect(purchaseBlockReason({ plan_id: "free", plan_expires_at: null }, { plan_id: "basic", period: "monthly" }, now)).toBeNull();
  });
});
