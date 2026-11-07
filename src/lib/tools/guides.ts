/**
 * Ücretsiz araç sayfalarının rehber metinleri (D107, SEO): aracın ne işe yaradığı, nasıl kullanıldığı, sonuçların nasıl
 * yorumlanacağı ve sık sorulanlar. Yalnızca aracın gerçekten yaptığı işler anlatılır. Basit Markdown: **kalın**, [bağlantı](/yol).
 */
export interface ToolGuide {
  sections: { h: string; p: string[]; list?: string[] }[];
  faq: { q: string; a: string }[];
}
type L = { tr: ToolGuide; en: ToolGuide };

export const TOOL_GUIDES: Record<string, L> = {
  "/araclar/arastirmalar-ne-diyor": {
    tr: {
      sections: [
        { h: "Nasıl çalışır?", p: ["Sorunuz önce akademik arama ifadelerine çevrilir; ardından **OpenAlex, Europe PMC, ERIC ve Crossref**’te İngilizce, Türkiye kaynaklarında Türkçe arama yapılır. Özeti okunabilen en ilgili makaleler (en fazla 14) seçilir ve kısa cevap **yalnızca bu özetlerden** derlenir."], list: [
          "Cevaptaki her bilginin yanında dayandığı makalenin numarası [3] yazar; numaraya tıklayınca makaleye gidersiniz.",
          "Her makalenin ana bulgusu, çalışma türü (meta-analiz, deneysel, ilişkisel, nitel…) ve soruya göre yönü gösterilir.",
          "Makalenin künyesine ve DOI bağlantısına tek tıkla ulaşırsınız; giriş yaptıysanız makaleyi çalışmanıza ekleyebilirsiniz.",
        ] },
        { h: "Uzlaşı göstergesi ne anlatır?", p: [
          "“Etkiler mi, ilişkili mi?” gibi evet/hayır sorularında, ilgili çalışmaların kaçının **evet**, **kısmen / koşullu**, **karışık** veya **hayır** sonucuna vardığı gösterilir. Gösterge en az 3 ilgili çalışma olduğunda çıkar.",
          "Gösterge bir oylama değildir: tek bir güçlü meta-analiz, birçok küçük kesitsel çalışmadan daha ağırlıklı olabilir. Bu yüzden çalışma türlerine de bakın.",
        ] },
        { h: "Sınırları", p: [
          "Cevap yalnızca özetlere dayanır; tam metinler okunmaz. Bulunan makaleler veri tabanlarının arama sonuçlarıdır, alanın tamamı değildir. Tezinizde bir bulguyu kullanmadan önce makalenin kendisini okuyun. Sistemli bir tarama için [literatür taraması rehberimize](/blog/literatur-taramasi-nasil-yapilir) ve [sistematik derleme yazımıza](/blog/sistematik-derleme-meta-analiz-prisma) bakabilirsiniz.",
        ] },
      ],
      faq: [
        { q: "Bulunan makaleler gerçek mi?", a: "Evet. Makaleler doğrudan akademik veri tabanlarından gelir; yapay zekâ makale üretmez, yalnızca bulunan makalelerin özetlerini okuyup özetler. Her makalenin DOI veya kayıt bağlantısı gösterilir." },
        { q: "Ücretsiz mi, kaç soru sorabilirim?", a: "Evet, üyelik gerekmez. Ziyaretçiler saatte 5, üyeler saatte 20 soru sorabilir." },
        { q: "Türkçe soru sorabilir miyim?", a: "Evet. Sorunuz hem İngilizce literatürde hem Türkçe ve Türkiye adresli yayınlarda aranır; cevap sorunuzun dilinde verilir." },
        { q: "Cevabı tezimde kaynak olarak kullanabilir miyim?", a: "Hayır, cevabın kendisi kaynak değildir. Listelenen makaleleri okuyup kendi cümlelerinizle ve onlara atıf yaparak kullanın. Academiana’da makaleleri çalışmanıza ekleyip kaynakçaya otomatik dönüştürebilirsiniz." },
      ],
    },
    en: {
      sections: [
        { h: "How does it work?", p: ["Your question is turned into academic search terms; then **OpenAlex, Europe PMC, ERIC and Crossref** are searched in English and Turkish sources in Turkish. The most relevant papers with readable abstracts (up to 14) are selected and the short answer is written **only from these abstracts**."], list: [
          "Each statement in the answer shows the number of the paper it rests on, e.g. [3]; click it to jump to the paper.",
          "For each paper you see its main finding, study type (meta-analysis, experimental, correlational, qualitative…) and its direction relative to your question.",
          "Bibliographic details and the DOI link are one click away; if you are signed in, you can add the paper to your work.",
        ] },
        { h: "What does the consensus meter show?", p: [
          "For yes/no questions such as “does X affect Y?”, it shows how many relevant studies concluded **yes**, **partly / conditionally**, **mixed** or **no**. It appears when there are at least 3 relevant studies.",
          "The meter is not a vote: one strong meta-analysis can outweigh many small cross-sectional studies, so look at study types too.",
        ] },
        { h: "Limitations", p: [
          "The answer rests on abstracts only; full texts are not read. The papers are database search results, not the whole field. Read a paper before using its findings in your thesis. For a systematic search, see our [literature review guide](/en/blog/how-to-write-a-literature-review) and [systematic review guide](/en/blog/systematic-review-meta-analysis-prisma-2020).",
        ] },
      ],
      faq: [
        { q: "Are the papers real?", a: "Yes. Papers come directly from academic databases; the AI does not create papers, it only reads and summarises the abstracts of the papers found. Each paper shows its DOI or record link." },
        { q: "Is it free, and how many questions can I ask?", a: "Yes, no sign-up is needed. Visitors can ask 5 questions per hour and members 20." },
        { q: "Can I ask in Turkish?", a: "Yes. Your question is searched in English literature and in Turkish and Turkey-affiliated publications; the answer is given in your language." },
        { q: "Can I cite the answer in my thesis?", a: "No, the answer itself is not a source. Read the listed papers and use them in your own words with citations. In Academiana you can add the papers to your work and turn them into a reference list automatically." },
      ],
    },
  },
  "/araclar/uydurma-kaynak-kontrolu": {
    tr: {
      sections: [
        { h: "Uydurma kaynak kontrolü nasıl çalışır?", p: [
          "ChatGPT gibi genel amaçlı yapay zekâ araçları, gerçekte var olmayan ama son derece inandırıcı görünen kaynaklar üretebilir: yazar adı gerçek bir araştırmacıya benzer, dergi gerçektir, yıl ve sayfa numaraları yerindedir; ama makale hiç yayımlanmamıştır.",
          "Bu araç kaynakçanızdaki her satırı ayrı ayrı ele alır. Satırda DOI varsa DOI’nin hangi yayına ait olduğuna bakar; yoksa başlık ve yazar bilgisiyle **Crossref, DataCite ve OpenAlex** kayıtlarında arama yapar. Bulunan kayıt ile sizin kaynağınız başlık, yazar ve yıl bakımından karşılaştırılır.",
        ] },
        { h: "Sonuçlar nasıl yorumlanır?", p: ["Her kaynak için üç sonuçtan biri gösterilir:"], list: [
          "**Doğrulandı:** Kaynak kayıt otoritelerinde var ve bilgiler büyük ölçüde örtüşüyor.",
          "**Künyede fark var:** Kaynak bulundu ama yazar, yıl veya başlıkta fark var; ya da DOI başka bir yayına ait. Künyeyi resmî kayıttan düzeltin.",
          "**Bulunamadı / şüpheli:** Hiçbir kayıtta eşleşme yok. Kaynağı derginin arşivinde, Google Scholar’da veya DergiPark’ta elle kontrol edin.",
        ] },
        { h: "“Bulunamadı” her zaman uydurma demek değildir", p: [
          "Kitaplar, kitap bölümleri, yüksek lisans ve doktora tezleri, kongre bildirileri ve bazı ulusal dergiler bu veri tabanlarında hiç dizinlenmemiş olabilir. Bu kaynaklar “bulunamadı” görünebilir; bu durumda kaynağı yayımlandığı yerden doğrulayın. Ayrıntılı yöntem için [uydurma kaynak tespiti rehberimize](/blog/yapay-zeka-uydurma-kaynak-tespiti) bakabilirsiniz.",
        ] },
      ],
      faq: [
        { q: "Uydurma kaynak kontrolü ücretsiz mi?", a: "Evet. Üyelik gerekmez. Kötüye kullanımı önlemek için saatte 15 kontrol ve her kontrolde en fazla 30 kaynak sınırı vardır." },
        { q: "Hangi atıf stillerindeki kaynakçaları kontrol edebilirim?", a: "APA, ISNAD, MLA, Chicago, IEEE, Vancouver ve benzeri yaygın stillerdeki kaynak satırları okunur. Biçimi okunamayan satırlar için yalnızca künye bilgilerini ayırmak amacıyla küçük bir yapay zekâ modeli kullanılır." },
        { q: "Kaynakçam kaydediliyor mu?", a: "Hayır. Kaynak metinleriniz saklanmaz; yalnızca kontrol için gereken başlık ve DOI bilgileri açık akademik kayıtlarda aranır. Sayaç için yalnızca kaç kaynak kontrol edildiği tutulur." },
        { q: "Danışmanlar ve jüri üyeleri kullanabilir mi?", a: "Elbette. Bir tezin kaynakçasından seçilen kaynakları yapıştırarak birkaç dakikada fikir edinebilirsiniz." },
      ],
    },
    en: {
      sections: [
        { h: "How does the fake reference checker work?", p: [
          "General-purpose AI tools such as ChatGPT can produce references that look entirely convincing but do not exist: the author resembles a real researcher, the journal is real, the year and pages are in place, yet the article was never published.",
          "This tool takes each line of your reference list separately. If the line has a DOI, it checks which publication the DOI belongs to; otherwise it searches **Crossref, DataCite and OpenAlex** by title and author. The record found is compared with your reference by title, author and year.",
        ] },
        { h: "How to read the results", p: ["Each reference gets one of three results:"], list: [
          "**Verified:** The reference exists in the registration agencies and the details largely match.",
          "**Details differ:** The reference was found, but the author, year or title differs, or the DOI belongs to another publication. Correct the details from the official record.",
          "**Not found / suspicious:** No record matches. Check the reference manually in the journal archive, Google Scholar or the relevant national database.",
        ] },
        { h: "“Not found” does not always mean fabricated", p: [
          "Books, book chapters, theses, conference papers and some national journals may not be indexed in these databases at all. They can appear as “not found”; verify them where they were published. For a detailed method, see our [guide to detecting AI-fabricated references](/en/blog/detecting-ai-fabricated-references).",
        ] },
      ],
      faq: [
        { q: "Is the fake reference checker free?", a: "Yes, and no sign-up is needed. To prevent abuse there is a limit of 15 checks per hour and up to 30 references per check." },
        { q: "Which citation styles can it read?", a: "Reference lines in APA, ISNAD, MLA, Chicago, IEEE, Vancouver and similar common styles are read. For lines whose format cannot be parsed, a small AI model is used only to separate the bibliographic fields." },
        { q: "Is my reference list stored?", a: "No. Your reference text is not stored; only the title and DOI needed for the check are looked up in open scholarly records. For the usage counter, only the number of references checked is kept." },
        { q: "Can supervisors and examiners use it?", a: "Of course. Paste a selection of references from a thesis to get a picture within minutes." },
      ],
    },
  },
  "/araclar/kaynakca-olusturucu": {
    tr: {
      sections: [
        { h: "Kaynakça oluşturucu nasıl kullanılır?", p: ["Künye bilgisini elle yazmak hem zaman alır hem de hataya açıktır. Bu araç bilgileri resmî kayıtlardan alır:"], list: [
          "Kutuya yayının **DOI’sini** (ör. 10.1037/0000165-000) veya **başlığını** yazın.",
          "Künye **Crossref, DataCite ve OpenAlex** kayıtlarından getirilir; yazarlar, yıl, dergi, cilt, sayı ve sayfalar otomatik dolar.",
          "**Atıf stilini** seçin: APA 7, APA 6, ISNAD 2, MLA 9, Chicago, Turabian, Harvard, Vancouver, IEEE veya AMA.",
          "Bulunamayan kaynakları (ör. kitap bölümü veya tez) elle ekleyin; liste seçtiğiniz stilde biçimlenir.",
        ] },
        { h: "Neden kayıt otoritesinden almak önemli?", p: [
          "Kaynakçalardaki hataların çoğu elle yazılan künyelerden gelir: yanlış yıl, eksik ortak yazar, hatalı cilt numarası. DOI ile alınan künye yayıncının kayıt otoritesine bildirdiği bilgidir. Yine de yazar adlarının Türkçe karakterlerini ve büyük-küçük harfleri son bir kez gözden geçirin.",
          "Stillerin ayrıntılı kuralları için [APA 7 atıf rehberimize](/blog/apa-7-atif-kurallari) ve [kaynakça nasıl hazırlanır](/blog/kaynakca-nasil-hazirlanir) yazımıza bakabilirsiniz.",
        ] },
      ],
      faq: [
        { q: "Hangi atıf stilleri destekleniyor?", a: "APA 7, APA 6, ISNAD 2 (metin içi), MLA 9, Chicago (yazar-tarih), Turabian, Harvard, Vancouver, IEEE ve AMA 11." },
        { q: "Türkçe kaynaklar için çalışır mı?", a: "DOI’si olan Türkçe makaleler (DergiPark’taki pek çok dergi dahil) DOI ile bulunur. DOI’si olmayan kaynakları elle ekleyebilirsiniz." },
        { q: "Oluşan kaynakçayı Word’e nasıl aktarırım?", a: "Listeyi kopyalayıp Word’e yapıştırın; italik gibi biçimler korunur. Asılı girinti için Word’de paragraf ayarlarından “Asılı” girintiyi seçin." },
        { q: "Ücretli mi?", a: "Hayır, üyelik gerekmez ve yapay zekâ kullanılmaz; künye bilgileri yalnızca kayıt otoritelerinden alınır." },
      ],
    },
    en: {
      sections: [
        { h: "How to use the reference generator", p: ["Typing bibliographic details by hand is slow and error-prone. This tool takes the details from official records:"], list: [
          "Enter the publication’s **DOI** (e.g. 10.1037/0000165-000) or its **title**.",
          "The record is fetched from **Crossref, DataCite and OpenAlex**; authors, year, journal, volume, issue and pages are filled in automatically.",
          "Choose a **citation style**: APA 7, APA 6, ISNAD 2, MLA 9, Chicago, Turabian, Harvard, Vancouver, IEEE or AMA.",
          "Add sources that cannot be found (e.g. a book chapter or thesis) manually; the list is formatted in the chosen style.",
        ] },
        { h: "Why use the registration agency’s record?", p: [
          "Most reference-list errors come from hand-typed details: wrong year, a missing co-author, an incorrect volume. A record fetched by DOI is what the publisher registered. Still, give author names and capitalisation a final check.",
          "For detailed style rules, see our [APA 7 citation guide](/en/blog/apa-7-citation-guide) and [how to write a reference list](/en/blog/how-to-write-a-bibliography-citation-styles).",
        ] },
      ],
      faq: [
        { q: "Which citation styles are supported?", a: "APA 7, APA 6, ISNAD 2 (author-date), MLA 9, Chicago (author-date), Turabian, Harvard, Vancouver, IEEE and AMA 11." },
        { q: "Does it work for non-English sources?", a: "Any article with a DOI is found by DOI, whatever its language. Sources without a DOI can be added manually." },
        { q: "How do I move the list into Word?", a: "Copy and paste it into Word; formatting such as italics is preserved. For a hanging indent, choose “Hanging” in Word’s paragraph settings." },
        { q: "Is it free?", a: "Yes. No sign-up is needed and no AI is used; details come only from registration agencies." },
      ],
    },
  },
  "/araclar/atif-donusturucu": {
    tr: {
      sections: [
        { h: "Atıf stili dönüştürücü ne işe yarar?", p: [
          "Danışmanınız veya hedef dergi farklı bir atıf stili istediğinde yüzlerce kaynağı tek tek yeniden yazmak gerekmez. Hazır kaynakçanızı yapıştırın ya da Zotero, Mendeley veya EndNote’tan aldığınız **BibTeX** veya **RIS** dosyasını yükleyin; kaynaklar seçtiğiniz stile çevrilir.",
        ] },
        { h: "Adım adım kullanım", p: [], list: [
          "Kaynakçanızı kutuya yapıştırın (her kaynak ayrı satırda) veya BibTeX/RIS dosyanızı seçin.",
          "Hedef stili seçin: ör. APA 7’den ISNAD 2’ye ya da MLA’dan APA’ya.",
          "Sonuç listesini kontrol edin; okunamayan satırlar işaretlenir, onları elle düzeltin.",
          "Listeyi kopyalayıp belgenize yapıştırın.",
        ] },
        { h: "Metin içi atıfları unutmayın", p: [
          "Stil değişikliği yalnızca kaynakçayı değil, metin içi atıfları da etkiler: APA’da (Kaya, 2021), IEEE’de [1], dipnotlu stillerde dipnot. Tezinizi Academiana’da yazıyorsanız atıf stilini değiştirdiğinizde hem metin içi atıflar hem kaynakça hem de tablo ve şekil başlıkları kendiliğinden yeni stile uyar.",
        ] },
      ],
      faq: [
        { q: "BibTeX ve RIS dosyalarını destekliyor mu?", a: "Evet. Zotero, Mendeley ve EndNote’tan dışa aktarılan BibTeX (.bib) ve RIS (.ris) dosyaları okunur." },
        { q: "Dönüştürme ne kadar doğru?", a: "Yapılandırılmış dosyalarda (BibTeX/RIS) bilgiler alan alan okunduğu için sonuç çok güvenilirdir. Düz metin kaynakçalarda alışılmadık biçimdeki satırları mutlaka gözden geçirin." },
        { q: "Hangi stiller arasında dönüştürebilirim?", a: "APA 7, APA 6, ISNAD 2, MLA 9, Chicago, Turabian, Harvard, Vancouver, IEEE ve AMA arasında." },
      ],
    },
    en: {
      sections: [
        { h: "What does the citation style converter do?", p: [
          "When your supervisor or target journal requires a different style, there is no need to retype hundreds of references. Paste your list, or upload a **BibTeX** or **RIS** file exported from Zotero, Mendeley or EndNote, and the references are converted to the style you choose.",
        ] },
        { h: "Step by step", p: [], list: [
          "Paste your reference list (one reference per line) or choose your BibTeX/RIS file.",
          "Choose the target style, e.g. from APA 7 to ISNAD 2 or from MLA to APA.",
          "Check the result; lines that could not be read are flagged so you can fix them by hand.",
          "Copy the list and paste it into your document.",
        ] },
        { h: "Do not forget in-text citations", p: [
          "Changing style affects in-text citations as well as the reference list: (Kaya, 2021) in APA, [1] in IEEE. If you write your thesis in Academiana, changing the citation style updates in-text citations, the reference list and table and figure captions automatically.",
        ] },
      ],
      faq: [
        { q: "Are BibTeX and RIS files supported?", a: "Yes. BibTeX (.bib) and RIS (.ris) files exported from Zotero, Mendeley and EndNote are read." },
        { q: "How accurate is the conversion?", a: "With structured files (BibTeX/RIS) each field is read separately, so results are very reliable. With plain-text lists, review lines in unusual formats." },
        { q: "Which styles can I convert between?", a: "APA 7, APA 6, ISNAD 2, MLA 9, Chicago, Turabian, Harvard, Vancouver, IEEE and AMA." },
      ],
    },
  },
  "/araclar/orneklem-hesaplayici": {
    tr: {
      sections: [
        { h: "Örneklem büyüklüğü nasıl hesaplanır?", p: [
          "Araç üç yaygın yöntemi destekler. Hangisini seçeceğiniz araştırmanızın amacına bağlıdır:",
        ], list: [
          "**Cochran formülü:** Bir oranı tahmin eden tarama araştırmaları için. %95 güven ve %5 hata payıyla çok büyük evrende 385 kişi; 1.000 kişilik evrende sonlu evren düzeltmesiyle 278 kişi.",
          "**Yamane formülü:** Cochran’ın %95 güven ve p = 0,5 için sadeleştirilmiş hâli. 1.000 kişilik evren ve %5 hata payıyla 286 kişi.",
          "**Ortalama için örneklem:** Bir ortalamayı belirli bir hata payıyla tahmin etmek istiyorsanız; standart sapma tahmini gerekir.",
        ] },
        { h: "Güven düzeyi, hata payı ve yanıt oranı", p: [
          "Sosyal bilimlerde en sık %95 güven düzeyi (Z = 1,96) ve %5 hata payı kullanılır. Daha kesin sonuç için hata payını %3’e düşürürseniz gereken örneklem belirgin biçimde artar.",
          "Hesaplanan sayı analize girecek geçerli form sayısıdır. Beklenen yanıt oranını girerseniz araç kaç kişiye ulaşmanız gerektiğini de verir: 278 kişilik örneklem ve %70 yanıt oranı için yaklaşık 398 kişi.",
        ] },
        { h: "Deneysel çalışmalarda güç analizi gerekir", p: [
          "İki grubu karşılaştıran veya değişkenler arasındaki ilişkiyi inceleyen çalışmalarda Cochran ve Yamane yerine güç analizi kullanılır. Bu konuyu hesaplı örneklerle [örneklem büyüklüğü rehberimizde](/blog/orneklem-buyuklugu-nasil-hesaplanir) anlattık.",
        ] },
      ],
      faq: [
        { q: "Evren büyüklüğünü bilmiyorsam ne yapmalıyım?", a: "Evren alanını boş bırakın; araç sonsuz evren varsayımıyla hesaplar. %95 güven ve %5 hata payında bu 385 kişidir." },
        { q: "Cochran mı Yamane mi kullanmalıyım?", a: "İkisi de %95 güven ve %5 hata payında benzer sonuç verir. Farklı güven düzeyi veya oran kullanmanız gerekiyorsa Cochran daha esnektir." },
        { q: "Sonucu yöntem bölümüne nasıl yazarım?", a: "Araç, kullandığınız formülü, güven düzeyini, hata payını ve sonucu içeren hazır bir cümle verir; kopyalayıp yöntem bölümünüze ekleyebilirsiniz." },
        { q: "Nitel araştırmada örneklem nasıl belirlenir?", a: "Nitel çalışmalarda formül kullanılmaz; katılımcı sayısı genellikle veri doygunluğuyla gerekçelendirilir." },
      ],
    },
    en: {
      sections: [
        { h: "How is sample size calculated?", p: ["The tool supports three common methods; which one to use depends on your study’s aim:"], list: [
          "**Cochran’s formula:** For surveys estimating a proportion. At 95% confidence and a 5% margin of error: 385 people for a very large population; 278 for a population of 1,000 with the finite population correction.",
          "**Yamane’s formula:** A simplified Cochran for 95% confidence and p = 0.5. For a population of 1,000 and a 5% margin: 286 people.",
          "**Sample size for a mean:** When you want to estimate a mean within a given margin; it needs an estimate of the standard deviation.",
        ] },
        { h: "Confidence level, margin of error and response rate", p: [
          "The social sciences most often use a 95% confidence level (Z = 1.96) and a 5% margin of error. Lowering the margin to 3% for more precision increases the required sample considerably.",
          "The result is the number of valid responses entering the analysis. Enter the expected response rate and the tool also tells you how many people to contact: about 398 for a sample of 278 and a 70% response rate.",
        ] },
        { h: "Experimental studies need a power analysis", p: [
          "Studies comparing groups or examining relationships between variables use a power analysis instead of Cochran or Yamane. We explain this with worked examples in our [sample size guide](/en/blog/how-to-calculate-sample-size).",
        ] },
      ],
      faq: [
        { q: "What if I do not know the population size?", a: "Leave the population empty and the tool assumes an infinite population: 385 people at 95% confidence and a 5% margin." },
        { q: "Should I use Cochran or Yamane?", a: "Both give similar results at 95% confidence and a 5% margin. If you need a different confidence level or proportion, Cochran is more flexible." },
        { q: "How do I report it in my methods section?", a: "The tool gives a ready sentence with the formula, confidence level, margin of error and result that you can paste into your methods section." },
        { q: "How is sample size set in qualitative research?", a: "Qualitative studies do not use formulas; the number of participants is usually justified by data saturation." },
      ],
    },
  },
  "/araclar/cronbach-alfa": {
    tr: {
      sections: [
        { h: "Cronbach alfa nasıl hesaplanır?", p: ["Excel, SPSS veya Google E-Tablolar’daki ölçek verinizi kopyalayıp yapıştırmanız yeterli:"], list: [
          "Her satır bir katılımcı, her sütun bir madde olmalıdır; ilk satır madde adları olabilir. Eksik verili satırlar hesaplamadan çıkarılır ve kaç satırın çıkarıldığı gösterilir.",
          "Ters puanlanan maddeleri işaretleyin; araç bunları hesaplamadan önce ters çevirir.",
          "Sonuçta **Cronbach alfa**, her madde için **düzeltilmiş madde-toplam korelasyonu** ve **madde silinirse alfa** değerleri gösterilir.",
        ] },
        { h: "Sonuç nasıl yorumlanır?", p: ["Literatürde sık kullanılan kaba sınıflama:"], list: [
          "**0,90 ve üzeri:** mükemmel (0,95’in üzeri madde tekrarına işaret edebilir)",
          "**0,80–0,89:** iyi",
          "**0,70–0,79:** kabul edilebilir",
          "**0,60–0,69:** sınırda; az maddeli alt boyutlarda görülebilir",
          "**0,60’ın altı:** zayıf; önce ters maddeleri ve veri girişini kontrol edin",
        ] },
        { h: "Alfa düşük çıktıysa", p: [
          "Düşük alfanın en sık nedeni ters puanlanması gereken bir maddenin düz bırakılmasıdır; madde-toplam korelasyonu negatif çıkan maddeye bakın. Uyarlanmış bir ölçekten yalnızca alfa yükselsin diye madde silmeyin. Ayrıntılar için [Cronbach alfa rehberimizi](/blog/cronbach-alfa-nedir-nasil-yorumlanir) okuyabilirsiniz.",
        ] },
      ],
      faq: [
        { q: "Verilerim bir sunucuya gönderiliyor mu?", a: "Hayır. Hesaplama tamamen tarayıcınızda yapılır; verileriniz bilgisayarınızdan çıkmaz." },
        { q: "Kaç katılımcı ve madde girebilirim?", a: "Tarayıcınızın kaldırabileceği kadar; tipik tez verileri (birkaç yüz katılımcı, onlarca madde) anında hesaplanır." },
        { q: "Alt boyutlar için ayrı alfa hesaplamalı mıyım?", a: "Evet. Çok boyutlu ölçeklerde her alt boyutun maddelerini ayrı yapıştırarak alfayı alt boyut düzeyinde raporlayın." },
        { q: "SPSS sonucuyla aynı mı çıkar?", a: "Evet, aynı formül (standartlaştırılmamış alfa) kullanılır. Eksik verili satırlar SPSS’in varsayılanındaki gibi çıkarılır (liste bazında silme)." },
      ],
    },
    en: {
      sections: [
        { h: "How to calculate Cronbach’s alpha", p: ["Copy your scale data from Excel, SPSS or Google Sheets and paste it:"], list: [
          "Each row should be a participant and each column an item; the first row can hold item names. Rows with missing data are excluded and the number excluded is shown.",
          "Mark reverse-scored items; the tool reverses them before calculating.",
          "You get **Cronbach’s alpha**, the **corrected item-total correlation** for each item and **alpha if item deleted**.",
        ] },
        { h: "How to interpret the result", p: ["A rough classification often used in the literature:"], list: [
          "**0.90 and above:** excellent (above 0.95 may signal redundant items)",
          "**0.80–0.89:** good",
          "**0.70–0.79:** acceptable",
          "**0.60–0.69:** questionable; can occur in short subscales",
          "**Below 0.60:** poor; first check reverse-scored items and data entry",
        ] },
        { h: "If alpha is low", p: [
          "The most common cause of low alpha is a reverse-scored item left unreversed; look for an item with a negative item-total correlation. Do not delete items from an adapted scale just to raise alpha. See our [Cronbach’s alpha guide](/en/blog/cronbach-alpha-explained) for details.",
        ] },
      ],
      faq: [
        { q: "Is my data sent to a server?", a: "No. The calculation runs entirely in your browser; your data never leaves your device." },
        { q: "How many participants and items can I enter?", a: "As many as your browser can handle; typical thesis data (a few hundred participants, dozens of items) is calculated instantly." },
        { q: "Should I calculate alpha for each subscale?", a: "Yes. For multidimensional scales, paste each subscale’s items separately and report alpha at the subscale level." },
        { q: "Will it match SPSS?", a: "Yes, it uses the same formula (unstandardised alpha). Rows with missing data are excluded, as in SPSS’s default listwise deletion." },
      ],
    },
  },
  "/araclar/anket-olusturucu": {
    tr: {
      sections: [
        { h: "Akademik anket nasıl hazırlanır?", p: ["Anket oluşturucu, tez ve makale anketleri için tasarlandı:"], list: [
          "**Soru türleri:** Likert (5’li veya 7’li), tek seçimli, çoklu seçimli, sayı, açık uçlu sorular ve bilgilendirme metni.",
          "**Hızlı kontrol:** Onam metni ve demografik soru eksikliği, iki şeyi aynı anda soran madde, tekrarlanan ifade, ters maddesiz ölçek, “Diğer” seçeneği olmayan soru ve çok uzun anket gibi yaygın sorunları işaretler.",
          "**Yazdırma:** Anketi kâğıt formda uygulamak için düzgün bir çıktı alın.",
          "**Çevrim içi yayın:** Ücretsiz hesap açarak anketi bir bağlantıyla paylaşın; katılımcıların kimlik bilgisi toplanmaz.",
        ] },
        { h: "İyi bir Likert maddesi yazmak", p: [
          "Her madde tek bir yargı içermeli, kısa ve açık olmalıdır. Olumsuz ifadeli maddeler ters puanlanır; analizden önce ters çevrilmeleri gerekir. Ölçek kullanıyorsanız geliştiricisinden izin almayı unutmayın.",
          "Daha fazla bilgi için [anket nasıl hazırlanır](/blog/anket-nasil-hazirlanir-likert-olcegi) ve [örneklem büyüklüğü](/blog/orneklem-buyuklugu-nasil-hesaplanir) rehberlerimize bakabilirsiniz.",
        ] },
        { h: "Cevaplar analize hazır gelir", p: [
          "Academiana hesabınızla yayınladığınız anketlerin cevapları, ters maddeler kodlanmış biçimde analize hazır tabloya dönüşür; CSV olarak indirebilir veya tek tıkla istatistik analizine aktarabilirsiniz.",
        ] },
      ],
      faq: [
        { q: "Anket oluşturucu ücretsiz mi?", a: "Anketi hazırlamak, kontrol etmek ve yazdırmak ücretsizdir ve üyelik gerektirmez. Çevrim içi yayınlayıp cevap toplamak için ücretsiz bir hesap yeterlidir." },
        { q: "Katılımcıların kişisel bilgileri toplanıyor mu?", a: "Hayır. Anket formu kimlik bilgisi, IP adresi veya e-posta toplamaz; yalnızca cevaplar kaydedilir." },
        { q: "Cevapları SPSS’e aktarabilir miyim?", a: "Evet. Cevaplar CSV olarak indirilebilir ve SPSS, Jamovi veya Excel’de açılabilir; kod kitabı da hazırlanır." },
      ],
    },
    en: {
      sections: [
        { h: "How to build an academic survey", p: ["The survey builder is designed for thesis and research surveys:"], list: [
          "**Question types:** Likert (5- or 7-point), single choice, multiple choice, number and open-ended questions, plus information text.",
          "**Quick check:** Flags common problems such as a missing consent text or demographic questions, double-barrelled or repeated items, scales without reverse items, choice questions without an “Other” option and overly long surveys.",
          "**Printing:** Get a clean printout to run the survey on paper.",
          "**Online publishing:** With a free account, share the survey via a link; no identifying information is collected from participants.",
        ] },
        { h: "Writing a good Likert item", p: [
          "Each item should contain a single statement and be short and clear. Negatively worded items are reverse-scored and must be recoded before analysis. If you use an existing scale, remember to get the developer’s permission.",
          "For more, see our guides on [designing a survey](/en/blog/how-to-design-a-survey-likert-scale) and [sample size](/en/blog/how-to-calculate-sample-size).",
        ] },
        { h: "Responses arrive ready for analysis", p: [
          "Responses to surveys published with your Academiana account become an analysis-ready table with reverse-scored items recoded; download them as CSV or send them to statistical analysis in one click.",
        ] },
      ],
      faq: [
        { q: "Is the survey builder free?", a: "Building, checking and printing a survey is free with no sign-up. A free account is enough to publish online and collect responses." },
        { q: "Is participants’ personal data collected?", a: "No. The survey form does not collect identity information, IP addresses or emails; only the answers are stored." },
        { q: "Can I export responses to SPSS?", a: "Yes. Responses can be downloaded as CSV and opened in SPSS, Jamovi or Excel; a codebook is also prepared." },
      ],
    },
  },
};
