/**
 * Sık sorulan sorular (TR/EN). Cevaplar platformun gerçek davranışını anlatır; özellik değişince burası da güncellenmelidir.
 * Kısa biçimlendirme: **kalın**, satır sonu ile paragraf.
 */
import type { Locale } from "@/i18n/core";
import { FAQ_DE, FAQ_GROUP_DE } from "@/lib/faq-de";

export type L2 = { tr: string; en: string };
export interface FaqItem { id: string; q: L2; a: L2 }
export interface FaqGroup { id: string; title: L2; items: FaqItem[] }

export const FAQ: FaqGroup[] = [
  {
    id: "genel",
    title: { tr: "Genel", en: "General" },
    items: [
      {
        id: "nedir",
        q: { tr: "Academiana nedir?", en: "What is Academiana?" },
        a: {
          tr: "Tez, makale, literatür taraması ve araştırma önerisi hazırlayanlar için bir çalışma alanıdır. Çalışma türünüze göre bölüm bölüm yol haritası çıkarır; gerçek akademik veri tabanlarından kaynak bulur ve doğrular; atıfları seçtiğiniz stilde otomatik biçimlendirir; yazarken yanınızda bir akademik asistan bulunur. Sonunda çalışmanızı Word veya PDF olarak, kapak ve içindekilerle indirirsiniz.",
          en: "It is a workspace for people preparing a thesis, article, literature review or research proposal. It builds a section-by-section roadmap for your work type, finds and verifies sources in real academic databases, formats citations automatically in the style you choose, and gives you an academic assistant while you write. At the end you download your work as Word or PDF with a cover page and table of contents.",
        },
      },
      {
        id: "kimler",
        q: { tr: "Kimler için uygun?", en: "Who is it for?" },
        a: {
          tr: "Lisans bitirme projesi ve ödev yazan öğrenciler, yüksek lisans ve doktora öğrencileri, dergiye makale hazırlayan araştırmacılar ve akademisyenler için. Türkçe, İngilizce ve Almanca çalışmaları destekler; Türk üniversitelerinin tez düzenine ve YÖK tez künyesine özel ayarları vardır.",
          en: "Undergraduate students writing capstone projects, master’s and doctoral students, and researchers or academics preparing journal articles. It supports work in Turkish, English and German and has settings specific to Turkish university thesis formats.",
        },
      },
      {
        id: "tamamen-yazar-mi",
        q: { tr: "Tezimi veya makalemi tamamen yapay zekâ mı yazacak?", en: "Will the AI write my whole thesis or article?" },
        a: {
          tr: "Hayır, ve bu bilinçli bir tercih. Asistan bölüm taslakları önerir, kaynak bulur, dilinizi düzeltir; ama metne neyin gireceğine **siz** karar verirsiniz: her taslak “Belgeye ekle” demeden metninize girmez ve her eklemeden önceki hâl sürüm geçmişinde saklanır.\nÇalışmanın yazarı sizsiniz. Taslakları okuyup kendi düşüncenizle geliştirmeniz hem akademik dürüstlük hem de savunmada sorulara cevap verebilmeniz için gereklidir.",
          en: "No, and that is deliberate. The assistant suggests section drafts, finds sources and improves your language, but **you** decide what goes into the text: no draft enters your document until you click “Add to document”, and the previous state is saved in the version history each time.\nYou are the author. Reading the drafts and developing them with your own thinking is necessary both for academic integrity and for answering questions in your defence.",
        },
      },
      {
        id: "etik-mi",
        q: { tr: "Yapay zekâ kullanmak akademik olarak uygun mu? Başım derde girer mi?", en: "Is using AI academically acceptable? Could I get into trouble?" },
        a: {
          tr: "Kurumdan kuruma değişir. Birçok üniversite ve dergi yapay zekâ kullanımına izin veriyor ama **beyan edilmesini** istiyor; bazıları belirli kullanımları yasaklıyor. Önce üniversitenizin, enstitünüzün veya hedef derginizin yapay zekâ politikasını okuyun ve danışmanınızla konuşun.\nPlatform bu konuda size yardımcı olacak şekilde tasarlandı: kaynak uydurmaz, veri üretmez, her atfı doğrulanabilir bir kaynağa bağlar ve beyan metni hazırlamanıza yardım eder. Asistanın yazdığı metni incelemeden ve kendi katkınızı eklemeden teslim etmeyin.",
          en: "It depends on the institution. Many universities and journals allow AI use but require it to be **disclosed**; some prohibit certain uses. First read your university’s, graduate school’s or target journal’s AI policy and talk to your advisor.\nThe platform is designed to help here: it does not fabricate sources or data, links every citation to a verifiable source and helps you draft a disclosure statement. Do not submit assistant-written text without reviewing it and adding your own contribution.",
        },
      },
    ],
  },
  {
    id: "neden",
    title: { tr: "Neden Academiana?", en: "Why Academiana?" },
    items: [
      {
        id: "ayiran",
        q: { tr: "Academiana’yı diğer yapay zekâ araçlarından ayıran ne?", en: "What sets Academiana apart from other AI tools?" },
        a: {
          tr: "Academiana genel amaçlı bir sohbet botu değil, baştan sona **akademik çalışma için tasarlanmış** bir çalışma alanıdır. Kaynaklar gerçek akademik veri tabanlarından gelir ve yapay zekâ yalnızca projenize eklenmiş, künyesi doğrulanabilen kaynaklara atıf yapar; kaynak, DOI veya veri uydurmamak sistemin temel kuralıdır. Her kaynağın künyesinin mi, özetinin mi, tam metninin mi okunduğu açıkça gösterilir. Konu seçiminden kurguya, kaynak taramasından yazıma, istatistikten teslim öncesi denetime kadar bütün adımlar tek yerde, birbirine bağlı ilerler.",
          en: "Academiana is not a general-purpose chatbot but a workspace **designed for academic work** from start to finish. Sources come from real academic databases, and the AI cites only sources added to your project whose records can be verified; not fabricating sources, DOIs or data is a core rule of the system. For every source it shows clearly whether the record, the abstract or the full text was read. Every step, from choosing a topic to planning, searching, writing, statistics and the pre-submission check, happens in one place and stays connected.",
        },
      },
      {
        id: "veri-tabanlari",
        q: { tr: "Hangi akademik veri tabanlarında arama yapıyor?", en: "Which academic databases does it search?" },
        a: {
          tr: "Tek bir aramada **16 akademik kaynak** birlikte taranır: OpenAlex, Crossref, PubMed / Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, DBLP, DataCite, PLOS, Zenodo, HAL, INSPIRE-HEP, Unpaywall, Google Books ve Open Library. Erişim anahtarı tanımlandığında Springer Nature, IEEE Xplore ve NASA ADS de eklenir. Sonuçlar birleştirilir, yinelenen kayıtlar ayıklanır ve konunuza uygunluğuna göre sıralanır; Türkçe ve Türkiye adresli yayınlar için ayrı bir seçenek vardır. DOI’ler Crossref ve DataCite, PMID’ler Europe PMC, arXiv kimlikleri arXiv üzerinden doğrulanır.",
          en: "A single search covers **16 academic sources** at once: OpenAlex, Crossref, PubMed / Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, DBLP, DataCite, PLOS, Zenodo, HAL, INSPIRE-HEP, Unpaywall, Google Books and Open Library. When access keys are configured, Springer Nature, IEEE Xplore and NASA ADS are added too. Results are merged, duplicates are removed and they are ranked by relevance to your topic; there is a separate option for Turkish-language and Türkiye-affiliated publications. DOIs are verified through Crossref and DataCite, PMIDs through Europe PMC and arXiv IDs through arXiv.",
        },
      },
      {
        id: "altyapi",
        q: { tr: "Altyapınız ne kadar güvenli ve güvenilir?", en: "How secure and reliable is your infrastructure?" },
        a: {
          tr: "Uygulama, veritabanı ve dosya depolama **Avrupa Birliği sınırları içinde, Frankfurt veri merkezi bölgesinde** çalışır. Her kullanıcının verisi veritabanı düzeyinde satır bazlı erişim kurallarıyla (RLS) birbirinden ayrılır ve bu kurallar otomatik testlerle doğrulanır. Bağlantılar HTTPS ve HSTS ile şifrelenir; içerik güvenlik politikası (CSP), istek kaynağı denetimi ve iç ağa yönelik saldırılara karşı korumalar kullanılır. Yüklediğiniz dosyalar özel depolama alanında tutulur ve yalnızca süreli bağlantılarla açılır; gizli anahtarlar hiçbir zaman tarayıcıya gönderilmez. Platformun işleyişi 500’ü aşkın otomatik testle denetlenir. Ayrıntılar KVKK Aydınlatma Metni’nde ve Yöntem ve şeffaflık sayfasındadır.",
          en: "The application, database and file storage run **within the European Union, in the Frankfurt data centre region**. Each user’s data is isolated at database level with row-level security (RLS) rules, and these rules are verified by automated tests. Connections are encrypted with HTTPS and HSTS; a content security policy (CSP), request-origin checks and protection against attacks on internal networks are in place. Files you upload are kept in private storage and open only through time-limited links; secret keys are never sent to the browser. The platform’s behaviour is checked by more than 500 automated tests. Details are in the KVKK Privacy Notice and on the Method and transparency page.",
        },
      },
      {
        id: "modeller",
        q: { tr: "Hangi yapay zekâ modellerini kullanıyorsunuz?", en: "Which AI models do you use?" },
        a: {
          tr: "Academiana, Anthropic’in **Claude** model ailesini kullanır ve modeli işin zorluğuna göre seçer: bölüm yazımı ve kapsamlı inceleme gibi karmaşık işlerde en güçlü model, orta zorluktaki işlerde dengeli model, kısa ve basit işlerde hızlı model devreye girer. Böylece her işte uygun kalite ve hız elde edilir. Asistan, çalışmanızın kurgusunu, proje hafızasını ve projenize eklediğiniz kaynakları bağlam olarak kullanır; yalnızca genel bilgiye dayanarak yazmaz.",
          en: "Academiana uses Anthropic’s **Claude** model family and picks the model by how demanding the task is: the most capable model for complex work such as drafting sections and in-depth review, a balanced model for medium tasks and a fast model for short, simple ones. This gives the right quality and speed for every task. The assistant uses your work’s plan, the project memory and the sources added to your project as context; it does not write from general knowledge alone.",
        },
      },
      {
        id: "tek-yerde",
        q: { tr: "Tek bir yerde neler yapabilirim?", en: "What can I do in one place?" },
        a: {
          tr: "Konu bulma ve başlık önerisinden çalışma kurgusuna, kaynak taramasından bölüm bölüm yazıma kadar her şey aynı çalışma alanındadır. Bunlara ek olarak **istatistik analizleri** (t testleri, ANOVA, korelasyon, regresyon, ki-kare, Cronbach alfa, Mann-Whitney, Kruskal-Wallis; APA 7 tablo ve cümlesiyle), anket hazırlama ve toplama, PRISMA 2020 sistematik derleme, literatür haritası, atıflı cümlelerin kaynağında desteklenip desteklenmediğini gösteren iddia denetimi, savunma provası ve sunum hazırlama, ortak yazarlarla canlı yazım ve danışmanla salt okunur paylaşım bulunur. Çalışmanızı Word, PDF veya LaTeX olarak indirebilir, tek tıkla Overleaf’e aktarabilirsiniz.",
          en: "Everything from topic discovery and title suggestions to planning your work, searching sources and writing section by section happens in the same workspace. On top of that there are **statistical analyses** (t-tests, ANOVA, correlation, regression, chi-square, Cronbach’s alpha, Mann-Whitney, Kruskal-Wallis, with APA 7 tables and sentences), survey design and collection, PRISMA 2020 systematic reviews, a literature map, claim checking that shows whether cited sentences are supported by their sources, defence rehearsal and presentation preparation, live co-writing with co-authors and read-only sharing with your advisor. You can download your work as Word, PDF or LaTeX and send it to Overleaf in one click.",
        },
      },
      {
        id: "bicim-guclu",
        q: { tr: "Akademik biçim ve atıf konusunda neler sunuyor?", en: "What does it offer for academic formatting and citations?" },
        a: {
          tr: "APA 7 ve 6, ISNAD 2, Chicago, Turabian, MLA, Harvard, Vancouver, IEEE ve AMA dâhil **10 atıf stili** desteklenir. Atıflar metinde düz yazı olarak değil, kaynağa bağlı öğeler olarak tutulur; stili değiştirdiğinizde bütün metin ve kaynakça anında yeni stile dönüşür. Tablo ve şekil başlıkları da seçtiğiniz stile göre biçimlenir. Üniversitenizin yazım kılavuzunu yükleyerek bölüm yapısı ve biçim kuralı önerisi alabilir; çalışmanızı kapak sayfası, içindekiler, numaralı başlıklar, dipnotlar ve kaynakçayla dışa aktarabilirsiniz.",
          en: "**10 citation styles** are supported, including APA 7 and 6, ISNAD 2, Chicago, Turabian, MLA, Harvard, Vancouver, IEEE and AMA. Citations are stored not as plain text but as elements linked to their sources; when you change the style, the entire text and reference list switch to the new style instantly. Table and figure captions are formatted for the chosen style too. You can upload your university’s writing guide to get a suggested chapter structure and formatting rules, and export your work with a cover page, table of contents, numbered headings, footnotes and references.",
        },
      },
      {
        id: "seffaflik",
        q: { tr: "Neden şeffaflığa bu kadar önem veriyorsunuz?", en: "Why do you care so much about transparency?" },
        a: {
          tr: "Çünkü akademik çalışmada güven, ne yapıldığını görebilmekten geçer. Kaynakların nereden geldiğini, nasıl doğrulandığını, kalite puanının nasıl hesaplandığını ve sistemin sınırlamalarını **Yöntem ve şeffaflık** sayfasında açıkça anlatıyoruz; yapay zekâ bulguları kalite puanını etkilemez. Lisanslı bir intihal servisi kullanmadığımız için intihal yüzdesi göstermiyoruz ve yapmadığımız bir şeyi yapıyormuş gibi görünmüyoruz. Kullanıcılarımızın kendi sözleriyle görüşlerini ana sayfada okuyabilirsiniz.",
          en: "Because trust in academic work comes from being able to see what was done. On the **Method and transparency** page we explain clearly where sources come from, how they are verified, how the quality score is calculated and what the system’s limitations are; AI findings do not affect the quality score. As we do not use a licensed plagiarism service, we do not show a plagiarism percentage and we do not appear to do something we don’t. You can read what our users say in their own words on the home page.",
        },
      },
    ],
  },
  {
    id: "kaynaklar",
    title: { tr: "Kaynaklar ve doğruluk", en: "Sources and accuracy" },
    items: [
      {
        id: "uydurur-mu",
        q: { tr: "Yapay zekâ var olmayan kaynak uydurur mu?", en: "Does the AI make up sources that don’t exist?" },
        a: {
          tr: "Hayır. Genel amaçlı sohbet botlarının en büyük sorunu budur; Academiana’da sistem düzeyinde engellenmiştir. Asistan **yalnızca projenize eklenmiş kaynaklara** atıf yapabilir ve bu kaynaklar gerçek veri tabanlarından gelir; DOI, PubMed veya arXiv kimliği olanlar resmî kayıtlarla doğrulanır. Listede olmayan bir kaynağa atıf yapılamaz.\nKaynağı bulunamayan kesin bir iddiayı da yazmaz: o konuyu size bildirir ve kaynak aramaya devam eder.",
          en: "No. This is the biggest problem with general-purpose chatbots, and Academiana blocks it at the system level. The assistant can cite **only sources added to your project**, which come from real databases; those with a DOI, PubMed or arXiv ID are verified against official records. A source that is not in your list cannot be cited.\nIt also does not write definitive claims it cannot support: it flags the topic and keeps searching for sources.",
        },
      },
      {
        id: "nereden",
        q: { tr: "Kaynaklar nereden geliyor?", en: "Where do the sources come from?" },
        a: {
          tr: "16 akademik veri tabanından; tekrarlar ayıklandığında 250 milyondan fazla farklı yayın. Başlıcaları OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, PLOS, HAL ve Zenodo; ayrıca Türkçe ve Türkiye adresli yayınlar (DergiPark dergileri dahil) ayrıca aranabilir. TR Dizin ve YÖK Ulusal Tez Merkezi’nde aynı sorguyla arama yapmak için bağlantılar vardır. Kendi kaynaklarınızı da DOI ile, elle, PDF yükleyerek veya Zotero/Mendeley/EndNote dosyasıyla ekleyebilirsiniz.",
          en: "From 16 academic databases — more than 250 million distinct publications once duplicates are removed. The main ones are OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE, ERIC, PLOS, HAL and Zenodo; Turkish-language and Turkey-affiliated publications (including DergiPark journals) can also be searched. There are links to run the same search in TR Dizin and the YÖK National Thesis Center. You can add your own sources by DOI, manually, by uploading a PDF or from a Zotero/Mendeley/EndNote file.",
        },
      },
      {
        id: "dogrulanmadi",
        q: { tr: "Bir kaynağın yanında “Doğrulanmadı” yazıyor. Bu kaynak sahte mi?", en: "A source says “Not verified”. Is it fake?" },
        a: {
          tr: "Hayır, sahte olduğu anlamına gelmez. Kaynağın DOI, PubMed veya arXiv gibi kalıcı bir kimliği olmadığı ya da kimliğin resmî kayıtla eşleştirilemediği anlamına gelir; özellikle kitaplar, eski yayınlar ve bazı Türkçe dergiler böyledir. Künyeyi kontrol edin; DOI’si varsa ekleyip “Doğrula”ya basın. Doğrulanmamış kaynaklar kalite raporunda ayrıca uyarı olarak gösterilir.",
          en: "No, it does not mean it is fake. It means the source has no persistent identifier such as a DOI, PubMed or arXiv ID, or the identifier could not be matched to the official record; this is common for books, older publications and some Turkish journals. Check the citation details; if it has a DOI, add it and click “Verify”. Unverified sources are also flagged in the quality report.",
        },
      },
      {
        id: "erisim",
        q: { tr: "“Yalnızca künye”, “Özet okundu”, “Tam metin okundu” ne demek?", en: "What do “Citation only”, “Abstract read” and “Full text read” mean?" },
        a: {
          tr: "Asistanın o kaynağın ne kadarını gerçekten okuduğunu gösterir. **Yalnızca künye:** yalnızca yazar, başlık, yıl gibi bilgiler biliniyor; içerik hakkında yorum yapılmaz. **Özet okundu:** yalnızca özet okundu; ayrıntılı yöntem ve bulgular hakkında iddiada bulunulmaz. **Tam metin okundu:** açık erişimli tam metin veya sizin yüklediğiniz PDF okundu; doğrudan alıntı ve sayfa numarası yalnızca bu kaynaklardan verilir.",
          en: "It shows how much of the source the assistant has actually read. **Citation only:** only author, title, year etc. are known; no claims are made about the content. **Abstract read:** only the abstract was read; no claims about detailed methods or findings. **Full text read:** the open-access full text or a PDF you uploaded was read; direct quotes and page numbers are given only from these sources.",
        },
      },
      {
        id: "ucretli-makale",
        q: { tr: "Ücretli (kapalı erişimli) makaleleri okuyabiliyor mu?", en: "Can it read paywalled articles?" },
        a: {
          tr: "Hayır; yalnızca yasal olarak açık erişimli tam metinleri okur, ücretli içeriği indirmez. Üniversitenizin aboneliği üzerinden indirdiğiniz PDF’i Kaynaklar sekmesindeki “PDF yükle” ile o kaynağa ekleyebilirsiniz; böylece o kaynaktan da sayfa numaralı atıf ve doğrulama yapılabilir. Yüklediğiniz dosyalar yalnızca size açıktır.",
          en: "No; it reads only legally open-access full texts and does not download paid content. You can attach a PDF you downloaded through your university subscription to the source with “Upload PDF” in the Sources tab; that source then supports page-numbered citations and verification too. Uploaded files are visible only to you.",
        },
      },
      {
        id: "sayfa",
        q: { tr: "Atıflardaki sayfa numaraları doğru mu?", en: "Are the page numbers in citations correct?" },
        a: {
          tr: "Sayfa numarası yalnızca tam metni okunan kaynaklarda ve okunan metindeki gerçek sayfadan verilir; PDF’in kaçıncı sayfası değil, dergideki sayfa numarası kullanılır. Eşleştirme güvenilir değilse sayfa hiç yazılmaz: yanlış sayfa yazmaktansa boş bırakmayı tercih ederiz. Yine de teslimden önce kontrol etmeniz önerilir; atfa tıklayıp “Kaynakta doğrula” ile ilgili pasajı sayfasıyla görebilirsiniz.",
          en: "Page numbers are given only for sources whose full text was read, using the real page in the text that was read — the journal page, not the PDF page index. If the mapping is not reliable, no page is written: we prefer leaving it blank to writing a wrong page. Still, check before submission: click a citation and use “Check in source” to see the passage with its page.",
        },
      },
      {
        id: "dogrula",
        q: { tr: "Bir cümlenin gerçekten kaynakta geçtiğinden nasıl emin olurum?", en: "How can I be sure a sentence is really supported by the source?" },
        a: {
          tr: "Bölümün tamamı için bölüm başlığının yanındaki **İddia denetimi** düğmesini (veya Araçlar → İddia denetimi) kullanın: atıflı her cümle, atıf yaptığı kaynağın okunan metniyle karşılaştırılır; sonuç (destekleniyor / kısmen / desteklenmiyor / okunamadı) dayanak pasajı ve sayfasıyla listelenir, sorunlu cümleler metinde renkli altı çizili gösterilir ve tek tıkla asistanla düzeltilebilir. Atıfsız kesin ifadeler de işaretlenir. Tek bir atıf için metindeki atfa tıklayıp **Kaynakta doğrula**’yı seçin. Sistem kaynağın okunmuş metninde ilgili bölümleri bulur, sayfasıyla gösterir ve cümlenin kaynak tarafından desteklenip desteklenmediğini değerlendirir (destekliyor / kısmen / desteklemiyor / karar için yeterli metin yok). Gösterilen alıntı kaynak metninde birebir aranır; bulunamazsa gösterilmez. Son karar sizindir. “Diğer kaynaklarımla da karşılaştır” seçiliyse atıfsız veya desteklenmeyen cümleler projenizdeki diğer kaynaklarla da karşılaştırılır: cümleyi destekleyen ama atıf yapmadığınız kaynak önerilir, cümlenizle **çelişen** bir bulgu varsa alıntısıyla uyarılır. Sonuçta “Kaynakla çelişiyor” ayrı bir karar olarak gösterilir ve CSV olarak indirilebilir.",
          en: "For a whole section use the **Claim audit** button next to the section title (or Tools → Claim audit): every cited sentence is compared with the text read from its source; the result (supported / partly / not supported / not readable) is listed with the supporting passage and page, problem sentences are underlined in the text and can be fixed with the assistant in one click. Uncited strong statements are flagged too. For a single citation, click it in the text and choose **Check in source**. The system finds the relevant passages in the source’s read text, shows them with page numbers and assesses whether the sentence is supported (supports / partially / does not support / not enough text). The quote shown is matched verbatim against the source text and hidden if not found. The final decision is yours. With “Also compare with my other sources” selected, uncited or unsupported sentences are also compared with the other sources in your project: a source that supports the sentence but is not cited is suggested, and a source whose findings **contradict** the sentence is flagged with a quote. “Contradicts the source” is shown as a separate verdict and the results can be downloaded as CSV.",
        },
      },
      {
        id: "prisma",
        q: { tr: "Sistematik derleme (PRISMA) yapabilir miyim?", en: "Can I do a systematic review (PRISMA)?" },
        a: {
          tr: "Evet, Pro ve üstü paketlerde (Premium, Sınırsız Kullanım). Araçlar → **Sistematik derleme (PRISMA)**: protokolünüzü (soru, dahil etme ve hariç tutma ölçütleri) yazarsınız; kayıtları Academiana araması veya Scopus, Web of Science, PubMed gibi veri tabanlarından RIS/BibTeX içe aktararak toplarsınız (yinelenenler otomatik ayrılır). Başlık/özet taramasında yapay zekâ yalnızca öneri verir, kararı ve gerekçeyi siz seçersiniz. Tam metin uygunluğundan sonra PRISMA 2020 akış şeması sayılarla otomatik çizilir; belgeye şekil olarak ekleyebilir, kayıtları CSV indirebilir, dahil edilen çalışmaları tek tıkla kaynaklarınıza ekleyebilirsiniz. Ayrıca: benzer başlık ve yıla göre olası yinelenenler otomatik ayrılır; **çift değerlendirici modunda** ekipteki her araştırmacı bağımsız oy verir, anlaşmazlıklar listelenir ve Cohen’in kappası hesaplanır; **Veri çıkarma ve kalite** sekmesinde dahil edilen çalışmalardan standart form yapay zekâyla taslak olarak (dayanak alıntısıyla) doldurulur, 7 maddelik listeyle yanlılık riski değerlendirilir ve özellikler tablosu belgeye eklenir; son sekmede PRISMA 2020’ye uygun **yöntem ve sonuç metni** sayılar ve arama tablosuyla otomatik oluşturulur.",
          en: "Yes, on Pro and higher plans (Premium, Unlimited). Tools → **Systematic review (PRISMA)**: write your protocol (question, inclusion and exclusion criteria); collect records with Academiana search or by importing RIS/BibTeX from databases such as Scopus, Web of Science or PubMed (duplicates are separated automatically). In title/abstract screening the AI only suggests; you choose the decision and the reason. After full-text eligibility, the PRISMA 2020 flow diagram is drawn automatically with the counts; you can insert it as a figure, download the records as CSV and add the included studies to your sources in one click. Also: likely duplicates are separated automatically by similar title and year; in **dual reviewer mode** each researcher on the team votes independently, disagreements are listed and Cohen’s kappa is calculated; in the **Data extraction and quality** tab a standard form is drafted by AI from the included studies (with supporting quotes), risk of bias is appraised with a 7-item checklist and a characteristics table can be inserted; the last tab generates a PRISMA 2020 **methods and results text** with the numbers and a search table.",
        },
      },
      {
        id: "coklu-belge",
        q: { tr: "Birden çok makaleyi birlikte karşılaştırabilir miyim?", en: "Can I compare several papers at once?" },
        a: {
          tr: "Evet, Pro ve üstü paketlerde. Kaynaklar → **Birlikte analiz et**: 2–8 kaynak seçip ya hepsine aynı soruyu sorarsınız ya da **Karşılaştır** ile her çalışmanın amacı, deseni, örneklemi, bulguları ve sınırlılıkları yan yana gelir; kaynakların uyuştuğu noktalar, **ayrışan/çelişen bulgular** (olası nedeniyle) ve araştırma boşlukları listelenir. Her bilgi kaynağına ve sayfasına bağlıdır; tabloyu veya sentezi canlı atıflarla belgeye ekleyebilirsiniz. Yalnızca okunan metin (tam metin veya özet) kullanılır.",
          en: "Yes, on Pro and higher plans. Sources → **Analyse together**: select 2–8 sources and either ask them all the same question or use **Compare** to see each study’s aim, design, sample, findings and limitations side by side, with points of agreement, **diverging/conflicting findings** (with a likely reason) and research gaps. Every statement is linked to its source and page; you can insert the table or the synthesis with live citations. Only text that has been read (full text or abstract) is used.",
        },
      },
      {
        id: "pdf-okuma",
        q: { tr: "Yüklediğim veya bulunan PDF’ler nasıl okunuyor?", en: "How are uploaded or retrieved PDFs read?" },
        a: {
          tr: "PDF metni çıkarılırken her sayfada tekrar eden dergi başlığı ve sayfa numaraları temizlenir, satır sonunda bölünmüş kelimeler birleştirilir ve makalenin bölümleri (Özet, Yöntem, Bulgular, Tartışma…) tanınır; kaynakça kısmı kanıt aramasına karıştırılmaz. Böylece “Yöntemi ne?” gibi sorularda ilgili bölüm öne alınır ve alıntılar yayındaki sayfa numarasıyla gösterilir. Taranmış (görüntü) PDF’lerde metin seçilemediği için bu açıkça bildirilir.",
          en: "When text is extracted from a PDF, the journal header and page numbers repeated on every page are removed, words split at line ends are rejoined and the paper’s sections (Abstract, Method, Results, Discussion…) are recognised; the reference list is kept out of the evidence search. Questions such as “What was the method?” therefore look at the right section first, and quotes are shown with the published page number. For scanned (image) PDFs, where text cannot be selected, this is stated clearly.",
        },
      },
      {
        id: "latex",
        q: { tr: "Çalışmamı LaTeX’e veya Overleaf’e aktarabilir miyim?", en: "Can I export my work to LaTeX or Overleaf?" },
        a: {
          tr: "Evet. Dışa aktar → **LaTeX (.tex + .bib, ZIP)** çalışmanızı main.tex, references.bib ve şekiller olarak indirir; atıflarınız biblatex komutlarına (\\parencite, \\textcite) dönüşür, sayfa numaraları korunur. **Overleaf’te aç** aynı dosyaları yeni sekmede Overleaf projesi olarak açar. APA, IEEE, MLA, Vancouver ve yazar–yıl stilleri biblatex karşılıklarıyla kullanılır; ISNAD gibi karşılığı olmayan stillerde en yakın stil seçilir ve dosyada belirtilir. Derleme pdfLaTeX + Biber ile yapılır (Overleaf varsayılanı).",
          en: "Yes. Export → **LaTeX (.tex + .bib, ZIP)** downloads your work as main.tex, references.bib and figures; your citations become biblatex commands (\\parencite, \\textcite) and page numbers are kept. **Open in Overleaf** opens the same files as an Overleaf project in a new tab. APA, IEEE, MLA, Vancouver and author–year styles use their biblatex equivalents; for styles without one, such as ISNAD, the closest style is chosen and noted in the file. Compile with pdfLaTeX + Biber (the Overleaf default).",
        },
      },
      {
        id: "harita",
        q: { tr: "Literatür haritası ne işe yarar?", en: "What is the literature map for?" },
        a: {
          tr: "Araçlar → **Literatür haritası**, çalışmanızdaki kaynakları OpenAlex kayıtlarından bir ağ olarak gösterir: birbirine atıflar, ortak kaynakça (aynı yayınlara atıf yapmaları) ve başka yayınlarda birlikte atıf almaları. Benzer kaynaklar renkli kümelere ayrılır ve kümeye konusundan ad verilir; köprü ve merkezi kaynaklar, bağlantısız kalanlar ve metinde henüz atıf yapmadığınız kaynaklar işaretlenir. **Zaman çizelgesi** literatürünüzün yıllara göre gelişimini, **Konu haritası** hangi alt konuları kapsadığınızı ve ilgili literatürde olup sizde olmayan konuları gösterir. **Eksik temel çalışmalar** (kaynaklarınızın en az ikisinin atıf yaptığı yayınlar) ve **Yeni çalışmalar** (son 6 yılda kaynaklarınızın en az ikisine atıf yapan yayınlar) tek tıkla eklenebilir. Güncellik ve kümeler arası boşluk gibi uyarılar kural tabanlıdır, yapay zekâ kullanılmaz. Harita PNG/SVG olarak indirilebilir. DOI’si olan kaynaklar haritaya girer; Pro ve üstü paketlerde kullanılabilir.",
          en: "Tools → **Literature map** shows the sources in your work as a network built from OpenAlex records: direct citations, shared references and co-citation by other papers. Similar sources form coloured clusters named after their topic; bridge and central sources, isolated ones and sources you have not yet cited in the text are marked. **Timeline** shows how your literature developed over the years; **Topic map** shows which subtopics you cover and which appear in related literature but not in yours. **Missing key works** (cited by at least two of your sources) and **New works** (papers from the last 6 years citing at least two of your sources) can be added in one click. Hints such as recency and gaps between clusters are rule-based; no AI is used. The map can be downloaded as PNG/SVG. Sources with a DOI are included; available on Pro and higher plans.",
        },
      },
      {
        id: "kalite-puani",
        q: { tr: "Kalite puanı neyi ölçer?", en: "What does the quality score measure?" },
        a: {
          tr: "Puan 100’den başlar ve kural tabanlı her bulgu önemine göre puan düşürür (kritik, uyarı, bilgi). Atıf–kaynakça tutarlılığını, kaynakların doğrulanabilirliğini, eksik bölümleri, akademik dil kurallarını ve tekrarları ölçer; yapay zekâ jürisinin bulguları gösterilir ama puanı değiştirmez, böylece aynı metin hep aynı puanı alır. Bilimsel değeri, özgünlüğü veya intihali ölçmez. Kalite sayfasında “Puan nasıl hesaplanır?” bölümü ve teslim öncesi kontrol listesi bulunur; ayrıntılar **Yöntem ve şeffaflık** sayfasındadır.",
          en: "The score starts at 100 and each rule-based finding lowers it by severity (critical, warning, information). It measures citation–reference consistency, source verifiability, missing sections, academic language rules and repetition; AI jury findings are shown but do not change the score, so the same text always gets the same score. It does not measure scientific merit, originality or plagiarism. The quality page has a “How is the score calculated?” section and a pre-submission checklist; details are on the **Method and transparency** page.",
        },
      },
      {
        id: "kendi-kaynak",
        q: { tr: "Zotero, Mendeley veya EndNote’taki kaynaklarımı aktarabilir miyim?", en: "Can I import my sources from Zotero, Mendeley or EndNote?" },
        a: {
          tr: "Evet. Programınızdan kaynakları BibTeX (.bib), RIS (.ris) veya CSL-JSON (.json) olarak dışa aktarın; Kaynaklar sekmesinde “İçe aktar” ile yükleyin. Tek seferde 300 kayda kadar aktarılır, DOI’si olanlar doğrulanır, projede zaten olanlar atlanır. Aynı biçimlerde geri de dışa aktarabilirsiniz.",
          en: "Yes. Export your references from your program as BibTeX (.bib), RIS (.ris) or CSL-JSON (.json) and upload them with “Import” in the Sources tab. Up to 300 records are imported at a time, those with a DOI are verified and duplicates are skipped. You can export in the same formats too.",
        },
      },
    ],
  },
  {
    id: "yazim",
    title: { tr: "Yazım, biçim ve dışa aktarma", en: "Writing, formatting and export" },
    items: [
      {
        id: "stiller",
        q: { tr: "Hangi atıf stillerini destekliyor? Sonradan değiştirebilir miyim?", en: "Which citation styles are supported? Can I change later?" },
        a: {
          tr: "APA 7, APA 6, ISNAD 2 (metin içi), MLA 9, Chicago (yazar-tarih), Turabian, Harvard, Vancouver, IEEE ve AMA. İstediğiniz an değiştirebilirsiniz: atıflar metne yazı olarak değil kaynağa bağlı öğe olarak eklendiği için tüm metin içi atıflar ve kaynakça anında yeni stile dönüşür. Kaynakça yalnızca metinde atıf yapılan kaynaklardan otomatik oluşur.",
          en: "APA 7, APA 6, ISNAD 2 (in-text), MLA 9, Chicago (author-date), Turabian, Harvard, Vancouver, IEEE and AMA. You can switch at any time: citations are inserted as elements linked to the source, not as plain text, so all in-text citations and the reference list switch instantly. The reference list is built automatically from the sources cited in the text.",
        },
      },
      {
        id: "kilavuz",
        q: { tr: "Üniversitemin tez yazım kılavuzuna uyar mı?", en: "Will it follow my university’s thesis guidelines?" },
        a: {
          tr: "Büyük ölçüde evet. Kılavuzunuzu (PDF/DOCX) Proje ayarlarından yükleyin: asistan bölüm yapısını ve biçim kurallarını ona göre önerir ve dikkate alır. “Dışa aktar → Biçim ve kapak ayarları”ndan yazı tipi, punto, satır aralığı, kenar boşlukları, sayfa numarası ve T.C./üniversite/enstitü/danışman bilgili kapak sayfası ayarlanır. Her üniversitenin küçük farkları olduğu için son biçim kontrolünü enstitünüzün kılavuzuyla yapmanızı öneririz.",
          en: "Largely, yes. Upload your guidelines (PDF/DOCX) in Project settings: the assistant suggests and follows the section structure and formatting rules. Under “Export → Format and cover settings” you set font, size, line spacing, margins, page numbers and a cover page with university/institute/advisor details. Since every university has small differences, do a final format check against your graduate school’s guidelines.",
        },
      },
      {
        id: "formatlar",
        q: { tr: "Çalışmamı hangi biçimlerde indirebilirim?", en: "In which formats can I download my work?" },
        a: {
          tr: "Word (.docx), PDF, Markdown ve düz metin; kapak, içindekiler, başlık numaralandırması, dipnotlar ve kaynakça eklenir. Ayrıca savunma sunumu (.pptx), kaynak listesi (BibTeX/RIS) ve literatür matrisi (Excel için CSV) indirilebilir. Bazı biçimler paketinize bağlıdır; Fiyatlar sayfasında görebilirsiniz.",
          en: "Word (.docx), PDF, Markdown and plain text, with cover page, table of contents, heading numbering, footnotes and references. You can also download a defence presentation (.pptx), your reference list (BibTeX/RIS) and the literature matrix (CSV for Excel). Some formats depend on your plan; see the Pricing page.",
        },
      },
      {
        id: "bulgular",
        q: { tr: "Bulgular bölümünü yazabilir mi? İstatistik yapıyor mu?", en: "Can it write the results section? Does it do statistics?" },
        a: {
          tr: "Asistan hiçbir veri, sayı veya bulgu uydurmaz. Kendi verinizi (CSV veya Excel) yüklerseniz **İstatistik analizi** ile t testi, ANOVA, korelasyon, regresyon, ki-kare, Cronbach alfa, Mann-Whitney ve Kruskal-Wallis analizleri sunucuda gerçek hesaplamayla (SPSS ile aynı formüllerle) yapılır; sonuç APA 7 biçiminde tablo ve cümle olarak belgeye eklenir. Asistan bu gerçek sonuçları yorumlamanıza yardım eder.",
          en: "The assistant never fabricates data, numbers or findings. If you upload your own data (CSV or Excel), **Statistical analysis** runs t-tests, ANOVA, correlation, regression, chi-square, Cronbach’s alpha, Mann-Whitney and Kruskal-Wallis with real calculations on the server (same formulas as SPSS), and inserts the result as an APA 7 table and sentence. The assistant then helps you interpret these real results.",
        },
      },
      {
        id: "dil",
        q: { tr: "İngilizce veya Almanca tez ya da makale yazabilir miyim?", en: "Can I write in English or German?" },
        a: {
          tr: "Evet. Her çalışmanın dili ayrı seçilir (Türkçe, İngilizce veya Almanca); asistan o dilde yazar, atıf terimleri (vd./et al./et al., s./p./S.) ve tablo/şekil etiketleri dile göre ayarlanır; Word, PDF ve LaTeX çıktısı da o dilde hazırlanır. Türkçe çalışmalarda “Özet ve Abstract” Türkçe özetin akademik İngilizce karşılığını, Almanca çalışmalarda Zusammenfassung ile İngilizce Abstract’ı hazırlar. Arayüz Türkçe, İngilizce ve Almanca kullanılabilir.",
          en: "Yes. Each work has its own language (Turkish, English or German); the assistant writes in that language, and citation terms (vd./et al., s./p./S.) and table and figure labels adapt; Word, PDF and LaTeX exports are prepared in that language too. For Turkish works, “Turkish & English abstract” prepares the academic English version of the abstract; for German works it prepares a Zusammenfassung and an English abstract. The interface is available in Turkish, English and German.",
        },
      },
      {
        id: "ceviri",
        q: { tr: "Türkçe metnimi akademik İngilizceye çevirebilir miyim? Atıflarım bozulur mu?", en: "Can I translate my Turkish text into academic English? Will my citations break?" },
        a: {
          tr: "Evet. Çalışma alanında **Araçlar → Dil ve çeviri** (veya metni seçince çıkan balondaki **Çevir**) bir bölümü, alt başlığı ya da seçili metni Türkçe, İngilizce ve Almanca arasında akademik dile çevirir. Atıflar, dipnotlar, şekiller, tablolar ve başlık düzeyleri olduğu gibi korunur; ondalık ve istatistik gösterimi (Ort./SS ↔ M/SD) hedef dile uyarlanır, sayılar değişmez. Amerikan veya İngiliz İngilizcesi seçilebilir. **Terim sözlüğü** alanınıza özgü karşılıkları (ör. öz yeterlik → self-efficacy) her çeviride aynı tutar. Çeviri öncesi hâl sürüm geçmişinde saklanır. **Dil denetimi** sekmesi de yazım, dil bilgisi, noktalama ve akademik üslup hatalarını tek tek önerir; isterseniz tek tıkla uygularsınız. Çeviri ve denetim aylık yapay zekâ hakkından düşer.",
          en: "Yes. In the workspace, **Tools → Language & translation** (or **Translate** in the bubble that appears when you select text) translates a section, a subheading or a selection between Turkish, English and German in academic style. Citations, footnotes, figures, tables and heading levels are preserved; decimal and statistical notation (Ort./SS ↔ M/SD) is adapted, numbers never change. You can choose American or British English. The **Glossary** keeps your field’s equivalents (e.g. öz yeterlik → self-efficacy) consistent. The pre-translation version is kept in the history. The **Language check** tab suggests spelling, grammar, punctuation and academic tone fixes one by one, which you can apply in one click. Translation and checks count towards your monthly AI allowance.",
        },
      },
      {
        id: "kaynaga-sor",
        q: { tr: "Bir makaleye soru sorabilir miyim (yöntemi, örneklemi, bulguları)?", en: "Can I ask questions about a specific paper (its method, sample, findings)?" },
        a: {
          tr: "Evet. **Kaynaklar** sekmesinde her kaynağın yanındaki **Sor** düğmesi o makaleyle sohbet açar. “Yöntem”, “Örneklem”, “Temel bulgular”, “Sınırlılıklar”, “Alıntılanabilir cümleler” gibi hazır sorular veya kendi sorunuz; cevap yalnızca o kaynağın okunan metnine dayanır ve tam metin okunduysa sayfa numarasıyla gelir. Cevabı **Atıfla metne ekle** ile sayfa numaralı atıf olarak yazınıza alabilirsiniz. Yalnızca özeti okunan kaynaklarda bu açıkça belirtilir; açık erişim tam metni getirebilir veya kendi PDF’inizi yükleyebilirsiniz.",
          en: "Yes. In the **Sources** tab, the **Ask** button next to each source opens a chat with that paper. Use ready questions such as “Method”, “Sample”, “Key findings”, “Limitations”, “Quotable sentences” or your own; answers rely only on the text read from that source and come with page numbers when the full text was read. **Insert into text with citation** adds the answer with a page-numbered citation. If only the abstract was read, this is stated clearly; you can fetch the open-access full text or upload your own PDF.",
        },
      },
      {
        id: "arastirmalar-ne-diyor",
        q: { tr: "“Araştırmalar ne diyor?” nedir?", en: "What is “What does research say?”" },
        a: {
          tr: "Bir araştırma sorusu yazarsınız (ör. “Uyku süresi akademik başarıyı etkiler mi?”); sistem akademik veri tabanlarında gerçek makaleleri bulur, özetlerini okur ve her cümlesi numaralı bir makaleye bağlı kısa bir cevap verir. Evet/hayır sorularında **uzlaşı göstergesi** çalışmaların ne kadarının aynı yönde sonuç bulduğunu gösterir. Yalnızca özetler okunur ve bu açıkça yazılır; bu bir literatür taraması değildir. Ücretsiz araçlar arasında giriş yapmadan da kullanılabilir; çalışma alanında **Araçlar** menüsünden açıp makaleleri tek tıkla çalışmanıza ekleyebilirsiniz.",
          en: "You type a research question (e.g. “Does sleep duration affect academic achievement?”); the system finds real papers in academic databases, reads their abstracts and gives a short answer where every sentence is linked to a numbered paper. For yes/no questions, the **consensus meter** shows how many studies point the same way. Only abstracts are read and this is stated clearly; it is not a literature review. It is available among the free tools without signing in, and from **Tools** in the workspace, where you can add the papers to your work in one click.",
        },
      },
    ],
  },
  {
    id: "intihal",
    title: { tr: "İntihal ve özgünlük", en: "Plagiarism and originality" },
    items: [
      {
        id: "ozgun-mu",
        q: { tr: "Hazırlanan çalışmalar özgün mü?", en: "Is the work original?" },
        a: {
          tr: "Evet. Her metin, sizin projenizin konusu, yöntemi ve eklediğiniz kaynaklar temel alınarak o an, sıfırdan yazılır. Kaynaklardaki bilgiler kopyalanmaz; akademik dille yeniden ifade edilir ve her iddia ilgili kaynağa atıfla bağlanır. Doğrudan alıntı gerektiğinde metin tırnak içinde ve kaynağın tam metni okunduysa sayfa numarasıyla verilir. Başka kullanıcılara üretilen metinler kullanılmaz; sizin çalışmanız da kimseyle paylaşılmaz.",
          en: "Yes. Every text is written from scratch at that moment, based on your project’s topic, method and the sources you added. Information from sources is never copied; it is rephrased in academic language and each claim is linked to its source with a citation. When a direct quotation is needed, it is given in quotation marks, with a page number when the source’s full text was read. Text generated for other users is never reused, and your work is not shared with anyone.",
        },
      },
      {
        id: "benzerlik",
        q: { tr: "Benzerlik (intihal) oranı ne kadar çıkar?", en: "What similarity (plagiarism) score can I expect?" },
        a: {
          tr: "Metinler kaynaklardan aktarılmak yerine özgün olarak yazıldığı için benzerlik oranları düşük çıkar; deneyimlerimize göre kaynakça ve doğrudan alıntılar hariç tutulduğunda oran genellikle %5’in altında kalır. Kesin oran; kurumunuzun kullandığı programa (Turnitin, iThenticate vb.), karşılaştırılan arşive ve rapor ayarlarına göre değişebilir. Yöntem ve kavram tanımlarındaki yerleşik akademik ifadeler küçük eşleşmeler oluşturabilir; bu normaldir.",
          en: "Because texts are written originally rather than transferred from sources, similarity scores come out low; in our experience, with the bibliography and direct quotations excluded, the score usually stays below 5%. The exact figure depends on your institution’s software (Turnitin, iThenticate, etc.), the archive it compares against and the report settings. Established academic phrasing in methods and concept definitions may create small matches; this is normal.",
        },
      },
      {
        id: "intihal-orani",
        q: { tr: "Platformda benzerlik raporu alabilir miyim?", en: "Can I get a similarity report on the platform?" },
        a: {
          tr: "Benzerlik raporu yalnızca Turnitin veya iThenticate gibi lisanslı ve geniş yayın arşivine sahip servislerle güvenilir biçimde hazırlanabilir; bu nedenle platformda tahmini bir oran göstermiyoruz. Teslimden önce üniversitenizin sağladığı benzerlik programıyla kontrol yapmanızı öneririz.",
          en: "A similarity report can only be produced reliably with licensed services that have large publication archives, such as Turnitin or iThenticate, so we do not show an estimated score on the platform. We recommend checking your work with your university’s similarity software before submission.",
        },
      },
      {
        id: "dogrudan-alinti",
        q: { tr: "Doğrudan alıntılar nasıl gösteriliyor?", en: "How are direct quotations handled?" },
        a: {
          tr: "Kaynaktan birebir aktarılan her ifade tırnak içinde, yazar ve yıl bilgisiyle verilir; kaynağın tam metni okunduysa sayfa numarası da eklenir; uzun alıntılar seçtiğiniz atıf stilinin (APA 7, ISNAD vb.) blok alıntı kuralına göre biçimlenir. Böylece benzerlik raporunda çıkan alıntılar usulüne uygun gösterilmiş olur.",
          en: "Every phrase taken verbatim from a source is given in quotation marks with author and year, plus the page number when the full text was read; long quotations follow the block-quote rule of your chosen citation style (APA 7, ISNAD, etc.). Quotations that appear in a similarity report are therefore properly attributed.",
        },
      },
    ],
  },

  {
    id: "gizlilik",
    title: { tr: "Gizlilik ve güvenlik", en: "Privacy and security" },
    items: [
      {
        id: "kim-gorur",
        q: { tr: "Çalışmalarımı başkası görebilir mi?", en: "Can anyone else see my work?" },
        a: {
          tr: "Diğer kullanıcılar göremez: her kullanıcının projeleri, kaynakları, dosyaları ve sohbetleri veritabanı düzeyinde yalnızca kendisine açıktır. İstisnalar şunlardır: **(1)** “Danışmanla paylaş” ile kendiniz bir bağlantı oluşturursanız o bağlantıya sahip kişi çalışmanızı salt okunur görür; bağlantıyı istediğiniz an iptal edebilirsiniz. **(2)** Bir kurum lisansına katıldıysanız kurum yöneticisi yalnızca adınızı, e-postanızı ve kullanım sayılarınızı görür; çalışma içeriğinizi göremez. **(3)** Platform yöneticisinin teknik erişimi vardır; yalnızca sizin destek talebiniz, güvenlik incelemesi veya yasal zorunluluk hâlinde kullanılır.",
          en: "Other users cannot: each user’s projects, sources, files and conversations are accessible only to them at the database level. Exceptions: **(1)** if you create a link with “Share with advisor”, the person with that link can view your work read-only; you can revoke it at any time. **(2)** If you joined an institutional licence, the institution admin sees only your name, e-mail and usage counts, not your work. **(3)** The platform administrator has technical access, used only for your support request, security review or legal obligation.",
        },
      },
      {
        id: "egitim",
        q: { tr: "Yazdıklarım yapay zekâ modellerini eğitmek için kullanılıyor mu?", en: "Is my writing used to train AI models?" },
        a: {
          tr: "Hayır. Asistanı kullandığınızda yalnızca isteğinize cevap üretmek için gereken metin yapay zekâ sağlayıcısına (Anthropic, Claude) iletilir; sağlayıcının ticari API koşullarına göre bu veriler varsayılan olarak model eğitiminde kullanılmaz. Biz de verilerinizi eğitim için kullanmıyor, satmıyor veya üçüncü kişilerle paylaşmıyoruz.",
          en: "No. When you use the assistant, only the text needed to answer your request is sent to the AI provider (Anthropic, Claude); under the provider’s commercial API terms this data is not used for model training by default. We do not use your data for training, sell it or share it with third parties either.",
        },
      },
      {
        id: "nerede",
        q: { tr: "Verilerim nerede saklanıyor?", en: "Where is my data stored?" },
        a: {
          tr: "Avrupa Birliği’nde, Frankfurt’taki sunucularda; veritabanı ve uygulama aynı bölgededir. Bağlantılar şifrelidir ve yüklediğiniz dosyalar özel bir depolama alanında, yalnızca size açık olarak tutulur. Ayrıntılar Gizlilik ve KVKK sayfasındadır.",
          en: "In the European Union, on servers in Frankfurt; the database and application are in the same region. Connections are encrypted and your uploaded files are kept in private storage accessible only to you. Details are on the Privacy page.",
        },
      },
      {
        id: "silme",
        q: { tr: "Hesabımı ve tüm verilerimi silebilir miyim?", en: "Can I delete my account and all my data?" },
        a: {
          tr: "Evet. Hesap ve abonelik sayfasında “Verilerimi indir” ile tüm projelerinizi, kaynaklarınızı ve sohbetlerinizi taşınabilir biçimde (JSON) indirebilir, “Hesabımı sil” ile hesabınızı tüm verilerinizle birlikte kalıcı olarak silebilirsiniz. Çalışmalarınızı ayrıca Word/PDF olarak indirmeyi unutmayın.",
          en: "Yes. On the Account page, “Download my data” exports all your projects, sources and conversations in a portable format (JSON), and “Delete my account” permanently deletes your account with all your data. Remember to also download your work as Word/PDF.",
        },
      },
      {
        id: "ortak-yazar",
        q: { tr: "Çalışmamı arkadaşımla veya ortak yazarlarla birlikte yazabilir miyim?", en: "Can I write my work together with a friend or co-authors?" },
        a: {
          tr: "Evet. Çalışma alanının üst çubuğundaki **Ortak yazarlar** düğmesiyle en fazla 5 kişiyi e-posta adresiyle davet edersiniz (Pro, Premium ve Sınırsız Kullanım paketlerinde). **Ortak yazar** bölümleri yazar, kaynak ekler ve yapay zekâyı kendi paketiyle kullanır; **yorumcu** yalnızca okur ve yorum yazar. Kimin hangi bölümde, hangi paragrafta olduğu ve yazıp yazmadığı anında görünür (“Canlı”). Aynı bölümde birlikte yazarken değişiklikler saniyeler içinde birbirinize yansır; farklı paragraflardaki değişiklikler otomatik birleşir. Aynı paragrafı aynı anda düzenlerseniz bir sürüm kalır, diğeri silinmez, sürüm geçmişinde saklanır. Ortak yazarın dosyaları ve asistan sohbetleri kendisine özeldir. Davet edilen kişinin ücretli pakete ihtiyacı yoktur; ücretsiz hesapla katılabilir.",
          en: "Yes. With the **Co-authors** button in the workspace’s top bar you invite up to 5 people by email (on Pro, Premium and Unlimited). A **co-author** writes sections, adds sources and uses AI with their own plan; a **commenter** only reads and comments. You see instantly who is in which section and paragraph and whether they are typing (“Live”). When you write in the same section, changes reach each other within seconds and edits in different paragraphs merge automatically. If you edit the same paragraph at the same moment, one version is kept and the other is saved in the version history, never deleted. A co-author’s files and assistant chats stay private. Invitees do not need a paid plan; they can join with a free account.",
        },
      },
      {
        id: "bul-degistir",
        q: { tr: "Bölümde bir kelimeyi bulup değiştirebilir miyim?", en: "Can I find and replace a word in a section?" },
        a: {
          tr: "Evet. Editördeyken **Ctrl+F** (Mac’te ⌘+F) veya araç çubuğundaki büyüteç **Bul ve değiştir** çubuğunu açar. Eşleşmeler sarıyla vurgulanır; Enter sonraki, Shift+Enter önceki eşleşmeye gider. “Aa” büyük/küçük harfe duyarlı, “ab” yalnızca tam kelime arar; Türkçe İ/ı doğru eşleşir. Değiştir düğmesiyle tek tek veya **Tümünü değiştir** ile hepsini değiştirirsiniz (geri al ile dönülebilir). Arama açık bölümde (alt başlığa odaklandıysanız o alt başlıkta) yapılır.",
          en: "Yes. In the editor, **Ctrl+F** (⌘+F on Mac) or the magnifier in the toolbar opens the **Find and replace** bar. Matches are highlighted; Enter goes to the next, Shift+Enter to the previous. “Aa” matches case, “ab” matches whole words; Turkish İ/ı are handled correctly. Replace one at a time or use **Replace all** (undo works). The search covers the open section (or the subheading you are focused on).",
        },
      },
      {
        id: "otomatik-tamamlama",
        q: { tr: "Yazarken çıkan gri öneri nedir? Nasıl kapatırım?", en: "What is the grey suggestion while I type? How do I turn it off?" },
        a: {
          tr: "Otomatik tamamlamadır: paragrafın sonunda yazmayı bıraktığınızda cümlenizin olası devamını gri renkte önerir. **Tab** tümünü, **Ctrl/⌘ + →** bir kelimeyi kabul eder, **Esc** kapatır; telefonda öneriye dokunabilirsiniz. Öneriler sayı, yıl, kişi adı veya atıf içermez; yalnızca kendi düşüncenizi akademik dille sürdürmenize yardım eder. Aylık yapay zekâ hakkınızdan düşmez (günlük sınırı vardır). Araç çubuğundaki sihirli değnek düğmesiyle açıp kapatabilirsiniz.",
          en: "It is autocomplete: when you pause at the end of a paragraph, it suggests a possible continuation in grey. **Tab** accepts all of it, **Ctrl/⌘ + →** one word, **Esc** dismisses it; on phones you can tap the suggestion. Suggestions never contain numbers, years, names or citations; they only help you continue your own idea in academic language. They do not count towards your monthly AI allowance (there is a daily limit). Use the magic-wand button in the toolbar to turn it on or off.",
        },
      },
      {
        id: "danisman",
        q: { tr: "Danışmanımla nasıl paylaşırım? Danışmanımın hesap açması gerekir mi?", en: "How do I share with my advisor? Does my advisor need an account?" },
        a: {
          tr: "Çalışma alanında “Paylaş” (mobilde ⋯ menüsü) ile salt okunur bir bağlantı oluşturun; danışmanınızın hesap açması gerekmez. İsterseniz yorum yapmasına izin verirsiniz; yorumlar ilgili bölümde size görünür ve “Asistanla uygula” ile düzeltme önerisine dönüştürülebilir. Bağlantıya süre koyabilir veya istediğiniz an iptal edebilirsiniz.",
          en: "Create a read-only link with “Share” in the workspace (⋯ menu on mobile); your advisor does not need an account. You can allow comments; they appear in the relevant section and can be turned into a revision suggestion with “Apply with assistant”. You can set an expiry or revoke the link at any time.",
        },
      },
    ],
  },
  {
    id: "odeme",
    title: { tr: "Paketler ve ödeme", en: "Plans and payment" },
    items: [
      {
        id: "ucretsiz",
        q: { tr: "Ücretsiz kullanabilir miyim?", en: "Can I use it for free?" },
        a: {
          tr: "Evet, kredi kartı gerekmeden ücretsiz paketle başlarsınız. Ücretsiz pakette proje sayısı, kaynak tarama hakkı ve bazı araçlar sınırlıdır; paketlerin özelliklerini Fiyatlar sayfasında karşılaştırabilirsiniz. Davet programıyla ek kullanım hakkı da kazanabilirsiniz.",
          en: "Yes, you start with the free plan without a credit card. The free plan limits the number of projects, source searches and some tools; compare plan features on the Pricing page. You can also earn extra usage through the referral programme.",
        },
      },
      {
        id: "ne-kadar-yazabilirim",
        q: { tr: "Bir pakette ayda ne kadar yazabilirim?", en: "How much can I write per month on a plan?" },
        a: {
          tr: "Ücretsiz pakette 5 sayfalık deneme taslağı, **Basic’te ayda 25**, **Pro’da ayda 50**, **Premium’da ayda 85 sayfa** yapay zekâ destekli akademik metin yazabilirsiniz; bu sayılar paketinizin gerçek sınırıdır. Yapay zekânın yazdığı taslak kelimeleri sayılır (1 sayfa = 344 kelime: Türk tez biçimi, 12 punto, 1,5 satır aralığı). Kendi yazdığınız metin, soru-cevap, kısaltma ve üslup düzeltmesi sayfa hakkından düşmez; seçili metni yeniden yazdırdığınızda yalnızca eklenen kelimeler sayılır. Kalan hakkınızı Hesap sayfasında görürsünüz; sayfa hakkı dolunca, paketinizi yükseltene veya hakkınız yenilenene kadar çalışmalarınızı yalnızca görüntüleyip indirebilirsiniz. Örneğin bir yüksek lisans tezinin ana metni (yaklaşık 80 sayfa) Pro pakette 1–2 ayda yazılabilir.",
          en: "A 5-page trial draft on Free, **25 pages a month on Basic**, **50 on Pro** and **85 on Premium** of AI-assisted academic text; these numbers are your plan’s actual limit. The words of drafts written by the AI are counted (1 page = 344 words: Turkish thesis format, 12 pt, 1.5 line spacing). Text you write yourself, questions and answers, shortening and tone fixes do not use your page allowance; when you have selected text rewritten, only the added words count. You can see what is left on the Account page; once the page allowance is used up, you can only view and download your work until you upgrade or your allowance renews. For example, the main text of a master’s thesis (about 80 pages) can be written in 1–2 months on Pro.",
        },
      },
      {
        id: "limit",
        q: { tr: "Aylık limitim dolarsa ne olur? Çalışmalarım silinir mi?", en: "What happens if I hit my monthly limit? Is my work deleted?" },
        a: {
          tr: "Hiçbir çalışmanız silinmez. Aylık sayfa veya yapay zekâ hakkınız dolduğunda, paketinizi yükseltene veya yeni ayda hakkınız yenilenene kadar çalışmalarınızı ve kaynaklarınızı yalnızca görüntüleyebilir ve paketinizin izin verdiği biçimlerde ücretsiz indirebilirsiniz; elle düzenleme dâhil diğer özellikler kapanır. Ücretsiz araçlar her zaman açıktır. Yalnızca kaynak tarama hakkınız dolarsa sadece tarama durur. Hakkınızın sonuna yaklaşınca önceden uyarılırsınız.",
          en: "None of your work is ever deleted. When your monthly page or AI allowance runs out, you can only view your work and sources and download them free of charge in the formats your plan allows until you upgrade or your allowance renews next month; all other features, including editing by hand, are closed. The free tools always stay open. If only your source search allowance runs out, only searching stops. You are warned when you are close to the limit.",
        },
      },
      {
        id: "tek-proje",
        q: { tr: "Sınırsız Kullanım paketi nedir? (eski adı Tek Proje)", en: "What is the Unlimited plan? (formerly Single Project)" },
        a: {
          tr: "**Sınırsız Kullanım** en üst paketimizdir: tek sınırı proje sayısıdır: **aylık ödemede en fazla 5, yıllık ödemede en fazla 60 aktif proje**; geri kalan her şey sınırsızdır: yapay zekâ kullanımı, sayfa yazımı, kaynak taraması, depolama ve Premium dâhil tüm özellikler, ortak yazarlarla birlikte yazım da. Aylık ödemede 1 ay, yıllık ödemede (%20 indirimli) 1 yıl geçerlidir; kendiliğinden yenilenmez, süre bitince Ücretsiz pakete geçersiniz ve çalışmalarınız silinmez. “Sınırsız”, bir kişinin kendi akademik çalışmaları için olağan kullanımı anlamına gelir; hesabı paylaşmak veya başkaları adına toplu üretim yapmak adil kullanım kurallarına aykırıdır. Daha önce “Tek Proje” paketini süresiz olarak alanların koşulları değişmez.",
          en: "**Unlimited** is our top plan: its only limit is the number of projects: **at most 5 active projects with monthly payment and 60 with annual payment**; everything else is unlimited: AI use, page drafting, source searches, storage and every feature including Premium, plus co-writing with co-authors. It is valid for 1 month with monthly payment and 1 year with annual payment (20% off); it does not renew automatically, you move to the Free plan when it ends, and your work is not deleted. “Unlimited” means one person’s ordinary use for their own academic work; sharing the account or mass production on behalf of others breaks the fair use rules. Those who bought the earlier open-ended “Single Project” plan keep their terms.",
        },
      },
      {
        id: "silme-hak",
        q: { tr: "Yazdırdığım metni silersem hakkım geri gelir mi?", en: "If I delete generated text, is my allowance restored?" },
        a: {
          tr: "Hayır. Paket hakkı, yapay zekâ metni ürettiği anda kullanılmış olur; metni, bölümü veya çalışmayı sonradan silmek kullanılan hakkı geri vermez. Anlaşmazlıkların çözümü için aldığınız çıktıların ve silmelerin kaydı **12 ay** saklanır (yalnızca yetkili yöneticiler görür, hesabınızla birlikte silinir).",
          en: "No. Your allowance is used when the AI generates the text; deleting the text, a section or the whole work later does not restore it. To resolve disputes, a record of your outputs and deletions is kept for **12 months** (visible only to authorised administrators, deleted with your account).",
        },
      },
      {
        id: "yukseltme",
        q: { tr: "Paketimi nasıl yükseltirim? Ödemeyi nasıl yaparım?", en: "How do I upgrade and pay?" },
        a: {
          tr: "Hesap ve abonelik sayfasında istediğiniz paketin altındaki “Yükselt” düğmesine basın. Mevcut paketinizi ve seçtiğiniz paketi içeren hazır bir WhatsApp mesajı açılır; mesajı gönderdiğinizde ödeme ayrıntıları size iletilir ve ödemeniz alındıktan sonra paketiniz hesabınıza tanımlanır. Kart bilgilerinizi sitemize girmezsiniz.",
          en: "On the Account page, press “Upgrade” under the plan you want. A ready-made WhatsApp message with your current and chosen plan opens; once you send it, we share the payment details and your plan is activated on your account after payment. You never enter card details on our site.",
        },
      },
      {
        id: "yillik",
        q: { tr: "Yıllık ödeme seçeneği var mı? Haklarım nasıl işler?", en: "Is there an annual payment option? How do my allowances work?" },
        a: {
          tr: "Evet. Basic, Pro, Premium ve Sınırsız Kullanım paketlerinde yıllık ödemede **güncel fiyata %20 indirim** uygulanır; fiyatlar sayfasında hem aylık karşılığı hem yıllık toplam tutarı görürsünüz. Kullanım hakları azalmaz: **aylık hakların 12 katı** (sayfa, yapay zekâ isteği, kaynak taraması) paket başında tek seferde tanımlanır ve 1 yıl içinde dilediğiniz gibi kullanılır; aylık bir kısıt yoktur. Yıllık indirim, indirim kodu veya Akademik Ekip İndirimi ile birleştirilmez. Sınırsız Kullanım paketinin de yıllık seçeneği vardır.",
          en: "Yes. On Basic, Pro, Premium and Unlimited, annual payment gets **20% off the current price**; the pricing page shows both the monthly equivalent and the annual total. Your allowances are not reduced: **12 times the monthly allowances** (pages, AI requests, source searches) are granted at the start of the plan and can be used however you like within the year, with no monthly cap. The annual discount cannot be combined with a discount code or the Academic Team Discount. The Unlimited plan has an annual option too.",
        },
      },
      {
        id: "iptal",
        q: { tr: "Taahhüt var mı? Paketimi nasıl iptal ederim?", en: "Is there a commitment? How do I cancel?" },
        a: {
          tr: "Taahhüt yoktur. İptal veya paket değişikliği için WhatsApp üzerinden yazmanız yeterli. İptal ettiğinizde ödediğiniz dönemin sonuna kadar paketiniz devam eder, sonra ücretsiz pakete geçersiniz; çalışmalarınız silinmez.",
          en: "There is no commitment. To cancel or change your plan, just message us on WhatsApp. Your plan stays active until the end of the paid period, then you move to the free plan; your work is not deleted.",
        },
      },
      {
        id: "ekip",
        q: { tr: "Akademisyen grupları veya araştırma ekipleri için indirim var mı?", en: "Is there a discount for academic teams or research groups?" },
        a: {
          tr: "Evet. Akademik Ekip İndirimi ile akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler en az 3 kişilik ekiplerde tüm ücretli paketlerde %20 indirim alır. Ekibe katılabilecek kişi sayısında üst sınır yoktur. Fiyatlar sayfasındaki “WhatsApp’tan bilgi al” bağlantısıyla bize ulaşabilirsiniz.",
          en: "Yes. With the Academic Team Discount, faculty groups, research teams, labs and departments get 20% off all paid plans for teams of at least 3 people. There is no upper limit on team size. Contact us via the “Ask on WhatsApp” link on the Pricing page.",
        },
      },
      {
        id: "kurum",
        q: { tr: "Üniversitem veya enstitüm için toplu lisans alınabilir mi?", en: "Can my university or institute get a group licence?" },
        a: {
          tr: "Evet. Kurum lisansında belirlenen sayıda kullanıcı tek faturayla üst pakete geçer; öğrenciler kurum koduyla katılır. Kurum yöneticisi yalnızca kullanım sayılarını görür, öğrencilerin çalışmalarını göremez. Ayrıntılar ve teklif için “Kurumlar için” sayfasına bakın.",
          en: "Yes. With an institutional licence a set number of users move to a higher plan on a single invoice; students join with an institution code. The institution admin sees only usage counts, not students’ work. See the “For institutions” page for details and a quote.",
        },
      },
      {
        id: "iade",
        q: { tr: "Memnun kalmazsam iade alabilir miyim?", en: "Can I get a refund if I’m not satisfied?" },
        a: {
          tr: "Ödeme veya iade talepleriniz için Geri bildirim ya da iletişim adresimiz üzerinden yazın; talebiniz Kullanım koşulları ve ilgili mevzuat çerçevesinde değerlendirilir. Satın almadan önce ücretsiz paketle platformu denemenizi öneririz.",
          en: "Write to us via Feedback or our contact address for payment or refund requests; they are assessed under the Terms of use and applicable law. We recommend trying the platform with the free plan before purchasing.",
        },
      },
    ],
  },
  {
    id: "teknik",
    title: { tr: "Kullanım ve teknik", en: "Usage and technical" },
    items: [
      {
        id: "telefon",
        q: { tr: "Telefondan veya tabletten kullanabilir miyim?", en: "Can I use it on a phone or tablet?" },
        a: {
          tr: "Evet. Site telefona göre düzenlenmiştir: alttaki çubukla Bölümler, Metin, Asistan ve Kaynaklar arasında geçersiniz; asistandaki mikrofon (“Sesle yaz”) düğmesiyle konuşarak not alabilir, sonra asistandan bunu akademik paragrafa çevirmesini isteyebilirsiniz. Siteyi uygulama gibi de kurabilirsiniz: Android’de menüdeki “Uygulamayı yükle”ye, iPhone’da Safari’de Paylaş → “Ana Ekrana Ekle”ye dokunun; simgesi ana ekranınıza gelir ve tam ekran açılır. Uzun yazım ve son biçim kontrolü için bilgisayar daha rahattır.",
          en: "Yes. The site is designed for phones: the bottom bar switches between Sections, Text, Assistant and Sources, and with dictation you can speak notes and have them turned into academic paragraphs. You can also install it like an app: on Android tap “Install app” in the menu; on iPhone, in Safari tap Share → “Add to Home Screen”. Its icon appears on your home screen and it opens full screen. A computer is more comfortable for long writing and final formatting.",
        },
      },
      {
        id: "kayit",
        q: { tr: "İnternetim kesilirse yazdıklarım kaybolur mu?", en: "Will I lose my writing if my connection drops?" },
        a: {
          tr: "Hayır. Yazdıklarınız otomatik kaydedilir; bağlantı koparsa cihazınızda saklanır ve bağlantı gelince sunucuya kaydedilir (ekranın üstünde “Çevrimdışı” uyarısı görürsünüz). Sayfayı yenileseniz bile kaydedilmemiş metin geri yüklenir.",
          en: "No. Your writing is saved automatically; if the connection drops it is kept on your device and saved to the server when you are back online (you’ll see an “Offline” notice at the top). Even if you reload the page, unsaved text is restored.",
        },
      },
      {
        id: "surum",
        q: { tr: "Yanlışlıkla bir şeyi sildim veya asistanın eklediği metni beğenmedim. Geri alabilir miyim?", en: "I deleted something by mistake or didn’t like the assistant’s text. Can I undo?" },
        a: {
          tr: "Evet. Asistandan her ekleme öncesindeki hâl ve elle kaydettiğiniz sürümler “Geçmiş” sekmesinde saklanır; istediğiniz sürüme tek tıkla dönebilirsiniz. Anlık değişiklikler için araç çubuğundaki “Geri al” da kullanılabilir.",
          en: "Yes. The state before each assistant insertion and the versions you save manually are kept in the “History” tab; you can restore any version with one click. For recent edits, use “Undo” in the toolbar.",
        },
      },
      {
        id: "yavas",
        q: { tr: "Asistan bazen neden yavaş yanıt veriyor?", en: "Why is the assistant sometimes slow?" },
        a: {
          tr: "Bir bölüm yazarken asistan önce kaynak gerekip gerekmediğine karar verir, gerekirse veri tabanlarında arar, bulduğu kaynakları doğrular ve açık erişimli tam metinleri okur; sonra yazar. Bu adımlar kaliteyi ve doğruluğu artırır ama 1–2 dakika sürebilir. Hangi adımda olduğu ekranda ilerleme çubuğuyla gösterilir.",
          en: "When writing a section, the assistant first decides whether sources are needed, searches databases if so, verifies the sources and reads open-access full texts, then writes. These steps improve quality and accuracy but can take 1–2 minutes. The current step is shown with a progress bar.",
        },
      },
      {
        id: "geri-bildirim",
        q: { tr: "Bir hata buldum veya önerim var. Nereye yazabilirim?", en: "I found a bug or have a suggestion. Where can I write?" },
        a: {
          tr: "Giriş yaptıktan sonra sol menüdeki “Geri bildirim” ile yazabilirsiniz; tüm mesajlar okunur. Hatayı anlatırken hangi sayfada ne yaptığınızı yazmanız ve mümkünse ekran görüntüsü eklemeniz çözümü hızlandırır.",
          en: "After signing in, use “Feedback” in the left menu; every message is read. Describing which page you were on and what you did, ideally with a screenshot, speeds up the fix.",
        },
      },
    ],
  },
];

/** Ana sayfada gösterilecek en kritik sorular */
export const FAQ_HIGHLIGHTS = ["uydurur-mu", "dogrula", "tamamen-yazar-mi", "ozgun-mu", "kim-gorur", "egitim", "benzerlik", "ucretsiz", "iptal"];

/** Sorunun seçilen dildeki metni (Almanca: faq-de.ts; yoksa İngilizce) */
export function faqQ(i: FaqItem, l: Locale) {
  return l === "de" ? FAQ_DE[i.id]?.q ?? i.q.en : i.q[l];
}
export function faqA(i: FaqItem, l: Locale) {
  return l === "de" ? FAQ_DE[i.id]?.a ?? i.a.en : i.a[l];
}
export function faqGroupTitle(g: FaqGroup, l: Locale) {
  return l === "de" ? FAQ_GROUP_DE[g.id] ?? g.title.en : g.title[l];
}

export function faqText(l: Locale) {
  return FAQ.flatMap((g) => g.items).map((i) => ({ id: i.id, q: faqQ(i, l), a: faqA(i, l) }));
}
