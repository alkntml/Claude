import { StaticPage } from "@/components/static-page";
import { pageMeta } from "@/lib/seo-server";
import { getLocale } from "@/i18n/server";

export async function generateMetadata() {
  return pageMeta("/gizlilik");
}

const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mt-6 text-lg font-semibold text-ink-900">{children}</h3>;

export default async function Page() {
  const locale = await getLocale();
  if (locale === "de") {
    return (
      <StaticPage path="/gizlilik" title="Sicherheits- und Datenschutzrichtlinie" lead="Wie wir Ihre personenbezogenen Daten, wissenschaftlichen Arbeiten und hochgeladenen Dokumente schützen.">
        <p className="text-sm text-ink-500">Zuletzt aktualisiert: 08.11.2026 · Diese Übersetzung dient der Information; maßgeblich ist die türkische Fassung.</p>

        <h2>1. Zweck und Geltungsbereich</h2>
        <p>Für Academiana gehören der Schutz der Privatsphäre und die Sicherheit der personenbezogenen Daten, wissenschaftlichen Arbeiten und hochgeladenen Dokumente unserer Nutzer:innen sowie der auf der Plattform erstellten Inhalte zu unseren wichtigsten Prioritäten.</p>
        <p>Diese Sicherheits- und Datenschutzrichtlinie legt die Grundsätze zum Schutz der Informationen fest, die bei der Nutzung der Website, der Anwendungen, der akademischen Arbeitsbereiche, der KI-gestützten Dienste, der Datenbankanbindungen und der zugehörigen digitalen Dienste von Academiana anfallen.</p>
        <p>Unser Grundsatz ist es zu verhindern, dass die wissenschaftlichen Arbeiten unserer Nutzer:innen von Unbefugten eingesehen, verändert, kopiert oder verwendet werden.</p>

        <h2>2. Geschützte Informationen und Daten</h2>
        <p>Bei Academiana werden insbesondere folgende Informationen und Daten geschützt:</p>
        <ul>
          <li>Vor- und Nachname, E-Mail-Adresse und Kontoinformationen der Nutzer:innen.</li>
          <li>Von Nutzer:innen erstellte Abschlussarbeiten, Artikel, Forschungsexposés und sonstige wissenschaftliche Arbeiten.</li>
          <li>Projektabschnitte, Texte, Literaturverzeichnisse, Zitate und Literaturdatensätze.</li>
          <li>Von Nutzer:innen hochgeladene PDF-, Word- und sonstige Dateien.</li>
          <li>Gespräche mit KI-Assistenten und die erzeugten Ausgaben.</li>
          <li>Statistische Analysen, Umfragen, Datentabellen und Forschungsdateien.</li>
          <li>Nutzungs-, Vorgangs-, Sicherheits- und Fehlerprotokolle.</li>
          <li>Informationen zu Abonnements, Tarifen und Zahlungsvorgängen.</li>
          <li>Informationen zu Mitautorschaft, Freigaben für Betreuende und Teammitgliedschaften.</li>
        </ul>
        <p>Von Nutzer:innen hochgeladene wissenschaftliche Inhalte können personenbezogene Daten enthalten, auch personenbezogene Daten oder besondere Kategorien personenbezogener Daten Dritter. Beim Hochladen solcher Daten auf die Plattform müssen Nutzer:innen die geltenden Rechtsvorschriften einhalten.</p>

        <h2>3. Datensicherheit und technische Schutzmaßnahmen</h2>
        <p>Academiana trifft technische und organisatorische Maßnahmen, um personenbezogene Daten und wissenschaftliche Inhalte sicher aufzubewahren.</p>
        <H3>3.1. Verschlüsselte Kommunikation</H3>
        <p>Die Datenübertragung zwischen Plattform und Nutzer:innen erfolgt über HTTPS. Sichere Verbindungskonfigurationen und zugehörige Sicherheitsrichtlinien verringern das Risiko, dass Daten während der Übertragung von Unbefugten abgefangen werden.</p>
        <H3>3.2. Trennung der Daten zwischen Nutzer:innen</H3>
        <p>Nutzerdaten werden durch auf Datenbankebene angewandte Row-Level-Security-Richtlinien (RLS) geschützt.</p>
        <p>Projekte, Dokumente, Quellen und KI-Gespräche jeder Person werden innerhalb ihrer eigenen Zugriffsrechte gehalten.</p>
        <p>Die technischen Zugriffsrichtlinien sind darauf ausgelegt, unbefugten Zugriff einer Person auf die wissenschaftlichen Arbeiten einer anderen zu verhindern.</p>
        <H3>3.3. Dateisicherheit</H3>
        <p>Von Nutzer:innen hochgeladene Dokumente werden in privaten Speicherbereichen aufbewahrt.</p>
        <p>Der Zugriff auf Dateien erfolgt über Berechtigungsprüfungen und zeitlich begrenzte signierte Links. Über öffentliche Links sind Dateien grundsätzlich nicht zugänglich.</p>
        <H3>3.4. Anwendungssicherheit</H3>
        <p>Zur Unterstützung der Anwendungssicherheit der Plattform werden folgende Mechanismen eingesetzt:</p>
        <ul>
          <li>HTTPS und HTTP Strict Transport Security (HSTS).</li>
          <li>Content Security Policy (CSP).</li>
          <li>Prüfungen von Anfrageherkunft und Berechtigung.</li>
          <li>Sicherheitsprüfungen ausgehender Verbindungen, die auf interne Netzwerke zielen.</li>
          <li>Zugriffsrichtlinien der Datenbank.</li>
          <li>Überwachung von Fehlern und Systemzustand.</li>
          <li>Automatisierte Software- und Regressionstests.</li>
        </ul>
        <p>Die Sicherheitsmaßnahmen können entsprechend technologischen Entwicklungen und erkannten Risiken aktualisiert werden.</p>

        <h2>4. Vertraulichkeit wissenschaftlicher Arbeiten</h2>
        <p>Die wissenschaftlichen Arbeiten der Nutzer:innen sind standardmäßig nur für die jeweilige Person zugänglich. Es gelten folgende Ausnahmen:</p>
        <p><strong>4.1. Mitautor:innen:</strong> Von der Person zu einem Projekt eingeladene Mitautor:innen können im Rahmen der ihnen zugewiesenen Berechtigungen auf die betreffenden Abschnitte, Quellen und Kommentare zugreifen.</p>
        <p><strong>4.2. Teilen mit der Betreuung:</strong> Über einen auf eigenen Wunsch erstellten Freigabelink können Betreuende oder Dritte die durch den Link freigegebenen Inhalte ansehen oder kommentieren. Die Person kann den Link über die vorhandenen Freigabefunktionen widerrufen.</p>
        <p><strong>4.3. Administrator:innen von Institutionen:</strong> Im Rahmen einer Institutionslizenz können Administrator:innen der Institution innerhalb ihrer Verwaltungsberechtigungen Mitgliedsangaben und Nutzungsstatistiken einsehen. Auf den Inhalt der wissenschaftlichen Arbeiten haben sie keinen Zugriff.</p>
        <p><strong>4.4. Berechtigtes Personal der Plattform:</strong> Administrator:innen der Plattform und berechtigtes technisches Personal erhalten technischen Zugriff nur in dem Umfang, der zur Bearbeitung einer Supportanfrage, für eine Sicherheitsprüfung, den Systembetrieb oder die Erfüllung gesetzlicher Pflichten erforderlich ist.</p>

        <h2>5. KI-Dienste und Datenschutz</h2>
        <p>Academiana nutzt für wissenschaftliches Schreiben, Textbearbeitung, Quellenbewertung und weitere KI-gestützte Vorgänge Claude-Modelle von Anthropic.</p>
        <p>Wenn Sie eine KI-Funktion nutzen, können der für den Vorgang erforderliche Text, der Projektkontext und ausgewählte Quelleninhalte an den jeweiligen KI-Dienstanbieter übermittelt werden.</p>
        <p>Diese Übermittlung erfolgt zur Erbringung des angefragten Dienstes und beschränkt sich auf die erforderlichen Daten.</p>
        <p>Academiana beabsichtigt nicht, die wissenschaftlichen Arbeiten seiner Nutzer:innen zum Training eigener KI-Modelle zu verwenden. Die Datenverarbeitungs- und Trainingspraktiken der KI-Anbieter werden im Rahmen der jeweiligen kommerziellen API-Verträge und Nutzungsbedingungen bewertet.</p>
        <p>Nutzerdaten werden weder zu Werbezwecken verkauft noch zu diesem Zweck Dritten zur Verfügung gestellt.</p>

        <h2>6. Speicherort der Daten und Infrastruktur</h2>
        <p>Innerhalb der öffentlich angegebenen Infrastruktur der Plattform werden Anwendung, Datenbank und Dateispeicher in der Europäischen Union, in der Rechenzentrumsregion Frankfurt, betrieben.</p>
        <p>Der Zugang zur Infrastruktur, in der die Daten gespeichert sind, ist durch Berechtigungsmechanismen beschränkt.</p>
        <p>Datenverarbeitungen und grenzüberschreitende Übermittlungen, die Drittanbieter auf ihrer eigenen Infrastruktur vornehmen können, werden gesondert nach den einschlägigen Rechtsvorschriften und Verträgen bewertet.</p>

        <h2>7. Nutzungs- und Sicherheitsprotokolle</h2>
        <p>Um den sicheren Betrieb der Plattform zu gewährleisten, die Tarifnutzung zu berechnen, technische Probleme zu beheben und Missbrauch zu verhindern, können bestimmte Vorgangsprotokolle gespeichert werden.</p>
        <p>Diese Protokolle können Datum des Vorgangs, betroffenes Projekt bzw. betroffenen Abschnitt, Nutzungsumfang, KI-Ausgaben, Löschungen und Sicherheitsereignisse umfassen.</p>
        <p>Bestimmte Vorgangsprotokolle, die zur Klärung von Streitfällen über die Tarifnutzung gespeichert werden, werden nach derzeitiger Praxis 12 Monate aufbewahrt. Der Zugriff darauf ist auf berechtigtes Personal beschränkt.</p>
        <p>Zur Verhinderung von Missbrauch kann im Browser eine zufällige Gerätekennung verwendet werden. Diese Kennung wird nicht für Werbe- oder Marketingzwecke genutzt.</p>

        <h2>8. Aufbewahrung und Löschung von Daten</h2>
        <p>Personenbezogene Daten und wissenschaftliche Inhalte werden so lange aufbewahrt, wie es die Zwecke ihrer Verarbeitung erfordern, und im Rahmen der in den geltenden Rechtsvorschriften vorgesehenen Aufbewahrungspflichten.</p>
        <p>Über die Funktionen im Bereich „Konto und Abonnement“ können Nutzer:innen:</p>
        <ul>
          <li>ihre personenbezogenen Daten und wissenschaftlichen Arbeiten im JSON-Format exportieren,</li>
          <li>die Löschung ihres Kontos und der damit verbundenen Daten beantragen.</li>
        </ul>
        <p>Für Datensätze, die nach geltendem Recht aufbewahrt werden müssen, und für Sicherungskopien, die technisch nicht sofort gelöscht werden können, gelten die jeweiligen Aufbewahrungs- und Vernichtungsverfahren.</p>

        <h2>9. Cookies und Gerätekennungen</h2>
        <p>Academiana kann für Sitzungsverwaltung, Kontosicherheit, den Betrieb des Dienstes und die Verhinderung von Missbrauch notwendige Cookies und Gerätekennungen verwenden.</p>
        <p>Werden nicht notwendige Analyse-, Werbe- oder Marketing-Cookies eingesetzt, werden die nach geltendem Recht erforderlichen Informations- und Einwilligungsmechanismen angewandt.</p>
        <p>Arten, Zwecke und Speicherdauer der Cookies werden in der Cookie-Richtlinie erläutert (siehe unten <a href="#ayrintilar" className="text-brand-700 underline">Ausführliche Informationen</a>).</p>

        <h2>10. Datenschutzverletzungen und Sicherheitsvorfälle</h2>
        <p>Wird ein rechtswidriger Erwerb personenbezogener Daten, ein unbefugter Zugriff oder ein Ereignis festgestellt, das die Datensicherheit beeinträchtigt, werden die erforderlichen Untersuchungs- und Reaktionsprozesse entsprechend der Art des Vorfalls und den geltenden Rechtsvorschriften durchgeführt.</p>
        <p>Erforderliche Meldungen an betroffene Personen und zuständige Behörden erfolgen innerhalb der gesetzlichen Fristen und nach den vorgeschriebenen Verfahren.</p>

        <h2>11. Aktualisierungen dieser Richtlinie</h2>
        <p>Academiana kann diese Richtlinie bei Änderungen der technischen Infrastruktur, der Dienste, der Datenverarbeitung oder der einschlägigen Rechtsvorschriften aktualisieren.</p>
        <p>Die jeweils gültige Fassung wird auf der Website veröffentlicht.</p>

        <h2 id="ayrintilar">Ausführliche Informationen</h2>
        <H3>Kontodaten und Anmeldung</H3>
        <p>Wenn Sie sich mit Google oder Apple anmelden, erhalten wir von diesem Dienst nur Ihren Namen und Ihre E-Mail-Adresse (bei Apple ggf. eine private Weiterleitungsadresse); Ihr Google- oder Apple-Passwort sehen wir nie. Zahlungsdaten verarbeitet der Zahlungsdienstleister; Kartendaten werden nie auf unseren Servern gespeichert.</p>
        <H3>Besuchsstatistik (ohne Cookies)</H3>
        <p>Um zu messen, wie viele Personen die Website besuchen, werden Seitenaufrufe ohne Cookies gezählt. IP-Adressen und Browserdetails werden nicht gespeichert; aufbewahrt wird nur ein anonymer Code, der sich täglich ändert, sodass Besucher:innen weder identifiziert noch über mehrere Tage verfolgt werden können. Sendet Ihr Browser ein „Do Not Track“- oder „Global Privacy Control“-Signal, wird nichts gezählt.</p>
        <H3>Nutzungsprotokolle</H3>
        <p>Zur Klärung von Streitfällen über die Tarifnutzung werden die KI-Ausgaben, die Sie erhalten (Datum, Titel von Arbeit und Abschnitt, Wortzahl und Ausgabetext), sowie Ihre Löschungen von Arbeiten, Abschnitten oder größeren Textteilen protokolliert. Dieses Protokoll wird 12 Monate aufbewahrt, ist nur für berechtigte Administrator:innen sichtbar, wird für keinen anderen Zweck verwendet und zusammen mit Ihrem Konto gelöscht.</p>
        <p>Im Tarif „Tek Proje“ (Einzelprojekt) wird zusätzlich von jedem vollständigen Download ein Fingerabdruck gespeichert: die Wortzahl, eine Zusammenfassung aus 64 Zahlen, aus der sich der Text nicht rekonstruieren lässt, und die Titelblattangaben (Autor:in, Hochschule, Fachbereich, Betreuung). Er dient ausschließlich dazu festzustellen, ob innerhalb des Tarifs verschiedene Arbeiten geschrieben werden, und unterliegt denselben Aufbewahrungs- und Zugriffsregeln.</p>
        <H3>Cookies und Gerätekennung</H3>
        <p>Sitzungscookies halten Sie angemeldet. Ihr Browser speichert außerdem eine zufällige Gerätekennung ohne personenbezogene Informationen (im Browserspeicher und in einem Erstanbieter-Cookie). Mit Ihrem Konto wird nur ihre Einweg-Zusammenfassung (SHA-256) gespeichert. Sie dient ausschließlich der Missbrauchsverhinderung: Registriert sich ein über einen Einladungslink angelegtes Konto von einem Gerät aus, das die einladende Person genutzt hat, wird keine Empfehlungsprämie gewährt; im Tarif „Tek Proje“ wird die Nutzung eines Kontos auf vielen Geräten den Administrator:innen als mögliche Kontoweitergabe gemeldet. Sie wird weder für Werbung noch für Tracking verwendet und zusammen mit Ihrem Konto gelöscht. Es werden keine Werbe- oder Drittanbieter-Analyse-Cookies verwendet.</p>
        <H3>Mitautor:innen</H3>
        <p>Mitautor:innen sehen die Abschnitte, Quellen und Kommentare der Arbeit; die Dateien und Assistenten-Chats der Eigentümerin bzw. des Eigentümers sehen sie nie. Die für eine Einladung eingegebene E-Mail-Adresse wird nur gespeichert, um die Einladung der richtigen Person zuzustellen.</p>
        <H3>Ihre Rechte</H3>
        <p>Auf Ihrer Kontoseite können Sie alle Ihre Daten in einem portablen Format (JSON) herunterladen und Ihr Konto mit allen Daten endgültig löschen. Für Ihre weiteren Rechte nach Art. 11 KVKK und der DSGVO können Sie sich an die verantwortliche Stelle wenden.</p>
      </StaticPage>
    );
  }
  if (locale === "en") {
    return (
      <StaticPage path="/gizlilik" title="Security and Privacy Policy" lead="How we protect your personal data, academic work and uploaded documents.">
        <p className="text-sm text-ink-500">Last updated: 08.11.2026</p>

        <h2>1. Purpose and scope</h2>
        <p>At Academiana, we consider the privacy and security of our users’ personal data, academic work, uploaded documents and the content they create on the platform among our core priorities.</p>
        <p>This Security and Privacy Policy sets out the principles for protecting information obtained through the use of the Academiana website, applications, academic workspaces, AI-assisted services, database integrations and related digital services.</p>
        <p>Our core approach is to prevent users’ academic work from being viewed, modified, copied or used by unauthorised persons.</p>

        <h2>2. Information and data protected</h2>
        <p>The following categories of information and data are protected within Academiana:</p>
        <ul>
          <li>Users’ name, surname, email address and account information.</li>
          <li>Theses, articles, research proposals and other academic work created by users.</li>
          <li>Project sections, texts, bibliographies, citations and literature records.</li>
          <li>PDF, Word and other files uploaded by users.</li>
          <li>Conversations with AI assistants and the outputs generated.</li>
          <li>Statistical analyses, surveys, data tables and research files.</li>
          <li>Usage, transaction, security and error logs.</li>
          <li>Information on subscriptions, plans and payment transactions.</li>
          <li>Co-authoring, advisor sharing and team membership information.</li>
        </ul>
        <p>Academic content uploaded by users may contain personal data, including personal data or special categories of personal data belonging to third parties. Users must comply with the applicable legislation when uploading such data to the platform.</p>

        <h2>3. Data security and technical safeguards</h2>
        <p>Academiana applies technical and administrative measures to keep personal data and academic content secure.</p>
        <H3>3.1. Encrypted communication</H3>
        <p>Data communication between the platform and the user takes place over HTTPS. Secure connection configurations and related security policies are used to reduce the risk of data being intercepted by unauthorised persons in transit.</p>
        <H3>3.2. Isolation of data between users</H3>
        <p>User data is protected by Row Level Security (RLS) policies applied at the database level.</p>
        <p>Each user’s projects, documents, sources and AI conversations are kept within that user’s own access rights.</p>
        <p>Technical access policies are designed to prevent any user from gaining unauthorised access to another user’s academic work.</p>
        <H3>3.3. File security</H3>
        <p>Documents uploaded by users are kept in private storage.</p>
        <p>Files are accessed through authorisation checks and time-limited signed links. Files are not, as a rule, accessible through public links.</p>
        <H3>3.4. Application security</H3>
        <p>The following mechanisms are used to support the platform’s application security:</p>
        <ul>
          <li>HTTPS and HTTP Strict Transport Security (HSTS).</li>
          <li>Content Security Policy (CSP).</li>
          <li>Request origin and authorisation checks.</li>
          <li>Security checks on outbound connections targeting internal networks.</li>
          <li>Database access policies.</li>
          <li>Error and system health monitoring.</li>
          <li>Automated software and regression tests.</li>
        </ul>
        <p>Security measures may be updated in line with technological developments and identified risks.</p>

        <h2>4. Privacy of academic work</h2>
        <p>Users’ academic work is, by default, accessible only to the user concerned. The following exceptions apply:</p>
        <p><strong>4.1. Co-authors:</strong> Co-authors invited to a project by the user may access the relevant sections, sources and comments within the permissions assigned to them.</p>
        <p><strong>4.2. Sharing with an advisor:</strong> Through a sharing link created at the user’s own request, an advisor or third parties may view, or comment on, the content permitted by that link. The user can revoke the link using the available sharing features.</p>
        <p><strong>4.3. Institution administrators:</strong> Under an institutional licence, institution administrators may be shown member information and usage statistics within the administrative permissions assigned to them. Institution administrators have no access to the content of users’ academic work.</p>
        <p><strong>4.4. Authorised platform staff:</strong> Platform administrators and authorised technical staff may obtain technical access only to the extent necessary to respond to a support request, carry out a security review, operate the system or fulfil legal obligations.</p>

        <h2>5. AI services and data privacy</h2>
        <p>Academiana uses Claude models provided by Anthropic for academic writing, text editing, source evaluation and other AI-assisted operations.</p>
        <p>When a user uses an AI feature, the text, project context and selected source content needed to carry out that operation may be sent to the relevant AI service provider.</p>
        <p>This transfer is made to deliver the requested service and is limited to the data required.</p>
        <p>Academiana does not intend to use users’ academic work to train its own AI models. The data processing and model training practices of AI providers are assessed within the framework of the relevant commercial API agreements and terms of service.</p>
        <p>User data is not sold for advertising purposes or made available to third parties for that purpose.</p>

        <h2>6. Where data is stored and infrastructure</h2>
        <p>Within the platform’s publicly disclosed infrastructure, the application, database and file storage services are hosted within the European Union, in the Frankfurt data centre region.</p>
        <p>Access to the infrastructure where data is stored is restricted by authorisation mechanisms.</p>
        <p>Data processing and cross-border transfers that third-party service providers may carry out on their own infrastructure are assessed separately under the relevant legislation and agreements.</p>

        <h2>7. Usage and security records</h2>
        <p>Certain transaction records may be kept to ensure the platform operates securely, calculate plan usage, resolve technical issues and prevent abuse.</p>
        <p>These records may include the date of the transaction, the related project or section, the amount of usage, AI outputs, deletions and security events.</p>
        <p>Certain transaction records kept to resolve disputes about plan usage are, under current practice, retained for 12 months. Access to these records is limited to authorised staff.</p>
        <p>A random device identifier may be used in the browser to prevent abuse. This identifier is not used for advertising or marketing.</p>

        <h2>8. Data retention and deletion</h2>
        <p>Personal data and academic content are kept for as long as required by the purposes for which they are processed and within the retention obligations set out in the applicable legislation.</p>
        <p>Using the features available in the account and subscription area, users can:</p>
        <ul>
          <li>Export their personal data and academic work in JSON format.</li>
          <li>Request deletion of their account and the data associated with it.</li>
        </ul>
        <p>Deletion may be subject to the relevant retention and destruction procedures for records that must be kept under the applicable legislation and for backups that cannot technically be deleted immediately.</p>

        <h2>9. Cookies and device identifiers</h2>
        <p>Academiana may use necessary cookies and device identifiers for session management, account security, operation of the service and prevention of abuse.</p>
        <p>If non-essential analytics, advertising or marketing cookies are used, the information and explicit consent mechanisms required by the applicable legislation will be applied.</p>
        <p>The types, purposes and retention periods of cookies are explained in the Cookie Policy (see <a href="#ayrintilar" className="text-brand-700 underline">Detailed information</a> below).</p>

        <h2>10. Data breaches and security incidents</h2>
        <p>If unlawful acquisition of personal data, unauthorised access or an event affecting data security is detected, the necessary investigation and response processes are carried out according to the nature of the incident and the legislation in force.</p>
        <p>Notifications required to be made to the persons concerned and the competent authorities are made in accordance with the legal time limits and procedures.</p>

        <h2>11. Updates to this policy</h2>
        <p>Academiana may update this policy in line with changes to its technological infrastructure, services, data processing activities or the relevant legislation.</p>
        <p>The current policy is published on the website.</p>

        <h2 id="ayrintilar">Detailed information</h2>
        <H3>Account data and sign-in</H3>
        <p>If you sign in with Google or Apple, we receive only your name and email address from that service (with Apple, possibly a private relay address); we never see your Google or Apple password. Payment details are processed by the payment provider; card details are never stored on our servers.</p>
        <H3>Visit statistics (no cookies)</H3>
        <p>To measure how many people visit the site, page views are counted without cookies. IP addresses and browser details are not stored; only an anonymous code that changes every day is kept, so a visitor cannot be identified or followed across days. Nothing is counted if your browser sends a “Do Not Track” or Global Privacy Control signal.</p>
        <H3>Usage records</H3>
        <p>To resolve disputes about plan usage, the AI outputs you receive (date, work and section title, word count and output text) and your deletions of works, sections or large parts of text are recorded. This record is kept for 12 months, is visible only to authorised administrators, is not used for any other purpose and is deleted together with your account.</p>
        <p>On the Single Project plan, a fingerprint of each full download is also stored: the word count, a 64-number summary from which the text cannot be reconstructed, and the cover details (author, university, department, supervisor). It is used only to detect whether different works are written within the plan, under the same retention and access rules.</p>
        <H3>Cookies and device identifier</H3>
        <p>Session cookies are used to keep you signed in. Your browser also stores a random device identifier that contains no personal information (in browser storage and a first-party cookie). Only its one-way summary (SHA-256) is saved with your account. It is used only to prevent abuse: if an account created with an invitation link signs up from a device the inviter has used, no referral reward is granted; on the Single Project plan, use of one account from many devices is reported to administrators as possible account sharing. It is not used for advertising or tracking and is deleted together with your account. No advertising or third-party analytics cookies are used.</p>
        <H3>Co-authors</H3>
        <p>Co-authors see the work’s sections, sources and comments; they never see the owner’s files or assistant chats. The email address entered for an invitation is stored only to deliver the invitation to the right person.</p>
        <H3>Your rights</H3>
        <p>From your account page you can download all your data in a portable format (JSON) and permanently delete your account with all its data. For your other rights under KVKK Article 11 and the GDPR, you can contact the data controller.</p>
      </StaticPage>
    );
  }
  return (
    <StaticPage path="/gizlilik" title="Güvenlik ve Gizlilik Politikası" lead="Kişisel verilerinizi, akademik çalışmalarınızı ve yüklediğiniz belgeleri nasıl koruyoruz?">
      <p className="text-sm text-ink-500">Son güncelleme: 08.11.2026</p>

      <h2>1. Amaç ve Kapsam</h2>
      <p>Academiana olarak kullanıcılarımızın kişisel verilerinin, akademik çalışmalarının, yükledikleri belgelerin ve platform üzerinden oluşturdukları içeriklerin gizliliğini ve güvenliğini temel önceliklerimiz arasında kabul ediyoruz.</p>
      <p>İşbu Güvenlik ve Gizlilik Politikası; Academiana internet sitesi, uygulamaları, akademik çalışma alanları, yapay zekâ destekli hizmetleri, veri tabanı entegrasyonları ve bunlarla bağlantılı dijital hizmetlerin kullanımı sırasında elde edilen bilgilerin korunmasına ilişkin esasları düzenlemektedir.</p>
      <p>Platformumuzun temel yaklaşımı, kullanıcıların akademik çalışmalarının yetkisiz kişiler tarafından görüntülenmesini, değiştirilmesini, kopyalanmasını veya kullanılmasını önlemektir.</p>

      <h2>2. Korunan Bilgi ve Veri Türleri</h2>
      <p>Academiana kapsamında aşağıdaki bilgi ve veri kategorileri korunmaktadır:</p>
      <ul>
        <li>Kullanıcıların ad, soyad, e-posta adresi ve hesap bilgileri.</li>
        <li>Kullanıcıların oluşturduğu tez, makale, araştırma önerisi ve diğer akademik çalışmalar.</li>
        <li>Proje bölümleri, metinler, kaynakçalar, atıflar ve literatür kayıtları.</li>
        <li>Kullanıcılar tarafından yüklenen PDF, Word ve diğer dosyalar.</li>
        <li>Yapay zekâ asistanlarıyla gerçekleştirilen görüşmeler ve oluşturulan çıktılar.</li>
        <li>İstatistiksel analizler, anketler, veri tabloları ve araştırma dosyaları.</li>
        <li>Kullanım, işlem, güvenlik ve hata kayıtları.</li>
        <li>Abonelik, paket ve ödeme işlemlerine ilişkin bilgiler.</li>
        <li>Ortak çalışma, danışmanla paylaşım ve ekip üyeliği bilgileri.</li>
      </ul>
      <p>Kullanıcıların yükledikleri akademik içerikler, kişisel veri içerebileceği gibi üçüncü kişilere ait kişisel verileri veya özel nitelikli kişisel verileri de içerebilir. Kullanıcıların bu tür verileri platforma yüklerken ilgili mevzuata uygun hareket etmesi gerekir.</p>

      <h2>3. Veri Güvenliği ve Teknik Koruma Önlemleri</h2>
      <p>Academiana, kişisel verilerin ve akademik içeriklerin güvenliğini sağlamak amacıyla teknik ve idari tedbirler uygular.</p>
      <H3>3.1. Şifreli İletişim</H3>
      <p>Platform ile kullanıcı arasındaki veri iletişimi HTTPS protokolü üzerinden gerçekleştirilir. Güvenli bağlantı yapılandırmaları ve ilgili güvenlik politikaları kullanılarak iletişim sırasında verilerin yetkisiz kişiler tarafından ele geçirilmesi riskinin azaltılması hedeflenir.</p>
      <H3>3.2. Kullanıcılar Arası Veri İzolasyonu</H3>
      <p>Kullanıcı verileri, veritabanı seviyesinde uygulanan satır düzeyinde erişim denetimi (Row Level Security – RLS) politikalarıyla korunur.</p>
      <p>Her kullanıcının projeleri, belgeleri, kaynakları ve yapay zekâ görüşmeleri kendi erişim yetkileri kapsamında tutulur.</p>
      <p>Bir kullanıcının başka bir kullanıcının akademik çalışmalarına yetkisiz erişim sağlaması teknik erişim politikalarıyla engellenmeye çalışılır.</p>
      <H3>3.3. Dosya Güvenliği</H3>
      <p>Kullanıcıların yüklediği belgeler özel erişimli depolama alanlarında muhafaza edilir.</p>
      <p>Dosyalara erişim, yetkilendirme kontrolleri ve süreli imzalı bağlantılar aracılığıyla sağlanır. Dosyaların herkese açık bağlantılar üzerinden erişilebilir olması esas değildir.</p>
      <H3>3.4. Uygulama Güvenliği</H3>
      <p>Platformun uygulama güvenliğini desteklemek amacıyla aşağıdaki mekanizmalar kullanılmaktadır:</p>
      <ul>
        <li>HTTPS ve HTTP Strict Transport Security (HSTS).</li>
        <li>İçerik Güvenlik Politikası (Content Security Policy – CSP).</li>
        <li>İstek kaynağı ve yetkilendirme kontrolleri.</li>
        <li>İç ağlara yönelik dış bağlantı güvenlik kontrolleri.</li>
        <li>Veritabanı erişim politikaları.</li>
        <li>Hata ve sistem sağlığı izleme mekanizmaları.</li>
        <li>Otomatik yazılım ve regresyon testleri.</li>
      </ul>
      <p>Güvenlik önlemleri, teknolojik gelişmeler ve tespit edilen riskler doğrultusunda güncellenebilir.</p>

      <h2>4. Akademik Çalışmaların Gizliliği</h2>
      <p>Kullanıcıların akademik çalışmaları varsayılan olarak yalnızca ilgili kullanıcıya açıktır. Bununla birlikte aşağıdaki istisnalar geçerlidir:</p>
      <p><strong>4.1. Ortak yazarlar:</strong> Kullanıcı tarafından projeye davet edilen ortak yazarlar, kendilerine tanımlanan yetkiler kapsamında ilgili çalışma bölümlerine, kaynaklara ve yorumlara erişebilir.</p>
      <p><strong>4.2. Danışmanla paylaşım:</strong> Kullanıcının kendi isteğiyle oluşturduğu paylaşım bağlantısı üzerinden danışman veya üçüncü kişiler, bağlantı kapsamında izin verilen içerikleri görüntüleyebilir veya yorum yapabilir. Kullanıcı, mevcut paylaşım özellikleri çerçevesinde bağlantıyı iptal edebilir.</p>
      <p><strong>4.3. Kurum yöneticileri:</strong> Kurum lisansı kapsamında kurum yöneticilerine, kendilerine tanımlanan yönetim yetkileri çerçevesinde üye bilgileri ve kullanım istatistikleri gösterilebilir. Kurum yöneticilerinin kullanıcıların akademik çalışma içeriklerine erişimi bulunmaz.</p>
      <p><strong>4.4. Yetkili platform personeli:</strong> Platform yöneticileri ve yetkilendirilmiş teknik personel, yalnızca destek talebinin karşılanması, güvenlik incelemesi, sistemin işletilmesi veya hukuki yükümlülüklerin yerine getirilmesi için gerekli olduğu ölçüde teknik erişim sağlayabilir.</p>

      <h2>5. Yapay Zekâ Hizmetleri ve Veri Gizliliği</h2>
      <p>Academiana, akademik yazım, metin düzenleme, kaynak değerlendirme ve diğer yapay zekâ destekli işlemlerde Anthropic tarafından sunulan Claude modellerinden yararlanır.</p>
      <p>Kullanıcının bir yapay zekâ özelliğini kullanması durumunda, ilgili işlemin gerçekleştirilmesi için gerekli olan metin, proje bağlamı ve seçilmiş kaynak içerikleri ilgili yapay zekâ hizmet sağlayıcısına iletilebilir.</p>
      <p>Bu aktarım, talep edilen hizmetin yerine getirilmesi amacıyla ve gerekli veriyle sınırlı olarak gerçekleştirilir.</p>
      <p>Academiana, kullanıcıların akademik çalışmalarını kendi yapay zekâ modellerini eğitmek amacıyla kullanmayı amaçlamaz. Yapay zekâ sağlayıcılarının veri işleme ve model eğitimi uygulamaları, ilgili ticari API sözleşmeleri ve hizmet koşulları çerçevesinde değerlendirilir.</p>
      <p>Kullanıcı verileri, reklam amacıyla satılmaz veya bu amaçla üçüncü kişilere sunulmaz.</p>

      <h2>6. Verilerin Saklandığı Yer ve Altyapı</h2>
      <p>Platformun kamuya açıklanan altyapısı kapsamında uygulama, veri tabanı ve dosya depolama hizmetleri Avrupa Birliği sınırları içerisinde, Frankfurt veri merkezi bölgesinde barındırılmaktadır.</p>
      <p>Verilerin saklandığı altyapıya erişim yetkilendirme mekanizmalarıyla sınırlandırılır.</p>
      <p>Üçüncü taraf hizmet sağlayıcıların kendi altyapılarında gerçekleştirebileceği veri işleme ve yurt dışına aktarım faaliyetleri ayrıca ilgili mevzuat ve sözleşmeler çerçevesinde değerlendirilir.</p>

      <h2>7. Kullanım ve Güvenlik Kayıtları</h2>
      <p>Platformun güvenli çalışmasını sağlamak, paket kullanım haklarını hesaplamak, teknik sorunları gidermek ve kötüye kullanımı önlemek amacıyla belirli işlem kayıtları tutulabilir.</p>
      <p>Bu kayıtlar; işlem tarihi, ilgili proje veya bölüm bilgisi, kullanım miktarı, yapay zekâ çıktısı, silme işlemleri ve güvenlik olayları gibi bilgileri içerebilir.</p>
      <p>Paket kullanımına ilişkin anlaşmazlıkların çözümü amacıyla tutulan belirli işlem kayıtları, mevcut uygulama kapsamında 12 ay süreyle saklanır. Bu kayıtların erişimi yetkili personelle sınırlandırılır.</p>
      <p>Kötüye kullanımın önlenmesi amacıyla tarayıcıda rastgele bir cihaz tanımlayıcısı kullanılabilir. Bu tanımlayıcı, reklam veya pazarlama amacıyla kullanılmaz.</p>

      <h2>8. Veri Saklama ve Silme</h2>
      <p>Kişisel veriler ve akademik içerikler, işlenme amaçlarının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen saklama yükümlülükleri çerçevesinde muhafaza edilir.</p>
      <p>Kullanıcılar hesap ve abonelik alanındaki mevcut özellikler üzerinden:</p>
      <ul>
        <li>Kişisel verilerini ve akademik çalışmalarını JSON formatında dışa aktarabilir.</li>
        <li>Hesaplarının ve hesapla ilişkili verilerinin silinmesini talep edebilir.</li>
      </ul>
      <p>Silme işlemleri, ilgili mevzuat kapsamında saklanması zorunlu olan kayıtlar ve teknik olarak derhal silinemeyen yedekler bakımından ilgili saklama ve imha prosedürlerine tabi olabilir.</p>

      <h2>9. Çerezler ve Cihaz Tanımlayıcıları</h2>
      <p>Academiana, oturum yönetimi, hesap güvenliği, hizmetin çalışması ve kötüye kullanımın önlenmesi amacıyla gerekli çerezler ve cihaz tanımlayıcılarından yararlanabilir.</p>
      <p>Zorunlu olmayan analitik, reklam veya pazarlama çerezleri kullanılması hâlinde, ilgili mevzuatın gerektirdiği bilgilendirme ve açık rıza mekanizmaları uygulanır.</p>
      <p>Çerezlerin türleri, amaçları ve saklama süreleri ilgili Çerez Politikası kapsamında açıklanır (aşağıdaki <a href="#ayrintilar" className="text-brand-700 underline">Ayrıntılı bilgilendirme</a> bölümüne bakınız).</p>

      <h2>10. Veri İhlalleri ve Güvenlik Olayları</h2>
      <p>Kişisel verilerin hukuka aykırı şekilde elde edilmesi, yetkisiz erişim veya veri güvenliğini etkileyen bir olayın tespit edilmesi durumunda, olayın niteliğine ve yürürlükteki mevzuata uygun olarak gerekli inceleme ve müdahale süreçleri yürütülür.</p>
      <p>İlgili kişilere ve yetkili kurumlara yapılması gereken bildirimler yasal süre ve usullere uygun şekilde gerçekleştirilir.</p>

      <h2>11. Politikanın Güncellenmesi</h2>
      <p>Academiana, teknolojik altyapısında, hizmetlerinde, veri işleme süreçlerinde veya ilgili mevzuatta meydana gelen değişiklikler doğrultusunda bu politikayı güncelleyebilir.</p>
      <p>Güncel politika internet sitesi üzerinden yayımlanır.</p>

      <h2 id="ayrintilar">Ayrıntılı bilgilendirme</h2>
      <H3>Hesap bilgileri ve giriş</H3>
      <p>Google veya Apple ile giriş yaparsanız bu hizmetten yalnızca adınızı ve e-posta adresinizi (Apple’da gizli yönlendirme adresi olabilir) alırız; Google veya Apple şifrenizi hiçbir zaman görmeyiz. Ödeme bilgileri ödeme sağlayıcısı tarafından işlenir; kart bilgileri sunucularımızda saklanmaz.</p>
      <H3>Ziyaret istatistikleri (çerezsiz)</H3>
      <p>Sitenin kaç kişi tarafından ziyaret edildiğini ölçmek için sayfa görüntülemeleri çerez kullanılmadan sayılır. IP adresi ve tarayıcı bilgisi saklanmaz; yalnızca her gün değişen anonim bir kod tutulur, bu nedenle ziyaretçi kimliği belirlenemez ve günler arasında izlenemez. Tarayıcınız “izleme yapma” (Do Not Track / Global Privacy Control) sinyali gönderiyorsa hiçbir sayım yapılmaz.</p>
      <H3>Kullanım kaydı</H3>
      <p>Paket kullanımına ilişkin anlaşmazlıkların çözümü için aldığınız yapay zekâ çıktıları (tarih, çalışma ve bölüm adı, kelime sayısı ve çıktı metni) ile çalışma, bölüm veya büyük metin silmeleriniz kaydedilir. Bu kayıt 12 ay saklanır, yalnızca yetkili yöneticiler görebilir, başka bir amaçla kullanılmaz ve hesabınızla birlikte silinir.</p>
      <p>Tek Proje paketinde ayrıca her tam indirmenin parmak izi saklanır: kelime sayısı, metnin geri elde edilemeyeceği 64 sayılık bir özet ve kapak bilgileri (yazar, üniversite, bölüm, danışman). Yalnızca paket içinde farklı çalışmalar yazılıp yazılmadığını anlamak için, aynı saklama ve erişim kurallarıyla kullanılır.</p>
      <H3>Çerezler ve cihaz kimliği</H3>
      <p>Oturumunuzun açık kalması için oturum çerezleri kullanılır. Ayrıca tarayıcınızda kişisel bilgi içermeyen rastgele bir cihaz kimliği saklanır (tarayıcı belleği ve birinci taraf çerez). Hesabınızla birlikte yalnızca bu kimliğin geri çözülemeyen özeti (SHA-256) kaydedilir. Yalnızca kötüye kullanımı önlemek için kullanılır: davet bağlantısıyla açılan hesap, davet edenin kullandığı bir cihazdan kaydolursa davet ödülü verilmez; Tek Proje paketinde tek hesabın çok sayıda cihazdan kullanılması olası hesap paylaşımı olarak yöneticilere bildirilir. Reklam veya izleme için kullanılmaz; hesabınızla birlikte silinir. Reklam veya üçüncü taraf analitik çerezi kullanılmaz.</p>
      <H3>Ortak yazarlar</H3>
      <p>Ortak yazarlar çalışmanın bölümlerini, kaynaklarını ve yorumlarını görür; sahibin dosyalarını ve asistan sohbetlerini göremez. Davet için girilen e-posta adresi yalnızca daveti doğru kişiye ulaştırmak için saklanır.</p>
      <H3>Haklarınız</H3>
      <p>Hesap sayfanızdan tüm verilerinizi taşınabilir biçimde (JSON) indirebilir ve hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz. 6698 sayılı KVKK md. 11 ve GDPR kapsamındaki diğer talepleriniz için veri sorumlusuna başvurabilirsiniz.</p>
    </StaticPage>
  );
}

export const dynamic = "force-dynamic";
