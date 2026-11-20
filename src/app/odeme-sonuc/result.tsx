"use client";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "@/components/l-link";
import { useT } from "@/i18n/client";

type State = { kind: "loading" } | { kind: "framed" } | { kind: "login" } | { kind: "missing" } | { kind: "done"; plan: string; period: string } | { kind: "failed" } | { kind: "waiting" };

/** Sipariş durumunu 2 sn arayla (en fazla 2 dk) sorar; paket tanımlanınca başarı ekranı */
export function PaymentResult({ oid, failedHint }: { oid: string; failedHint: boolean }) {
  const { t } = useT();
  const [st, setSt] = useState<State>({ kind: "loading" });
  useEffect(() => {
    // PayTR bu sayfayı kendi çerçevesinde açar: önce ana pencereye geç
    if (window.top && window.top !== window.self) {
      setSt({ kind: "framed" });
      try { window.top.location.href = window.location.href; } catch { /* tarayıcı izin vermezse bağlantı gösterilir */ }
      return;
    }
    let stop = false, n = 0;
    const tick = async () => {
      if (stop) return;
      n++;
      try {
        const r = await fetch(`/api/payments/orders/${encodeURIComponent(oid)}`, { cache: "no-store" });
        if (r.status === 401) return setSt({ kind: "login" });
        if (r.status === 404) return setSt({ kind: "missing" });
        const j = await r.json();
        if (j.done) return setSt({ kind: "done", plan: j.plan_name, period: j.period });
        if (j.status === "failed") return setSt({ kind: "failed" });
        setSt({ kind: "waiting" });
      } catch { setSt({ kind: "waiting" }); }
      if (n < 60) setTimeout(tick, 2000);
    };
    void tick();
    return () => { stop = true; };
  }, [oid]);

  const box = "w-full rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-sm";
  if (st.kind === "framed") return <div className={box}><p className="text-ink-700">{t("Ödeme sonucu açılıyor…")}</p><a href={`/odeme-sonuc?siparis=${encodeURIComponent(oid)}`} target="_top" className="mt-3 inline-block font-medium text-brand-700 hover:underline">{t("Sonucu görüntüle")}</a></div>;
  if (st.kind === "done") return (
    <div className={box}>
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
      <h1 className="mt-4 font-serif text-3xl font-medium text-ink-950">{t("Ödemeniz alındı")}</h1>
      <p className="mt-2 text-ink-600">{t("{plan} paketiniz hesabınıza tanımlandı ({period}).", { plan: t(st.plan), period: st.period === "yearly" ? t("yıllık") : t("aylık") })}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/panel" className="inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">{t("Çalışmalarıma git")}</Link>
        <Link href="/hesap" className="inline-flex h-10 items-center rounded-xl border border-ink-200 px-4 text-sm font-medium text-ink-800 hover:bg-ink-50">{t("Hesap ve abonelik")}</Link>
      </div>
    </div>
  );
  if (st.kind === "failed") return (
    <div className={box}>
      <XCircle className="mx-auto h-12 w-12 text-rose-600" />
      <h1 className="mt-4 font-serif text-3xl font-medium text-ink-950">{t("Ödeme tamamlanmadı")}</h1>
      <p className="mt-2 text-ink-600">{t("Kartınızdan para çekilmedi. Bilgilerinizi kontrol edip yeniden deneyebilirsiniz.")}</p>
      <Link href="/hesap" className="mt-6 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">{t("Yeniden dene")}</Link>
    </div>
  );
  if (st.kind === "login") return <div className={box}><p className="text-ink-700">{t("Ödeme sonucunu görmek için giriş yapın.")}</p><Link href="/giris" className="mt-4 inline-flex h-10 items-center rounded-xl bg-brand-600 px-4 text-sm font-medium text-white">{t("Giriş yap")}</Link></div>;
  if (st.kind === "missing") return <div className={box}><p className="text-ink-700">{t("Sipariş bulunamadı.")}</p><Link href="/hesap" className="mt-4 inline-block font-medium text-brand-700 hover:underline">{t("Hesap ve abonelik")}</Link></div>;
  return (
    <div className={box}>
      <Clock className="mx-auto h-12 w-12 animate-pulse text-brand-500" />
      <h1 className="mt-4 font-serif text-2xl font-medium text-ink-950">{t("Ödemeniz doğrulanıyor…")}</h1>
      <p className="mt-2 text-ink-600">{failedHint ? t("Ödeme ekranı bir sorun bildirdi; kesin sonucu ödeme kuruluşundan bekliyoruz.") : t("Ödeme kuruluşundan onay bekleniyor. Bu genellikle birkaç saniye sürer.")}</p>
      <p className="mt-4 text-[13px] text-ink-500">{t("Sayfayı kapatsanız bile ödeme onaylanınca paketiniz tanımlanır ve size bildirim gelir.")}</p>
    </div>
  );
}
