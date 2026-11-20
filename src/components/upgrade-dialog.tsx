"use client";
import { CheckCircle2, CreditCard, Lock, MessageCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/primitives";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { UPGRADE_EVENT, type UpgradeRequest } from "@/lib/client";
import { FEATURE_LABEL, type FeatureId } from "@/lib/features";
import { projectLimitFor, PLAN_RANK, whatsappLink, isOneTimePlan, hasYearlyOption, yearlyMonthlyPrice, yearlyTotalPrice, YEARLY_DISCOUNT_PERCENT, formatPrice, type BillingPeriod } from "@/lib/pricing";
import { orderQuote } from "@/lib/payments/order";
import { SELLER } from "@/lib/site";
import { PeriodToggle } from "@/components/pricing/period-toggle";
import { usePrice } from "@/components/price-context";
import { discountedPrice, discountLabel, type DiscountCode } from "@/lib/discount";
import Link from "@/components/l-link";

interface PlanRow { id: string; name: string; price_monthly: number; limits: { pages_month?: number | null; ai_requests_month: number | null; source_searches_month: number | null; projects: number | null; storage_mb: number | null } }
interface PlansData { cardPayments?: boolean; current: string; currentPeriod?: BillingPeriod; email: string; memberNo?: string; plans: PlanRow[]; discount?: DiscountCode | null }

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
  // D225: kartla ödeme (PayTR) — fatura bilgisi adımı
  const [card, setCard] = useState<PlanRow | null>(null);
  const [payer, setPayer] = useState({ name: "", phone: "", address: "" });
  const [paying, setPaying] = useState(false);
  // D226: dijital hizmetin hemen başlaması talebi (cayma hakkı bilgisi) — ödeme öncesi zorunlu
  const [instant, setInstant] = useState(false);
  const [payError, setPayError] = useState("");

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
  const close = () => { setReq(null); setAck(false); setAckError(false); setCard(null); setPayError(""); setInstant(false); };
  /** Bilgilendirmenin okunduğu kaydı (satın alma öncesi); bekletmez, WhatsApp hemen açılır */
  const recordAck = (plan: string) => {
    void fetch("/api/legal/accept", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notice: ["distance", "fair_use"], purpose: "purchase", plan }) }).catch(() => {});
  };
  const currentRank = PLAN_RANK[data?.current ?? "free"] ?? 0;
  const minRank = req.plan ? PLAN_RANK[req.plan] ?? 0 : 0;
  const yearlyMode = period === "yearly";
  // Yıllıkta: aynı paketin yıllığına geçiş de seçilebilir (zaten yıllıksa değil)
  // D226: kartla ödemede mevcut paketin süresi de uzatılabilir (aylık ve yıllık)
  const renewable = !!data?.cardPayments;
  const options = (data?.plans ?? []).filter((p) => renewable
    ? p.price_monthly > 0 && (PLAN_RANK[p.id] ?? 0) >= Math.max(currentRank, minRank) && (!yearlyMode || hasYearlyOption(p.id, p.price_monthly))
    : yearlyMode
    ? hasYearlyOption(p.id, p.price_monthly) && (PLAN_RANK[p.id] ?? 0) >= Math.max(currentRank, minRank) && !(p.id === data?.current && data?.currentPeriod === "yearly")
    : (PLAN_RANK[p.id] ?? 0) > currentRank && (PLAN_RANK[p.id] ?? 0) >= minRank && p.price_monthly > 0);
  const currentName = data?.plans.find((p) => p.id === data.current)?.name ?? data?.current ?? "";
  const monthly = req.code === "limit_pages" || req.code === "limit_ai" || req.code === "limit_tokens" || req.code === "limit_search" || workLocked;
  const title = req.target && renewable && req.target === data?.current ? t("{name} paketinizin süresini uzatın", { name: t(data?.plans.find((p) => p.id === req.target)?.name ?? req.target) })
    : req.target ? t("{name} paketine geçin", { name: t(data?.plans.find((p) => p.id === req.target)?.name ?? req.target) }) : t(TITLES[req.code ?? ""] ?? "Paketinizi yükseltin");
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
    p.limits.projects == null ? t("Sınırsız proje") : t("{n} proje", { n: projectLimitFor(p.id, p.limits.projects, true) ?? p.limits.projects }),
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

  const cardOn = !!data?.cardPayments;
  /** Onay işaretlenmeden ödeme düğmesine basılırsa onay kutusuna kaydır (telefonda kutu ekranın dışında kalabilir) */
  const needAck = () => { setAckError(true); document.getElementById("upgrade-ack")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const quote = (p: PlanRow) => orderQuote(p, period, yearlyMode ? null : data?.discount);
  const pay = async () => {
    if (!card) return;
    setPaying(true); setPayError("");
    recordAck(yearlyMode ? `${card.id}-yillik` : card.id);
    try {
      const res = await fetch("/api/payments/paytr/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: card.id, period, payer, immediateStart: true }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.oid) throw new Error(j.error || t("Ödeme sayfası açılamadı. Lütfen biraz sonra tekrar deneyin."));
      window.location.href = `/odeme?siparis=${encodeURIComponent(j.oid)}`;
    } catch (e) {
      setPayError(e instanceof Error ? e.message : String(e));
      setPaying(false);
    }
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
          <label id="upgrade-ack" className={cn("flex items-start gap-2.5 rounded-xl border p-3 text-[13px] text-ink-700 scroll-mt-4", ackError && !ack ? "border-rose-300 bg-rose-50" : "border-ink-100")}>
            <input type="checkbox" checked={ack} onChange={(e) => { setAck(e.target.checked); setAckError(false); }} className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600" />
            <span>{t("Okudum:")} <Link href="/mesafeli-sozlesmeler" target="_blank" className="font-medium text-brand-700 hover:underline">{t("Mesafeli Sözleşmeler ve Ön Bilgilendirme")}</Link> {t("ve")} <Link href="/adil-kullanim" target="_blank" className="font-medium text-brand-700 hover:underline">{t("Adil Kullanım Politikası")}</Link>. {cardOn ? t("Ödeme, PayTR’nin güvenli sayfasında kredi veya banka kartıyla alınır; kart bilgileriniz Academiana’ya gelmez.") : t("Fiyat, ödeme yöntemi ve paket ayrıntıları WhatsApp’ta size ayrıca yazılı olarak teyit edilir.")}</span>
          </label>
        )}
        {ackError && !ack && <p className="text-sm text-rose-700">{cardOn ? t("Ödemeye geçmeden önce bilgilendirme metinlerini okuduğunuzu işaretleyin.") : t("WhatsApp’a geçmeden önce bilgilendirme metinlerini okuduğunuzu işaretleyin.")}</p>}
        {card && (() => {
          const q = quote(card);
          const valid = instant && payer.name.trim().length >= 3 && payer.phone.replace(/[^\d]/g, "").length >= 10 && payer.address.trim().length >= 10;
          const renew = card.id === data?.current;
          return (
            <form className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/40 p-4" onSubmit={(e) => { e.preventDefault(); if (valid && !paying) void pay(); }}>
              <p className="font-semibold text-ink-900">{t("{plan} paketi", { plan: t(card.name) })} · {yearlyMode ? t("Yıllık (tek ödeme)") : t("Aylık")} · {q ? formatPrice(q.amount, "tr") : ""}</p>
              <p className="text-[13px] text-ink-500">{t("Fatura ve ödeme kaydı için bilgileriniz. Kart bilgilerinizi bir sonraki adımda PayTR’nin güvenli sayfasında gireceksiniz.")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label htmlFor="pay-name" className="block"><span className="label">{t("Ad soyad")}</span><input id="pay-name" className="input" autoComplete="name" maxLength={60} value={payer.name} onChange={(e) => setPayer({ ...payer, name: e.target.value })} /></label>
                <label htmlFor="pay-phone" className="block"><span className="label">{t("Telefon")}</span><input id="pay-phone" className="input" type="tel" autoComplete="tel" maxLength={20} placeholder="05xx xxx xx xx" value={payer.phone} onChange={(e) => setPayer({ ...payer, phone: e.target.value })} /></label>
              </div>
              <label htmlFor="pay-address" className="block"><span className="label">{t("Fatura adresi")}</span><textarea id="pay-address" className="input min-h-[72px]" autoComplete="street-address" maxLength={400} value={payer.address} onChange={(e) => setPayer({ ...payer, address: e.target.value })} /></label>
              <div className="rounded-xl border border-ink-100 bg-white p-3 text-[12.5px] leading-relaxed text-ink-600">
                <p className="font-semibold text-ink-800">{t("Sipariş özeti")}</p>
                <p className="mt-1"><b className="text-ink-700">{t("Satıcı")}:</b> {SELLER.name} · {t("Vergi no")} {SELLER.taxNo} ({t("{o} Vergi Dairesi", { o: SELLER.taxOffice })}) · {SELLER.address}</p>
                <p><b className="text-ink-700">{t("Hizmet")}:</b> {t("Academiana {plan} paketi", { plan: t(card.name) })} · {yearlyMode ? t("365 gün; 12 aylık hak baştan tanımlanır") : t("30 gün")}{renew ? ` · ${t("süre, mevcut paketinizin kalan süresine eklenir")}` : ""}</p>
                <p><b className="text-ink-700">{t("Toplam")}:</b> {q ? formatPrice(q.amount, "tr") : ""} {t("(vergiler dahil, Türk lirası)")} · {t("kredi/banka kartı, tek çekim")} · {t("otomatik yenileme yok")}</p>
                <p><b className="text-ink-700">{t("Başlangıç")}:</b> {t("ödeme onaylanınca hemen")}</p>
              </div>
              <label htmlFor="pay-instant" className="flex items-start gap-2.5 text-[12.5px] text-ink-700">
                <input id="pay-instant" type="checkbox" checked={instant} onChange={(e) => setInstant(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600" />
                <span>{t("Hizmetin ödeme onaylanır onaylanmaz başlamasını talep ediyorum. Elektronik ortamda anında ifa edilen bu dijital hizmette, ifaya başlandıktan sonra cayma hakkının mevzuatın öngördüğü ölçüde kullanılamayacağını okudum.")}</span>
              </label>
              {payError && <p className="text-sm text-rose-700">{payError}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <button type="submit" disabled={!valid || paying} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"><CreditCard className="h-4 w-4" /> {paying ? t("Ödeme sayfası açılıyor…") : t("Güvenli ödemeye geç")}</button>
                <button type="button" onClick={() => { setCard(null); setPayError(""); }} className="h-10 rounded-xl px-3 text-sm text-ink-600 hover:bg-ink-50">{t("Geri")}</button>
              </div>
            </form>
          );
        })()}
        {!card && options.length > 0 && (
          <div className={cn("grid gap-3", options.length > 1 && "sm:grid-cols-2", options.length > 2 && "lg:grid-cols-3")}>
            {options.map((p) => (
              <div key={p.id} className={cn("flex flex-col rounded-2xl border p-4", req.target === p.id ? "border-brand-400 ring-2 ring-brand-200" : "border-ink-100")}>
                <p className="flex items-center gap-1.5 font-semibold text-ink-900">{p.id === "premium" && <Sparkles className="h-4 w-4 text-amber-500" />}{t(p.name)}{renewable && p.id === data?.current && <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{t("Mevcut paketiniz")}</span>}</p>
                {disc(p) != null && <p className="mt-1 text-[12.5px] text-emerald-700">{t("İndirim kodunuz {code} uygulandı", { code: data?.discount?.code ?? "" })} · <s className="text-ink-400">{price(p.price_monthly)}</s></p>}
                {yearlyMode && <p className="mt-1 text-[12.5px] text-ink-400"><s>{price(p.price_monthly)}</s> <span className="text-emerald-700">{t("%{p} indirim", { p: YEARLY_DISCOUNT_PERCENT })}</span></p>}
                <p className="mt-1 text-xl font-semibold">{price(yearlyMode ? yearlyMonthlyPrice(p.price_monthly) : disc(p) ?? p.price_monthly)}<span className="text-sm font-normal text-ink-400">{isOneTimePlan(p.id) ? ` · ${t("tek ödeme · 1 ay")}` : `/${t("ay")}`}</span></p>
                {yearlyMode && <p className="text-[13px] text-ink-600">{t("Yıllık toplam: {total} (tek ödeme)", { total: price(yearlyTotalPrice(p.price_monthly)) })}</p>}
                <ul className="mt-3 flex-1 space-y-1.5 text-[13px] text-ink-600">
                  {lines(p).map((l) => <li key={l} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />{l}</li>)}
                </ul>
                {cardOn && quote(p) && (
                  <button type="button" aria-disabled={!ack} onClick={() => { if (!ack) { needAck(); return; } setCard(p); document.getElementById("upgrade-ack")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className={cn("mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-medium text-white transition hover:bg-brand-700", !ack && "opacity-50")}>
                    <CreditCard className="h-4 w-4" /> {renewable && p.id === data?.current ? t("Kartla süreyi uzat") : t("Kartla öde")}
                  </button>
                )}
                {!cardOn && <a href={href(p)} target="_blank" rel="noopener noreferrer" aria-disabled={!ack} onClick={(e) => { if (!ack) { e.preventDefault(); needAck(); return; } recordAck(yearlyMode ? `${p.id}-yillik` : p.id); }} className={cn(cardOn ? "mt-2 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 text-[13px] font-medium text-ink-700 transition hover:bg-ink-50" : "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white transition hover:bg-ink-800", !ack && "opacity-50")}>
                  <MessageCircle className="h-4 w-4" /> {t("WhatsApp ile yükselt")}
                </a>}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-ink-400">{cardOn ? <>{t("Paketiniz, ödeme onaylanınca hesabınıza kendiliğinden tanımlanır.")} {t("Sorunuz mu var?")} <a className="font-medium text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappLink(t("Merhaba, Academiana paketleri hakkında bir sorum var.\nÜye no: {no}\nHesap e-postam: {email}", { email: data?.email ?? "", no: data?.memberNo ?? "" }))}>WhatsApp</a></> : t("Mesajı gönderdiğinizde ödeme ayrıntıları size iletilir; ödemeniz alındıktan sonra paketiniz hesabınıza tanımlanır.")}</p>
      </div>
    </Modal>
  );
}
