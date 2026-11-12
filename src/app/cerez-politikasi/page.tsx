import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/cerez-politikasi");
}

export default function Page() {
  return <LegalPage id="cookies" />;
}

export const dynamic = "force-dynamic";
