import { CreditCard, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "@/components/l-link";
import { getSession } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { formatPrice } from "@/lib/pricing";
import { iframeUrl, PAYTR_TIMEOUT_MIN } from "@/lib/payments/paytr";
import { OrderSummary } from "@/components/order-summary";
import { paidExpiry } from "@/lib/payments/order";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Güvenli ödeme"), robots: { index: false, follow: false } };
}

/**
 * D225: kartla ödeme sayfası. PayTR’nin güvenli ödeme sayfası bir çerçevede açılır; kart bilgisi Academiana’ya gelmez.
 * Ödeme bitince PayTR çerçeve içinde /odeme-sonuc sayfasını açar; o sayfa çerçeveden çıkıp sonucu gösterir.
 */
export default async function PaymentPage({ searchParams }: { searchParams: Promise<{ siparis?: string }> }) {
  const [{ t }, sp, s] = await Promise.all([getT(), searchParams, getSession()]);
  const oid = String(sp.siparis ?? "");
  if (!s || !/^[A-Za-z0-9]{8,64}$/.test(oid)) redirect("/hesap");
  const { data: order } = await s.supabase.from("payment_orders").select("merchant_oid, plan_id, period, amount_try, status, iframe_token, test_mode, created_at, applied_at")
    .eq("merchant_oid", oid).eq("user_id", s.user.id).maybeSingle();
  if (order?.status === "paid") redirect(`/odeme-sonuc?siparis=${oid}`);
  const { data: plan } = order ? await s.supabase.from("plans").select("name, description, features").eq("id", order.plan_id).maybeSingle() : { data: null };
  // D235: sipariş özeti için ek sipariş alanları (auto_renew_consent migration 53 ile gelir; yoksa onsuz okunur)
  let extra: { days?: number; list_price_try?: number | null; discount_code?: string | null; auto_renew_consent?: boolean | null } | null = null;
  if (order) {
    const full = await s.supabase.from("payment_orders").select("days, list_price_try, discount_code, auto_renew_consent").eq("merchant_oid", oid).eq("user_id", s.user.id).maybeSingle();
    extra = full.error ? (await s.supabase.from("payment_orders").select("days, list_price_try, discount_code").eq("merchant_oid", oid).eq("user_id", s.user.id).maybeSingle()).data : full.data;
  }
  const expired = !order || order.status !== "pending" || !order.iframe_token || Date.now() - Date.parse(order.created_at) > PAYTR_TIMEOUT_MIN * 60_000;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="flex items-center gap-2 font-serif text-3xl font-medium tracking-tight text-ink-950"><CreditCard className="h-7 w-7 text-brand-600" /> {t("Güvenli ödeme")}</h1>
      {order && (
        <p className="mt-2 text-ink-600">
          {t("{plan} paketi", { plan: t(plan?.name ?? order.plan_id) })} · {order.period === "yearly" ? t("Yıllık (tek ödeme)") : t("Aylık")} · <b className="text-ink-900">{formatPrice(Number(order.amount_try), "tr")}</b>
          {order.test_mode && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[12px] font-semibold text-amber-800">{t("Test modu: gerçek ödeme alınmaz")}</span>}
        </p>
      )}
      {expired ? (
        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6">
          <p className="text-ink-700">{order?.status === "failed" ? t("Bu ödeme tamamlanmadı. Kartınızdan para çekilmediyse yeniden deneyebilirsiniz.") : t("Bu ödeme sayfasının süresi doldu. Paketinizi seçip yeniden başlatabilirsiniz.")}</p>
          <Link href="/hesap" className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">{t("Hesap ve abonelik sayfasına dön")}</Link>
        </div>
      ) : (
        <>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />{t("Kart bilgileriniz Academiana’ya gelmez; ödeme, lisanslı ödeme kuruluşu PayTR’nin güvenli sayfasında yapılır. Ödemeniz onaylanınca paketiniz hesabınıza kendiliğinden tanımlanır.")}</p>
          {order && extra?.days && (() => {
            const startsAt = new Date();
            const personal = { plan_id: s.profile.personal_plan_id ?? s.profile.plan_id, plan_expires_at: s.profile.plan_expires_at ?? null, plan_period: s.profile.plan_period };
            const endsAt = new Date(paidExpiry(personal, { plan_id: order.plan_id, period: order.period === "yearly" ? "yearly" : "monthly", days: extra.days }, startsAt.getTime()));
            return (
              <div className="mt-5">
                <OrderSummary planName={plan?.name ?? order.plan_id} planId={order.plan_id} description={plan?.description ?? null} features={(plan?.features as string[] | null) ?? []} yearly={order.period === "yearly"} days={extra.days}
                  amount={Number(order.amount_try)} listPrice={extra.list_price_try != null ? Number(extra.list_price_try) : null} discountCode={extra.discount_code ?? null} startsAt={startsAt} endsAt={endsAt}
                  extending={endsAt.getTime() - startsAt.getTime() > extra.days * 86400_000 + 60_000} autoRenew={!!extra.auto_renew_consent} />
              </div>
            );
          })()}
          <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 bg-white">
            <iframe src={iframeUrl(order!.iframe_token!)} title={t("PayTR güvenli ödeme")} className="block h-[820px] w-full sm:h-[720px]" allow="payment" referrerPolicy="origin" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white px-4 py-3 text-[13.5px] text-ink-600">
            <span>{t("Kart formu görünmüyor veya “Lütfen bekleyin” ekranında kalıyor mu? Ödeme sayfasını yeni sekmede açın; ödeme bitince sonuç ekranına yönlendirilirsiniz.")}</span>
            <a href={iframeUrl(order!.iframe_token!)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"><CreditCard className="h-4 w-4" /> {t("Ödeme sayfasını yeni sekmede aç")}</a>
          </div>
          <p className="mt-3 text-[13px] text-ink-500">{t("Ödemeyi tamamladıktan sonra sonuç ekranı kendiliğinden açılır.")} <Link href={`/odeme-sonuc?siparis=${oid}`} className="font-medium text-brand-700 hover:underline">{t("Sonucu görüntüle")}</Link></p>
        </>
      )}
    </div>
  );
}
