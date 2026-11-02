import Link from "next/link";
import { getT } from "@/i18n/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/auth";
import { CATEGORIES, POSTS, readingMinutes } from "@/lib/blog";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateMetadata() {
  const { t } = await getT();
  return {
    title: t("Blog: tez, makale ve akademik yazım rehberleri"),
    description: t("Tez nasıl yazılır, APA 7 atıf kuralları, literatür taraması, intihalden kaçınma, istatistik analiz seçimi, TÜBİTAK başvurusu ve daha fazlası."),
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const [{ t }, s, { kategori }] = await Promise.all([getT(), getSession().catch(() => null), searchParams]);
  const list = kategori ? POSTS.filter((p) => p.category === kategori) : POSTS;
  const jsonLd = { "@context": "https://schema.org", "@type": "Blog", name: `${SITE_NAME} Blog`, url: `${SITE_URL}/blog`, blogPost: POSTS.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${p.slug}`, datePublished: p.date })) };
  return (
    <>
      <SiteHeader signedIn={!!s} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Blog")}</p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Akademik yazım rehberleri")}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{t("Tez, makale ve araştırma sürecinde en çok merak edilen soruların cevapları: adım adım, örneklerle ve sade bir dille.")}</p>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label={t("Kategoriler")}>
          <Link href="/blog" className={`rounded-full border px-3.5 py-1.5 text-sm ${!kategori ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"}`}>{t("Tümü")} ({POSTS.length})</Link>
          {CATEGORIES.map((c) => <Link key={c} href={`/blog?kategori=${encodeURIComponent(c)}`} className={`rounded-full border px-3.5 py-1.5 text-sm ${kategori === c ? "border-ink-900 bg-ink-900 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300"}`}>{t(c)} ({POSTS.filter((p) => p.category === c).length})</Link>)}
        </nav>
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-soft">
                <span className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(p.category)}</span>
                <h2 className="mt-2 font-serif text-[21px] font-semibold leading-snug tracking-tight text-ink-950 group-hover:text-brand-700">{p.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-[14.5px] leading-relaxed text-ink-500">{p.description}</p>
                <span className="mt-4 text-xs text-ink-400">{t("{n} dk okuma", { n: readingMinutes(p) })}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
