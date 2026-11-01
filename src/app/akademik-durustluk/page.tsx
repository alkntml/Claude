import { StaticPage } from "@/components/static-page";
export const metadata = { title: "Akademik dürüstlük ilkeleri" };
export default function Page() {
  return (
    <StaticPage title="Akademik dürüstlük ilkelerimiz" lead="Platformun nasıl davrandığını ve neden öyle davrandığını açıkça yazıyoruz.">
      <h2>1. Kaynaklar gerçektir</h2>
      <p>Kaynak önerileri yalnızca akademik veri tabanlarından (OpenAlex, Crossref, PubMed vb.) gelen sonuçlardır. Yapay zekâ yalnızca projenize eklediğiniz kaynaklara atıf yapabilir. Kaynak yoksa <b>[KAYNAK GEREKLİ]</b> işareti koyar.</p>
      <h2>2. Erişim seviyesi açıkça belirtilir</h2>
      <p>Her kaynak için yalnızca künyenin mi, özetin mi, yoksa tam metnin mi okunduğu gösterilir. Yalnızca özeti okunan bir makale tam metni okunmuş gibi değerlendirilmez. Doğrudan alıntı ve sayfa numarası yalnızca tam metni analiz edilen kaynaklarda kullanılır.</p>
      <h2>3. Doğrulama</h2>
      <p>DOI'ler Crossref ve DataCite, PMID'ler Europe PMC, arXiv kimlikleri arXiv üzerinden doğrulanır. Doğrulanamayan kaynaklar uyarıyla gösterilir.</p>
      <h2>4. Veri ve bulgu üretilmez</h2>
      <p>Bulgular, istatistikler ve analiz sonuçları yalnızca sizin verinizden gelir. Yüklediğiniz CSV/XLSX dosyalarının betimsel istatistikleri deterministik olarak hesaplanır. Yapay zekâ bu değerleri yorumlayabilir ama uyduramaz.</p>
      <h2>5. İntihal</h2>
      <p>Platform kendi başına intihal yüzdesi hesapladığını iddia etmez. Lisanslı bir intihal servisi entegre edildiğinde sonuçlar ayrıca gösterilir.</p>
    </StaticPage>
  );
}
