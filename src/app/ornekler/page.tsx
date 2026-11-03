import { getT } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/structured-data";
import { localizedPath } from "@/lib/seo";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SamplesView } from "@/components/samples/samples-view";
import { hasAuthCookie } from "@/lib/auth";

export async function generateMetadata() {
  return pageMeta("/ornekler");
}

/** Örnek çıktılar (D72): her hizmet için kurgusal bir çalışma üzerinden örnek */
export default async function Samples() {
  const [s, { t, locale }] = await Promise.all([hasAuthCookie(), getT()]);
  return (
    <>
      <SiteHeader signedIn={s} />
      <JsonLd data={[breadcrumbLd(locale, [{ name: t("Örnek çıktılar"), path: localizedPath("/ornekler", locale) }])]} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink-950">{t("Örnek çıktılar")}</h1>
          <p className="mt-4 text-ink-500">{t("Academiana ile neler elde edeceğinizi görün: kurgudan kaynakçaya, istatistik tablosundan savunma provasına kadar her hizmetin örneği.")}</p>
        </div>
        <SamplesView signedIn={s} />
      </main>
      <SiteFooter />
    </>
  );
}
