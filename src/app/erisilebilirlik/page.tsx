import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";
import { A11Y } from "@/lib/accessibility-content";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/erisilebilirlik");
}

/** Erişilebilirlik beyanı (D213) */
export default async function AccessibilityPage() {
  const c = A11Y[await getLocale()];
  return (
    <StaticPage path="/erisilebilirlik" title={c.title} lead={c.lead}>
      {c.sections.map((s) => (
        <section key={s.h}>
          <h2>{s.h}</h2>
          {"p" in s && s.p.map((x) => <p key={x}>{x}</p>)}
          {"list" in s && <ul className="list-disc space-y-1.5 pl-5">{s.list.map((x) => <li key={x}>{x}</li>)}</ul>}
        </section>
      ))}
      <p className="text-[13px] text-ink-500">{c.date}</p>
    </StaticPage>
  );
}
