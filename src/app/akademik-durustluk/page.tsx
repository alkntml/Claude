import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getLocale()) === "en" ? "Academic integrity" : "Akademik dürüstlük ilkeleri" };
}

export default async function Page() {
  if ((await getLocale()) === "en") {
    return (
      <StaticPage title="Our academic integrity principles" lead="We state plainly how the platform behaves and why.">
        <h2>1. Sources are real</h2>
        <p>Source suggestions come only from academic databases (OpenAlex, Crossref, PubMed and others). The AI can cite only the sources in your project. It does not write definite claims it cannot support with a source; it reports such topics separately and the system searches for sources for them.</p>
        <h2>2. Access level is stated</h2>
        <p>For every source we show whether only the bibliographic record, the abstract or the full text was read. An article whose abstract alone was read is never treated as if its full text had been read. Direct quotes and page numbers are used only for sources whose full text was analysed.</p>
        <h2>3. Verification</h2>
        <p>DOIs are verified through Crossref and DataCite, PMIDs through Europe PMC and arXiv IDs through arXiv. Unverified sources are shown with a warning.</p>
        <h2>4. No data or findings are generated</h2>
        <p>Findings, statistics and analysis results come only from your data. Descriptive statistics of your CSV/XLSX files are computed deterministically. The AI may interpret these values but never invents them.</p>
        <h2>5. Plagiarism</h2>
        <p>The platform does not claim to calculate a plagiarism percentage on its own. Results are shown separately only once a licensed plagiarism service is integrated.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage title="Akademik dürüstlük ilkelerimiz" lead="Platformun nasıl davrandığını ve neden öyle davrandığını açıkça yazıyoruz.">
      <h2>1. Kaynaklar gerçektir</h2>
      <p>Kaynak önerileri yalnızca akademik veri tabanlarından (OpenAlex, Crossref, PubMed vb.) gelen sonuçlardır. Yapay zekâ yalnızca projenize eklenen kaynaklara atıf yapabilir. Kaynakla destekleyemediği kesin iddiaları yazmaz; bu konuları ayrıca bildirir ve sistem bunlar için kaynak arar.</p>
      <h2>2. Erişim seviyesi açıkça belirtilir</h2>
      <p>Her kaynak için yalnızca künyenin mi, özetin mi, yoksa tam metnin mi okunduğu gösterilir. Yalnızca özeti okunan bir makale tam metni okunmuş gibi değerlendirilmez. Doğrudan alıntı ve sayfa numarası yalnızca tam metni analiz edilen kaynaklarda kullanılır.</p>
      <h2>3. Doğrulama</h2>
      <p>DOI’ler Crossref ve DataCite, PMID’ler Europe PMC, arXiv kimlikleri arXiv üzerinden doğrulanır. Doğrulanamayan kaynaklar uyarıyla gösterilir.</p>
      <h2>4. Veri ve bulgu üretilmez</h2>
      <p>Bulgular, istatistikler ve analiz sonuçları yalnızca sizin verinizden gelir. Yüklediğiniz CSV/XLSX dosyalarının betimsel istatistikleri deterministik olarak hesaplanır. Yapay zekâ bu değerleri yorumlayabilir ama uyduramaz.</p>
      <h2>5. İntihal</h2>
      <p>Platform kendi başına intihal yüzdesi hesapladığını iddia etmez. Lisanslı bir intihal servisi entegre edildiğinde sonuçlar ayrıca gösterilir.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
