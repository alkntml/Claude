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
import { TEAM_DISCOUNT, whatsappLink } from "@/lib/pricing";
import Link from "@/components/l-link";

export async function generateMetadata() {
  return pageMeta("/fiyatlar");
}

export default async function Pricing() {
  const [s, plans, { t, locale }, referral] = await Promise.all([hasAuthCookie(), publicPlans(), getT(), getSetting("referral")]);
  const teamHref = whatsappLink(t("Merhaba, Academiana Akademik Ekip İndirimi (%{p}) hakkında bilgi almak istiyorum.\nKurum / bölüm / ekip adı: \nKişi sayısı: \nİlgilendiğimiz paket: ", { p: TEAM_DISCOUNT.percent }));
  return (
    <>
      <SiteHeader signedIn={s} />
      <JsonLd data={[softwareLd(locale, plans), offersLd(locale, plans), breadcrumbLd(locale, [{ name: t("Fiyatlar"), path: localizedPath("/fiyatlar", locale) }])]} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink-950">{t("Şeffaf fiyatlandırma")}</h1>
          <p className="mt-4 text-ink-500">{t("Her paket, çalışmanızın aşamasına uygun araçlar içerir. Taahhüt yok; ücretsiz başlayıp istediğiniz zaman yükseltebilirsiniz.")}</p>
        </div>
        <PricingCards plans={plans} signedIn={s} />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="card p-5">
            <p className="font-semibold text-ink-900">{t("Akademik Ekip İndirimi: %{p}", { p: TEAM_DISCOUNT.percent })}</p>
            <p className="mt-1 text-sm text-ink-500">{t("Akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler için: en az {n} kişilik ekiplerde tüm ücretli paketlerde %{p} indirim.", { n: TEAM_DISCOUNT.minMembers, p: TEAM_DISCOUNT.percent })}</p>
            <a href={teamHref} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">{t("WhatsApp’tan bilgi al →")}</a>
          </div>
          <div className="card p-5">
            <p className="font-semibold text-ink-900">{t("Kurum lisansı")}</p>
            <p className="mt-1 text-sm text-ink-500">{t("Üniversite, enstitü ve araştırma grupları için toplu hesap: tek faturayla tüm öğrencilere Pro veya Premium paket.")}</p>
            <Link href="/kurumlar" className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline">{t("Ayrıntılar →")}</Link>
          </div>
          {referral.enabled && (
            <div className="card p-5">
              <p className="font-semibold text-ink-900">{t("Arkadaşını davet et")}</p>
              <p className="mt-1 text-sm text-ink-500">{t("Davet ettiğiniz her arkadaşınız e-postasını doğruladığında ikinize de {a} yapay zekâ isteği ve {s} kaynak tarama hakkı ({d} gün geçerli).", { a: referral.ai_requests, s: referral.source_searches, d: referral.valid_days })}</p>
            </div>
          )}
        </div>
        <p className="mt-10 text-center text-sm text-ink-400">{t("Fiyatlara KDV dahildir.")} {t("Yapay zekâ kullanımında paketlere göre aylık adil kullanım sınırları uygulanır; sınırlar paket yükseltirken gösterilir.")}</p>
      </main>
      <SiteFooter />
    </>
  );
}

export const dynamic = "force-dynamic";
