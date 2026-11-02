import { ExternalLink } from "lucide-react";
import { pageMeta } from "@/lib/seo-server";
import { StaticPage } from "@/components/static-page";
import { getT } from "@/i18n/server";
import { EXPERT_SERVICES, expertUrl } from "@/lib/expert";

export async function generateMetadata() {
  return pageMeta("/uzman-destegi");
}

/** İnsan uzman hizmetleri: iş ortağı dermanlik.com.tr'ye yönlendirir */
export default async function Expert() {
  const { t } = await getT();
  return (
    <StaticPage path="/uzman-destegi" title={t("Uzman desteği")} lead={t("Yapay zekânın yetmediği yerde akademik uzmanlar: redaksiyon, istatistik, çeviri ve biçim kontrolü.")}>
      <div className="grid gap-3 sm:grid-cols-2">
        {EXPERT_SERVICES.map((s) => (
          <a key={s.id} href={expertUrl(s.id, "expert-page")} target="_blank" rel="noopener noreferrer" className="card group block p-5 transition hover:-translate-y-0.5 hover:border-brand-200">
            <p className="flex items-center gap-2 font-semibold text-ink-900">{t(s.title)}<ExternalLink className="h-4 w-4 text-ink-400 group-hover:text-brand-600" /></p>
            <p className="mt-1 text-[14.5px] text-ink-600">{t(s.desc)}</p>
          </a>
        ))}
      </div>
      <p className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-600">{t("Bu hizmetler iş ortağımız dermanlik.com.tr tarafından sunulur; sipariş, fiyat ve teslim koşulları o sitede belirlenir. Academiana hesabınızdaki çalışmalarınız siz paylaşmadıkça iş ortağıyla paylaşılmaz.")}</p>
      <p className="text-sm text-ink-500">{t("Akademik dürüstlük: Uzman desteği metninizin düzeltilmesi ve danışmanlık içindir; çalışmanın başkası tarafından yazılması kurumların etik kurallarına aykırıdır.")}</p>
      <a href={expertUrl(undefined, "expert-page")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-ink-900 px-5 py-3 font-medium text-white transition hover:bg-ink-800">{t("dermanlik.com.tr’ye git")} <ExternalLink className="h-4 w-4" /></a>
    </StaticPage>
  );
}
