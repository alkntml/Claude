import { getT } from "@/i18n/server";
import { TopicExplorer } from "@/components/dashboard/topic-explorer";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Konu bulma") };
}

export default function Page() {
  return <TopicExplorer />;
}
