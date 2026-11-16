import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "@/components/l-link";
import { BrandMark, type Signature } from "@/components/brand-mark";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale } from "@/i18n/server";
import { hasAuthCookie } from "@/lib/auth";
import { INTEL, INTEL_ORDER, type IntelId } from "@/lib/intelligence-pages";
import { localizedPath } from "@/lib/seo";
import { breadcrumbLd, faqLd, webPageLd } from "@/lib/structured-data";

const NAME: Record<IntelId, Signature> = { zenit: "Zenit", rasat: "Rasat", mizan: "Mizan" };

/**
 * D220: Zenit, Rasat ve Mizan’ın ayrıntılı tanıtım sayfası (arama motorları için; site menülerinde bağlantı yok).
 * Sayfa HTML’i kişiye göre değişmez (CDN önbelleği, D168).
 */
export async function IntelligencePage({ id }: { id: IntelId }) {
  const [signedIn, locale] = await Promise.all([hasAuthCookie(), getLocale()]);
  const c = INTEL[id][locale];
  const path = localizedPath(`/${id}`, locale);
  const others = INTEL_ORDER.filter((x) => x !== id);
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <JsonLd data={[breadcrumbLd(locale, [{ name: NAME[id], path }]), webPageLd(locale, { path, name: c.title, description: c.lead }), faqLd(locale, path, c.faq)]} />
      <main id="main" className="pb-24 pt-32">
        <section className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{c.eyebrow}</p>
          <p className="mt-6 font-serif text-6xl font-medium tracking-tight sm:text-7xl"><BrandMark name={NAME[id]} /></p>
          <h1 className="mt-5 font-serif text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">{c.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-[17px] leading-relaxed text-ink-600">{c.lead}</p>
          <Link href={signedIn ? "/yeni" : "/kayit"} className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-7 font-medium text-white transition hover:bg-brand-700">{c.cta} <ArrowRight className="h-4 w-4" /></Link>
        </section>

        <section className="mx-auto mt-20 max-w-5xl px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {c.capabilities.map((x) => (
              <article key={x.h} className="rounded-3xl border border-ink-100 bg-white p-6">
                <h2 className="text-lg font-semibold text-ink-900">{x.h}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{x.p}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl px-6">
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-ink-100 bg-ink-100 sm:grid-cols-3">
            {c.steps.map((x, i) => (
              <li key={x.h} className="bg-white p-6">
                <p className="text-[12px] font-semibold tabular-nums text-brand-600">{String(i + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 font-semibold text-ink-900">{x.h}</h2>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-600">{x.p}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto mt-16 max-w-3xl space-y-10 px-6">
          {c.sections.map((x) => (
            <div key={x.h}>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink-950">{x.h}</h2>
              {x.p && <p className="mt-3 text-[16px] leading-relaxed text-ink-700">{x.p}</p>}
              {x.list && <ul className="mt-3 space-y-2">{x.list.map((l) => <li key={l} className="flex items-start gap-2.5 text-[15.5px] text-ink-700"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-brand-500" />{l}</li>)}</ul>}
            </div>
          ))}
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink-950">{locale === "tr" ? "Sık sorulan sorular" : locale === "de" ? "Häufige Fragen" : "Frequently asked questions"}</h2>
            <div className="faq-list mt-4">
              {c.faq.map((f) => <details key={f.q}><summary><span>{f.q}</span><i aria-hidden /></summary><div><p>{f.a}</p></div></details>)}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-[0.12em] text-ink-400">{c.sibling}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {others.map((o) => (
              <Link key={o} href={`/${o}`} className="group rounded-2xl border border-brand-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300">
                <p className="font-serif text-2xl"><BrandMark name={NAME[o]} /> <span className="text-[15px] italic text-ink-500">{INTEL[o][locale].motto.replace(NAME[o], "").trim()}</span></p>
                <p className="mt-1.5 text-[14px] text-ink-600">{INTEL[o][locale].title}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
