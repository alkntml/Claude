"use client";
import { CreditCard } from "lucide-react";
import { useState } from "react";

/**
 * Yönetim → Sistem durumu → Ödeme testi (D230): gizli 1 TL’lik “Deneme (1 TL)” paketiyle kartla ödeme akışını uçtan uca dener.
 * Yalnızca yönetici ekranı (Türkçe); paket başka hiçbir yerde görünmez. Ödeme sonrası paketi Yönetim → Kullanıcılar’dan geri alın.
 */
export function PaymentTest() {
  const [p, setP] = useState({ name: "", phone: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const valid = p.name.trim().length >= 3 && p.phone.replace(/[^\d]/g, "").length >= 10 && p.address.trim().length >= 10;
  const start = async () => {
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/payments/paytr/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ planId: "deneme", period: "monthly", payer: p, immediateStart: true }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.oid) throw new Error(j.error || "Ödeme sayfası açılamadı (migration 47 çalıştırıldı mı, PayTR bilgileri Vercel’de var mı?).");
      window.location.href = `/odeme?siparis=${encodeURIComponent(j.oid)}`;
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); setBusy(false); }
  };
  return (
    <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5">
      <h3 className="flex items-center gap-2 font-semibold text-ink-900"><CreditCard className="h-4 w-4" /> Ödeme testi (1 TL)</h3>
      <p className="mt-1 text-[13px] text-ink-500">Kartla ödeme akışını gerçek sipariş olarak dener: PayTR sayfası → ödeme → paket tanımlama → Siparişlerim. Paket yalnızca burada görünür (Basic hakları, 30 gün). PayTR test modundaysa test kartı, canlıdaysa gerçek kart ve 1 TL çekilir. Deneme bitince Yönetim → Kullanıcılar’dan paketinizi geri alın (gelire girmesin).</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label htmlFor="pt-name" className="block"><span className="label">Ad soyad</span><input id="pt-name" className="input" autoComplete="name" maxLength={60} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></label>
        <label htmlFor="pt-phone" className="block"><span className="label">Telefon</span><input id="pt-phone" className="input" type="tel" autoComplete="tel" maxLength={20} placeholder="05xx xxx xx xx" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></label>
      </div>
      <label htmlFor="pt-address" className="mt-3 block"><span className="label">Fatura adresi</span><textarea id="pt-address" className="input min-h-[64px]" autoComplete="street-address" maxLength={300} value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></label>
      {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
      <button onClick={() => void start()} disabled={!valid || busy} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"><CreditCard className="h-4 w-4" /> {busy ? "Açılıyor…" : "1 TL ile ödeme testi başlat"}</button>
    </div>
  );
}
