"use client";
import { useT } from "@/i18n/client";
import Link from "next/link";
import { Logo } from "./icons";

export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-500">{t("Akademik çalışmanızı gerçek ve doğrulanabilir kaynaklarla, şeffaf erişim seviyeleriyle ve bilimsel standartlara uygun biçimde hazırlayın.")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-800">{t("Platform")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link href="/#ozellikler" className="hover:text-ink-900">{t("Özellikler")}</Link></li>
            <li><Link href="/fiyatlar" className="hover:text-ink-900">{t("Fiyatlar")}</Link></li>
            <li><Link href="/sss" className="hover:text-ink-900">{t("Sık sorulan sorular")}</Link></li>
            <li><Link href="/yardim" className="hover:text-ink-900">{t("Yardım merkezi")}</Link></li>
            <li><Link href="/kurumlar" className="hover:text-ink-900">{t("Kurumlar için")}</Link></li>
            <li><Link href="/uzman-destegi" className="hover:text-ink-900">{t("Uzman desteği")}</Link></li>
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
