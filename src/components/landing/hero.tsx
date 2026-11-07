"use client";
import { useT } from "@/i18n/client";
import { ArrowRight, BadgeCheck, BookMarked, FileCheck2, Quote, Sparkles } from "lucide-react";
import Link from "@/components/l-link";

export function Hero({ signedIn }: { signedIn: boolean }) {
  const { t } = useT();

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
      {/* Arka plan renkleri: bulanıklık yerine yumuşak radyal geçiş (ekran kartını yormaz; D57) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_8%_0%,rgb(147_168_250/0.35),transparent_70%),radial-gradient(460px_circle_at_95%_20%,rgb(125_211_252/0.28),transparent_70%),radial-gradient(320px_circle_at_40%_100%,rgb(253_230_138/0.28),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl animate-rise items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-[13px] font-medium text-brand-700 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" /> {t("250 milyondan fazla akademik yayını tarar")}
          </div>
          <h1 className="font-serif text-[42px] font-medium leading-[1.05] tracking-tight text-ink-950 sm:text-6xl">
            {t("Akademik çalışmanızı")} <span className="text-gradient italic">{t("ilk fikirden")}</span> {t("son kaynakçaya kadar yönetin.")}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-500">
            {t("Tez, makale ve araştırma önerinizi adım adım ilerleyen bir yol haritasıyla hazırlayın. Kaynaklar OpenAlex, Crossref ve PubMed gibi veri tabanlarından gelir ve doğrulanır. Atıflar seçtiğiniz stile göre kendiliğinden biçimlenir.")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={signedIn ? "/yeni" : "/kayit"} className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-b from-brand-500 to-brand-600 px-6 font-medium text-white shadow-[0_14px_30px_-12px_rgb(39_71_220/0.8)] transition hover:-translate-y-0.5">
              {t("Çalışmaya başla")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="#tur-sec" className="inline-flex h-12 items-center rounded-2xl border border-ink-200 bg-white/80 px-6 font-medium text-ink-700 transition hover:border-ink-300 hover:bg-white">{t("Çalışma türlerini gör")}</Link>
          </div>
          {/* Sosyal kanıt: sahibinin önceki işinden taşınan araştırmacı kitlesi (D63) */}
          <p className="mt-7 flex items-center gap-2 text-[15px] text-ink-600">
            <span className="flex -space-x-1.5">{["bg-brand-500", "bg-sky-400", "bg-amber-400", "bg-emerald-400"].map((c) => <span key={c} className={`h-6 w-6 rounded-full border-2 border-white ${c}`} />)}</span>
            {t("10.000’den fazla araştırmacı tarafından tercih edildi")}
          </p>
          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("Uydurma kaynak yok")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("Atıflar kaynağında denetlenir")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("12 akademik veri tabanı")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("10 atıf stili")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("KVKK uyumlu")}</li>
          </ul>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_40px_80px_-30px_rgb(21_24_41/0.35)]" aria-hidden>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-ink-400"><span className="h-2 w-2 rounded-full bg-emerald-400" /> 2.3 {t("Kavramsal çerçeve")}</div>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">APA 7</span>
            </div>
            <p className="font-serif text-[15px] leading-7 text-ink-700">
              {t("Ebeveyn tutumları, bireyin yakın ilişkilerdeki bağlanma örüntülerini şekillendiren temel etkenler arasında yer almaktadır")} <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 font-sans text-[12px] text-brand-700">(Bowlby, 1969)</span>. {t("İlişki odaklı obsesif belirtiler ise partnere yönelik yineleyici şüphelerle karakterizedir")} <span className="rounded-md border border-brand-100 bg-brand-50 px-1.5 font-sans text-[12px] text-brand-700">({t("Doron vd., 2014")})</span>.
            </p>
            <div className="mt-5 space-y-2">
              {[[t("Doron, G. vd. (2014)"), t("Crossref ile doğrulandı · Özet okundu"), "green"], ["Bowlby, J. (1969)", t("Kitap künyesi · Yalnızca künye"), "amber"]].map(([a, b, c]) => (
                <div key={a} className="flex items-center gap-3 rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2">
                  <BookMarked className="h-4 w-4 text-ink-400" />
                  <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-ink-800">{a}</p><p className="text-[11px] text-ink-500">{b}</p></div>
                  <span className={`h-2 w-2 rounded-full ${c === "green" ? "bg-emerald-400" : "bg-amber-400"}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-8 -left-10 flex items-center gap-3 rounded-2xl border border-white/70 bg-white px-4 py-3 shadow-xl" aria-hidden>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><FileCheck2 className="h-5 w-5" /></div>
            <div><p className="text-[13px] font-semibold text-ink-800">{t("Kalite skoru 86")}</p><p className="text-[11px] text-ink-500">{t("2 eksik künye · 0 eşleşmeyen atıf")}</p></div>
          </div>
          <div className="absolute -right-6 -top-8 flex items-center gap-2 rounded-2xl bg-ink-900 px-4 py-2.5 text-white shadow-xl" aria-hidden>
            <Quote className="h-4 w-4 text-amber-300" /><span className="text-[13px]">{t("OpenAlex · Crossref · PubMed taranıyor…")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
