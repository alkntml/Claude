import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { userDiscount } from "@/lib/discount-server";
import { env } from "@/lib/env";
import { localeFromRequest } from "@/i18n/server";
import { adminClient } from "@/lib/supabase/admin";
import { legalDoc } from "@/lib/legal/docs";
import { isValidPhone, normalizePhone, orderQuote } from "@/lib/payments/order";
import { clientIp, iframeUrl, newMerchantOid, paytrCreds, requestToken } from "@/lib/payments/paytr";

const Body = z.object({
  planId: z.string().min(1).max(40),
  period: z.enum(["monthly", "yearly"]),
  payer: z.object({
    name: z.string().trim().min(3).max(60),
    phone: z.string().trim().min(10).max(20),
    address: z.string().trim().min(10).max(400),
  }),
  // D226: dijital hizmetin ödeme onaylanınca hemen başlaması talebi (cayma hakkı bilgisiyle birlikte) zorunlu
  immediateStart: z.literal(true),
});

/**
 * D225: kartla ödeme başlatır. Tutar sunucuda liste fiyatından hesaplanır; sipariş kaydedilir ve PayTR’den ödeme
 * anahtarı alınır. Dönen `oid` ile /odeme sayfası PayTR’nin güvenli ödeme çerçevesini açar.
 * Salt okunur kullanıcıya da açıktır (paket almak, salt okunurdan çıkmanın yoludur; lib/read-only.ts).
 */
export const POST = route("payments.checkout", async (req) => {
  const s = await requireUser();
  const creds = paytrCreds();
  if (!creds) throw new ApiError(503, "Kartla ödeme şu an kullanılamıyor; WhatsApp ile yükseltebilirsiniz.", "payments_disabled");
  const b = await parseBody(req, Body);
  if (!isValidPhone(b.payer.phone)) throw new ApiError(422, "Geçerli bir telefon numarası yazın", "validation");
  const email = s.profile.email ?? s.user.email ?? "";
  if (!email) throw new ApiError(422, "Hesabınızda e-posta adresi yok", "validation");

  const db = adminClient();
  const { data: plan } = await db.from("plans").select("id, name, price_monthly, is_active").eq("id", b.planId).maybeSingle();
  if (!plan || plan.is_active === false) throw new ApiError(404, "Paket bulunamadı");
  const quote = orderQuote({ id: plan.id, price_monthly: Number(plan.price_monthly) }, b.period, b.period === "monthly" ? await userDiscount(s.profile) : null);
  if (!quote) throw new ApiError(422, "Bu paket için kartla ödeme yapılamaz");

  // Kötüye kullanım: kısa sürede çok sayıda yarım kalan sipariş açılamaz
  const since = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count } = await db.from("payment_orders").select("merchant_oid", { count: "exact", head: true }).eq("user_id", s.user.id).eq("status", "pending").gte("created_at", since);
  if ((count ?? 0) >= 5) throw new ApiError(429, "Çok sayıda ödeme denemesi yapıldı; birkaç dakika sonra tekrar deneyin.");

  const oid = newMerchantOid();
  const row = {
    merchant_oid: oid, provider: "paytr", user_id: s.user.id, plan_id: plan.id, period: b.period, days: quote.days,
    amount_try: quote.amount, list_price_try: quote.list, discount_code: quote.discountCode,
    payer_name: b.payer.name, payer_phone: normalizePhone(b.payer.phone), payer_address: b.payer.address, test_mode: creds.testMode,
  };
  // D226: satın alma onayları ve e-posta (migration 46); sütunlar yoksa (migration çalıştırılmadıysa) onlarsız kaydedilir
  let { error } = await db.from("payment_orders").insert({ ...row, immediate_start_consent: b.immediateStart, distance_version: legalDoc("distance").version, buyer_email: email.slice(0, 320) });
  if (error?.code === "42703" || error?.code === "PGRST204") ({ error } = await db.from("payment_orders").insert(row));
  if (error) throw new ApiError(500, "Sipariş kaydedilemedi (migration 45 çalıştırıldı mı?)");

  const locale = localeFromRequest(req);
  const back = `${env.appUrl}/odeme-sonuc?siparis=${oid}`;
  const tok = await requestToken(creds, {
    merchantOid: oid, email, amountTl: quote.amount,
    basket: [{ name: `Academiana ${plan.name} (${b.period === "yearly" ? (locale === "tr" ? "Yıllık" : "Yearly") : (locale === "tr" ? "Aylık" : "Monthly")})`, priceTl: quote.amount, qty: 1 }],
    userIp: clientIp(req.headers), userName: b.payer.name, userAddress: b.payer.address, userPhone: normalizePhone(b.payer.phone),
    okUrl: back, failUrl: `${back}&durum=hata`, lang: locale === "tr" ? "tr" : "en",
  });
  if (!tok.ok) {
    await db.from("payment_orders").update({ status: "failed", failed_reason: tok.reason, updated_at: new Date().toISOString() }).eq("merchant_oid", oid);
    throw new ApiError(502, "Ödeme sayfası açılamadı. Lütfen biraz sonra tekrar deneyin.", "paytr_token", { reason: creds.testMode ? tok.reason : undefined });
  }
  await db.from("payment_orders").update({ iframe_token: tok.token }).eq("merchant_oid", oid);
  return json({ oid, iframeUrl: iframeUrl(tok.token), amount: quote.amount, test: creds.testMode });
});
