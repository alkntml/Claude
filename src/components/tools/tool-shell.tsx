import { getT } from "@/i18n/server";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import Link from "@/components/l-link";
import { hasAuthCookie } from "@/lib/auth";
import { localizedPath } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { toolByPath } from "@/lib/tools";
import { ToolCards } from "./tool-cards";

/** Ücretsiz araç sayfası iskeleti: başlık, açıklama, araç, diğer araçlar (D90) */
export async function ToolShell({ path, intro, children, faq }: { path: string; intro: string; children: React.ReactNode; faq?: { q: string; a: string }[] }) {
  const [signedIn, { t, locale }] = await Promise.all([hasAuthCookie(), getT()]);
  const tool = toolByPath(path)!;
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <JsonLd data={[breadcrumbLd(locale, [{ name: t("Ücretsiz araçlar"), path: localizedPath("/araclar", locale) }, { name: t(tool.title), path: localizedPath(path, locale) }])]} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <nav className="mb-4 text-sm text-ink-500"><Link href="/araclar" className="hover:text-ink-800">{t("Ücretsiz araçlar")}</Link> / <span className="text-ink-800">{t(tool.title)}</span></nav>
        <header className="mb-8 max-w-3xl">
          <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t(tool.title)}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-600">{t(intro)}</p>
          <p className="mt-3 inline-flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">{t("Ücretsiz · üyelik gerekmez")}</span>
            <span className="rounded-full bg-ink-100 px-2.5 py-1 font-medium text-ink-600">{tool.ai ? t("Yalnızca okunamayan satırlar için küçük bir yapay zekâ modeli kullanılır") : t("Yapay zekâ kullanılmaz")}</span>
          </p>
        </header>
        {children}
        {faq && faq.length > 0 && (
          <section className="mt-14 max-w-3xl">
            <h2 className="mb-4 font-serif text-2xl font-medium text-ink-950">{t("Sık sorulanlar")}</h2>
            <div className="space-y-4">{faq.map((f) => <div key={f.q}><p className="font-semibold text-ink-900">{t(f.q)}</p><p className="mt-1 text-[15px] leading-relaxed text-ink-600">{t(f.a)}</p></div>)}</div>
          </section>
        )}
        <section className="mt-16">
          <h2 className="mb-5 font-serif text-2xl font-medium text-ink-950">{t("Diğer ücretsiz araçlar")}</h2>
          <ToolCards exclude={tool.id} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
