import Link from "@/components/l-link";
import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";
import { SEVERITY_WEIGHTS } from "@/lib/quality/score";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/yontem");
}

const W = SEVERITY_WEIGHTS;

/**
 * Yöntem ve şeffaflık (D120): kaynakların nereden geldiği, nasıl doğrulandığı, iddia denetiminin ve kalite puanının
 * nasıl çalıştığı, bilinen sınırlamalar. Yalnızca sistemin gerçekte yaptığını anlatır; performans iddiası içermez.
 */
export default async function MethodPage() {
  const en = (await getLocale()) === "en";
  if (en) {
    return (
      <StaticPage path="/yontem" title="Method and transparency" lead="How Academiana finds and verifies sources, how it checks that a source really supports a sentence, how the quality score is calculated, and what the system does not do.">
        <h2>What we promise and what we do not</h2>
        <p>Academiana helps you prepare your own academic work with real sources. It does not invent sources, data or findings, does not present AI decisions as certainties, and does not show a plagiarism percentage, because no licensed similarity service is connected. Every AI decision described below can be inspected by you, with the passage it is based on.</p>
        <h2>1. Where sources come from</h2>
        <p>Searches run at the same time in academic databases: OpenAlex, Crossref, Europe PMC (PubMed), arXiv, DOAJ, CORE, OpenAIRE, Google Books, Unpaywall, ERIC, DBLP, DataCite, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP (and NASA ADS, Springer Nature and IEEE Xplore when their keys are configured) and Turkish sources (DergiPark, TR Dizin, YÖK Thesis Centre). Duplicate records are merged. The AI never writes a reference itself: it can only cite sources that are in your project’s source list.</p>
        <h2>2. Does the source exist? (bibliographic verification)</h2>
        <p>DOIs are checked against Crossref and DataCite, PMIDs against Europe PMC and arXiv identifiers against arXiv. A verified source is marked “Verified”. This only proves that the publication exists and its bibliographic data is correct.</p>
        <h2>3. How much of the source was read? (access level)</h2>
        <ul>
          <li><b>Citation only:</b> only the bibliographic data is known; the content has not been read.</li>
          <li><b>Abstract read:</b> the abstract is available.</li>
          <li><b>Full text read:</b> an open-access full text (or a PDF you uploaded) was actually read on the server and split into page-numbered passages. This label is assigned only by the server, only after the text was really read.</li>
        </ul>
        <h2>4. Does the source support the sentence? (claim audit)</h2>
        <p>A source existing does not mean it supports your sentence. The <b>claim audit</b> splits a section into sentences and compares each cited sentence with the text that was read from the cited source:</p>
        <ul>
          <li>For full texts, the passages most relevant to the sentence are selected (in the sentence’s language and in English); for abstracts, the abstract is used.</li>
          <li>A small AI model decides: <i>supports</i>, <i>partially supports</i> (or the sentence is stronger/more general than the source), <i>does not support</i>, or <i>the text is not enough to decide</i>.</li>
          <li>The decision is shown with the shortest supporting quote and its page. A quote is shown only if it appears word for word in the source text; otherwise it is hidden.</li>
          <li>Sources whose content was not read are never sent to the AI; they are reported as “cannot be checked”.</li>
          <li>Uncited sentences containing figures, percentages or strong statements (“studies show…”) are flagged as possibly needing a source.</li>
          <li>Unchanged sentence–source pairs are not re-checked, so repeating the audit does not repeat the cost.</li>
        </ul>
        <p>The audit is an AI assessment that helps you; the final judgement is yours. It works only on what was read: if only the abstract is available, details found only in the full text cannot be confirmed.</p>
        <h2>5. Rules the writing assistant follows</h2>
        <ul>
          <li>It cites only sources in your list; it does not mention works that are not in the list.</li>
          <li>Where a claim needs a source that is not available it writes “[CITATION NEEDED]”; where your data is needed it writes “[DATA TO BE ENTERED]”. It does not invent numbers.</li>
          <li>Statistics are not produced by the AI: analyses are calculated on the server from your own data.</li>
          <li>Tasks are routed to the model that suits them (small, medium or large); the product does not depend on a single model or provider.</li>
        </ul>
        <h2>6. How the quality score is calculated</h2>
        <p>The score starts at 100. Each rule-based finding lowers it by its severity: critical {W.error}, warning {W.warning}, information {W.info} points (some minor findings, such as double spaces, count with a lower weight). Findings of the AI jury are shown with an “AI” label but do not change the score, so the same text always gets the same score. The score measures citation–reference consistency, source verifiability, missing sections, academic language rules and repetition. It does not measure scientific merit, originality or plagiarism, and it does not replace a jury or reviewer.</p>
        <h2>7. “What does research say?”</h2>
        <p>The answer is compiled only from the abstracts of the papers found (at most 14); each sentence is linked to a numbered paper and references to papers that do not exist in the list are removed. The consensus meter appears only for yes/no questions with at least three relevant studies. It is not a literature review.</p>
        <h2>8. How plan amounts are set</h2>
        <p>Monthly page amounts are based on the average page length and AI cost measured on 44 real academic full texts; page counts are approximate. “Unlimited” means ordinary use by one person for academic work and is subject to the <Link href="/kosullar#adil-kullanim">fair use terms</Link>.</p>
        <h2>9. Known limitations</h2>
        <ul>
          <li>Paywalled articles cannot be read unless you upload the PDF yourself.</li>
          <li>AI assessments can be wrong; always check the quoted passage.</li>
          <li>Sentence splitting is rule-based and may occasionally merge or split sentences unusually.</li>
          <li>No similarity (plagiarism) percentage is calculated.</li>
        </ul>
        <h2>10. Independent evaluation</h2>
        <p>We welcome independent evaluation by academics and institutions. Pilot access for evaluation can be requested through the <Link href="/kurumlar">Institutions</Link> page. The platform’s rules described here are covered by more than 400 automated tests, including data-isolation tests run on a real PostgreSQL database.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/yontem" title="Yöntem ve şeffaflık" lead="Academiana kaynakları nereden bulur ve nasıl doğrular, bir kaynağın cümleyi gerçekten destekleyip desteklemediğini nasıl denetler, kalite puanı nasıl hesaplanır ve sistem neleri yapmaz?">
      <h2>Neyi vaat ediyoruz, neyi etmiyoruz</h2>
      <p>Academiana, kendi akademik çalışmanızı gerçek kaynaklarla hazırlamanıza yardım eder. Kaynak, veri veya bulgu uydurmaz; yapay zekâ kararlarını kesinlik gibi sunmaz; lisanslı bir benzerlik servisi bağlı olmadığı için intihal yüzdesi göstermez. Aşağıda anlatılan her yapay zekâ kararını, dayandığı pasajla birlikte kendiniz inceleyebilirsiniz.</p>
      <h2>1. Kaynaklar nereden geliyor?</h2>
      <p>Aramalar akademik veri tabanlarında eşzamanlı yapılır: OpenAlex, Crossref, Europe PMC (PubMed), arXiv, DOAJ, CORE, OpenAIRE, Google Books, Unpaywall, ERIC, DBLP, DataCite, PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP (anahtarları tanımlıysa NASA ADS, Springer Nature ve IEEE Xplore) ve Türkiye kaynakları (DergiPark, TR Dizin, YÖK Tez Merkezi). Yinelenen kayıtlar birleştirilir. Yapay zekâ kendi başına künye yazmaz; yalnızca çalışmanızın kaynak listesindeki kaynaklara atıf yapabilir.</p>
      <h2>2. Kaynak gerçekten var mı? (künye doğrulaması)</h2>
      <p>DOI numaraları Crossref ve DataCite’ta, PMID’ler Europe PMC’de, arXiv kimlikleri arXiv’de kontrol edilir. Doğrulanan kaynak “Doğrulandı” olarak işaretlenir. Bu yalnızca yayının var olduğunu ve künyesinin doğru olduğunu gösterir.</p>
      <h2>3. Kaynağın ne kadarı okundu? (erişim seviyesi)</h2>
      <ul>
        <li><b>Yalnızca künye:</b> yalnızca bibliyografik bilgi biliniyor; içerik okunmadı.</li>
        <li><b>Özet okundu:</b> çalışmanın özeti mevcut.</li>
        <li><b>Tam metin okundu:</b> açık erişimli tam metin (veya sizin yüklediğiniz PDF) sunucuda gerçekten okundu ve sayfa numaralı parçalara bölündü. Bu etiketi yalnızca sunucu, metin gerçekten okunduktan sonra verir.</li>
      </ul>
      <h2>4. Kaynak cümleyi destekliyor mu? (iddia denetimi)</h2>
      <p>Bir kaynağın var olması, cümlenizi desteklediği anlamına gelmez. <b>İddia denetimi</b> bölümü cümlelere ayırır ve atıflı her cümleyi, atıf yaptığı kaynaktan okunan metinle karşılaştırır:</p>
      <ul>
        <li>Tam metinde cümleyle en ilgili pasajlar (cümlenin dilinde ve İngilizce anahtar kelimelerle) seçilir; tam metin yoksa özet kullanılır.</li>
        <li>Küçük bir yapay zekâ modeli karar verir: <i>destekliyor</i>, <i>kısmen destekliyor</i> (veya cümle kaynaktan daha güçlü/genel), <i>desteklemiyor</i> ya da <i>metin karar vermeye yetmiyor</i>.</li>
        <li>Karar, dayandığı en kısa alıntı ve sayfasıyla gösterilir. Alıntı yalnızca kaynak metninde kelimesi kelimesine geçiyorsa gösterilir; aksi hâlde gizlenir.</li>
        <li>İçeriği okunmamış kaynaklar yapay zekâya hiç gönderilmez; “denetlenemez” olarak bildirilir.</li>
        <li>Atıf içermeyen ama sayı, oran veya “araştırmalar göstermektedir” gibi kesin ifade taşıyan cümleler “kaynak gerektirebilir” diye işaretlenir.</li>
        <li>Değişmeyen cümle–kaynak çiftleri yeniden denetlenmez; denetimi tekrarlamak maliyeti tekrarlamaz.</li>
      </ul>
      <p>Denetim size yardımcı olan bir yapay zekâ değerlendirmesidir; son karar sizindir. Yalnızca okunan metne dayanır: yalnızca özet varsa, sadece tam metinde geçen ayrıntılar doğrulanamaz.</p>
      <h2>5. Yazım asistanının uyduğu kurallar</h2>
      <ul>
        <li>Yalnızca listenizdeki kaynaklara atıf yapar; listede olmayan eser adı anmaz.</li>
        <li>Kaynak gereken ama kaynağı olmayan yerde “[KAYNAK GEREKLİ]”, sizin veriniz gereken yerde “[VERİ GİRİLECEK]” yazar; sayı uydurmaz.</li>
        <li>İstatistikleri yapay zekâ üretmez: analizler sizin verinizden sunucuda hesaplanır.</li>
        <li>Her iş, ona uygun modele (küçük, orta, büyük) yönlendirilir; ürün tek bir modele veya sağlayıcıya bağımlı değildir.</li>
      </ul>
      <h2>6. Kalite puanı nasıl hesaplanır?</h2>
      <p>Puan 100’den başlar. Kural tabanlı her bulgu önemine göre puan düşürür: Kritik {W.error}, Uyarı {W.warning}, Bilgi {W.info} puan (çift boşluk gibi küçük bulgular daha düşük ağırlıkla sayılır). Yapay zekâ jürisinin bulguları “AI” etiketiyle gösterilir ama puanı değiştirmez; böylece aynı metin her seferinde aynı puanı alır. Puan; atıf–kaynakça tutarlılığını, kaynakların doğrulanabilirliğini, eksik bölümleri, akademik dil kurallarını ve tekrarları ölçer. Bilimsel değeri, özgünlüğü veya intihali ölçmez; jüri ya da hakem değerlendirmesinin yerine geçmez.</p>
      <h2>7. “Araştırmalar ne diyor?”</h2>
      <p>Cevap yalnızca bulunan makalelerin (en fazla 14) özetlerinden derlenir; her cümle numaralı bir makaleye bağlanır, listede olmayan numaraya yapılan göndermeler silinir. Uzlaşı göstergesi yalnızca evet/hayır sorularında ve en az üç ilgili çalışma varsa görünür. Bir literatür taraması değildir.</p>
      <h2>8. Paket ölçüleri nasıl belirlendi?</h2>
      <p>Aylık sayfa miktarları, 44 gerçek akademik tam metin üzerinde ölçülen ortalama sayfa uzunluğuna ve yapay zekâ maliyetine dayanır; sayfa sayıları yaklaşıktır. “Sınırsız”, bir kişinin akademik çalışması için olağan kullanımı anlatır ve <Link href="/kosullar#adil-kullanim">adil kullanım koşullarına</Link> tabidir.</p>
      <h2>9. Bilinen sınırlamalar</h2>
      <ul>
        <li>Ücretli (kapalı erişimli) makaleler, PDF’ini siz yüklemedikçe okunamaz.</li>
        <li>Yapay zekâ değerlendirmeleri hatalı olabilir; alıntılanan pasajı her zaman kontrol edin.</li>
        <li>Cümle bölme kural tabanlıdır; nadiren cümleleri olağandışı birleştirebilir veya bölebilir.</li>
        <li>Benzerlik (intihal) yüzdesi hesaplanmaz.</li>
      </ul>
      <h2>10. Bağımsız değerlendirme</h2>
      <p>Akademisyenlerin ve kurumların bağımsız değerlendirmesine açığız. Değerlendirme için pilot erişim <Link href="/kurumlar">Kurumlar</Link> sayfasından istenebilir. Burada anlatılan kurallar, gerçek bir PostgreSQL veritabanında çalışan veri izolasyonu testleri dahil 400’ü aşkın otomatik testle güvence altındadır.</p>
    </StaticPage>
  );
}
