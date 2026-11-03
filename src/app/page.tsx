import { getT } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";
import { JsonLd } from "@/components/json-ld";
import { softwareLd, webPageLd } from "@/lib/structured-data";
import { PAGE_SEO } from "@/lib/seo-pages";
import { localizedPath } from "@/lib/seo";
import { getPost, localizePost, postPath } from "@/lib/blog";
import { Hero } from "@/components/landing/hero";
import { HowItWorks, Pillars, PricingCards, Principles, SourcesStrip } from "@/components/landing/sections";
import { WorkTypePicker } from "@/components/landing/work-type-picker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FadeIn } from "@/components/ui/fade-in";
import { hasAuthCookie } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";
import { getUsdTry } from "@/lib/fx";
import { CompareSection } from "@/components/landing/compare";
import { TraceDemo } from "@/components/landing/trace-demo";
import Link from "@/components/l-link";
import { FaqList } from "@/components/faq-list";
import { FAQ, FAQ_HIGHLIGHTS } from "@/lib/faq";

const GUIDES = ["tez-nasil-yazilir", "apa-7-atif-kurallari", "intihal-nasil-onlenir", "literatur-taramasi-nasil-yapilir", "hangi-istatistik-analizi-secilmeli", "yapay-zeka-ile-tez-yazmak-etik-mi"];

export async function generateMetadata() {
  return pageMeta("/");
}

export default async function Home() {
  const [session, plans, { t, locale }, usdTry] = await Promise.all([hasAuthCookie(), publicPlans(), getT(), getUsdTry()]);
  const signedIn = session;
  const all = FAQ.flatMap((g) => g.items);
  const faq = FAQ_HIGHLIGHTS.map((id) => all.find((i) => i.id === id)!).filter(Boolean);
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <JsonLd data={[softwareLd(locale, plans, usdTry), webPageLd(locale, { path: localizedPath("/", locale), name: PAGE_SEO["/"].title[locale], description: PAGE_SEO["/"].description[locale] })]} />
      <main>
        <Hero signedIn={signedIn} />
        <CompareSection />
        <TraceDemo />
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
          <div className="mx-auto max-w-7xl px-6">
            <FadeIn className="mb-12 text-center">
              <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Size uygun paket")}</h2>
              <p className="mt-3 text-ink-500">{t("İstediğiniz zaman yükseltin veya iptal edin.")}</p>
            </FadeIn>
            <PricingCards plans={plans} signedIn={signedIn} />
          </div>
        </section>
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Akademik yazım rehberleri")}</h2>
                <p className="mt-3 text-ink-500">{t("Tez, makale ve araştırma sürecinde en çok merak edilen soruların cevapları: adım adım, örneklerle ve sade bir dille.")}</p>
              </div>
              <Link href="/blog" className="text-sm font-medium text-brand-700 hover:underline">{t("Bütün yazılar")} →</Link>
            </FadeIn>
            <ul className="grid gap-5 md:grid-cols-3">
              {GUIDES.map((slug) => getPost(slug)).filter((x): x is NonNullable<typeof x> => !!x).map((p) => { const l = localizePost(p, locale); return (
                <li key={p.slug}><Link href={postPath(p, locale)} className="card block h-full p-6 transition hover:-translate-y-0.5 hover:shadow-soft"><span className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(p.category)}</span><p className="mt-2 font-serif text-[19px] font-semibold leading-snug text-ink-950">{l.title}</p><p className="mt-2 line-clamp-2 text-[14px] text-ink-500">{l.description}</p></Link></li>
              ); })}
            </ul>
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
