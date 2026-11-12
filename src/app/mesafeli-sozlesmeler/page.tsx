import { LegalPage } from "@/components/legal/legal-page";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/mesafeli-sozlesmeler");
}

export default function Page() {
  return <LegalPage id="distance" />;
}

export const dynamic = "force-dynamic";
