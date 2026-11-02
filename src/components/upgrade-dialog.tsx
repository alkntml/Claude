"use client";
import { CheckCircle2, FileText, Lock, MessageCircle, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/primitives";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { UPGRADE_EVENT, getCurrentProject, type UpgradeRequest } from "@/lib/client";
import { FEATURE_LABEL, type FeatureId } from "@/lib/features";
import { DOWNLOAD_PRICE_TL, PLAN_RANK, whatsappLink } from "@/lib/pricing";
import { usePrice } from "@/components/price-context";

interface PlanRow { id: string; name: string; price_monthly: number; limits: { ai_requests_month: number | null; source_searches_month: number | null; projects: number | null; storage_mb: number | null } }
interface PlansData { current: string; email: string; memberNo?: string; plans: PlanRow[] }

const TITLES: Record<string, string> = {
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

  const load = useCallback(async () => {
    if (data) return;
    try {
      const res = await fetch("/api/account/plans");
      if (!res.ok) throw new Error(String(res.status));
      setData(await res.json());
    } catch { setFailed(true); }
  }, [data]);

  useEffect(() => {
    const fn = (e: Event) => { setReq((e as CustomEvent<UpgradeRequest>).detail ?? {}); void load(); };
    window.addEventListener(UPGRADE_EVENT, fn);
    return () => window.removeEventListener(UPGRADE_EVENT, fn);
  }, [load]);

  if (!req) return null;
  const workLocked = req.code === "work_locked";
  // Çalışma sırasında kilit devreye girdiyse sayfa yenilenir ve kilitli görünüme geçilir (D50)
  const close = () => { setReq(null); if (workLocked && !req.projectId && typeof window !== "undefined" && /^\/proje\//.test(window.location.pathname)) window.location.reload(); };
  const proj = req.projectId ? { id: req.projectId, title: req.projectTitle ?? "" } : getCurrentProject();
  const downloadHref = whatsappLink(t("Merhaba, Academiana’da mevcut çalışmamı indirmek istiyorum ({price}).\nÇalışma: {title}\nÇalışma kodu: {id}\nÜye no: {no}\nHesap e-postam: {email}", { price: price(DOWNLOAD_PRICE_TL), title: proj?.title ?? "", id: proj?.id ?? "", email: data?.email ?? "", no: data?.memberNo ?? "" }));
  const currentRank = PLAN_RANK[data?.current ?? "free"] ?? 0;
  const minRank = req.plan ? PLAN_RANK[req.plan] ?? 0 : 0;
  const options = (data?.plans ?? []).filter((p) => (PLAN_RANK[p.id] ?? 0) > currentRank && (PLAN_RANK[p.id] ?? 0) >= minRank && p.price_monthly > 0);
  const currentName = data?.plans.find((p) => p.id === data.current)?.name ?? data?.current ?? "";
  const monthly = req.code === "limit_ai" || req.code === "limit_tokens" || req.code === "limit_search" || workLocked;
  const title = req.target ? t("{name} paketine geçin", { name: t(data?.plans.find((p) => p.id === req.target)?.name ?? req.target) }) : t(TITLES[req.code ?? ""] ?? "Paketinizi yükseltin");
  const feature = req.feature && req.feature in FEATURE_LABEL ? t(FEATURE_LABEL[req.feature as FeatureId]) : null;

  const num = (n: number | null) => (n == null ? null : n.toLocaleString(dl));
  const storage = (mb: number | null) => (mb == null ? t("Sınırsız depolama") : mb >= 1000 ? t("{n} GB depolama", { n: Math.round(mb / 1000) }) : t("{n} MB depolama", { n: mb }));
  const lines = (p: PlanRow) => [
    p.limits.ai_requests_month == null ? t("Sınırsız yapay zekâ isteği") : t("Aylık {n} yapay zekâ isteği", { n: num(p.limits.ai_requests_month) }),
    p.limits.source_searches_month == null ? t("Sınırsız kaynak taraması") : t("Aylık {n} kaynak taraması", { n: num(p.limits.source_searches_month) }),
    p.limits.projects == null ? t("Sınırsız proje") : t("{n} proje", { n: p.limits.projects }),
    storage(p.limits.storage_mb),
  ];
  const href = (p: PlanRow) => whatsappLink(t("Merhaba, Academiana’da paketimi yükseltmek istiyorum.\nMevcut paketim: {current}\nGeçmek istediğim paket: {target} ({price}/ay)\nPaket sınırları: {limits}\nÜye no: {no}\nHesap e-postam: {email}", {
    current: t(currentName), target: t(p.name), price: price(p.price_monthly), limits: lines(p).join(", "), email: data?.email ?? "",
  }));

  return (
    <Modal open onClose={close} title={title} wide>
      <div className="space-y-4">
        {feature && <p className="flex items-center gap-2 text-[15px] text-ink-700"><Lock className="h-4 w-4 text-ink-400" /> {t("“{feature}” {plan} ve üzeri paketlerde kullanılabilir.", { feature, plan: t(data?.plans.find((p) => p.id === req.plan)?.name ?? req.plan ?? "") })}</p>}
        {!feature && req.message && !req.target && <p className="text-[15px] text-ink-700">{req.message}</p>}
        {monthly && <p className="text-sm text-ink-500">{t("Hakkınız her ayın başında yenilenir. Beklemek istemiyorsanız paketinizi yükseltebilirsiniz.")}</p>}
        {workLocked && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 p-4">
            <div><p className="flex items-center gap-2 font-semibold text-ink-900"><FileText className="h-4 w-4 text-brand-600" /> {t("Mevcut çalışmayı indir — {price}", { price: price(DOWNLOAD_PRICE_TL) })}</p><p className="mt-0.5 text-sm text-ink-500">{t("Abone olmadan yalnızca bu çalışmayı tek seferlik indirmek için.")}</p></div>
            <a href={downloadHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-900 hover:bg-ink-50"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
        )}
        {workLocked && <p className="text-sm font-medium text-ink-700">{t("Ya da abone olun, kaldığınız yerden devam edin:")}</p>}
        {failed && <p className="text-sm text-ink-500">{t("Paket bilgileri yüklenemedi. Hesap ve abonelik sayfasından tekrar deneyin.")}</p>}
        {!data && !failed && <p className="text-sm text-ink-400">{t("Paketler yükleniyor…")}</p>}
        {data && options.length === 0 && (
          <div className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-600">
            {t("En üst paketi kullanıyorsunuz. Ek kullanım hakkı için bize yazabilirsiniz.")}
            <a className="ml-1 font-medium text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer" href={whatsappLink(t("Merhaba, Academiana’da ek kullanım hakkı istiyorum.\nMevcut paketim: {current}\nÜye no: {no}\nHesap e-postam: {email}", { current: t(currentName), email: data.email, no: data.memberNo ?? "" }))}>WhatsApp</a>
          </div>
        )}
        {options.length > 0 && (
          <div className={cn("grid gap-3", options.length > 1 && "sm:grid-cols-2", options.length > 2 && "lg:grid-cols-3")}>
            {options.map((p) => (
              <div key={p.id} className={cn("flex flex-col rounded-2xl border p-4", req.target === p.id ? "border-brand-400 ring-2 ring-brand-200" : "border-ink-100")}>
                <p className="flex items-center gap-1.5 font-semibold text-ink-900">{p.id === "premium" && <Sparkles className="h-4 w-4 text-amber-500" />}{t(p.name)}</p>
                <p className="mt-1 text-xl font-semibold">{price(p.price_monthly)}<span className="text-sm font-normal text-ink-400">/{t("ay")}</span></p>
                <ul className="mt-3 flex-1 space-y-1.5 text-[13px] text-ink-600">
                  {lines(p).map((l) => <li key={l} className="flex items-start gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-500" />{l}</li>)}
                </ul>
                <a href={href(p)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white transition hover:bg-ink-800">
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
