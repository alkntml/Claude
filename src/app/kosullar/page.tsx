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
        <p>Each plan has monthly fair-use limits, which are shown when you upgrade. When one of your monthly allowances (AI usage or source searches) runs out, only that feature stops until you upgrade or your allowance renews. Your work is never deleted or locked: you can always view, edit and download it in the formats your plan allows. Requests to access your personal data are answered free of charge within the legal period. Accounts found to be abusing the service may be suspended.</p>
        <h2>Usage records</h2>
        <p>Your plan allowance is used when the AI produces text for you. Deleting that text, a section or a whole work later does not restore the allowance. To resolve disputes about plan usage, a record of the AI outputs you received (date, work and section title, word count and the output text) and of deletions is kept for 12 months; it is visible only to authorised administrators and is deleted together with your account.</p>
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
      <p>Her paketin aylık adil kullanım sınırları vardır; sınırlar paket yükseltirken gösterilir. Aylık haklarınızdan biri (yapay zekâ kullanımı veya kaynak tarama) dolduğunda, paketinizi yükseltene veya hakkınız yenilenene kadar yalnızca o özellik durur. Çalışmalarınız silinmez ve kilitlenmez: onları her zaman görüntüleyebilir, düzenleyebilir ve paketinizin izin verdiği biçimlerde indirebilirsiniz. Kişisel verilerinize erişim talepleriniz yasal süre içinde ücretsiz olarak yanıtlanır. Kötüye kullanım tespit edilen hesaplar askıya alınabilir.</p>
      <h2>Kullanım kaydı</h2>
      <p>Paket hakkınız, yapay zekâ sizin için metin ürettiğinde kullanılmış olur. Üretilen metni, bir bölümü veya çalışmanın tamamını sonradan silmeniz kullanılan hakkı geri vermez. Paket kullanımına ilişkin anlaşmazlıkların çözümü için aldığınız yapay zekâ çıktılarının (tarih, çalışma ve bölüm adı, kelime sayısı ve çıktı metni) ve yaptığınız silmelerin kaydı 12 ay saklanır; yalnızca yetkili yöneticiler görebilir ve hesabınızla birlikte silinir.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
