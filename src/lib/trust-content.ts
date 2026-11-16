/**
 * Güven merkezi (D213) içeriği: TR/EN/DE. Yalnızca sistemin gerçekte yaptığını ve hukuki metinlerle (lib/legal)
 * uyumlu bilgileri içerir. Hizmet sağlayıcı veya veri konumu değişirse hem bu dosya hem KVKK/Gizlilik metni güncellenir.
 * “Eğitimde kullanılmaz” beyanının dayanağı: Anthropic Commercial Terms of Service, B. Customer Content
 * (“Anthropic may not train models on Customer Content from Services.”, yürürlük 17 Haziran 2025; 16 Kasım 2026’da kontrol edildi).
 */
export type TrustLocale = "tr" | "en" | "de";
interface Section { id: string; h: string; p?: string[]; list?: string[] }
interface Provider { name: string; role: string; location: string }
export interface TrustContent { title: string; lead: string; pillars: [string, string][]; sections: Section[]; providersTitle: string; providersHead: [string, string, string]; providers: Provider[]; checked: string }

export const TRUST: Record<TrustLocale, TrustContent> = {
  tr: {
    title: "Güven merkezi",
    lead: "Verilerinizin nerede tutulduğu, kimlerle paylaşıldığı, yapay zekânın onları nasıl kullandığı ve çalışmanızı nasıl koruduğumuz: tek sayfada, açıkça.",
    pillars: [
      ["Eğitimde kullanılmaz", "Çalışmalarınız yapay zekâ modellerinin eğitiminde kullanılmaz."],
      ["Avrupa’da barındırma", "Veritabanı, dosyalar ve uygulama Frankfurt’taki sunucularda."],
      ["Yalnızca siz ve davetlileriniz", "Her çalışma veritabanı düzeyinde ayrılır."],
      ["Uydurma yok", "Yapay zekâ kaynak, veri veya bulgu üretmez."],
    ],
    sections: [
      { id: "egitim", h: "Çalışmalarınız yapay zekâ eğitiminde kullanılmaz", p: [
        "Yapay zekâ özellikleri Anthropic’in Claude modelleriyle, ticari hizmet koşulları altında çalışır. Bu koşullar Anthropic’in, hizmet üzerinden gönderilen içerikle (sizin metniniz, kaynak parçalarınız ve yapay zekânın cevapları) model eğitmesini açıkça yasaklar.",
        "Academiana da kendi yapay zekâ modelini eğitmez; metinleriniz yalnızca istediğiniz işi (yazım, okuma, denetim) yapmak için, o istek sırasında modele gönderilir.",
      ] },
      { id: "konum", h: "Verileriniz nerede?", list: [
        "Hesabınız, çalışmalarınız, kaynaklarınız ve yüklediğiniz dosyalar Supabase altyapısında, Avrupa Birliği’nde Frankfurt veri merkezinde tutulur.",
        "Uygulama Vercel’in Frankfurt bölgesinde çalışır; sayfaların hızlı açılması için Vercel’in küresel içerik dağıtım ağı da kullanılır.",
        "Bir yapay zekâ özelliğini kullandığınızda, yalnızca o iş için gereken metin, çalışma bağlamı ve seçilen kaynak/dosya parçaları ABD’deki Anthropic’e aktarılır.",
        "Akademik veri tabanlarında arama yapılırken bu servislere yalnızca arama terimleri ve DOI gönderilir; kimliğiniz gönderilmez.",
      ] },
      { id: "erisim", h: "Çalışmanızı kim görebilir?", list: [
        "Her kullanıcının verisi veritabanı düzeyinde satır bazlı erişim kurallarıyla (RLS) ayrılır: bir çalışmayı yalnızca sahibi ve sahibinin davet ettiği ortak yazarlar veya danışman görebilir.",
        "Paylaşım bağlantıları sizin isteğinizle oluşturulur ve hesabınızdan istediğiniz an kapatılabilir.",
        "Parolanız geri çözülemeyecek biçimde saklanır; Google veya Apple ile girişte yalnızca ad ve e-posta bilginiz alınır.",
      ] },
      { id: "guvenlik", h: "Uygulama güvenliği", list: [
        "Bütün bağlantılar zorunlu HTTPS ile şifrelenir (HSTS).",
        "İçerik güvenlik politikası (CSP), istek kökeni denetimi ve dış bağlantılarda iç ağ koruması uygulanır.",
        "Her güncellemeden önce 700’den fazla otomatik test çalışır; kullanıcı verilerinin birbirinden ayrıldığı gerçek bir veritabanı üzerinde sınanır.",
        "Hatalar, yapay zekâ yanıt süreleri ve bağlı hizmetlerin durumu sürekli izlenir.",
      ] },
      { id: "dogruluk", h: "Doğruluk ve şeffaflık", list: [
        "Yapay zekâ yalnızca çalışmanıza eklenmiş gerçek kaynaklara atıf yapar; kaynak yoksa [KAYNAK GEREKLİ] diye işaretler.",
        "Her kaynağın ne kadarının okunduğu (yalnızca künye, özet veya tam metin) açıkça gösterilir.",
        "Mizan, atıflı her cümleyi kaynağın okunan metniyle karşılaştırır ve kararını birebir alıntı ve sayfayla gösterir. Nasıl çalıştığı Yöntem ve şeffaflık sayfasında anlatılır.",
        "İntihal yüzdesi göstermeyiz: lisanslı bir karşılaştırma servisi olmadan verilecek bir oran yanıltıcı olur.",
      ] },
      { id: "haklar", h: "Verileriniz üzerindeki haklarınız", list: [
        "Hesap sayfanızdan bütün verilerinizi okunabilir bir rapor ve makinece okunabilir dosya olarak indirebilirsiniz.",
        "Hesabınızı ve bütün çalışmalarınızı silebilirsiniz.",
        "KVKK ve GDPR kapsamındaki ayrıntılar ilgili aydınlatma metinlerindedir.",
      ] },
      { id: "iletisim", h: "Güvenlik bildirimi ve iletişim", p: ["Bir güvenlik açığı fark ederseniz veya verilerinizle ilgili bir sorunuz varsa iletisim@academiana.com.tr adresine yazın; bildirimleri öncelikli olarak inceleriz."] },
    ],
    providersTitle: "Hizmet sağlayıcılar",
    providersHead: ["Sağlayıcı", "Ne için", "Konum"],
    providers: [
      { name: "Supabase", role: "Veritabanı, kimlik doğrulama, dosya depolama", location: "Frankfurt, AB" },
      { name: "Vercel", role: "Uygulama barındırma ve içerik dağıtımı", location: "Frankfurt, AB + küresel CDN" },
      { name: "Anthropic (Claude)", role: "Yapay zekâ özellikleri (yalnızca kullanıldığında)", location: "ABD" },
      { name: "Google, Apple", role: "Yalnızca o yöntemle girişte kimlik doğrulama", location: "ABD" },
    ],
    checked: "Son kontrol: 16 Kasım 2026",
  },
  en: {
    title: "Trust center",
    lead: "Where your data is stored, who it is shared with, how the AI uses it and how we protect your work: on one page, plainly.",
    pillars: [
      ["Never used for training", "Your work is not used to train AI models."],
      ["Hosted in Europe", "Database, files and the app run on servers in Frankfurt."],
      ["Only you and your invitees", "Every project is isolated at the database level."],
      ["Nothing invented", "The AI never fabricates sources, data or findings."],
    ],
    sections: [
      { id: "egitim", h: "Your work is not used to train AI", p: [
        "AI features run on Anthropic’s Claude models under Anthropic’s commercial terms of service. These terms explicitly prohibit Anthropic from training models on content sent through the service (your text, source passages and the AI’s responses).",
        "Academiana does not train its own AI models either; your text is sent to the model only to perform the task you asked for (writing, reading, reviewing), during that request.",
      ] },
      { id: "konum", h: "Where is your data?", list: [
        "Your account, projects, sources and uploaded files are stored on Supabase infrastructure in the Frankfurt data centre, European Union.",
        "The application runs in Vercel’s Frankfurt region; Vercel’s global content delivery network is also used so pages load quickly.",
        "When you use an AI feature, only the text, project context and selected source/file passages needed for that task are transferred to Anthropic in the USA.",
        "When searching academic databases, only search terms and DOIs are sent to those services; your identity is not.",
      ] },
      { id: "erisim", h: "Who can see your work?", list: [
        "Each user’s data is separated at the database level with row-level security rules (RLS): a project can be seen only by its owner and the co-authors or advisor the owner invited.",
        "Share links are created at your request and can be revoked from your account at any time.",
        "Your password is stored in a non-reversible form; with Google or Apple sign-in only your name and email are received.",
      ] },
      { id: "guvenlik", h: "Application security", list: [
        "All connections are encrypted with mandatory HTTPS (HSTS).",
        "A content security policy (CSP), request origin checks and internal-network protection for outbound requests are in place.",
        "More than 700 automated tests run before every update; isolation of user data is tested on a real database.",
        "Errors, AI response times and the state of connected services are monitored continuously.",
      ] },
      { id: "dogruluk", h: "Accuracy and transparency", list: [
        "The AI cites only real sources added to your project; where there is none, it marks [SOURCE NEEDED].",
        "How much of each source was read (citation only, abstract or full text) is shown plainly.",
        "Mizan compares every cited sentence with the text read from the source and shows its decision with a verbatim quote and page. How it works is explained on the Method and transparency page.",
        "We do not show a plagiarism percentage: without a licensed comparison service any such figure would be misleading.",
      ] },
      { id: "haklar", h: "Your rights over your data", list: [
        "From your account page you can download all your data as a readable report and a machine-readable file.",
        "You can delete your account and all your projects.",
        "Details under GDPR and the Turkish KVKK are in the respective privacy notices.",
      ] },
      { id: "iletisim", h: "Security reports and contact", p: ["If you notice a security vulnerability or have a question about your data, write to iletisim@academiana.com.tr; we review such reports with priority."] },
    ],
    providersTitle: "Service providers",
    providersHead: ["Provider", "Purpose", "Location"],
    providers: [
      { name: "Supabase", role: "Database, authentication, file storage", location: "Frankfurt, EU" },
      { name: "Vercel", role: "Application hosting and content delivery", location: "Frankfurt, EU + global CDN" },
      { name: "Anthropic (Claude)", role: "AI features (only when used)", location: "USA" },
      { name: "Google, Apple", role: "Authentication, only when signing in that way", location: "USA" },
    ],
    checked: "Last reviewed: 16 November 2026",
  },
  de: {
    title: "Vertrauenszentrum",
    lead: "Wo Ihre Daten gespeichert werden, mit wem sie geteilt werden, wie die KI sie nutzt und wie wir Ihre Arbeit schützen: auf einer Seite, klar erklärt.",
    pillars: [
      ["Kein KI-Training", "Ihre Arbeit wird nicht zum Training von KI-Modellen verwendet."],
      ["Hosting in Europa", "Datenbank, Dateien und Anwendung laufen auf Servern in Frankfurt."],
      ["Nur Sie und Ihre Eingeladenen", "Jedes Projekt ist auf Datenbankebene getrennt."],
      ["Nichts erfunden", "Die KI erfindet keine Quellen, Daten oder Befunde."],
    ],
    sections: [
      { id: "egitim", h: "Ihre Arbeit wird nicht zum KI-Training verwendet", p: [
        "Die KI-Funktionen laufen mit den Claude-Modellen von Anthropic unter dessen kommerziellen Nutzungsbedingungen. Diese untersagen Anthropic ausdrücklich, Modelle mit Inhalten zu trainieren, die über den Dienst gesendet werden (Ihr Text, Quellenpassagen und die Antworten der KI).",
        "Auch Academiana trainiert keine eigenen KI-Modelle; Ihr Text wird nur für die gewünschte Aufgabe (Schreiben, Lesen, Prüfen) während dieser Anfrage an das Modell gesendet.",
      ] },
      { id: "konum", h: "Wo liegen Ihre Daten?", list: [
        "Ihr Konto, Ihre Projekte, Quellen und hochgeladenen Dateien werden auf der Infrastruktur von Supabase im Rechenzentrum Frankfurt in der Europäischen Union gespeichert.",
        "Die Anwendung läuft in der Frankfurter Region von Vercel; damit Seiten schnell laden, wird auch das globale Content-Delivery-Netz von Vercel genutzt.",
        "Wenn Sie eine KI-Funktion nutzen, werden nur der dafür nötige Text, der Projektkontext und ausgewählte Quellen-/Dateipassagen an Anthropic in den USA übermittelt.",
        "Bei der Suche in wissenschaftlichen Datenbanken werden nur Suchbegriffe und DOIs an diese Dienste gesendet, nicht Ihre Identität.",
      ] },
      { id: "erisim", h: "Wer kann Ihre Arbeit sehen?", list: [
        "Die Daten jedes Nutzers sind auf Datenbankebene durch zeilenbasierte Zugriffsregeln (RLS) getrennt: Ein Projekt sehen nur der Eigentümer und die von ihm eingeladenen Mitautoren oder Betreuenden.",
        "Freigabelinks werden auf Ihren Wunsch erstellt und können jederzeit in Ihrem Konto widerrufen werden.",
        "Ihr Passwort wird nicht umkehrbar gespeichert; bei der Anmeldung mit Google oder Apple erhalten wir nur Name und E-Mail-Adresse.",
      ] },
      { id: "guvenlik", h: "Anwendungssicherheit", list: [
        "Alle Verbindungen sind mit verpflichtendem HTTPS verschlüsselt (HSTS).",
        "Content-Security-Policy (CSP), Prüfung der Anfrageherkunft und Schutz des internen Netzes bei ausgehenden Anfragen sind aktiv.",
        "Vor jedem Update laufen über 700 automatische Tests; die Trennung der Nutzerdaten wird auf einer echten Datenbank geprüft.",
        "Fehler, Antwortzeiten der KI und der Zustand angebundener Dienste werden fortlaufend überwacht.",
      ] },
      { id: "dogruluk", h: "Genauigkeit und Transparenz", list: [
        "Die KI zitiert nur echte Quellen, die Ihrem Projekt hinzugefügt wurden; fehlt eine, markiert sie [QUELLE ERFORDERLICH].",
        "Wie viel jeder Quelle gelesen wurde (nur bibliografische Angaben, Abstract oder Volltext), wird klar angezeigt.",
        "Mizan vergleicht jeden belegten Satz mit dem gelesenen Quellentext und zeigt seine Entscheidung mit wörtlichem Zitat und Seite. Die Funktionsweise steht auf der Seite Methode und Transparenz.",
        "Wir zeigen keinen Plagiatsprozentsatz: Ohne lizenzierten Vergleichsdienst wäre jede solche Zahl irreführend.",
      ] },
      { id: "haklar", h: "Ihre Rechte an Ihren Daten", list: [
        "Auf Ihrer Kontoseite können Sie alle Ihre Daten als lesbaren Bericht und maschinenlesbare Datei herunterladen.",
        "Sie können Ihr Konto und alle Ihre Projekte löschen.",
        "Einzelheiten nach DSGVO und dem türkischen KVKK stehen in den jeweiligen Datenschutzhinweisen.",
      ] },
      { id: "iletisim", h: "Sicherheitsmeldungen und Kontakt", p: ["Wenn Sie eine Sicherheitslücke bemerken oder eine Frage zu Ihren Daten haben, schreiben Sie an iletisim@academiana.com.tr; solche Meldungen prüfen wir vorrangig."] },
    ],
    providersTitle: "Dienstleister",
    providersHead: ["Anbieter", "Zweck", "Standort"],
    providers: [
      { name: "Supabase", role: "Datenbank, Authentifizierung, Dateispeicher", location: "Frankfurt, EU" },
      { name: "Vercel", role: "Hosting der Anwendung und Content Delivery", location: "Frankfurt, EU + globales CDN" },
      { name: "Anthropic (Claude)", role: "KI-Funktionen (nur bei Nutzung)", location: "USA" },
      { name: "Google, Apple", role: "Authentifizierung, nur bei dieser Anmeldeart", location: "USA" },
    ],
    checked: "Zuletzt geprüft: 16. November 2026",
  },
};
