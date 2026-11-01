import { getT } from "@/i18n/server";
import { Hero } from "@/components/landing/hero";
import { HowItWorks, Pillars, PricingCards, Principles, SourcesStrip } from "@/components/landing/sections";
import { WorkTypePicker } from "@/components/landing/work-type-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/ui/primitives";
import { getSession } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";

export default async function Home() {
  const [session, plans, { t }] = await Promise.all([getSession().catch(() => null), publicPlans(), getT()]);
  const signedIn = !!session;
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <main>
        <Hero signedIn={signedIn} />
        <section id="tur-sec" className="relative scroll-mt-24 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-[44px]">{t("Bugün hangi akademik çalışmayı hazırlamak istiyorsunuz?")}</h2>
              <p className="mt-4 text-ink-500">{t("Her çalışma türünün kendine özgü bir akışı vardır. Seçiminize göre aşamalar, kurallar ve asistanlar hazırlanır.")}</p>
            </FadeIn>
            <WorkTypePicker signedIn={signedIn} />
          </div>
        </section>
        <Pillars />
        <HowItWorks />
        <SourcesStrip />
        <Principles />
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mb-12 text-center">
              <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Size uygun paket")}</h2>
              <p className="mt-3 text-ink-500">{t("İstediğiniz zaman yükseltin veya iptal edin.")}</p>
            </FadeIn>
            <PricingCards plans={plans} signedIn={signedIn} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const dynamic = "force-dynamic";
