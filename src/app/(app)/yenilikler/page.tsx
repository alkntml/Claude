import { WithMarks } from "@/components/brand-mark";
import { cn } from "@/components/ui/cn";
import { getLocale, getT } from "@/i18n/server";
import { CHANGELOG, type ChangeTag } from "@/lib/changelog";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Yenilikler"), robots: { index: false } };
}

const TAG: Record<ChangeTag, [string, string]> = { new: ["Yeni", "bg-brand-600 text-white"], improved: ["İyileştirme", "bg-emerald-50 text-emerald-700"], fixed: ["Düzeltme", "bg-ink-100 text-ink-700"] };

/** Yenilikler (D213): yalnızca oturum açmış üyeler görür ((app) düzeni oturum ister). */
export default async function ChangelogPage() {
  const [{ t }, locale] = await Promise.all([getT(), getLocale()]);
  const days = [...new Set(CHANGELOG.map((e) => e.date))];
  const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : locale === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-4xl font-medium tracking-tight text-ink-950">{t("Yenilikler")}</h1>
      <p className="mt-2 text-ink-500">{t("Academiana’ya eklenen yeni özellikler ve iyileştirmeler. En yenisi en üstte.")}</p>
      <ol className="mt-10 space-y-10 border-l border-ink-100 pl-6">
        {days.map((d) => (
          <li key={d} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-brand-600 ring-2 ring-brand-100" />
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-400">{fmt.format(new Date(`${d}T12:00:00Z`))}</p>
            <div className="mt-3 space-y-3">
              {CHANGELOG.filter((e) => e.date === d).map((e) => (
                <article key={e.title.tr} className="rounded-2xl border border-ink-100 bg-white p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", TAG[e.tag][1])}>{t(TAG[e.tag][0])}</span>
                    <h2 className="font-semibold text-ink-900"><WithMarks text={e.title[locale]} /></h2>
                  </div>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-600"><WithMarks text={e.text[locale]} /></p>
                </article>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
