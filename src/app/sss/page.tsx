import Link from "@/components/l-link";
import { pageMeta } from "@/lib/seo-server";
import { getT } from "@/i18n/server";
import { StaticPage } from "@/components/static-page";
import { FaqList } from "@/components/faq-list";
import { FAQ, faqGroupTitle, faqText } from "@/lib/faq";

export async function generateMetadata() {
  return pageMeta("/sss");
}

export default async function Faq() {
  const { t, locale } = await getT();
  const l = locale;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqText(l).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a.replace(/\*\*/g, "") } })),
  };
  return (
    <StaticPage path="/sss" title={t("Sık sorulan sorular")} lead={t("Aklınıza takılabilecek her şeyi açık ve dürüst biçimde cevapladık. Cevabını bulamadığınız bir soru olursa giriş yaptıktan sonra “Geri bildirim” bölümünden bize yazın.")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="flex flex-wrap gap-2">
        {FAQ.map((g) => <a key={g.id} href={`#g-${g.id}`} className="rounded-full border border-ink-200 px-3 py-1.5 text-sm text-ink-600 hover:border-brand-300 hover:text-brand-700">{faqGroupTitle(g, l)}</a>)}
      </nav>
      {FAQ.map((g) => (
        <section key={g.id} id={`g-${g.id}`} className="scroll-mt-28">
          <h2 className="mb-4">{faqGroupTitle(g, l)}</h2>
          <FaqList items={g.items} locale={l} />
        </section>
      ))}
      <p className="!mt-12 text-sm text-ink-500">
        {t("Daha fazlası için:")}{" "}
        <Link href="/akademik-durustluk" className="text-brand-700 hover:underline">{t("Akademik dürüstlük ilkeleri")}</Link>{" · "}
        <Link href="/kvkk" className="text-brand-700 hover:underline">{t("KVKK Aydınlatma Metni")}</Link>{" · "}
        <Link href="/cerez-politikasi" className="text-brand-700 hover:underline">{t("Çerez Politikası")}</Link>{" · "}
        <Link href="/kosullar" className="text-brand-700 hover:underline">{t("Kullanım koşulları")}</Link>
      </p>
    </StaticPage>
  );
}
