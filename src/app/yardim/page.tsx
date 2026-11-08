import Link from "@/components/l-link";
import { GuideView } from "@/components/guide/guide-view";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getLocale, getT } from "@/i18n/server";
import { hasAuthCookie } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { GUIDE, guideArticleCount } from "@/lib/guide";
import { localizedPath } from "@/lib/seo";
import { pageMeta } from "@/lib/seo-server";
import { breadcrumbLd, webPageLd } from "@/lib/structured-data";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  return pageMeta("/yardim");
}
export const dynamic = "force-dynamic";

/** Kullanım rehberi (D142): içerik lib/guide.ts; yönetimden eklenen yardım makaleleri (help_articles) altta gösterilir */
export default async function Help() {
  const [{ t }, locale, signedIn] = await Promise.all([getT(), getLocale(), hasAuthCookie()]);
  let articles: { slug: string; title: string; body: string; category: string }[] = [];
  if (isSupabaseConfigured()) {
    const db = await createClient();
    const { data } = await db.from("help_articles").select("slug, title, body, category").eq("is_published", true).order("sort_order");
    articles = data ?? [];
  }
  const title = t("Kullanım rehberi");
  const lead = t("Academiana’yı ilk günden verimli kullanmanız için her özellik adım adım: nerede olduğu, nasıl kullanıldığı ve ipuçları.");
  const self = localizedPath("/yardim", locale);
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <JsonLd data={[breadcrumbLd(locale, [{ name: title, path: self }]), webPageLd(locale, { path: self, name: title, description: lead })]} />
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6">
        <p className="text-[13px] font-semibold uppercase tracking-wider text-brand-600">{t("Yardım merkezi")}</p>
        <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-500">{lead}</p>
        <p className="mt-3 text-[14px] text-ink-500">{t("{n} konu · {c} bölüm", { n: guideArticleCount(), c: GUIDE.length })} · <Link href="/sss" className="font-medium text-brand-700 hover:underline">{t("Sık sorulan sorular")} →</Link> · <Link href="/yontem" className="font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık")} →</Link></p>
        <div className="mt-10">
          <GuideView locale={locale === "en" ? "en" : "tr"} />
        </div>
        {articles.length > 0 && (
          <section className="mt-14 space-y-4">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink-900">{t("Ek yardım makaleleri")}</h2>
            {articles.map((a) => (
              <section key={a.slug} id={a.slug} className="card p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(a.category)}</p>
                <h3 className="mt-1 text-lg font-semibold text-ink-900">{t(a.title)}</h3>
                <p className="mt-2 whitespace-pre-line text-ink-600">{t(a.body)}</p>
              </section>
            ))}
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
