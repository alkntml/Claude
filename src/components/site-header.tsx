"use client";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "./icons";
import { cn } from "./ui/cn";

const NAV = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#nasil", label: "Nasıl çalışır" },
  { href: "/#kaynaklar", label: "Veri kaynakları" },
  { href: "/fiyatlar", label: "Fiyatlar" },
  { href: "/yardim", label: "Yardım" },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 12));
  return (
    <motion.header className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-300", scrolled ? "py-2" : "py-4")}>
      <div className={cn("mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2 transition-all duration-300 sm:px-5", scrolled ? "glass mx-3 sm:mx-auto" : "")}>
        <Link href="/" aria-label="Ana sayfa"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-100/70 hover:text-ink-900">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {signedIn ? (
            <Link href="/panel" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-ink-900/20 transition hover:-translate-y-px hover:bg-ink-800">Çalışma alanım</Link>
          ) : (
            <>
              <Link href="/giris" className="rounded-xl px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:bg-ink-100/70">Giriş yap</Link>
              <Link href="/kayit" className="rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2 text-sm font-medium text-white shadow-[0_8px_20px_-8px_rgb(39_71_220/0.65)] transition hover:-translate-y-px">Ücretsiz başla</Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menü">{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass mx-3 mt-2 rounded-2xl p-3 md:hidden">
          {NAV.map((n) => <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-ink-700">{n.label}</Link>)}
          <Link href={signedIn ? "/panel" : "/kayit"} className="mt-2 block rounded-xl bg-brand-600 px-3 py-2.5 text-center font-medium text-white">{signedIn ? "Çalışma alanım" : "Ücretsiz başla"}</Link>
        </motion.div>
      )}
    </motion.header>
  );
}
