import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { FakeCheckTool } from "@/components/tools/fake-check";

export async function generateMetadata() {
  return pageMeta("/araclar/uydurma-kaynak-kontrolu");
}

export default function Page() {
  return (
    <ToolShell path="/araclar/uydurma-kaynak-kontrolu" intro="Yapay zekâ araçlarının ürettiği metinlerde sıkça uydurma kaynak bulunur. Kaynakçanızı yapıştırın; her kaynak Crossref, DataCite ve OpenAlex kayıtlarında aranır, DOI’si başka yayına ait olan veya hiç bulunamayan kaynaklar işaretlenir." faq={[{ q: "Bulunamadı ne demek?", a: "Kaynak bu veri tabanlarında yok demektir. Uydurma olabilir; ancak kitap, tez ve dizinlenmemiş dergiler de bulunamayabilir, bunları kütüphane kataloğunda elle kontrol edin." }, { q: "Yapay zekâ kullanılıyor mu?", a: "Kontrolün kendisi kayıt otoritelerinde yapılır. Yalnızca düzgün okunamayan kaynak satırlarını alanlarına ayırmak için küçük bir yapay zekâ modeli kullanılır; o da bilgi üretmez." }]}>
      <FakeCheckTool />
    </ToolShell>
  );
}
