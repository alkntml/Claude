import { getT } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";
import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ToolCards } from "@/components/tools/tool-cards";
import { hasAuthCookie } from "@/lib/auth";
import { absoluteUrl, localizedPath } from "@/lib/seo";
import { TOOLS } from "@/lib/tools";
import { breadcrumbLd } from "@/lib/structured-data";
import NextLink from "next/link";
import { getPost, localizePost, postPath } from "@/lib/blog";

/** D164: araçları araştırma sürecinin adımlarına ve ilgili rehberlere bağlar (ince içerik + iç bağlantı) */
const STAGES: { title: string; text: string; tools: string[]; guides: string[] }[] = [
  { title: "Planlama ve veri toplama", text: "Çalışmaya başlamadan önce kaç katılımcıya ihtiyacınız olduğunu hesaplayın ve anket sorularınızı hazırlayın.", tools: ["/araclar/orneklem-hesaplayici", "/araclar/anket-olusturucu"], guides: ["orneklem-buyuklugu-nasil-hesaplanir", "anket-nasil-hazirlanir-likert-olcegi"] },
  { title: "Ölçek ve analiz", text: "Ölçek puanlarını kullanmadan önce güvenirliği kontrol edin; analiz seçimi ve raporlama için rehberlere göz atın.", tools: ["/araclar/cronbach-alfa"], guides: ["cronbach-alfa-nedir-nasil-yorumlanir", "normallik-testi-carpiklik-basiklik", "t-testi-nasil-yapilir-ve-yorumlanir"] },
  { title: "Literatür taraması", text: "Bir sorunun literatürde nasıl yanıtlandığını gerçek makalelerin özetleriyle görün; kaynakçanızdaki kaynakların gerçekten var olup olmadığını doğrulayın.", tools: ["/araclar/arastirmalar-ne-diyor", "/araclar/uydurma-kaynak-kontrolu"], guides: ["literatur-taramasi-nasil-yapilir", "yapay-zeka-uydurma-kaynak-tespiti"] },
  { title: "Kaynakça ve atıf", text: "DOI veya başlıktan künye oluşturun, hazır kaynakçanızı derginin istediği stile çevirin.", tools: ["/araclar/kaynakca-olusturucu", "/araclar/atif-donusturucu"], guides: ["apa-7-atif-kurallari", "isnad-atif-sistemi-rehberi", "kaynakca-nasil-hazirlanir"] },
];

export async function generateMetadata() {
  return pageMeta("/araclar");
}

/** Ücretsiz akademik araçlar (D90): giriş gerektirmez */
export default async function Tools() {
  const [signedIn, { t, locale }] = await Promise.all([hasAuthCookie(), getT()]);
  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <JsonLd data={[
        breadcrumbLd(locale, [{ name: t("Ücretsiz araçlar"), path: localizedPath("/araclar", locale) }]),
        // D107: araç listesi (arama motorları her aracı ayrı sayfa olarak tanısın)
        { "@context": "https://schema.org", "@type": "ItemList", name: t("Ücretsiz akademik araçlar"), itemListElement: TOOLS.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: t(x.title), url: absoluteUrl(localizedPath(x.path, locale)) })) },
      ]} />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-36">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="font-serif text-5xl font-medium tracking-tight text-ink-950">{t("Ücretsiz akademik araçlar")}</h1>
          <p className="mt-4 text-ink-500">{t("Üyelik gerekmez. Kaynakça hazırlayın, atıf stilini dönüştürün, örneklem ve güvenirlik hesaplayın, kaynaklarınızın gerçekten var olup olmadığını kontrol edin.")}</p>
        </div>
        <ToolCards />

        <section className="mx-auto mt-20 max-w-4xl" aria-labelledby="surec">
          <h2 id="surec" className="font-serif text-3xl font-medium tracking-tight text-ink-950">{t("Araştırmanın hangi adımında hangi araç?")}</h2>
          <p className="mt-3 text-ink-500">{t("Araçlar, bir tez veya makalenin farklı aşamalarındaki tekrar eden işler için tasarlandı. Her adımda ilgili aracı ve konuyu ayrıntılı anlatan rehberi bulabilirsiniz.")}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {STAGES.map((st) => (
              <div key={st.title} className="card p-6">
                <h3 className="font-semibold text-ink-950">{t(st.title)}</h3>
                <p className="mt-2 text-sm text-ink-500">{t(st.text)}</p>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {st.tools.map((path) => { const x = TOOLS.find((y) => y.path === path)!; return <li key={path}><NextLink href={localizedPath(path, locale)} className="font-medium text-brand-700 hover:underline">{t(x.title)}</NextLink></li>; })}
                </ul>
                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-ink-400">{t("Rehberler")}</p>
                <ul className="mt-1.5 space-y-1.5 text-sm">
                  {st.guides.map((slug) => { const p = getPost(slug)!; return <li key={slug}><NextLink href={postPath(p, locale)} className="text-ink-700 hover:text-brand-700 hover:underline">{localizePost(p, locale).title}</NextLink></li>; })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="nasil">
          <h2 id="nasil" className="font-serif text-2xl font-medium tracking-tight text-ink-950">{t("Araçlar nasıl çalışır?")}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-600">
            <li>{t("Kaynakça oluşturucu, atıf dönüştürücü, örneklem ve Cronbach alfa hesaplayıcı ile anket oluşturucu yapay zekâ kullanmaz; hesaplamalar tarayıcınızda yapılır.")}</li>
            <li>{t("Künye bilgileri yalnızca kayıt otoritelerinden (Crossref, DataCite, OpenAlex) alınır; araçlar kaynak, yazar veya DOI uydurmaz.")}</li>
            <li>{t("Yapay zekâ kullanan iki araç (“Araştırmalar ne diyor?” ve “Uydurma kaynak kontrolü”) bunu kartında açıkça belirtir.")}</li>
            <li>{t("Aynı hesaplamalar ve atıf stilleri, üye olduğunuzda tezinizin veya makalenizin içinde de kullanılabilir: atıflar metne kaynağa bağlı eklenir, kaynakça kendiliğinden oluşur.")}</li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
