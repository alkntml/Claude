"use client";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LanguageSwitch, useT } from "@/i18n/client";
import { Menu, X } from "lucide-react";
import Link from "@/components/l-link";
import { useState } from "react";
import { Logo } from "./icons";
import { cn } from "./ui/cn";

const NAV: { href: string; label: string; wide?: 1 | 2 }[] = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#nasil", label: "Nasıl çalışır", wide: 2 },
  { href: "/#kaynaklar", label: "Veri kaynakları", wide: 2 },
  { href: "/fiyatlar", label: "Fiyatlar" },
  { href: "/kurumlar", label: "Kurumlar", wide: 1 },
  { href: "/uzman-destegi", label: "Uzman desteği" },
  { href: "/blog", label: "Blog" },
  { href: "/sss", label: "SSS" },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const { t } = useT();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));
  return (
    <motion.header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-300", scrolled ? "py-2" : "py-4")}>
      <div className={cn("mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2 transition-all duration-300 sm:px-5", scrolled ? "glass mx-3 sm:mx-auto" : "")}>
        <Link href="/" aria-label={t("Ana sayfa")} className="shrink-0"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("whitespace-nowrap rounded-lg px-2.5 py-2 text-sm text-ink-600 transition hover:bg-ink-100/70 hover:text-ink-900", n.wide === 1 && "hidden xl:block", n.wide === 2 && "hidden 2xl:block")}>{t(n.label)}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitch />
          {signedIn ? (
            <Link href="/panel" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-ink-900/20 transition hover:-translate-y-px hover:bg-ink-800">{t("Çalışma alanım")}</Link>
          ) : (
            <>
              <Link href="/giris" className="whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100/70">{t("Giriş yap")}</Link>
              <Link href="/kayit" className="whitespace-nowrap rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgb(39_71_220/0.65)] transition hover:-translate-y-px">{t("Ücretsiz başla")}</Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label={t("Menü")}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass mx-3 mt-2 rounded-2xl p-3 md:hidden">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-ink-700">{t(n.label)}</Link>)}
          <div className="px-3 py-2"><LanguageSwitch /></div>
          <Link href={signedIn ? "/panel" : "/kayit"} className="mt-2 block rounded-xl bg-brand-600 px-3 py-2.5 text-center font-medium text-white">{signedIn ? t("Çalışma alanım") : t("Ücretsiz başla")}</Link>
        </motion.div>
      )}
    </motion.header>
  );
}
