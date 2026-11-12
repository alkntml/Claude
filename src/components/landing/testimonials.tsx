import { Quote, Star } from "lucide-react";
import { getT } from "@/i18n/server";
import { FadeIn } from "@/components/ui/fade-in";
import { initials, TESTIMONIALS } from "@/lib/testimonials";

/** Ana sayfa: akademisyen ve araştırmacı görüşleri (D147). Özgün dilinde, değiştirilmeden. */
export async function Testimonials() {
  const { t } = await getT();
  return (
    <section id="gorusler" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Akademisyenler ve araştırmacılar ne diyor?")}</h2>
          <p className="mt-3 text-ink-500">{t("Platformu inceleyen akademisyen ve araştırmacıların görüşleri. Görüşler özgün dilinde ve değiştirilmeden yayımlanmıştır.")}</p>
        </FadeIn>
        <div className="flex flex-wrap justify-center gap-5">
          {TESTIMONIALS.map((x) => (
            <figure key={x.name} className="card flex w-full flex-col p-6 sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 text-amber-500" role="img" aria-label={t("5 üzerinden {n} yıldız", { n: x.rating })}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-4 w-4" fill={i < x.rating ? "currentColor" : "none"} />)}
                </div>
                <Quote className="h-5 w-5 text-ink-200" aria-hidden="true" />
              </div>
              <blockquote lang={x.lang} className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-700">“{x.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700" aria-hidden="true">{initials(x.name)}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink-900">{x.name}</span>
                  <span className="block text-[13px] text-ink-500">{x.role} · {x.country}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
