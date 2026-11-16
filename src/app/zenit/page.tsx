import { IntelligencePage } from "@/components/intelligence-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/zenit");
}

export default function Page() {
  return <IntelligencePage id="zenit" />;
}
