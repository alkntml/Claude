"use client";
import { CheckCircle2, Lock, MessageCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/primitives";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { UPGRADE_EVENT, type UpgradeRequest } from "@/lib/client";
import { FEATURE_LABEL, type FeatureId } from "@/lib/features";
import { PLAN_RANK, whatsappLink, isOneTimePlan, hasYearlyOption, yearlyMonthlyPrice, yearlyTotalPrice, YEARLY_DISCOUNT_PERCENT, type BillingPeriod } from "@/lib/pricing";
import { PeriodToggle } from "@/components/pricing/period-toggle";
import { usePrice } from "@/components/price-context";
import { discountedPrice, discountLabel, type DiscountCode } from "@/lib/discount";
import Link from "@/components/l-link";

interface PlanRow { id: string; name: string; price_monthly: number; limits: { pages_month?: number | null; ai_requests_month: number | null; source_searches_month: number | null; projects: number | null; storage_mb: number | null } }
interface PlansData { current: string; currentPeriod?: BillingPeriod; email: string; memberNo?: string; plans: PlanRow[]; discount?: DiscountCode | null }

const TITLES: Record<string, string> = {
  limit_pages: "Bu ayki sayfa hakkınız doldu",
  limit_ai: "Bu ayki yapay zekâ kullanım hakkınız doldu",
  limit_tokens: "Bu ayki yapay zekâ kullanım hakkınız doldu",
  limit_search: "Bu ayki kaynak tarama hakkınız doldu",
  limit_projects: "Proje sınırınıza ulaştınız",
  limit_storage: "Depolama alanınız doldu",
  limit_export: "Bu dışa aktarma biçimi paketinizde yok",
  feature_locked: "Bu özellik üst paketlerde",
  work_locked: "Bu ayki kullanım hakkınız doldu",
};

/**
 * Paket yükseltme penceresi (D49). Kullanım sınırları (aylık yapay zekâ isteği vb.) yalnızca burada,
 * kullanıcı sınıra ulaştığında, kilitli bir özelliğe bastığında veya “Yükselt” dediğinde gösterilir.
 * Kök düzende bir kez yerleştirilir; openUpgrade() / 402 cevapları ile açılır.
 */
export function UpgradeDialogHost() {
  const { t, dl } = useT();
  const price = usePrice();
  const [req, setReq] = useState<UpgradeRequest | null>(null);
  const [data, setData] = useState<PlansData | null>(null);
  const [failed, setFailed] = useState(false);
  // D154: satın alma öncesi bilgilendirme — Mesafeli Sözleşmeler ve Ön Bilgilendirme + Adil Kullanım okunmadan WhatsApp’a geçilmez
  const [ack, setAck] = useState(false);
  const [ackError, setAckError] = useState(false);
  // D157: aylık / yıllık ödeme
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  const load = useCallback(async () => {
    if (data) return;
    try {
      const res = await fetch("/api/account/plans");
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
    } catch { setFailed(true); }
  }, [data]);

  useEffect(() => {
    const fn = (e: Event) => { const d = (e as CustomEvent<UpgradeRequest>).detail ?? {}; setReq(d); setPeriod(d.period ?? "monthly"); void load(); };
    window.addEventListener(UPGRADE_EVENT, fn);
    return () => window.removeEventListener(UPGRADE_EVENT, fn);
  }, [load]);

  if (!req) return null;
  const workLocked = req.code === "work_locked";
  const close = () => { setReq(null); setAck(false); setAckError(false); };
  /** Bilgilendirmenin okunduğu kaydı (satın alma öncesi); bekletmez, WhatsApp hemen açılır */
  const recordAck = (plan: string) => {
    void fetch("/api/legal/accept", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notice: ["distance", "fair_use"], purpose: "purchase", plan }) }).catch(() => {});
  };
  const currentRank = PLAN_RANK[data?.current ?? "free"] ?? 0;
  const minRank = req.plan ? PLAN_RANK[req.plan] ?? 0 : 0;
  const yearlyMode = period === "yearly";
  // Yıllıkta: aynı paketin yıllığına geçiş de seçilebilir (zaten yıllıksa değil)
  const options = (data?.plans ?? []).filter((p) => yearlyMode
    ? hasYearlyOption(p.id, p.price_monthly) && (PLAN_RANK[p.id] ?? 0) >= Math.max(currentRank, minRank) && !(p.id === data?.current && data?.currentPeriod === "yearly")
    : (PLAN_RANK[p.id] ?? 0) > currentRank && (PLAN_RANK[p.id] ?? 0) >= minRank && p.price_monthly > 0);
  const currentName = data?.plans.find((p) => p.id === data.current)?.name ?? data?.current ?? "";
  const monthly = req.code === "limit_pages" || req.code === "limit_ai" || req.code === "limit_tokens" || req.code === "limit_search" || workLocked;
  const title = req.target ? t("{name} paketine geçin", { name: t(data?.plans.find((p) => p.id === req.target)?.name ?? req.target) }) : t(TITLES[req.code ?? ""] ?? "Paketinizi yükseltin");
  const feature = req.feature && req.feature in FEATURE_LABEL ? t(FEATURE_LABEL[req.feature as FeatureId]) : null;

  const num = (n: number | null) => (n == null ? null : n.toLocaleString(dl));
  const storage = (mb: number | null) => (mb == null ? t("Sınırsız depolama") : mb >= 1000 ? t("{n} GB depolama", { n: Math.round(mb / 1000) }) : t("{n} MB depolama", { n: mb }));
  // D96: önce müşterinin anladığı birim (sayfa); tarama sınırı 1.000’in üstündeyse adil kullanımla sınırsız
  // D157: yıllıkta aylık hakların 12 katı, baştan ve 1 yıl geçerli
  const y12 = (n: number | null | undefined) => (n == null ? null : n * 12);
  const lines = (p: PlanRow) => yearlyMode && hasYearlyOption(p.id, p.price_monthly) ? [
    ...(p.limits.pages_month ? [t("Yılda {n} sayfa yapay zekâ destekli akademik metin", { n: num(y12(p.limits.pages_month)) })] : p.limits.pages_month === null ? [t("Sınırsız sayfa yazımı (adil kullanım)")] : []),
    p.limits.ai_requests_month == null ? t("Sınırsız yapay zekâ isteği") : t("Yılda {n} yapay zekâ isteği", { n: num(y12(p.limits.ai_requests_month)) }),
    p.limits.source_searches_month == null ? t("Sınırsız kaynak taraması") : p.limits.source_searches_month >= 1000 ? t("Sınırsız kaynak taraması (adil kullanım)") : t("Yılda {n} kaynak taraması", { n: num(y12(p.limits.source_searches_month)) }),
    p.limits.projects == null ? t("Sınırsız proje") : t("{n} proje", { n: p.limits.projects }),
    storage(p.limits.storage_mb),
  ] : [
    ...(p.limits.pages_month ? [t("Ayda {n} sayfa yapay zekâ destekli akademik metin", { n: num(p.limits.pages_month) })] : p.limits.pages_month === null ? [t("Sınırsız sayfa yazımı (adil kullanım)")] : []),
    p.limits.ai_requests_month == null ? t("Sınırsız yapay zekâ isteği") : t("Aylık {n} yapay zekâ isteği", { n: num(p.limits.ai_requests_month) }),
    p.limits.source_searches_month == null ? t("Sınırsız kaynak taraması") : p.limits.source_searches_month >= 1000 ? t("Sınırsız kaynak taraması (adil kullanım)") : t("Aylık {n} kaynak taraması", { n: num(p.limits.source_searches_month) }),
    p.limits.projects == null ? t("Sınırsız proje") : t("{n} proje", { n: p.limits.projects }),
    storage(p.limits.storage_mb),
  ];
  // D145: kayıtta bağlanan indirim kodu — indirimli fiyat ve kod mesaja eklenir
  // Yıllık indirim, indirim koduyla birleştirilmez
  const disc = (p: PlanRow) => (yearlyMode ? null : discountedPrice(p.price_monthly, data?.discount, p.id));
  const href = (p: PlanRow) => {
    if (yearlyMode) {
      return whatsappLink(t("Merhaba, Academiana’da yıllık ödemeyle paket almak istiyorum.\nMevcut paketim: {current}\nİstediğim paket: {target} — Yıllık ({monthly}/ay, toplam {total}, tek ödeme)\nPaket hakları (1 yıl, baştan tanımlanır): {limits}\nÜye no: {no}\nHesap e-postam: {email}", {
        current: t(currentName), target: t(p.name), monthly: price(yearlyMonthlyPrice(p.price_monthly)), total: price(yearlyTotalPrice(p.price_monthly)), limits: lines(p).join(", "), email: data?.email ?? "", no: data?.memberNo ?? "",
      }));
    }
    const d = disc(p);
    const shown = d == null ? p.price_monthly : d;
    const msg = t("Merhaba, Academiana’da paketimi yükseltmek istiyorum.\nMevcut paketim: {current}\nGeçmek istediğim paket: {target} ({price}/ay)\nPaket sınırları: {limits}\nÜye no: {no}\nHesap e-postam: {email}", {
      current: t(currentName), target: t(p.name), price: isOneTimePlan(p.id) ? `${price(shown)} ${t("tek ödeme · 1 ay")}` : price(shown), limits: lines(p).join(", "), email: data?.email ?? "", no: data?.memberNo ?? "",
    });
    return whatsappLink(d != null && data?.discount ? `${msg}\n${t("İndirim kodum: {code} ({label}; liste fiyatı {list})", { code: data.discount.code, label: discountLabel(data.discount), list: price(p.price_monthly) })}` : msg);
  };

  return (
    <Modal open onClose={close} title={title} wide>
      <div className="space-y-4">
        {feature && <p className="flex items-center gap-2 text-[15px] text-ink-700"><Lock className="h-4 w-4 text-ink-400" /> {t("“{feature}” {plan} ve üzeri paketlerde kullanılabilir.", { feature, plan: t(data?.plans.find((p) => p.id === req.plan)?.name ?? req.plan ?? "") })}</p>}
        {!feature && req.message && !req.target && <p className="text-[15px] text-ink-700">{req.message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2"><PeriodToggle value={period} onChange={setPeriod} />{yearlyMode && <span className="text-[13px] text-ink-500">{t("12 aylık hak baştan tanımlanır; 1 yıl içinde dilediğiniz gibi kullanırsınız. Yıllık indirim, indirim koduyla birleştirilmez.")}</span>}</div>
        {monthly && <p className="text-sm text-ink-500">{data?.currentPeriod === "yearly" ? t("Yıllık paketinizde haklar paket süresi boyunca geçerlidir. Beklemek istemiyorsanız paketinizi yükseltebilirsiniz.") : t("Hakkınız her ayın başında yenilenir. Beklemek istemiyorsanız paketinizi yükseltebilirsiniz.")}</p>}
        {monthly && <p className="text-sm text-ink-500">{t("Çalışmalarınız silinmez: hakkınız dolsa da onları görüntüleyebilir ve ücretsiz indirebilirsiniz. Ücretsiz araçlar her zaman açıktır.")}</p>}
        {failed && <p className="text-sm text-ink-500">{t("Paket bilgileri yüklenemedi. Hesap ve abonelik sayfasından tekrar deneyin.")}</p>}
        {!data && !failed && <p className="text-sm text-ink-400">{t("Paketler yükleniyor…")}</p>}
        {data && options.length === 0 && (
          <div className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-600">
            {t("En üst paketi kullanıyorsunuz. Ek kullanım hakkı için bize yazabilirsiniz.")}
            <a className="ml-1 font-medium text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappLink(t("Merhaba, Academiana’da ek kullanım hakkı istiyorum.\nMevcut paketim: {current}\nÜye no: {no}\nHesap e-postam: {email}", { current: t(currentName), email: data.email, no: data.memberNo ?? "" }))}>WhatsApp</a>
          </div>
        )}
        {options.length > 0 && (
          <label className={cn("flex items-start gap-2.5 rounded-xl border p-3 text-[13px] text-ink-700", ackError && !ack ? "border-rose-300 bg-rose-50" : "border-ink-100")}>
            <input type="checkbox" checked={ack} onChange={(e) => { setAck(e.target.checked); setAckError(false); }} className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600" />
            <span>{t("Okudum:")} <Link href="/mesafeli-sozlesmeler" target="_blank" className="font-medium text-brand-700 hover:underline">{t("Mesafeli Sözleşmeler ve Ön Bilgilendirme")}</Link> {t("ve")} <Link href="/adil-kullanim" target="_blank" className="font-medium text-brand-700 hover:underline">{t("Adil Kullanım Politikası")}</Link>. {t("Fiyat, ödeme yöntemi ve paket ayrıntıları WhatsApp’ta size ayrıca yazılı olarak teyit edilir.")}</span>
          </label>
        )}
        {ackError && !ack && <p className="text-sm text-rose-700">{t("WhatsApp’a geçmeden önce bilgilendirme metinlerini okuduğunuzu işaretleyin.")}</p>}
        {options.length > 0 && (
          <div className={cn("grid gap-3", options.length > 1 && "sm:grid-cols-2", options.length > 2 && "lg:grid-cols-3")}>
            {options.map((p) => (
              <div key={p.id} className={cn("flex flex-col rounded-2xl border p-4", req.target === p.id ? "border-brand-400 ring-2 ring-brand-200" : "border-ink-100")}>
                <p className="flex items-center gap-1.5 font-semibold text-ink-900">{p.id === "premium" && <Sparkles className="h-4 w-4 text-amber-500" />}{t(p.name)}</p>
                {disc(p) != null && <p className="mt-1 text-[12.5px] text-emerald-700">{t("İndirim kodunuz {code} uygulandı", { code: data?.discount?.code ?? "" })} · <s className="text-ink-400">{price(p.price_monthly)}</s></p>}
                {yearlyMode && <p className="mt-1 text-[12.5px] text-ink-400"><s>{price(p.price_monthly)}</s> <span className="text-emerald-700">{t("%{p} indirim", { p: YEARLY_DISCOUNT_PERCENT })}</span></p>}
                <p className="mt-1 text-xl font-semibold">{price(yearlyMode ? yearlyMonthlyPrice(p.price_monthly) : disc(p) ?? p.price_monthly)}<span className="text-sm font-normal text-ink-400">{isOneTimePlan(p.id) ? ` · ${t("tek ödeme · 1 ay")}` : `/${t("ay")}`}</span></p>
                {yearlyMode && <p className="text-[13px] text-ink-600">{t("Yıllık toplam: {total} (tek ödeme)", { total: price(yearlyTotalPrice(p.price_monthly)) })}</p>}
                <ul className="mt-3 flex-1 space-y-1.5 text-[13px] text-ink-600">
                  {lines(p).map((l) => <li key={l} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />{l}</li>)}
                </ul>
                <a href={href(p)} target="_blank" rel="noopener noreferrer" aria-disabled={!ack} onClick={(e) => { if (!ack) { e.preventDefault(); setAckError(true); return; } recordAck(yearlyMode ? `${p.id}-yillik` : p.id); }} className={cn("mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white transition hover:bg-ink-800", !ack && "opacity-50")}>
                  <MessageCircle className="h-4 w-4" /> {t("WhatsApp ile yükselt")}
                </a>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-ink-400">{t("Mesajı gönderdiğinizde ödeme ayrıntıları size iletilir; ödemeniz alındıktan sonra paketiniz hesabınıza tanımlanır.")}</p>
      </div>
    </Modal>
  );
}
