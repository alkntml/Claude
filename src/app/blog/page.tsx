import Link from "@/components/l-link";
import { getT } from "@/i18n/server";
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
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Blog", "@id": `${SITE_URL}/blog#blog`, name: `${SITE_NAME} Blog`, url: absoluteUrl(localizedPath("/blog", locale)), inLanguage: locale === "en" ? "en" : "tr-TR", publisher: { "@id": `${SITE_URL}/#organization` } },
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: all.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(postPath(x.p, locale)), name: x.l.title })) },
    breadcrumbLd(locale, [{ name: "Blog", path: localizedPath("/blog", locale) }]),
  ];
  return (
    <>
      <SiteHeader signedIn={s} />
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Blog")}</p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Akademik yazım rehberleri")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t("Tez, makale ve araştırma sürecinde en çok merak edilen soruların cevapları: adım adım, örneklerle ve sade bir dille.")}</p>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label={t("Kategoriler")}>
          <Link href="/blog" className={`rounded-full border px-3.5 py-1.5 text-sm ${!kategori ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"}`}>{t("Tümü")} ({POSTS.length})</Link>
          {CATEGORIES.map((c) => <Link key={c} href={`/blog?kategori=${encodeURIComponent(c)}`} className={`rounded-full border px-3.5 py-1.5 text-sm ${kategori === c ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"}`}>{t(c)} ({POSTS.filter((p) => p.category === c).length})</Link>)}
        </nav>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map(({ p, l }) => (
            <li key={p.slug}>
              <Link href={postPath(p, locale)} className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-soft">
                <span className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(p.category)}</span>
                <h2 className="mt-2 font-serif text-[21px] font-semibold leading-snug tracking-tight text-ink-950 group-hover:text-brand-700">{l.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-[14.5px] leading-relaxed text-ink-500">{l.description}</p>
                <span className="mt-4 text-xs text-ink-400">{t("{n} dk okuma", { n: readingMinutes(l) })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
