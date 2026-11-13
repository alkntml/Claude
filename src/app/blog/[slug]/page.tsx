import { dateLocale } from "@/i18n/core";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Link from "@/components/l-link";
import { notFound, permanentRedirect } from "next/navigation";
import { getLocale, getT } from "@/i18n/server";
import { BlogBody } from "@/components/blog/rich";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasAuthCookie } from "@/lib/auth";
import { DE_POSTS, EN_POSTS, findPost, localizePost, postLang, parseBody, plainText, POSTS, postPath, readingMinutes, relatedPosts } from "@/lib/blog";
import { absoluteUrl, localizedPath } from "@/lib/seo";
import { buildMeta, ogImage } from "@/lib/seo-server";
import { breadcrumbLd } from "@/lib/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return [...POSTS.map((p) => ({ slug: p.slug })), ...Object.values(EN_POSTS).map((e) => ({ slug: e.slug })), ...Object.values(DE_POSTS).map((e) => ({ slug: e.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findPost(slug);
  if (!found) return {};
  const locale = await getLocale();
  const tr = found.post, en = localizePost(tr, "en");
  const de = DE_POSTS[tr.slug] ? localizePost(tr, "de") : null;
  return buildMeta({
    path: postPath(tr, "tr"),
    paths: { tr: postPath(tr, "tr"), en: postPath(tr, "en"), ...(de ? { de: postPath(tr, "de") } : {}) },
    title: { tr: tr.seoTitle ?? tr.title, en: en.seoTitle ?? en.title, ...(de ? { de: de.seoTitle ?? de.title } : {}) },
    description: { tr: tr.description, en: en.description, ...(de ? { de: de.description } : {}) },
    keywords: { tr: tr.keywords, en: en.keywords, ...(de ? { de: de.keywords } : {}) },
    tagline: { tr: `Blog · ${tr.category}`, en: "Academiana Blog", de: "Academiana-Blog" },
    type: "article",
    publishedTime: tr.date,
    section: tr.category,
  }, locale);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = findPost(slug);
  if (!found) notFound();
  const [{ t, locale }, s] = await Promise.all([getT(), hasAuthCookie()]);
  // Adres ile dil uyuşmuyorsa (ör. /en/blog/<türkçe-adres>) doğru adrese kalıcı yönlendir
  if (found.lang !== postLang(found.post, locale)) permanentRedirect(postPath(found.post, locale));
  const p = localizePost(found.post, locale);
  const blocks = parseBody(p.body);
  const toc = blocks.map((b, i) => ({ b, i })).filter((x) => x.b.t === "h2") as { b: { t: "h2"; text: string }; i: number }[];
  const url = absoluteUrl(postPath(found.post, locale));
  const jsonLd = [
    {
      "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${url}#article`,
      headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date,
      inLanguage: locale === "en" ? "en" : locale === "de" ? "de-DE" : "tr-TR", keywords: p.keywords.join(", "), articleSection: t(p.category),
      wordCount: plainText(p.body).split(/\s+/).length, mainEntityOfPage: { "@type": "WebPage", "@id": url }, url,
      image: { "@type": "ImageObject", url: `${SITE_URL}${ogImage(p.title, locale === "en" ? "Academiana Blog" : `Blog · ${p.category}`, locale)}`, width: 1200, height: 630 },
      author: { "@type": "Organization", name: `${SITE_NAME}`, url: SITE_URL },
      publisher: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    },
    breadcrumbLd(locale, [{ name: "Blog", path: localizedPath("/blog", locale) }, { name: p.title, path: postPath(found.post, locale) }]),
  ];
  const related = relatedPosts(found.post).map((r) => ({ r, l: localizePost(r, locale) }));
  return (
    <>
      <SiteHeader signedIn={s} />
      <JsonLd data={jsonLd} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <nav aria-label={t("Konum")} className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
          <Link href="/" className="hover:text-ink-900">{SITE_NAME}</Link><span>/</span>
          <Link href="/blog" className="inline-flex items-center gap-1 hover:text-ink-900"><ArrowLeft className="h-3.5 w-3.5" /> {t("Blog")}</Link>
        </nav>
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0 max-w-[720px]">
            <Link href={`/blog?kategori=${encodeURIComponent(found.post.category)}`} className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t(p.category)}</Link>
            <h1 className="mt-3 font-serif text-[34px] font-semibold leading-[1.15] tracking-tight text-ink-950 sm:text-[44px]">{p.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">{p.description}</p>
            <p className="mt-4 flex flex-wrap items-center gap-3 border-b border-ink-100 pb-6 text-sm text-ink-400">
              <span>{t("{s} Editör Ekibi", { s: SITE_NAME })}</span><span>·</span>
              <time dateTime={p.date}>{new Date(p.date).toLocaleDateString(dateLocale(locale), { day: "numeric", month: "long", year: "numeric" })}</time><span>·</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("{n} dk okuma", { n: readingMinutes(p) })}</span>
            </p>
            <div className="mt-8"><BlogBody blocks={blocks} /></div>
            <div className="mt-12 rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 to-brand-200 p-7 text-brand-950 shadow-soft">
              <p className="font-serif text-2xl font-semibold leading-snug">{t("Bunu Academiana ile kolayca yapın")}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-brand-900/80">{p.cta.text}</p>
              <Link href={p.cta.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-950 px-5 py-2.5 text-sm font-semibold text-brand-50 hover:bg-brand-900">{p.cta.label} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {toc.length > 0 && (
                <nav aria-label={t("İçindekiler")}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{t("İçindekiler")}</p>
                  <ul className="mt-3 space-y-2 text-[13.5px]">{toc.map((x) => <li key={x.i}><a href={`#b${x.i}`} className="text-ink-600 hover:text-brand-700">{x.b.text}</a></li>)}</ul>
                </nav>
              )}
              <Link href="/kayit" className="block rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-[13.5px] text-ink-700 hover:bg-brand-50">
                <b className="block text-ink-900">{t("Ücretsiz deneyin")}</b>
                {t("Gerçek kaynaklarla çalışan akademik asistan. Kredi kartı gerekmez.")}
              </Link>
            </div>
          </aside>
        </div>
        <section className="mt-20">
          <h2 className="font-serif text-2xl font-semibold text-ink-950">{t("İlgili yazılar")}</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map(({ r, l }) => (
              <li key={r.slug}><Link href={postPath(r, locale)} className="card block h-full p-5 transition hover:-translate-y-0.5 hover:shadow-soft"><span className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(r.category)}</span><p className="mt-1.5 font-serif text-[17px] font-semibold leading-snug text-ink-950">{l.title}</p></Link></li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
