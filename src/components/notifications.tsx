"use client";
import { Bell, Gift, Info, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { cn } from "./ui/cn";

interface Note { id: number; kind: string; data: Record<string, any>; read_at: string | null; created_at: string } // eslint-disable-line @typescript-eslint/no-explicit-any

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
    if (n.kind === "abuse_alert") {
      // Yöneticiye: Tek Proje paketinde kötüye kullanım şüphesi (D103)
      const d = n.data, who = d.email || t("Bir kullanıcı"), w = Number(d.words || 0).toLocaleString(locale === "en" ? "en-GB" : "tr-TR");
      const body: Record<string, string> = {
        second_project: t("{u} ikinci bir çalışma açmaya çalıştı (engellendi).", { u: who }),
        delete_project: t("{u} pakete bağlı çalışmasını silmeye çalıştı (engellendi).", { u: who }),
        worktype_change: t("{u} çalışma türünü değiştirmeye çalıştı (engellendi).", { u: who }),
        delete_after_export: t("{u} çalışmasını indirdikten sonra {w} kelime sildi. Bitirip yeni bir çalışmaya geçiyor olabilir.", { u: who, w }),
        mass_delete: t("{u} çalışmasından toplam {w} kelime sildi (ürettiğinin büyük kısmı).", { u: who, w }),
        topic_change: t("{u} çalışmanın başlığını veya konusunu tamamen değiştirdi: “{o}” → “{n}”.", { u: who, o: d.old_title || d.old_topic || "", n: d.project_title || d.new_topic || "" }),
        heavy_generation: t("{u} toplam {w} kelime yapay zekâ metni üretti (birden fazla tez büyüklüğünde).", { u: who, w }),
      };
      return { title: t("Kötüye kullanım uyarısı (Tek Proje)"), body: `${body[d.rule] ?? d.rule} ${t("Ayrıntı: Yönetim → Kullanıcılar → kullanıcı → Kullanım geçmişi.")}` };
    }
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
              const Icon = n.kind.startsWith("referral") ? Gift : n.kind === "abuse_alert" ? ShieldAlert : Info;
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
