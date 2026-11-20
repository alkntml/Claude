import { CreditCard, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "@/components/l-link";
import { getSession } from "@/lib/auth";
import { getT } from "@/i18n/server";
import { formatPrice } from "@/lib/pricing";
import { iframeUrl, PAYTR_TIMEOUT_MIN } from "@/lib/payments/paytr";

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
  const { data: plan } = order ? await s.supabase.from("plans").select("name").eq("id", order.plan_id).maybeSingle() : { data: null };
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
          <div className="mt-5 overflow-hidden rounded-2xl border border-ink-100 bg-white">
            <iframe src={iframeUrl(order!.iframe_token!)} title={t("PayTR güvenli ödeme")} className="block h-[820px] w-full sm:h-[720px]" allow="payment" referrerPolicy="origin" />
          </div>
          <p className="mt-3 text-[13px] text-ink-500">{t("Ödemeyi tamamladıktan sonra sonuç ekranı kendiliğinden açılır.")} <Link href={`/odeme-sonuc?siparis=${oid}`} className="font-medium text-brand-700 hover:underline">{t("Sonucu görüntüle")}</Link></p>
        </>
      )}
    </div>
  );
}
