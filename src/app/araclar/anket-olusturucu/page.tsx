import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { SurveyBuilderTool } from "@/components/tools/survey-builder";

export async function generateMetadata() {
  return pageMeta("/araclar/anket-olusturucu");
}

export default function Page() {
  return (
    <ToolShell path="/araclar/anket-olusturucu" intro="Anket sorularınızı hazırlayın, hızlı kontrolle yaygın hataları görün; yazdırın veya ücretsiz hesap açarak çevrim içi yayınlayıp cevap toplayın." faq={[]}>
      <SurveyBuilderTool />
    </ToolShell>
  );
}
