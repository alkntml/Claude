import { IntelligencePage } from "@/components/intelligence-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/rasat");
}

export default function Page() {
  return <IntelligencePage id="rasat" />;
}
