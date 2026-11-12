"use client";
import { Check, Copy, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { discountedPrice, discountLabel, isClaimable, normalizeCode, type DiscountCode, type DiscountKind } from "@/lib/discount";
import { SITE_URL } from "@/lib/site";

/**
 * Yönetim → İndirim kodları (D145). Yalnızca yönetici ekranı (Türkçe). Kod oluştur / düzenle / pasif yap / sil;
 * her paket için indirimli fiyatın TL ve dolar karşılığı; kodu kullanarak kaydolanlar.
 */
interface Plan { id: string; name: string; price: number }
interface Row extends DiscountCode { created_at: string }
interface UserRow { id: string; email: string | null; full_name: string | null; plan_id: string; discount_code: string; created_at: string }
interface Data { codes: Row[]; users: UserRow[]; plans: Plan[]; usdTry: number }

const tl = (n: number) => `${Math.round(n).toLocaleString("tr-TR")} TL`;
const usd = (n: number, rate: number) => (rate > 0 ? `$${(n / rate).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—");

function PriceTable({ plans, rate, d }: { plans: Plan[]; rate: number; d: Pick<DiscountCode, "kind" | "value" | "plans"> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead className="text-left text-xs text-ink-400"><tr><th className="py-1">Paket</th><th>Liste fiyatı</th><th>İndirim</th><th>İndirimli fiyat</th></tr></thead>
        <tbody>
          {plans.map((p) => {
            const dp = discountedPrice(p.price, d, p.id);
            return (
              <tr key={p.id} className="border-t border-ink-100">
                <td className="py-1.5 pr-2 font-medium">{p.name}</td>
                <td className="pr-2">{tl(p.price)} <span className="text-ink-400">· {usd(p.price, rate)}</span></td>
                <td className="pr-2">{dp == null ? <span className="text-ink-400">uygulanmaz</span> : <span className="text-emerald-700">−{tl(p.price - dp)} <span className="text-ink-400">· {usd(p.price - dp, rate)}</span></span>}</td>
                <td>{dp == null ? "—" : <b>{tl(dp)} <span className="font-normal text-ink-400">· {usd(dp, rate)}</span></b>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function DiscountsTab() {
  const toast = useToast();
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({ code: "", kind: "percent" as DiscountKind, value: "20", plans: [] as string[], max_uses: "", expires: "", note: "" });

  const load = useCallback(() => {
    setErr(null);
    api<Data>("/api/admin/discounts").then(setD).catch((e: Error) => setErr(e.message || "İndirim kodları yüklenemedi."));
  }, []);
  useEffect(() => { load(); }, [load]);

  const usersBy = useMemo(() => {
    const m: Record<string, UserRow[]> = {};
    for (const u of d?.users ?? []) (m[u.discount_code] ??= []).push(u);
    return m;
  }, [d]);

  const value = Number(f.value.replace(",", "."));
  const preview = { kind: f.kind, value: value > 0 ? value : 0, plans: f.plans };
  const valid = /^[A-Z0-9_-]{3,32}$/.test(f.code) && value > 0 && (f.kind !== "percent" || value <= 100);

  async function create() {
    setBusy(true);
    try {
      await api("/api/admin/discounts", { method: "POST", json: {
        code: f.code, kind: f.kind, value, plans: f.plans, note: f.note,
        max_uses: f.max_uses ? Math.max(1, Math.round(Number(f.max_uses))) : null,
        expires_at: f.expires ? new Date(`${f.expires}T23:59:59+03:00`).toISOString() : null,
      } });
      toast({ tone: "success", title: `${f.code} oluşturuldu` });
      setF({ ...f, code: "", note: "", max_uses: "", expires: "" });
      load();
    } catch (e) { toast({ tone: "error", title: (e as Error).message }); } finally { setBusy(false); }
  }

  async function patch(code: string, body: Record<string, unknown>) {
    try { await api("/api/admin/discounts", { method: "PATCH", json: { code, ...body } }); load(); } catch (e) { toast({ tone: "error", title: (e as Error).message }); }
  }

  async function remove(code: string) {
    const n = usersBy[code]?.length ?? 0;
    if (!confirm(n ? `${code} silinsin mi? Bu kodla kayıt olan ${n} kullanıcının indirimi de kalkar. Hakları korumak için silmek yerine “Pasif yap” kullanın.` : `${code} silinsin mi?`)) return;
    try { await api("/api/admin/discounts", { method: "DELETE", json: { code } }); load(); } catch (e) { toast({ tone: "error", title: (e as Error).message }); }
  }

  function copy(text: string, key: string) {
    navigator.clipboard?.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(null), 1500); }, () => undefined);
  }

  if (err) return <div className="card p-5 text-sm text-rose-700">{err} <Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button></div>;
  if (!d) return <div className="skeleton h-40" />;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-900">
        Kayıt olurken kodu giren (veya <b>{SITE_URL}/kayit?kod=KOD</b> bağlantısıyla gelen) herkesin hesabına kod kalıcı olarak bağlanır.
        İndirimli fiyat kullanıcının yükseltme penceresinde, Hesap sayfasında ve WhatsApp mesajında görünür; paketi atarken kullanıcının kodunu Kullanıcılar sekmesinde görürsünüz.
        Son tarih, kullanım sınırı ve “pasif” yalnızca <b>yeni kayıtları</b> etkiler. Dolar karşılıkları Ayarlar’daki kurla ({d.usdTry || "—"} TL) hesaplanır.
      </div>

      <div className="card space-y-4 p-5">
        <h3 className="font-semibold">Yeni indirim kodu</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm"><span className="label">Kod</span><input className="input font-mono uppercase" value={f.code} onChange={(e) => setF({ ...f, code: normalizeCode(e.target.value) })} placeholder="OGRENCI20" maxLength={32} /></label>
          <label className="text-sm"><span className="label">İndirim türü</span>
            <select className="input" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as DiscountKind })}><option value="percent">Yüzde (%)</option><option value="amount_try">Tutar (TL)</option></select>
          </label>
          <label className="text-sm"><span className="label">{f.kind === "percent" ? "Yüzde" : "Tutar (TL)"}</span><input className="input" inputMode="decimal" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></label>
          <label className="text-sm"><span className="label">Kullanım sınırı (boş = sınırsız)</span><input className="input" inputMode="numeric" value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: e.target.value.replace(/\D/g, "") })} /></label>
          <label className="text-sm"><span className="label">Son kayıt tarihi (boş = süresiz)</span><input type="date" className="input" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></label>
          <label className="text-sm sm:col-span-2 lg:col-span-3"><span className="label">Not (yalnızca siz görürsünüz)</span><input className="input" value={f.note} maxLength={500} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Ör. X Üniversitesi tanıtım günü" /></label>
        </div>
        <div className="text-sm">
          <span className="label">Geçerli paketler (hiçbiri seçilmezse tüm ücretli paketler)</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {d.plans.map((p) => {
              const on = f.plans.includes(p.id);
              return <button key={p.id} type="button" onClick={() => setF({ ...f, plans: on ? f.plans.filter((x) => x !== p.id) : [...f.plans, p.id] })} className={cn("rounded-full border px-3 py-1 text-[13px]", on ? "border-brand-400 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600 hover:bg-ink-50")}>{p.name}</button>;
            })}
          </div>
        </div>
        <div className="rounded-xl border border-ink-100 p-3"><p className="mb-1 text-xs font-medium text-ink-500">Önizleme: TL ve dolar karşılıkları</p><PriceTable plans={d.plans} rate={d.usdTry} d={preview} /></div>
        <Button onClick={create} loading={busy} disabled={!valid}><Plus className="h-4 w-4" /> Kodu oluştur</Button>
        {f.kind === "percent" && value > 100 && <p className="text-sm text-rose-600">Yüzde 100’ü geçemez.</p>}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between"><h3 className="font-semibold">İndirim kodları ({d.codes.length})</h3><Button size="sm" variant="ghost" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button></div>
        {d.codes.length === 0 && <p className="mt-2 text-sm text-ink-400">Henüz kod yok.</p>}
        <div className="mt-2 divide-y divide-ink-100">
          {d.codes.map((c) => {
            const users = usersBy[c.code] ?? [];
            const link = `${SITE_URL}/kayit?kod=${c.code}`;
            const claimable = isClaimable(c);
            return (
              <div key={c.code} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setOpen(open === c.code ? null : c.code)} className="font-mono text-[15px] font-semibold text-ink-900 hover:underline">{c.code}</button>
                  <Badge tone="brand">{discountLabel(c)}</Badge>
                  <span className="text-[13px] text-ink-500">{c.plans?.length ? c.plans.map((id) => d.plans.find((p) => p.id === id)?.name ?? id).join(", ") : "Tüm ücretli paketler"}</span>
                  <span className="text-[13px] text-ink-500">· {c.uses ?? 0}{c.max_uses ? ` / ${c.max_uses}` : ""} kullanım</span>
                  {c.expires_at && <span className="text-[13px] text-ink-500">· son {new Date(c.expires_at).toLocaleDateString("tr-TR")}</span>}
                  {claimable ? <Badge tone="green">Kayıtta geçerli</Badge> : <Badge tone="amber">{c.active === false ? "Pasif" : "Yeni kayda kapalı"}</Badge>}
                  <span className="ml-auto flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" onClick={() => copy(link, c.code)}>{copied === c.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} Kayıt bağlantısı</Button>
                    <Button size="sm" variant="ghost" onClick={() => patch(c.code, { active: c.active === false })}>{c.active === false ? "Etkinleştir" : "Pasif yap"}</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(c.code)}><Trash2 className="h-3.5 w-3.5 text-rose-600" /></Button>
                  </span>
                </div>
                {c.note && <p className="mt-0.5 text-[12.5px] text-ink-400">{c.note}</p>}
                {open === c.code && (
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-ink-100 p-3"><p className="mb-1 text-xs font-medium text-ink-500">TL ve dolar karşılıkları</p><PriceTable plans={d.plans} rate={d.usdTry} d={c} /></div>
                    <div className="rounded-xl border border-ink-100 p-3">
                      <p className="mb-1 text-xs font-medium text-ink-500">Bu kodla kaydolanlar ({users.length})</p>
                      {users.length === 0 && <p className="text-sm text-ink-400">Henüz yok.</p>}
                      <div className="max-h-64 overflow-y-auto">
                        {users.map((u) => <div key={u.id} className="flex items-center justify-between gap-2 border-t border-ink-100 py-1 text-[13px]"><span className="min-w-0 truncate">{u.full_name ? `${u.full_name} · ` : ""}{u.email}</span><span className="shrink-0 text-ink-400">{u.plan_id} · {new Date(u.created_at).toLocaleDateString("tr-TR")}</span></div>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
