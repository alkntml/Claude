import Link from "next/link";
import { getT } from "@/i18n/server";
import { StaticPage } from "@/components/static-page";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Yardım merkezi") };
}
export const dynamic = "force-dynamic";

export default async function Help() {
  const { t } = await getT();
  let articles: { slug: string; title: string; body: string; category: string }[] = [];
  if (isSupabaseConfigured()) {
    const db = await createClient();
    const { data } = await db.from("help_articles").select("slug, title, body, category").eq("is_published", true).order("sort_order");
    articles = data ?? [];
  }
  return (
    <StaticPage title={t("Yardım merkezi")} lead={t("Platformu en verimli şekilde kullanmak için rehberler.")}>
      <p className="rounded-2xl bg-brand-50 p-4 text-[15px] text-ink-700">{t("Kaynaklar, gizlilik, ödeme ve iptal gibi konulardaki sorularınız için")} <Link href="/sss" className="font-medium text-brand-700 hover:underline">{t("Sık sorulan sorular")} →</Link></p>
      {articles.length === 0 && <p className="text-ink-500">{t("Henüz yayınlanmış yardım makalesi yok.")}</p>}
      {articles.map((a) => (
        <section key={a.slug} id={a.slug} className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-600">{t(a.category)}</p>
          <h2 className="!mt-1">{t(a.title)}</h2>
          <p className="mt-2 whitespace-pre-line text-ink-600">{t(a.body)}</p>
        </section>
      ))}
    </StaticPage>
  );
}
