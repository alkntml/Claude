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
  "/": {
    title: {
      tr: "Academiana — Yapay Zekâ Destekli Tez ve Makale Yazım Platformu",
      en: "Academiana — AI Thesis & Academic Writing Assistant with Real Sources",
    },
    description: {
      tr: "Tez, makale, literatür taraması ve TÜBİTAK önerinizi gerçek akademik kaynaklarla adım adım yazın. APA 7 atıf, istatistik analizi, anket ve Word çıktısı.",
      en: "Write your thesis, research paper or literature review step by step with verified academic sources. Automatic APA 7 citations, statistics, surveys and Word export.",
    },
    keywords: {
      tr: ["tez yazma", "yapay zeka tez yazma", "akademik yazım asistanı", "makale yazma", "literatür taraması", "APA 7 kaynak gösterme", "kaynakça oluşturma", "TÜBİTAK 2209-A", "tez önerisi", "istatistik analizi", "anket hazırlama", "Academiana"],
      en: ["AI thesis writer", "academic writing assistant", "AI research paper writer", "literature review tool", "APA 7 citation generator", "reference generator", "thesis help", "dissertation writing tool", "statistics for thesis", "survey builder for research", "Academiana"],
    },
    tagline: { tr: "Gerçek kaynaklarla yapay zekâ destekli akademik yazım", en: "AI academic writing with real, verified sources" },
  },
  "/fiyatlar": {
    title: { tr: "Fiyatlar ve Paketler — Ücretsiz Başlayın | Academiana", en: "Pricing & Plans — Start Free | Academiana" },
    description: {
      tr: "Academiana paketleri: ücretsiz başlangıç, %20 akademik ekip indirimi ve kurum lisansı. Paketlerin özelliklerini ve araçlarını karşılaştırın.",
      en: "Academiana plans: free tier, 20% academic team discount and institutional licences. Compare plan features and tools.",
    },
    keywords: { tr: ["tez yazma programı fiyat", "akademik yazım aracı ücretsiz", "akademisyen indirimi", "Academiana fiyat"], en: ["academic writing tool pricing", "AI thesis writer free", "academic team discount", "Academiana pricing"] },
    tagline: { tr: "Ücretsiz başlayın, ihtiyacınız kadar yükseltin", en: "Start free, upgrade when you need" },
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
  "/uzman-destegi": {
    title: { tr: "Uzman Desteği — Redaksiyon, İstatistik, Çeviri | Academiana", en: "Expert Support — Editing, Statistics, Translation | Academiana" },
    description: {
      tr: "Akademik dil ve redaksiyon, istatistik danışmanlığı, akademik çeviri ve biçim kontrolü için uzman desteği. Yapay zekânın yetmediği yerde insan uzmanlar.",
      en: "Expert help with academic editing, statistics consulting, academic translation and formatting checks — human experts where AI is not enough.",
    },
    keywords: { tr: ["tez redaksiyon", "istatistik danışmanlığı", "akademik çeviri", "tez biçim kontrolü"], en: ["academic editing service", "statistics consulting thesis", "academic translation Turkish English"] },
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
