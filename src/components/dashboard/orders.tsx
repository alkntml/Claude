"use client";
import { Download, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";

interface Order { merchant_oid: string; plan_name: string; period: string; amount_try: number; status: string; applied_at: string | null; test_mode: boolean; created_at: string }

/** D226: Hesap → Siparişlerim: kartla ödeme siparişleri ve sipariş özetini indirme (kalıcı veri saklayıcısı) */
export function OrdersSection() {
  const { t, dl } = useT();
  const [orders, setOrders] = useState<Order[] | null>(null);
  useEffect(() => {
    fetch("/api/payments/orders").then((r) => (r.ok ? r.json() : { orders: [] })).then((j) => setOrders(j.orders ?? [])).catch(() => setOrders([]));
  }, []);
  if (!orders?.length) return null;
  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 font-semibold"><Receipt className="h-4 w-4" /> {t("Siparişlerim")}</h2>
      <ul className="mt-4 divide-y divide-ink-100">
        {orders.map((o) => (
          <li key={o.merchant_oid} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
            <div>
              <p className="font-medium text-ink-900">{t("{plan} paketi", { plan: t(o.plan_name) })} · {o.period === "yearly" ? t("yıllık") : t("aylık")} · {Number(o.amount_try).toLocaleString("tr-TR")} TL</p>
              <p className="text-[12.5px] text-ink-500">
                {new Date(o.created_at).toLocaleDateString(dl, { dateStyle: "medium" })} · {t("Sipariş no")}: {o.merchant_oid}
                {" · "}<span className={cn(o.status === "paid" ? "text-emerald-700" : "text-rose-700")}>{o.status === "paid" ? t("Ödendi") : t("Ödeme tamamlanmadı")}</span>
                {o.test_mode && <span className="ml-1 text-amber-800">· {t("Test")}</span>}
              </p>
            </div>
            <a href={`/api/payments/orders/${encodeURIComponent(o.merchant_oid)}/receipt`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-[13px] font-medium text-ink-800 hover:bg-ink-50"><Download className="h-4 w-4" /> {t("Sipariş özetini indir")}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
