import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo-server";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return pageMeta("/akademik-durustluk");
}

export default async function Page() {
  const locale = await getLocale();
  if (locale === "de") {
    return (
      <StaticPage path="/akademik-durustluk" title="Unsere Grundsätze wissenschaftlicher Integrität" lead="Wir legen offen dar, wie sich die Plattform verhält und warum.">
        <h2>1. Quellen sind echt</h2>
        <p>Quellenvorschläge stammen ausschließlich aus wissenschaftlichen Datenbanken (OpenAlex, Crossref, PubMed und weitere). Die KI kann nur Quellen zitieren, die Ihrem Projekt hinzugefügt wurden. Absolute Aussagen, die sie nicht mit einer Quelle belegen kann, schreibt sie nicht; solche Themen meldet sie gesondert, und das System sucht dafür nach Quellen.</p>
        <h2>2. Die Zugriffsstufe wird offengelegt</h2>
        <p>Für jede Quelle zeigen wir, ob nur die bibliografischen Angaben, das Abstract oder der Volltext gelesen wurde. Ein Artikel, von dem nur das Abstract gelesen wurde, wird nie so behandelt, als wäre sein Volltext gelesen worden. Direkte Zitate und Seitenzahlen werden nur bei Quellen verwendet, deren Volltext analysiert wurde.</p>
        <h2>3. Verifizierung</h2>
        <p>DOIs werden über Crossref und DataCite verifiziert, PMIDs über Europe PMC und arXiv-IDs über arXiv. Nicht verifizierte Quellen werden mit einem Warnhinweis angezeigt.</p>
        <h2>4. Es werden keine Daten oder Ergebnisse erzeugt</h2>
        <p>Ergebnisse, Statistiken und Analyseresultate stammen ausschließlich aus Ihren Daten. Die deskriptiven Statistiken Ihrer CSV-/XLSX-Dateien werden deterministisch berechnet. Die KI darf diese Werte interpretieren, erfindet sie aber nie.</p>
        <h2>5. Plagiat</h2>
        <p>Die Plattform behauptet nicht, selbst einen Plagiatsprozentsatz zu berechnen. Ergebnisse werden erst gesondert angezeigt, wenn ein lizenzierter Plagiatsdienst angebunden ist.</p>
      </StaticPage>
    );
  }
  if (locale === "en") {
    return (
      <StaticPage path="/akademik-durustluk" title="Our academic integrity principles" lead="We state plainly how the platform behaves and why.">
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
    <StaticPage path="/akademik-durustluk" title="Akademik dürüstlük ilkelerimiz" lead="Platformun nasıl davrandığını ve neden öyle davrandığını açıkça yazıyoruz.">
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
