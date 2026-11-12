"use client";
import { useT } from "@/i18n/client";
import { CheckCircle2, CreditCard, Download, MessageCircle, ShieldAlert, Trash2, UserRound, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Badge, Modal } from "@/components/ui/primitives";
import { UsageMeter } from "@/components/ui/charts";
import { discountedPrice, discountLabel, type DiscountCode } from "@/lib/discount";
import { useToast } from "@/components/ui/toast";
import { STYLES, STYLE_IDS } from "@/lib/citations/styles";
import { api, openUpgrade } from "@/lib/client";
import { TEAM_DISCOUNT, whatsappLink, isOneTimePlan } from "@/lib/pricing";
import { memberCode } from "@/lib/member";
import { usePrice } from "@/components/price-context";
import { GrowthSection } from "./growth";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function AccountView({ profile, usage, limits, plans, locked, discount }: { profile: any; usage: any; limits: any; plans: any[]; locked?: boolean; discount?: DiscountCode | null }) {
  const { t, dl } = useT();
  const toast = useToast();
  const price = usePrice();
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState(profile.full_name ?? "");
  const [inst, setInst] = useState(profile.institution ?? "");
  const [style, setStyle] = useState(profile.default_citation_style);
  const [saving, setSaving] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const teamHref = whatsappLink(t("Merhaba, Academiana Akademik Ekip İndirimi (%{p}) hakkında bilgi almak istiyorum.\nKurum / bölüm / ekip adı: \nKişi sayısı: \nİlgilendiğimiz paket: \nÜye no: {no}\nHesap e-postam: {email}", { p: TEAM_DISCOUNT.percent, email: profile.email ?? "", no: memberCode(profile.member_no) }));

  async function save() {
    setSaving(true);
    try { await api("/api/account", { method: "PATCH", json: { fullName: name, institution: inst, defaultCitationStyle: style } }); toast({ tone: "success", title: t("Profil güncellendi") }); router.refresh(); }
    catch (e) { toast({ tone: "error", title: t("Kaydedilemedi"), detail: (e as Error).message }); } finally { setSaving(false); }
  }
  async function deleteAccount() {
    try { await api("/api/account", { method: "DELETE", json: { confirm } }); window.location.href = "/"; }
    catch (e) { toast({ tone: "error", title: t("Hesap silinemedi"), detail: (e as Error).message }); }
  }

  const rows: [string, number, number | null | undefined][] = [
    // D145: paket kartındaki sayfa hakkı (yapay zekânın yazdığı taslak; 1 sayfa = 344 kelime)
    [t("Yapay zekâ ile yazılan sayfa"), usage?.pages ?? 0, limits?.pages_month],
    [t("Kaynak taramaları"), usage?.source_searches ?? 0, limits?.source_searches_month],
    [t("Aktif projeler"), usage?.projects ?? 0, limits?.projects],
    [t("Depolama (MB)"), usage?.storage_mb ?? 0, limits?.storage_mb],
  ];

  return (
    <div className="space-y-8">
      <div><h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Hesap ve abonelik")}</h1><p className="mt-1 text-ink-500">{profile.email}{profile.member_no ? <> · {t("Üye no")}: <b className="font-mono text-ink-800">{memberCode(profile.member_no)}</b></> : null}</p></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4" /> {t("Profil")}</h2>
          <div className="mt-4 space-y-3">
            <div><label className="label">{t("Ad soyad")}</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className="label">{t("Kurum")}</label><input className="input" value={inst} onChange={(e) => setInst(e.target.value)} /></div>
            <div><label className="label">{t("Varsayılan atıf stili")}</label><select className="input" value={style} onChange={(e) => setStyle(e.target.value)}>{STYLE_IDS.map((s) => <option key={s} value={s}>{t(STYLES[s].label)}</option>)}</select></div>
            <div className="flex flex-wrap items-center gap-3"><Button onClick={save} loading={saving}>{t("Kaydet")}</Button><a href="/sifre-yenile" className="text-sm font-medium text-brand-600 hover:underline">{t("Şifremi değiştir")}</a></div>
          </div>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold">{t("Bu ayki kullanım")}</h2><Badge tone="brand" className="capitalize">{t("{plan} paket", { plan: profile.plan_id })}</Badge></div>
          {(() => {
            // Paket süresi (D53): bitiş tarihi ve kalan gün; 7 günden az kaldıysa uzatma bağlantısı
            if (!profile.plan_expires_at || profile.plan_id === "free") return null;
            const end = new Date(profile.plan_expires_at);
            const left = Math.ceil((end.getTime() - Date.now()) / 86400_000);
            const soon = left <= 7;
            return (
              <div className={cn("mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm", soon ? "bg-amber-50 text-amber-900" : "bg-ink-50 text-ink-600")}>
                <span>{t("Paketiniz {date} tarihine kadar geçerli ({n} gün kaldı).", { date: end.toLocaleDateString(dl), n: Math.max(0, left) })}</span>
                {soon && <a className="font-medium underline" target="_blank" rel="noopener noreferrer" href={whatsappLink(t("Merhaba, Academiana {plan} paketimin süresini uzatmak istiyorum.\nÜye no: {no}\nHesap e-postam: {email}", { plan: profile.plan_id, email: profile.email ?? "", no: memberCode(profile.member_no) }))}>{t("Süreyi uzat")}</a>}
              </div>
            );
          })()}
          <div className="mt-5 space-y-4">
            <div className="grid gap-5 sm:grid-cols-2">
              {rows.map(([l, v, m]) => <UsageMeter key={l} label={l} value={v} max={m ?? null} locale={dl} warnText={t("Doluyor")} fullText={t("Doldu")} unlimitedText={t("Sınırsız")} />)}
            </div>
            <p className="text-xs text-ink-400">Dışa aktarma biçimleri: {(limits?.export_formats ?? []).join(", ").toUpperCase() || "—"}</p>
          </div>
        </section>
      </div>

      <GrowthSection />

      <section>
        <h2 className="flex items-center gap-2 font-semibold"><CreditCard className="h-4 w-4" /> {t("Paketler")}</h2>
        <p className="mt-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">{t("Paket yükseltme şimdilik WhatsApp üzerinden yapılıyor: “Yükselt”e bastığınızda paketin kullanım sınırlarını görür, ardından hazır bir mesajla WhatsApp’a geçersiniz. Ödemeniz alındıktan sonra paketiniz hesabınıza tanımlanır.")}</p>
        {discount && <p className="mt-2 rounded-xl bg-brand-50 px-4 py-2.5 text-sm text-brand-900">{t("İndirim kodunuz: {code} ({label}). İndirimli fiyatlar aşağıda gösterilir ve yükseltme mesajına eklenir.", { code: discount.code, label: discountLabel(discount) })}</p>}
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const current = p.id === profile.plan_id;
            const dp = discountedPrice(Number(p.price_monthly), discount, p.id);
            return (
              <div key={p.id} className={cn("card flex flex-col p-5 transition", current && "ring-2 ring-brand-400", params.get("paket") === p.id && !current && "ring-2 ring-amber-300")}>
                <div className="flex items-center justify-between"><h3 className="font-semibold">{t(p.name)}</h3>{current && <Badge tone="green"><CheckCircle2 className="h-3 w-3" /> {t("Mevcut")}</Badge>}</div>
                {dp != null && <p className="mt-2 text-[12.5px] text-ink-400"><s>{price(Number(p.price_monthly))}</s> <span className="text-emerald-700">{discountLabel(discount!)}</span></p>}
                <p className={cn("text-2xl font-semibold", dp == null && "mt-2")}>{price(dp ?? Number(p.price_monthly))}<span className="text-sm font-normal text-ink-400">{isOneTimePlan(p.id) ? ` · ${t("tek ödeme")}` : `/${t("ay")}`}</span></p>
                <ul className="mt-3 flex-1 space-y-1 text-[13px] text-ink-600">{p.features.map((f: string) => <li key={f}>• {t(f)}</li>)}</ul>
                {!current && Number(p.price_monthly) > 0 && (
                  <button type="button" onClick={() => openUpgrade({ target: p.id })} className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-medium text-white transition hover:bg-ink-800">
                    <MessageCircle className="h-4 w-4" /> {t("Yükselt")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 font-semibold text-ink-900"><Users className="h-4 w-4" /> {t("Akademik Ekip İndirimi: %{p}", { p: TEAM_DISCOUNT.percent })}</p>
            <p className="mt-1 text-sm text-ink-500">{t("Akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler için: en az {n} kişilik ekiplerde tüm ücretli paketlerde %{p} indirim.", { n: TEAM_DISCOUNT.minMembers, p: TEAM_DISCOUNT.percent })}</p>
          </div>
          <a href={teamHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 transition hover:bg-ink-50"><MessageCircle className="h-4 w-4" /> {t("WhatsApp’tan bilgi al")}</a>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4" /> {t("Verilerim (KVKK / GDPR)")}</h2>
        <p className="mt-1 text-sm text-ink-500">{t("Tüm projelerinizi, bölümlerinizi, kaynaklarınızı, sohbetlerinizi ve kullanım kayıtlarınızı taşınabilir JSON biçiminde indirebilir veya hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz.")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {locked
            // Kilitliyken anında indirme yerine KVKK talebi: yasal süre içinde ücretsiz yanıtlanır (D50)
            ? <Button variant="secondary" onClick={async () => { try { await api("/api/account/data-request", { method: "POST" }); toast({ tone: "success", title: t("Veri talebiniz alındı"), detail: t("KVKK kapsamındaki talebiniz yasal süre (30 gün) içinde ücretsiz olarak e-posta adresinize iletilecektir.") }); } catch (e) { toast({ tone: "error", title: t("Talep oluşturulamadı"), detail: (e as Error).message }); } }}><Download className="h-4 w-4" /> {t("Veri talebi oluştur (KVKK)")}</Button>
            : <a href="/api/account?export=1" className="inline-flex h-10 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-medium text-ink-800 transition hover:bg-ink-50"><Download className="h-4 w-4" /> {t("Verilerimi indir")}</a>}
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
