import { StaticPage } from "@/components/static-page";
import { StatusBoard } from "@/components/status-board";
import { getT } from "@/i18n/server";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/durum");
}

/** Sistem durumu (D213): sayfa önbelleklenir, durum tarayıcıda canlı okunur. */
export default async function StatusPage() {
  const { t } = await getT();
  return (
    <StaticPage path="/durum" title={t("Sistem durumu")} lead={t("Academiana’nın ve bağlı olduğu hizmetlerin anlık durumu. Sayfa her dakika kendiliğinden yenilenir.")}>
      <StatusBoard />
      <p className="text-[14px] text-ink-500">{t("Akademik veri tabanlarından biri yavaşsa arama diğer veri tabanlarıyla sürer; yalnızca o kaynaktan gelen sonuçlar gecikebilir.")}</p>
    </StaticPage>
  );
}
