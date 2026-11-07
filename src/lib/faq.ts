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
          tr: "OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE ve diğer açık akademik veri tabanlarından; ayrıca Türkçe ve Türkiye adresli yayınlar (DergiPark dergileri dahil) ayrıca aranabilir. TR Dizin ve YÖK Ulusal Tez Merkezi’nde aynı sorguyla arama yapmak için bağlantılar vardır. Kendi kaynaklarınızı da DOI ile, elle, PDF yükleyerek veya Zotero/Mendeley/EndNote dosyasıyla ekleyebilirsiniz.",
          en: "From OpenAlex, Crossref, PubMed/Europe PMC, arXiv, DOAJ, OpenAIRE and other open academic databases; Turkish-language and Turkey-affiliated publications (including DergiPark journals) can also be searched. There are links to run the same search in TR Dizin and the YÖK National Thesis Center. You can add your own sources by DOI, manually, by uploading a PDF or from a Zotero/Mendeley/EndNote file.",
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
          tr: "Bölümün tamamı için bölüm başlığının yanındaki **İddia denetimi** düğmesini (veya Araçlar → İddia denetimi) kullanın: atıflı her cümle, atıf yaptığı kaynağın okunan metniyle karşılaştırılır; sonuç (destekleniyor / kısmen / desteklenmiyor / okunamadı) dayanak pasajı ve sayfasıyla listelenir, sorunlu cümleler metinde renkli altı çizili gösterilir ve tek tıkla asistanla düzeltilebilir. Atıfsız kesin ifadeler de işaretlenir. Tek bir atıf için metindeki atfa tıklayıp **Kaynakta doğrula**’yı seçin. Sistem kaynağın okunmuş metninde ilgili bölümleri bulur, sayfasıyla gösterir ve cümlenin kaynak tarafından desteklenip desteklenmediğini değerlendirir (destekliyor / kısmen / desteklemiyor / karar için yeterli metin yok). Gösterilen alıntı kaynak metninde birebir aranır; bulunamazsa gösterilmez. Son karar sizindir.",
          en: "For a whole section use the **Claim audit** button next to the section title (or Tools → Claim audit): every cited sentence is compared with the text read from its source; the result (supported / partly / not supported / not readable) is listed with the supporting passage and page, problem sentences are underlined in the text and can be fixed with the assistant in one click. Uncited strong statements are flagged too. For a single citation, click it in the text and choose **Check in source**. The system finds the relevant passages in the source’s read text, shows them with page numbers and assesses whether the sentence is supported (supports / partially / does not support / not enough text). The quote shown is matched verbatim against the source text and hidden if not found. The final decision is yours.",
        },
      },
      {
        id: "prisma",
        q: { tr: "Sistematik derleme (PRISMA) yapabilir miyim?", en: "Can I do a systematic review (PRISMA)?" },
        a: {
          tr: "Evet, Pro ve üstü paketlerde (Premium, Tek Proje). Araçlar → **Sistematik derleme (PRISMA)**: protokolünüzü (soru, dahil etme ve hariç tutma ölçütleri) yazarsınız; kayıtları Academiana araması veya Scopus, Web of Science, PubMed gibi veri tabanlarından RIS/BibTeX içe aktararak toplarsınız (yinelenenler otomatik ayrılır). Başlık/özet taramasında yapay zekâ yalnızca öneri verir, kararı ve gerekçeyi siz seçersiniz. Tam metin uygunluğundan sonra PRISMA 2020 akış şeması sayılarla otomatik çizilir; belgeye şekil olarak ekleyebilir, kayıtları CSV indirebilir, dahil edilen çalışmaları tek tıkla kaynaklarınıza ekleyebilirsiniz.",
          en: "Yes, on Pro and higher plans (Premium, Single Project). Tools → **Systematic review (PRISMA)**: write your protocol (question, inclusion and exclusion criteria); collect records with Academiana search or by importing RIS/BibTeX from databases such as Scopus, Web of Science or PubMed (duplicates are separated automatically). In title/abstract screening the AI only suggests; you choose the decision and the reason. After full-text eligibility, the PRISMA 2020 flow diagram is drawn automatically with the counts; you can insert it as a figure, download the records as CSV and add the included studies to your sources in one click.",
        },
      },
      {
        id: "harita",
        q: { tr: "Literatür haritası ne işe yarar?", en: "What is the literature map for?" },
        a: {
          tr: "Araçlar → **Literatür haritası**, çalışmanızdaki kaynakların birbirine atıf ilişkilerini OpenAlex kaynakça kayıtlarından bir ağ olarak gösterir; merkezi kaynakları ve bağlantısız kalanları görürsünüz. Ayrıca kaynaklarınızdan en az ikisinin atıf yaptığı ama sizin çalışmanızda olmayan yayınları “eksik olabilecek temel çalışmalar” olarak önerir; okuyup uygunsa tek tıkla eklersiniz. DOI’si olan kaynaklar haritaya girer. Pro ve üstü paketlerde kullanılabilir.",
          en: "Tools → **Literature map** shows how the sources in your work cite each other, built from OpenAlex reference lists; you see central sources and isolated ones. It also suggests publications that at least two of your sources cite but that are not in your work, as possibly missing key studies; read them and add in one click if relevant. Sources with a DOI are included in the map. Available on Pro and higher plans.",
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
        q: { tr: "İngilizce tez veya makale yazabilir miyim?", en: "Can I write in English?" },
        a: {
          tr: "Evet. Her çalışmanın dili ayrı seçilir (Türkçe veya İngilizce); asistan o dilde yazar, atıf terimleri (vd./et al., s./p.) dile göre ayarlanır. Türkçe çalışmalar için “Özet ve Abstract” özelliği Türkçe özetin akademik İngilizce karşılığını hazırlar. Arayüz de Türkçe ve İngilizce kullanılabilir.",
          en: "Yes. Each work has its own language (Turkish or English); the assistant writes in that language and citation terms (vd./et al., s./p.) adapt. For Turkish works, “Turkish & English abstract” prepares the academic English version of the abstract. The interface is available in Turkish and English too.",
        },
      },
      {
        id: "ceviri",
        q: { tr: "Türkçe metnimi akademik İngilizceye çevirebilir miyim? Atıflarım bozulur mu?", en: "Can I translate my Turkish text into academic English? Will my citations break?" },
        a: {
          tr: "Evet. Çalışma alanında **Araçlar → Dil ve çeviri** (veya metni seçince çıkan balondaki **Çevir**) bir bölümü, alt başlığı ya da seçili metni Türkçe ↔ İngilizce akademik dile çevirir. Atıflar, dipnotlar, şekiller, tablolar ve başlık düzeyleri olduğu gibi korunur; ondalık ve istatistik gösterimi (Ort./SS ↔ M/SD) hedef dile uyarlanır, sayılar değişmez. Amerikan veya İngiliz İngilizcesi seçilebilir. **Terim sözlüğü** alanınıza özgü karşılıkları (ör. öz yeterlik → self-efficacy) her çeviride aynı tutar. Çeviri öncesi hâl sürüm geçmişinde saklanır. **Dil denetimi** sekmesi de yazım, dil bilgisi, noktalama ve akademik üslup hatalarını tek tek önerir; isterseniz tek tıkla uygularsınız. Çeviri ve denetim aylık yapay zekâ hakkından düşer.",
          en: "Yes. In the workspace, **Tools → Language & translation** (or **Translate** in the bubble that appears when you select text) translates a section, a subheading or a selection between Turkish and academic English. Citations, footnotes, figures, tables and heading levels are preserved; decimal and statistical notation (Ort./SS ↔ M/SD) is adapted, numbers never change. You can choose American or British English. The **Glossary** keeps your field’s equivalents (e.g. öz yeterlik → self-efficacy) consistent. The pre-translation version is kept in the history. The **Language check** tab suggests spelling, grammar, punctuation and academic tone fixes one by one, which you can apply in one click. Translation and checks count towards your monthly AI allowance.",
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
          tr: "Evet. Çalışma alanının üst çubuğundaki **Ortak yazarlar** düğmesiyle en fazla 5 kişiyi e-posta adresiyle davet edersiniz (Pro, Premium ve Tek Proje paketlerinde). **Ortak yazar** bölümleri yazar, kaynak ekler ve yapay zekâyı kendi paketiyle kullanır; **yorumcu** yalnızca okur ve yorum yazar. Kimin hangi bölümde olduğu adıyla görünür. İki kişi aynı bölümü aynı anda kaydederse hangi sürümle devam edileceği sorulur; diğer sürüm silinmez, sürüm geçmişinde saklanır. Ortak yazarın dosyaları ve asistan sohbetleri kendisine özeldir. Davet edilen kişinin ücretli pakete ihtiyacı yoktur; ücretsiz hesapla katılabilir.",
          en: "Yes. With the **Co-authors** button in the workspace’s top bar you invite up to 5 people by email (on Pro, Premium and Single Project). A **co-author** writes sections, adds sources and uses AI with their own plan; a **commenter** only reads and comments. You can see who is in which section. If two people save the same section at once, you are asked which version to keep; the other is not deleted but kept in the version history. A co-author’s files and assistant chats stay private. Invitees do not need a paid plan; they can join with a free account.",
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
          tr: "Yaklaşık olarak Ücretsiz pakette 5 sayfalık deneme taslağı, **Basic’te ayda 25**, **Pro’da ayda 50**, **Premium’da ayda 85 sayfa** yapay zekâ destekli akademik metin yazabilirsiniz. Sayfa, Türk tez biçiminde (12 punto, 1,5 satır aralığı) ana metin sayfasıdır; kapak, içindekiler, kaynakça ve ekler sayılmaz. Taslakları sık yeniden yazdırırsanız daha az, verimli kullanırsanız daha fazla sayfa çıkar. Örneğin bir yüksek lisans tezinin ana metni (yaklaşık 80 sayfa) Pro pakette 1–2 ayda yazılabilir.",
          en: "Roughly: a 5-page trial draft on Free, **25 pages a month on Basic**, **50 on Pro** and **85 on Premium** of AI-assisted academic text. A page is a main-text page in Turkish thesis format (12 pt, 1.5 line spacing); cover, table of contents, references and appendices are not counted. Frequent regeneration of drafts gives fewer pages, efficient use gives more. For example, the main text of a master’s thesis (about 80 pages) can be written in 1–2 months on Pro.",
        },
      },
      {
        id: "limit",
        q: { tr: "Aylık limitim dolarsa ne olur? Çalışmalarım silinir mi?", en: "What happens if I hit my monthly limit? Is my work deleted?" },
        a: {
          tr: "Hiçbir çalışmanız silinmez ve kilitlenmez. Aylık haklarınızdan biri (yapay zekâ kullanımı veya kaynak tarama) dolduğunda yalnızca o özellik durur; çalışmalarınızı ve kaynaklarınızı görüntülemeye, elle düzenlemeye ve paketinizin izin verdiği biçimlerde indirmeye her zaman devam edebilirsiniz. Hakkınızın sonuna yaklaşınca önceden uyarılırsınız. Yapay zekâyı kullanmaya devam etmek için paketinizi yükseltebilir veya yeni ayda hakkınızın yenilenmesini bekleyebilirsiniz.",
          en: "None of your work is ever deleted or locked. When one of your monthly allowances (AI usage or source searches) runs out, only that feature stops; you can always keep viewing, editing by hand and downloading your work and sources in the formats your plan allows. You are warned when you are close to the limit. To keep using AI you can upgrade or wait for your allowance to renew next month.",
        },
      },
      {
        id: "tek-proje",
        q: { tr: "Tek Proje paketi nedir?", en: "What is the Single Project plan?" },
        a: {
          tr: "**Tek seferlik 3.999 TL** ödemeyle tek bir çalışmanızı (tez, makale, proje önerisi…) süre sınırı olmadan, tüm özelliklerle ve sınırsız yapay zekâ kullanımıyla yazarsınız. Paket yalnızca bir çalışma içindir: pakete bağlı çalışma silinemez, türü değiştirilemez ve ikinci bir çalışma açılamaz. Sınırsızlık bu çalışma içindir; çalışma dışındaki anket yardımcısı ve konu bulma ayda Ücretsiz paket kadardır. Çalışmayı bitirip silerek veya üzerine yazarak başka bir çalışma yazmak ve hesabı paylaşmak paket kurallarına aykırıdır; bu tür kullanım tespit edilip bir yönetici tarafından incelenir (bkz. Kullanım koşulları → Adil kullanım).",
          en: "With a **one-time payment of 3,999 TL** you write a single work (thesis, article, proposal…) with no time limit, all features and unlimited AI use. The plan covers one work only: the linked work cannot be deleted or change type, and a second work cannot be created. Unlimited use applies to that work; the survey assistant and topic finder outside it are limited to the Free plan allowance each month. Finishing a work and deleting or overwriting it to write another, or sharing the account, breaks the plan rules; such use is detected and reviewed by an administrator (see Terms of use → Fair use).",
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
          tr: "Evet. Akademik Ekip İndirimi ile akademisyen grupları, araştırma ekipleri, laboratuvarlar ve bölümler en az 3 kişilik ekiplerde tüm ücretli paketlerde %30 indirim alır. Ekibe katılabilecek kişi sayısında üst sınır yoktur. Fiyatlar sayfasındaki “WhatsApp’tan bilgi al” bağlantısıyla bize ulaşabilirsiniz.",
          en: "Yes. With the Academic Team Discount, faculty groups, research teams, labs and departments get 30% off all paid plans for teams of at least 3 people. There is no upper limit on team size. Contact us via the “Ask on WhatsApp” link on the Pricing page.",
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

export function faqText(l: "tr" | "en") {
  return FAQ.flatMap((g) => g.items).map((i) => ({ id: i.id, q: i.q[l], a: i.a[l] }));
}
