"use client";
import { useT } from "@/i18n/client";
import Link from "@/components/l-link";
import { Logo } from "./icons";

// Sık aranan rehberler (iç bağlantı): [Türkçe adres, İngilizce adres, başlık]
const FOOTER_GUIDES: [string, string, string][] = [
  ["tez-nasil-yazilir", "how-to-write-a-thesis", "Tez nasıl yazılır?"],
  ["apa-7-atif-kurallari", "apa-7-citation-guide", "APA 7 atıf kuralları"],
  ["literatur-taramasi-nasil-yapilir", "how-to-write-a-literature-review", "Literatür taraması"],
  ["intihal-nasil-onlenir", "how-to-avoid-plagiarism", "İntihalden kaçınma"],
  ["tubitak-2209-a-basvurusu-nasil-hazirlanir", "tubitak-2209-a-research-project-application-guide", "TÜBİTAK 2209-A başvurusu"],
];

export function SiteFooter() {
  const { t, locale } = useT();
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo variant="full" className="!h-14" />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">{t("Akademik çalışmanızı gerçek ve doğrulanabilir kaynaklarla, şeffaf erişim seviyeleriyle ve bilimsel standartlara uygun biçimde hazırlayın.")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-800">{t("Platform")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link href="/hakkimizda" className="hover:text-ink-900">{t("Hakkımızda")}</Link></li>
            <li><Link href="/#ozellikler" className="hover:text-ink-900">{t("Özellikler")}</Link></li>
            <li><Link href="/araclar" className="hover:text-ink-900">{t("Ücretsiz araçlar")}</Link></li>
            <li><Link href="/ornekler" className="hover:text-ink-900">{t("Örnek çıktılar")}</Link></li>
            <li><Link href="/fiyatlar" className="hover:text-ink-900">{t("Fiyatlar")}</Link></li>
            <li><Link href="/blog" className="hover:text-ink-900">{t("Blog")}</Link></li>
            <li><Link href="/sss" className="hover:text-ink-900">{t("Sık sorulan sorular")}</Link></li>
            <li><Link href="/yardim" className="hover:text-ink-900">{t("Yardım merkezi")}</Link></li>
            <li><Link href="/kurumlar" className="hover:text-ink-900">{t("Kurumlar için")}</Link></li>
            <li><Link href="/uzman-destegi" className="hover:text-ink-900">{t("Uzman desteği")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-800">{t("Rehberler")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            {FOOTER_GUIDES.map(([slug, en, label]) => <li key={slug}><Link href={locale === "en" ? `/en/blog/${en}` : `/blog/${slug}`} className="hover:text-ink-900">{t(label)}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-800">{t("Yasal")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link href="/gizlilik" className="hover:text-ink-900">{t("Gizlilik ve KVKK")}</Link></li>
            <li><Link href="/kosullar" className="hover:text-ink-900">{t("Kullanım koşulları")}</Link></li>
            <li><Link href="/akademik-durustluk" className="hover:text-ink-900">{t("Akademik dürüstlük ilkeleri")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">© {new Date().getFullYear()} Academiana. {t("Platform akademik çalışmanızı destekler; yazarlık ve bilimsel sorumluluk size aittir.")}</div>
    </footer>
  );
}
