"use client";
import { CreditCard } from "lucide-react";
import { useState } from "react";
import { InvoiceFields } from "@/components/invoice-fields";
import { emptyInvoice, invoiceBody, invoiceErrors } from "@/lib/payments/invoice";

/**
 * Yönetim → Sistem durumu → Ödeme testi (D230): gizli 1 TL’lik “Deneme (1 TL)” paketiyle kartla ödeme akışını uçtan uca dener.
 * Yalnızca yönetici ekranı (Türkçe); paket başka hiçbir yerde görünmez. Ödeme sonrası paketi Yönetim → Kullanıcılar’dan geri alın.
 */
export function PaymentTest() {
  const [inv, setInv] = useState(emptyInvoice());
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const valid = invoiceErrors(inv).length === 0;
  const start = async () => {
    if (!valid) { setShow(true); return; }
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/payments/paytr/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: "deneme", period: "monthly", invoice: invoiceBody(inv), immediateStart: true }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.oid) throw new Error(j.error || "Ödeme sayfası açılamadı (migration 47 çalıştırıldı mı, PayTR bilgileri Vercel’de var mı?).");
      window.location.href = `/odeme?siparis=${encodeURIComponent(j.oid)}`;
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false); }
  };
  return (
    <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5">
      <h3 className="flex items-center gap-2 font-semibold text-ink-900"><CreditCard className="h-4 w-4" /> Ödeme testi (1 TL)</h3>
      <p className="mt-1 text-[13px] text-ink-500">Kartla ödeme akışını gerçek sipariş olarak dener: PayTR sayfası → ödeme → paket tanımlama → Siparişlerim. Paket yalnızca burada görünür (Basic hakları, 30 gün). PayTR test modundaysa test kartı, canlıdaysa gerçek kart ve 1 TL çekilir. Deneme bitince Yönetim → Kullanıcılar’dan paketinizi geri alın (gelire girmesin).</p>
      <div className="mt-3"><InvoiceFields value={inv} onChange={setInv} showErrors={show} /></div>
      {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
      <button onClick={() => void start()} disabled={busy} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"><CreditCard className="h-4 w-4" /> {busy ? "Açılıyor…" : "1 TL ile ödeme testi başlat"}</button>
    </div>
  );
}
