import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/i18n/server";
import { JsonLd } from "./json-ld";
import { breadcrumbLd, webPageLd } from "@/lib/structured-data";
import { localizedPath } from "@/lib/seo";

export async function StaticPage({ title, lead, children, path, pageType }: { title: string; lead?: string; children: React.ReactNode; path?: string; pageType?: string }) {
  const [s, locale] = await Promise.all([getSession().catch(() => null), getLocale()]);
  const self = path ? localizedPath(path, locale) : null;
  return (
    <>
      <SiteHeader signedIn={!!s} />
      {self && <JsonLd data={[breadcrumbLd(locale, [{ name: title, path: self }]), webPageLd(locale, { path: self, name: title, description: lead ?? title, type: pageType })]} />}
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-36">
        <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{title}</h1>
        {lead && <p className="mt-4 text-lg text-ink-500">{lead}</p>}
        <div className="mt-10 space-y-5 text-[15.5px] leading-relaxed text-ink-700 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
