import Link from "@/components/l-link";
import { WithMarks } from "@/components/brand-mark";
import { JsonLd } from "@/components/json-ld";
import { StaticPage } from "@/components/static-page";
import { getLocale } from "@/i18n/server";
import { CONTACT_EMAIL, INSTAGRAM, SELLER } from "@/lib/site";
import { FOUNDER, founderLd } from "@/lib/structured-data";
import { WHATSAPP_NUMBER } from "@/lib/pricing";
import { pageMeta } from "@/lib/seo-server";

export async function generateMetadata() {
  return pageMeta("/hakkimizda");
}

/** +905425266650 → +90 542 526 66 50 */
const phone = `+${WHATSAPP_NUMBER.slice(0, 2)} ${WHATSAPP_NUMBER.slice(2, 5)} ${WHATSAPP_NUMBER.slice(5, 8)} ${WHATSAPP_NUMBER.slice(8, 10)} ${WHATSAPP_NUMBER.slice(10)}`;

/** Hakkımızda (D108): neden kurulduk, misyon, vizyon, değerler, kurucu. Yalnızca doğrulanabilir bilgi; sayı/kullanıcı iddiası yok. */
export default async function AboutPage() {
  const locale = await getLocale();
  const email = CONTACT_EMAIL;
  if (locale === "de") {
    return (
      <StaticPage path="/hakkimizda" pageType="AboutPage" title="Über Academiana" lead="Academiana wurde gegründet, um KI eine sinnvolle und produktive Rolle in der Bildung zu geben: Studierenden und Forschenden Zeit zu sparen, ihnen bessere Arbeit zu ermöglichen und ihren Beitrag zu stärken.">
        <JsonLd data={[founderLd("de")]} />
        <h2>Unsere Geschichte</h2>
        <p>KI verändert, wie wir lernen, forschen und schreiben. Wir sind überzeugt, dass ihr Platz in der Bildung an der Seite von Studierenden und Forschenden ist: als Partnerin, die die zeitraubenden Teile der Arbeit übernimmt und mehr Raum für Denken, Interpretieren und eigenes Schaffen lässt.</p>
        <p>Ein Großteil der Zeit für eine Abschlussarbeit oder einen Artikel fließt in Quellensuche, das Formatieren des Literaturverzeichnisses, die Gliederung der Kapitel, Analysen und das Einhalten von Formatrichtlinien. Academiana bündelt diese Schritte in einem Arbeitsbereich, damit die Zeit der Forschenden dem Kern der Arbeit zugutekommt – mit echten wissenschaftlichen Quellen, im Einklang mit akademischen Konventionen wie ISNAD und den Richtlinien der Hochschulen und so, dass die Forschenden Autor:innen ihrer Arbeit bleiben.</p>
        <h2>Unsere Mission</h2>
        <p>KI zu einem verlässlichen und produktiven Teil wissenschaftlicher Arbeit zu machen: Studierenden und Forschenden Zeit zu sparen, ihnen zu helfen, ihre eigene Arbeit Schritt für Schritt mit echten Quellen und im Einklang mit akademischen Konventionen zu erstellen, und zu ihrem Lernen beizutragen.</p>
        <h2>Drei Intelligenzen</h2>
        <p><WithMarks text="Im Kern von Academiana arbeiten drei sich ergänzende KIs: Zenit schreibt mit Ihnen und kennt Thema, Richtung und Zweck jedes Kapitels; Rasat liest Ihre Quellen, beantwortet Fragen mit Seitenzahlen und zitiert mit der veröffentlichten Seite; Mizan wägt jeden belegten Satz an seiner Quelle ab und zeigt Lücken vor der Abgabe. Alle drei stützen sich nur auf echte Quellen und gelesenen Text." /></p>
        <h2>Unsere Vision</h2>
        <p>Die führende Plattform für das Zusammenspiel von KI und Bildung zu werden – zuerst in der Türkei, dann weltweit – und zu einer akademischen Kultur beizutragen, in der KI die Forschung beschleunigt und zugleich ihre Qualität und Integrität stärkt.</p>
        <h2>Unsere Werte</h2>
        <ul>
          <li><strong>Nichts wird erfunden.</strong> Die KI erfindet niemals Quellen, Autor:innen, DOIs, Daten oder Ergebnisse. Fehlt eine Quelle, schreibt sie [QUELLE ERFORDERLICH].</li>
          <li><strong>Transparenz.</strong> Für jede Quelle wird angezeigt, ob die bibliografischen Angaben, das Abstract oder der Volltext gelesen wurde.</li>
          <li><strong>Sie sind die Autorin bzw. der Autor.</strong> Die Plattform unterstützt Ihr Denken und Schreiben; sie ersetzt es nicht.</li>
          <li><strong>Datenschutz.</strong> Ihre Arbeit sehen nur Sie und die Personen, mit denen Sie sie teilen; sie wird nie zum Training von KI-Modellen verwendet.</li>
        </ul>
        <p>Wie diese Grundsätze in der Praxis umgesetzt werden, lesen Sie auf unserer Seite zur <Link href="/akademik-durustluk" className="font-medium text-brand-700 hover:underline">wissenschaftlichen Integrität</Link>; echte Beispiele finden Sie unter <Link href="/ornekler" className="font-medium text-brand-700 hover:underline">Beispielergebnisse</Link>.</p>
        <h2>Gründer</h2>
        <p>Academiana wurde von <strong>{FOUNDER.name}</strong> (Gründer und CEO) gegründet und wird von ihm geleitet.</p>
        <h2>Kontakt</h2>
        <p>WhatsApp: <span className="select-all font-medium text-ink-900">{phone}</span>{email ? <> · E-Mail: <a href={`mailto:${email}`} className="font-medium text-ink-900 underline-offset-2 hover:underline">{email}</a></> : null} · Instagram: <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 underline-offset-2 hover:underline">@{INSTAGRAM.handle}</a></p>
        <h2>Unternehmensangaben</h2>
        <p>Verkäufer und Verantwortlicher: <strong>{SELLER.name}</strong> ({SELLER.kind.de}) · Anschrift: {SELLER.address} · Finanzamt {SELLER.taxOffice}, Steuernummer {SELLER.taxNo} · Tätigkeit: {SELLER.activity.de}. Zahlungen werden über das lizenzierte Zahlungsinstitut PayTR entgegengenommen.</p>
      </StaticPage>
    );
  }
  if (locale === "en") {
    return (
      <StaticPage path="/hakkimizda" pageType="AboutPage" title="About Academiana" lead="Academiana was founded to give AI a proper, productive role in education: helping students and researchers save time, work better and contribute more.">
        <JsonLd data={[founderLd("en")]} />
        <h2>Our story</h2>
        <p>AI is changing the way we learn, research and write. We believe its place in education is beside the student and the researcher: a partner that takes over the time-consuming parts of the work and leaves more room for thinking, interpreting and producing.</p>
        <p>Much of the time spent on a thesis or paper goes into searching for sources, formatting references, structuring chapters, running analyses and following writing guides. Academiana brings these steps together in one workspace, so that the researcher’s time goes to the work itself. It does this with real academic sources, in line with academic conventions such as ISNAD and graduate school guides, and in a way that keeps the researcher as the author.</p>
        <h2>Our mission</h2>
        <p>To make AI a reliable and productive part of academic work: saving students and researchers time, helping them produce their own work step by step with real sources and in line with academic conventions, and adding value to their learning.</p>
        <h2>Three intelligences</h2>
        <p><WithMarks text="Three complementary AIs work at the heart of Academiana: Zenit writes with you, knowing your topic, direction and the purpose of each section; Rasat reads your sources, answers questions with page numbers and quotes with the published page; Mizan weighs every cited sentence against its source and shows gaps before you submit. All three rely only on real sources and text that was actually read." /></p>
        <h2>Our vision</h2>
        <p>To be the leading platform where AI and education work together, first in Turkey and then worldwide, and to help build an academic culture in which AI speeds up research while strengthening its quality and integrity.</p>
        <h2>Our values</h2>
        <ul>
          <li><strong>No fabrication.</strong> The AI never invents sources, authors, DOIs, data or findings. Where a source is missing it writes [CITATION NEEDED].</li>
          <li><strong>Transparency.</strong> Every source shows whether its record, abstract or full text was read.</li>
          <li><strong>You are the author.</strong> The platform supports your thinking and writing; it does not replace them.</li>
          <li><strong>Privacy.</strong> Your work is visible only to you and the people you share it with, and is never used to train AI models.</li>
        </ul>
        <p>You can read how these principles work in practice on our <Link href="/akademik-durustluk" className="font-medium text-brand-700 hover:underline">academic integrity</Link> page and see real examples on the <Link href="/ornekler" className="font-medium text-brand-700 hover:underline">sample outputs</Link> page.</p>
        <h2>Founder</h2>
        <p>Academiana was founded and is led by <strong>{FOUNDER.name}</strong>, Founder and CEO.</p>
        <h2>Contact</h2>
        <p>WhatsApp: <span className="select-all font-medium text-ink-900">{phone}</span>{email ? <> · Email: <a href={`mailto:${email}`} className="font-medium text-ink-900 underline-offset-2 hover:underline">{email}</a></> : null} · Instagram: <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 underline-offset-2 hover:underline">@{INSTAGRAM.handle}</a></p>
        <h2>Company information</h2>
        <p>Seller and data controller: <strong>{SELLER.name}</strong> ({SELLER.kind.en}) · Address: {SELLER.address} · {SELLER.taxOffice} Tax Office, tax number {SELLER.taxNo} · Activity: {SELLER.activity.en}. Payments are collected through the licensed payment institution PayTR.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/hakkimizda" pageType="AboutPage" title="Hakkımızda" lead="Academiana, yapay zekâya eğitimde doğru ve verimli bir rol kazandırmak; öğrencilere ve araştırmacılara zaman kazandırmak, daha iyi çalışmalarına ve daha fazla katkı sunmalarına yardım etmek için kuruldu.">
      <JsonLd data={[founderLd("tr")]} />
      <h2>Hikâyemiz</h2>
      <p>Yapay zekâ öğrenme, araştırma ve yazma biçimimizi değiştiriyor. Biz yapay zekânın eğitimdeki yerinin öğrencinin ve araştırmacının yanında olduğuna inanıyoruz: işin zaman alan kısımlarını üstlenen, düşünmeye, yorumlamaya ve üretmeye daha fazla alan açan bir çalışma arkadaşı.</p>
      <p>Bir tez ya da makalede harcanan zamanın büyük kısmı kaynak aramaya, kaynakçayı biçimlendirmeye, bölümleri kurgulamaya, analiz yapmaya ve yazım kılavuzlarına uymaya gidiyor. Academiana bu adımları tek bir çalışma alanında bir araya getirir; böylece araştırmacının zamanı işin özüne kalır. Bunu gerçek akademik kaynaklarla, ISNAD ve enstitü kılavuzları gibi akademik kurallara uygun biçimde ve yazarlığı araştırmacıda bırakarak yapar.</p>
      <h2>Misyonumuz</h2>
      <p>Yapay zekâyı akademik çalışmanın güvenilir ve verimli bir parçası hâline getirmek: öğrencilere ve araştırmacılara zaman kazandırmak, kendi çalışmalarını gerçek kaynaklarla ve akademik kurallara uygun biçimde adım adım ortaya koymalarına yardım etmek ve öğrenmelerine katkı sağlamak.</p>
      <h2>Üç zekâ</h2>
      <p><WithMarks text="Academiana’nın kalbinde birbirini tamamlayan üç yapay zekâ çalışır: Zenit, çalışmanızın konusunu, gidişatını ve her bölümün amacını bilerek sizinle yazar; Rasat kaynaklarınızı okur, sorularınızı sayfa numarasıyla cevaplar ve alıntıyı yayındaki sayfasıyla ekler; Mizan atıflı her cümleyi kaynağıyla tartar ve teslimden önce eksikleri gösterir. Üçü de yalnızca gerçek kaynaklara ve okunan metne dayanır." /></p>
      <h2>Vizyonumuz</h2>
      <p>Yapay zekâ ile eğitimin birlikte çalıştığı alanda önce Türkiye’de, ardından dünyada öncü platform olmak; yapay zekânın araştırmayı hızlandırırken niteliğini ve güvenilirliğini de güçlendirdiği bir akademik kültürün oluşmasına katkı sağlamak.</p>
      <h2>Değerlerimiz</h2>
      <ul>
        <li><strong>Uydurma yok.</strong> Yapay zekâ kaynak, yazar, DOI, veri veya bulgu uydurmaz. Kaynak yoksa [KAYNAK GEREKLİ] yazar.</li>
        <li><strong>Şeffaflık.</strong> Her kaynak için künyenin mi, özetin mi, tam metnin mi okunduğu gösterilir.</li>
        <li><strong>Yazar sizsiniz.</strong> Platform düşünmenizi ve yazmanızı destekler; onların yerine geçmez.</li>
        <li><strong>Gizlilik.</strong> Çalışmanızı yalnızca siz ve paylaştığınız kişiler görür; çalışmalarınız yapay zekâ modellerini eğitmek için kullanılmaz.</li>
      </ul>
      <p>Bu ilkelerin uygulamada nasıl işlediğini <Link href="/akademik-durustluk" className="font-medium text-brand-700 hover:underline">akademik dürüstlük ilkelerimiz</Link> sayfasında okuyabilir, gerçek örnekleri <Link href="/ornekler" className="font-medium text-brand-700 hover:underline">örnek çıktılar</Link> sayfasında görebilirsiniz.</p>
      <h2>Kurucu</h2>
      <p>Academiana, Kurucu ve CEO <strong>{FOUNDER.name}</strong> tarafından kurulmuştur ve yönetilmektedir.</p>
      <h2>İletişim</h2>
      <p>WhatsApp: <span className="select-all font-medium text-ink-900">{phone}</span>{email ? <> · E-posta: <a href={`mailto:${email}`} className="font-medium text-ink-900 underline-offset-2 hover:underline">{email}</a></> : null} · Instagram: <a href={INSTAGRAM.url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink-900 underline-offset-2 hover:underline">@{INSTAGRAM.handle}</a></p>
      <h2>Şirket bilgileri</h2>
      <p>Satıcı ve veri sorumlusu: <strong>{SELLER.name}</strong> ({SELLER.kind.tr}) · Adres: {SELLER.address} · {SELLER.taxOffice} Vergi Dairesi, vergi no {SELLER.taxNo} · Faaliyet: {SELLER.activity.tr}. Ödemeler lisanslı ödeme kuruluşu PayTR aracılığıyla alınır.</p>
    </StaticPage>
  );
}
