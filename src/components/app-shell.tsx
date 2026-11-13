"use client";
import { deviceId } from "@/lib/device-client";
import { LanguageSwitch, useT } from "@/i18n/client";
import { InstallApp } from "@/components/pwa";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Building2, ClipboardList, Gift, Lock, Compass, FolderOpen, Home, Library, LogOut, Menu, MessageSquarePlus, Plus, Settings2, ShieldCheck, UserRound, X, Rocket, Zap } from "lucide-react";
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

interface Props { children: React.ReactNode; user: { name: string; email: string; plan: string; isAdmin: boolean; isOrgAdmin?: boolean; orgName?: string | null; memberNo?: string }; limitReached?: boolean; readOnly?: boolean; expiresAt?: string | null }

const NAV = [
  { href: "/panel", label: "Kontrol paneli", icon: Home },
  { href: "/kaynaklar", label: "Kaynak araştırması", icon: Library },
  { href: "/dosyalar", label: "Dosyalarım", icon: FolderOpen },
  { href: "/anketler", label: "Anketlerim", icon: ClipboardList },
  { href: "/konu-bul", label: "Konu bulma", icon: Compass },
  { href: "/hesap", label: "Hesap ve abonelik", icon: UserRound },
];

export function AppShell({ children, user, limitReached, readOnly, expiresAt }: Props) {
  const { t } = useT();
  const path = usePathname();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
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

  // D148: sade kenar menüsü — üstte kullanıcı (açılır menü: ayarlar, dil, tema, çıkış), “Yeni” bağlantısı, düz menü satırları
  const initial = (user.name || user.email).slice(0, 1).toLocaleUpperCase("tr");
  const paid = user.plan !== "free";
  const Side = (
    <div className="flex h-full flex-col">
      <div className="relative flex items-center gap-2 px-3 pb-2 pt-4">
        <button onClick={() => setMenu((v) => !v)} className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-ink-100" aria-expanded={menu}>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[12.5px] font-semibold text-white">{initial}</span>
          <span className="truncate text-[14.5px] font-semibold text-ink-900">{user.name || user.email}</span>
        </button>
        <NotificationBell className="hidden lg:block" />
        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="absolute left-3 right-3 top-14 z-50 rounded-xl border border-ink-200/80 bg-white p-1.5 shadow-xl">
              <div className="px-2.5 pb-2 pt-1.5">
                <p className="truncate text-[13px] text-ink-500">{user.email}</p>
                <p className="text-[12px] capitalize text-ink-400">{t("{plan} paket", { plan: user.plan })}{user.memberNo ? <span className="normal-case"> · {user.memberNo}</span> : null}</p>
              </div>
              <Link href="/hesap" onClick={() => { setMenu(false); setOpen(false); }} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-ink-700 hover:bg-ink-50"><Settings2 className="h-4 w-4 text-ink-500" /> {t("Hesap ve abonelik")}</Link>
              <div className="flex items-center justify-between px-2.5 py-1.5"><LanguageSwitch /><ThemeToggle /></div>
              <div className="my-1 h-px bg-ink-100" />
              <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-ink-700 hover:bg-ink-50"><LogOut className="h-4 w-4 text-ink-500" /> {t("Çıkış yap")}</button>
            </div>
          </>
        )}
      </div>
      <div className="px-3">
        <Link href="/yeni" onClick={() => setOpen(false)} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] font-medium text-brand-600 transition hover:bg-brand-50">
          <Plus className="h-[18px] w-[18px] rounded-full border-[1.5px] border-current p-[1px]" /> {t("Yeni çalışma")}
        </Link>
        <nav className="space-y-px">
          {nav.map((n) => {
            const active = path === n.href || path.startsWith(`${n.href}/`);
            return (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] transition-colors", active ? "bg-ink-100 font-medium text-ink-900" : "text-ink-700 hover:bg-ink-50 hover:text-ink-900")}>
                <n.icon className="h-[18px] w-[18px] shrink-0 text-ink-500" strokeWidth={1.75} />
                <span className="truncate">{t(n.label)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-px px-3 pb-3">
        <InstallApp />
        <button onClick={() => { setOpen(false); window.dispatchEvent(new Event("academiana:gift")); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] text-ink-700 transition hover:bg-ink-50"><Gift className="h-[18px] w-[18px] text-ink-500" strokeWidth={1.75} /> {t("Davet et, kazan")}</button>
        <Link href="/yardim" onClick={() => setOpen(false)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] text-ink-700 transition hover:bg-ink-50"><BookOpen className="h-[18px] w-[18px] text-ink-500" strokeWidth={1.75} /> {t("Kullanım rehberi")}</Link>
        <button onClick={() => setFb(true)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[14.5px] text-ink-700 transition hover:bg-ink-50"><MessageSquarePlus className="h-[18px] w-[18px] text-ink-500" strokeWidth={1.75} /> {t("Geri bildirim")}</button>
        {user.plan !== "premium" && user.plan !== "single" && (
          <button onClick={() => { setOpen(false); openUpgrade({}); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-[14px] font-medium text-white transition hover:bg-brand-700"><Zap className="h-4 w-4" /> {paid ? t("Paketi yükselt") : t("Paketleri gör")}</button>
        )}
      </div>
    </div>
  );

  return (
    <div className="app-ui min-h-screen bg-[rgb(var(--bg))]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-ink-200/70 bg-white lg:block">{Side}</aside>
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
            <motion.aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden" initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 380, damping: 36 }}>
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
            // D155: sayfa/yapay zekâ hakkı dolunca salt okunur; yalnızca tarama hakkı dolduysa yalnızca tarama durur
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <span className="flex items-center gap-2"><Lock className="h-4 w-4 shrink-0" /> {readOnly
                ? <span>{t("Bu ayki kullanım hakkınız doldu. Çalışmalarınızı görüntüleyebilir ve indirebilirsiniz; diğer özellikler paketinizi yükseltene veya hakkınız yenilenene kadar kapalıdır.")} <Link href="/araclar" className="font-medium underline">{t("Ücretsiz araçlar açık")}</Link></span>
                : t("Bu ayki kaynak tarama hakkınız doldu. Diğer özellikleri kullanmaya devam edebilirsiniz.")}</span>
              <button type="button" onClick={() => openUpgrade({ code: readOnly ? "work_locked" : "limit_search" })} className="rounded-xl bg-ink-900 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-ink-800">{t("Seçenekleri gör")}</button>
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
