/**
 * Herkese açık sayfaların arama motoru metinleri (TR/EN).
 * Başlıklar ≈ 50–60, açıklamalar ≈ 140–160 karakter; anahtar kelimeler gerçek arama ifadelerine göre seçildi.
 */
export interface PageSeo {
  title: { tr: string; en: string };
  description: { tr: string; en: string };
  keywords: { tr: string[]; en: string[] };
  /** OG görselinde başlığın altındaki kısa satır */
  tagline?: { tr: string; en: string };
  noindex?: boolean;
}

export const PAGE_SEO: Record<string, PageSeo> = {
  "/araclar": {
    title: { tr: "Ücretsiz Akademik Araçlar: Kaynakça, Atıf, Örneklem | Academiana", en: "Free Academic Tools: References, Citations, Sample Size | Academiana" },
    description: { tr: "Üyeliksiz ücretsiz araçlar: Araştırmalar ne diyor?, kaynakça oluşturucu, atıf dönüştürücü, örneklem büyüklüğü, Cronbach alfa ve uydurma kaynak kontrolü.", en: "Free tools, no sign-up: What does research say?, reference generator, citation converter, sample size, Cronbach's alpha and fake reference checker." },
    keywords: { tr: ["ücretsiz akademik araçlar", "araştırmalar ne diyor", "kaynakça oluşturma", "atıf dönüştürücü", "örneklem hesaplama", "cronbach alfa hesaplama"], en: ["free academic tools", "research consensus tool", "reference generator", "citation converter", "sample size calculator", "cronbach alpha calculator"] },
    tagline: { tr: "Üyelik gerekmez", en: "No sign-up needed" },
  },
  "/araclar/arastirmalar-ne-diyor": {
    title: { tr: "Araştırmalar Ne Diyor? Kaynaklı Cevap ve Uzlaşı | Academiana", en: "What Does the Research Say? Evidence and Consensus" },
    description: {
      tr: "Araştırma sorunuza gerçek makalelerin özetlerinden numaralı kaynaklı kısa cevap ve çalışmaların ne kadarının aynı sonuca vardığını gösteren uzlaşı göstergesi.",
      en: "Ask a research question and get a short answer cited from real paper abstracts, with a consensus meter showing how many studies agree.",
    },
    keywords: { tr: ["araştırmalar ne diyor", "bilimsel kanıt", "literatür özeti", "makale bulma yapay zeka", "akademik soru cevap"], en: ["what does the research say", "research consensus", "evidence summary", "AI research assistant", "find academic papers"] },
    tagline: { tr: "Gerçek makalelerden kaynaklı cevap", en: "Answers cited from real papers" },
  },
  "/araclar/uydurma-kaynak-kontrolu": {
    title: { tr: "Uydurma Kaynak Kontrolü: Kaynakça Gerçek mi? | Academiana", en: "Fake Reference Checker: Are Your Sources Real? | Academiana" },
    description: { tr: "Kaynakçanızı yapıştırın; her kaynak Crossref, DataCite ve OpenAlex’te aranır. ChatGPT’nin uydurduğu kaynakları ve yanlış DOI’leri ücretsiz bulun.", en: "Paste your reference list; each source is checked in Crossref, DataCite and OpenAlex. Find fabricated references and wrong DOIs for free." },
    keywords: { tr: ["uydurma kaynak kontrolü", "kaynak doğrulama", "chatgpt uydurma kaynak", "doi kontrol", "kaynakça kontrol"], en: ["fake reference checker", "verify references", "chatgpt fake citations", "doi checker", "reference list checker"] },
    tagline: { tr: "Kaynaklarınız gerçek mi?", en: "Are your sources real?" },
  },
  "/araclar/kaynakca-olusturucu": {
    title: { tr: "Ücretsiz Kaynakça Oluşturucu: APA 7, ISNAD, MLA | Academiana", en: "Free Reference Generator: APA 7, ISNAD, MLA | Academiana" },
    description: { tr: "DOI veya başlıkla APA 7, ISNAD 2, MLA, Chicago, Harvard, IEEE ve Vancouver kaynakça oluşturun. Künyeler resmî kayıtlardan alınır, üyelik gerekmez.", en: "Create references in APA 7, ISNAD 2, MLA, Chicago, Harvard, IEEE and Vancouver from a DOI or title. Metadata from official registries, no sign-up." },
    keywords: { tr: ["kaynakça oluşturma", "apa kaynakça oluşturucu", "isnad kaynakça", "doi ile kaynakça", "kaynak gösterme"], en: ["reference generator", "apa citation generator", "isnad citation", "doi to citation", "bibliography maker"] },
    tagline: { tr: "DOI’den kaynakçaya", en: "From DOI to reference" },
  },
  "/araclar/atif-donusturucu": {
    title: { tr: "Atıf Stili Dönüştürücü: APA, ISNAD, MLA Arası | Academiana", en: "Citation Style Converter: APA, ISNAD, MLA | Academiana" },
    description: { tr: "Kaynakçanızı tek tıkla başka stile çevirin: APA’dan ISNAD’a, MLA’dan APA’ya. BibTeX ve RIS desteklenir; eksik bilgiler resmî kayıttan tamamlanır.", en: "Convert your reference list to another style in one click: APA to ISNAD, MLA to APA. BibTeX and RIS supported; missing data completed from registries." },
    keywords: { tr: ["atıf stili dönüştürme", "apa isnad dönüştürme", "kaynakça dönüştürücü", "bibtex apa"], en: ["citation style converter", "apa to mla", "convert references", "bibtex to apa"] },
    tagline: { tr: "Bir stilden ötekine", en: "From one style to another" },
  },
  "/araclar/orneklem-hesaplayici": {
    title: { tr: "Örneklem Büyüklüğü Hesaplama (Cochran, Yamane) | Academiana", en: "Sample Size Calculator (Cochran, Yamane) | Academiana" },
    description: { tr: "Evren, güven düzeyi ve hata payına göre örneklem büyüklüğünü hesaplayın. Cochran, Yamane ve ortalama formülleri; yöntem bölümü için hazır cümle.", en: "Free sample size calculator: Cochran, Yamane and mean formulas from population, confidence level and margin of error, with a methods sentence." },
    keywords: { tr: ["örneklem hesaplama", "örneklem büyüklüğü", "yamane formülü", "cochran formülü", "anket örneklem sayısı"], en: ["sample size calculator", "cochran formula", "yamane formula", "survey sample size"] },
    tagline: { tr: "Kaç kişiye ulaşmalı?", en: "How many respondents?" },
  },
  "/araclar/cronbach-alfa": {
    title: { tr: "Cronbach Alfa Hesaplama: Ücretsiz Güvenirlik Analizi | Academiana", en: "Cronbach's Alpha Calculator: Free Reliability Analysis | Academiana" },
    description: { tr: "Ölçek verilerinizi yapıştırın; Cronbach alfa, madde-toplam korelasyonu ve madde silinirse alfa anında hesaplansın. Veriler tarayıcınızdan çıkmaz.", en: "Paste your scale data; Cronbach's alpha, item-total correlations and alpha if item deleted are calculated instantly. Your data never leaves your browser." },
    keywords: { tr: ["cronbach alfa hesaplama", "güvenirlik analizi", "iç tutarlılık", "madde toplam korelasyonu"], en: ["cronbach alpha calculator", "reliability analysis", "internal consistency", "item total correlation"] },
    tagline: { tr: "Ölçeğiniz güvenilir mi?", en: "Is your scale reliable?" },
  },
  "/araclar/anket-olusturucu": {
    title: { tr: "Ücretsiz Anket Oluşturucu: Likert, Çoktan Seçmeli | Academiana", en: "Free Survey Builder: Likert, Multiple Choice | Academiana" },
    description: { tr: "Ücretsiz anket oluşturucu: Likert, çoktan seçmeli ve açık uçlu sorular, hızlı kontrol ve yazdırma; çevrim içi yayınlayıp cevap toplayın.", en: "Build your academic survey: Likert, multiple choice and open questions, quick check and printing. Publish online and collect responses with a free account." },
    keywords: { tr: ["anket oluşturma", "likert anket hazırlama", "ücretsiz anket", "akademik anket"], en: ["survey builder", "likert survey", "free survey maker", "academic survey"] },
    tagline: { tr: "Anketinizi hazırlayın", en: "Build your survey" },
  },
  "/": {
    title: {
      tr: "Academiana — Yapay Zekâ ile Tez ve Makale Yazımı",
      en: "Academiana — AI Thesis & Academic Writing Assistant",
    },
    description: {
      tr: "Tez, makale ve literatür taramanızı gerçek kaynaklarla yazın; atıflı her cümle kaynağında denetlenir. APA 7, PRISMA, istatistik, anket ve Word çıktısı.",
      en: "Write your thesis, article and literature review with real sources; every cited sentence is checked against its source. APA 7, PRISMA, statistics, Word export.",
    },
    keywords: {
      tr: ["tez yazma", "yapay zeka tez yazma", "akademik yazım asistanı", "makale yazma", "literatür taraması", "APA 7 kaynak gösterme", "kaynakça oluşturma", "TÜBİTAK 2209-A", "tez önerisi", "istatistik analizi", "anket hazırlama", "akademik İngilizce çeviri", "ortak yazarla tez yazma", "iddia denetimi", "PRISMA sistematik derleme", "Academiana"],
      en: ["AI thesis writer", "academic writing assistant", "AI research paper writer", "literature review tool", "APA 7 citation generator", "reference generator", "thesis help", "dissertation writing tool", "statistics for thesis", "survey builder for research", "academic translation Turkish English", "collaborative thesis writing", "Academiana"],
    },
    tagline: { tr: "Gerçek kaynaklarla yapay zekâ destekli akademik yazım", en: "AI academic writing with real, verified sources" },
  },
  "/fiyatlar": {
    title: { tr: "Fiyatlar ve Paketler — Ücretsiz Başlayın | Academiana", en: "Pricing & Plans — Start Free | Academiana" },
    description: {
      tr: "Academiana paketleri: ücretsiz başlangıç, %30 akademik ekip indirimi ve kurum lisansı. Paketlerin özelliklerini ve araçlarını karşılaştırın.",
      en: "Academiana plans: free tier, 30% academic team discount and institutional licences. Compare plan features and tools.",
    },
    keywords: { tr: ["tez yazma programı fiyat", "akademik yazım aracı ücretsiz", "akademisyen indirimi", "Academiana fiyat"], en: ["academic writing tool pricing", "AI thesis writer free", "academic team discount", "Academiana pricing"] },
    tagline: { tr: "Ücretsiz başlayın, ihtiyacınız kadar yükseltin", en: "Start free, upgrade when you need" },
  },
  "/ornekler": {
    title: { tr: "Örnek Çıktılar — Tez, Kaynakça, İstatistik ve Daha Fazlası | Academiana", en: "Sample Outputs — Thesis, References, Statistics and More | Academiana" },
    description: {
      tr: "Academiana örnek çıktıları: çalışma kurgusu, doğrulanmış kaynaklar, atıflı bölüm, 10 atıf stili, APA tabloları, grafik, anket ve Word çıktısı.",
      en: "Academiana sample outputs: study blueprint, verified sources, cited drafts, 10 citation styles, APA tables, charts, surveys and Word export.",
    },
    keywords: { tr: ["tez örneği", "APA tablo örneği", "kaynakça örneği", "akademik yazım örneği", "Academiana örnek"], en: ["thesis example", "APA table example", "reference list example", "academic writing sample", "Academiana sample"] },
    tagline: { tr: "Ne elde edeceğinizi görün", en: "See what you get" },
  },
  "/sss": {
    title: { tr: "Sık Sorulan Sorular — Kaynaklar, Gizlilik, İntihal | Academiana", en: "FAQ — Sources, Privacy, Plagiarism & AI Detection | Academiana" },
    description: {
      tr: "Yapay zekâ kaynak uydurur mu? Çalışmamı kim görebilir? İntihal ve özgünlük, ödeme ve iptal hakkında merak ettiğiniz her şeyin açık cevapları.",
      en: "Does the AI make up sources? Who can see my work? Clear answers about plagiarism, originality, privacy, payment and cancellation.",
    },
    keywords: { tr: ["yapay zeka kaynak uydurur mu", "intihal oranı", "Academiana SSS"], en: ["does AI make up sources", "plagiarism checker thesis", "Academiana FAQ"] },
    tagline: { tr: "Merak edilenlere açık ve dürüst cevaplar", en: "Clear, honest answers" },
  },
  "/kurumlar": {
    title: { tr: "Üniversiteler ve Enstitüler İçin Kurum Lisansı | Academiana", en: "Institutional Licence for Universities | Academiana" },
    description: {
      tr: "Üniversiteniz, enstitünüz veya bölümünüz için toplu Academiana lisansı: öğrenciler kurum koduyla katılır, yönetici yalnızca kullanım sayılarını görür.",
      en: "Bulk Academiana licences for universities, graduate schools and departments. Students join with an institution code; admins only see usage counts.",
    },
    keywords: { tr: ["üniversite yapay zeka lisansı", "enstitü tez yazım aracı", "kurumsal akademik yazılım"], en: ["university AI writing licence", "institutional academic writing software", "graduate school thesis tool"] },
    tagline: { tr: "Kurumunuz için toplu lisans", en: "Licences for your institution" },
  },

  "/yardim": {
    title: { tr: "Yardım Merkezi — Kullanım Rehberleri | Academiana", en: "Help Center — How-to Guides | Academiana" },
    description: {
      tr: "Academiana’yı en verimli şekilde kullanmak için adım adım rehberler: çalışma oluşturma, kaynak arama, atıf, dışa aktarma ve danışmanla paylaşım.",
      en: "Step-by-step guides to get the most out of Academiana: creating projects, finding sources, citations, exporting and sharing with your advisor.",
    },
    keywords: { tr: ["Academiana nasıl kullanılır", "yardım"], en: ["how to use Academiana", "help"] },
  },
  "/gizlilik": {
    title: { tr: "Gizlilik Politikası ve KVKK Aydınlatma Metni | Academiana", en: "Privacy Policy | Academiana" },
    description: {
      tr: "Academiana hangi verileri işler, nerede saklar ve kimlerle paylaşır? KVKK kapsamındaki haklarınız ve verilerinizi silme, indirme seçenekleri.",
      en: "What data Academiana processes, where it is stored and who it is shared with. Your rights and how to download or delete your data.",
    },
    keywords: { tr: ["KVKK aydınlatma metni", "gizlilik politikası"], en: ["privacy policy", "data protection"] },
  },
  "/kosullar": {
    title: { tr: "Kullanım Koşulları | Academiana", en: "Terms of Use | Academiana" },
    description: {
      tr: "Academiana kullanım koşulları: hizmetin kapsamı, kullanıcı sorumlulukları, akademik dürüstlük, ödeme, iptal ve hesap kapatma.",
      en: "Academiana terms of use: scope of the service, user responsibilities, academic integrity, payment, cancellation and account closure.",
    },
    keywords: { tr: ["kullanım koşulları"], en: ["terms of use"] },
  },
  "/yontem": {
    title: { tr: "Yöntem ve Şeffaflık: Kaynak ve İddia Doğrulama | Academiana", en: "Method and Transparency: Source and Claim Checks" },
    description: {
      tr: "Kaynaklar nereden gelir, nasıl doğrulanır, atıflı her cümle kaynağında desteklenir mi, kalite puanı nasıl hesaplanır ve sistemin sınırlamaları nelerdir?",
      en: "Where sources come from, how they are verified, how each cited sentence is checked against its source, how the quality score works and its limits.",
    },
    keywords: { tr: ["kaynak doğrulama", "atıf doğrulama", "iddia denetimi", "yapay zeka akademik güvenilirlik", "uydurma kaynak"], en: ["citation verification", "claim checking", "source verification AI", "academic AI transparency", "hallucinated references"] },
    tagline: { tr: "Kaynak ve iddia nasıl doğrulanır?", en: "How sources and claims are checked" },
  },
  "/hakkimizda": {
    title: { tr: "Hakkımızda — Misyonumuz ve Vizyonumuz | Academiana", en: "About Academiana — Our Mission and Vision" },
    description: {
      tr: "Academiana’nın hikâyesi: yapay zekâya eğitimde doğru bir rol kazandırmak, araştırmacılara zaman kazandırmak. Misyonumuz, vizyonumuz ve kurucumuz.",
      en: "Academiana’s story: giving AI a proper role in education and saving researchers time. Our mission, vision, values and founder.",
    },
    keywords: { tr: ["Academiana hakkında", "Academiana kurucusu", "akademik yazım platformu misyon"], en: ["about Academiana", "Academiana founder", "academic writing platform mission"] },
    tagline: { tr: "Misyonumuz ve vizyonumuz", en: "Our mission and vision" },
  },
  "/akademik-durustluk": {
    title: { tr: "Akademik Dürüstlük İlkeleri — Yapay Zekâyı Sorumlu Kullanım | Academiana", en: "Academic Integrity — Responsible AI Use | Academiana" },
    description: {
      tr: "Academiana neden kaynak uydurmaz, veri üretmez ve yazarlığı size bırakır? Yapay zekâyı akademik çalışmada sorumlu ve etik kullanma ilkelerimiz.",
      en: "Why Academiana never fabricates sources or data and keeps you as the author. Our principles for responsible, ethical AI use in academic work.",
    },
    keywords: { tr: ["yapay zeka akademik etik", "akademik dürüstlük", "yapay zeka ile tez yazmak etik mi"], en: ["AI academic integrity", "responsible AI in research", "is using AI for thesis ethical"] },
  },
  "/blog": {
    title: { tr: "Blog — Tez, Makale ve Akademik Yazım Rehberleri | Academiana", en: "Blog — Thesis, Research Paper & Academic Writing Guides | Academiana" },
    description: {
      tr: "Tez nasıl yazılır, APA 7 atıf kuralları, literatür taraması, intihalden kaçınma, istatistik analiz seçimi, TÜBİTAK başvurusu ve daha fazlası.",
      en: "How to write a thesis, APA 7 citation rules, literature reviews, avoiding plagiarism, choosing a statistical test, research proposals and more.",
    },
    keywords: { tr: ["tez nasıl yazılır", "akademik yazım rehberi", "APA 7", "literatür taraması nasıl yapılır"], en: ["how to write a thesis", "academic writing guide", "APA 7 guide", "how to write a literature review"] },
    tagline: { tr: "Akademik yazım rehberleri", en: "Academic writing guides" },
  },
  "/kayit": {
    title: { tr: "Ücretsiz Kayıt Ol — Tezine Bugün Başla | Academiana", en: "Sign Up Free — Start Your Thesis Today | Academiana" },
    description: {
      tr: "Kredi kartı gerekmeden ücretsiz hesap açın; tez, makale veya araştırma önerinizi gerçek kaynaklarla adım adım yazmaya başlayın.",
      en: "Create a free account — no credit card needed — and start writing your thesis, paper or research proposal step by step with real sources.",
    },
    keywords: { tr: ["Academiana kayıt", "ücretsiz tez yazma aracı"], en: ["Academiana sign up", "free thesis writing tool"] },
  },
  "/giris": {
    title: { tr: "Giriş Yap | Academiana", en: "Sign In | Academiana" },
    description: { tr: "Academiana hesabınıza giriş yapın.", en: "Sign in to your Academiana account." },
    keywords: { tr: [], en: [] },
    noindex: true,
  },
};
