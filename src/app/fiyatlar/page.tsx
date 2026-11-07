import { getT } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd, offersLd, softwareLd } from "@/lib/structured-data";
import { localizedPath } from "@/lib/seo";
import { PricingCards } from "@/components/landing/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasAuthCookie } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";
import { getSetting } from "@/lib/settings";
import { getUsdTry } from "@/lib/fx";
import { referralReward } from "@/lib/growth";
import Link from "@/components/l-link";

export async function generateMetadata() {
  return pageMeta("/fiyatlar");
}

export default async function Pricing() {
  const [s, plans, { t, locale }, referral, usdTry] = await Promise.all([hasAuthCookie(), publicPlans(), getT(), getSetting("referral"), getUsdTry()]);
  const reward = await referralReward();
  return (
    <>
      <SiteHeader signedIn={s} />
      <JsonLd data={[softwareLd(locale, plans, usdTry), offersLd(locale, plans, usdTry), breadcrumbLd(locale, [{ name: t("Fiyatlar"), path: localizedPath("/fiyatlar", locale) }])]} />
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-36">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink-950">{t("Şeffaf fiyatlandırma")}</h1>
          <p className="mt-4 text-ink-500">{t("Her paket, çalışmanızın aşamasına uygun araçlar içerir. Taahhüt yok; ücretsiz başlayıp istediğiniz zaman yükseltebilirsiniz.")}</p>
        </div>
        <PricingCards plans={plans} signedIn={s} />
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-ink-100 bg-white p-5 text-sm leading-relaxed text-ink-600">
          <p className="font-semibold text-ink-900">{t("Paket ölçüleri nasıl belirlendi?")}</p>
          <p className="mt-1">{t("Aylık sayfa miktarları, 44 gerçek akademik tam metin üzerinde ölçülen ortalama sayfa uzunluğu ve bir sayfanın ortalama yapay zekâ maliyeti esas alınarak hesaplanır; sayfa sayıları yaklaşıktır. Ana sayfa ve bu sayfa aynı paket kaydından beslenir.")}</p>
          <p className="mt-2">{t("“Sınırsız” ifadesi, bir kişinin akademik çalışması için olağan kullanımı anlatır.")} <Link href="/kosullar#adil-kullanim" className="font-medium text-brand-700 hover:underline">{t("Adil kullanım koşulları →")}</Link> · <Link href="/yontem" className="font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık →")}</Link></p>
        </div>
        <p className="mt-8 text-center"><Link href="/ornekler" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">{t("Her hizmetin örnek çıktısını görün →")}</Link></p>
        <div className="mx-auto mt-12 grid max-w-4xl gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="font-semibold text-ink-900">{t("Kurum lisansı")}</p>
            <p className="mt-1 text-sm text-ink-500">{t("Üniversite, enstitü ve araştırma grupları için toplu hesap: tek faturayla tüm öğrencilere Pro veya Premium paket.")}</p>
            <Link href="/kurumlar" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">{t("Ayrıntılar →")}</Link>
          </div>
          {referral.enabled && (
            <div className="card p-5">
              <p className="font-semibold text-ink-900">{t("Arkadaşını davet et")}</p>
              <p className="mt-1 text-sm text-ink-500">{t("Davet ettiğiniz her arkadaşınız kaydolduğunda size {a} yapay zekâ isteği ve {s} kaynak tarama hakkı tanımlanır ({d} gün geçerli).", { a: reward.ai_requests, s: reward.source_searches, d: referral.valid_days })}</p>
            </div>
          )}
        </div>
        <p className="mt-10 text-center text-sm text-ink-400">{locale === "en" ? t("Dolar fiyatları güncel kurla yaklaşık olarak hesaplanır; ödeme TL veya dolar ile yapılabilir.") : t("Fiyatlara KDV dahildir.")} {t("Yapay zekâ kullanımında paketlere göre aylık adil kullanım sınırları uygulanır; sınırlar paket yükseltirken gösterilir.")}</p>
      </main>
      <SiteFooter />
    </>
  );
}

export const dynamic = "force-dynamic";
