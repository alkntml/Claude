"use client";
import { Play } from "lucide-react";
import { useState } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { useT } from "@/i18n/client";
import { PROMO_VIDEO } from "@/lib/site";

/**
 * Tanıtım videosu (D127). Sayfa açılırken yalnızca kapak görseli yüklenir; video tıklanınca indirilir ve oynar
 * (preload="none"), böylece ana sayfa yavaşlamaz.
 */
export function PromoVideo() {
  const { t } = useT();
  const [play, setPlay] = useState(false);
  return (
    <section id="tanitim" className="scroll-mt-24 pb-6 pt-4">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn className="mb-8 text-center">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-ink-950 sm:text-4xl">{t("68 saniyede Academiana")}</h2>
          <p className="mt-3 text-ink-500">{t("Kaynak taramasından teslim öncesi kontrole kadar bütün süreci izleyin.")}</p>
        </FadeIn>
        <FadeIn>
          <div className="relative aspect-video overflow-hidden rounded-3xl border border-ink-100 bg-ink-950 shadow-[0_40px_80px_-40px_rgb(21_24_41/0.45)]">
            {play ? (
              <video className="h-full w-full" src={PROMO_VIDEO.src} poster={PROMO_VIDEO.poster} controls autoPlay playsInline preload="none" aria-label={t("Academiana tanıtım videosu")} />
            ) : (
              <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={t("Tanıtım videosunu oynat")}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PROMO_VIDEO.poster} alt="" className="h-full w-full object-cover" loading="lazy" />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/35 via-transparent to-transparent transition group-hover:from-ink-950/45" />
                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-b from-brand-500 to-brand-600 py-2 pl-2 pr-4 text-sm font-semibold text-white shadow-[0_16px_32px_-12px_rgb(39_71_220/0.8)] transition group-hover:-translate-y-0.5 sm:bottom-6 sm:left-6 sm:py-2.5 sm:pl-2.5 sm:pr-5 sm:text-base">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 sm:h-10 sm:w-10"><Play className="ml-0.5 h-4 w-4 fill-current sm:h-5 sm:w-5" /></span>
                  {t("Tanıtımı izle")} <span className="font-normal text-white/75">· 1:08</span>
                </span>
              </button>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
