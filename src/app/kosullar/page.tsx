import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo-server";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return pageMeta("/kosullar");
}

export default async function Page() {
  const locale = await getLocale();
  if (locale === "de") {
    return (
      <StaticPage path="/kosullar" title="Nutzungsbedingungen" lead="Vorlagentext: Vor der Veröffentlichung ist eine rechtliche Prüfung erforderlich. Maßgeblich ist die türkische Fassung.">
        <h2>Art der Leistung</h2>
        <p>Academiana ist ein Hilfswerkzeug zum Planen, Recherchieren, Schreiben und Formatieren wissenschaftlicher Arbeiten. Die Verantwortung für die wissenschaftliche Richtigkeit und Originalität der Inhalte sowie für die Einhaltung der Regeln Ihrer Institution liegt bei Ihnen.</p>
        <h2>Wissenschaftliche Integrität</h2>
        <p>Sie verpflichten sich, die Plattform im Einklang mit den KI-Richtlinien Ihrer Institution zu nutzen und die Verwendung von KI offenzulegen, wo dies verlangt wird.</p>
        <h2>Nutzungsgrenzen</h2>
        <p>Jeder Tarif hat monatliche Fair-Use-Grenzen, die beim Upgrade angezeigt werden. Ist eines Ihrer monatlichen Kontingente (KI-Nutzung oder Quellenrecherchen) aufgebraucht, pausiert nur diese Funktion, bis Sie upgraden oder sich Ihr Kontingent erneuert. Ihre Arbeiten werden weder gelöscht noch gesperrt: Sie können sie jederzeit ansehen, bearbeiten und in den von Ihrem Tarif erlaubten Formaten herunterladen. Anfragen auf Auskunft über Ihre personenbezogenen Daten werden innerhalb der gesetzlichen Frist kostenlos beantwortet. Konten, bei denen Missbrauch festgestellt wird, können gesperrt werden.</p>
        <h2>Nutzungsprotokoll</h2>
        <p>Ihr Tarifkontingent gilt als verbraucht, sobald die KI Text für Sie erzeugt. Wenn Sie diesen Text, einen Abschnitt oder eine ganze Arbeit später löschen, wird das Kontingent nicht zurückerstattet. Zur Klärung von Streitfällen über die Tarifnutzung wird ein Protokoll der erhaltenen KI-Ausgaben (Datum, Titel von Arbeit und Abschnitt, Wortzahl und Ausgabetext) sowie Ihrer Löschungen 12 Monate lang aufbewahrt; es ist nur für berechtigte Administrator:innen sichtbar und wird zusammen mit Ihrem Konto gelöscht.</p>
        <h2>Tarif „Tek Proje“ (Einzelprojekt)</h2>
        <p>Der Tarif „Tek Proje“ ist eine Einmalzahlung für eine einzige Arbeit (Abschlussarbeit, Artikel, Antrag o. Ä.), die bei der Zuweisung des Tarifs festgelegt wird. Er ist zeitlich unbegrenzt. Unbegrenzte KI-Nutzung und Quellenrecherchen gelten nur innerhalb dieser Arbeit; KI-Nutzung und Recherchen außerhalb davon (etwa der Umfrage-Assistent oder der Themenfinder) sind monatlich auf das Kontingent des kostenlosen Tarifs begrenzt. Die an den Tarif gebundene Arbeit kann weder gelöscht noch in ihrer Art geändert werden, und eine zweite Arbeit kann nicht angelegt werden.</p>
        <p>Die Arbeit abzuschließen und an ihrer Stelle eine andere Arbeit zu schreiben – etwa durch Löschen oder Überschreiben des Inhalts, Ändern des Themas oder Erstellen von Arbeiten für andere Personen – verstößt gegen diese Bedingungen. Dasselbe gilt für die Weitergabe des Kontos an andere Personen.</p>
        <h2 id="adil-kullanim">Fair Use</h2>
        <p>„Unbegrenzt“ bedeutet die übliche Nutzung für eine wissenschaftliche Arbeit durch eine Person. Damit der Dienst tragfähig bleibt, wird die Nutzung automatisch beobachtet: Ungewöhnliche Muster (umfangreiche Löschungen nach dem Download, zwischen Downloads ausgetauschte Inhalte, geänderte Titelblatt- oder Autorenangaben, sehr hohe Textgenerierung, Nutzung auf vielen Geräten, Text ohne Bezug zum Thema der Arbeit) werden unseren Administrator:innen gemeldet. Meldungen prüft ein Mensch; kein Konto wird automatisch gesperrt.</p>
        <p>Wird ein Verstoß festgestellt, können wir Sie benachrichtigen, die Nutzung einschränken oder das Konto sperren. Entgelte für Tarife, die unter Verstoß gegen diese Bedingungen genutzt wurden, werden nicht erstattet, sofern das Gesetz nichts anderes vorschreibt. Sie können uns kontaktieren, um eine Entscheidung anzufechten.</p>
      </StaticPage>
    );
  }
  if (locale === "en") {
    return (
      <StaticPage path="/kosullar" title="Terms of use" lead="Template text: must be reviewed by a lawyer before publication.">
        <h2>Nature of the service</h2>
        <p>Academiana is a tool that helps you plan, research, write and format academic work. You remain responsible for the scientific accuracy and originality of the content and for compliance with your institution&apos;s rules.</p>
        <h2>Academic integrity</h2>
        <p>You agree to use the platform in line with your institution&apos;s AI policies and to disclose AI use where required.</p>
        <h2>Usage limits</h2>
        <p>Each plan has monthly fair-use limits, which are shown when you upgrade. When one of your monthly allowances (AI usage or source searches) runs out, only that feature stops until you upgrade or your allowance renews. Your work is never deleted or locked: you can always view, edit and download it in the formats your plan allows. Requests to access your personal data are answered free of charge within the legal period. Accounts found to be abusing the service may be suspended.</p>
        <h2>Usage records</h2>
        <p>Your plan allowance is used when the AI produces text for you. Deleting that text, a section or a whole work later does not restore the allowance. To resolve disputes about plan usage, a record of the AI outputs you received (date, work and section title, word count and the output text) and of deletions is kept for 12 months; it is visible only to authorised administrators and is deleted together with your account.</p>
        <h2>Single Project plan</h2>
        <p>The Single Project plan is a one-time payment for one work (a thesis, article, proposal or similar) chosen when the plan is assigned. It has no time limit. Unlimited AI use and source searches apply only within this work; AI use and searches outside it (for example the survey assistant or topic finder) are limited each month to the Free plan allowance. The work bound to the plan cannot be deleted or have its type changed, and no second work can be opened.</p>
        <p>Completing the work and then writing a different work in its place, for example by deleting or overwriting its content, changing its topic, or preparing works for other people, is a breach of these terms. The same applies to sharing the account with other people.</p>
        <h2 id="adil-kullanim">Fair use</h2>
        <p>“Unlimited” means normal use for one academic work by one person. To keep the service sustainable, usage is monitored automatically: unusual patterns (large deletions after download, content replaced between downloads, cover or author details changed, very high generation, use from many devices, text unrelated to the work’s topic) are reported to our administrators. Reports are reviewed by a person; no account is suspended automatically.</p>
        <p>Where a breach is found, we may notify you, restrict use or suspend the account. Fees for plans used in breach of these terms are not refunded, except where the law requires otherwise. You may contact us to dispute a decision.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/kosullar" title="Kullanım koşulları" lead="Şablon metin: yayına almadan önce hukuki inceleme yapılmalıdır.">
      <h2>Hizmetin niteliği</h2>
      <p>Academiana, akademik çalışmaların planlanması, kaynak bulunması, yazımı ve biçimlendirilmesi için yardımcı bir araçtır. Üretilen içeriğin bilimsel doğruluğu, özgünlüğü ve kurumunuzun kurallarına uygunluğu konusunda nihai sorumluluk kullanıcıya aittir.</p>
      <h2>Akademik dürüstlük</h2>
      <p>Platformu kurumunuzun yapay zekâ kullanım politikalarına uygun biçimde kullanmayı ve gerektiğinde yapay zekâ kullanımını beyan etmeyi kabul edersiniz.</p>
      <h2>Kullanım limitleri</h2>
      <p>Her paketin aylık adil kullanım sınırları vardır; sınırlar paket yükseltirken gösterilir. Aylık haklarınızdan biri (yapay zekâ kullanımı veya kaynak tarama) dolduğunda, paketinizi yükseltene veya hakkınız yenilenene kadar yalnızca o özellik durur. Çalışmalarınız silinmez ve kilitlenmez: onları her zaman görüntüleyebilir, düzenleyebilir ve paketinizin izin verdiği biçimlerde indirebilirsiniz. Kişisel verilerinize erişim talepleriniz yasal süre içinde ücretsiz olarak yanıtlanır. Kötüye kullanım tespit edilen hesaplar askıya alınabilir.</p>
      <h2>Kullanım kaydı</h2>
      <p>Paket hakkınız, yapay zekâ sizin için metin ürettiğinde kullanılmış olur. Üretilen metni, bir bölümü veya çalışmanın tamamını sonradan silmeniz kullanılan hakkı geri vermez. Paket kullanımına ilişkin anlaşmazlıkların çözümü için aldığınız yapay zekâ çıktılarının (tarih, çalışma ve bölüm adı, kelime sayısı ve çıktı metni) ve yaptığınız silmelerin kaydı 12 ay saklanır; yalnızca yetkili yöneticiler görebilir ve hesabınızla birlikte silinir.</p>
      <h2>Tek Proje paketi</h2>
      <p>Tek Proje paketi, paket tanımlanırken seçilen tek bir çalışma (tez, makale, proje önerisi vb.) için tek seferlik ödemedir ve süre sınırı yoktur. Sınırsız yapay zekâ kullanımı ve kaynak taraması yalnızca bu çalışmada geçerlidir; çalışma dışındaki yapay zekâ kullanımı ve taramalar (ör. anket yardımcısı, konu bulma) her ay Ücretsiz paket hakkı kadardır. Pakete bağlı çalışma silinemez, türü değiştirilemez ve ikinci bir çalışma açılamaz.</p>
      <p>Çalışmayı tamamladıktan sonra içeriğini silerek ya da üzerine yazarak, konusunu değiştirerek veya başka kişiler adına çalışma hazırlayarak paketi farklı çalışmalar için kullanmak bu koşulların ihlalidir. Hesabın başka kişilerle paylaşılması da aynı kapsamdadır.</p>
      <h2 id="adil-kullanim">Adil kullanım</h2>
      <p>“Sınırsız”, bir kişinin bir akademik çalışma için olağan kullanımı anlamına gelir. Hizmetin sürdürülebilirliği için kullanım otomatik olarak izlenir: olağan dışı durumlar (indirdikten sonra büyük silme, indirmeler arasında içeriğin değişmesi, kapak veya yazar bilgisinin değişmesi, çok yüksek üretim, çok sayıda cihazdan kullanım, çalışmanın konusuyla ilgisiz metin) yöneticilerimize bildirilir. Bildirimleri bir kişi inceler; hiçbir hesap otomatik olarak askıya alınmaz.</p>
      <p>İhlal tespit edilirse sizi bilgilendirebilir, kullanımı kısıtlayabilir veya hesabı askıya alabiliriz. Bu koşullara aykırı kullanılan paketlerin ücreti, mevzuatın zorunlu kıldığı durumlar dışında iade edilmez. Karara itiraz etmek için bizimle iletişime geçebilirsiniz.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
