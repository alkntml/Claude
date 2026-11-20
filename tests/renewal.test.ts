/** D234: otomatik yenileme — bildirim, tahsilat zamanı, yeniden deneme, iptal, kart kaydı ve PayTR istekleri */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { callbackHash } from "@/lib/payments/paytr";
import { chargeStoredCard, deleteHash, directHash, listCards, listHash, recurringEnabled } from "@/lib/payments/paytr-recurring";

const C = { merchantId: "M123", merchantKey: "KEYABC", merchantSalt: "SALTXYZ", testMode: false };

type Row = Record<string, unknown>;
const T: Record<string, Row[]> = {};
function q(table: string) {
  const f: ((r: Row) => boolean)[] = [];
  let op: { kind: "select" | "update" | "insert"; data?: Row } = { kind: "select" };
  let ret = false;
  const rows = () => (T[table] ??= []).filter((r) => f.every((x) => x(r)));
  const run = () => {
    if (op.kind === "insert") { (T[table] ??= []).push({ ...(table === "payment_orders" ? { status: "pending" } : {}), ...op.data }); return { data: null, error: null }; }
    if (op.kind === "update") { const hit = rows(); hit.forEach((r) => Object.assign(r, op.data)); return { data: ret ? hit.map((r) => ({ ...r })) : null, error: null }; }
    return { data: rows().map((r) => ({ ...r })), error: null };
  };
  const b = {
    select: () => { if (op.kind === "update") ret = true; return b; },
    update: (d: Row) => { op = { kind: "update", data: d }; return b; },
    insert: (d: Row) => { op = { kind: "insert", data: d }; return b; },
    eq: (k: string, v: unknown) => { f.push((r) => r[k] === v); return b; },
    neq: (k: string, v: unknown) => { f.push((r) => r[k] !== v); return b; },
    is: (k: string, v: unknown) => { f.push((r) => (r[k] ?? null) === v); return b; },
    limit: () => b,
    maybeSingle: async () => ({ data: rows()[0] ? { ...rows()[0] } : null, error: null }),
    then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => Promise.resolve(run()).then(res, rej),
  };
  return b;
}
vi.mock("@/lib/supabase/admin", () => ({ adminClient: () => ({ from: (t: string) => q(t) }) }));
vi.mock("@/lib/api", () => ({ logError: vi.fn(async () => {}) }));
vi.mock("@/lib/usage", () => ({ setWorkLock: vi.fn(async () => {}) }));
vi.mock("@/lib/discount-server", () => ({ userDiscount: vi.fn(async () => null) }));

const DAY = 86400_000;
const NOW = Date.parse("2026-12-01T06:00:00Z");
const fetchOk = () => vi.fn(async () => new Response(JSON.stringify({ status: "success" }))) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
const fetchFail = (reason = "Yetersiz bakiye") => vi.fn(async () => new Response(JSON.stringify({ status: "failed", reason }))) as unknown as typeof fetch & ReturnType<typeof vi.fn>;

function seed(over: Row = {}, plan: Row = {}) {
  for (const k of Object.keys(T)) delete T[k];
  T.profiles = [{ id: "u1", email: "ali@example.com", plan_id: "pro", plan_period: "monthly", plan_expires_at: new Date(NOW + 3 * DAY).toISOString(), discount_code: null, auto_renew: true,
    renewal_attempts: 0, renewal_last_attempt_at: null, renewal_notice_for: null, renewal_notice_at: null, renewal_notice_amount: null, ...over }];
  T.plans = [{ id: "pro", name: "Pro", price_monthly: 1349, is_active: true, ...plan }];
  T.payment_methods = [{ user_id: "u1", utoken: "UTOKEN12345678", ctoken: "CTOKEN-1", card_label: "VISA •••• 4242", user_ip: "198.51.100.7",
    payer: { invoice_type: "commercial", payer_name: "Örnek Ltd.", payer_phone: "05321112233", payer_address: "Ankara Gölbaşı Örencik Mah.", buyer_email: "muhasebe@sirket.com", company_title: "Örnek Ltd.", tax_number: "8370931187", tax_office: "Gölbaşı" } }];
}
const kinds = () => (T.notifications ?? []).map((n) => n.kind);

describe("yenileme bildirimi ve tahsilat zamanı", () => {
  beforeEach(() => seed());
  it("bitişe 3 gün kala önce bildirim gider; aynı çalıştırmada tahsilat yapılmaz", async () => {
    const { runRenewals } = await import("@/lib/payments/renewal");
    const f = fetchOk();
    const s = await runRenewals(C, NOW, f);
    expect(s).toMatchObject({ checked: 1, noticed: 1, charged: 0 });
    expect(kinds()).toEqual(["renewal_notice"]);
    expect((T.notifications[0].data as { amount: number }).amount).toBe(1349);
    expect(T.profiles[0].renewal_notice_amount).toBe(1349);
    expect(T.payment_orders ?? []).toHaveLength(0);
    expect(f).not.toHaveBeenCalled();
  });
  it("bildirimden 48 saat dolmadan ve bitişe 24 saatten fazla varken tahsil edilmez", async () => {
    const { runRenewals } = await import("@/lib/payments/renewal");
    await runRenewals(C, NOW, fetchOk());
    const f = fetchOk();
    const s = await runRenewals(C, NOW + 1 * DAY, f); // bitişe 2 gün var
    expect(s.charged).toBe(0);
    expect(f).not.toHaveBeenCalled();
  });
  it("bildirim ≥48 saat önce yapıldıysa ve bitişe ≤24 saat kaldıysa kayıtlı karttan tahsil edilir (ticari fatura bilgisiyle sipariş)", async () => {
    const { runRenewals } = await import("@/lib/payments/renewal");
    await runRenewals(C, NOW, fetchOk());
    const f = fetchOk();
    const s = await runRenewals(C, NOW + 2.2 * DAY, f);
    expect(s).toMatchObject({ charged: 1 });
    const o = T.payment_orders[0];
    expect(o).toMatchObject({ user_id: "u1", plan_id: "pro", period: "monthly", days: 30, amount_try: 1349, status: "pending", renewal: true, auto_renew_consent: true, invoice_type: "commercial", tax_number: "8370931187", company_title: "Örnek Ltd.", buyer_email: "muhasebe@sirket.com" });
    expect(T.profiles[0].renewal_attempts).toBe(1);
    const body = new URLSearchParams(((f as unknown as { mock: { calls: [string, { body: URLSearchParams }][] } }).mock.calls[0][1]).body);
    expect(body.get("payment_amount")).toBe("1349.00");
    expect(body.get("utoken")).toBe("UTOKEN12345678");
    expect(body.get("ctoken")).toBe("CTOKEN-1");
    expect(body.get("non_3d")).toBe("1");
    expect(body.get("recurring_payment")).toBe("1");
    expect(body.get("user_ip")).toBe("198.51.100.7");
    expect(body.get("paytr_token")).toBe(directHash(C, { userIp: "198.51.100.7", merchantOid: String(o.merchant_oid), email: "muhasebe@sirket.com", paymentAmount: "1349.00", testMode: "0" }));
  });
  it("tahsilat sırasında fiyat artmışsa eski bildirimdeki tutardan fazla çekilmez; yeni bildirim gider", async () => {
    const { runRenewals } = await import("@/lib/payments/renewal");
    await runRenewals(C, NOW, fetchOk());
    T.plans[0].price_monthly = 1499;
    const f = fetchOk();
    const s = await runRenewals(C, NOW + 2.2 * DAY, f);
    expect(s).toMatchObject({ noticed: 1, charged: 0 });
    expect(f).not.toHaveBeenCalled();
    expect(kinds()).toEqual(["renewal_notice", "renewal_notice"]);
    expect(T.profiles[0].renewal_notice_amount).toBe(1499);
  });
  it("bitişe 4 günden fazla varsa hiçbir şey yapılmaz", async () => {
    seed({ plan_expires_at: new Date(NOW + 10 * DAY).toISOString() });
    const { runRenewals } = await import("@/lib/payments/renewal");
    expect(await runRenewals(C, NOW, fetchOk())).toMatchObject({ noticed: 0, charged: 0, skipped: 1 });
    expect(T.notifications ?? []).toHaveLength(0);
  });
  it("yıllık paket yıllık tutarla (aylık %20 indirimli × 12) ve 365 gün için yenilenir", async () => {
    seed({ plan_period: "yearly" });
    const { runRenewals } = await import("@/lib/payments/renewal");
    await runRenewals(C, NOW, fetchOk());
    const f = fetchOk();
    await runRenewals(C, NOW + 2.2 * DAY, f);
    expect(T.payment_orders[0]).toMatchObject({ period: "yearly", days: 365, amount_try: 12948 });
  });
});

describe("başarısız tahsilat, yeniden deneme ve kapanma", () => {
  const prime = async () => { seed(); const { runRenewals } = await import("@/lib/payments/renewal"); await runRenewals(C, NOW, fetchOk()); return runRenewals; };
  it("PayTR reddederse sipariş başarısız olur, kullanıcıya haber verilir, 20 saat dolmadan yeniden denenmez", async () => {
    const run = await prime();
    const t1 = NOW + 2.2 * DAY;
    expect(await run(C, t1, fetchFail())).toMatchObject({ failed: 1 });
    expect(T.payment_orders[0]).toMatchObject({ status: "failed", failed_reason: "Yetersiz bakiye" });
    expect(kinds()).toContain("renewal_retry");
    const f = fetchOk();
    expect((await run(C, t1 + 5 * 3600_000, f)).charged).toBe(0);
    expect(f).not.toHaveBeenCalled();
  });
  it("üç başarısız denemeden sonra otomatik yenileme kapanır ve kullanıcıya bildirilir", async () => {
    const run = await prime();
    const t = NOW + 2.2 * DAY;
    await run(C, t, fetchFail());
    await run(C, t + 21 * 3600_000, fetchFail());
    const s = await run(C, t + 42 * 3600_000, fetchFail());
    expect(s.disabled).toBe(1);
    expect(T.profiles[0].auto_renew).toBe(false);
    expect(kinds()).toContain("renewal_failed");
    expect(T.payment_orders).toHaveLength(3);
  });
  it("bekleyen (yanıtı gelmemiş) yenileme siparişi varken ikinci tahsilat yapılmaz", async () => {
    const run = await prime();
    const t = NOW + 2.2 * DAY;
    await run(C, t, fetchOk()); // kabul edildi, sonuç bildirimi bekleniyor
    expect(T.payment_orders[0].status).toBe("pending");
    T.payment_orders[0].created_at = new Date(t).toISOString(); // veritabanı varsayılanı now() yerine
    T.profiles[0].renewal_last_attempt_at = new Date(t - 30 * 3600_000).toISOString();
    const f = fetchOk();
    expect((await run(C, t + 3600_000, f)).charged).toBe(0);
    expect(f).not.toHaveBeenCalled();
  });
  it("bitişten 3 günden fazla geçtiyse yenileme kapanır", async () => {
    seed({ plan_expires_at: new Date(NOW - 4 * DAY).toISOString() });
    const { runRenewals } = await import("@/lib/payments/renewal");
    expect(await runRenewals(C, NOW, fetchOk())).toMatchObject({ disabled: 1 });
    expect(T.profiles[0].auto_renew).toBe(false);
  });
  it("kayıtlı kart yoksa yenileme kapanır ve kullanıcıya bildirilir; paket kaldırıldıysa da kapanır", async () => {
    seed(); T.payment_methods[0].ctoken = null;
    const { runRenewals } = await import("@/lib/payments/renewal");
    expect(await runRenewals(C, NOW, fetchOk())).toMatchObject({ disabled: 1 });
    expect(kinds()).toEqual(["renewal_card_missing"]);
    seed({}, { is_active: false });
    expect(await runRenewals(C, NOW, fetchOk())).toMatchObject({ disabled: 1 });
    expect(kinds()).toEqual(["renewal_unavailable"]);
  });
  it("otomatik yenilemesi kapalı kullanıcı hiç işlenmez", async () => {
    seed({ auto_renew: false });
    const { runRenewals } = await import("@/lib/payments/renewal");
    expect((await runRenewals(C, NOW, fetchOk())).checked).toBe(0);
  });
});

describe("yenileme ödemesi onaylanınca paket doğru uzar", () => {
  it("bildirimle gelen başarılı yenileme: bitiş kalan sürenin üstüne 30 gün eklenir, sayaçlar sıfırlanır, tek kez tanımlanır", async () => {
    const exp = new Date(NOW + 0.5 * DAY).toISOString();
    seed({ plan_expires_at: exp, renewal_attempts: 1, renewal_notice_for: exp, renewal_notice_amount: 1349 });
    T.payment_orders = [{ merchant_oid: "ACRENEWAL1", user_id: "u1", plan_id: "pro", period: "monthly", days: 30, amount_try: 1349, status: "pending", payer_name: "Örnek Ltd.", payer_phone: "05321112233", test_mode: false, applied_at: null, renewal: true, auto_renew_consent: true }];
    const { handlePaytrCallback } = await import("@/lib/payments/apply");
    const cb = { merchantOid: "ACRENEWAL1", status: "success", totalAmount: "134900", hash: callbackHash(C, "ACRENEWAL1", "success", "134900"), paymentAmount: "134900", paymentType: "card", currency: "TL", testMode: "0", failedReasonCode: "", failedReasonMsg: "" };
    expect(await handlePaytrCallback(C, cb)).toBe("paid");
    expect(Math.round((Date.parse(T.profiles[0].plan_expires_at as string) - Date.parse(exp)) / DAY)).toBe(30);
    expect(T.profiles[0]).toMatchObject({ plan_id: "pro", plan_period: "monthly", renewal_attempts: 0, renewal_notice_for: null, auto_renew: true });
    expect((T.notifications[0].data as { renewal: boolean }).renewal).toBe(true);
    expect(await handlePaytrCallback(C, cb)).toBe("already_applied");
  });
});

describe("kart kaydı ve iptal", () => {
  const cards = (arr: unknown[]) => vi.fn(async () => new Response(JSON.stringify(arr))) as unknown as typeof fetch;
  it("ilk ödeme sonrası kart saklandıysa ctoken kaydedilir ve otomatik yenileme açılır", async () => {
    seed({ auto_renew: false }); T.payment_methods[0].ctoken = null;
    const { registerCardAfterPayment } = await import("@/lib/payments/renewal");
    expect(await registerCardAfterPayment(C, "u1", "Pro", cards([{ ctoken: "NEWC", last_4: "4242", schema: "VISA", c_bank: "X" }]))).toBe(true);
    expect(T.payment_methods[0]).toMatchObject({ ctoken: "NEWC", card_label: "VISA •••• 4242" });
    expect(T.profiles[0].auto_renew).toBe(true);
  });
  it("kart saklanmadıysa yenileme açılmaz ve kullanıcıya bildirilir", async () => {
    seed({ auto_renew: false }); T.payment_methods[0].ctoken = null;
    const { registerCardAfterPayment } = await import("@/lib/payments/renewal");
    expect(await registerCardAfterPayment(C, "u1", "Pro", cards([]))).toBe(false);
    expect(T.profiles[0].auto_renew).toBe(false);
    expect(kinds()).toEqual(["renewal_card_missing"]);
  });
  it("iptal: yenileme kapanır, yeniden açma yalnızca kayıtlı kart varsa; kart silinince ctoken temizlenir", async () => {
    seed();
    const { setAutoRenew, removeStoredCard } = await import("@/lib/payments/renewal");
    expect(await setAutoRenew("u1", false)).toBe(true);
    expect(T.profiles[0].auto_renew).toBe(false);
    expect(await setAutoRenew("u1", true)).toBe(true);
    const del = vi.fn(async () => new Response(JSON.stringify({ status: "success" }))) as unknown as typeof fetch;
    expect(await removeStoredCard(C, "u1", del)).toEqual({ removedAtProvider: true });
    expect(T.payment_methods[0].ctoken).toBeNull();
    expect(T.profiles[0].auto_renew).toBe(false);
    expect(await setAutoRenew("u1", true)).toBe(false); // kart yok
  });
});

describe("PayTR istekleri", () => {
  it("imzalar alan sırasına göre HMAC-SHA256 (base64) ve tekrarlanabilir", () => {
    expect(listHash(C, "U1")).toBe(listHash(C, "U1"));
    expect(listHash(C, "U1")).not.toBe(deleteHash(C, "U1", "C1"));
    expect(directHash(C, { userIp: "1.1.1.1", merchantOid: "A1", email: "a@b.c", paymentAmount: "10.00", testMode: "0" })).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
  it("kart listesi okunur; hata yanıtında başarısız döner", async () => {
    const ok = vi.fn(async () => new Response(JSON.stringify([{ ctoken: "c1", last_4: "1234", schema: "MASTER" }]))) as unknown as typeof fetch;
    expect(await listCards(C, "U1", ok)).toMatchObject({ ok: true, cards: [{ ctoken: "c1", label: "MASTER •••• 1234" }] });
    const bad = vi.fn(async () => new Response(JSON.stringify({ status: "failed", reason: "kart saklama kapalı" }))) as unknown as typeof fetch;
    expect(await listCards(C, "U1", bad)).toEqual({ ok: false, reason: "kart saklama kapalı" });
  });
  it("tahsilat: JSON olmayan yanıt başarılı sayılmaz (güvenli başarısızlık)", async () => {
    const html = vi.fn(async () => new Response("<html>3D</html>")) as unknown as typeof fetch;
    const r = await chargeStoredCard(C, { merchantOid: "A1", email: "a@b.c", amountTl: 10, userIp: "1.1.1.1", userName: "A", userAddress: "B", userPhone: "1", utoken: "u", ctoken: "c", basketName: "x", okUrl: "", failUrl: "" }, html);
    expect(r.result).toBe("failed");
  });
  it("PAYTR_RECURRING=1 olmadıkça otomatik yenileme kapalıdır", () => {
    expect(recurringEnabled({})).toBe(false);
    expect(recurringEnabled({ PAYTR_RECURRING: "1" })).toBe(true);
  });
});
