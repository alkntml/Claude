"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Gift, MessageCircle, Share2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface Referral { code: string; link: string; invited: number; rewarded: number; reward: { ai_requests: number; source_searches: number; valid_days: number } }

const SEEN_KEY = "academiana-gift-seen";
const PEEK_KEY = "academiana-gift-peek";

function readSeen(): { rewarded: number } | null {
  try { const v = localStorage.getItem(SEEN_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
}

/**
 * “Arkadaşını davet et, kazan” hediye kutusu (D54): sağ altta sabit hediye simgesi.
 * Görülmediyse veya yeni ödül kazanıldıysa kırmızı bildirim noktası ve hafif sallanma; ilk ziyarette kısa bir baloncuk.
 */
export function GiftBox() {
  const { t } = useT();
  const toast = useToast();
  const [ref, setRef] = useState<Referral | null>(null);
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState(false);
  const [peek, setPeek] = useState(false);

  useEffect(() => {
    api<{ referral: Referral | null }>("/api/account/growth").then((g) => {
      if (!g.referral) return;
      setRef(g.referral);
      const seen = readSeen();
      // Hiç açılmadıysa veya son açılıştan sonra yeni ödül kazanıldıysa bildirim
      setBadge(!seen || g.referral.rewarded > seen.rewarded);
      try {
        if (!localStorage.getItem(PEEK_KEY)) { setTimeout(() => setPeek(true), 2500); localStorage.setItem(PEEK_KEY, "1"); }
      } catch { /* gizli pencere */ }
    }).catch(() => {});
  }, []);

  const openBox = useCallback(() => {
    setOpen(true); setPeek(false); setBadge(false);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify({ rewarded: ref?.rewarded ?? 0 })); } catch { /* yok say */ }
  }, [ref]);

  useEffect(() => { if (!peek) return; const id = setTimeout(() => setPeek(false), 7000); return () => clearTimeout(id); }, [peek]);
  // Kenar çubuğundaki “Davet et, kazan” bağlantısı da kutuyu açar
  useEffect(() => { const fn = () => openBox(); window.addEventListener("academiana:gift", fn); return () => window.removeEventListener("academiana:gift", fn); }, [openBox]);

  if (!ref) return null;
  const message = t("Tez ve makale yazarken gerçek kaynaklarla çalışan bir akademik asistan kullanıyorum. Bu bağlantıyla kaydolursan ikimize de ek kullanım hakkı tanımlanıyor:");
  const share = () => {
    if (navigator.share) navigator.share({ title: "Academiana", text: message, url: ref.link }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${message} ${ref.link}`)}`, "_blank", "noopener");
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 print:hidden">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.96 }} className="w-[min(92vw,360px)] overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-2xl">
            <div className="relative bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-500 p-5 text-white">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-3 rounded-lg p-1 text-white/80 hover:bg-white/15" aria-label={t("Kapat")}><X className="h-4 w-4" /></button>
              <Gift className="h-8 w-8" />
              <p className="mt-2 text-lg font-semibold">{t("Arkadaşını davet et, ikiniz de kazanın")}</p>
              <p className="mt-1 text-sm text-white/85">{t("Davet ettiğin her arkadaş e-postasını doğruladığında ikinize de {a} yapay zekâ isteği ve {s} kaynak tarama hakkı ({d} gün geçerli).", { a: ref.reward.ai_requests, s: ref.reward.source_searches, d: ref.reward.valid_days })}</p>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex gap-2">
                <input className="input !text-[13px]" readOnly value={ref.link} onFocus={(e) => e.target.select()} aria-label={t("Davet bağlantısı")} />
                <button className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ink-200 hover:bg-ink-50" onClick={() => { navigator.clipboard.writeText(ref.link); toast({ tone: "success", title: t("Kopyalandı") }); }} aria-label={t("Kopyala")}><Copy className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(`${message} ${ref.link}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
                <button onClick={share} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink-900 text-sm font-medium text-white hover:bg-ink-800"><Share2 className="h-4 w-4" /> {t("Paylaş")}</button>
              </div>
              <p className="text-center text-xs text-ink-500">{t("Davet ettiğiniz: {n} · ödül kazanan: {r}", { n: ref.invited, r: ref.rewarded })}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {peek && !open && (
          <motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={openBox} className="max-w-[240px] rounded-2xl bg-white px-4 py-2.5 text-left text-sm text-ink-800 shadow-xl ring-1 ring-ink-100">
            🎁 {t("Arkadaşını davet et, ikinize de ek hak!")}
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => (open ? setOpen(false) : openBox())}
        animate={badge && !open ? { rotate: [0, -12, 12, -8, 8, 0] } : { rotate: 0 }}
        transition={badge && !open ? { duration: 0.9, repeat: Infinity, repeatDelay: 4 } : undefined}
        className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-fuchsia-500 text-white shadow-xl shadow-brand-600/30 hover:brightness-110"
        aria-label={t("Arkadaşını davet et")}
      >
        <Gift className="h-6 w-6" />
        {badge && !open && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold">1</span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
