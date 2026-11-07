/**
 * “Örnek çıktılar” sayfasının içeriği (D72). Tüm örnekler tek bir KURGUSAL çalışma üzerindendir;
 * kaynaklar, yazarlar ve veriler temsilidir ve sayfada açıkça belirtilir. İstatistik tabloları, grafik
 * ve atıf biçimleri elle yazılmaz: sitenin kendi motorlarıyla bu örnek veriden üretilir.
 * İstemci + sunucu ortak, saf modül. Metinler { tr, en } biçimindedir (faq.ts gibi).
 */
import type { CitationItem } from "@/lib/citations/types";

export type L2 = { tr: string; en: string };
export const pick = (x: L2, l: "tr" | "en") => x[l];

/** Örnek çalışma */
export const SAMPLE_WORK = {
  title: { tr: "Üniversite Öğrencilerinde Sosyal Medya Kullanımı, Akademik Erteleme ve Uyku Kalitesi Arasındaki İlişkinin İncelenmesi", en: "Examining the Relationship Between Social Media Use, Academic Procrastination and Sleep Quality in University Students" },
  type: { tr: "Yüksek lisans tezi · Eğitim bilimleri · APA 7", en: "Master’s thesis · Educational sciences · APA 7" },
};

/** Kurgusal kaynaklar (DOI verilmez; gerçek bir yayına işaret etmesin) */
export const SAMPLE_SOURCES: CitationItem[] = [
  { id: "s1", type: "article-journal", title: "Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme", authors: [{ family: "Kaya", given: "Elif" }], year: 2021, containerTitle: "Örnek Psikoloji Dergisi", volume: "12", issue: "3", pages: "45-62" },
  { id: "s2", type: "article-journal", title: "Gece ekran kullanımı ve uyku kalitesi: Bir tarama çalışması", authors: [{ family: "Demir", given: "Ali" }, { family: "Aksoy", given: "Merve" }], year: 2022, containerTitle: "Örnek Sağlık Bilimleri Dergisi", volume: "8", issue: "1", pages: "101-118" },
  { id: "s3", type: "article-journal", title: "Smartphone use, bedtime procrastination and sleep in college students", authors: [{ family: "Lee", given: "Jin" }, { family: "Park", given: "Soo" }, { family: "Chen", given: "Li" }], year: 2020, containerTitle: "Sample Journal of Behavioral Studies", volume: "5", issue: "2", pages: "77-93" },
  { id: "s4", type: "book", title: "Öz düzenleme ve öğrenme", authors: [{ family: "Yılmaz", given: "Burak" }], year: 2019, publisher: "Örnek Yayınevi", publisherPlace: "Ankara" },
];

/** Deterministik örnek veri seti (N = 120): sabit tohumlu üreteç, her çizimde aynı sonuç */
/** Veri setindeki değişken adları (dile göre) */
export const VARS = {
  tr: { g: "Cinsiyet", f: "Kadın", m: "Erkek", sm: "Sosyal medya (saat)", ert: "Akademik erteleme", uyku: "Uyku kalitesi" },
  en: { g: "Gender", f: "Female", m: "Male", sm: "Social media (hours)", ert: "Academic procrastination", uyku: "Sleep quality" },
} as const;

export function sampleDataset(l: "tr" | "en" = "tr"): string[][] {
  const V = VARS[l];
  let seed = 20261103;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const norm = () => { let u = 0; while (!u) u = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd()); };
  const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));
  const head = [V.g, V.sm, "AE1", "AE2", "AE3", "AE4", "AE5", V.ert, V.uyku];
  const rows: string[][] = [head];
  for (let i = 0; i < 120; i++) {
    const male = i % 15 >= 8;
    const g = male ? V.m : V.f;
    const sm = clamp(Math.round((3.4 + 1.5 * norm()) * 2) / 2, 0.5, 9);
    const latent = 0.35 * (sm - 3.4) + 0.8 * norm() + (male ? 0.25 : 0);
    const items = [0, 1, 2, 3, 4].map((k) => clamp(Math.round(3 + 0.9 * latent + 0.55 * norm() + (k === 2 ? -0.2 : 0)), 1, 5));
    const ert = items.reduce((a, b) => a + b, 0) / 5;
    const uyku = clamp(Math.round((3.6 - 0.32 * (ert - 3) - 0.12 * (sm - 3.4) + 0.55 * norm()) * 100) / 100, 1, 5);
    rows.push([g, String(sm), ...items.map(String), ert.toFixed(2), uyku.toFixed(2)]);
  }
  return rows;
}

export interface SampleSection { id: string; icon: string; title: L2; what: L2; plan: "free" | "basic" | "pro" }

/** Sayfadaki bölümler (sıra = sayfadaki sıra) */
export const SECTIONS: SampleSection[] = [
  { id: "kurgu", icon: "Compass", plan: "free", title: { tr: "Çalışmanın kurgusu", en: "Study blueprint" }, what: { tr: "Yazmaya başlamadan önce problem, amaç, sorular, yöntem ve her bölümün planı ile kelime hedefi tek ekranda.", en: "Before you write: problem, aim, questions, method and every section’s plan and word target on one screen." } },
  { id: "baslik", icon: "Type", plan: "free", title: { tr: "Başlık önerileri", en: "Title suggestions" }, what: { tr: "Değişkenleri, örneklemi ve yöntemi yansıtan, birbirinden farklı akademik başlıklar.", en: "Distinct academic titles that reflect variables, sample and method." } },
  { id: "kaynak", icon: "Search", plan: "free", title: { tr: "Kaynak araştırması ve doğrulama", en: "Source search and verification" }, what: { tr: "17 akademik veri tabanında arama; her kaynağın erişim seviyesi ve doğrulama durumu açıkça gösterilir.", en: "Search across 17 academic databases; each source’s access level and verification status are shown." } },
  { id: "yazim", icon: "PenLine", plan: "free", title: { tr: "Bölüm taslağı", en: "Section draft" }, what: { tr: "Yalnızca projeye eklenen kaynaklara atıf yapan akademik metin; kaynağı olmayan iddia işaretlenir.", en: "Academic text that cites only sources in your project; unsupported claims are flagged." } },
  { id: "atif", icon: "Quote", plan: "free", title: { tr: "Atıf stilleri ve kaynakça", en: "Citation styles and reference list" }, what: { tr: "10 stil arasında tek tıkla geçiş; metin içi atıflar ve kaynakça kendiliğinden yeniden biçimlenir.", en: "Switch between 10 styles in one click; in-text citations and the reference list reformat themselves." } },
  { id: "matris", icon: "Table2", plan: "pro", title: { tr: "Literatür matrisi", en: "Literature matrix" }, what: { tr: "Kaynakları amaç, örneklem, yöntem ve bulgu bakımından yan yana karşılaştıran tablo.", en: "A table comparing sources side by side by aim, sample, method and findings." } },
  { id: "anket", icon: "ClipboardList", plan: "basic", title: { tr: "Yapay zekâ ile anket", en: "AI survey builder" }, what: { tr: "Amacınızı yazın; demografik sorular, ölçek blokları ve ters maddelerle uygulanmaya hazır taslak.", en: "Describe your aim; get a ready-to-use draft with demographics, scale blocks and reverse-scored items." } },
  { id: "istatistik", icon: "Sigma", plan: "basic", title: { tr: "İstatistik analizi (APA)", en: "Statistical analysis (APA)" }, what: { tr: "Verinizden APA 7 tablosu ve sonuç cümlesi: güvenirlik, t testi, korelasyon ve daha fazlası.", en: "APA 7 tables and result sentences from your data: reliability, t-test, correlation and more." } },
  { id: "grafik", icon: "BarChart3", plan: "basic", title: { tr: "APA tarzı grafik", en: "APA-style chart" }, what: { tr: "Verinizden yayına uygun, siyah-beyaz grafik; tezinize şekil olarak eklenir.", en: "Publication-ready black-and-white chart from your data, inserted as a figure." } },
  { id: "kalite", icon: "ShieldCheck", plan: "basic", title: { tr: "Kalite raporu", en: "Quality report" }, what: { tr: "Eksik künyeler, eşleşmeyen atıflar, tekrar eden kalıplar ve yapı sorunları tek raporda.", en: "Missing reference details, unmatched citations, repeated phrasing and structural issues in one report." } },
  { id: "ozet", icon: "FileText", plan: "free", title: { tr: "Özet ve Abstract", en: "Abstract (TR + EN)" }, what: { tr: "Yazılmış bölümlerden, metinde olmayan bilgi eklemeden Türkçe özet ve İngilizce abstract.", en: "Turkish and English abstracts drawn from your written sections, without adding anything new." } },
  { id: "hakem", icon: "MessageSquareReply", plan: "pro", title: { tr: "Hakem yorumlarına cevap", en: "Response to reviewers" }, what: { tr: "Her hakem yorumu için yanıt ve metinde yapılan değişikliğin yeri.", en: "A reply to each reviewer comment and where the text was changed." } },
  { id: "savunma", icon: "GraduationCap", plan: "pro", title: { tr: "Savunma provası", en: "Defence rehearsal" }, what: { tr: "Yapay zekâ jüri tezinize özgü sorular sorar, cevabınızı değerlendirir.", en: "An AI jury asks questions specific to your thesis and evaluates your answers." } },
  { id: "sunum", icon: "Presentation", plan: "pro", title: { tr: "Savunma sunumu", en: "Defence slides" }, what: { tr: "Tezinizden otomatik hazırlanan, düzenlenebilir PowerPoint sunumu.", en: "An editable PowerPoint deck generated from your thesis." } },
  { id: "cikti", icon: "FileDown", plan: "basic", title: { tr: "Word / PDF çıktısı", en: "Word / PDF export" }, what: { tr: "Kapak, içindekiler, bölümler ve kaynakçasıyla teslime hazır belge.", en: "A submission-ready document with cover, contents, chapters and references." } },
];

/** 1. Kurgu */
export const BLUEPRINT = {
  fields: [
    { k: { tr: "Araştırma problemi", en: "Research problem" }, v: { tr: "Üniversite öğrencilerinin sosyal medyada geçirdiği sürenin akademik erteleme ve uyku kalitesiyle birlikte nasıl ilişkilendiği yeterince bilinmemektedir.", en: "How university students’ time on social media relates jointly to academic procrastination and sleep quality is not well understood." } },
    { k: { tr: "Amaç", en: "Aim" }, v: { tr: "Sosyal medya kullanım süresi, akademik erteleme ve uyku kalitesi arasındaki ilişkileri incelemek ve bu ilişkilerin cinsiyete göre farklılaşıp farklılaşmadığını belirlemek.", en: "To examine the relationships between social media use, academic procrastination and sleep quality, and whether they differ by gender." } },
    { k: { tr: "Yöntem ve desen", en: "Method and design" }, v: { tr: "Nicel, ilişkisel tarama modeli.", en: "Quantitative, correlational survey design." } },
    { k: { tr: "Katılımcılar", en: "Participants" }, v: { tr: "Lisans öğrencileri; yaklaşık 300 katılımcı, kolay örnekleme (güç analiziyle kesinleştirilecek).", en: "Undergraduates; about 300 participants, convenience sampling (to be confirmed by power analysis)." } },
    { k: { tr: "Veri toplama", en: "Data collection" }, v: { tr: "Kişisel bilgi formu, akademik erteleme ölçeği ve uyku kalitesi ölçeği (izinli Türkçe uyarlamaları).", en: "Demographic form, an academic procrastination scale and a sleep quality scale (licensed Turkish adaptations)." } },
    { k: { tr: "Analiz", en: "Analysis" }, v: { tr: "Betimsel istatistikler, Cronbach alfa, bağımsız örneklemler t testi, Pearson korelasyonu, çoklu regresyon.", en: "Descriptives, Cronbach’s alpha, independent-samples t-test, Pearson correlation, multiple regression." } },
  ],
  questions: [
    { tr: "Sosyal medya kullanım süresi ile akademik erteleme arasında anlamlı bir ilişki var mıdır?", en: "Is there a significant relationship between social media use and academic procrastination?" },
    { tr: "Akademik erteleme ile uyku kalitesi arasında anlamlı bir ilişki var mıdır?", en: "Is there a significant relationship between academic procrastination and sleep quality?" },
    { tr: "Akademik erteleme puanları cinsiyete göre farklılaşmakta mıdır?", en: "Do procrastination scores differ by gender?" },
  ],
  total: 22000,
  chapters: [
    { t: { tr: "Giriş: problem, amaç ve önem", en: "Introduction: problem, aim, significance" }, w: 2500 },
    { t: { tr: "Kavramsal çerçeve ve ilgili araştırmalar", en: "Conceptual framework and related research" }, w: 7000 },
    { t: { tr: "Yöntem", en: "Method" }, w: 3000 },
    { t: { tr: "Bulgular", en: "Findings" }, w: 4500 },
    { t: { tr: "Tartışma", en: "Discussion" }, w: 3500 },
    { t: { tr: "Sonuç ve öneriler", en: "Conclusion and recommendations" }, w: 1500 },
  ],
};

/** 2. Başlık önerileri */
export const TITLES: { t: L2; n: L2 }[] = [
  { t: SAMPLE_WORK.title, n: { tr: "İlişkisel desen ve üç değişken açıkça görünür.", en: "Correlational design and all three variables are explicit." } },
  { t: { tr: "Sosyal Medya Kullanım Süresinin Akademik Erteleme ve Uyku Kalitesiyle İlişkisi: Lisans Öğrencileri Örneği", en: "Social Media Use Time in Relation to Procrastination and Sleep Quality: The Case of Undergraduates" }, n: { tr: "Örneklemi öne çıkarır.", en: "Highlights the sample." } },
  { t: { tr: "Üniversite Öğrencilerinde Akademik Erteleme ve Uyku Kalitesinin Yordayıcısı Olarak Sosyal Medya Kullanımı", en: "Social Media Use as a Predictor of Procrastination and Sleep Quality in University Students" }, n: { tr: "Regresyon (yordama) yaklaşımını vurgular.", en: "Emphasises the predictive (regression) approach." } },
];

/** 3. Kaynak araştırması */
export const SEARCH_RESULTS = [
  { id: "s1", access: "full_text", verified: true, db: "DergiPark · OpenAlex", cites: 38 },
  { id: "s2", access: "abstract", verified: true, db: "TR Dizin · Crossref", cites: 21 },
  { id: "s3", access: "abstract", verified: true, db: "PubMed · OpenAlex", cites: 64 },
  { id: "s4", access: "metadata", verified: false, db: "Elle eklendi", cites: 0 },
] as const;

/** 4. Bölüm taslağı: {c:id} atıf yerleri, sistem bunları seçilen stilde biçimler */
export const DRAFT = {
  heading: { tr: "2.3 Sosyal Medya Kullanımı ve Akademik Erteleme", en: "2.3 Social Media Use and Academic Procrastination" },
  paras: [
    { tr: "Sosyal medyada geçirilen sürenin artması, öğrencilerin akademik görevleri erteleme eğilimiyle ilişkilendirilmektedir {c:s1}. Özellikle gece saatlerindeki ekran kullanımının uyku başlangıcını geciktirdiği ve uyku kalitesini düşürdüğü bildirilmektedir {c:s2,s3}.", en: "Increased time on social media has been associated with students’ tendency to postpone academic tasks {c:s1}. Screen use late at night in particular is reported to delay sleep onset and lower sleep quality {c:s2,s3}." },
    { tr: "Öz düzenleme becerileri, bu ilişkide koruyucu bir etken olarak ele alınmaktadır {c:s4}. Bu etkinin tüm yaş gruplarında aynı olduğu ise [KAYNAK GEREKLİ].", en: "Self-regulation skills are discussed as a protective factor in this relationship {c:s4}. Whether this effect is the same across all age groups [CITATION NEEDED]." },
  ],
};

/** 6. Literatür matrisi */
export const MATRIX: { src: string; aim: L2; sample: L2; method: L2; finding: L2 }[] = [
  { src: "s1", aim: { tr: "Sosyal medya kullanımı ile erteleme ilişkisi", en: "Social media use and procrastination" }, sample: { tr: "412 lisans öğrencisi", en: "412 undergraduates" }, method: { tr: "İlişkisel tarama", en: "Correlational survey" }, finding: { tr: "Kullanım süresi arttıkça erteleme artıyor", en: "Procrastination rises with use time" } },
  { src: "s2", aim: { tr: "Gece ekran kullanımı ve uyku", en: "Night-time screen use and sleep" }, sample: { tr: "286 öğrenci", en: "286 students" }, method: { tr: "Tarama, regresyon", en: "Survey, regression" }, finding: { tr: "Gece kullanımı uyku kalitesini yordayan değişken", en: "Night use predicts sleep quality" } },
  { src: "s3", aim: { tr: "Yatma saatini erteleme ve uyku", en: "Bedtime procrastination and sleep" }, sample: { tr: "530 üniversite öğrencisi", en: "530 college students" }, method: { tr: "Kesitsel, yapısal eşitlik modeli", en: "Cross-sectional SEM" }, finding: { tr: "Erteleme, akıllı telefon kullanımı ile uyku arasında aracı", en: "Procrastination mediates phone use and sleep" } },
];

/** 7. Anket taslağı */
export const SURVEY = {
  title: { tr: "Sosyal Medya, Erteleme ve Uyku Anketi", en: "Social Media, Procrastination and Sleep Survey" },
  minutes: 7,
  blocks: [
    { kind: "single", code: "Cinsiyet", q: { tr: "Cinsiyetiniz", en: "Gender" }, opts: { tr: "Kadın · Erkek · Belirtmek istemiyorum", en: "Female · Male · Prefer not to say" } },
    { kind: "number", code: "SM_saat", q: { tr: "Günde ortalama kaç saat sosyal medya kullanıyorsunuz?", en: "On average, how many hours a day do you use social media?" }, opts: { tr: "0–24 arası sayı", en: "Number, 0–24" } },
    { kind: "likert", code: "AE", q: { tr: "Aşağıdaki ifadelere ne ölçüde katıldığınızı belirtiniz.", en: "Indicate how much you agree with the statements below." }, items: [
      { tr: "Ödevlerimi son ana kadar ertelerim.", en: "I put off assignments until the last minute." },
      { tr: "Ders çalışmaya başlamakta zorlanırım.", en: "I find it hard to start studying." },
      { tr: "Planladığım akademik işleri zamanında bitiririm.", en: "I finish planned academic work on time." },
      { tr: "Sınavlara hazırlanmayı son güne bırakırım.", en: "I leave exam preparation to the last day." },
      { tr: "Ders çalışırken sık sık telefonuma bakarım.", en: "I often check my phone while studying." },
    ], reverse: [2] },
  ],
};

/** 10. Kalite raporu */
export const QUALITY = {
  score: 86,
  items: [
    { tone: "amber", t: { tr: "2 kaynakta eksik künye", en: "2 sources with missing details" }, d: { tr: "Yılmaz (2019): yayın yeri doğrulanmadı · Lee vd. (2020): DOI yok", en: "Yılmaz (2019): place not verified · Lee et al. (2020): no DOI" } },
    { tone: "amber", t: { tr: "1 [KAYNAK GEREKLİ] işareti", en: "1 [CITATION NEEDED] marker" }, d: { tr: "2.3 Sosyal Medya Kullanımı ve Akademik Erteleme, 2. paragraf", en: "2.3 Social Media Use and Academic Procrastination, paragraph 2" } },
    { tone: "ink", t: { tr: "Tekrar eden kalıp: “önemli bir rol oynamaktadır” (4 kez)", en: "Repeated phrase: “plays an important role” (4 times)" }, d: { tr: "Kavramsal çerçeve bölümünde; farklı ifadelerle çeşitlendirin.", en: "In the conceptual framework; vary the wording." } },
    { tone: "green", t: { tr: "Metin içi atıflar ile kaynakça uyumlu", en: "In-text citations match the reference list" }, d: { tr: "Eşleşmeyen atıf yok.", en: "No unmatched citations." } },
  ],
};

/** 12. Hakem yanıtı */
export const REVIEWER: { c: L2; r: L2; where: L2 }[] = [
  { c: { tr: "Örneklemin yalnızca bir üniversiteden seçilmesi genellenebilirliği sınırlıyor.", en: "Sampling from a single university limits generalisability." }, r: { tr: "Haklı bir tespit. Bu durumu sınırlılıklar bölümüne ekledik ve gelecekteki çalışmalar için çok merkezli örneklem önerdik.", en: "A fair point. We added this to the limitations and recommend multi-site sampling for future studies." }, where: { tr: "Sınırlılıklar, s. 64", en: "Limitations, p. 64" } },
  { c: { tr: "Ölçeklerin güvenirlik katsayıları raporlanmamış.", en: "Reliability coefficients of the scales are not reported." }, r: { tr: "Cronbach alfa katsayılarını Yöntem bölümüne ekledik (Tablo 3).", en: "We added Cronbach’s alpha coefficients to the Method section (Table 3)." }, where: { tr: "Yöntem, Tablo 3, s. 38", en: "Method, Table 3, p. 38" } },
];

/** 13. Savunma provası */
export const DEFENSE = {
  q: { tr: "Neden kolay örnekleme yöntemini seçtiniz ve bu tercih bulgularınızı nasıl etkiler?", en: "Why did you choose convenience sampling, and how does it affect your findings?" },
  a: { tr: "Zaman ve erişim kısıtları nedeniyle kolay örnekleme kullandık. Bu nedenle bulguları evrene genellerken temkinli olduk ve bunu sınırlılıklarda belirttik.", en: "We used convenience sampling because of time and access constraints, so we were cautious about generalising and noted this in the limitations." },
  score: 7,
  good: { tr: "Sınırlılığı açıkça kabul ediyorsunuz; jüri bunu olumlu karşılar.", en: "You acknowledge the limitation openly; juries respond well to this." },
  improve: { tr: "Örneklem büyüklüğünü neye göre belirlediğinizi (güç analizi) ve örneklemin hangi özellikler bakımından evrene benzediğini ekleyin.", en: "Add how you determined sample size (power analysis) and in which respects the sample resembles the population." },
};
