import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/api";
import { setWorkLock } from "@/lib/usage";
import { paidExpiry } from "@/lib/payments/order";
import { toKurus, verifyCallback, type PaytrCallback, type PaytrCreds } from "@/lib/payments/paytr";

export type CallbackOutcome = "paid" | "already_applied" | "failed" | "unknown_order" | "amount_mismatch" | "ignored";

interface OrderRow {
  merchant_oid: string; user_id: string | null; plan_id: string; period: "monthly" | "yearly"; days: number; amount_try: number;
  status: string; payer_name: string; payer_phone: string; test_mode: boolean; applied_at: string | null;
}

/** İmza geçersizse fırlatılır; çağıran 400 döner (PayTR “OK” almadığı için bildirimi yeniden dener). */
export class BadSignatureError extends Error {}

/**
 * D225: PayTR bildirimi. Aynı bildirim birden çok kez gelebilir; paket yalnızca bir kez tanımlanır:
 *   1) status pending/failed → paid (tutar doğrulandıktan sonra),
 *   2) applied_at boşsa önce işaretlenir, sonra paket tanımlanır; tanımlama başarısız olursa işaret geri alınır ve hata
 *      fırlatılır → PayTR “OK” almaz, tekrar dener, ikinci denemede tanımlama yeniden yapılır.
 */
export async function handlePaytrCallback(creds: PaytrCreds, cb: PaytrCallback): Promise<CallbackOutcome> {
  if (!verifyCallback(creds, cb)) throw new BadSignatureError("PayTR bildirimi: imza geçersiz");
  const db = adminClient();
  const { data: order } = await db.from("payment_orders").select("merchant_oid, user_id, plan_id, period, days, amount_try, status, payer_name, payer_phone, test_mode, applied_at").eq("merchant_oid", cb.merchantOid).maybeSingle<OrderRow>();
  if (!order) {
    await logError("payments.paytr.callback", new Error(`Bilinmeyen sipariş: ${cb.merchantOid}`), null, { status: cb.status });
    return "unknown_order";
  }
  const now = new Date().toISOString();
  // D226: hesap silinmiş (kayıt saklanır, user_id boş) — paket tanımlanacak kimse yok; yöneticiye hata kaydı
  if (!order.user_id) {
    await logError("payments.paytr.callback", new Error(`Sipariş sahibi hesap silinmiş: ${order.merchant_oid}`), null, { status: cb.status });
    return "unknown_order";
  }

  if (cb.status !== "success") {
    if (order.status === "pending") {
      await db.from("payment_orders").update({ status: "failed", failed_reason: `${cb.failedReasonCode} ${cb.failedReasonMsg}`.trim().slice(0, 500) || null, updated_at: now }).eq("merchant_oid", order.merchant_oid).eq("status", "pending");
    }
    return "failed";
  }

  // D227: canlı modda test ödemesi kabul edilmez; para birimi yalnızca TL
  if (cb.testMode === "1" && !creds.testMode) {
    await db.from("payment_orders").update({ status: "failed", failed_reason: "Canlı modda test ödemesi kabul edilmez", updated_at: now }).eq("merchant_oid", order.merchant_oid).neq("status", "paid");
    await logError("payments.paytr.callback", new Error(`Canlı modda test ödemesi: ${order.merchant_oid}`), order.user_id);
    return "ignored";
  }
  if (cb.currency && !["TL", "TRY"].includes(cb.currency.toUpperCase())) {
    await db.from("payment_orders").update({ status: "failed", failed_reason: `Para birimi uyuşmadı: ${cb.currency}`.slice(0, 500), updated_at: now }).eq("merchant_oid", order.merchant_oid).neq("status", "paid");
    await logError("payments.paytr.callback", new Error(`Para birimi uyuşmadı: ${order.merchant_oid}`), order.user_id, { currency: cb.currency });
    return "amount_mismatch";
  }
  // Tutar: PayTR kuruş gönderir. Taksit yok; tahsil edilen tutar sipariş tutarından az olamaz.
  const expected = toKurus(Number(order.amount_try));
  const total = Number(cb.totalAmount), paid = cb.paymentAmount ? Number(cb.paymentAmount) : total;
  if (!Number.isFinite(total) || total < expected || paid !== expected) {
    await db.from("payment_orders").update({ status: "failed", failed_reason: `Tutar uyuşmadı: beklenen ${expected}, gelen ${cb.paymentAmount || cb.totalAmount} kuruş`.slice(0, 500), updated_at: now }).eq("merchant_oid", order.merchant_oid).neq("status", "paid");
    await logError("payments.paytr.callback", new Error(`Tutar uyuşmadı: ${order.merchant_oid}`), order.user_id, { expected, total, paid });
    return "amount_mismatch";
  }

  if (order.status !== "paid") {
    await db.from("payment_orders").update({ status: "paid", paid_amount_try: total / 100, payment_type: cb.paymentType.slice(0, 40) || null, failed_reason: null, test_mode: cb.testMode === "1" || order.test_mode, updated_at: now })
      .eq("merchant_oid", order.merchant_oid).neq("status", "paid");
  }
  // Tanımlama hakkını al (yalnızca bir istek kazanır)
  const { data: claimed } = await db.from("payment_orders").update({ applied_at: now }).eq("merchant_oid", order.merchant_oid).eq("status", "paid").is("applied_at", null).select("merchant_oid");
  if (!claimed?.length) return "already_applied";
  try {
    await applyPlan({ ...order, user_id: order.user_id }, total / 100, cb.testMode === "1" || order.test_mode);
  } catch (e) {
    await db.from("payment_orders").update({ applied_at: null }).eq("merchant_oid", order.merchant_oid);
    throw e;
  }
  return "paid";
}

async function applyPlan(order: OrderRow & { user_id: string }, paidTl: number, test: boolean) {
  const db = adminClient();
  const { data: profile, error: pe } = await db.from("profiles").select("plan_id, plan_expires_at, plan_period").eq("id", order.user_id).maybeSingle();
  if (pe || !profile) throw new Error(`Ödeme alındı ama kullanıcı bulunamadı: ${order.merchant_oid}`);
  const expires = paidExpiry(profile, order);
  const { error } = await db.from("profiles").update({ plan_id: order.plan_id, plan_expires_at: expires, plan_period: order.period, plan_started_at: new Date().toISOString() }).eq("id", order.user_id);
  if (error) throw error;
  // Yönetim → kullanıcı ayrıntısındaki satın alma kayıtları (WhatsApp ile alınanlarla aynı yerde görünür)
  await db.from("plan_purchases").insert({ user_id: order.user_id, plan_id: order.plan_id, payer_name: order.payer_name, payer_phone: order.payer_phone, amount_try: paidTl, note: `PayTR ${order.merchant_oid}${order.period === "yearly" ? " · yıllık" : ""}${test ? " · TEST" : ""}`, created_by: null }).then(() => undefined, () => undefined);
  const { data: plan } = await db.from("plans").select("name").eq("id", order.plan_id).maybeSingle();
  await db.from("notifications").insert({ user_id: order.user_id, kind: "payment_success", data: { plan_id: order.plan_id, plan_name: plan?.name ?? order.plan_id, period: order.period, expires_at: expires } }).then(() => undefined, () => undefined);
  await setWorkLock(order.user_id, false).catch(() => {});
}
