import { Database, Lock, ShieldCheck, Sparkles } from "lucide-react";
import Link from "@/components/l-link";
import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";
import { TRUST } from "@/lib/trust-content";

export async function generateMetadata() {
  return pageMeta("/guven");
}

const ICONS = [Sparkles, Database, Lock, ShieldCheck];
const LINKS: Record<string, { tr: string; en: string; de: string; href: string }[]> = {
  dogruluk: [{ tr: "Yöntem ve şeffaflık →", en: "Method and transparency →", de: "Methode und Transparenz →", href: "/yontem" }],
  haklar: [{ tr: "KVKK aydınlatma metni →", en: "KVKK privacy notice →", de: "KVKK-Datenschutzhinweis →", href: "/kvkk" }, { tr: "GDPR →", en: "GDPR →", de: "DSGVO →", href: "/gdpr" }],
};

/** Güven merkezi (D213): veri konumu, hizmet sağlayıcılar, yapay zekâ eğitimi, erişim, güvenlik, haklar. */
export default async function TrustPage() {
  const locale = await getLocale();
  const c = TRUST[locale];
  return (
    <StaticPage path="/guven" title={c.title} lead={c.lead}>
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {c.pillars.map(([h, p], i) => {
          const I = ICONS[i];
          return (
            <div key={h} className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><I className="h-4 w-4" /></span>
              <div><p className="font-semibold text-ink-900">{h}</p><p className="mt-0.5 text-[14px] text-ink-600">{p}</p></div>
            </div>
          );
        })}
      </div>
      {c.sections.map((s) => (
        <section key={s.id} id={s.id}>
          <h2>{s.h}</h2>
          {s.p?.map((x) => <p key={x}>{x}</p>)}
          {s.list && <ul className="list-disc space-y-1.5 pl-5">{s.list.map((x) => <li key={x}>{x}</li>)}</ul>}
          {LINKS[s.id] && <p className="flex flex-wrap gap-4">{LINKS[s.id].map((l) => <Link key={l.href} href={l.href} className="font-medium text-brand-700 hover:underline">{l[locale]}</Link>)}</p>}
          {s.id === "konum" && (
            <div className="overflow-x-auto rounded-2xl border border-ink-100" tabIndex={0} role="region" aria-label={c.providersTitle}>
              <table className="w-full min-w-[520px] text-left text-[14px]">
                <caption className="px-4 pt-3 text-left font-semibold text-ink-900">{c.providersTitle}</caption>
                <thead className="text-ink-500"><tr>{c.providersHead.map((h) => <th key={h} scope="col" className="px-4 py-2 font-medium">{h}</th>)}</tr></thead>
                <tbody>{c.providers.map((p) => <tr key={p.name} className="border-t border-ink-100"><td className="px-4 py-2 font-medium text-ink-900">{p.name}</td><td className="px-4 py-2">{p.role}</td><td className="px-4 py-2">{p.location}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </section>
      ))}
      <p className="text-[13px] text-ink-400">{c.checked}</p>
    </StaticPage>
  );
}
