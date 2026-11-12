import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/kvkk");
}

export default function Page() {
  return <LegalPage id="kvkk" />;
}

export const dynamic = "force-dynamic";
