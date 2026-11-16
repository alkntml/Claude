/**
 * D220: Zenit, Rasat ve Mizan için arama motorlarına yönelik ayrıntılı tanıtım sayfaları (/zenit, /rasat, /mizan).
 * Site menüsünde ve altbilgide bağlantı verilmez (kullanıcı kararı); site haritası, hreflang ve yapılandırılmış veriyle
 * bulunurlar. İçerik yalnızca ürünün gerçekte yaptığını anlatır (uydurma iddia, sayı veya müşteri yok).
 */
export type IntelId = "zenit" | "rasat" | "mizan";
type L = "tr" | "en" | "de";
interface Block { h: string; p?: string; list?: string[] }
export interface IntelPage {
  eyebrow: string; title: string; motto: string; lead: string;
  capabilities: { h: string; p: string }[];
  steps: { h: string; p: string }[];
  sections: Block[];
  faq: { q: string; a: string }[];
  cta: string; sibling: string;
}

export const INTEL_ORDER: IntelId[] = ["zenit", "rasat", "mizan"];

export const INTEL: Record<IntelId, Record<L, IntelPage>> = {
  zenit: {
    tr: {
      eyebrow: "Academiana’nın yazım zekâsı",
      title: "Zenit: tez ve makale yazan yapay zekâ asistanı",
      motto: "Zenit yazar.",
      lead: "Zenit, akademik çalışmanızı bütünüyle bilen bir yazım asistanıdır. Önceki paragraflarınızı, çalışmanın konusunu ve gidişatını, yazdığınız bölümün başlığını ve amacını bilir; tezinizi, makalenizi veya araştırma önerinizi bölüm bölüm sizinle birlikte yazar ve yalnızca gerçek kaynaklarınıza atıf yapar.",
      capabilities: [
        { h: "Bölüm bölüm taslak", p: "Giriş, kuramsal çerçeve, yöntem, bulgular, tartışma ve sonuç gibi bölümleri, çalışma türüne özgü kurallarla ve hedef uzunluğa göre taslak hâline getirir; genişletir, kısaltır, yeniden yazar." },
        { h: "Bağlamı bilen otomatik tamamlama", p: "Siz yazarken paragraf sonunda gri renkte bir cümlelik devam önerir; Tab ile tümünü, Ctrl/⌘+→ ile tek kelimesini kabul edersiniz. Öneri, çalışmanın konusunu ve bölümün amacını gözetir." },
        { h: "Bölümler arası bütünlük", p: "Amaç, hipotezler ve araştırma soruları her bölüme taşınır; konudan sapan ya da bir soruyu cevapsız bırakan bölüm işaretlenir ve tek tıkla bütünle uyumlanır." },
        { h: "Yalnızca gerçek kaynaklara atıf", p: "Kaynaklı yazımda Zenit yalnızca çalışmanıza eklenmiş, künyesi doğrulanmış kaynaklara atıf yapar; kaynak yoksa uydurmaz, [KAYNAK GEREKLİ] diye işaretler." },
      ],
      steps: [
        { h: "Kurguyu kurun", p: "Problem, amaç, araştırma soruları, yöntem ve bölüm planı birlikte hazırlanır." },
        { h: "Bölümü açın", p: "Zenit o bölümün rolünü üstlenir: yöntem bölümünde yöntem danışmanı, literatürde literatür uzmanı gibi yazar." },
        { h: "Birlikte yazın", p: "Taslağı inceleyin, düzenleyin, “şu başlıkları ekle” gibi serbest isteklerde bulunun; her sürüm geçmişte saklanır." },
      ],
      sections: [
        { h: "Hangi çalışmalarda kullanılır?", list: ["Yüksek lisans ve doktora tezi", "Bitirme projesi", "Araştırma makalesi ve derleme", "TÜBİTAK, BAP ve uluslararası araştırma önerileri", "Türkçe, İngilizce ve Almanca yazım"] },
        { h: "Neden genel sohbet botlarından farklı?", p: "Genel sohbet botları çalışmanızın bütününü görmez ve kaynak uydurabilir. Zenit ise çalışmanın kurgusuna, bölüm planına ve kütüphanenizdeki kaynaklara bağlı çalışır; otomatik tamamlama kaynak, sayı veya atıf önermez, kaynaklı yazım yalnızca projedeki gerçek eserlerle yapılır. Metne neyin gireceğine her zaman siz karar verirsiniz." },
      ],
      faq: [
        { q: "Zenit tezimi tamamen kendisi mi yazar?", a: "Hayır. Zenit taslak önerir, genişletir ve düzenler; metne neyin gireceğine siz karar verirsiniz ve her ekleme geri alınabilir. Akademik dürüstlük ilkeleri gereği çalışmanın yazarı sizsiniz." },
        { q: "Zenit kaynak uydurur mu?", a: "Hayır. Zenit yalnızca çalışmanıza eklenmiş, gerçek veri tabanlarından gelen kaynaklara atıf yapar. Uygun kaynak yoksa cümleyi [KAYNAK GEREKLİ] diye işaretler." },
        { q: "Otomatik tamamlama nasıl kapatılır?", a: "Editörün üstündeki “Otomatik tamamlama” anahtarından açıp kapatabilirsiniz; Esc tuşu o anki öneriyi kapatır." },
      ],
      cta: "Zenit ile yazmaya başlayın", sibling: "Diğer zekâlar",
    },
    en: {
      eyebrow: "Academiana’s writing intelligence",
      title: "Zenit: an AI assistant for writing theses and papers",
      motto: "Zenit writes.",
      lead: "Zenit is a writing assistant that knows your academic work as a whole. It knows your previous paragraphs, the topic and direction of your work, and the title and purpose of the section you are writing; it writes your thesis, paper or research proposal with you section by section and cites only your real sources.",
      capabilities: [
        { h: "Section-by-section drafts", p: "Drafts sections such as introduction, theoretical framework, method, results, discussion and conclusion following the rules of your work type and the target length; expands, shortens and rewrites them." },
        { h: "Context-aware autocomplete", p: "As you type, it suggests a one-sentence continuation in grey at the end of the paragraph; accept it all with Tab or one word with Ctrl/⌘+→. Suggestions respect the topic and the section’s purpose." },
        { h: "Coherence across sections", p: "Aim, hypotheses and research questions are carried into every section; a section that drifts or leaves a question unanswered is flagged and aligned in one click." },
        { h: "Cites only real sources", p: "In sourced writing Zenit cites only verified sources added to your project; if there is none, it marks [SOURCE NEEDED] instead of inventing one." },
      ],
      steps: [
        { h: "Build the blueprint", p: "Problem, aim, research questions, method and chapter plan are prepared together." },
        { h: "Open a section", p: "Zenit takes on that section’s role: a method adviser in the method chapter, a literature specialist in the review." },
        { h: "Write together", p: "Review and edit the draft, make free-form requests such as “add these headings”; every version is kept in the history." },
      ],
      sections: [
        { h: "What can it be used for?", list: ["Master’s and doctoral theses", "Final-year projects", "Research articles and reviews", "Grant and research proposals", "Writing in Turkish, English and German"] },
        { h: "How is it different from general chatbots?", p: "General chatbots do not see your whole work and may invent sources. Zenit works from your study blueprint, chapter plan and the sources in your library; autocomplete never suggests sources, figures or citations, and sourced writing uses only real works in the project. You always decide what goes into the text." },
      ],
      faq: [
        { q: "Does Zenit write my thesis for me?", a: "No. Zenit suggests, expands and edits drafts; you decide what goes into the text and every insertion can be undone. Under academic integrity rules you remain the author." },
        { q: "Does Zenit invent sources?", a: "No. Zenit cites only sources added to your project from real databases. If no suitable source exists, it marks the sentence [SOURCE NEEDED]." },
        { q: "How do I turn autocomplete off?", a: "Use the “Autocomplete” switch above the editor; Esc dismisses the current suggestion." },
      ],
      cta: "Start writing with Zenit", sibling: "The other intelligences",
    },
    de: {
      eyebrow: "Die Schreibintelligenz von Academiana",
      title: "Zenit: KI-Assistent für Abschlussarbeiten und Artikel",
      motto: "Zenit schreibt.",
      lead: "Zenit ist ein Schreibassistent, der Ihre wissenschaftliche Arbeit als Ganzes kennt: Ihre vorherigen Absätze, Thema und Richtung der Arbeit sowie Titel und Zweck des Kapitels, an dem Sie schreiben. Zenit schreibt Ihre Abschlussarbeit, Ihren Artikel oder Ihren Forschungsantrag Kapitel für Kapitel mit Ihnen und zitiert nur Ihre echten Quellen.",
      capabilities: [
        { h: "Kapitelweise Entwürfe", p: "Entwirft Kapitel wie Einleitung, theoretischer Rahmen, Methode, Ergebnisse, Diskussion und Fazit nach den Regeln Ihres Arbeitstyps und der Ziellänge; erweitert, kürzt und formuliert um." },
        { h: "Autovervollständigung mit Kontext", p: "Beim Schreiben schlägt Zenit am Absatzende eine Fortsetzung in Grau vor; mit Tab ganz, mit Strg/⌘+→ wortweise übernehmen. Vorschläge berücksichtigen Thema und Kapitelzweck." },
        { h: "Kohärenz zwischen Kapiteln", p: "Ziel, Hypothesen und Forschungsfragen werden in jedes Kapitel getragen; abweichende oder unbeantwortete Stellen werden markiert und mit einem Klick angepasst." },
        { h: "Nur echte Quellen", p: "Beim belegten Schreiben zitiert Zenit nur geprüfte Quellen aus Ihrem Projekt; fehlt eine, markiert es [QUELLE ERFORDERLICH], statt etwas zu erfinden." },
      ],
      steps: [
        { h: "Konzept erstellen", p: "Problem, Ziel, Forschungsfragen, Methode und Kapitelplan entstehen gemeinsam." },
        { h: "Kapitel öffnen", p: "Zenit übernimmt die Rolle des Kapitels: Methodenberatung im Methodenteil, Literaturexperte im Forschungsstand." },
        { h: "Gemeinsam schreiben", p: "Entwurf prüfen und bearbeiten, freie Wünsche äußern; jede Version bleibt im Verlauf erhalten." },
      ],
      sections: [
        { h: "Wofür eignet sich Zenit?", list: ["Master- und Doktorarbeiten", "Abschlussprojekte", "Forschungsartikel und Übersichtsarbeiten", "Förder- und Forschungsanträge", "Schreiben auf Türkisch, Englisch und Deutsch"] },
        { h: "Was unterscheidet Zenit von allgemeinen Chatbots?", p: "Allgemeine Chatbots sehen Ihre Arbeit nicht als Ganzes und können Quellen erfinden. Zenit arbeitet auf Grundlage Ihres Konzepts, Kapitelplans und Ihrer Bibliothek; die Autovervollständigung schlägt keine Quellen, Zahlen oder Belege vor. Sie entscheiden immer, was in den Text kommt." },
      ],
      faq: [
        { q: "Schreibt Zenit meine Arbeit für mich?", a: "Nein. Zenit schlägt Entwürfe vor, erweitert und bearbeitet sie; Sie entscheiden, was in den Text kommt, und jede Einfügung lässt sich rückgängig machen. Sie bleiben Autorin oder Autor." },
        { q: "Erfindet Zenit Quellen?", a: "Nein. Zenit zitiert nur Quellen aus echten Datenbanken, die Ihrem Projekt hinzugefügt wurden; sonst markiert es den Satz mit [QUELLE ERFORDERLICH]." },
        { q: "Wie schalte ich die Autovervollständigung aus?", a: "Über den Schalter „Autovervollständigung“ über dem Editor; Esc verwirft den aktuellen Vorschlag." },
      ],
      cta: "Mit Zenit schreiben", sibling: "Die anderen Intelligenzen",
    },
  },
  rasat: {
    tr: {
      eyebrow: "Academiana’nın kaynak okuma ve analiz zekâsı",
      title: "Rasat: PDF okuyan ve makaleye soru cevaplayan yapay zekâ",
      motto: "Rasat okur.",
      lead: "Rasat, kaynaklarınızın içine bakan yapay zekâdır. Yüklediğiniz PDF’leri ve açık erişimli tam metinleri okur, bölümlerini tanır; makaleye sorduğunuz soruları yalnızca okunan metinden ve sayfa numarasıyla cevaplar, PDF’ten seçtiğiniz metni yayındaki sayfa numarasıyla alıntılar ve birden çok makaleyi birlikte analiz eder.",
      capabilities: [
        { h: "PDF’ten seçerek alıntı", p: "“Oku ve alıntıla” ile PDF aslı gibi açılır; seçtiğiniz metin yayındaki sayfa numarasıyla tırnaklı alıntı, 40 kelimeden uzunsa blok alıntı ya da yalnızca atıf olarak metninize eklenir." },
        { h: "Makaleye soru sorma", p: "Yöntem, örneklem, temel bulgular, sınırlılıklar gibi sorulara cevap yalnızca o makalenin okunan metninden ve sayfa numarasıyla gelir; cevap atıflı olarak metne eklenebilir." },
        { h: "Birden çok makaleyi birlikte analiz", p: "2–8 makale seçip uyuşan ve çelişen bulguları, araştırma boşluklarını tek tabloda görürsünüz; sentez, atıflı akademik paragraf olarak çalışmanıza eklenir." },
        { h: "Literatür matrisi", p: "Her kaynağın amacı, yöntemi, örneklemi ve bulguları tek tabloda özetlenir; tablo belgeye eklenebilir veya Excel için indirilebilir." },
      ],
      steps: [
        { h: "Kaynağı ekleyin", p: "16 akademik veri tabanında arayın, DOI ile ekleyin ya da PDF’inizi yükleyin." },
        { h: "Rasat okusun", p: "Açık erişimli metinler kendiliğinden, yüklediğiniz PDF’ler hemen okunur; her kaynağın ne kadarının okunduğu açıkça yazar." },
        { h: "Sorun, alıntılayın, karşılaştırın", p: "Cevaplar, alıntılar ve sentezler sayfa numaralı atıflarla çalışmanıza girer." },
      ],
      sections: [
        { h: "Erişim şeffaflığı", p: "Her kaynakta “yalnızca künye”, “özet okundu” veya “tam metin okundu” yazar. Rasat yalnızca okunan metne dayanır; tam metni okunmayan bir kaynak hakkında içerik iddiasında bulunmaz ve sayfa numarası uydurmaz. Ücretli bir makalenin PDF’ini yüklediğinizde tam metin okunur." },
        { h: "Kimler için?", list: ["Literatür taraması yapan lisansüstü öğrenciler", "Sistematik derleme hazırlayan araştırmacılar", "Makale yazarken kaynaklarını hızla taramak isteyen akademisyenler"] },
      ],
      faq: [
        { q: "Rasat hangi kaynakları okuyabilir?", a: "Yüklediğiniz PDF’leri ve açık erişimli tam metinleri okur. Yalnızca özeti erişilebilen makalelerde cevaplar özete dayanır ve bu açıkça belirtilir." },
        { q: "Sayfa numarası nasıl belirlenir?", a: "Yayındaki gerçek sayfa numarası kullanılır (PDF’in kaçıncı sayfası değil). Eşleşme güvenilir değilse sayfa boş bırakılır ve size söylenir." },
        { q: "Taranmış PDF’ler okunur mu?", a: "Görüntüden oluşan (taranmış) PDF’lerde seçilebilir metin yoktur; Rasat bunu açıkça bildirir. Metni seçilebilen bir sürüm yüklemeniz gerekir." },
      ],
      cta: "Rasat ile kaynaklarınızı okuyun", sibling: "Diğer zekâlar",
    },
    en: {
      eyebrow: "Academiana’s source reading and analysis intelligence",
      title: "Rasat: AI that reads PDFs and answers questions on papers",
      motto: "Rasat reads.",
      lead: "Rasat is the AI that looks inside your sources. It reads the PDFs you upload and open-access full texts, recognises their sections, answers your questions about a paper only from the text that was read and with page numbers, quotes text you select in a PDF with the published page number and analyses several papers together.",
      capabilities: [
        { h: "Quote by selecting in the PDF", p: "“Read and quote” opens the PDF as the original; the text you select is added with the published page number as a quotation, a block quotation from 40 words, or a citation only." },
        { h: "Ask a paper", p: "Answers to questions on method, sample, key findings or limitations come only from the text read from that paper, with page numbers, and can be inserted with a citation." },
        { h: "Analyse several papers together", p: "Select 2–8 papers to see agreeing and conflicting findings and research gaps in one table; the synthesis is added to your work as a cited academic paragraph." },
        { h: "Literature matrix", p: "Aim, method, sample and findings of each source are summarised in one table that can be added to the document or downloaded for Excel." },
      ],
      steps: [
        { h: "Add the source", p: "Search 16 academic databases, add by DOI or upload your PDF." },
        { h: "Let Rasat read", p: "Open-access texts are read automatically, uploaded PDFs immediately; how much of each source was read is shown plainly." },
        { h: "Ask, quote, compare", p: "Answers, quotations and syntheses enter your work with page-numbered citations." },
      ],
      sections: [
        { h: "Access transparency", p: "Every source shows “citation only”, “abstract read” or “full text read”. Rasat relies only on the text that was read; it makes no content claims about a source whose full text was not read and never invents page numbers. Uploading the PDF of a paywalled paper makes its full text readable." },
        { h: "Who is it for?", list: ["Graduate students doing literature reviews", "Researchers preparing systematic reviews", "Academics who want to scan their sources quickly while writing"] },
      ],
      faq: [
        { q: "Which sources can Rasat read?", a: "The PDFs you upload and open-access full texts. For papers where only the abstract is available, answers rely on the abstract and this is stated clearly." },
        { q: "How is the page number determined?", a: "The real published page number is used, not the PDF page index. If the match is not reliable, the page is left empty and you are told." },
        { q: "Are scanned PDFs read?", a: "Image-only (scanned) PDFs contain no selectable text; Rasat says so clearly. You need to upload a version with selectable text." },
      ],
      cta: "Read your sources with Rasat", sibling: "The other intelligences",
    },
    de: {
      eyebrow: "Die Intelligenz für Quellenlektüre und -analyse von Academiana",
      title: "Rasat: KI, die PDFs liest und Fragen zu Artikeln beantwortet",
      motto: "Rasat liest.",
      lead: "Rasat blickt in Ihre Quellen. Es liest hochgeladene PDFs und Open-Access-Volltexte, erkennt ihre Abschnitte, beantwortet Fragen zu einem Artikel nur aus dem gelesenen Text und mit Seitenzahlen, zitiert markierten PDF-Text mit der veröffentlichten Seitenzahl und analysiert mehrere Artikel gemeinsam.",
      capabilities: [
        { h: "Im PDF markieren und zitieren", p: "„Lesen und zitieren“ öffnet das PDF im Original; markierter Text wird mit der veröffentlichten Seitenzahl als Zitat, ab 40 Wörtern als Blockzitat oder nur als Beleg eingefügt." },
        { h: "Einen Artikel befragen", p: "Antworten zu Methode, Stichprobe, Befunden oder Grenzen stammen nur aus dem gelesenen Text des Artikels, mit Seitenzahlen, und lassen sich mit Beleg einfügen." },
        { h: "Mehrere Artikel gemeinsam analysieren", p: "Wählen Sie 2–8 Artikel und sehen Sie übereinstimmende und widersprüchliche Befunde sowie Forschungslücken in einer Tabelle; die Synthese wird als belegter Absatz eingefügt." },
        { h: "Literaturmatrix", p: "Ziel, Methode, Stichprobe und Befunde jeder Quelle in einer Tabelle, die ins Dokument übernommen oder für Excel heruntergeladen werden kann." },
      ],
      steps: [
        { h: "Quelle hinzufügen", p: "In 16 wissenschaftlichen Datenbanken suchen, per DOI hinzufügen oder PDF hochladen." },
        { h: "Rasat lesen lassen", p: "Open-Access-Texte werden automatisch, hochgeladene PDFs sofort gelesen; wie viel gelesen wurde, wird klar angezeigt." },
        { h: "Fragen, zitieren, vergleichen", p: "Antworten, Zitate und Synthesen gelangen mit Seitenangaben in Ihre Arbeit." },
      ],
      sections: [
        { h: "Transparenz beim Zugriff", p: "Jede Quelle zeigt „nur bibliografische Angaben“, „Abstract gelesen“ oder „Volltext gelesen“. Rasat stützt sich nur auf gelesenen Text, trifft keine Inhaltsaussagen über ungelesene Volltexte und erfindet keine Seitenzahlen. Mit dem hochgeladenen PDF eines kostenpflichtigen Artikels wird der Volltext lesbar." },
        { h: "Für wen?", list: ["Studierende im Master oder in der Promotion bei der Literaturrecherche", "Forschende mit systematischen Übersichtsarbeiten", "Wissenschaftlerinnen und Wissenschaftler, die beim Schreiben Quellen schnell sichten wollen"] },
      ],
      faq: [
        { q: "Welche Quellen kann Rasat lesen?", a: "Hochgeladene PDFs und Open-Access-Volltexte. Ist nur das Abstract verfügbar, stützen sich die Antworten darauf, und das wird klar angegeben." },
        { q: "Wie wird die Seitenzahl bestimmt?", a: "Es wird die tatsächlich veröffentlichte Seite verwendet, nicht die PDF-Seitenzahl. Ist die Zuordnung unsicher, bleibt die Seite leer und Sie werden informiert." },
        { q: "Werden gescannte PDFs gelesen?", a: "Gescannte PDFs (nur Bilder) enthalten keinen markierbaren Text; Rasat weist darauf hin. Laden Sie eine Version mit markierbarem Text hoch." },
      ],
      cta: "Quellen mit Rasat lesen", sibling: "Die anderen Intelligenzen",
    },
  },
  mizan: {
    tr: {
      eyebrow: "Academiana’nın denetim zekâsı",
      title: "Mizan: atıf ve iddia doğrulayan yapay zekâ denetimi",
      motto: "Mizan tartar.",
      lead: "Mizan, yazdığınızı teslimden önce tartan denetim zekâsıdır. Atıflı her cümleyi atıf yapılan kaynağın okunan metniyle karşılaştırır ve kaynağın iddiayı destekleyip desteklemediğini birebir alıntı ve sayfayla gösterir; kaynaksız iddiaları bulur, akademik dili ve tutarlılığı denetler, hakemin takılabileceği noktaları önceden gösterir.",
      capabilities: [
        { h: "İddia denetimi", p: "Atıflı her cümle için karar: destekliyor, kısmen destekliyor, desteklemiyor veya çelişiyor. Karar, kaynakta kelimesi kelimesine geçen en kısa alıntı ve sayfasıyla gösterilir." },
        { h: "Atıf ve kaynak doğrulama", p: "Kaynakçadaki her kayıt gerçek kayıtlarla eşleştirilir; var olmayan kaynak, hatalı DOI ve eksik künye bulunur. Tek bir atfı da “Kaynakta doğrula” ile denetleyebilirsiniz." },
        { h: "Kaynak gerektiren ifadeler", p: "Kaynaksız kalan iddialar ve [KAYNAK GEREKLİ] işaretleri bulunur; kütüphanenizde ve veri tabanlarında uygun kaynak aranır, önce tam metni okunan kaynaklar önerilir." },
        { h: "Kalite raporu ve jüri gözü", p: "Akademik dil, tutarlılık, atıf–kaynakça uyumu ve yapı denetlenir; puan sabit ve herkese açık bir formülle hesaplanır. Yapay zekâ incelemesi çalışmayı bir jüri üyesi gibi okuyarak mantık ve bütünlük sorunlarını bildirir." },
      ],
      steps: [
        { h: "Bölümü yazın", p: "Kendi metninizi yazın ya da Zenit ile birlikte hazırlayın; atıflar canlı atıf olarak eklenir." },
        { h: "Mizan’a tartırın", p: "İddia denetimi bölümü cümlelere ayırır ve her atıflı cümleyi kaynağın okunan metniyle karşılaştırır." },
        { h: "Düzeltin ve teslim edin", p: "Kısmen desteklenen iddiayı düzeltin, kaynaksız cümleye kaynak bulun; kalite raporu ile teslim öncesi eksikleri kapatın." },
      ],
      sections: [
        { h: "Neden önemli?", p: "Bir kaynağın var olması, cümlenizi desteklediği anlamına gelmez. Hakem ve jüriler en çok, kaynağın söylemediği bir şeyi ona dayandırmaya takılır. Mizan bu farkı teslimden önce, kaynağın kendi cümlesiyle gösterir." },
        { h: "Dürüst sınırlar", list: ["Mizan yalnızca okunan metne dayanır; tam metni okunmayan kaynakta bunu açıkça söyler.", "Alıntı, kaynak metninde kelimesi kelimesine geçmiyorsa gösterilmez.", "İntihal yüzdesi vermez: lisanslı bir karşılaştırma servisi olmadan verilecek oran yanıltıcı olur."] },
      ],
      faq: [
        { q: "Mizan intihal denetimi yapar mı?", a: "Hayır, intihal yüzdesi vermez. Mizan’ın işi atıfların doğruluğunu, yani kaynağın cümlenizi gerçekten destekleyip desteklemediğini denetlemektir." },
        { q: "Kaynağın tam metni yoksa ne olur?", a: "Yalnızca özet okunduysa karar özete dayanır ve bu belirtilir; yalnızca künye biliniyorsa içerik denetlenemez ve bu açıkça söylenir. PDF’i yüklediğinizde tam metinle denetlenir." },
        { q: "Kalite puanı nasıl hesaplanır?", a: "Puan 100’den başlar; her bulgu önemine göre sabit bir değer düşürür. Formül ve ağırlıklar Yöntem ve şeffaflık sayfasında herkese açıktır." },
      ],
      cta: "Çalışmanızı Mizan ile denetleyin", sibling: "Diğer zekâlar",
    },
    en: {
      eyebrow: "Academiana’s review intelligence",
      title: "Mizan: AI that verifies citations and checks claims",
      motto: "Mizan weighs.",
      lead: "Mizan is the review intelligence that weighs what you write before you submit. It compares every cited sentence with the text read from the cited source and shows, with a verbatim quote and page, whether the source supports the claim; it finds unsupported claims, checks academic language and consistency and shows in advance where a reviewer might object.",
      capabilities: [
        { h: "Claim audit", p: "A verdict for every cited sentence: supports, partly supports, does not support or contradicts, shown with the shortest quote found verbatim in the source and its page." },
        { h: "Citation and source verification", p: "Every reference is matched against real records; non-existent sources, wrong DOIs and incomplete references are found. Check a single citation with “Verify in source”." },
        { h: "Statements that need a source", p: "Unsupported claims and [SOURCE NEEDED] markers are found; suitable sources are searched in your library and databases, preferring sources whose full text was read." },
        { h: "Quality report through a jury’s eyes", p: "Academic language, consistency, citation–reference agreement and structure are checked; the score uses a fixed, public formula. The AI review reads the work like a jury member and reports logic and coherence issues." },
      ],
      steps: [
        { h: "Write the section", p: "Write your own text or prepare it with Zenit; citations are inserted as live citations." },
        { h: "Let Mizan weigh it", p: "The claim audit splits the section into sentences and compares each cited sentence with the source text." },
        { h: "Fix and submit", p: "Correct partly supported claims, find sources for unsupported ones and close the gaps with the quality report before submission." },
      ],
      sections: [
        { h: "Why it matters", p: "That a source exists does not mean it supports your sentence. Reviewers and examiners object most to attributing to a source something it does not say. Mizan shows this gap before submission, in the source’s own words." },
        { h: "Honest limits", list: ["Mizan relies only on text that was read; for sources without a read full text it says so.", "A quote is shown only if it appears verbatim in the source text.", "No plagiarism percentage: without a licensed comparison service any such figure would be misleading."] },
      ],
      faq: [
        { q: "Does Mizan check for plagiarism?", a: "No, it gives no plagiarism percentage. Mizan checks whether citations are correct, that is, whether the source really supports your sentence." },
        { q: "What if the full text is not available?", a: "If only the abstract was read, the verdict relies on it and this is stated; if only the citation data is known, the content cannot be checked and you are told. Uploading the PDF enables a full-text check." },
        { q: "How is the quality score calculated?", a: "The score starts at 100 and each finding deducts a fixed amount by severity. The formula and weights are public on the Method and transparency page." },
      ],
      cta: "Review your work with Mizan", sibling: "The other intelligences",
    },
    de: {
      eyebrow: "Die Prüfintelligenz von Academiana",
      title: "Mizan: KI, die Belege und Aussagen prüft",
      motto: "Mizan wägt ab.",
      lead: "Mizan wägt vor der Abgabe ab, was Sie geschrieben haben. Es vergleicht jeden belegten Satz mit dem gelesenen Text der zitierten Quelle und zeigt mit wörtlichem Zitat und Seite, ob die Quelle die Aussage stützt; es findet unbelegte Aussagen, prüft wissenschaftliche Sprache und Konsistenz und zeigt vorab, woran Gutachter Anstoß nehmen könnten.",
      capabilities: [
        { h: "Aussagenprüfung", p: "Für jeden belegten Satz ein Urteil: stützt, stützt teilweise, stützt nicht oder widerspricht – mit dem kürzesten wörtlich in der Quelle vorkommenden Zitat und Seite." },
        { h: "Beleg- und Quellenprüfung", p: "Jeder Eintrag wird mit echten Datensätzen abgeglichen; nicht existierende Quellen, falsche DOIs und unvollständige Angaben werden gefunden. Einzelne Belege prüfen Sie mit „In der Quelle prüfen“." },
        { h: "Belegbedürftige Aussagen", p: "Unbelegte Aussagen und [QUELLE ERFORDERLICH]-Markierungen werden gefunden; passende Quellen werden in Bibliothek und Datenbanken gesucht, bevorzugt mit gelesenem Volltext." },
        { h: "Qualitätsbericht aus Sicht der Kommission", p: "Wissenschaftliche Sprache, Konsistenz, Übereinstimmung von Belegen und Literaturverzeichnis sowie Struktur werden geprüft; die Punktzahl folgt einer festen, öffentlichen Formel. Die KI-Prüfung liest die Arbeit wie ein Kommissionsmitglied." },
      ],
      steps: [
        { h: "Kapitel schreiben", p: "Selbst schreiben oder mit Zenit vorbereiten; Belege werden als lebendige Belege eingefügt." },
        { h: "Von Mizan abwägen lassen", p: "Die Aussagenprüfung zerlegt das Kapitel in Sätze und vergleicht jeden belegten Satz mit dem Quellentext." },
        { h: "Korrigieren und abgeben", p: "Teilweise gestützte Aussagen korrigieren, Quellen für unbelegte finden und Lücken mit dem Qualitätsbericht schließen." },
      ],
      sections: [
        { h: "Warum das wichtig ist", p: "Dass eine Quelle existiert, heißt nicht, dass sie Ihren Satz stützt. Gutachter stoßen sich am meisten daran, einer Quelle etwas zuzuschreiben, das sie nicht sagt. Mizan zeigt diese Lücke vor der Abgabe – in den Worten der Quelle." },
        { h: "Ehrliche Grenzen", list: ["Mizan stützt sich nur auf gelesenen Text; bei Quellen ohne gelesenen Volltext sagt es das.", "Ein Zitat wird nur angezeigt, wenn es wörtlich im Quellentext steht.", "Kein Plagiatsprozentsatz: Ohne lizenzierten Vergleichsdienst wäre jede Zahl irreführend."] },
      ],
      faq: [
        { q: "Prüft Mizan auf Plagiate?", a: "Nein, es gibt keinen Plagiatsprozentsatz aus. Mizan prüft, ob Belege korrekt sind – also ob die Quelle Ihren Satz wirklich stützt." },
        { q: "Was, wenn kein Volltext verfügbar ist?", a: "Wurde nur das Abstract gelesen, stützt sich das Urteil darauf und das wird angegeben; sind nur bibliografische Angaben bekannt, kann der Inhalt nicht geprüft werden. Mit hochgeladenem PDF wird am Volltext geprüft." },
        { q: "Wie wird die Qualitätspunktzahl berechnet?", a: "Sie beginnt bei 100; jeder Befund zieht je nach Schwere einen festen Wert ab. Formel und Gewichte stehen öffentlich auf der Seite Methode und Transparenz." },
      ],
      cta: "Arbeit mit Mizan prüfen", sibling: "Die anderen Intelligenzen",
    },
  },
};
