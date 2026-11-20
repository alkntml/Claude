import "server-only";
import { logError } from "@/lib/api";
import { env } from "@/lib/env";
import { userDiscount } from "@/lib/discount-server";
import { legalDoc } from "@/lib/legal/docs";
import { orderQuote } from "@/lib/payments/order";
import { newMerchantOid, type PaytrCreds } from "@/lib/payments/paytr";
import { chargeStoredCard, deleteCard, listCards, newUtoken } from "@/lib/payments/paytr-recurring";
import { adminClient } from "@/lib/supabase/admin";

/**
 * D234: otomatik yenileme. Abonelik iptal edilmedikçe dönem sonunda kayıtlı kartla yenilenir.
 *
 * Akış (günlük zamanlanmış görev, /api/cron/renewals → `runRenewals`):
 *   1) Bitişe en çok 4 gün kala kullanıcıya yenileme bildirimi (paket, tutar, tarih) gönderilir ve kaydedilir.
 *   2) Bildirimden en az 48 saat sonra ve bitişe en çok 24 saat kala (ya da bitişten sonraki 3 gün içinde) kayıtlı karttan
 *      tahsilat denenir. Bildirimdeki tutardan yüksek bir tutar tahsil edilmez; fiyat artmışsa yeni bildirim gönderilir.
 *   3) Tahsilat sonucu PayTR’nin imzalı bildirimiyle gelir; paketi yalnızca o bildirim tanımlar (apply.ts) ve bitiş
 *      tarihini yeni döneme uzatır. Başarısız tahsilat en fazla 3 kez, günde bir denenir; sonra otomatik yenileme kapanır.
 * Kullanıcı Hesap → Otomatik yenileme’den istediği an iptal edebilir ve kayıtlı kartı silebilir.
 */
export const NOTICE_DAYS = 4;
export const MIN_NOTICE_HOURS = 48;
export const CHARGE_WINDOW_HOURS = 24;
export const GRACE_DAYS = 3;
export const MAX_ATTEMPTS = 3;
export const ATTEMPT_GAP_HOURS = 20;
export const PENDING_STALE_HOURS = 12;
export const MAX_CHARGES_PER_RUN = 15;
const H = 3600_000, DAY = 86400_000;

interface RenewalProfile {
  id: string; email: string | null; plan_id: string; plan_period: string | null; plan_expires_at: string | null; discount_code: string | null; auto_renew: boolean;
  renewal_attempts: number | null; renewal_last_attempt_at: string | null; renewal_notice_for: string | null; renewal_notice_at: string | null; renewal_notice_amount: number | string | null;
}
interface MethodRow { user_id: string; utoken: string; ctoken: string | null; card_label: string | null; user_ip: string | null; payer: Record<string, unknown> | null }

export type NoticeKind = "renewal_notice" | "renewal_retry" | "renewal_failed" | "renewal_card_missing" | "renewal_unavailable";
const notify = async (userId: string, kind: NoticeKind | "payment_success", data: Record<string, unknown>) => {
  await adminClient().from("notifications").insert({ user_id: userId, kind, data }).then(() => undefined, () => undefined);
};

/** Ödeme başlatılırken: kullanıcının kart saklama anahtarını (utoken) hazırlar ve fatura bilgisini saklar (yenileme siparişi için) */
export async function prepareStoredCard(userId: string, userIp: string, payer: Record<string, unknown>): Promise<string> {
  const db = adminClient();
  const { data: pm } = await db.from("payment_methods").select("user_id, utoken").eq("user_id", userId).maybeSingle<{ user_id: string; utoken: string }>();
  if (pm) {
    await db.from("payment_methods").update({ user_ip: userIp.slice(0, 45) || null, payer, updated_at: new Date().toISOString() }).eq("user_id", userId);
    return pm.utoken;
  }
  const utoken = newUtoken();
  const { error } = await db.from("payment_methods").insert({ user_id: userId, utoken, user_ip: userIp.slice(0, 45) || null, payer });
  if (error) throw new Error("payment_methods kaydedilemedi (migration 53 çalıştırıldı mı?)");
  return utoken;
}

/** İlk ödeme başarılı olunca: PayTR’de saklanan kartın anahtarını alır, otomatik yenilemeyi açar. Kart saklanmadıysa açmaz ve bildirir. */
export async function registerCardAfterPayment(creds: PaytrCreds, userId: string, planName: string, fetchImpl: typeof fetch = fetch): Promise<boolean> {
  const db = adminClient();
  const { data: pm } = await db.from("payment_methods").select("user_id, utoken, ctoken, card_label, user_ip, payer").eq("user_id", userId).maybeSingle<MethodRow>();
  const off = async () => { await db.from("profiles").update({ auto_renew: false }).eq("id", userId); await notify(userId, "renewal_card_missing", { plan_name: planName }); return false; };
  if (!pm) return off();
  const r = await listCards(creds, pm.utoken, fetchImpl);
  if (!r.ok) { await logError("payments.renewal.cards", new Error(r.reason), userId); return off(); }
  if (!r.cards.length) return off();
  // Yeni eklenen kart (daha önce kayıtlı olandan farklı) tercih edilir; yoksa mevcut kart, yoksa listenin sonuncusu
  const card = r.cards.find((c) => c.ctoken !== pm.ctoken) ?? r.cards.find((c) => c.ctoken === pm.ctoken) ?? r.cards[r.cards.length - 1];
  await db.from("payment_methods").update({ ctoken: card.ctoken, card_label: card.label, updated_at: new Date().toISOString() }).eq("user_id", userId);
  await db.from("profiles").update({ auto_renew: true, renewal_attempts: 0, renewal_last_attempt_at: null, renewal_notice_for: null, renewal_notice_at: null, renewal_notice_amount: null }).eq("id", userId);
  return true;
}

/** Başarılı bir ödemeden sonra yenileme sayaçlarını sıfırlar */
export async function resetRenewalCounters(userId: string) {
  await adminClient().from("profiles").update({ renewal_attempts: 0, renewal_last_attempt_at: null, renewal_notice_for: null, renewal_notice_at: null, renewal_notice_amount: null }).eq("id", userId);
}

async function disable(p: RenewalProfile, kind: NoticeKind, extra: Record<string, unknown> = {}) {
  await adminClient().from("profiles").update({ auto_renew: false, renewal_attempts: 0, renewal_last_attempt_at: null, renewal_notice_for: null, renewal_notice_at: null, renewal_notice_amount: null }).eq("id", p.id);
  await notify(p.id, kind, { plan_id: p.plan_id, ...extra });
}

export interface RenewalSummary { checked: number; noticed: number; charged: number; failed: number; disabled: number; skipped: number }

/** Günlük görev: bildirim gönder, zamanı gelenlerden tahsil et. Her kullanıcı kendi içinde hata yalıtımlıdır. */
export async function runRenewals(creds: PaytrCreds, now = Date.now(), fetchImpl: typeof fetch = fetch): Promise<RenewalSummary> {
  const db = adminClient();
  const sum: RenewalSummary = { checked: 0, noticed: 0, charged: 0, failed: 0, disabled: 0, skipped: 0 };
  const { data: profs } = await db.from("profiles").select("id, email, plan_id, plan_period, plan_expires_at, discount_code, auto_renew, renewal_attempts, renewal_last_attempt_at, renewal_notice_for, renewal_notice_at, renewal_notice_amount").eq("auto_renew", true).limit(1000);
  for (const p of (profs ?? []) as RenewalProfile[]) {
    sum.checked++;
    try {
      const out = await processOne(creds, p, now, fetchImpl, sum.charged);
      sum[out]++;
    } catch (e) {
      sum.skipped++;
      await logError("payments.renewal", e, p.id);
    }
  }
  return sum;
}

type Outcome = "noticed" | "charged" | "failed" | "disabled" | "skipped";

async function processOne(creds: PaytrCreds, p: RenewalProfile, now: number, fetchImpl: typeof fetch, chargedSoFar: number): Promise<Outcome> {
  const db = adminClient();
  if (p.plan_id === "free" || !p.plan_expires_at) { await disable(p, "renewal_unavailable"); return "disabled"; }
  const exp = Date.parse(p.plan_expires_at);
  const left = exp - now;
  if (left > NOTICE_DAYS * DAY) return "skipped";
  if (-left > GRACE_DAYS * DAY) { await disable(p, "renewal_failed", { reason: "expired" }); return "disabled"; }

  const period = p.plan_period === "yearly" ? "yearly" : "monthly";
  const { data: plan } = await db.from("plans").select("id, name, price_monthly, is_active").eq("id", p.plan_id).maybeSingle<{ id: string; name: string; price_monthly: number; is_active: boolean }>();
  const discount = period === "monthly" ? await userDiscount({ discount_code: p.discount_code }) : null;
  const quote = plan && plan.is_active !== false ? orderQuote({ id: plan.id, price_monthly: Number(plan.price_monthly) }, period, discount) : null;
  if (!plan || !quote) { await disable(p, "renewal_unavailable", { plan_name: plan?.name ?? p.plan_id }); return "disabled"; }
  const { data: pm } = await db.from("payment_methods").select("user_id, utoken, ctoken, card_label, user_ip, payer").eq("user_id", p.id).maybeSingle<MethodRow>();
  if (!pm?.ctoken) { await disable(p, "renewal_card_missing", { plan_name: plan.name }); return "disabled"; }

  // 1) Bildirim: bu bitiş tarihi için, tutarı kapsayan bir bildirim yoksa yenisi gönderilir (aynı çalıştırmada tahsilat yapılmaz)
  const noticeFor = p.renewal_notice_for ? Date.parse(p.renewal_notice_for) : NaN;
  const noticeAt = p.renewal_notice_at ? Date.parse(p.renewal_notice_at) : NaN;
  const notified = Number(p.renewal_notice_amount ?? NaN);
  if (!(noticeFor === exp && Number.isFinite(notified) && notified >= quote.amount)) {
    await db.from("profiles").update({ renewal_notice_for: new Date(exp).toISOString(), renewal_notice_at: new Date(now).toISOString(), renewal_notice_amount: quote.amount }).eq("id", p.id);
    await notify(p.id, "renewal_notice", { plan_id: plan.id, plan_name: plan.name, period, amount: quote.amount, date: new Date(exp).toISOString(), card: pm.card_label });
    return "noticed";
  }
  if (!Number.isFinite(noticeAt) || now - noticeAt < MIN_NOTICE_HOURS * H) return "skipped";
  if (left > CHARGE_WINDOW_HOURS * H) return "skipped";

  // 2) Tahsilat denemesi
  const attempts = Number(p.renewal_attempts ?? 0);
  if (attempts >= MAX_ATTEMPTS) { await disable(p, "renewal_failed", { plan_name: plan.name }); return "disabled"; }
  if (p.renewal_last_attempt_at && now - Date.parse(p.renewal_last_attempt_at) < ATTEMPT_GAP_HOURS * H) return "skipped";
  if (chargedSoFar >= MAX_CHARGES_PER_RUN) return "skipped";
  const { data: pending } = await db.from("payment_orders").select("merchant_oid, created_at").eq("user_id", p.id).eq("renewal", true).eq("status", "pending");
  let waiting = false;
  for (const o of (pending ?? []) as { merchant_oid: string; created_at: string }[]) {
    if (now - Date.parse(o.created_at) < PENDING_STALE_HOURS * H) waiting = true;
    else await db.from("payment_orders").update({ status: "failed", failed_reason: "PayTR’den sonuç bildirimi gelmedi", updated_at: new Date(now).toISOString() }).eq("merchant_oid", o.merchant_oid).eq("status", "pending");
  }
  if (waiting) return "skipped";
  // Aynı anda iki çalıştırma aynı kullanıcıyı tahsil etmesin
  const { data: claimed } = await db.from("profiles").update({ renewal_attempts: attempts + 1, renewal_last_attempt_at: new Date(now).toISOString() }).eq("id", p.id).eq("renewal_attempts", attempts).select("id");
  if (!claimed?.length) return "skipped";

  const payer = (pm.payer ?? {}) as Record<string, unknown>;
  const email = String(payer.buyer_email || p.email || "");
  const oid = newMerchantOid(now);
  const row = {
    merchant_oid: oid, provider: "paytr", user_id: p.id, plan_id: plan.id, period, days: quote.days, amount_try: quote.amount, list_price_try: quote.list, discount_code: quote.discountCode,
    test_mode: creds.testMode, immediate_start_consent: true, distance_version: legalDoc("distance").version, renewal: true, auto_renew_consent: true,
    payer_name: String(payer.payer_name ?? ""), payer_phone: String(payer.payer_phone ?? ""), payer_address: String(payer.payer_address ?? ""), buyer_email: email || null,
    invoice_type: payer.invoice_type === "commercial" ? "commercial" : "individual", buyer_first_name: payer.buyer_first_name ?? null, buyer_last_name: payer.buyer_last_name ?? null,
    company_title: payer.company_title ?? null, tax_number: payer.tax_number ?? null, tax_office: payer.tax_office ?? null,
  };
  const { error: insErr } = await db.from("payment_orders").insert(row);
  if (insErr) throw new Error(`Yenileme siparişi kaydedilemedi: ${insErr.message ?? insErr.code ?? "bilinmiyor"}`);

  const back = `${env.appUrl}/odeme-sonuc?siparis=${oid}`;
  const res = !pm.user_ip || !email
    ? { result: "failed" as const, reason: "Kayıtlı IP veya e-posta yok" }
    : await chargeStoredCard(creds, {
      merchantOid: oid, email, amountTl: quote.amount, userIp: pm.user_ip, userName: String(payer.payer_name ?? "Academiana"), userAddress: String(payer.payer_address || "Türkiye (bireysel fatura)"),
      userPhone: String(payer.payer_phone ?? ""), utoken: pm.utoken, ctoken: pm.ctoken, basketName: `Academiana ${plan.name} (${period === "yearly" ? "Yıllık" : "Aylık"}) otomatik yenileme`, okUrl: back, failUrl: `${back}&durum=hata`,
    }, fetchImpl);
  if (res.result === "accepted") return "charged";

  await db.from("payment_orders").update({ status: "failed", failed_reason: res.reason.slice(0, 500), updated_at: new Date(now).toISOString() }).eq("merchant_oid", oid).eq("status", "pending");
  await logError("payments.renewal.charge", new Error(res.reason), p.id, { oid });
  if (attempts + 1 >= MAX_ATTEMPTS) { await disable(p, "renewal_failed", { plan_name: plan.name }); return "disabled"; }
  await notify(p.id, "renewal_retry", { plan_name: plan.name, amount: quote.amount });
  return "failed";
}

/** Hesap ekranı için durum */
export async function renewalState(userId: string, profile: { plan_id: string; plan_period?: string | null; plan_expires_at?: string | null; discount_code?: string | null; auto_renew?: boolean | null }) {
  const db = adminClient();
  const { data: pm } = await db.from("payment_methods").select("ctoken, card_label").eq("user_id", userId).maybeSingle<{ ctoken: string | null; card_label: string | null }>();
  const period = profile.plan_period === "yearly" ? "yearly" : "monthly";
  const { data: plan } = profile.plan_id !== "free" ? await db.from("plans").select("id, name, price_monthly, is_active").eq("id", profile.plan_id).maybeSingle<{ id: string; name: string; price_monthly: number; is_active: boolean }>() : { data: null };
  const discount = period === "monthly" ? await userDiscount({ discount_code: profile.discount_code }) : null;
  const quote = plan && plan.is_active !== false ? orderQuote({ id: plan.id, price_monthly: Number(plan.price_monthly) }, period, discount) : null;
  return {
    enabled: !!profile.auto_renew && !!pm?.ctoken, hasCard: !!pm?.ctoken, cardLabel: pm?.card_label ?? null,
    planName: plan?.name ?? null, period, amount: quote?.amount ?? null, nextDate: profile.plan_expires_at ?? null,
  };
}

export async function setAutoRenew(userId: string, on: boolean): Promise<boolean> {
  const db = adminClient();
  if (on) {
    const { data: pm } = await db.from("payment_methods").select("ctoken").eq("user_id", userId).maybeSingle<{ ctoken: string | null }>();
    if (!pm?.ctoken) return false;
  }
  await db.from("profiles").update({ auto_renew: on, renewal_attempts: 0, renewal_last_attempt_at: null, renewal_notice_for: null, renewal_notice_at: null, renewal_notice_amount: null }).eq("id", userId);
  return true;
}

/** Kayıtlı kartı siler (PayTR’de ve burada) ve otomatik yenilemeyi kapatır */
export async function removeStoredCard(creds: PaytrCreds | null, userId: string, fetchImpl: typeof fetch = fetch): Promise<{ removedAtProvider: boolean }> {
  const db = adminClient();
  const { data: pm } = await db.from("payment_methods").select("utoken, ctoken").eq("user_id", userId).maybeSingle<{ utoken: string; ctoken: string | null }>();
  let removedAtProvider = true;
  if (pm?.ctoken && creds) {
    const r = await deleteCard(creds, pm.utoken, pm.ctoken, fetchImpl);
    if (!r.ok) { removedAtProvider = false; await logError("payments.renewal.card_delete", new Error(r.reason ?? "bilinmiyor"), userId); }
  }
  await db.from("payment_methods").update({ ctoken: null, card_label: null, updated_at: new Date().toISOString() }).eq("user_id", userId);
  await setAutoRenew(userId, false);
  return { removedAtProvider };
}
