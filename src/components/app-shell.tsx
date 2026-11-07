"use client";
import { deviceId } from "@/lib/device-client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { InstallApp } from "@/components/pwa";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ClipboardList, Gift, Lock, Compass, ExternalLink, FolderOpen, GraduationCap, Home, Library, LogOut, Menu, MessageSquarePlus, Plus, Settings2, ShieldCheck, UserRound, X, Rocket } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./icons";
import { Button } from "./ui/button";
import { cn } from "./ui/cn";
import { Modal } from "./ui/primitives";
import { useToast } from "./ui/toast";
import { api, openUpgrade } from "@/lib/client";
import { createBrowser } from "@/lib/supabase/browser";
import { GiftBox } from "@/components/gift-box";
import { NotificationBell } from "@/components/notifications";
import { deviceHash } from "@/lib/device-client";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props { children: React.ReactNode; user: { name: string; email: string; plan: string; isAdmin: boolean; isOrgAdmin?: boolean; orgName?: string | null; memberNo?: string }; limitReached?: boolean; expiresAt?: string | null }

const NAV = [
  { href: "/panel", label: "Kontrol paneli", icon: Home },
  { href: "/kaynaklar", label: "Kaynak araştırması", icon: Library },
  { href: "/dosyalar", label: "Dosyalarım", icon: FolderOpen },
  { href: "/anketler", label: "Anketlerim", icon: ClipboardList },
  { href: "/konu-bul", label: "Konu bulma", icon: Compass },
  { href: "/hesap", label: "Hesap ve abonelik", icon: UserRound },
];

export function AppShell({ children, user, limitReached, expiresAt }: Props) {
  const { t } = useT();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [fb, setFb] = useState(false);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const nav = [...NAV, ...(user.isOrgAdmin ? [{ href: "/kurum", label: "Kurumum", icon: Building2 }] : []), ...(user.isAdmin ? [{ href: "/yonetim", label: "Yönetim", icon: ShieldCheck }, { href: "/yonetim?sekme=otomatik", label: "Otomatik çalışma", icon: Rocket }] : [])];

  async function logout() {
    await createBrowser().auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function sendFeedback() {
    setSending(true);
    try {
      await api("/api/feedback", { method: "POST", json: { message: msg, page: path } });
      toast({ tone: "success", title: t("Geri bildiriminiz alındı"), detail: t("Teşekkür ederiz!") });
      setFb(false);
      setMsg("");
    } catch (e) {
      toast({ tone: "error", title: t("Gönderilemedi"), detail: t((e as Error).message) });
    } finally {
      setSending(false);
    }
  }

  // Davet ödülü kötüye kullanım önlemi (D101): kullanıcının cihazı günde bir kez kaydedilir
  // D101/D109: her cihazda kimlik çerezi oluşsun (sunucu yalnızca özetini görür)
  useEffect(() => { deviceId(); }, []);
  useEffect(() => {
    let last = "";
    try { last = localStorage.getItem("acd_dev_sent") ?? ""; } catch { /* yok say */ }
    const today = new Date().toISOString().slice(0, 10);
    if (last === today) return;
    deviceHash().then((d) => d && api("/api/account/device", { method: "POST", json: { d } })).then(() => { try { localStorage.setItem("acd_dev_sent", today); } catch { /* yok say */ } }).catch(() => {});
  }, []);

  const Side = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-6 pt-6"><Link href="/panel"><Logo /></Link><NotificationBell className="hidden lg:block" /></div>
      <div className="px-3">
        <Link href="/yeni" className="group mb-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_-10px_rgb(39_71_220/0.8)] transition hover:-translate-y-px">
          <Plus className="h-4 w-4 transition group-hover:rotate-90" /> {t("Yeni çalışma")}
        </Link>
        <nav className="space-y-0.5">
          {nav.map((n) => {
            const active = path === n.href || path.startsWith(`${n.href}/`);
            return (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "text-ink-900" : "text-ink-500 hover:text-ink-900")}>
                {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-white shadow-sm ring-1 ring-ink-100" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <n.icon className="relative h-[18px] w-[18px]" />
                <span className="relative">{t(n.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-2 p-3">
        <div className="flex items-center justify-between px-3"><LanguageSwitch /><ThemeToggle /></div>
        <InstallApp />
        <button onClick={() => { setOpen(false); window.dispatchEvent(new Event("academiana:gift")); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-fuchsia-700 transition hover:bg-white"><Gift className="h-[18px] w-[18px]" /> {t("Davet et, kazan")}</button>
        <button onClick={() => setFb(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-500 transition hover:bg-white hover:text-ink-900"><MessageSquarePlus className="h-[18px] w-[18px]" /> {t("Geri bildirim")}</button>
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 text-sm font-semibold text-white">{(user.name || user.email).slice(0, 1).toLocaleUpperCase("tr")}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{user.name || user.email}</p>
            <p className="text-xs capitalize text-ink-400">{t("{plan} paket", { plan: user.plan })}{user.memberNo ? <span className="normal-case"> · {user.memberNo}</span> : null}</p>
          </div>
          <Link href="/hesap" className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={t("Ayarlar")}><Settings2 className="h-4 w-4" /></Link>
          <button onClick={logout} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700" aria-label={t("Çıkış yap")}><LogOut className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-100 bg-ink-50/50 lg:block">{Side}</aside>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-white/95 px-4 py-3 lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <NotificationBell align="right" />
          <button onClick={() => setOpen(true)} aria-label={t("Menü")} className="rounded-lg p-2"><Menu /></button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-ink-950/30 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 bg-ink-50 shadow-2xl lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-lg p-1.5" aria-label={t("Kapat")}><X className="h-5 w-5" /></button>
              {Side}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <GiftBox />
      <main className="lg:pl-64">
        <motion.div key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
          {!limitReached && expiresAt && (() => {
            // Paket süresi (D53): son 3 gün uyarısı
            const left = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400_000);
            if (left > 3 || left < 0) return null;
            return (
              <Link href="/hesap" className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100">
                <span>{left === 0 ? t("Paketiniz bugün sona eriyor.") : t("Paketinizin bitmesine {n} gün kaldı.", { n: left })}</span><b>{t("Süreyi uzat")}</b>
              </Link>
            );
          })()}
          {limitReached && (
            // D81: aylık hak dolunca çalışma kilitlenmez; yalnızca yapay zekâ ve kaynak tarama durur
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> {t("Bu ayki yapay zekâ hakkınız doldu. Çalışmalarınızı görüntülemeye, düzenlemeye ve indirmeye devam edebilirsiniz.")}</span>
              <button type="button" onClick={() => openUpgrade({ code: "limit_ai" })} className="rounded-xl bg-ink-900 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-ink-800">{t("Seçenekleri gör")}</button>
            </div>
          )}
          {children}
        </motion.div>
      </main>
      <Modal open={fb} onClose={() => setFb(false)} title={t("Geri bildirim gönder")} footer={<><Button variant="ghost" onClick={() => setFb(false)}>{t("Vazgeç")}</Button><Button onClick={sendFeedback} loading={sending} disabled={msg.trim().length < 3}>{t("Gönder")}</Button></>}>
        <textarea className="input min-h-[140px]" placeholder={t("Önerinizi, karşılaştığınız sorunu veya eksik gördüğünüz özelliği yazın…")} value={msg} onChange={(e) => setMsg(e.target.value)} />
      </Modal>
    </div>
  );
}
