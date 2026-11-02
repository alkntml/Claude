import Link from "@/components/l-link";
import { getT } from "@/i18n/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** 404: ziyaretçiyi (ve tarayıcıları) önemli sayfalara yönlendirir */
export default async function NotFound() {
  const { t } = await getT();
  const links: [string, string][] = [["/", "Ana sayfa"], ["/blog", "Blog"], ["/fiyatlar", "Fiyatlar"], ["/sss", "Sık sorulan sorular"]];
  return (
    <>
      <SiteHeader signedIn={false} />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 pb-24 pt-36 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">404</p>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Aradığınız sayfa bulunamadı")}</h1>
        <p className="mt-4 text-ink-500">{t("Sayfa taşınmış veya kaldırılmış olabilir. Aşağıdaki bağlantılardan devam edebilirsiniz.")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {links.map(([href, label]) => <Link key={href} href={href} className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-ink-300">{t(label)}</Link>)}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
