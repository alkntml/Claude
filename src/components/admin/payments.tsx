"use client";
import { RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { api } from "@/lib/client";

/** Yönetim → Ödemeler (D225): kartla ödeme (PayTR) siparişleri. Yalnızca yönetici ekranı (Türkçe). */
interface Order {
  merchant_oid: string; email: string | null; plan_id: string; period: string; amount_try: number; list_price_try: number | null; discount_code: string | null;
  status: "pending" | "paid" | "failed"; payer_name: string; payer_phone: string; test_mode: boolean; paid_amount_try: number | null; payment_type: string | null;
  failed_reason: string | null; payer_address?: string; buyer_email?: string | null; invoice_type?: "individual" | "commercial"; company_title?: string | null; tax_number?: string | null; tax_office?: string | null; applied_at: string | null; created_at: string;
}
interface Data { configured: boolean; testMode: boolean | null; tableMissing: boolean; orders: Order[] }

const tl = (n: number | null) => (n == null ? "—" : `${Number(n).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL`);
const STATUS: Record<Order["status"], [string, string]> = { pending: ["Bekliyor", "bg-ink-100 text-ink-600"], paid: ["Ödendi", "bg-emerald-50 text-emerald-700"], failed: ["Başarısız", "bg-rose-50 text-rose-700"] };

export function PaymentsTab() {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    try { setD(await api<Data>("/api/admin/payments")); setErr(""); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const paid = (d?.orders ?? []).filter((o) => o.status === "paid" && !o.test_mode);
  const month = new Date().toISOString().slice(0, 7);
  const monthSum = paid.filter((o) => o.created_at.startsWith(month)).reduce((s, o) => s + Number(o.paid_amount_try ?? o.amount_try), 0);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Ödemeler (kartla, PayTR)</h2>
          <p className="text-sm text-ink-500">Ödeme onaylanınca paket kendiliğinden tanımlanır ve kullanıcının “Satın alma kayıtları”na da yazılır. WhatsApp ile alınan ödemeler burada görünmez.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-sm hover:bg-ink-50"><RefreshCw className="h-4 w-4" /> Yenile</button>
      </div>
      {err && <p className="text-sm text-rose-700">{err}</p>}
      {d && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-ink-100 p-4"><p className="text-xs text-ink-400">Durum</p><p className="mt-1 font-semibold">{d.configured ? (d.testMode ? "Açık · TEST modu" : "Açık · canlı") : "Kapalı (PayTR bilgileri girilmedi)"}</p></div>
          <div className="rounded-2xl border border-ink-100 p-4"><p className="text-xs text-ink-400">Bu ay kartla tahsilat (KDV dahil)</p><p className="mt-1 font-semibold">{tl(monthSum)}</p></div>
          <div className="rounded-2xl border border-ink-100 p-4"><p className="text-xs text-ink-400">Ödendi ama paket tanımlanamadı</p><p className={cn("mt-1 font-semibold", d.orders.some((o) => o.status === "paid" && !o.applied_at) && "text-rose-700")}>{d.orders.filter((o) => o.status === "paid" && !o.applied_at).length}</p></div>
        </div>
      )}
      {d?.tableMissing && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Sipariş tablosu yok: Supabase’de migration 45’i (payment_orders) çalıştırın.</p>}
      {d && !d.tableMissing && (
        <div className="overflow-x-auto rounded-2xl border border-ink-100">
          <table className="w-full min-w-[900px] text-[13px]">
            <thead className="bg-ink-50 text-left text-xs text-ink-500"><tr><th className="p-2">Tarih</th><th>Kullanıcı</th><th>Paket</th><th>Tutar</th><th>Durum</th><th>Fatura bilgisi</th><th>Sipariş no</th></tr></thead>
            <tbody>
              {d.orders.length === 0 && <tr><td colSpan={7} className="p-4 text-center text-ink-400">Henüz kartla ödeme yok.</td></tr>}
              {d.orders.map((o) => (
                <tr key={o.merchant_oid} className="border-t border-ink-100 align-top">
                  <td className="p-2 whitespace-nowrap">{new Date(o.created_at).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="pr-2">{o.email ?? "—"}</td>
                  <td className="pr-2">{o.plan_id} · {o.period === "yearly" ? "yıllık" : "aylık"}{o.discount_code ? ` · kod ${o.discount_code}` : ""}</td>
                  <td className="pr-2 whitespace-nowrap">{tl(o.paid_amount_try ?? o.amount_try)}{o.list_price_try != null && Number(o.list_price_try) !== Number(o.amount_try) ? <span className="text-ink-400"> (liste {tl(o.list_price_try)})</span> : null}</td>
                  <td className="pr-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS[o.status][1])}>{STATUS[o.status][0]}</span>
                    {o.test_mode && <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">TEST</span>}
                    {o.status === "paid" && !o.applied_at && <p className="mt-1 text-[12px] text-rose-700">Paket tanımlanamadı — kullanıcıya elle atayın</p>}
                    {o.failed_reason && <p className="mt-1 max-w-[220px] text-[12px] text-ink-500">{o.failed_reason}</p>}
                  </td>
                  <td className="pr-2 max-w-[260px]">
                    <span className={cn("mr-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", o.invoice_type === "commercial" ? "bg-indigo-50 text-indigo-700" : "bg-ink-100 text-ink-600")}>{o.invoice_type === "commercial" ? "Ticari fatura" : "Bireysel fatura"}</span>
                    <span className="block font-medium">{o.payer_name}</span>
                    {o.invoice_type === "commercial" && <span className="block text-ink-500">VKN/TCKN {o.tax_number ?? "—"} · {o.tax_office ?? "—"} V.D.</span>}
                    {o.invoice_type === "commercial" && o.payer_address ? <span className="block text-ink-500">{o.payer_address}</span> : null}
                    {o.payer_phone ? <span className="block text-ink-400">{o.payer_phone}</span> : null}
                    {o.buyer_email ? <span className="block text-ink-400">{o.buyer_email}</span> : null}
                  </td>
                  <td className="pr-2 font-mono text-[11.5px] text-ink-500">{o.merchant_oid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
