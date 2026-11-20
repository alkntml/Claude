import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { userDiscount } from "@/lib/discount-server";
import { env } from "@/lib/env";
import { localeFromRequest } from "@/i18n/server";
import { adminClient } from "@/lib/supabase/admin";
import { legalDoc } from "@/lib/legal/docs";
import { isValidPhone, normalizePhone, orderQuote, purchaseBlockReason } from "@/lib/payments/order";
import { INDIVIDUAL_PAYTR_ADDRESS, InvoiceBody, invoiceErrors, invoiceRecord, isValidEmail, type InvoiceForm } from "@/lib/payments/invoice";
import { canPayByCard, clientIp, iframeUrl, newMerchantOid, paytrCreds, requestToken } from "@/lib/payments/paytr";
import { recurringEnabled } from "@/lib/payments/paytr-recurring";
import { prepareStoredCard } from "@/lib/payments/renewal";

const Body = z.object({
  planId: z.string().min(1).max(40),
  period: z.enum(["monthly", "yearly"]),
  // D231: fatura bilgisi — bireysel (ad, soyad, telefon, e-posta) veya ticari (unvan, vergi no, vergi dairesi, adres, telefon, e-posta)
  invoice: InvoiceBody,
  // D226: dijital hizmetin ödeme onaylanınca hemen başlaması talebi (cayma hakkı bilgisiyle birlikte) zorunlu
  immediateStart: z.literal(true),
  // D234: abonelik iptal edilmedikçe otomatik yenilensin (kart PayTR’de saklanır). Yenileme kapalıysa (PAYTR_RECURRING) yok sayılır.
  autoRenew: z.boolean().optional(),
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
  // D227: test modunda yalnızca yönetici ve test listesindekiler (test kartıyla ücretsiz paket alınamasın)
  if (!canPayByCard(creds, { role: s.profile.role, email: s.profile.email ?? s.user.email })) throw new ApiError(503, "Kartla ödeme şu an kullanılamıyor; WhatsApp ile yükseltebilirsiniz.", "payments_disabled");
  const b = await parseBody(req, Body);
  const inv = b.invoice;
  // D231: fatura alanları istemciyle aynı kuralla doğrulanır (vergi numarası sağlama basamağı dahil)
  const form: InvoiceForm = { type: inv.type, firstName: inv.type === "individual" ? inv.firstName : "", lastName: inv.type === "individual" ? inv.lastName : "", company: inv.type === "commercial" ? inv.company : "", taxNo: inv.type === "commercial" ? inv.taxNo : "", taxOffice: inv.type === "commercial" ? inv.taxOffice : "", address: inv.type === "commercial" ? inv.address : "", phone: inv.phone, email: inv.email };
  const bad = invoiceErrors(form);
  if (bad.includes("phone") || !isValidPhone(inv.phone)) throw new ApiError(422, "Geçerli bir telefon numarası yazın", "validation");
  if (bad.includes("email") || !isValidEmail(inv.email)) throw new ApiError(422, "Geçerli bir e-posta adresi yazın", "validation");
  if (bad.includes("taxNo")) throw new ApiError(422, "Vergi numarası geçerli değil (10 haneli vergi kimlik no veya 11 haneli T.C. kimlik no)", "validation");
  if (bad.length) throw new ApiError(422, "Fatura bilgilerini eksiksiz doldurun", "validation");
  const rec = invoiceRecord(inv);
  const email = rec.buyer_email;

  const db = adminClient();
  const { data: plan } = await db.from("plans").select("id, name, price_monthly, is_active").eq("id", b.planId).maybeSingle();
  if (!plan || plan.is_active === false) throw new ApiError(404, "Paket bulunamadı");
  const quote = orderQuote({ id: plan.id, price_monthly: Number(plan.price_monthly) }, b.period, b.period === "monthly" ? await userDiscount(s.profile) : null);
  if (!quote) throw new ApiError(422, "Bu paket için kartla ödeme yapılamaz");
  // D231: süren paketten daha düşük pakete / yıllığın yerine aylığa geçiş reddedilir
  {
    // Kişisel paket (kurum paketi ve yönetici görünümü değil): profiles.plan_id
    const block = purchaseBlockReason({ plan_id: s.profile.personal_plan_id ?? s.profile.plan_id, plan_expires_at: s.profile.plan_expires_at ?? null, plan_period: s.profile.plan_period }, { plan_id: plan.id, period: b.period });
    if (block) throw new ApiError(409, block, "plan_downgrade");
  }

  // Kötüye kullanım: kısa sürede çok sayıda yarım kalan sipariş açılamaz
  const since = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count } = await db.from("payment_orders").select("merchant_oid", { count: "exact", head: true }).eq("user_id", s.user.id).eq("status", "pending").gte("created_at", since);
  if ((count ?? 0) >= 5) throw new ApiError(429, "Çok sayıda ödeme denemesi yapıldı; birkaç dakika sonra tekrar deneyin.");

  const oid = newMerchantOid();
  // D234: otomatik yenileme (varsayılan açık; kullanıcı onay kutusundan kapatabilir)
  const autoRenew = recurringEnabled() && b.autoRenew !== false;
  let utoken: string | undefined;
  if (autoRenew) {
    try { utoken = await prepareStoredCard(s.user.id, clientIp(req.headers), { ...rec, immediate_start_consent: true }); }
    catch (e) { throw new ApiError(500, e instanceof Error ? e.message : "Kart bilgisi hazırlanamadı"); }
  }
  const row = {
    merchant_oid: oid, provider: "paytr", user_id: s.user.id, plan_id: plan.id, period: b.period, days: quote.days,
    amount_try: quote.amount, list_price_try: quote.list, discount_code: quote.discountCode,
    ...rec, test_mode: creds.testMode, ...(autoRenew ? { auto_renew_consent: true } : {}),
  };
  // D226: satın alma onayları ve e-posta (migration 46); sütunlar yoksa (migration çalıştırılmadıysa) onlarsız kaydedilir
  // D231: fatura bilgisi kaybolmamalı; sütunlar yoksa (migration 50) sipariş açılmaz
  const { error } = await db.from("payment_orders").insert({ ...row, immediate_start_consent: b.immediateStart, distance_version: legalDoc("distance").version });
  if (error) throw new ApiError(500, "Sipariş kaydedilemedi (migration 45, 46 ve 50 çalıştırıldı mı?)");

  const locale = localeFromRequest(req);
  const back = `${env.appUrl}/odeme-sonuc?siparis=${oid}`;
  const tok = await requestToken(creds, {
    merchantOid: oid, email, amountTl: quote.amount,
    basket: [{ name: `Academiana ${plan.name} (${b.period === "yearly" ? (locale === "tr" ? "Yıllık" : "Yearly") : (locale === "tr" ? "Aylık" : "Monthly")})`, priceTl: quote.amount, qty: 1 }],
    userIp: clientIp(req.headers), userName: rec.payer_name, userAddress: rec.payer_address || INDIVIDUAL_PAYTR_ADDRESS, userPhone: normalizePhone(inv.phone),
    okUrl: back, failUrl: `${back}&durum=hata`, lang: locale === "tr" ? "tr" : "en", utoken,
  });
  if (!tok.ok) {
    await db.from("payment_orders").update({ status: "failed", failed_reason: tok.reason, updated_at: new Date().toISOString() }).eq("merchant_oid", oid);
    throw new ApiError(502, "Ödeme sayfası açılamadı. Lütfen biraz sonra tekrar deneyin.", "paytr_token", { reason: creds.testMode ? tok.reason : undefined });
  }
  await db.from("payment_orders").update({ iframe_token: tok.token }).eq("merchant_oid", oid);
  return json({ oid, iframeUrl: iframeUrl(tok.token), amount: quote.amount, test: creds.testMode, autoRenew });
});
