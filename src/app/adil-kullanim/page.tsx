import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/adil-kullanim");
}

export default function Page() {
  return <LegalPage id="fair_use" />;
}

export const dynamic = "force-dynamic";
