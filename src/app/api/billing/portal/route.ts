import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { stripePortalUrl } from "@/lib/payments";

/** Abonelik yönetimi (iptal, kart, faturalar) için Stripe müşteri portalına yönlendirme bağlantısı */
export const POST = route("billing.portal", async (req) => {
  const s = await requireUser();
  if (!env.stripeSecret) throw new ApiError(503, "Ödeme sağlayıcısı yapılandırılmamış. Yönetici ödeme anahtarlarını tanımlamalıdır.");
  const { data: sub } = await s.supabase.from("subscriptions").select("provider_customer_id").eq("user_id", s.user.id).eq("provider", "stripe").not("provider_customer_id", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!sub?.provider_customer_id) throw new ApiError(404, "Yönetilecek bir aboneliğiniz bulunamadı");
  const origin = env.appUrl || new URL(req.url).origin;
  return json({ url: await stripePortalUrl(sub.provider_customer_id, `${origin}/hesap`) });
});
