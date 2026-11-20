"use client";
import { Check, Copy, RefreshCw, Undo2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";
import { api } from "@/lib/client";

/** Yönetim → Faturalar (D232): ticari fatura isteyen ödenmiş siparişler. Yalnızca yönetici ekranı (Türkçe). */
interface Row {
  merchant_oid: string; created_at: string; plan_name?: string; period: string; amount_try: number; paid_amount_try: number | null; test_mode: boolean;
  company_title: string | null; payer_name: string; tax_number: string | null; tax_office: string | null; payer_address: string; payer_phone: string; buyer_email: string | null;
  invoiced_at: string | null; invoice_no: string | null;
}
interface Data { orders: Row[]; pending: number; migrationMissing: boolean }
const tl = (n: number) => `${Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
const when = (iso: string) => new Date(iso).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });

/** Faturayı kesecek kişi için tek seferde kopyalanacak metin */
const copyText = (o: Row) => [
  `Unvan: ${o.company_title ?? o.payer_name}`, `Vergi no: ${o.tax_number ?? ""}`, `Vergi dairesi: ${o.tax_office ?? ""}`, `Adres: ${o.payer_address}`,
  `Telefon: ${o.payer_phone}`, `E-posta: ${o.buyer_email ?? ""}`, `Hizmet: Academiana ${o.plan_name ?? ""} paketi (${o.period === "yearly" ? "yıllık" : "aylık"})`, `Tutar (KDV dahil): ${tl(o.paid_amount_try ?? o.amount_try)}`, `Sipariş no: ${o.merchant_oid}`,
].join("\n");

/** Menüdeki bildirim ışığı için bekleyen fatura sayısı (60 sn’de bir yenilenir) */
export function usePendingInvoices(): [number, (n: number) => void] {
  const [n, setN] = useState(0);
  useEffect(() => {
    let alive = true;
    const load = () => api<{ pending: number }>("/api/admin/invoices?sayi=1").then((r) => { if (alive) setN(r.pending); }).catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  return [n, setN];
}

export function InvoicesTab({ onPending }: { onPending: (n: number) => void }) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [show, setShow] = useState<"todo" | "done">("todo");
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState("");
  const [nos, setNos] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    try { const r = await api<Data>("/api/admin/invoices"); setD(r); onPending(r.pending); setErr(""); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  }, [onPending]);
  useEffect(() => { void load(); }, [load]);
  const mark = async (o: Row, done: boolean) => {
    setBusy(o.merchant_oid);
    try { const r = await api<{ pending: number }>("/api/admin/invoices", { method: "POST", json: { oid: o.merchant_oid, done, invoiceNo: nos[o.merchant_oid] || undefined } }); onPending(r.pending); await load(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(""); }
  };
  const copy = async (o: Row) => { try { await navigator.clipboard.writeText(copyText(o)); setCopied(o.merchant_oid); setTimeout(() => setCopied(""), 1800); } catch { /* panoya yazılamadı */ } };
  const list = (d?.orders ?? []).filter((o) => (show === "todo" ? !o.invoiced_at : !!o.invoiced_at));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Faturalar — fatura kesilecekler</h2>
          <p className="text-sm text-ink-500">Ticari fatura isteyen ve ödemesi alınan siparişler. Faturayı kestikten sonra “Kesildi” diye işaretleyin; yeni ticari fatura talebi gelince menüde kırmızı ışık yanar.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-ink-200 px-3 text-sm hover:bg-ink-50"><RefreshCw className="h-4 w-4" /> Yenile</button>
      </div>
      {err && <p className="text-sm text-rose-700">{err}</p>}
      {d?.migrationMissing && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Fatura listesi için Supabase’de migration 50 ve 51 çalıştırılmalı.</p>}
      {d && !d.migrationMissing && (
        <div className="flex gap-2">
          {([["todo", `Kesilecek (${d.pending})`], ["done", "Kesildi"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setShow(k)} className={cn("rounded-full px-3.5 py-1.5 text-sm", show === k ? "bg-brand-600 font-medium text-white" : "border border-ink-200 text-ink-600 hover:bg-ink-50")}>{label}</button>
          ))}
        </div>
      )}
      {d && !d.migrationMissing && list.length === 0 && <p className="rounded-2xl border border-ink-100 p-6 text-center text-sm text-ink-400">{show === "todo" ? "Kesilecek ticari fatura yok." : "Henüz kesildi olarak işaretlenen fatura yok."}</p>}
      <div className="grid gap-3">
        {list.map((o) => (
          <div key={o.merchant_oid} className="rounded-2xl border border-ink-100 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-ink-900">{o.company_title ?? o.payer_name}{o.test_mode && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">TEST — fatura kesilmez</span>}</p>
                <p className="text-[13px] text-ink-500">{when(o.created_at)} · Academiana {o.plan_name} · {o.period === "yearly" ? "yıllık" : "aylık"} · <b className="text-ink-800">{tl(o.paid_amount_try ?? o.amount_try)}</b> (KDV dahil)</p>
              </div>
              <button onClick={() => void copy(o)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 text-[13px] hover:bg-ink-50">{copied === o.merchant_oid ? <><Check className="h-3.5 w-3.5 text-emerald-600" /> Kopyalandı</> : <><Copy className="h-3.5 w-3.5" /> Bilgileri kopyala</>}</button>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2">
              <div><dt className="inline text-ink-400">Vergi no: </dt><dd className="inline font-mono">{o.tax_number ?? "—"}</dd></div>
              <div><dt className="inline text-ink-400">Vergi dairesi: </dt><dd className="inline">{o.tax_office ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-ink-400">Adres: </dt><dd className="inline">{o.payer_address || "—"}</dd></div>
              <div><dt className="inline text-ink-400">Telefon: </dt><dd className="inline">{o.payer_phone || "—"}</dd></div>
              <div><dt className="inline text-ink-400">E-posta: </dt><dd className="inline">{o.buyer_email ?? "—"}</dd></div>
              <div className="sm:col-span-2"><dt className="inline text-ink-400">Sipariş no: </dt><dd className="inline font-mono text-[12px] text-ink-500">{o.merchant_oid}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-ink-100 pt-3">
              {o.invoiced_at ? (<>
                <span className="text-[13px] text-emerald-700">Kesildi · {when(o.invoiced_at)}{o.invoice_no ? ` · Fatura no ${o.invoice_no}` : ""}</span>
                <button disabled={busy === o.merchant_oid} onClick={() => void mark(o, false)} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-ink-600 hover:bg-ink-50"><Undo2 className="h-3.5 w-3.5" /> Geri al</button>
              </>) : !o.test_mode && (<>
                <label className="sr-only" htmlFor={`fn-${o.merchant_oid}`}>Fatura numarası (isteğe bağlı)</label>
                <input id={`fn-${o.merchant_oid}`} className="input h-8 max-w-[220px] py-0 text-[13px]" placeholder="Fatura no (isteğe bağlı)" maxLength={60} value={nos[o.merchant_oid] ?? ""} onChange={(e) => setNos({ ...nos, [o.merchant_oid]: e.target.value })} />
                <button disabled={busy === o.merchant_oid} onClick={() => void mark(o, true)} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-[13px] font-medium text-white hover:bg-brand-700 disabled:opacity-50"><Check className="h-3.5 w-3.5" /> Kesildi olarak işaretle</button>
              </>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
