/**
 * Sık sorulan sorular (TR/EN). Cevaplar platformun gerçek davranışını anlatır; özellik değişince burası da güncellenmelidir.
 * Kısa biçimlendirme: **kalın**, satır sonu ile paragraf.
 */
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
          tr: "Lisans bitirme projesi ve ödev yazan öğrenciler, yüksek lisans ve doktora öğrencileri, dergiye makale hazırlayan araştırmacılar ve akademisyenler için. Türkçe ve İngilizce çalışmaları destekler; Türk üniversitelerinin tez düzenine ve YÖK tez künyesine özel ayarları vardır.",
          en: "Undergraduate students writing capstone projects, master’s and doctoral students, and researchers or academics preparing journal articles. It supports Turkish and English work and has settings specific to Turkish university thesis formats.",
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
          tr: "OpenAlex, Crossref, Semantic Scholar, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE ve diğer açık akademik veri tabanlarından; ayrıca Türkçe ve Türkiye adresli yayınlar (DergiPark dergileri dahil) ayrıca aranabilir. TR Dizin ve YÖK Ulusal Tez Merkezi’nde aynı sorguyla arama yapmak için bağlantılar vardır. Kendi kaynaklarınızı da DOI ile, elle, PDF yükleyerek veya Zotero/Mendeley/EndNote dosyasıyla ekleyebilirsiniz.",
          en: "From OpenAlex, Crossref, Semantic Scholar, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE and other open academic databases; Turkish-language and Turkey-affiliated publications (including DergiPark journals) can also be searched. There are links to run the same search in TR Dizin and the YÖK National Thesis Center. You can add your own sources by DOI, manually, by uploading a PDF or from a Zotero/Mendeley/EndNote file.",
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
          tr: "Metindeki atfa tıklayın ve **Kaynakta doğrula**’yı seçin. Sistem kaynağın okunmuş metninde ilgili bölümleri bulur, sayfasıyla gösterir ve cümlenin kaynak tarafından desteklenip desteklenmediğini değerlendirir (destekliyor / kısmen / desteklemiyor / karar için yeterli metin yok). Gösterilen alıntı kaynak metninde birebir aranır; bulunamazsa gösterilmez. Son karar sizindir.",
          en: "Click the citation in the text and choose **Check in source**. The system finds the relevant passages in the source’s read text, shows them with page numbers and assesses whether the sentence is supported (supports / partially / does not support / not enough text). The quote shown is matched verbatim against the source text and hidden if not found. The final decision is yours.",
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
          tr: "APA 7, APA 6, MLA 9, Chicago (yazar-tarih), Turabian, Harvard, Vancouver, IEEE ve AMA. İstediğiniz an değiştirebilirsiniz: atıflar metne yazı olarak değil kaynağa bağlı öğe olarak eklendiği için tüm metin içi atıflar ve kaynakça anında yeni stile dönüşür. Kaynakça yalnızca metinde atıf yapılan kaynaklardan otomatik oluşur.",
          en: "APA 7, APA 6, MLA 9, Chicago (author-date), Turabian, Harvard, Vancouver, IEEE and AMA. You can switch at any time: citations are inserted as elements linked to the source, not as plain text, so all in-text citations and the reference list switch instantly. The reference list is built automatically from the sources cited in the text.",
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
          tr: "Asistan hiçbir veri, sayı veya bulgu uydurmaz. Kendi verinizi (CSV veya Excel) yüklerseniz **İstatistik analizi** ile t testi, ANOVA, korelasyon, regresyon, ki-kare, Cronbach alfa, Mann-Whitney ve Kruskal-Wallis analizleri sunucuda gerçek hesaplamayla (SPSS ile aynı formüllerle) yapılır; sonuç APA 7 biçiminde tablo ve cümle olarak belgeye eklenir. Asistan bu gerçek sonuçları yorumlamanıza yardım eder. Analiz seçiminden emin değilseniz uzman desteği alabilirsiniz.",
          en: "The assistant never fabricates data, numbers or findings. If you upload your own data (CSV or Excel), **Statistical analysis** runs t-tests, ANOVA, correlation, regression, chi-square, Cronbach’s alpha, Mann-Whitney and Kruskal-Wallis with real calculations on the server (same formulas as SPSS), and inserts the result as an APA 7 table and sentence. The assistant then helps you interpret these real results. If you are unsure which analysis to choose, you can get expert support.",
        },
      },
      {
        id: "dil",
        q: { tr: "İngilizce tez veya makale yazabilir miyim?", en: "Can I write in English?" },
        a: {
          tr: "Evet. Her çalışmanın dili ayrı seçilir (Türkçe veya İngilizce); asistan o dilde yazar, atıf terimleri (vd./et al., s./p.) dile göre ayarlanır. Türkçe çalışmalar için “Özet ve Abstract” özelliği Türkçe özetin akademik İngilizce karşılığını hazırlar. Arayüz de Türkçe ve İngilizce kullanılabilir.",
          en: "Yes. Each work has its own language (Turkish or English); the assistant writes in that language and citation terms (vd./et al., s./p.) adapt. For Turkish works, “Turkish & English abstract” prepares the academic English version of the abstract. The interface is available in Turkish and English too.",
        },
      },
    ],
  },
  {
    id: "intihal",
    title: { tr: "İntihal ve yapay zekâ tespiti", en: "Plagiarism and AI detection" },
    items: [
      {
        id: "intihal-orani",
        q: { tr: "İntihal oranı gösteriyor musunuz?", en: "Do you show a plagiarism score?" },
        a: {
          tr: "Hayır. Gerçek bir benzerlik oranı ancak Turnitin veya iThenticate gibi lisanslı ve büyük yayın arşivine sahip servislerle hesaplanabilir; bu servislerle entegrasyonumuz olmadığı için sahte bir oran göstermiyoruz. Üniversitenizin sağladığı intihal programını teslimden önce mutlaka kullanın.",
          en: "No. A real similarity score can only be calculated with licensed services that have large publication archives, such as Turnitin or iThenticate; since we are not integrated with them, we do not show a fake score. Always run your university’s plagiarism software before submission.",
        },
      },
      {
        id: "ai-tespit",
        q: { tr: "Turnitin veya yapay zekâ tespit araçlarından geçer mi?", en: "Will it pass Turnitin or AI detectors?" },
        a: {
          tr: "Bunu vaat etmiyoruz ve tespit araçlarını atlatmaya yönelik bir özellik geliştirmiyoruz. Asistanın yazdığı taslaklar yapay zekâ tespit araçlarında işaretlenebilir; bu araçların insan yazısını da yanlışlıkla işaretleyebildiği biliniyor. En sağlıklı yol: taslakları kendi düşüncenizle yeniden yazmak ve geliştirmek, kurumunuz istiyorsa yapay zekâ kullanımını beyan etmek ve çalışmanızın sürüm geçmişini saklamak. Platform; kaynak bulma, yapı kurma, atıf ve biçim gibi işlerde size zaman kazandırmak için vardır.",
          en: "We do not promise this, and we do not build features to evade detectors. Assistant drafts may be flagged by AI detectors, which are also known to flag human writing by mistake. The healthiest approach: rewrite and develop the drafts with your own thinking, disclose AI use if your institution requires it, and keep your work’s version history. The platform exists to save you time on finding sources, building structure, citations and formatting.",
        },
      },
      {
        id: "ozgun",
        q: { tr: "Asistanın yazdığı metin başka kullanıcılarda da çıkar mı?", en: "Could the same text appear for other users?" },
        a: {
          tr: "Her yanıt sizin projenizin bağlamı, kaynaklarınız ve isteğinizle o an üretilir; başka kullanıcılara verilen metinlerden kopyalanmaz ve sizin metniniz kimseyle paylaşılmaz. Yine de yaygın akademik kalıp ifadeler benzerlik programlarında eşleşebilir; teslimden önce benzerlik kontrolü yapın.",
          en: "Each response is generated at that moment from your project’s context, your sources and your request; it is not copied from text given to other users, and your text is not shared with anyone. Common academic phrases may still match in similarity checkers, so run a similarity check before submission.",
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
        id: "limit",
        q: { tr: "Aylık limitim dolarsa ne olur? Çalışmalarım silinir mi?", en: "What happens if I hit my monthly limit? Is my work deleted?" },
        a: {
          tr: "Hiçbir çalışmanız silinmez. Ancak aylık haklarınızdan biri (yapay zekâ kullanımı veya kaynak tarama) dolduğunda çalışmalarınız ve kaynaklarınız kilitlenir: metin ve kaynaklar buğulu görünür, düzenleme ve indirme kapanır. Hakkınızın sonuna yaklaşınca önceden uyarılırsınız. Devam etmek için paketinizi yükseltebilir, yalnızca mevcut çalışmanızı 100 TL karşılığında bir kez indirebilir veya yeni ayda hakkınızın yenilenmesini bekleyebilirsiniz. Kişisel verilerinize erişim talebiniz (KVKK) her durumda ücretsiz olarak yanıtlanır.",
          en: "None of your work is deleted. However, when one of your monthly allowances (AI usage or source searches) runs out, your work and sources are locked: text and sources are blurred, and editing and downloading are disabled. You are warned when you are close to the limit. To continue you can upgrade, download just your current work once for 100 TL, or wait for your allowance to renew next month. Requests to access your personal data (GDPR/KVKK) are always answered free of charge.",
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
          tr: "Evet. Akademik Ekip İndirimi ile akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler en az 3 kişilik ekiplerde tüm ücretli paketlerde %20 indirim alır. Fiyatlar sayfasındaki “WhatsApp’tan bilgi al” bağlantısıyla bize ulaşabilirsiniz.",
          en: "Yes. With the Academic Team Discount, faculty groups, research teams, labs and departments get 20% off all paid plans for teams of at least 3 people. Contact us via the “Ask on WhatsApp” link on the Pricing page.",
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
        id: "uzman",
        q: { tr: "Yapay zekâ yetmediğinde bir insandan yardım alabilir miyim?", en: "Can I get help from a person when AI isn’t enough?" },
        a: {
          tr: "Evet. Akademik dil ve redaksiyon, istatistik danışmanlığı, çeviri ve biçim kontrolü için iş ortağımız dermanlik.com.tr üzerinden uzman desteği alabilirsiniz (“Uzman desteği” sayfası). Bu hizmetler metninizin düzeltilmesi ve danışmanlık içindir; çalışmanın başkası tarafından yazılması kurumların etik kurallarına aykırıdır.",
          en: "Yes. For academic editing, statistics consulting, translation and formatting checks you can get expert support through our partner dermanlik.com.tr (see the “Expert support” page). These services are for editing and consulting; having your work written by someone else violates institutions’ ethical rules.",
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
export const FAQ_HIGHLIGHTS = ["uydurur-mu", "tamamen-yazar-mi", "ai-tespit", "kim-gorur", "egitim", "intihal-orani", "ucretsiz", "iptal"];

export function faqText(l: "tr" | "en") {
  return FAQ.flatMap((g) => g.items).map((i) => ({ id: i.id, q: i.q[l], a: i.a[l] }));
}
