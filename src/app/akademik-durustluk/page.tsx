import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/akademik-durustluk");
}

export default function Page() {
  return <LegalPage id="integrity" />;
}

export const dynamic = "force-dynamic";
