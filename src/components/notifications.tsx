"use client";
import { Bell, Gift, Info } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { cn } from "./ui/cn";

interface Note { id: number; kind: string; data: Record<string, number>; read_at: string | null; created_at: string }

/**
 * Bildirim kutusu (D100): zil simgesi + okunmamış sayısı; açılınca liste ve tümü okundu işaretlenir.
 * Metin `kind` + `data`’dan kullanıcının diline göre üretilir. Sayfa odaklanınca yenilenir.
 */
export function NotificationBell({ className, align = "left" }: { className?: string; align?: "left" | "right" }) {
  const { t, locale } = useT();
  const [items, setItems] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    api<{ items: Note[]; unread: number }>("/api/notifications").then((r) => { setItems(r.items); setUnread(r.unread); }).catch(() => {});
  }, []);
  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      api("/api/notifications", { method: "POST", json: { action: "read_all" } }).catch(() => {});
    }
  }

  const text = (n: Note): { title: string; body: string } => {
    if (n.kind === "referral_reward") return { title: t("Davet ödülü kazandınız"), body: t("Davet ettiğiniz bir kişi kaydoldu. Hesabınıza {a} yapay zekâ isteği ve {s} kaynak tarama hakkı tanımlandı ({d} gün geçerli).", { a: n.data.ai ?? 0, s: n.data.ss ?? 0, d: n.data.days ?? 60 }) };
    if (n.kind === "referral_same_device") return { title: t("Davet ödülü verilmedi"), body: t("Davet bağlantınızla açılan hesap, sizin daha önce kullandığınız bir cihazdan kaydolduğu için ödül tanımlanmadı. Davet ödülü yalnızca başka kişilerin kendi cihazlarından kaydolmasıyla kazanılır.") };
    if (n.kind === "referral_cap") return { title: t("Davetiniz kaydoldu"), body: t("Davet ettiğiniz bir kişi kaydoldu, ancak bu ayki davet ödülü sınırına ({n}) ulaştığınız için ödül tanımlanmadı. Sınır her ayın başında yenilenir.", { n: n.data.cap ?? 0 }) };
    return { title: t("Bildirim"), body: "" };
  };
  const when = (iso: string) => new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div ref={box} className={cn("relative", className)}>
      <button onClick={toggle} aria-label={t("Bildirimler")} title={t("Bildirimler")} aria-expanded={open} className="relative rounded-xl p-2 text-ink-500 transition hover:bg-ink-100 hover:text-ink-900">
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10.5px] font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className={cn("absolute top-11 z-50 w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-xl", align === "right" ? "right-0" : "left-0")}>
          <p className="border-b border-ink-100 px-4 py-3 text-sm font-semibold text-ink-900">{t("Bildirimler")}</p>
          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-6 text-center text-sm text-ink-400">{t("Henüz bildirim yok.")}</p>}
            {items.map((n) => {
              const x = text(n);
              const Icon = n.kind.startsWith("referral") ? Gift : Info;
              return (
                <div key={n.id} className={cn("flex gap-3 border-b border-ink-50 px-4 py-3 last:border-0", !n.read_at && "bg-brand-50/40")}>
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium text-ink-900">{x.title}</p>
                    {x.body && <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-600">{x.body}</p>}
                    <p className="mt-1 text-[11px] text-ink-400">{when(n.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
