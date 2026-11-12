"use client";
import { useT } from "@/i18n/client";
import { BookCheck, Brain, CheckCircle2, Users, FileDown, Layers3, Library, ListChecks, Lock, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import Link from "@/components/l-link";
import { FadeIn } from "@/components/ui/fade-in";
import type { PlanLike } from "@/lib/plans-fallback";
import { usePrice } from "@/components/price-context";
import { discounted, TEAM_DISCOUNT, whatsappLink, isOneTimePlan } from "@/lib/pricing";

export function HowItWorks() {
  const { t } = useT();
  const steps = [
    { icon: Layers3, title: "Çalışma türünü seçin", text: "Tez, makale, derleme veya araştırma önerisi seçin. Platform akademik standartlara uygun bir yol haritası çıkarır." },
    { icon: Brain, title: "Konunuzu tanımlayın", text: "Asistan konunuzu analiz eder, kavramları ayrıştırır ve sizinle birlikte bir çalışma planı yapar." },
    { icon: Library, title: "Literatürü tarayın", text: "Gerçek veri tabanlarında arama yapılır. Hangi kaynakları kütüphanenize ekleyeceğinize siz karar verirsiniz." },
    { icon: Workflow, title: "Bölümleri geliştirin", text: "Her bölümde yazın, yeniden yazdırın, genişletin. Her iddia bir kaynağa bağlanır, her sürüm geçmişte saklanır." },
    { icon: ListChecks, title: "Teslimden önce denetleyin", text: "Atıflı her cümle kaynağıyla karşılaştırılır; eksik künye, atıf tutarlılığı ve bölümler arası uyum kontrol edilir. Teslim öncesi kontrol listesi hiçbir şeyin atlanmamasını sağlar." },
    { icon: FileDown, title: "Dışa aktarın", text: "Word, PDF, Markdown veya TXT olarak indirin. İçindekiler, numaralandırma ve kaynakça hazır gelir." },
  ];
  return (
    <section id="nasil" className="relative overflow-hidden bg-ink-950 py-24 text-white">
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(420px_160px_at_50%_0%,rgb(79_70_229/0.35),transparent_75%)]" />
      <div className="relative mx-auto max-w-6xl px-6">
        <FadeIn className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-300">{t("Nasıl çalışır")}</p>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">{t("Altı adımda, kontrol hep sizde.")}</h2>
        </FadeIn>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05} className="bg-ink-950/90 p-7 transition hover:bg-ink-900">
              <div className="flex items-center gap-3">
                <span className="font-serif text-3xl italic text-brand-300/70">{String(i + 1).padStart(2, "0")}</span>
                <s.icon className="h-5 w-5 text-white/70" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t(s.title)}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/60">{t(s.text)}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SourcesStrip() {
  const { t } = useT();
  const sources = ["OpenAlex", "DergiPark", "Crossref", "PubMed", "Europe PMC", "arXiv", "DOAJ", "PLOS", "OpenAIRE", "Zenodo", "HAL", "Unpaywall", "DataCite", "ERIC", "DBLP", "INSPIRE-HEP", "Open Library", "Google Books"];
  return (
    <section id="kaynaklar" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Veri kaynakları")} · {t("16 veri tabanı, 250 milyon+ yayın")}</p>
            <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Erişebildiği kadarını kullanır, ne kadarını okuduğunu söyler.")}</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-ink-500">{t("Her kaynağın yanında erişim seviyesi açıkça yazar:")} <b>{t("yalnızca künye")}</b>, <b>{t("özet okundu")}</b> {t("veya")} <b>{t("tam metin okundu")}</b>. {t("Yapay zekâ, yalnızca özetini gördüğü bir makaleyi tam metnini okumuş gibi yorumlamaz. Doğrulanamayan kaynaklar ise kesin referans olarak gösterilmez.")}</p>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap gap-2">
              {sources.map((s, i) => (
                <span key={s} className="rounded-xl border border-ink-100 bg-ink-50/70 px-3.5 py-2 text-sm font-medium text-ink-700 transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700" style={{ transitionDelay: `${i * 10}ms` }}>{s}</span>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-brand-50 px-4 py-3 text-[13.5px] leading-relaxed text-ink-700"><b>{t("Türkiye kaynakları:")}</b> {t("Türkçe ve Türkiye adresli yayınlar (DergiPark dergileri dahil) otomatik taranır. TR Dizin ve YÖK Tez Merkezi’nde aynı konuyla tek tıkla arama yapılır; bulduğunuz tezi veya makaleyi kolayca eklersiniz.")}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[["Künye", "bg-ink-100 text-ink-600"], ["Özet", "bg-amber-50 text-amber-700"], ["Tam metin", "bg-emerald-50 text-emerald-700"]].map(([l, c]) => (
                <div key={l} className={`rounded-2xl px-3 py-3 text-sm font-medium ${c}`}>{t(l)}</div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export function Principles() {
  const { t } = useT();
  const items = [
    { icon: ShieldCheck, title: "Uydurma yok", text: "Kaynak, veri, istatistik ve bulgu üretilmez. Kaynakla desteklenemeyen kesin iddia yazılmaz; eksik konular için kaynak aranır." },
    { icon: Sparkles, title: "Sizin verileriniz", text: "Bulgular bölümü sizin analizinize dayanır. Yüklediğiniz veriler gerçek hesaplamayla özetlenir." },
    { icon: Lock, title: "Gizlilik", text: "Çalışmalarınız yalnızca size ve davet ettiğiniz ortak yazarlara görünür. Satır düzeyinde güvenlik, şifreli depolama ve tek tıkla veri silme." },
    { icon: BookCheck, title: "İntihal şeffaflığı", text: "Lisanslı bir servis bağlanmadan intihal yüzdesi gösterilmez. Sahte oranlar üretilmez." },
  ];
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="rounded-[2rem] border border-ink-100 bg-gradient-to-br from-white via-white to-brand-50/60 p-8 shadow-soft sm:p-12">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">{t("Akademik dürüstlük, tasarımın merkezinde.")}</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <div key={it.title}>
                <it.icon className="h-6 w-6 text-brand-600" />
                <h3 className="mt-3 font-semibold text-ink-900">{t(it.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{t(it.text)}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-ink-500">{t("Kaynakların nasıl doğrulandığını, iddia denetiminin ve kalite puanının nasıl çalıştığını açıkça anlatıyoruz.")} <Link href="/yontem" className="font-medium text-brand-700 hover:underline">{t("Yöntem ve şeffaflık →")}</Link></p>
        </FadeIn>
      </div>
    </section>
  );
}

export function PricingCards({ plans, signedIn }: { plans: PlanLike[]; signedIn: boolean }) {
  const { t } = useT();
  const price = usePrice();
  return (
    <>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {plans.map((p, i) => {
        const featured = p.id === "pro";
        return (
          <FadeIn key={p.id} delay={i * 0.06}>
            <div className={`relative flex h-full flex-col rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${featured ? "border-transparent bg-ink-950 text-white shadow-[0_30px_60px_-25px_rgb(21_24_41/0.6)]" : "border-ink-100 bg-white shadow-soft"}`}>
              {featured && <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-brand-500 to-sky-400 px-3 py-1 text-xs font-semibold text-white">{t("En çok tercih edilen")}</span>}
              <h3 className="text-lg font-semibold">{t(p.name)}</h3>
              <p className={`mt-1 text-sm ${featured ? "text-white/60" : "text-ink-500"}`}>{t(p.description)}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{price(Number(p.price_monthly))}</span>
                <span className={featured ? "text-white/50" : "text-ink-400"}>{isOneTimePlan(p.id) ? t("tek ödeme") : t("/ay")}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {p.features.map((f) => <li key={f} className={`flex items-start gap-2 text-sm ${featured ? "text-white/80" : "text-ink-600"}`}><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? "text-sky-300" : "text-brand-500"}`} />{t(f)}</li>)}
              </ul>
              <Link href={signedIn ? (Number(p.price_monthly) === 0 ? "/panel" : `/hesap?paket=${p.id}`) : `/kayit?paket=${p.id}`} className={`mt-7 inline-flex h-11 items-center justify-center rounded-2xl text-sm font-medium transition hover:-translate-y-0.5 ${featured ? "bg-white text-ink-900 hover:bg-white/90" : "bg-ink-900 text-white hover:bg-ink-800"}`}>
                {Number(p.price_monthly) === 0 ? t("Ücretsiz başla") : t("{name} paketini seç", { name: t(p.name) })}
              </Link>
            </div>
          </FadeIn>
        );
      })}
      <FadeIn delay={plans.length * 0.06}><TeamCard plans={plans} /></FadeIn>
    </div>
    {/* D96: sayfa vaadinin tanımı (analiz D95) */}
    <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-ink-400">{t("“Sayfa”: Türk tez biçiminde (Times New Roman 12 punto, 1,5 satır aralığı) yapay zekâ desteğiyle yazılan ana metin sayfası; kapak, içindekiler, kaynakça ve ekler sayılmaz. Değerler yaklaşıktır: taslakları sık yeniden yazdırmak daha az, verimli kullanım daha fazla sayfa sağlar.")}</p>
    </>
  );
}

/** Akademik Ekip kartı (D71): paketlerin yanında ayrı bir seçenek; teklif WhatsApp’tan alınır */
function TeamCard({ plans }: { plans: PlanLike[] }) {
  const { t } = useT();
  const price = usePrice();
  const paid = plans.filter((p) => Number(p.price_monthly) > 0 && !isOneTimePlan(p.id));
  const href = whatsappLink(t("Merhaba, Academiana Akademik Ekip paketi (%{p} indirim) için teklif almak istiyorum.\nKurum / bölüm / ekip adı: \nKişi sayısı: \nİlgilendiğimiz paket (Basic / Pro / Premium): ", { p: TEAM_DISCOUNT.percent }));
  const features = [
    t("En az {n} kişi; kişi sayısında üst sınır yok", { n: TEAM_DISCOUNT.minMembers }),
    t("Basic, Pro veya Premium: seçtiğiniz paketin tüm özellikleri"),
    t("Her üyeye kendi hesabı, kendi çalışmaları ve kullanım hakları"),
    t("Tek katılım koduyla ekibe katılım"),
    t("Yönetici paneli: kullanım özeti, roller, CSV rapor ve işlem kaydı"),
    t("Ekip adına tek ödeme"),
  ];
  return (
    <div className="relative flex h-full flex-col rounded-3xl border-2 border-brand-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1">
      <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-500 to-brand-500 px-3 py-1 text-xs font-semibold text-white">{t("%{p} indirim", { p: TEAM_DISCOUNT.percent })}</span>
      <h3 className="flex items-center gap-2 text-lg font-semibold"><Users className="h-4 w-4 text-brand-600" /> {t("Akademik Ekip")}</h3>
      <p className="mt-1 text-sm text-ink-500">{t("Akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler için.")}</p>
      <div className="mt-5">
        <div className="flex items-baseline gap-1"><span className="text-4xl font-semibold tracking-tight">%{TEAM_DISCOUNT.percent}</span><span className="text-ink-400">{t("indirim")}</span></div>
        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">{t("Kişi başı, aylık")}</p>
        <ul className="mt-1 space-y-0.5 text-[13px] text-ink-600">
          {paid.map((p) => <li key={p.id} className="flex items-baseline justify-between gap-2"><span className="font-medium text-ink-700">{t(p.name)}</span><span><s className="mr-1.5 text-[12px] text-ink-400">{price(Number(p.price_monthly))}</s><b className="font-semibold text-ink-900">{price(Math.round(discounted(Number(p.price_monthly), TEAM_DISCOUNT.percent)))}</b></span></li>)}
        </ul>
      </div>
      <ul className="mt-5 flex-1 space-y-2.5">
        {features.map((f) => <li key={f} className="flex items-start gap-2 text-sm text-ink-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{f}</li>)}
      </ul>
      <a href={href} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-brand-600 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:brightness-110">{t("Ekip teklifi al")}</a>
    </div>
  );
}
