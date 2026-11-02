import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo-server";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return pageMeta("/kosullar");
}

export default async function Page() {
  if ((await getLocale()) === "en") {
    return (
      <StaticPage path="/kosullar" title="Terms of use" lead="Template text: must be reviewed by a lawyer before publication.">
        <h2>Nature of the service</h2>
        <p>Academiana is a tool that helps you plan, research, write and format academic work. You remain responsible for the scientific accuracy and originality of the content and for compliance with your institution&apos;s rules.</p>
        <h2>Academic integrity</h2>
        <p>You agree to use the platform in line with your institution&apos;s AI policies and to disclose AI use where required.</p>
        <h2>Usage limits</h2>
        <p>Each plan&apos;s monthly limits are shown on your account page. Accounts found to be abusing the service may be suspended.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/kosullar" title="Kullanım koşulları" lead="Şablon metin: yayına almadan önce hukuki inceleme yapılmalıdır.">
      <h2>Hizmetin niteliği</h2>
      <p>Academiana, akademik çalışmaların planlanması, kaynak bulunması, yazımı ve biçimlendirilmesi için yardımcı bir araçtır. Üretilen içeriğin bilimsel doğruluğu, özgünlüğü ve kurumunuzun kurallarına uygunluğu konusunda nihai sorumluluk kullanıcıya aittir.</p>
      <h2>Akademik dürüstlük</h2>
      <p>Platformu kurumunuzun yapay zekâ kullanım politikalarına uygun biçimde kullanmayı ve gerektiğinde yapay zekâ kullanımını beyan etmeyi kabul edersiniz.</p>
      <h2>Kullanım limitleri</h2>
      <p>Her paketin aylık limitleri hesap sayfanızda gösterilir. Kötüye kullanım tespit edilen hesaplar askıya alınabilir.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
