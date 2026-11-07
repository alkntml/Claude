"use client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { Menu, X } from "lucide-react";
import Link from "@/components/l-link";
import { useEffect, useState } from "react";
import { Logo } from "./icons";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "./ui/cn";

const NAV: { href: string; label: string; wide?: 1 | 2 }[] = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#nasil", label: "Nasıl çalışır", wide: 2 },
  { href: "/#kaynaklar", label: "Veri kaynakları", wide: 2 },
  { href: "/araclar", label: "Ücretsiz araçlar" },
  { href: "/ornekler", label: "Örnekler" },
  { href: "/fiyatlar", label: "Fiyatlar" },
  { href: "/kurumlar", label: "Kurumlar", wide: 2 },
  { href: "/blog", label: "Blog" },
  { href: "/sss", label: "SSS" },
  { href: "/hakkimizda", label: "Hakkımızda", wide: 1 },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const { t } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={cn("fixed inset-x-0 top-0 z-40", scrolled ? "py-2" : "py-4")}>
      <div className={cn("mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2 transition-colors duration-200 sm:px-5", scrolled ? "glass mx-3 sm:mx-auto" : "")}>
        <Link href="/" aria-label={t("Ana sayfa")} className="shrink-0"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("whitespace-nowrap rounded-lg px-2.5 py-2 text-sm text-ink-600 transition hover:bg-ink-100/70 hover:text-ink-900", n.wide === 1 && "hidden xl:block", n.wide === 2 && "hidden 2xl:block")}>{t(n.label)}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
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
        <div className="glass mx-3 mt-2 animate-rise rounded-2xl p-3 md:hidden">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-ink-700">{t(n.label)}</Link>)}
          <div className="flex items-center gap-2 px-3 py-2"><LanguageSwitch /><ThemeToggle label /></div>
          <Link href={signedIn ? "/panel" : "/kayit"} className="mt-2 block rounded-xl bg-brand-600 px-3 py-2.5 text-center font-medium text-white">{signedIn ? t("Çalışma alanım") : t("Ücretsiz başla")}</Link>
        </div>
      )}
    </header>
  );
}
