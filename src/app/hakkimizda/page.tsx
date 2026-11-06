import Link from "@/components/l-link";
import { JsonLd } from "@/components/json-ld";
import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";
import { env } from "@/lib/env";
import { FOUNDER, founderLd } from "@/lib/structured-data";
import { WHATSAPP_NUMBER } from "@/lib/pricing";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/hakkimizda");
}

/** +905425266650 → +90 542 526 66 50 */
const phone = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5, 8)} ${WHATSAPP_NUMBER.slice(8, 10)} ${WHATSAPP_NUMBER.slice(10)}`;

/** Hakkımızda (D108): neden kurulduk, misyon, vizyon, değerler, kurucu. Yalnızca doğrulanabilir bilgi; sayı/kullanıcı iddiası yok. */
export default async function AboutPage() {
  const en = (await getLocale()) === "en";
  const email = env.contactEmail;
  if (en) {
    return (
      <StaticPage path="/hakkimizda" pageType="AboutPage" title="About Academiana" lead="Academiana exists so that students and researchers can write with real sources, follow their own academic rules and stay honest about how they use AI.">
        <JsonLd data={[founderLd("en")]} />
        <h2>Why we exist</h2>
        <p>General-purpose AI tools can produce references that look convincing but do not exist. International writing tools do not know Turkish academic conventions such as ISNAD citations, graduate school formatting guides or TÜBİTAK application formats. Under time pressure, some students turn to paid thesis-writing services, which puts both their degree and their learning at risk.</p>
        <p>Academiana was built to fill this gap honestly: a writing partner that works only with real sources, shows clearly how much of each source it has read and leaves authorship with you.</p>
        <h2>Our mission</h2>
        <p>To help graduate students and researchers produce their own work, step by step, with real and verifiable academic sources, in line with the academic rules they are expected to follow and with responsible use of AI.</p>
        <h2>Our vision</h2>
        <p>To become the reference platform for trustworthy, transparent and honest use of AI in academic writing, first in Turkey and then for researchers everywhere, so that AI makes academic work faster without making it less reliable.</p>
        <h2>Our values</h2>
        <ul>
          <li><strong>No fabrication.</strong> The AI never invents sources, authors, DOIs, data or findings. Where a source is missing it writes [SOURCE NEEDED].</li>
          <li><strong>Transparency.</strong> Every source shows whether its record, abstract or full text was read.</li>
          <li><strong>You are the author.</strong> The platform supports your thinking and writing; it does not replace them.</li>
          <li><strong>Privacy.</strong> Your work is visible only to you and the people you share it with, and is never used to train AI models.</li>
        </ul>
        <p>You can read how these principles work in practice on our <Link href="/akademik-durustluk" className="font-medium text-brand-700 hover:underline">academic integrity</Link> page and see real examples on the <Link href="/ornekler" className="font-medium text-brand-700 hover:underline">sample outputs</Link> page.</p>
        <h2>Founder</h2>
        <p>Academiana was founded and is led by <strong>{FOUNDER.name}</strong>, Founder and CEO.</p>
        <h2>Contact</h2>
        <p>WhatsApp: <span className="select-all font-medium text-ink-900">{phone}</span>{email ? <> · Email: <span className="select-all font-medium text-ink-900">{email}</span></> : null}</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/hakkimizda" pageType="AboutPage" title="Hakkımızda" lead="Academiana, öğrencilerin ve araştırmacıların gerçek kaynaklarla, kendi akademik kurallarına uygun ve yapay zekâyı dürüstçe kullanarak yazabilmesi için kuruldu.">
      <JsonLd data={[founderLd("tr")]} />
      <h2>Neden varız?</h2>
      <p>Genel amaçlı yapay zekâ araçları, gerçekte var olmayan ama inandırıcı görünen kaynaklar üretebiliyor. Uluslararası yazım araçları ise ISNAD atıf sistemini, enstitü yazım kılavuzlarını veya TÜBİTAK başvuru biçimlerini tanımıyor. Zaman baskısı altındaki bazı öğrenciler de ücret karşılığı tez yazdırma hizmetlerine yöneliyor; bu hem diplomalarını hem de öğrenmelerini riske atıyor.</p>
      <p>Academiana bu boşluğu dürüst bir yolla doldurmak için geliştirildi: yalnızca gerçek kaynaklarla çalışan, her kaynağın ne kadarının okunduğunu açıkça gösteren ve yazarlığı size bırakan bir yazım yardımcısı.</p>
      <h2>Misyonumuz</h2>
      <p>Lisansüstü öğrencilerin ve araştırmacıların kendi çalışmalarını; gerçek ve doğrulanabilir akademik kaynaklarla, uymaları gereken akademik kurallara uygun biçimde ve yapay zekâyı sorumlu kullanarak adım adım ortaya koymalarına yardım etmek.</p>
      <h2>Vizyonumuz</h2>
      <p>Akademik yazımda yapay zekânın güvenilir, şeffaf ve dürüst kullanımının önce Türkiye’de, ardından dünyada başvurulan platformu olmak; yapay zekânın akademik çalışmayı hızlandırırken güvenilirliğinden ödün verdirmediği bir yazım kültürüne katkı sağlamak.</p>
      <h2>Değerlerimiz</h2>
      <ul>
        <li><strong>Uydurma yok.</strong> Yapay zekâ kaynak, yazar, DOI, veri veya bulgu uydurmaz. Kaynak yoksa [KAYNAK GEREKLİ] yazar.</li>
        <li><strong>Şeffaflık.</strong> Her kaynak için künyenin mi, özetin mi, tam metnin mi okunduğu gösterilir.</li>
        <li><strong>Yazar sizsiniz.</strong> Platform düşünmenizi ve yazmanızı destekler; onların yerine geçmez.</li>
        <li><strong>Gizlilik.</strong> Çalışmanızı yalnızca siz ve paylaştığınız kişiler görür; çalışmalarınız yapay zekâ modellerini eğitmek için kullanılmaz.</li>
      </ul>
      <p>Bu ilkelerin uygulamada nasıl işlediğini <Link href="/akademik-durustluk" className="font-medium text-brand-700 hover:underline">akademik dürüstlük ilkelerimiz</Link> sayfasında okuyabilir, gerçek örnekleri <Link href="/ornekler" className="font-medium text-brand-700 hover:underline">örnek çıktılar</Link> sayfasında görebilirsiniz.</p>
      <h2>Kurucu</h2>
      <p>Academiana, Kurucu ve CEO <strong>{FOUNDER.name}</strong> tarafından kurulmuştur ve yönetilmektedir.</p>
      <h2>İletişim</h2>
      <p>WhatsApp: <span className="select-all font-medium text-ink-900">{phone}</span>{email ? <> · E-posta: <span className="select-all font-medium text-ink-900">{email}</span></> : null}</p>
    </StaticPage>
  );
}
