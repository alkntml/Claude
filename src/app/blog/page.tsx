import Link from "@/components/l-link";
import { getT } from "@/i18n/server";
import { dateLocale } from "@/i18n/core";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasAuthCookie } from "@/lib/auth";
import { CATEGORIES, localizePost, POSTS, postPath, readingMinutes } from "@/lib/blog";
import { absoluteUrl, localizedPath } from "@/lib/seo";
import { pageMeta } from "@/lib/seo-server";
import { breadcrumbLd } from "@/lib/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateMetadata() {
  return pageMeta("/blog");
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const [{ t, locale }, s, { kategori }] = await Promise.all([getT(), hasAuthCookie(), searchParams]);
  const all = POSTS.map((p) => ({ p, l: localizePost(p, locale) }));
  const list = kategori ? all.filter((x) => x.p.category === kategori) : all;
  // En yeni üç yazı: son güncelleme/yayın tarihine göre (eşitse listede sonra eklenen önce)
  const latest = all.map((x, i) => ({ ...x, i })).sort((a, b) => (b.p.updated ?? b.p.date).localeCompare(a.p.updated ?? a.p.date) || b.i - a.i).slice(0, 3);
  const groups = (kategori ? [kategori] : CATEGORIES).map((c) => [c, list.filter((x) => x.p.category === c)] as const).filter(([, items]) => items.length > 0);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(dateLocale(locale), { day: "numeric", month: "long", year: "numeric" });
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Blog", "@id": `${SITE_URL}/blog#blog`, name: `${SITE_NAME} Blog`, url: absoluteUrl(localizedPath("/blog", locale)), inLanguage: locale === "en" ? "en" : locale === "de" ? "de-DE" : "tr-TR", publisher: { "@id": `${SITE_URL}/#organization` } },
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: all.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(postPath(x.p, locale)), name: x.l.title })) },
    breadcrumbLd(locale, [{ name: "Blog", path: localizedPath("/blog", locale) }]),
  ];
  return (
    <>
      <SiteHeader signedIn={s} />
      <JsonLd data={jsonLd} />
      <main id="main" className="mx-auto max-w-6xl px-6 pb-24 pt-28">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Blog")}</p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-[44px]">{t("Akademik yazım rehberleri")}</h1>
        <p className="mt-3 max-w-2xl text-[17px] text-ink-500">{t("Tez, makale ve araştırma sürecinde en çok merak edilen soruların cevapları: adım adım, örneklerle ve sade bir dille.")}</p>
        <nav className="mt-6 flex flex-wrap gap-2" aria-label={t("Kategoriler")}>
          <Link href="/blog" className={`rounded-full border px-3.5 py-1.5 text-sm ${!kategori ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"}`}>{t("Tümü")} ({POSTS.length})</Link>
          {CATEGORIES.map((c) => <Link key={c} href={`/blog?kategori=${encodeURIComponent(c)}`} className={`rounded-full border px-3.5 py-1.5 text-sm ${kategori === c ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"}`}>{t(c)} ({POSTS.filter((p) => p.category === c).length})</Link>)}
        </nav>
        {/* D197: sıkı liste — üstte en yeni yazılar, altında kategori kategori satırlar (büyük kartlar yerine) */}
        {!kategori && (
          <section className="mt-10" aria-labelledby="latest">
            <h2 id="latest" className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">{t("En yeni yazılar")}</h2>
            <ol className="mt-3 grid gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 md:grid-cols-3">
              {latest.map(({ p, l }, i) => (
                <li key={p.slug} className="bg-white">
                  <Link href={postPath(p, locale)} className="group flex h-full flex-col p-5 transition hover:bg-brand-50/50">
                    <span className="flex items-center gap-2 text-[12px] text-ink-400"><span className="font-serif text-lg font-semibold text-brand-600">{String(i + 1).padStart(2, "0")}</span>{t(p.category)}</span>
                    <span className="mt-2 font-serif text-[18px] font-semibold leading-snug text-ink-950 group-hover:text-brand-700">{l.title}</span>
                    <span className="mt-auto pt-3 text-[12px] text-ink-400"><time dateTime={p.updated ?? p.date}>{fmtDate(p.updated ?? p.date)}</time> · {t("{n} dk okuma", { n: readingMinutes(l) })}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}
        <div className="mt-12 space-y-12">
          {groups.map(([cat, items]) => (
            <section key={cat} aria-labelledby={`c-${cat}`}>
              <div className="flex items-baseline justify-between gap-4 border-b border-ink-200 pb-2">
                <h2 id={`c-${cat}`} className="font-serif text-[22px] font-semibold tracking-tight text-ink-950">{t(cat)} <span className="font-sans text-sm font-normal text-ink-400">{t("{n} yazı", { n: items.length })}</span></h2>
                {!kategori && <Link href={`/blog?kategori=${encodeURIComponent(cat)}`} className="shrink-0 text-sm font-medium text-brand-700 hover:underline">{t("Tümünü gör")}</Link>}
              </div>
              <ul className="grid gap-x-10 md:grid-cols-2">
                {items.map(({ p, l }) => (
                  <li key={p.slug} className="border-b border-ink-100">
                    <Link href={postPath(p, locale)} className="group block py-4">
                      <span className="block text-[16.5px] font-semibold leading-snug text-ink-900 group-hover:text-brand-700">{l.title}</span>
                      <span className="mt-1 block line-clamp-2 text-[14px] leading-relaxed text-ink-500">{l.description}</span>
                      <span className="mt-1.5 block text-[12px] text-ink-400">{t("{n} dk okuma", { n: readingMinutes(l) })}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
