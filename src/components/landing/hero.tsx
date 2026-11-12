"use client";
import { useT } from "@/i18n/client";
import { ArrowRight, BadgeCheck } from "lucide-react";
import Link from "@/components/l-link";

export function Hero({ signedIn }: { signedIn: boolean }) {
  const { t } = useT();

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_75%)]" />
      {/* Arka plan renkleri: bulanıklık yerine yumuşak radyal geçiş (ekran kartını yormaz; D57) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_8%_0%,rgb(147_168_250/0.35),transparent_70%),radial-gradient(460px_circle_at_95%_20%,rgb(125_211_252/0.28),transparent_70%),radial-gradient(320px_circle_at_40%_100%,rgb(253_230_138/0.28),transparent_70%)]" />

      {/* D151: ortalanmış, resmî manşet — eğik/renkli vurgu yok; temel mesaj: eksiksiz akademik çalışma alanı */}
      <div className="relative mx-auto max-w-6xl animate-rise px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white/90 px-3.5 py-1 text-[13px] font-medium text-ink-600">
            <BadgeCheck className="h-3.5 w-3.5 text-brand-600" /> {t("Yapay zekâ destekli eksiksiz akademik araştırma ve çalışma alanı")}
          </div>
          <h1 className="font-serif text-[40px] font-semibold leading-[1.1] tracking-tight text-ink-950 sm:text-[64px]">
            {t("Akademik çalışmanızın tamamı, baştan sona tek bir çalışma alanında.")}
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-600 sm:text-xl">
            {t("Tezinizi, makalenizi ve bilimsel araştırmalarınızı yapay zekâ desteğiyle; doğrulanmış kaynaklara dayalı, her atıfı denetlenmiş ve eksiksiz biçimde yazın.")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href={signedIn ? "/yeni" : "/kayit"} className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-7 font-medium text-white transition hover:bg-brand-700">
              {t("Çalışmaya başla")} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link href="#tur-sec" className="inline-flex h-12 items-center rounded-xl border border-ink-200 bg-white px-7 font-medium text-ink-700 transition hover:border-ink-300">{t("Çalışma türlerini gör")}</Link>
          </div>
          <p className="mt-7 flex items-center justify-center gap-2 text-[15px] text-ink-600">
            <span className="flex -space-x-1.5">{["bg-brand-500", "bg-sky-400", "bg-amber-400", "bg-emerald-400"].map((c) => <span key={c} className={`h-6 w-6 rounded-full border-2 border-white ${c}`} />)}</span>
            {t("10.000’den fazla araştırmacı tarafından tercih edildi")}
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("Uydurma kaynak yok")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("Atıflar kaynağında denetlenir")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("16 veri tabanı, 250 milyon+ yayın")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("10 atıf stili")}</li>
            <li className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-500" /> {t("KVKK uyumlu")}</li>
          </ul>
        </div>
        {/* Sürecin tamamı: baştan sona adımlar */}
        <ol className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 text-left sm:grid-cols-3 lg:grid-cols-6">
          {[["Konu ve başlık", "Konu bulma, başlık önerisi"], ["Kurgu", "Problem, amaç, bölüm planı"], ["Kaynaklar", "16 veri tabanında doğrulanmış tarama"], ["Yazım", "Bölüm bölüm, atıflı taslak"], ["Analiz", "İstatistik, grafik, anket"], ["Denetim ve teslim", "İddia denetimi, Word/PDF/LaTeX"]].map(([a, b], i) => (
            <li key={a} className="bg-white p-4">
              <p className="text-[12px] font-semibold tabular-nums text-brand-600">{String(i + 1).padStart(2, "0")}</p>
              <p className="mt-1 text-[14px] font-semibold text-ink-900">{t(a)}</p>
              <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">{t(b)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
