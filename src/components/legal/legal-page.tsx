import Link from "@/components/l-link";
import { StaticPage } from "@/components/static-page";
import { getLocale, getT } from "@/i18n/server";
import { legalDoc, LEGAL_DOCS, type LegalDocId } from "@/lib/legal/docs";
import { legalContent } from "@/lib/legal/content";

/** Hukuki belge sayfası (D154): bölümler PDF’teki sırayla; üstte “Gizlilik ve Güvenlik” belgeleri arasında gezinme */
export async function LegalPage({ id }: { id: LegalDocId }) {
  const [locale, { t }] = await Promise.all([getLocale(), getT()]);
  const doc = legalDoc(id);
  const sections = legalContent(locale)[id];
  const translated = doc.original !== locale;
  const date = new Date(`${doc.version}T00:00:00Z`).toLocaleDateString(locale === "tr" ? "tr-TR" : locale === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <StaticPage path={doc.path} title={doc.title[locale]}>
      <nav aria-label={t("Gizlilik ve Güvenlik")} className="-mt-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 text-sm">
        <p className="mb-2 font-semibold text-ink-800">{t("Gizlilik ve Güvenlik")}</p>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 [&>li]:!ml-0 [&>li]:!list-none">
          {LEGAL_DOCS.map((d) => (
            <li key={d.id}>
              {d.id === id
                ? <span aria-current="page" className="font-medium text-ink-900">{t(d.label)}</span>
                : <Link href={d.path} className="text-brand-700 hover:underline">{t(d.label)}</Link>}
            </li>
          ))}
        </ul>
      </nav>
      <p className="text-sm text-ink-500">
        {t("Sürüm")}: {date}
        {translated && <> · {doc.original === "en" ? t("Bu metnin aslı İngilizcedir; bu sayfa çevirisidir.") : t("Bu metnin aslı Türkçedir; bu sayfa çevirisidir.")}</>}
      </p>
      {sections.map((s, i) => (
        <section key={i} aria-labelledby={`b${i + 1}`}>
          <h2 id={`b${i + 1}`}>{s.h}</h2>
          {s.b.map((b, j) => ("p" in b
            ? <p key={j} className="mt-3">{b.p}</p>
            : <ul key={j} className="mt-3 space-y-2">{b.ul.map((x, k) => <li key={k}>{x}</li>)}</ul>))}
        </section>
      ))}
    </StaticPage>
  );
}
