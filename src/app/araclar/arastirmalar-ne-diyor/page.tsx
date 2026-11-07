import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { ConsensusTool } from "@/components/tools/consensus";
import { hasAuthCookie } from "@/lib/auth";

export async function generateMetadata() {
  return pageMeta("/araclar/arastirmalar-ne-diyor");
}

/** Araştırmalar ne diyor? (D114): gerçek makale özetlerinden kaynaklı cevap ve uzlaşı göstergesi */
export default async function Page() {
  const signedIn = await hasAuthCookie();
  return (
    <ToolShell path="/araclar/arastirmalar-ne-diyor" intro="Bir araştırma sorusu yazın; OpenAlex, Europe PMC, ERIC ve Crossref’te bulunan gerçek makalelerin özetlerinden kısa ve numaralı kaynaklı bir cevap, çalışmaların ne kadarının aynı sonuca vardığını gösteren uzlaşı göstergesi ve makale listesi alın.">
      <ConsensusTool signedIn={signedIn} />
    </ToolShell>
  );
}
