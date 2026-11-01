import { PricingCards } from "@/components/landing/sections";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";

export const metadata = { title: "Fiyatlar" };

export default async function Pricing() {
  const [s, plans] = await Promise.all([getSession().catch(() => null), publicPlans()]);
  return (
    <>
      <SiteHeader signedIn={!!s} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink-950">Şeffaf fiyatlandırma</h1>
          <p className="mt-4 text-ink-500">Yıllık ödemede iki ay ücretsiz. Limitler yapay zekâ istekleri, kaynak taramaları, proje sayısı ve depolama üzerinden belirlenir.</p>
        </div>
        <PricingCards plans={plans} signedIn={!!s} />
        <p className="mt-10 text-center text-sm text-ink-400">Fiyatlara KDV dahildir. Kurumsal ve üniversite lisansları için bizimle iletişime geçin.</p>
      </main>
      <SiteFooter />
    </>
  );
}

export const dynamic = "force-dynamic";
