import { getT } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolCards } from "@/components/tools/tool-cards";
import { hasAuthCookie } from "@/lib/auth";
import { localizedPath } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";

export async function generateMetadata() {
  return pageMeta("/araclar");
}

/** Ücretsiz akademik araçlar (D90): giriş gerektirmez */
export default async function Tools() {
  const [signedIn, { t, locale }] = await Promise.all([hasAuthCookie(), getT()]);
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <JsonLd data={[breadcrumbLd(locale, [{ name: t("Ücretsiz araçlar"), path: localizedPath("/araclar", locale) }])]} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink-950">{t("Ücretsiz akademik araçlar")}</h1>
          <p className="mt-4 text-ink-500">{t("Üyelik gerekmez. Kaynakça hazırlayın, atıf stilini dönüştürün, örneklem ve güvenirlik hesaplayın, kaynaklarınızın gerçekten var olup olmadığını kontrol edin.")}</p>
        </div>
        <ToolCards />
      </main>
      <SiteFooter />
    </>
  );
}
