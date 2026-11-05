import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { SampleSizeTool } from "@/components/tools/sample-size";

export async function generateMetadata() {
  return pageMeta("/araclar/orneklem-hesaplayici");
}

export default function Page() {
  return (
    <ToolShell path="/araclar/orneklem-hesaplayici" intro="Evren büyüklüğü, güven düzeyi ve hata payına göre anketiniz için gereken örneklem büyüklüğünü hesaplayın; yöntem bölümüne yazabileceğiniz hazır cümleyi alın." faq={[{ q: "Evren büyüklüğünü bilmiyorsam?", a: "Boş bırakın; çok büyük (sonsuz) evren varsayılır. %95 güven ve %5 hata payıyla bu durumda 385 kişi gerekir." }, { q: "Cochran mı, Yamane mi?", a: "Yamane formülü, %95 güven ve p = 0,5 varsayımına denk gelen basitleştirilmiş bir formüldür. Cochran formülü güven düzeyini ve beklenen oranı seçmenize izin verir." }]}>
      <SampleSizeTool />
    </ToolShell>
  );
}
