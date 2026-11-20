"use client";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface State { available: boolean; enabled?: boolean; hasCard?: boolean; cardLabel?: string | null; planName?: string | null; period?: string; amount?: number | null; nextDate?: string | null }

/** D234: Hesap → Otomatik yenileme: durum, iptal, yeniden açma ve kayıtlı kartı silme */
export function AutoRenewSection({ plan }: { plan: string }) {
  const { t, dl } = useT();
  const [st, setSt] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const load = useCallback(() => { api<State>("/api/payments/auto-renew").then(setSt).catch(() => setSt({ available: false })); }, []);
  useEffect(() => { load(); }, [load]);
  if (!st?.available || plan === "free") return null;
  const act = async (action: "off" | "on" | "remove_card") => {
    setBusy(true); setErr(""); setNote("");
    try {
      const r = await api<State & { removedAtProvider?: boolean }>("/api/payments/auto-renew", { method: "POST", json: { action } });
      setSt(r);
      setNote(action === "off" ? t("Otomatik yenileme iptal edildi. Paketiniz ödediğiniz dönemin sonuna kadar sürer; kartınızdan yeni ödeme çekilmez.")
        : action === "on" ? t("Otomatik yenileme yeniden açıldı.")
        : r.removedAtProvider === false ? t("Kayıtlı kart siparişlerinizden kaldırıldı ve otomatik yenileme kapatıldı. Kartın ödeme kuruluşundaki kaydı silinemedi; iletişim sayfamızdan bize yazın.") : t("Kayıtlı kartınız silindi ve otomatik yenileme kapatıldı."));
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };
  const date = st.nextDate ? new Date(st.nextDate).toLocaleDateString(dl, { dateStyle: "long" }) : "";
  const price = st.amount != null ? `${Number(st.amount).toLocaleString("tr-TR")} TL` : "";
  const btn = "inline-flex h-9 items-center rounded-xl border border-ink-200 px-3 text-[13px] font-medium text-ink-800 hover:bg-ink-50 disabled:opacity-50";
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold"><RefreshCw className="h-4 w-4" /> {t("Otomatik yenileme")}</h2>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[12px] font-semibold", st.enabled ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-600")}>{st.enabled ? t("Açık") : t("Kapalı")}</span>
      </div>
      {st.enabled ? (
        <p className="mt-3 text-sm text-ink-700">{t("{plan} paketiniz {date} tarihinde, kayıtlı kartınızdan ({card}) {price} ile otomatik yenilenecek. Yenilemeden önce size bildirim göndeririz. İptal ederseniz paketiniz ödediğiniz dönemin sonuna kadar sürer.", { plan: t(st.planName ?? plan), date, card: st.cardLabel ?? "", price })}</p>
      ) : (
        <p className="mt-3 text-sm text-ink-700">{t("Paketiniz {date} tarihinde sona erer; kartınızdan yeni ödeme çekilmez.", { date })} {!st.hasCard && t("Otomatik yenileme için paketinizin süresini uzatırken “otomatik yenilensin” kutusunu işaretleyin ve kartınızı saklamayı onaylayın.")}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {st.enabled && <button type="button" className={btn} disabled={busy} onClick={() => void act("off")}>{t("Otomatik yenilemeyi iptal et")}</button>}
        {!st.enabled && st.hasCard && <button type="button" className={btn} disabled={busy} onClick={() => void act("on")}>{t("Otomatik yenilemeyi yeniden aç")}</button>}
        {st.hasCard && <button type="button" className={btn} disabled={busy} onClick={() => void act("remove_card")}>{t("Kayıtlı kartı sil")}</button>}
      </div>
      {note && <p className="mt-3 text-sm text-emerald-700" role="status">{note}</p>}
      {err && <p className="mt-3 text-sm text-rose-700" role="alert">{err}</p>}
    </section>
  );
}
