import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n/server";
import { BlogBody } from "@/components/blog/rich";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { getPost, parseBody, plainText, POSTS, readingMinutes, relatedPosts } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, url: `${SITE_URL}/blog/${p.slug}`, siteName: SITE_NAME, locale: "tr_TR", publishedTime: p.date },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const [{ t }, s] = await Promise.all([getT(), getSession().catch(() => null)]);
  const blocks = parseBody(p.body);
  const toc = blocks.map((b, i) => ({ b, i })).filter((x) => x.b.t === "h2") as { b: { t: "h2"; text: string }; i: number }[];
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, inLanguage: "tr-TR", keywords: p.keywords.join(", "), articleSection: p.category, wordCount: plainText(p.body).split(/\s+/).length, mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`, author: { "@type": "Organization", name: `${SITE_NAME} Editör Ekibi` }, publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` } } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: p.title, item: `${SITE_URL}/blog/${p.slug}` }] },
  ];
  const related = relatedPosts(p);
  return (
    <>
      <SiteHeader signedIn={!!s} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"><ArrowLeft className="h-4 w-4" /> {t("Bütün yazılar")}</Link>
        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0 max-w-[720px]">
            <Link href={`/blog?kategori=${encodeURIComponent(p.category)}`} className="text-xs font-semibold uppercase tracking-wider text-brand-600">{t(p.category)}</Link>
            <h1 className="mt-3 font-serif text-[34px] font-semibold leading-[1.15] tracking-tight text-ink-950 sm:text-[44px]">{p.title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">{p.description}</p>
            <p className="mt-4 flex items-center gap-3 border-b border-ink-100 pb-6 text-sm text-ink-400"><span>{t("{s} Editör Ekibi", { s: SITE_NAME })}</span><span>·</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {t("{n} dk okuma", { n: readingMinutes(p) })}</span></p>
            <div className="mt-8"><BlogBody blocks={blocks} /></div>
            <div className="mt-12 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 p-7 text-white shadow-glow">
              <p className="font-serif text-2xl font-semibold leading-snug">{t("Bunu Academiana ile kolayca yapın")}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-white/85">{p.cta.text}</p>
              <Link href={p.cta.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">{p.cta.label} <ArrowRight className="h-4 w-4" /></Link>
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
            {related.map((r) => (
              <li key={r.slug}><Link href={`/blog/${r.slug}`} className="card block h-full p-5 transition hover:-translate-y-0.5 hover:shadow-soft"><span className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(r.category)}</span><p className="mt-1.5 font-serif text-[17px] font-semibold leading-snug text-ink-950">{r.title}</p></Link></li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
