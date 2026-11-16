"use client";
/**
 * D215: Ana sayfada özelliklerin hemen ardından “Örnekler”: örnek bir tez üzerinde üretilmiş gerçek çıktıların
 * (Örnekler sayfası) kısa vitrini; her kart çıktıyı üreten zekâyı (Zenit, Rasat, Mizan) gösterir.
 */
import { ArrowRight, BarChart3, Compass, FileDown, Link2, PenLine, Search, ShieldCheck, Sigma, Table2 } from "lucide-react";
import Link from "@/components/l-link";
import { BrandMark, type Signature } from "@/components/brand-mark";
import { FadeIn } from "@/components/ui/fade-in";
import { useT } from "@/i18n/client";
import { SECTIONS, pick } from "@/lib/samples";

const PICKS: { id: string; mark?: Signature; Icon: typeof Compass }[] = [
  { id: "kurgu", mark: "Zenit", Icon: Compass },
  { id: "yazim", mark: "Zenit", Icon: PenLine },
  { id: "butunluk", mark: "Zenit", Icon: Link2 },
  { id: "kaynak", mark: "Rasat", Icon: Search },
  { id: "matris", mark: "Rasat", Icon: Table2 },
  { id: "kalite", mark: "Mizan", Icon: ShieldCheck },
  { id: "istatistik", Icon: Sigma },
  { id: "grafik", Icon: BarChart3 },
  { id: "cikti", Icon: FileDown },
];

export function SamplesTeaser() {
  const { t, locale } = useT();
  const items = PICKS.map((p) => ({ ...p, s: SECTIONS.find((x) => x.id === p.id) })).filter((p) => p.s);
  return (
    <section id="ornekler-onizleme" className="scroll-mt-24 bg-ink-50/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">{t("Örnekler")}</p>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-ink-950 sm:text-5xl">{t("Söz vermiyoruz, gösteriyoruz")}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-ink-500">{t("Örnek bir tez üzerinde her özelliğin gerçek çıktısını kaydolmadan inceleyin: kurgu, atıflı bölüm taslağı, kaynak doğrulama, literatür matrisi, kalite raporu, APA tabloları ve Word çıktısı.")}</p>
        </FadeIn>
        <FadeIn className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ id, mark, Icon, s }) => (
            <Link key={id} href={`/ornekler#${id}`} className="group flex h-full flex-col rounded-2xl border border-ink-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><Icon className="h-4 w-4" /></span>
                {mark && <BrandMark name={mark} className="text-[13px]" />}
              </div>
              <p className="mt-3 text-[15px] font-semibold text-ink-900">{pick(s!.title, locale)}</p>
              <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-ink-500">{pick(s!.what, locale)}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-3 text-[13px] font-medium text-brand-700">{t("Örneği gör")} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </FadeIn>
        <p className="mt-8 text-center"><Link href="/ornekler" className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-200 bg-white px-6 text-sm font-medium text-ink-800 transition hover:border-ink-300">{t("Bütün örnekleri incele")} <ArrowRight className="h-4 w-4" /></Link></p>
      </div>
    </section>
  );
}
