import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { BibliographyTool } from "@/components/tools/references";

export async function generateMetadata() {
  return pageMeta("/araclar/kaynakca-olusturucu");
}

export default function Page() {
  return (
    <ToolShell path="/araclar/kaynakca-olusturucu" intro="DOI’yi veya yayın başlığını yazın; künye bilgileri Crossref, DataCite ve OpenAlex kayıtlarından alınır ve seçtiğiniz stilde biçimlenir. Bulunamayan kaynakları elle ekleyebilirsiniz." faq={[{ q: "Hangi atıf stilleri destekleniyor?", a: "APA 7, APA 6, ISNAD 2 (metin içi), Chicago, Turabian, Harvard, MLA 9, Vancouver, IEEE ve AMA 11." }, { q: "Künye bilgileri nereden geliyor?", a: "DOI varsa Crossref veya DataCite kaydından, yoksa başlığa göre Crossref ve OpenAlex’ten; yalnızca güçlü eşleşmeler kabul edilir. Yapay zekâ künye üretmez." }]}>
      <BibliographyTool />
    </ToolShell>
  );
}
