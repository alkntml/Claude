import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/gdpr");
}

export default function Page() {
  return <LegalPage id="gdpr" />;
}

export const dynamic = "force-dynamic";
