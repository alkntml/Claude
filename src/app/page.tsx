import { getT } from "@/i18n/server";
import { Hero } from "@/components/landing/hero";
import { HowItWorks, Pillars, PricingCards, Principles, SourcesStrip } from "@/components/landing/sections";
import { WorkTypePicker } from "@/components/landing/work-type-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/ui/primitives";
import { getSession } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";
import Link from "next/link";
import { FaqList } from "@/components/faq-list";
import { FAQ, FAQ_HIGHLIGHTS } from "@/lib/faq";

export default async function Home() {
  const [session, plans, { t, locale }] = await Promise.all([getSession().catch(() => null), publicPlans(), getT()]);
  const signedIn = !!session;
  const all = FAQ.flatMap((g) => g.items);
  const faq = FAQ_HIGHLIGHTS.map((id) => all.find((i) => i.id === id)!).filter(Boolean);
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
        <section id="sss" className="scroll-mt-24 pb-24">
          <div className="mx-auto max-w-3xl px-6">
            <FadeIn className="mb-10 text-center">
              <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Sık sorulan sorular")}</h2>
              <p className="mt-3 text-ink-500">{t("En çok merak edilenlere açık ve dürüst cevaplar.")}</p>
            </FadeIn>
            <FaqList items={faq} locale={locale === "en" ? "en" : "tr"} />
            <p className="mt-6 text-center"><Link href="/sss" className="text-sm font-medium text-brand-700 hover:underline">{t("Tüm soruları gör →")}</Link></p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export const dynamic = "force-dynamic";
