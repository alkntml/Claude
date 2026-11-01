"use client";
import { useT } from "@/i18n/client";
import { CheckCircle2, CreditCard, Download, ShieldAlert, Trash2, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Modal, ProgressBar } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { STYLES, STYLE_IDS } from "@/lib/citations/styles";
import { api } from "@/lib/client";
import { GrowthSection } from "./growth";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function AccountView({ profile, usage, limits, plans, subscriptions, payments }: { profile: any; usage: any; limits: any; plans: any[]; subscriptions: any[]; payments: { id: string; label: string; usable: boolean; implemented: boolean; configured: boolean }[] }) {
  const { t, dl } = useT();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState(profile.full_name ?? "");
  const [inst, setInst] = useState(profile.institution ?? "");
  const [style, setStyle] = useState(profile.default_citation_style);
  const [saving, setSaving] = useState(false);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [checkout, setCheckout] = useState<string | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const usable = payments.find((p) => p.usable);

  useEffect(() => {
    if (params.get("odeme") === "basarili") toast({ tone: "success", title: t("Ödeme alındı"), detail: t("Paketiniz birkaç saniye içinde etkinleşecek.") });
  }, [params, toast, t]);

  async function save() {
    setSaving(true);
    try { await api("/api/account", { method: "PATCH", json: { fullName: name, institution: inst, defaultCitationStyle: style } }); toast({ tone: "success", title: t("Profil güncellendi") }); router.refresh(); }
    catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); } finally { setSaving(false); }
  }
  async function buy(planId: string) {
    setCheckout(planId);
    try { const { url } = await api<{ url: string }>("/api/billing/checkout", { method: "POST", json: { planId, interval, provider: usable?.id ?? "stripe" } }); window.location.href = url; }
    catch (e) { toast({ tone: "error", title: t("Ödeme başlatılamadı"), detail: (e as Error).message }); setCheckout(null); }
  }
  async function deleteAccount() {
    try { await api("/api/account", { method: "DELETE", json: { confirm } }); window.location.href = "/"; }
    catch (e) { toast({ tone: "error", title: t("Hesap silinemedi"), detail: (e as Error).message }); }
  }

  const rows: [string, number, number | null | undefined][] = [
    [t("Yapay zekâ istekleri"), usage?.ai_requests ?? 0, limits?.ai_requests_month],
    [t("Token kullanımı"), usage?.tokens ?? 0, limits?.tokens_month],
    [t("Kaynak taramaları"), usage?.source_searches ?? 0, limits?.source_searches_month],
    [t("Aktif projeler"), usage?.projects ?? 0, limits?.projects],
    [t("Depolama (MB)"), usage?.storage_mb ?? 0, limits?.storage_mb],
  ];

  return (
    <div className="space-y-8">
      <div><h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Hesap ve abonelik")}</h1><p className="mt-1 text-ink-500">{profile.email}</p></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4" /> {t("Profil")}</h2>
          <div className="mt-4 space-y-3">
            <div><label className="label">{t("Ad soyad")}</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="label">{t("Kurum")}</label><input className="input" value={inst} onChange={(e) => setInst(e.target.value)} /></div>
            <div><label className="label">{t("Varsayılan atıf stili")}</label><select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}</select></div>
            <Button onClick={save} loading={saving}>{t("Kaydet")}</Button>
          </div>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold">{t("Bu ayki kullanım")}</h2><Badge tone="brand" className="capitalize">{t("{plan} paket", { plan: profile.plan_id })}</Badge></div>
          <div className="mt-5 space-y-4">
            {rows.map(([l, v, m]) => <div key={l}><div className="mb-1.5 flex justify-between text-sm"><span className="text-ink-600">{l}</span><span className="font-medium">{v.toLocaleString(dl)} / {m == null ? "∞" : m.toLocaleString(dl)}</span></div><ProgressBar value={v} max={m ?? null} /></div>)}
            <p className="text-xs text-ink-400">Dışa aktarma biçimleri: {(limits?.export_formats ?? []).join(", ").toUpperCase() || "—"}</p>
          </div>
        </section>
      </div>

      <GrowthSection />

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" /> {t("Paketler")}</h2>
          <div className="flex rounded-xl bg-ink-100 p-1 text-sm">{(["monthly", "yearly"] as const).map((i) => <button key={i} onClick={() => setInterval(i)} className={cn("rounded-lg px-3 py-1 font-medium", interval === i ? "bg-white shadow-sm" : "text-ink-500")}>{i === "monthly" ? t("Aylık") : t("Yıllık (2 ay ücretsiz)")}</button>)}</div>
        </div>
        {!usable && <p className="mt-3 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">{t("Ödeme altyapısı henüz yapılandırılmadı. Yönetici Stripe anahtarlarını tanımladığında paket yükseltme etkinleşecek.")}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const current = p.id === profile.plan_id;
            const price = interval === "monthly" ? p.price_monthly : p.price_yearly;
            return (
              <div key={p.id} className={cn("card flex flex-col p-5 transition", current && "ring-2 ring-brand-400", params.get("paket") === p.id && !current && "ring-2 ring-amber-300")}>
                <div className="flex items-center justify-between"><h3 className="font-semibold">{t(p.name)}</h3>{current && <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> {t("Mevcut")}</Badge>}</div>
                <p className="mt-2 text-2xl font-semibold">₺{Number(price).toLocaleString(dl)}<span className="text-sm font-normal text-ink-400">/{interval === "monthly" ? t("ay") : t("yıl")}</span></p>
                <ul className="mt-3 flex-1 space-y-1 text-[13px] text-ink-600">{p.features.map((f: string) => <li key={f}>• {t(f)}</li>)}</ul>
                {!current && Number(p.price_monthly) > 0 && <Button className="mt-4" variant="dark" disabled={!usable} loading={checkout === p.id} onClick={() => buy(p.id)}>{t("Yükselt")}</Button>}
              </div>
            );
          })}
        </div>
        {subscriptions.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <div>{subscriptions.map((s) => <p key={s.id}>{s.provider} · {s.plan_id} · {s.status}{s.cancel_at_period_end ? ` · ${t("dönem sonunda iptal edilecek")}` : ""}{s.current_period_end ? ` · ${t("yenileme")}: ${new Date(s.current_period_end).toLocaleDateString(dl)}` : ""}</p>)}</div>
            {subscriptions.some((s) => s.provider === "stripe") && <Button size="sm" variant="secondary" onClick={async () => { try { const { url } = await api<{ url: string }>("/api/billing/portal", { method: "POST" }); window.location.href = url; } catch (e) { toast({ tone: "error", title: t("Abonelik sayfası açılamadı"), detail: (e as Error).message }); } }}>{t("Aboneliği yönet / iptal et")}</Button>}
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> {t("Verilerim (KVKK / GDPR)")}</h2>
        <p className="mt-1 text-sm text-ink-500">{t("Tüm projelerinizi, bölümlerinizi, kaynaklarınızı, sohbetlerinizi ve kullanım kayıtlarınızı taşınabilir JSON biçiminde indirebilir veya hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz.")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href="/api/account?export=1" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 transition hover:bg-ink-50"><Download className="h-4 w-4" /> {t("Verilerimi indir")}</a>
          <Button variant="danger" onClick={() => setDelOpen(true)}><Trash2 className="h-4 w-4" /> {t("Hesabımı sil")}</Button>
        </div>
      </section>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title={t("Hesabı kalıcı olarak sil")} footer={<><Button variant="ghost" onClick={() => setDelOpen(false)}>{t("Vazgeç")}</Button><Button variant="danger" disabled={confirm !== "SİL"} onClick={deleteAccount}>{t("Kalıcı olarak sil")}</Button></>}>
        <p className="text-sm text-ink-600">{t("Tüm projeleriniz, dosyalarınız, kaynaklarınız ve sohbetleriniz geri alınamaz şekilde silinecek. Onaylamak için ")}<b>SİL</b> {t("yazın.")}</p>
        <input className="input mt-3" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </Modal>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
