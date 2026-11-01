import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { PAYMENT_PROVIDERS } from "@/lib/payments";
import { discounted, isStudentEmail } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";

export const POST = route("billing.checkout", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, z.object({ planId: z.string().max(40), interval: z.enum(["monthly", "yearly"]).default("monthly"), provider: z.enum(["stripe", "iyzico"]).default("stripe") }));
  const provider = PAYMENT_PROVIDERS[b.provider];
  if (!provider.implemented) throw new ApiError(501, `${provider.label} entegrasyonu henüz tamamlanmadı`, "not_implemented");
  if (!provider.configured()) throw new ApiError(503, "Ödeme sağlayıcısı yapılandırılmamış. Yönetici ödeme anahtarlarını tanımlamalıdır.", "payments_not_configured");
  const { data: plan } = await s.supabase.from("plans").select("*").eq("id", b.planId).eq("is_active", true).maybeSingle();
  if (!plan || Number(plan.price_monthly) <= 0) throw new ApiError(404, "Paket bulunamadı");
  // Öğrenci indirimi: doğrulanmış üniversite e-postası (ör. .edu.tr)
  const student = await getSetting("billing.student");
  const isStudent = student.enabled && !!s.user.email_confirmed_at && isStudentEmail(s.user.email, student.domains);
  const priced = isStudent
    ? { ...plan, name: `${plan.name} (Öğrenci)`, price_monthly: discounted(Number(plan.price_monthly), student.percent), price_yearly: discounted(Number(plan.price_yearly), student.percent) }
    : plan;
  const { url } = await provider.createCheckout({
    userId: s.user.id, email: s.user.email ?? "", plan: priced, interval: b.interval,
    successUrl: `${env.appUrl}/hesap?odeme=basarili`, cancelUrl: `${env.appUrl}/fiyatlar?odeme=iptal`,
  });
  return json({ url });
});
