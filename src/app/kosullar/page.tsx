import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/kosullar");
}

export default function Page() {
  return <LegalPage id="terms" />;
}

export const dynamic = "force-dynamic";
