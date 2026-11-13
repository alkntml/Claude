/**
 * Herkese açık sayfaların arama motoru metinleri (TR/EN/DE).
 * Başlıklar ≈ 50–60, açıklamalar ≈ 140–160 karakter; anahtar kelimeler gerçek arama ifadelerine göre seçildi.
 */
export interface PageSeo {
  title: { tr: string; en: string; de: string };
  description: { tr: string; en: string; de: string };
  keywords: { tr: string[]; en: string[]; de: string[] };
  /** OG görselinde başlığın altındaki kısa satır */
  tagline?: { tr: string; en: string; de?: string };
  noindex?: boolean;
}

export const PAGE_SEO: Record<string, PageSeo> = {
  "/araclar": {
    title: { tr: "Ücretsiz Akademik Araçlar: Kaynakça, Atıf, Örneklem | Academiana", en: "Free Academic Tools: References, Citations, Sample Size | Academiana", de: "Kostenlose Tools: Literaturangaben, Zitierstile, Stichprobe | Academiana" },
    description: { tr: "Üyeliksiz ücretsiz araçlar: Araştırmalar ne diyor?, kaynakça oluşturucu, atıf dönüştürücü, örneklem büyüklüğü, Cronbach alfa ve uydurma kaynak kontrolü.", en: "Free tools, no sign-up: What does research say?, reference generator, citation converter, sample size, Cronbach's alpha and fake reference checker.", de: "Kostenlos, ohne Registrierung: Was sagt die Forschung?, Literaturangaben-Generator, Zitierstil-Konverter, Stichprobenrechner, Cronbachs Alpha, Quellenprüfung." },
    keywords: { tr: ["ücretsiz akademik araçlar", "araştırmalar ne diyor", "kaynakça oluşturma", "atıf dönüştürücü", "örneklem hesaplama", "cronbach alfa hesaplama"], en: ["free academic tools", "research consensus tool", "reference generator", "citation converter", "sample size calculator", "cronbach alpha calculator"], de: ["kostenlose wissenschaftliche Tools", "Literaturangaben erstellen", "Zitierstil umwandeln", "Stichprobengröße berechnen", "Cronbachs Alpha Rechner"] },
    tagline: { tr: "Üyelik gerekmez", en: "No sign-up needed", de: "Ohne Registrierung" },
  },
  "/araclar/arastirmalar-ne-diyor": {
    title: { tr: "Araştırmalar Ne Diyor? Kaynaklı Cevap ve Uzlaşı | Academiana", en: "What Does the Research Say? Evidence and Consensus", de: "Was sagt die Forschung? Evidenz und Konsens" },
    description: {
      tr: "Araştırma sorunuza gerçek makalelerin özetlerinden numaralı kaynaklı kısa cevap ve çalışmaların ne kadarının aynı sonuca vardığını gösteren uzlaşı göstergesi.",
      en: "Ask a research question and get a short answer cited from real paper abstracts, with a consensus meter showing how many studies agree.", de: "Stellen Sie eine Forschungsfrage und erhalten Sie eine kurze, belegte Antwort aus echten Abstracts – mit Konsensanzeige, wie viele Studien übereinstimmen.",
    },
    keywords: { tr: ["araştırmalar ne diyor", "bilimsel kanıt", "literatür özeti", "makale bulma yapay zeka", "akademik soru cevap"], en: ["what does the research say", "research consensus", "evidence summary", "AI research assistant", "find academic papers"], de: ["was sagt die forschung", "forschungskonsens", "evidenzzusammenfassung", "KI Rechercheassistent", "wissenschaftliche Artikel finden"] },
    tagline: { tr: "Gerçek makalelerden kaynaklı cevap", en: "Answers cited from real papers", de: "Belegte Antworten aus echten Artikeln" },
  },
  "/araclar/uydurma-kaynak-kontrolu": {
    title: { tr: "Uydurma Kaynak Kontrolü: Kaynakça Gerçek mi? | Academiana", en: "Fake Reference Checker: Are Your Sources Real? | Academiana", de: "Quellen prüfen: Sind Ihre Literaturangaben echt? | Academiana" },
    description: { tr: "Kaynakçanızı yapıştırın; her kaynak Crossref, DataCite ve OpenAlex’te aranır. ChatGPT’nin uydurduğu kaynakları ve yanlış DOI’leri ücretsiz bulun.", en: "Paste your reference list; each source is checked in Crossref, DataCite and OpenAlex. Find fabricated references and wrong DOIs for free.", de: "Literaturverzeichnis einfügen: Jede Quelle wird in Crossref, DataCite und OpenAlex geprüft. Erfundene Literaturangaben und falsche DOIs kostenlos finden." },
    keywords: { tr: ["uydurma kaynak kontrolü", "kaynak doğrulama", "chatgpt uydurma kaynak", "doi kontrol", "kaynakça kontrol"], en: ["fake reference checker", "verify references", "chatgpt fake citations", "doi checker", "reference list checker"], de: ["erfundene Quellen prüfen", "Literaturangaben überprüfen", "ChatGPT erfundene Quellen", "DOI prüfen", "Literaturverzeichnis prüfen"] },
    tagline: { tr: "Kaynaklarınız gerçek mi?", en: "Are your sources real?", de: "Sind Ihre Quellen echt?" },
  },
  "/araclar/kaynakca-olusturucu": {
    title: { tr: "Ücretsiz Kaynakça Oluşturucu: APA 7, ISNAD, MLA | Academiana", en: "Free Reference Generator: APA 7, ISNAD, MLA | Academiana", de: "Literaturangaben-Generator: APA 7, ISNAD, MLA | Academiana" },
    description: { tr: "DOI veya başlıkla APA 7, ISNAD 2, MLA, Chicago, Harvard, IEEE ve Vancouver kaynakça oluşturun. Künyeler resmî kayıtlardan alınır, üyelik gerekmez.", en: "Create references in APA 7, ISNAD 2, MLA, Chicago, Harvard, IEEE and Vancouver from a DOI or title. Metadata from official registries, no sign-up.", de: "Literaturangaben in APA 7, ISNAD 2, MLA, Chicago, Harvard, IEEE und Vancouver aus DOI oder Titel erstellen. Daten aus offiziellen Registern, ohne Anmeldung." },
    keywords: { tr: ["kaynakça oluşturma", "apa kaynakça oluşturucu", "isnad kaynakça", "doi ile kaynakça", "kaynak gösterme"], en: ["reference generator", "apa citation generator", "isnad citation", "doi to citation", "bibliography maker"], de: ["Literaturangabe erstellen", "APA Zitiergenerator", "DOI in Literaturangabe", "Literaturverzeichnis Generator", "Quellenangabe Generator"] },
    tagline: { tr: "DOI’den kaynakçaya", en: "From DOI to reference", de: "Von der DOI zur Literaturangabe" },
  },
  "/araclar/atif-donusturucu": {
    title: { tr: "Atıf Stili Dönüştürücü: APA, ISNAD, MLA Arası | Academiana", en: "Citation Style Converter: APA, ISNAD, MLA | Academiana", de: "Zitierstil-Konverter: APA, ISNAD, MLA | Academiana" },
    description: { tr: "Kaynakçanızı tek tıkla başka stile çevirin: APA’dan ISNAD’a, MLA’dan APA’ya. BibTeX ve RIS desteklenir; eksik bilgiler resmî kayıttan tamamlanır.", en: "Convert your reference list to another style in one click: APA to ISNAD, MLA to APA. BibTeX and RIS supported; missing data completed from registries.", de: "Literaturverzeichnis mit einem Klick in einen anderen Stil umwandeln: APA in ISNAD, MLA in APA. BibTeX und RIS werden unterstützt, Lücken aus Registern ergänzt." },
    keywords: { tr: ["atıf stili dönüştürme", "apa isnad dönüştürme", "kaynakça dönüştürücü", "bibtex apa"], en: ["citation style converter", "apa to mla", "convert references", "bibtex to apa"], de: ["Zitierstil umwandeln", "APA in MLA", "Literaturangaben konvertieren", "BibTeX in APA"] },
    tagline: { tr: "Bir stilden ötekine", en: "From one style to another", de: "Von einem Stil in den anderen" },
  },
  "/araclar/orneklem-hesaplayici": {
    title: { tr: "Örneklem Büyüklüğü Hesaplama (Cochran, Yamane) | Academiana", en: "Sample Size Calculator (Cochran, Yamane) | Academiana", de: "Stichprobenrechner (Cochran, Yamane) | Academiana" },
    description: { tr: "Evren, güven düzeyi ve hata payına göre örneklem büyüklüğünü hesaplayın. Cochran, Yamane ve ortalama formülleri; yöntem bölümü için hazır cümle.", en: "Free sample size calculator: Cochran, Yamane and mean formulas from population, confidence level and margin of error, with a methods sentence.", de: "Kostenloser Stichprobenrechner: Formeln nach Cochran, Yamane und für Mittelwerte aus Grundgesamtheit, Konfidenz und Fehlermarge – mit Satz für den Methodenteil." },
    keywords: { tr: ["örneklem hesaplama", "örneklem büyüklüğü", "yamane formülü", "cochran formülü", "anket örneklem sayısı"], en: ["sample size calculator", "cochran formula", "yamane formula", "survey sample size"], de: ["Stichprobengröße berechnen", "Cochran Formel", "Yamane Formel", "Stichprobenumfang Umfrage"] },
    tagline: { tr: "Kaç kişiye ulaşmalı?", en: "How many respondents?", de: "Wie viele Befragte brauchen Sie?" },
  },
  "/araclar/cronbach-alfa": {
    title: { tr: "Cronbach Alfa Hesaplama: Ücretsiz Güvenirlik Analizi | Academiana", en: "Cronbach's Alpha Calculator: Free Reliability Analysis | Academiana", de: "Cronbachs Alpha berechnen: kostenlose Reliabilitätsanalyse | Academiana" },
    description: { tr: "Ölçek verilerinizi yapıştırın; Cronbach alfa, madde-toplam korelasyonu ve madde silinirse alfa anında hesaplansın. Veriler tarayıcınızdan çıkmaz.", en: "Paste your scale data; Cronbach's alpha, item-total correlations and alpha if item deleted are calculated instantly. Your data never leaves your browser.", de: "Skalendaten einfügen: Cronbachs Alpha, Item-Total-Korrelationen und Alpha bei Weglassen des Items sofort berechnet. Ihre Daten verlassen den Browser nie." },
    keywords: { tr: ["cronbach alfa hesaplama", "güvenirlik analizi", "iç tutarlılık", "madde toplam korelasyonu"], en: ["cronbach alpha calculator", "reliability analysis", "internal consistency", "item total correlation"], de: ["Cronbachs Alpha berechnen", "Reliabilitätsanalyse", "interne Konsistenz", "Item-Total-Korrelation"] },
    tagline: { tr: "Ölçeğiniz güvenilir mi?", en: "Is your scale reliable?", de: "Ist Ihre Skala reliabel?" },
  },
  "/araclar/anket-olusturucu": {
    title: { tr: "Ücretsiz Anket Oluşturucu: Likert, Çoktan Seçmeli | Academiana", en: "Free Survey Builder: Likert, Multiple Choice | Academiana", de: "Kostenloser Umfrage-Builder: Likert, Mehrfachauswahl | Academiana" },
    description: { tr: "Ücretsiz anket oluşturucu: Likert, çoktan seçmeli ve açık uçlu sorular, hızlı kontrol ve yazdırma; çevrim içi yayınlayıp cevap toplayın.", en: "Build your academic survey: Likert, multiple choice and open questions, quick check and printing. Publish online and collect responses with a free account.", de: "Erstellen Sie Ihre wissenschaftliche Umfrage: Likert-, Auswahl- und offene Fragen, Schnellprüfung und Druck. Mit kostenlosem Konto online Antworten sammeln." },
    keywords: { tr: ["anket oluşturma", "likert anket hazırlama", "ücretsiz anket", "akademik anket"], en: ["survey builder", "likert survey", "free survey maker", "academic survey"], de: ["Umfrage erstellen", "Likert Fragebogen", "kostenloser Umfrage-Builder", "wissenschaftliche Umfrage"] },
    tagline: { tr: "Anketinizi hazırlayın", en: "Build your survey", de: "Erstellen Sie Ihre Umfrage" },
  },
  "/": {
    title: {
      tr: "Academiana | Eksiksiz Akademik Araştırma Çalışma Alanı",
      en: "Academiana | The Complete Academic Research Workspace", de: "Academiana | Der komplette Arbeitsbereich für Forschung",
    },
    description: {
      tr: "Yapay zekâ destekli eksiksiz akademik çalışma alanı: konu seçiminden kaynak taramasına, yazımdan atıf denetimine kadar tüm süreci tek yerden yönetin.",
      en: "An AI-assisted, complete academic workspace: manage the whole process in one place, from topic and source search to writing and citation checking.", de: "KI-gestützter, vollständiger Forschungsarbeitsbereich: der ganze Prozess an einem Ort, von Thema und Quellensuche bis zu Schreiben und Zitatprüfung.",
    },
    keywords: {
      tr: ["tez yazma", "yapay zeka tez yazma", "akademik yazım asistanı", "makale yazma", "literatür taraması", "APA 7 kaynak gösterme", "kaynakça oluşturma", "TÜBİTAK 2209-A", "tez önerisi", "istatistik analizi", "anket hazırlama", "akademik İngilizce çeviri", "ortak yazarla tez yazma", "iddia denetimi", "PRISMA sistematik derleme", "Academiana"],
      en: ["AI thesis writer", "academic writing assistant", "AI research paper writer", "literature review tool", "APA 7 citation generator", "reference generator", "thesis help", "dissertation writing tool", "statistics for thesis", "survey builder for research", "academic translation Turkish English", "collaborative thesis writing", "Academiana"], de: ["Abschlussarbeit schreiben KI", "wissenschaftliches Schreiben", "KI Schreibassistent", "Literaturrecherche Tool", "APA 7 zitieren", "Literaturverzeichnis erstellen", "Masterarbeit schreiben", "Bachelorarbeit Hilfe", "Statistik Abschlussarbeit", "Umfrage erstellen", "Academiana"],
    },
    tagline: { tr: "Gerçek kaynaklarla yapay zekâ destekli akademik yazım", en: "AI academic writing with real, verified sources", de: "KI-gestütztes wissenschaftliches Schreiben mit echten, verifizierten Quellen" },
  },
  "/fiyatlar": {
    title: { tr: "Fiyatlar ve Paketler — Ücretsiz Başlayın | Academiana", en: "Pricing & Plans — Start Free | Academiana", de: "Preise und Tarife — kostenlos starten | Academiana" },
    description: {
      tr: "Academiana paketleri: ücretsiz başlangıç, %20 akademik ekip indirimi ve kurum lisansı. Paketlerin özelliklerini ve araçlarını karşılaştırın.",
      en: "Academiana plans: free tier, 20% academic team discount and institutional licences. Compare plan features and tools.", de: "Academiana-Tarife: kostenloser Einstieg, 20 % Rabatt für akademische Teams und Institutionslizenzen. Vergleichen Sie Funktionen und Werkzeuge der Tarife.",
    },
    keywords: { tr: ["tez yazma programı fiyat", "akademik yazım aracı ücretsiz", "akademisyen indirimi", "Academiana fiyat"], en: ["academic writing tool pricing", "AI thesis writer free", "academic team discount", "Academiana pricing"], de: ["Preise wissenschaftliches Schreibtool", "KI Abschlussarbeit kostenlos", "Rabatt akademische Teams", "Academiana Preise"] },
    tagline: { tr: "Ücretsiz başlayın, ihtiyacınız kadar yükseltin", en: "Start free, upgrade when you need", de: "Kostenlos starten, bei Bedarf upgraden" },
  },
  "/ornekler": {
    title: { tr: "Örnek Çıktılar — Tez, Kaynakça, İstatistik ve Daha Fazlası | Academiana", en: "Sample Outputs — Thesis, References, Statistics and More | Academiana", de: "Beispielergebnisse — Abschlussarbeit, Literatur, Statistik | Academiana" },
    description: {
      tr: "Academiana örnek çıktıları: çalışma kurgusu, doğrulanmış kaynaklar, atıflı bölüm, 10 atıf stili, APA tabloları, grafik, anket ve Word çıktısı.",
      en: "Academiana sample outputs: study blueprint, verified sources, cited drafts, 10 citation styles, APA tables, charts, surveys and Word export.", de: "Beispiele aus Academiana: Studienkonzept, verifizierte Quellen, belegte Entwürfe, 10 Zitierstile, APA-Tabellen, Diagramme, Umfragen und Word-Export.",
    },
    keywords: { tr: ["tez örneği", "APA tablo örneği", "kaynakça örneği", "akademik yazım örneği", "Academiana örnek"], en: ["thesis example", "APA table example", "reference list example", "academic writing sample", "Academiana sample"], de: ["Abschlussarbeit Beispiel", "APA Tabelle Beispiel", "Literaturverzeichnis Beispiel", "wissenschaftliches Schreiben Beispiel", "Academiana Beispiel"] },
    tagline: { tr: "Ne elde edeceğinizi görün", en: "See what you get" },
  },
  "/sss": {
    title: { tr: "Sık Sorulan Sorular — Kaynaklar, Gizlilik, İntihal | Academiana", en: "FAQ — Sources, Privacy, Plagiarism & AI Detection | Academiana", de: "FAQ — Quellen, Datenschutz, Plagiat und KI-Erkennung | Academiana" },
    description: {
      tr: "Yapay zekâ kaynak uydurur mu? Çalışmamı kim görebilir? İntihal ve özgünlük, ödeme ve iptal hakkında merak ettiğiniz her şeyin açık cevapları.",
      en: "Does the AI make up sources? Who can see my work? Clear answers about plagiarism, originality, privacy, payment and cancellation.", de: "Erfindet die KI Quellen? Wer sieht meine Arbeit? Klare Antworten zu Plagiat, Originalität, Datenschutz, Zahlung und Kündigung.",
    },
    keywords: { tr: ["yapay zeka kaynak uydurur mu", "intihal oranı", "Academiana SSS"], en: ["does AI make up sources", "plagiarism checker thesis", "Academiana FAQ"], de: ["erfindet KI Quellen", "Plagiatsprüfung Abschlussarbeit", "Academiana FAQ"] },
    tagline: { tr: "Merak edilenlere açık ve dürüst cevaplar", en: "Clear, honest answers" },
  },
  "/kurumlar": {
    title: { tr: "Üniversiteler ve Enstitüler İçin Kurum Lisansı | Academiana", en: "Institutional Licence for Universities | Academiana", de: "Institutionslizenz für Hochschulen | Academiana" },
    description: {
      tr: "Üniversiteniz, enstitünüz veya bölümünüz için toplu Academiana lisansı: öğrenciler kurum koduyla katılır, yönetici yalnızca kullanım sayılarını görür.",
      en: "Bulk Academiana licences for universities, graduate schools and departments. Students join with an institution code; admins only see usage counts.", de: "Academiana-Lizenzen für Hochschulen, Graduiertenschulen und Fachbereiche. Studierende treten mit einem Code bei; Admins sehen nur Nutzungszahlen.",
    },
    keywords: { tr: ["üniversite yapay zeka lisansı", "enstitü tez yazım aracı", "kurumsal akademik yazılım"], en: ["university AI writing licence", "institutional academic writing software", "graduate school thesis tool"], de: ["Hochschullizenz KI Schreiben", "institutionelle Schreibsoftware", "Software für Abschlussarbeiten Hochschule"] },
    tagline: { tr: "Kurumunuz için toplu lisans", en: "Licences for your institution" },
  },

  "/yardim": {
    title: { tr: "Yardım Merkezi — Kullanım Rehberleri | Academiana", en: "Help Center — How-to Guides | Academiana", de: "Benutzerhandbuch — Anleitungen Schritt für Schritt | Academiana" },
    description: {
      tr: "Academiana’yı en verimli şekilde kullanmak için adım adım rehberler: çalışma oluşturma, kaynak arama, atıf, dışa aktarma ve danışmanla paylaşım.",
      en: "Step-by-step guides to get the most out of Academiana: creating projects, finding sources, citations, exporting and sharing with your advisor.", de: "Schritt-für-Schritt-Anleitungen für Academiana: Projekte anlegen, Quellen finden, zitieren, exportieren und mit der Betreuung teilen.",
    },
    keywords: { tr: ["Academiana nasıl kullanılır", "yardım"], en: ["how to use Academiana", "help"], de: ["Academiana Anleitung", "Hilfe"] },
  },
  "/kvkk": {
    title: { tr: "KVKK Aydınlatma Metni | Academiana", en: "KVKK Privacy Notice | Academiana", de: "Datenschutzinformation nach KVKK | Academiana" },
    description: {
      tr: "Academiana’da hangi kişisel verilerin hangi amaçlarla işlendiği, ne kadar saklandığı, kimlere aktarıldığı ve KVKK kapsamındaki haklarınızı nasıl kullanacağınız.",
      en: "Which personal data Academiana processes and why, how long it is kept, who receives it and how to exercise your rights under Türkiye’s KVKK.", de: "Welche personenbezogenen Daten Academiana zu welchen Zwecken verarbeitet, wie lange sie gespeichert werden, wer sie erhält und Ihre Rechte nach dem KVKK.",
    },
    keywords: { tr: ["KVKK aydınlatma metni", "kişisel verilerin korunması", "gizlilik politikası"], en: ["KVKK privacy notice", "personal data protection", "privacy policy"], de: ["KVKK Datenschutzinformation", "Datenschutzerklärung", "personenbezogene Daten"] },
  },
  "/adil-kullanim": {
    title: { tr: "Adil Kullanım Politikası | Academiana", en: "Fair Use Policy | Academiana", de: "Richtlinie zur fairen Nutzung | Academiana" },
    description: {
      tr: "“Sınırsız” ne demek? Sınırsız Proje paketinin kuralları, kötüye kullanım sinyalleri, insan incelemesi, itiraz ve davet programına dair adil kullanım ilkeleri.",
      en: "What “unlimited” means: Unlimited Project plan rules, abuse signals, human review, objections and the referral programme under our fair use principles.", de: "Was „unbegrenzt“ bedeutet: Regeln des Tarifs „Sınırsız Proje“, Missbrauchssignale, menschliche Prüfung, Einspruch und Einladungsprogramm.",
    },
    keywords: { tr: ["adil kullanım politikası", "sınırsız kullanım", "Sınırsız Proje paketi"], en: ["fair use policy", "unlimited plan fair use"], de: ["Fair-Use-Richtlinie", "faire Nutzung"] },
  },
  "/cerez-politikasi": {
    title: { tr: "Çerez ve Cihaz Tanımlayıcıları Politikası | Academiana", en: "Cookie and Device Identifier Policy | Academiana", de: "Cookies und Gerätekennungen | Academiana" },
    description: {
      tr: "Academiana hangi çerezleri ve tarayıcı belleğini kullanır: oturum çerezleri, cihaz kimliği, dil tercihi, yerel tercihler. Analitik veya reklam çerezi yoktur.",
      en: "Which cookies and browser storage Academiana uses: session cookies, device identifier, language preference and local settings. No analytics or ad cookies.", de: "Welche Cookies und welchen Browserspeicher Academiana nutzt: Sitzungscookies, Gerätekennung, Sprache und lokale Einstellungen. Keine Analyse- oder Werbecookies.",
    },
    keywords: { tr: ["çerez politikası", "çerezler", "cihaz tanımlayıcısı"], en: ["cookie policy", "cookies", "device identifier"], de: ["Cookie-Richtlinie", "Cookies", "Gerätekennung"] },
  },
  "/mesafeli-sozlesmeler": {
    title: { tr: "Mesafeli Sözleşmeler ve Ön Bilgilendirme | Academiana", en: "Distance Contracts and Pre-Contractual Information", de: "Fernabsatz und vorvertragliche Informationen" },
    description: {
      tr: "Academiana paketlerinin satış akışı, paket türleri, fiyat ve ödeme bilgisi, yenileme, hizmetin başlaması, cayma hakkı, iade ve siparişe özel teyit esasları.",
      en: "How Academiana plans are sold: plan types, price and payment information, renewal, start of service, right of withdrawal, refunds and order confirmation.", de: "Wie Academiana-Tarife verkauft werden: Tarifarten, Preis und Zahlung, Verlängerung, Leistungsbeginn, Widerrufsrecht, Rückerstattung und Bestellbestätigung.",
    },
    keywords: { tr: ["mesafeli satış sözleşmesi", "ön bilgilendirme formu", "cayma hakkı"], en: ["distance contract", "pre-contractual information", "right of withdrawal"], de: ["Fernabsatzvertrag", "vorvertragliche Informationen", "Widerrufsrecht"] },
  },
  "/gdpr": {
    title: { tr: "GDPR / Veri Koruma Bildirimi | Academiana", en: "GDPR / Data Protection Notice | Academiana", de: "DSGVO / Datenschutzhinweis | Academiana" },
    description: {
      tr: "GDPR kapsamında Academiana’nın işlediği veri kategorileri, hukuki dayanaklar, saklama, uluslararası aktarımlar, güvenlik ve ilgili kişi hakları.",
      en: "Under the GDPR: the data categories Academiana processes, legal bases, retention, international transfers, security and data subject rights.", de: "Nach der DSGVO: von Academiana verarbeitete Datenkategorien, Rechtsgrundlagen, Speicherdauer, internationale Übermittlungen, Sicherheit und Ihre Rechte.",
    },
    keywords: { tr: ["GDPR", "veri koruma bildirimi"], en: ["GDPR notice", "data protection notice", "privacy notice"], de: ["DSGVO", "Datenschutzhinweis"] },
  },

  "/kosullar": {
    title: { tr: "Kullanım Koşulları | Academiana", en: "Terms of Use | Academiana", de: "Nutzungsbedingungen | Academiana" },
    description: {
      tr: "Academiana kullanım koşulları: hizmetin niteliği, hesap güvenliği, paketler ve kullanım hakları, kullanıcı içerikleri, yapay zekâ çıktıları ve sorumluluk.",
      en: "Academiana terms of use: nature of the service, account security, plans and usage rights, user content, AI outputs and liability.", de: "Nutzungsbedingungen von Academiana: Art der Leistung, Kontosicherheit, Tarife und Nutzungsrechte, Nutzerinhalte, KI-Ausgaben und Haftung.",
    },
    keywords: { tr: ["kullanım koşulları", "üyelik sözleşmesi"], en: ["terms of use", "terms of service"], de: ["Nutzungsbedingungen", "AGB"] },
  },

  "/yontem": {
    title: { tr: "Yöntem ve Şeffaflık: Kaynak ve İddia Doğrulama | Academiana", en: "Method and Transparency: Source and Claim Checks", de: "Methode und Transparenz: Quellen- und Aussagenprüfung" },
    description: {
      tr: "Kaynaklar nereden gelir, nasıl doğrulanır, atıflı her cümle kaynağında desteklenir mi, kalite puanı nasıl hesaplanır ve sistemin sınırlamaları nelerdir?",
      en: "Where sources come from, how they are verified, how each cited sentence is checked against its source, how the quality score works and its limits.", de: "Woher Quellen stammen, wie sie verifiziert werden, wie jeder zitierte Satz an seiner Quelle geprüft wird und wie der Qualitätswert funktioniert.",
    },
    keywords: { tr: ["kaynak doğrulama", "atıf doğrulama", "iddia denetimi", "yapay zeka akademik güvenilirlik", "uydurma kaynak"], en: ["citation verification", "claim checking", "source verification AI", "academic AI transparency", "hallucinated references"], de: ["Zitate verifizieren", "Aussagen prüfen", "Quellenverifizierung KI", "Transparenz KI Wissenschaft", "halluzinierte Quellen"] },
    tagline: { tr: "Kaynak ve iddia nasıl doğrulanır?", en: "How sources and claims are checked" },
  },
  "/hakkimizda": {
    title: { tr: "Hakkımızda — Misyonumuz ve Vizyonumuz | Academiana", en: "About Academiana — Our Mission and Vision", de: "Über Academiana — unsere Mission und Vision" },
    description: {
      tr: "Academiana’nın hikâyesi: yapay zekâya eğitimde doğru bir rol kazandırmak, araştırmacılara zaman kazandırmak. Misyonumuz, vizyonumuz ve kurucumuz.",
      en: "Academiana’s story: giving AI a proper role in education and saving researchers time. Our mission, vision, values and founder.", de: "Die Geschichte von Academiana: der KI einen angemessenen Platz in der Bildung geben und Forschenden Zeit sparen. Mission, Vision, Werte und Gründer.",
    },
    keywords: { tr: ["Academiana hakkında", "Academiana kurucusu", "akademik yazım platformu misyon"], en: ["about Academiana", "Academiana founder", "academic writing platform mission"], de: ["über Academiana", "Academiana Gründer", "Mission wissenschaftliche Schreibplattform"] },
    tagline: { tr: "Misyonumuz ve vizyonumuz", en: "Our mission and vision" },
  },
  "/akademik-durustluk": {
    title: { tr: "Akademik Dürüstlük ve Sorumlu Yapay Zekâ Kullanımı | Academiana", en: "Academic Integrity and Responsible AI Use | Academiana", de: "Wissenschaftliche Integrität und verantwortungsvolle KI" },
    description: {
      tr: "Kaynakların bulunması ve doğrulanması, erişim seviyesi, iddia denetimi, veri bütünlüğü, intihal ve yapay zekâ kullanımının beyanı: sorumlu kullanım ilkeleri.",
      en: "Finding and verifying sources, access levels, claim checking, data integrity, plagiarism and declaring AI use: our principles for responsible use.", de: "Quellen finden und verifizieren, Zugriffsstufen, Aussagenprüfung, Datenintegrität, Plagiat und Angabe der KI-Nutzung: Grundsätze verantwortungsvoller Nutzung.",
    },
    keywords: { tr: ["yapay zeka akademik etik", "akademik dürüstlük", "yapay zeka ile tez yazmak etik mi"], en: ["AI academic integrity", "responsible AI in research", "is using AI for thesis ethical"], de: ["KI wissenschaftliche Integrität", "verantwortungsvolle KI Forschung", "ist KI für Abschlussarbeit erlaubt"] },
  },

  "/blog": {
    title: { tr: "Blog — Tez, Makale ve Akademik Yazım Rehberleri | Academiana", en: "Blog — Thesis, Research Paper & Academic Writing Guides | Academiana", de: "Blog — Leitfäden für Abschlussarbeit und wissenschaftliches Schreiben | Academiana" },
    description: {
      tr: "Tez nasıl yazılır, APA 7 atıf kuralları, literatür taraması, intihalden kaçınma, istatistik analiz seçimi, TÜBİTAK başvurusu ve daha fazlası.",
      en: "How to write a thesis, APA 7 citation rules, literature reviews, avoiding plagiarism, choosing a statistical test, research proposals and more.", de: "Wie man eine Abschlussarbeit schreibt, Zitierregeln nach APA 7, Literaturrecherche, Plagiate vermeiden, statistische Tests wählen, Exposés und mehr.",
    },
    keywords: { tr: ["tez nasıl yazılır", "akademik yazım rehberi", "APA 7", "literatür taraması nasıl yapılır"], en: ["how to write a thesis", "academic writing guide", "APA 7 guide", "how to write a literature review"], de: ["Abschlussarbeit schreiben", "Leitfaden wissenschaftliches Schreiben", "APA 7 Leitfaden", "Literaturübersicht schreiben"] },
    tagline: { tr: "Akademik yazım rehberleri", en: "Academic writing guides" },
  },
  "/kayit": {
    title: { tr: "Ücretsiz Kayıt Ol — Tezine Bugün Başla | Academiana", en: "Sign Up Free — Start Your Thesis Today | Academiana", de: "Kostenlos registrieren — heute mit der Abschlussarbeit beginnen | Academiana" },
    description: {
      tr: "Kredi kartı gerekmeden ücretsiz hesap açın; tez, makale veya araştırma önerinizi gerçek kaynaklarla adım adım yazmaya başlayın.",
      en: "Create a free account — no credit card needed — and start writing your thesis, paper or research proposal step by step with real sources.", de: "Kostenloses Konto ohne Kreditkarte anlegen und Abschlussarbeit, Artikel oder Exposé Schritt für Schritt mit echten Quellen schreiben.",
    },
    keywords: { tr: ["Academiana kayıt", "ücretsiz tez yazma aracı"], en: ["Academiana sign up", "free thesis writing tool"], de: ["Academiana registrieren", "kostenloses Tool Abschlussarbeit"] },
  },
  "/giris": {
    title: { tr: "Giriş Yap | Academiana", en: "Sign In | Academiana", de: "Anmelden | Academiana" },
    description: { tr: "Academiana hesabınıza giriş yapın.", en: "Sign in to your Academiana account.", de: "Melden Sie sich bei Ihrem Academiana-Konto an." },
    keywords: { tr: [], en: [], de: [] },
    noindex: true,
  },
};
