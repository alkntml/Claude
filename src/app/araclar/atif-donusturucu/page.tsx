import { pageMeta } from "@/lib/seo-server";
import { ToolShell } from "@/components/tools/tool-shell";
import { ConvertTool } from "@/components/tools/references";

export async function generateMetadata() {
  return pageMeta("/araclar/atif-donusturucu");
}

export default function Page() {
  return (
    <ToolShell path="/araclar/atif-donusturucu" intro="Hazır kaynakçanızı yapıştırın, istediğiniz stile çevrilsin: APA’dan ISNAD’a, MLA’dan APA’ya… Zotero, Mendeley veya EndNote’tan alınan BibTeX ve RIS dosyaları da desteklenir." faq={[{ q: "Dönüştürme ne kadar doğru?", a: "BibTeX ve RIS kayıtları eksiksiz okunur. Düz metin kaynakçalarda her satır ayrıştırılır ve “eksik bilgileri tamamla” açıksa DOI veya başlıkla resmî kayıttan düzeltilir; yine de sonucu kontrol edin." }]}>
      <ConvertTool />
    </ToolShell>
  );
}
