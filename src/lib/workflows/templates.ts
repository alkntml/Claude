/**
 * Dinamik akademik yol haritası motoru (D171; “Dinamik Akademik Yol Haritası ve Metodoloji Referansı” v1.0).
 * Yol haritası tek bir sabit şablondan değil; çalışma türü, alt tür (bitirme projesi türü, derleme türü), akademik düzey,
 * araştırma yaklaşımı (nicel/nitel/karma/kuramsal/sistematik derleme/meta-analiz), araştırma deseni ve program birlikte
 * değerlendirilerek üretilir. Her bölüm için işlevsel kimlik (key), görünen başlık, zorunluluk (zorunlu/koşullu/isteğe bağlı),
 * gerekçe (neden önerildiği), kritiklik (silinirken uyarı) ve düzeye göre önerilen kapsam hesaplanır.
 * Varsayılanlar öneridir: kullanıcı her bölümü ekleyebilir, silebilir, yeniden adlandırabilir, sıralayabilir, gizleyebilir.
 * Saf modül (istemci + sunucu + test).
 */
import { STAGE_LIBRARY } from "./stages";

/** Şablon sürümü: yol haritası kuralları değişince artırılır; mevcut projeler kendiliğinden değişmez (karşılaştırıp uygulanır) */
export const TEMPLATE_VERSION = 3;

export type Requirement = "required" | "conditional" | "optional";
export type Scope = "brief" | "standard" | "detailed";
export const REQUIREMENT_LABEL: Record<Requirement, string> = { required: "Zorunlu", conditional: "Koşullu", optional: "İsteğe bağlı" };
export const SCOPE_LABEL: Record<Scope, string> = { brief: "Kısa", standard: "Orta", detailed: "Ayrıntılı" };

export type Approach = "quantitative" | "qualitative" | "mixed" | "theoretical" | "systematic_review" | "meta_analysis";
export const EMPIRICAL: Approach[] = ["quantitative", "qualitative", "mixed"];

/** Bitirme projesi türleri (referans 4.4) */
export type CapstoneKind = "research" | "software" | "business" | "education";
export const CAPSTONE_KINDS: { id: CapstoneKind; label: string }[] = [
  { id: "research", label: "Araştırma odaklı" },
  { id: "software", label: "Tasarım, yazılım ve mühendislik odaklı" },
  { id: "business", label: "İşletme / vaka analizi" },
  { id: "education", label: "Eğitim / uygulama projesi" },
];

/** Araştırma desenleri (referans 2.1). Liste kapalı değildir; yeni desen buraya eklenir. */
export interface Design { id: string; label: string; approach: "quantitative" | "qualitative" | "mixed"; guidance: string; standards: string[] }
export const DESIGNS: Design[] = [
  { id: "descriptive_survey", label: "Betimsel tarama", approach: "quantitative", guidance: "Evren-örneklem ve örneklem büyüklüğünün gerekçesi, ölçme araçlarının geçerlik/güvenirliği, betimsel istatistikler (frekans, yüzde, ortalama, standart sapma).", standards: ["APA JARS-Quant", "STROBE"] },
  { id: "correlational", label: "İlişkisel tarama / korelasyonel desen", approach: "quantitative", guidance: "Değişkenlerin kavramsallaştırılması, ilişki hipotezleri (gerekiyorsa), korelasyon/regresyon analizi, varsayım kontrolleri, etki büyüklüğü ve güven aralıkları; neden-sonuç dili kullanılmaz.", standards: ["APA JARS-Quant", "STROBE"] },
  { id: "causal_comparative", label: "Nedensel karşılaştırma", approach: "quantitative", guidance: "Karşılaştırılan grupların tanımı, grup farkı testleri (t testi, ANOVA veya parametrik olmayan karşılıkları), varsayımlar ve etki büyüklüğü; nedensellik iddiasının sınırları.", standards: ["APA JARS-Quant", "STROBE"] },
  { id: "experimental", label: "Deneysel / yarı deneysel desen", approach: "quantitative", guidance: "Deney ve kontrol grupları, atama yöntemi (seçkisiz/seçkisiz olmayan), müdahalenin (uygulamanın) ayrıntılı tanımı, ön test–son test ölçümleri, sadakat (fidelity), iç ve dış geçerlik tehditleri.", standards: ["APA JARS-Quant", "CONSORT"] },
  { id: "cross_longitudinal", label: "Kesitsel / boylamsal desen", approach: "quantitative", guidance: "Ölçüm zamanları, kayıp veri ve katılımcı kaybı, tekrarlı ölçüm analizleri (boylamsal desende).", standards: ["APA JARS-Quant", "STROBE"] },
  { id: "cohort_case_control", label: "Kohort / vaka-kontrol deseni", approach: "quantitative", guidance: "Maruziyet ve sonuç tanımları, eşleştirme, karıştırıcı değişkenler, risk oranları/olasılık oranları ve güven aralıkları.", standards: ["STROBE"] },
  { id: "phenomenology", label: "Fenomenoloji", approach: "qualitative", guidance: "Olguyu deneyimleyen katılımcıların amaçlı seçimi, derinlemesine görüşme, paranteze alma, anlam birimleri ve özün betimlenmesi.", standards: ["APA JARS-Qual", "COREQ", "SRQR"] },
  { id: "case_study", label: "Durum çalışması", approach: "qualitative", guidance: "Durumun ve sınırlarının tanımı, çoklu veri kaynakları (görüşme, gözlem, doküman), veri çeşitlemesi, tekli/çoklu durum mantığı.", standards: ["APA JARS-Qual", "SRQR"] },
  { id: "grounded_theory", label: "Gömülü kuram", approach: "qualitative", guidance: "Kuramsal örnekleme, sürekli karşılaştırma, açık-eksen-seçici kodlama, kuramsal doygunluk ve ortaya çıkan modelin sunumu.", standards: ["APA JARS-Qual", "SRQR"] },
  { id: "ethnography", label: "Etnografi", approach: "qualitative", guidance: "Sahaya giriş, katılımcı gözlem, alan notları, kültürel bağlamın kalın betimlemesi ve araştırmacının konumu.", standards: ["APA JARS-Qual", "SRQR"] },
  { id: "narrative", label: "Anlatı araştırması", approach: "qualitative", guidance: "Bireysel anlatıların toplanması, yeniden hikâyeleştirme, zaman ve bağlam boyutları.", standards: ["APA JARS-Qual", "SRQR"] },
  { id: "action_research", label: "Eylem araştırması", approach: "qualitative", guidance: "Planlama–uygulama–gözlem–yansıtma döngüleri, paydaş katılımı ve değişimin belgelenmesi.", standards: ["APA JARS-Qual", "SRQR"] },
  { id: "document_analysis", label: "Nitel doküman incelemesi", approach: "qualitative", guidance: "Dokümanların seçim ölçütleri ve erişim yolu, kodlama çerçevesi, içerik/doküman analizi ve doküman kaynaklarının sınırlılıkları.", standards: ["APA JARS-Qual", "SRQR"] },
  { id: "explanatory_sequential", label: "Açıklayıcı sıralı (QUAN → QUAL)", approach: "mixed", guidance: "Önce nicel veri toplanır ve analiz edilir; nitel aşama nicel sonuçları açıklamak için tasarlanır. Bağlantı noktası ve katılımcı seçimi nicel sonuçlara göre yapılır.", standards: ["APA JARS-Mixed", "GRAMMS"] },
  { id: "exploratory_sequential", label: "Keşfedici sıralı (QUAL → QUAN)", approach: "mixed", guidance: "Önce nitel keşif yapılır; bulgular nicel aşamada ölçek/araç geliştirme veya test için kullanılır.", standards: ["APA JARS-Mixed", "GRAMMS"] },
  { id: "convergent_parallel", label: "Yakınsayan paralel (QUAN + QUAL)", approach: "mixed", guidance: "Nicel ve nitel veri eş zamanlı toplanır, ayrı analiz edilir ve yorum aşamasında karşılaştırılarak birleştirilir (ortak gösterim tablosu).", standards: ["APA JARS-Mixed", "GRAMMS"] },
  { id: "embedded", label: "Gömülü karma desen", approach: "mixed", guidance: "Bir yaklaşım ana desendir; diğeri onun içinde destekleyici rol oynar (ör. deney içinde nitel süreç verisi).", standards: ["APA JARS-Mixed", "GRAMMS"] },
  { id: "multiphase", label: "Çok aşamalı karma desen", approach: "mixed", guidance: "Birden fazla sıralı/eş zamanlı aşama, her aşamanın amacı, örneklemi ve aşamalar arası bağlantılar.", standards: ["APA JARS-Mixed", "GRAMMS"] },
];
export const designById = (id?: string | null) => DESIGNS.find((d) => d.id === id) ?? null;
/** Desenin önerildiği disiplinler (boşsa hepsi). Disipline uygun olmayan desen gereksiz yere gösterilmez (referans 2.1). */
const DESIGN_DISCIPLINES: Record<string, DisciplineGroup[]> = { cohort_case_control: ["health", "other"] };
export const designsFor = (approach?: string | null, discipline?: string | null, extra: (Design & { disciplines?: string[] })[] = []) => {
  const g = disciplineGroup(discipline);
  return [...DESIGNS, ...extra.filter((x) => !DESIGNS.some((d) => d.id === x.id))].filter((d) => d.approach === approach)
    .filter((d) => { const only = (d as { disciplines?: string[] }).disciplines ?? DESIGN_DISCIPLINES[d.id]; return !only?.length || !discipline?.trim() || only.includes(g); });
};

/** Disiplin kategorisi (serbest metinden): raporlama pratikleri ve terminoloji için */
export type DisciplineGroup = "health" | "education" | "engineering" | "business" | "social" | "humanities" | "other";
export function disciplineGroup(text?: string | null): DisciplineGroup {
  const t = (text ?? "").toLocaleLowerCase("tr");
  if (/tıp|hemşire|sağlık|eczac|diş|fizyoterap|beslenme|ebelik|halk sağlığı|medic|nurs|health|pharm/.test(t)) return "health";
  if (/eğitim|öğretim|pedagoj|education|teaching/.test(t)) return "education";
  if (/mühendis|bilgisayar|yazılım|elektrik|makine|inşaat|endüstri|engineer|computer|software/.test(t)) return "engineering";
  if (/işletme|iktisat|ekonomi|yönetim|pazarlama|muhasebe|finans|business|econom|management/.test(t)) return "business";
  if (/tarih|edebiyat|felsefe|ilahiyat|sanat|dil bilim|history|literature|philosophy|theolog/.test(t)) return "humanities";
  if (/psikoloji|sosyoloji|iletişim|siyaset|kamu|sosyal|psycholog|sociolog|communication|political/.test(t)) return "social";
  return "other";
}

/** Raporlama standartları (referans 14): yaklaşıma, desene ve çalışma türüne göre; hepsi birden dayatılmaz */
export function reportingStandards(p: { workType?: string; approach?: string | null; design?: string | null; discipline?: string | null; extra?: Design[] }): string[] {
  const d = designById(p.design) ?? p.extra?.find((x) => x.id === p.design);
  if (d) {
    // Sağlık dışı alanlarda sağlık odaklı kontrol listeleri (STROBE, CONSORT, COREQ) dayatılmaz; APA JARS/SRQR yeterli
    const g = disciplineGroup(p.discipline);
    const health = new Set(["STROBE", "CONSORT", "COREQ"]);
    const list = g === "health" || !p.discipline?.trim() ? d.standards : d.standards.filter((x) => !health.has(x));
    return list.length ? list : d.standards;
  }
  if (p.approach === "systematic_review" || p.approach === "meta_analysis") return ["PRISMA 2020"];
  if (p.approach === "quantitative") return ["APA JARS-Quant"];
  if (p.approach === "qualitative") return ["APA JARS-Qual"];
  if (p.approach === "mixed") return ["APA JARS-Mixed"];
  return [];
}

export interface TemplateInput {
  workType: string;
  level: string;
  methodology?: string | null;
  program?: string | null;
  design?: string | null;
  variant?: string | null;
}

export interface TemplateSection {
  key: string;
  title: string;
  description: string;
  requirement: Requirement;
  /** Neden önerildiği / koşulun açıklaması (şeffaflık) */
  why: string;
  /** Silinirse akademik bütünlük zarar görür: kullanıcı uyarılır, onayla silinir */
  critical: boolean;
  scope: Scope;
}

/** Bir bölüm kaydı: key + (isteğe bağlı) başlık/gerekçe/zorunluluk */
interface Item { key: string; title?: string; req?: Requirement; why?: string; critical?: boolean }
const it = (key: string, o: Omit<Item, "key"> = {}): Item => ({ key, ...o });

const isEmpirical = (m?: string | null) => !!m && (EMPIRICAL as string[]).includes(m);

/** Tez iskeleti (referans 4.1): giriş → kuramsal çerçeve/literatür → yöntem → bulgular → tartışma → sonuç */
function thesis(m: string, level: string): Item[] {
  const out: Item[] = [
    // Ön sayfalar (referans 4.1/1): kapak, içindekiler ve listeler dışa aktarmada otomatik; onay/beyan/önsöz kullanıcıdan
    it("front_matter", { req: "conditional", why: "Onay sayfası, bilimsel etik beyanı ve önsöz enstitü kılavuzuna göre eklenir; kapak, içindekiler ve tablo/şekil listeleri dışa aktarmada otomatik oluşur." }),
    it("title_abstract", { title: "Özet ve Abstract", critical: true, why: "Tezlerde Türkçe özet ve İngilizce abstract ön sayfalarda yer alır; tüm bölümler yazıldıktan sonra en son yazılır." }),
    it("topic", { critical: true }), it("problem", { critical: true }), it("purpose", { critical: true }),
    m === "qualitative"
      ? it("questions", { title: "Araştırma soruları", why: "Nitel araştırmada hipotez kurulmaz; açık uçlu araştırma soruları yazılır." })
      : m === "mixed"
        ? it("questions", { title: "Nicel ve nitel araştırma soruları", why: "Karma yöntemde her bileşenin ve entegrasyonun sorusu ayrı yazılır." })
        : m === "quantitative"
          ? it("questions", { why: "Hipotezler yalnızca araştırma amacı gerektiriyorsa yazılır.", critical: true })
          : it("questions", { title: "Araştırma soruları", critical: true }),
    it("scope_limits", { req: "conditional", why: "Kapsam, varsayım, sınırlılık ve tanımlar enstitü kılavuzlarının çoğunda Giriş’te istenir; kılavuzunuzda yoksa silebilirsiniz." }),
    it("concepts", { critical: true }),
    ...(level === "bachelor" ? [] : [it("theory", { req: "conditional", why: "Yüksek lisans ve doktorada kuramsal çerçeve ayrı başlıkta derinleştirilir." })]),
    it("literature", { critical: true, why: "Literatür; kavramları, kuramları, güncel ampirik çalışmaları ve araştırma boşluğunu sentezleyen kapsamlı bir bölümdür." }),
    ...(level === "doctorate" || level === "master" ? [it("gaps", { req: "conditional", why: "Araştırma boşluğunun kanıta dayalı gösterilmesi lisansüstü düzeyde beklenir." })] : []),
  ];
  if (m === "theoretical") {
    out.push(it("method", { title: "Araştırmanın yöntemi ve inceleme yaklaşımı", critical: true, why: "Kuramsal çalışmada da inceleme yaklaşımı ve kaynak seçimi açıklanır; örneklem ve istatistik başlıkları eklenmez." }));
    out.push(it("discussion", { title: "Kuramsal tartışma", critical: true }), it("conclusion", { critical: true }));
  } else if (m === "systematic_review" || m === "meta_analysis") {
    out.push(it("review_protocol", { critical: true }), it("search_strategy", { critical: true }), it("source_screening", { critical: true }), it("data_extraction", { critical: true }));
    if (m === "meta_analysis") out.push(it("meta_analysis", { critical: true, why: "Meta-analiz, karşılaştırılabilir nicel verilerle yapılan istatistiksel sentezdir." }));
    out.push(it("review_synthesis", { critical: true }), it("discussion", { critical: true }), it("conclusion", { critical: true }));
  } else {
    out.push(it("method", { title: m === "qualitative" ? "Araştırmanın deseni" : m === "mixed" ? "Karma yöntemin gerekçesi ve deseni" : undefined, critical: true }));
    out.push(m === "qualitative" ? it("participants", { critical: true, why: "Nitel araştırmada amaçlı örnekleme ve çalışma grubu tanımlanır." })
      : it("sample", { critical: true, title: m === "mixed" ? "Her aşamanın örneklemi" : undefined, why: m === "mixed" ? "Karma yöntemde her aşamanın örneklemi ayrı açıklanır." : "Evren, örneklem ve örneklem büyüklüğünün gerekçesi." }));
    out.push(it("instruments", { critical: true, title: m === "qualitative" ? "Veri kaynakları ve veri toplama süreci" : m === "mixed" ? "Nicel ve nitel veri toplama araçları" : undefined }));
    out.push(it("analysis", { critical: true, title: m === "qualitative" ? "Kodlama ve analiz yaklaşımı" : m === "mixed" ? "Nicel ve nitel analizler" : undefined }));
    if (m === "qualitative" || m === "mixed") out.push(it("trustworthiness", { req: m === "mixed" ? "conditional" : "required", critical: m === "qualitative", why: "Nitel bileşende inandırıcılık, aktarılabilirlik, tutarlılık, teyit edilebilirlik ve araştırmacının konumu açıklanır." }));
    out.push(it("ethics", { req: "required", critical: true, why: "İnsan katılımcılı araştırmada etik kurul onayı ve bilgilendirilmiş onam raporlanır." }));
    out.push(it("findings", { critical: true }));
    if (m === "mixed") out.push(it("integration", { critical: true, why: "Karma yöntemde nicel ve nitel bulguların entegrasyonu ve meta-çıkarımlar temel gerekliliktir." }));
    out.push(it("discussion", { critical: true }), it("conclusion", { critical: true }));
  }
  out.push(it("references", { critical: true }), it("appendices", { req: "optional", why: "Ölçekler, izin belgeleri ve ek tablolar varsa eklenir." }));
  return out;
}

/** Araştırma makalesi (referans 4.2): ampirikte IMRaD; kuramsal/derleme yaklaşımda Giriş → konu bölümleri → Sonuç */
function article(m: string): Item[] {
  if (!isEmpirical(m)) {
    return [it("title_abstract", { critical: true }), it("introduction", { critical: true }),
      it("article_body", { critical: true, why: "Kaynaklara dayalı makalede konu, içeriğe özgü numaralı ana bölümlerde işlenir; Yöntem/Bulgular eklenmez." }),
      it("conclusion_article", { critical: true }), it("declarations", { req: "conditional", why: "Derginin istediği etik, çıkar çatışması, fon ve yapay zekâ beyanları." }), it("references", { critical: true })];
  }
  return [
    it("title_abstract", { critical: true }), it("introduction", { critical: true, why: "Problem, literatür boşluğu, gerekçe ve amaç; tezdeki uzun kuramsal çerçeve makaleye eklenmez." }),
    it("methods_article", { critical: true, why: m === "qualitative" ? "Nitel makalede bağlam, katılımcı seçimi, veri üretimi, analiz ve araştırmacının konumu (refleksivite) görünür olmalıdır." : m === "mixed" ? "Karma makalede desen, aşamalar, her aşamanın örneklemi ve analizi ile entegrasyon stratejisi görünür olmalıdır." : "Nicel makalede ölçüm, örneklem ve istatistiksel raporlama görünür olmalıdır." }),
    it("results_article", { critical: true, why: m === "qualitative" ? "Bulgular tema, alt tema ve kullanıcının gerçek verisinden alıntılarla sunulur." : m === "mixed" ? "Nicel ve nitel bulgular ayrı, ardından bütünleştirilmiş olarak sunulur." : "Bulgular araştırma sorularına/hipotezlere göre istatistik, tablo ve etki ölçüleriyle sunulur." }),
    ...(m === "mixed" ? [it("integration", { critical: true, why: "Karma yöntem makalesinde entegrasyon ve meta-çıkarımlar görünür olmalıdır." })] : []),
    it("discussion_article", { critical: true, why: "Temel bulgular literatürle değerlendirilir; sonuç ve çıkarımlar derginin yapısına göre tartışmaya entegre edilir." }),
    it("declarations", { req: "conditional", why: "Derginin istediği etik, çıkar çatışması, fon ve yazar katkısı beyanları." }), it("references", { critical: true }),
    it("appendices", { req: "optional", title: "Ek materyal", why: "Derginin kabul ettiği ek materyal (ölçek, ek tablolar, veri erişimi) varsa eklenir." }),
  ];
}

function capstone(kind: string, m: string): Item[] {
  if (kind === "software") return [
    it("requirements_analysis", { critical: true }), it("literature", { title: "Mevcut çözümler ve literatür" }), it("design_development", { title: "Tasarım kararları ve sistem mimarisi", critical: true }),
    it("tech_choice"), it("implementation", { critical: true }), it("testing", { title: "Test, doğrulama ve performans değerlendirmesi", critical: true }),
    it("conclusion", { title: "Sonuç ve gelecek geliştirmeler", critical: true }), it("references", { critical: true }), it("appendices", { req: "optional" }),
  ];
  if (kind === "business") return [
    it("case_context", { critical: true }), it("problem", { title: "Problem tanımı", critical: true }), it("theory", { title: "Kuramsal dayanak" }),
    it("method", { title: "Veri ve analiz yaklaşımı", critical: true }), it("findings", { critical: true }), it("strategic_recommendations", { critical: true }),
    it("references", { critical: true }), it("appendices", { req: "optional" }),
  ];
  if (kind === "education") return [
    it("needs_analysis", { critical: true }), it("theory", { title: "Kuramsal dayanak" }), it("program_design", { critical: true }),
    it("implementation", { title: "Uygulama süreci", critical: true }), it("evaluation", { critical: true }), it("conclusion", { title: "Sonuç ve iyileştirme önerileri", critical: true }),
    it("references", { critical: true }), it("appendices", { req: "optional" }),
  ];
  // Araştırma odaklı: uygulama projesine gereksiz hipotez/örneklem eklenmez; ampirik yaklaşımda yöntem alt kısımları
  return [
    it("problem", { title: "Problem ve amaç", critical: true }), it("literature", { title: "Literatür ve kavramsal temel", critical: true }), it("method", { critical: true }),
    ...(isEmpirical(m) ? [it("findings", { critical: true }), it("discussion", { critical: true })] : []),
    it("conclusion", { critical: true }), it("references", { critical: true }), it("appendices", { req: "optional" }),
  ];
}

/** Literatür derlemeleri (referans 4.5): anlatı · sistematik · meta-analiz */
function review(m: string): Item[] {
  if (m === "systematic_review" || m === "meta_analysis") return [
    it("topic", { title: "Araştırma sorusu ve kapsam", critical: true }), it("review_protocol", { critical: true }), it("search_strategy", { critical: true }),
    it("source_screening", { critical: true, why: "Tarama ve seçim süreci PRISMA akış şemasıyla raporlanır; sayılar gerçek aramadan gelir." }), it("data_extraction", { critical: true }),
    ...(m === "meta_analysis" ? [it("meta_analysis", { critical: true })] : []),
    it("review_synthesis", { title: "Bulguların sentezi", critical: true }), it("gaps", { title: "Sınırlılıklar ve araştırma gündemi" }), it("conclusion", { title: "Sonuç", critical: true }),
    it("references", { critical: true }),
  ];
  return [
    it("topic", { title: "Konu ve kapsamın tanımlanması", critical: true }), it("concepts", { title: "Kavramsal ve kuramsal arka plan", critical: true }),
    it("review_synthesis", { title: "Literatürün tematik örgütlenmesi ve karşılaştırılması", critical: true }),
    it("gaps", { title: "Kuramsal tartışmalar, çelişkiler ve bilgi boşlukları", critical: true }), it("conclusion", { title: "Sonuç ve araştırma gündemi", critical: true }),
    it("references", { critical: true }),
  ];
}

/** Araştırma önerisi (referans 4.6): gelecekte yapılacak çalışma; bulgu/sonuç üretilmez */
function proposal(m: string, level: string): Item[] {
  return [
    it("title_abstract", { title: "Başlık ve kısa özet", req: "conditional", why: "Birçok proposal formu kısa özet ister." }),
    it("problem", { title: "Problem, gerekçe ve önem", critical: true }), it("purpose", { critical: true }),
    it("questions", { title: m === "quantitative" ? undefined : "Araştırma soruları", critical: true, why: m === "quantitative" ? "Nicel önerilerde değişkenler ve (uygunsa) hipotezler tanımlanır." : undefined }),
    it("literature", { critical: true }), ...(level === "bachelor" ? [] : [it("theory", { req: "conditional" })]),
    it("method", { critical: true }),
    ...(isEmpirical(m) ? [m === "qualitative" ? it("participants", { critical: true }) : it("sample", { critical: true }), it("instruments", { title: "Veri toplama planı" }), it("analysis", { title: m === "qualitative" ? "Nitel analiz planı" : m === "mixed" ? "Analiz ve entegrasyon planı" : "İstatistiksel analiz planı", critical: true })] : []),
    it("risks", { title: "Etik hususlar ve riskler", critical: true }), it("expected_contribution"), it("proposal_timeline", { title: "Zaman çizelgesi", critical: true }), it("references", { critical: true }),
  ];
}

function grant(program?: string | null): Item[] {
  const noBudget = program === "scholarship" || program === "tubitak_2204a" || program === "tubitak_2242";
  return [
    it("grant_summary", { critical: true }), it("grant_originality", { title: "Problem, gerekçe ve özgün değer", critical: true }), it("grant_objectives", { critical: true }),
    it("grant_literature"), it("grant_method", { title: "Yöntem ve iş paketleri", critical: true }), it("grant_management", { critical: true }),
    it("grant_risks", { critical: true }), it("grant_impact", { title: "Beklenen çıktılar ve yaygın etki", critical: true }),
    ...(noBudget ? [] : [it("grant_budget", { critical: true })]), it("references", { critical: true }),
    it("appendices", { req: "optional", why: "Çağrının istediği ekler (özgeçmiş, kurum izinleri, ölçekler) varsa eklenir." }),
  ];
}

/** Dergi makalesi / yayın uyarlama (referans 4.3): hedef derginin gereklilikleri önce; yapı yaklaşıma göre */
function journal(m: string): Item[] {
  const base = article(m);
  return [it("journal_requirements", { critical: true, why: "Hedef derginin yazar rehberi ve şablonu varsayılan yapının önündedir." }), ...base.filter((x) => x.key !== "references"),
    it("cover_letter", { req: "optional", why: "Dergi istiyorsa editöre mektup ve gönderim öncesi kontrol." }), it("references", { critical: true })];
}

/** Düzeye ve bölüm türüne göre önerilen kapsam (referans 6.3) */
function scopeFor(key: string, level: string, workType: string): Scope {
  const LIT = new Set(["literature", "theory", "concepts", "review_synthesis", "article_body", "grant_literature"]);
  const SHORT = new Set(["front_matter", "topic", "purpose", "questions", "scope_limits", "declarations", "appendices", "cover_letter", "expected_contribution", "proposal_timeline", "grant_summary", "title_abstract", "ethics"]);
  if (SHORT.has(key)) return "brief";
  if (LIT.has(key)) {
    if (workType === "thesis") return level === "bachelor" ? "standard" : "detailed";
    return workType === "literature_review" ? "detailed" : "standard";
  }
  return "standard";
}

/** Yol haritası: çalışmaya özgü, gerekçeli ve sürümlü bölüm listesi */
export function buildTemplate(p: TemplateInput): TemplateSection[] {
  const m = p.methodology ?? "quantitative";
  let items: Item[];
  switch (p.workType) {
    case "thesis": items = thesis(m, p.level); break;
    case "research_article": items = article(m); break;
    case "journal_article": items = journal(m); break;
    case "capstone": items = capstone(p.variant ?? "research", m); break;
    case "literature_review": items = review(m); break;
    case "research_proposal": items = proposal(m, p.level); break;
    case "grant_proposal": items = grant(p.program); break;
    case "text_editing": items = [it("editing_input", { critical: true }), it("editing_language", { critical: true }), it("editing_structure", { critical: true }), it("editing_citations", { critical: true }), it("editing_format", { req: "conditional", why: "Bir üniversite veya dergi formatına uyarlanacaksa." }), it("references")]; break;
    case "source_research": items = [it("search_strategy", { critical: true }), it("source_screening", { critical: true }), it("source_matrix", { critical: true }), it("annotated_notes"), it("gaps", { title: "Eleştirel sentez ve araştırma boşlukları" }), it("references", { critical: true })]; break;
    default: items = [it("references")];
  }
  return items.filter((x) => STAGE_LIBRARY[x.key]).map((x) => {
    const def = STAGE_LIBRARY[x.key];
    const req = x.req ?? "required";
    const why = x.why ?? (req === "required" ? "Bu çalışma türünün temel akademik bölümüdür." : req === "conditional" ? "Çalışmanın niteliğine ve kılavuzunuza göre gerekebilir." : "İsteğe bağlıdır; ihtiyaç duyulursa kullanılır (ör. ölçek, form veya ek tablolar).");
    return { key: x.key, title: x.title ?? def.title, description: def.purpose, requirement: req, why, critical: !!x.critical, scope: scopeFor(x.key, p.level, p.workType) };
  });
}

/** Bölüm silinmeden önce gösterilecek akademik uyarı (kritik bölümde) */
export function deletionWarning(section: { key: string; title: string }, ctx: TemplateInput): string | null {
  const t = buildTemplate(ctx).find((x) => x.key === section.key);
  if (!t?.critical) return null;
  return `“${section.title}” bu çalışma türü için kritik bir bölümdür. ${t.why} Silerseniz çalışmanın akademik bütünlüğü zarar görebilir ve kalite kontrolünde eksik olarak görünebilir.`;
}

/** Şablon ile mevcut proje arasındaki fark (uygulamadan önce gösterilir; içerik silinmez) */
export interface TemplateDiff { add: TemplateSection[]; remove: { id: string; key: string; title: string; hasText: boolean }[]; rename: { id: string; key: string; from: string; to: string }[] }
export function diffTemplate(stages: { id: string; key: string; title: string; word_count?: number }[], target: TemplateSection[]): TemplateDiff {
  const tKeys = new Set(target.map((x) => x.key));
  const sKeys = new Set(stages.map((s) => s.key));
  return {
    add: target.filter((x) => !sKeys.has(x.key)),
    remove: stages.filter((s) => !tKeys.has(s.key) && s.key !== "references").map((s) => ({ id: s.id, key: s.key, title: s.title, hasText: (s.word_count ?? 0) > 0 })),
    rename: stages.flatMap((s) => { const t = target.find((x) => x.key === s.key); return t && t.title !== s.title ? [{ id: s.id, key: s.key, from: s.title, to: t.title }] : []; }),
  };
}

/* ---------------- D171: yapay zekâ için düzeye/kapsama göre yönergeler ---------------- */

/** Literatür bölümünün işlevleri (referans 6.1); yapay zekâ bağlamına girer */
export const LITERATURE_FUNCTIONS =
  "Literatür bölümü: temel kavramları kaynaklarla tanımla; kuramsal yaklaşımları karşılaştır; tarihsel gelişimi yalnızca gerektiği kadar ver; güncel ve temel ampirik çalışmaları araştırma sorularıyla bağlantılı incele; önceki çalışmaların örneklem, yöntem, bağlam ve bulgularını karşılaştır; uzlaşma, çelişki ve yöntemsel sınırlılıkları tartış; araştırma boşluğunu kaynaklarla göster; bu çalışmanın konumunu gerekçelendir. Kaynakları art arda özetleme, tematik sentez yap. Uzunluğu dolgu veya tekrarla artırma; kapsam yetersizse eksik alt temaları, eksik kaynak türlerini ve zayıf sentez noktalarını :::eksik bloğunda ayrı ayrı bildir.";

/** Akademik düzeye ve çalışma türüne göre beklenen literatür derinliği (referans 6.3) */
export function literatureDepth(p: { workType?: string; level?: string; approach?: string | null }): string {
  if (p.approach === "systematic_review" || p.approach === "meta_analysis") return "Önceden tanımlanmış ve yeniden üretilebilir arama/eleme yöntemi; literatürün sistematik sentezi (PRISMA 2020 akışına uygun).";
  if (p.workType === "journal_article" || p.workType === "research_article") return "Derginin kelime sınırı içinde yoğun, seçici ve doğrudan araştırma boşluğuna bağlanan literatür.";
  if (p.level === "doctorate" || p.level === "postdoc") return "Derin ve eleştirel sentez, kuramsal tartışma, alan içi çelişkilerin analizi, metodolojik değerlendirme ve özgün katkının güçlü gerekçesi.";
  if (p.level === "master") return "Genişletilmiş kuramsal çerçeve, tematik ampirik sentez, yöntemsel karşılaştırma ve açık bir araştırma boşluğu.";
  return "Temel kavramlar, seçilmiş kuramsal dayanaklar, ilgili çalışmaların düzenli özeti ve problemin gerekçesi.";
}

/** Bölüm kapsamına göre uzunluk yönergesi (kullanıcının seçtiği kapsam) */
export function scopeGuidance(scope?: string | null): string {
  if (scope === "brief") return "Kullanıcı bu bölüm için KISA kapsam seçti: yalnızca temel işlevi karşılayan, yoğun ve öz bir metin yaz; alt başlıkları en aza indir.";
  if (scope === "detailed") return "Kullanıcı bu bölüm için AYRINTILI kapsam seçti: alt temaları ve gerekçeleri tam kapsamlı işle; bölümü erken sonlandırma, ama dolgu ve tekrarla uzatma.";
  return "";
}

/** Bitirme projesi alt türüne göre yazım sınırı (uygulama projelerine yapay araştırma başlığı eklenmez) */
export function capstoneGuidance(variant?: string | null): string {
  if (!variant || variant === "research") return "";
  return "Bu bir UYGULAMA türü bitirme projesidir (araştırma projesi değil): sırf akademik görünsün diye hipotez, örneklem, ölçek veya istatistiksel analiz önerme ya da yazma; kanıtı proje çıktısına, gereksinimlere ve değerlendirmeye dayandır.";
}

/** Literatür ağırlıklı bölümler (derinlik yönergesi bunlara eklenir) */
export const LITERATURE_STAGES = new Set(["literature", "theory", "concepts", "gaps", "grant_literature", "source_matrix"]);

/** Yapı değişikliği geçmişi eylem adları (template_change_logs.action) */
export const STRUCTURE_ACTION_LABEL: Record<string, string> = {
  "section.add": "Bölüm eklendi",
  "section.duplicate": "Bölüm kopyalandı",
  "section.delete": "Bölüm silindi",
  "section.update": "Bölüm ayarları değişti",
  "section.reorder": "Bölüm sırası değişti",
  "template.default": "Academiana şablonu uygulandı",
  "template.apply": "Kayıtlı şablon uygulandı",
  undo: "Değişiklik geri alındı",
};
/** D173: geri alınabilen yapı değişiklikleri (sunucudaki liste ile aynı) */
export const UNDOABLE_ACTIONS = new Set(["section.add", "section.duplicate", "section.update", "section.reorder", "section.delete", "template.default", "template.apply"]);

/* ---------------- D172: yaklaşıma göre yöntem kuralları (referans 5 ve 5.1) ---------------- */

/** Yaklaşımın genel kuralları (araştırma odağı, hipotez, örnekleme, veri, analiz, kalite, bulgu, tartışma) */
export function approachRules(approach?: string | null): string {
  if (approach === "quantitative") return "NİCEL YAKLAŞIM KURALLARI: Odak ölçüm, dağılım, ilişki, fark veya etkidir. Hipotez yalnızca gerektiğinde (koşullu) yazılır. Örneklemede istatistiksel gerekçe ve örneklem stratejisi verilir. Veri sayısal ölçümdür; ölçme araçlarının geçerlik ve güvenirliği raporlanır. Analiz istatistiksel yöntemlerle yapılır; normallik ve diğer varsayımlar analize göre ele alınır. Bulgular istatistik, tablo ve etki ölçüleriyle sunulur. Tartışma bulguları kuram ve literatürle yorumlar. Kodlama, tema ve katılımcı alıntısı başlıkları kullanılmaz.";
  if (approach === "qualitative") return "NİTEL YAKLAŞIM KURALLARI: Odak deneyim, anlam, süreç ve bağlamdır. Hipotez kullanılmaz; keşfedici araştırma soruları kullanılır. “Evren/örneklem” yerine amaçlı seçim ve bilgi zenginliğine dayalı katılımcı/çalışma grubu anlatılır. Veri görüşme, gözlem, doküman vb.dir. Analiz kodlama ve tematik/içerik analizi gibi yöntemlerle yapılır (kodlama yaklaşımı seçilen analize göre). Kalite ölçütleri inandırıcılık, aktarılabilirlik, tutarlılık, teyit edilebilirlik ve araştırmacının konumu (refleksivite)dır. Bulgular tema, alt tema ve veri örnekleriyle sunulur; katılımcı alıntısı yalnızca kullanıcının gerçek verisinden alınır, ASLA uydurulmaz ([VERİ GİRİLECEK]). Normallik, istatistiksel varsayım, p değeri, etki büyüklüğü başlıkları kullanılmaz. Tartışma bağlamsal ve anlam odaklıdır.";
  if (approach === "mixed") return "KARMA YÖNTEM KURALLARI: Nicel ve nitel odağın birleşimi gerekçelendirilir. Hipotez yalnızca nicel bileşende olabilir. Örnekleme her aşama için ayrı anlatılır. Normallik/varsayımlar yalnızca nicel aşamada, kodlama ve temalar ile katılımcı alıntıları yalnızca nitel aşamada yer alır. Her bileşene uygun kalite ölçütleri kullanılır. Bulgular ayrı ve bütünleştirilmiş olarak sunulur; entegrasyon temel gerekliliktir ve meta-çıkarımlar entegrasyondan üretilir. Tartışma entegrasyon ve meta-çıkarımlar üzerine kurulur.";
  return "";
}

/** Bölüme ve yaklaşıma özgü içerik yönergesi (tez ve makalenin yöntem, analiz, bulgu, tartışma bölümleri) */
export function approachSectionGuidance(key: string, approach?: string | null): string {
  const method = ["method", "methods_article", "sample", "participants", "instruments"].includes(key);
  const analysis = key === "analysis";
  const findings = ["findings", "results_article"].includes(key);
  const discussion = ["discussion", "discussion_article"].includes(key);
  if (approach === "quantitative") {
    if (method) return "Bu bölümde (nicel): desen, evren-örneklem ve örneklem büyüklüğünün gerekçesi, ölçme araçları ve geçerlik/güvenirlik kanıtları, veri toplama süreci, analiz planı ve etik onay.";
    if (analysis) return "Bu bölümde (nicel): hangi istatistiksel testlerin hangi araştırma sorusu/hipotez için kullanılacağı, varsayım kontrolleri (normallik vb.), anlamlılık düzeyi ve etki büyüklüğü.";
    if (findings) return "Bu bölümde (nicel): önce tanımlayıcı istatistikler, ardından araştırma sorularına/hipotezlere göre sırayla test sonuçları, tablo ve etki ölçüleri; değerler yalnızca kullanıcının analiz çıktısından.";
    if (discussion) return "Bu bölümde (nicel): bulguları kuram ve literatürle karşılaştır; ilişkiyi nedensellik gibi sunma; sınırlılıklar ve genellenebilirlik.";
  }
  if (approach === "qualitative") {
    if (method) return "Bu bölümde (nitel): araştırma bağlamı, desen, katılımcıların amaçlı seçimi ve özellikleri, veri üretimi (görüşme/gözlem/doküman), analiz yaklaşımı, inandırıcılık önlemleri, araştırmacının konumu (refleksivite) ve etik.";
    if (analysis) return "Bu bölümde (nitel): kodlama süreci, temaların nasıl geliştirildiği, kodlayıcılar arası tutarlılık veya uzman incelemesi, kullanılan yazılım (varsa).";
    if (findings) return "Bu bölümde (nitel): araştırma sorularına göre tema ve alt temalar, her tema için açıklama ve kullanıcının gerçek verisinden alıntılar; istatistik, tanımlayıcı test veya hipotez testi YAZMA.";
    if (discussion) return "Bu bölümde (nitel): temaları bağlam ve anlam odaklı yorumla, literatürle ilişkilendir; aktarılabilirlik sınırlarını belirt.";
  }
  if (approach === "mixed") {
    if (method) return "Bu bölümde (karma): karma desenin türü ve gerekçesi, aşamaların sırası ve önceliği, her aşamanın örneklemi/katılımcıları, araçları ve analizi, aşamalar arası bağlantı noktası, etik.";
    if (analysis) return "Bu bölümde (karma): nicel analiz, nitel analiz ve bunların nasıl birleştirileceği (entegrasyon stratejisi, ortak gösterim).";
    if (findings) return "Bu bölümde (karma): nicel ve nitel bulguları ayrı alt başlıklarla sun; ardından birleştirilmiş bulgular (ortak gösterim) ve meta-çıkarımlar.";
    if (discussion) return "Bu bölümde (karma): entegrasyon ve meta-çıkarımlar üzerinden tartış; bileşenlerin uyuştuğu ve ayrıştığı noktaları açıkla.";
  }
  return "";
}

/** Çalışma türüne özgü yapı yönergesi (makale tez kopyası değildir; dergi uyarlamasında dergi kuralları önceliklidir) */
export function workTypeGuidance(workType?: string): string {
  if (workType === "research_article") return "ARAŞTIRMA MAKALESİ: Tez iskeletinin kısaltılmış kopyası değildir; hedef dergi ve desene göre giriş–yöntem–bulgular–tartışma ekseninde yoğun yazılır. Tezlerdeki uzun ve bağımsız kuramsal çerçeve bölümü makaleye eklenmez; kuramsal dayanak girişte kısa ve araştırma boşluğuna bağlı verilir.";
  if (workType === "research_proposal") return "ARAŞTIRMA ÖNERİSİ: Gelecekte yapılacak çalışmayı tanımlar; veri henüz toplanmamıştır. Gerçek bulgu, analiz sonucu veya tamamlanmış tartışma YAZMA; yöntemi, analizi ve katkıyı plan/beklenti diliyle (“yapılacaktır”, “beklenmektedir”) yaz. Nicel öneride değişkenler, hipotezler ve istatistiksel analiz planı; nitel öneride katılımcı seçimi, veri üretimi ve nitel analiz; karma öneride aşamaların sırası ve entegrasyon planı açıkça tanımlanır.";
  if (workType === "grant_proposal") return "FON / PROJE BAŞVURUSU: Tez veya makale şablonundan bağımsızdır; programın GÜNCEL resmi başvuru formu ve çağrı metni belirleyicidir. Eski formları güncelmiş gibi sunma; bilmediğin form ayrıntısını, puanlama ölçütünü veya üst sınırı uydurma, kullanıcıdan güncel çağrı dokümanını iste. Amaçlar ölçülebilir hedeflere, yöntem iş paketlerine, iş-zaman planı ve risklere (B planı) bağlanır; bütçe kalemleri gerekçelendirilir ve kullanıcının gerçek tutarlarıyla yazılır.";
  if (workType === "text_editing") return "AKADEMİK METİN DÜZENLEME: Yazarın anlamını koru. Anlamı değiştirebilecek her müdahaleyi (iddianın gücü, kapsamı, terim değişikliği, cümle çıkarma) ayrıca listele ve gerekçesini yaz; kullanıcı bunları kabul veya reddeder. Atıfları ve kaynakça eşleşmesini koru; yeni kaynak ekleme.";
  if (workType === "journal_article") return "DERGİ MAKALESİ / YAYIN UYARLAMA: Hedef derginin yazar rehberi, kelime sınırı, bölüm sırası, tablo/şekil ve atıf biçimi önceliklidir. Derginin talep etmediği tez tipi uzun bölümler eklenmez; derginin zorunlu başlıkları ve raporlama standartları korunur. Dergi kuralları bilinmiyorsa uydurma, kullanıcıya yazar rehberini sor.";
  return "";
}

/* ---------------- D173: bölümde kapsanması beklenen işlevler (referans 4.1–4.9) ----------------
 * Belgedeki örnek alt başlıklar BİREBİR başlık olarak kullanılmaz; yapay zekâya ve kullanıcıya “bu bölümde karşılanması
 * beklenen işlevler” olarak verilir. Alt başlık adları konuya, disipline ve kılavuza göre üretilir. */
export function sectionFunctions(key: string, p: { workType?: string; methodology?: string | null; variant?: string | null }): string[] {
  const m = p.methodology ?? null;
  const wt = p.workType ?? "";
  const proposal = wt === "research_proposal";
  switch (key) {
    case "front_matter": return ["Kapak ve iç kapak (enstitü şablonuna göre)", "Onay sayfası (jüri bilgileri kullanıcı tarafından girilir)", "Bilimsel etik beyanı", "Önsöz/teşekkür (isteğe bağlı)", "Kısaltmalar, tablolar ve şekiller listesi (gerekiyorsa)"];
    case "topic": return ["Konunun bağlamı ve önemi"];
    case "problem": return ["Problem durumu", "Gerekçe"];
    case "purpose": return ["Araştırmanın amacı", "Araştırmanın önemi ve beklenen katkısı"];
    case "questions":
      if (m === "qualitative") return ["Açık uçlu, keşfedici araştırma soruları (hipotez yok)"];
      if (m === "mixed") return ["Nicel araştırma soruları (gerekirse hipotezler)", "Nitel araştırma soruları", "Karma (entegrasyon) sorusu"];
      if (m === "quantitative") return ["Araştırma soruları", "Hipotezler (araştırma amacı gerektiriyorsa)", "Değişkenlerin tanımı"];
      return ["Araştırma soruları"];
    case "scope_limits": return ["Kapsam", "Varsayımlar", "Sınırlılıklar", "Tanımlar"];
    case "concepts": return ["Temel kavramların kaynaklı tanımları", "Terminolojinin tutarlı kullanımı"];
    case "theory": return ["Temel kuramsal yaklaşımlar ve modellerin karşılaştırılması", "Çalışmanın dayandığı kuramsal çerçevenin gerekçesi"];
    case "literature": return ["Güncel ve temel ampirik çalışmaların araştırma sorularına göre tematik sentezi", "Önceki çalışmaların örneklem, yöntem, bağlam ve bulgularının karşılaştırılması", "Uzlaşma, çelişki ve yöntemsel sınırlılıklar", "Tarihsel gelişim (gerektiği ölçüde)"];
    case "gaps": return ["Kanıta dayalı araştırma boşluğu", "Çalışmanın kuramsal ve ampirik konumu"];
    case "method":
    case "methods_article":
      if (m === "quantitative") return ["Araştırma modeli ve değişkenlerin kavramsallaştırılması", ...(key === "methods_article" ? ["Evren, örneklem ve örneklem büyüklüğünün gerekçesi", "Ölçme araçları ve psikometrik özellikleri", "Veri toplama prosedürü", "İstatistiksel analiz planı", "Etik onay"] : [])];
      if (m === "qualitative") return ["Nitel yaklaşım ve desenin gerekçesi", "Araştırma bağlamı", ...(key === "methods_article" ? ["Katılımcı seçimi (amaçlı örnekleme)", "Veri üretimi ve transkripsiyon", "Kodlama ve analiz yaklaşımı", "Araştırmacının konumu ve refleksivite", "Etik"] : [])];
      if (m === "mixed") return ["Karma yöntemin gerekçesi ve desen türü", "Aşamaların sıralanması veya eş zamanlı yürütülmesi", "Veri setlerinin entegrasyon noktası ve yöntemi", ...(key === "methods_article" ? ["Her aşamanın örneklemi ve veri toplama süreci", "Nicel ve nitel analizler", "Etik"] : [])];
      if (m === "systematic_review" || m === "meta_analysis") return ["Derleme türü ve protokol", "Raporlama standardı (PRISMA 2020)"];
      return ["İnceleme yaklaşımı ve kaynak seçim ölçütleri"];
    case "sample": return m === "mixed" ? ["Her aşamanın örneklemi ve örnekleme stratejisi", "Aşamalar arası katılımcı bağlantısı"] : ["Evren ve örneklem", "Örnekleme yöntemi", "Örneklem büyüklüğünün gerekçesi", "Dahil etme/dışlama ölçütleri"];
    case "participants": return ["Araştırma bağlamı ve katılımcı özellikleri", "Amaçlı örnekleme ve katılımcı seçimi", "Bilgi zenginliği ve veri doygunluğu"];
    case "instruments":
      if (m === "qualitative") return ["Görüşme, gözlem veya doküman veri kaynakları", "Veri üretimi/toplanması ve transkripsiyon"];
      if (m === "mixed") return ["Nicel veri toplama araçları ve psikometrik özellikleri", "Nitel veri kaynakları", "Her aşamanın veri toplama süreci"];
      return ["Ölçme araçları ve psikometrik özellikleri (geçerlik, güvenirlik)", "Veri toplama prosedürü"];
    case "analysis":
      if (m === "qualitative") return ["Kodlama ve analiz yaklaşımı", "Temaların geliştirilmesi", "Kullanılan yazılım (varsa)"];
      if (m === "mixed") return ["Nicel analizler", "Nitel analizler", "Entegrasyon stratejisi (ör. ortak gösterim)"];
      return ["İstatistiksel analiz planı", "Varsayım kontrolleri (normallik vb.)", "Uygun olduğunda etki büyüklüğü ve güven aralıkları"];
    case "trustworthiness": return ["İnandırıcılık", "Aktarılabilirlik", "Tutarlılık", "Teyit edilebilirlik", "Araştırmacının konumu ve refleksivite"];
    case "ethics": return proposal ? ["Planlanan etik kurul başvurusu", "Bilgilendirilmiş onam", "Veri gizliliği"] : ["Etik kurul onayı (kullanıcının gerçek bilgisi)", "Bilgilendirilmiş onam", "Veri gizliliği ve saklama"];
    case "findings":
    case "results_article":
      if (m === "qualitative") return ["Araştırma sorularına göre temalar ve alt temalar", "Gerçek veriden katılımcı alıntıları"];
      if (m === "mixed") return ["Nicel bulgular", "Nitel bulgular", "Bütünleştirilmiş bulgular"];
      return ["Tanımlayıcı istatistikler", "Araştırma sorularına/hipotezlere göre analiz sonuçları", "Tablo ve şekiller", "Etki büyüklükleri"];
    case "integration": return ["Veri setlerinin entegrasyon noktası ve yöntemi", "Uyumlu ve çelişkili bulguların değerlendirilmesi", "Bütünleştirilmiş çıkarımlar (meta-çıkarımlar)", "Ortak gösterim tablosu"];
    case "discussion":
    case "discussion_article":
      if (m === "qualitative") return ["Temaların bağlam ve anlam odaklı yorumu", "Literatürle ilişkilendirme", "Aktarılabilirlik ve sınırlılıklar"];
      if (m === "mixed") return ["Entegrasyon ve meta-çıkarımlar üzerinden tartışma", "Bileşenlerin uyuştuğu ve ayrıştığı noktalar", "Sınırlılıklar"];
      return ["Bulguların önceki çalışmalar ve kuramsal çerçeveyle karşılaştırılması", "Olası açıklamalar", "Sınırlılıklar", ...(key === "discussion_article" ? ["Sonuç ve çıkarımlar (dergi yapısına göre)"] : [])];
    case "conclusion": return wt === "capstone" && p.variant === "software" ? ["Sonuç", "Gelecek geliştirmeler"] : ["Temel çıkarımlar", "Katkı", "Uygulamaya yönelik öneriler", "Gelecek araştırmalar için öneriler"];
    case "introduction": return wt === "research_article" || wt === "journal_article" ? ["Problem ve bağlam", "Literatür boşluğu", "Gerekçe", "Amaç (ve uygunsa hipotezler)"] : [];
    case "review_protocol": return ["Açık araştırma sorusu (PICO/SPIDER vb.)", "Protokol ve kayıt (varsa)", "Dahil etme/dışlama ölçütleri"];
    case "search_strategy": return wt === "source_research" ? ["Araştırma konusu ve kapsamı", "Anahtar kelimeler ve eş anlamlılar", "Veri tabanları ve arama sorguları", "Tarih aralığı ve seçim kriterleri"] : ["Uygun veri tabanları", "Yeniden üretilebilir arama dizgileri", "Arama tarihi"];
    case "source_screening": return wt === "source_research" ? ["Kaynakların bibliyografik doğrulanması", "DOI ve yayın bilgileri"] : ["Tarama ve seçim süreci", "PRISMA akış şeması (gerçek sayılarla)"];
    case "data_extraction": return ["Veri çıkarım formu", "Çalışma kalitesi / yanlılık riski değerlendirmesi"];
    case "meta_analysis": return ["Etki ölçüsü", "İstatistiksel model ve model seçiminin gerekçesi", "Heterojenlik", "Yayın yanlılığı ve küçük çalışma etkileri (uygunsa)", "Alt grup ve meta-regresyon analizleri (gerekçelendirildiğinde)", "Duyarlılık analizleri", "Forest plot ve uygun görseller"];
    case "review_synthesis": return m === "systematic_review" || m === "meta_analysis" ? ["Bulguların sentezi", "Kanıtın kesinliği"] : ["Literatürün tematik veya kronolojik örgütlenmesi", "Çalışmaların yöntem ve bulgularının karşılaştırılması"];
    case "source_matrix": return ["Tematik sınıflandırma", "Literatür matrisi"];
    case "risks": return ["Etik hususlar", "Riskler ve alternatif planlar"];
    case "expected_contribution": return ["Kuramsal katkı", "Uygulamaya/politikaya katkı", "Beklenen çıktılar"];
    case "proposal_timeline": return ["Zaman çizelgesi (iş adımları ve süreler)"];
    case "grant_summary": return ["Proje özeti", "Anahtar kelimeler"];
    case "grant_originality": return ["Problem", "Gerekçe", "Özgün değer"];
    case "grant_objectives": return ["Amaçlar", "Ölçülebilir hedefler ve başarı ölçütleri"];
    case "grant_literature": return ["Literatür", "Mevcut durum"];
    case "grant_method": return ["Yöntem", "İş paketleri"];
    case "grant_management": return ["İş-zaman planı", "Proje yönetimi ve görev dağılımı"];
    case "grant_risks": return ["Riskler", "Alternatif planlar (B planı)"];
    case "grant_impact": return ["Beklenen çıktılar", "Yaygın etki"];
    case "grant_budget": return ["Bütçe kalemleri", "Bütçe gerekçesi"];
    case "requirements_analysis": return ["Problem tanımı", "Kullanıcı ve sistem gereksinimleri"];
    case "design_development": return ["Tasarım kararları", "Sistem mimarisi"];
    case "tech_choice": return ["Teknoloji seçimi ve gerekçesi", "Geliştirme yöntemi"];
    case "testing": return ["Test planı", "Doğrulama", "Performans değerlendirmesi"];
    case "case_context": return ["Kurum/sektör bağlamı", "Mevcut durum"];
    case "strategic_recommendations": return ["Stratejik değerlendirme", "Uygulanabilir öneriler"];
    case "needs_analysis": return ["İhtiyaç belirleme yöntemi", "Belirlenen ihtiyaçlar", "Hedef grubun özellikleri"];
    case "program_design": return ["Kazanımlar/hedefler", "İçerik ve etkinlikler", "Materyaller"];
    case "evaluation": return ["Değerlendirme yöntemi", "Değerlendirme sonuçları (gerçek veri)"];
    case "editing_input": return ["Orijinal metin", "Hedef format ve kılavuz"];
    case "editing_language": return ["Akademik dil ve terminoloji", "Dil bilgisi, imla ve noktalama"];
    case "editing_structure": return ["Paragraf bütünlüğü ve mantıksal akış", "Bölümler arası tutarlılık", "Gereksiz tekrarlar"];
    case "editing_citations": return ["Atıf-kaynakça eşleşmesi"];
    case "editing_format": return ["Üniversite/dergi formatına uyarlama", "Orijinal ve düzenlenmiş metin karşılaştırması"];
    case "journal_requirements": return ["Hedef dergi ve makale türünün doğrulanması", "Yazar rehberi ve güncel şablon", "Kelime sınırı, bölüm sırası, tablo/şekil ve atıf biçimi"];
    case "declarations": return ["Etik beyan", "Çıkar çatışması", "Fon", "Yazar katkıları", "Veri erişilebilirliği", "Yapay zekâ kullanımı"];
    case "cover_letter": return ["Kapak mektubu", "Gönderim öncesi kontrol"];
    default: return [];
  }
}

/* ---------------- D173: disiplin, başlıklandırma ve asistan rolleri (referans 1.1, 7, 9, 13, 14) ---------------- */

/** Disipline özgü raporlama pratikleri (yalnızca yol gösterici; kullanıcının kılavuzu önceliklidir) */
export function disciplineGuidance(discipline?: string | null): string {
  switch (disciplineGroup(discipline)) {
    case "health": return "DİSİPLİN (sağlık bilimleri): Etik kurul onayı ve bilgilendirilmiş onam bilgisi (kullanıcının gerçek bilgisiyle), klinik/epidemiyolojik terminoloji, desene uygun EQUATOR kontrol listesi (STROBE, CONSORT, COREQ vb.), etki ölçüleri ve güven aralıkları; kesin olmayan bulguyu klinik öneri gibi sunma.";
    case "education": return "DİSİPLİN (eğitim bilimleri): Uygulama izinleri (kurum/MEB vb.) ve etik onay, katılımcıların yaş/düzey bilgisi, öğretim bağlamının betimlenmesi, APA 7 raporlaması; çıkarımları eğitim uygulamasına bağla.";
    case "engineering": return "DİSİPLİN (mühendislik/bilgisayar): Problem ve gereksinimler, sistem/deney düzeneği, parametreler ve tekrarlanabilirlik, performans ölçütleri ve karşılaştırma ölçütleri (baseline); sonuçları yalnızca kullanıcının gerçek test/deney verisiyle raporla.";
    case "business": return "DİSİPLİN (işletme/iktisat): Kurum ve sektör bağlamı, kuramsal dayanak, veri kaynakları ve analiz yaklaşımı, yönetsel ve stratejik çıkarımlar; kurum verilerini kullanıcıdan al, finansal değer uydurma.";
    case "humanities": return "DİSİPLİN (beşeri bilimler): Birincil ve ikincil kaynak ayrımı, kaynak eleştirisi, kavramsal ve tarihsel bağlam, yorumlayıcı argüman; alıntılar yalnızca projedeki kaynaklardan ve sayfa numarasıyla.";
    case "social": return "DİSİPLİN (sosyal bilimler): Kavramların işlevsel tanımı, kuramsal çerçeve, örneklem/katılımcı ve bağlam betimlemesi, APA 7 raporlaması.";
    default: return "";
  }
}

/** Belge amacı (referans 2: format ve teslim gerekliliklerini belirler) */
export const DOCUMENT_PURPOSES = [
  { id: "institute", label: "Enstitü / üniversite teslimi" },
  { id: "journal", label: "Dergi gönderimi" },
  { id: "course", label: "Ders projesi / ödev" },
  { id: "grant", label: "Fon / burs başvurusu" },
  { id: "conference", label: "Kongre bildirisi" },
  { id: "other", label: "Diğer" },
] as const;
export function documentPurposeGuidance(id?: string | null): string {
  if (id === "institute") return "BELGE AMACI: Enstitü/üniversite teslimi — enstitü yazım kılavuzu (sayfa düzeni, ön sayfalar, başlık düzeyleri, atıf stili) önceliklidir.";
  if (id === "journal") return "BELGE AMACI: Dergi gönderimi — hedef derginin yazar rehberi (kelime sınırı, bölüm sırası, atıf biçimi, beyanlar) önceliklidir.";
  if (id === "course") return "BELGE AMACI: Ders projesi/ödev — dersin yönergesi ve öğretim elemanının beklentisi önceliklidir; kapsam ölçülü tutulur.";
  if (id === "grant") return "BELGE AMACI: Fon/burs başvurusu — güncel çağrı metni ve başvuru formu önceliklidir.";
  if (id === "conference") return "BELGE AMACI: Kongre bildirisi — kongrenin bildiri şablonu ve kelime/sayfa sınırı önceliklidir; yapı kısa ve yoğundur.";
  return "";
}

/** Başlıklandırma kuralları (referans 7.1–7.3, 13.5, 13.8) */
export const HEADING_RULES = "BAŞLIKLANDIRMA: Başlık, altındaki içeriğin gerçek akademik işlevini yansıtır; konuya özgüdür (genel, gündelik veya pazarlama dili yok); aynı işlevi gören başlıkları farklı adlarla çoğaltma; alt başlık üst başlığın kapsamını daraltır ve düzey atlanmaz; desene özgü terminolojiyi doğru kullan. Referans/örnek başlıkları birebir kopyalama. Kullanıcının kılavuzundaki resmi başlık adları ve terimler genel önerilerden önceliklidir; kullanıcının verdiği veya değiştirdiği başlıkları onayı olmadan yeniden adlandırma. Kılavuzda belirsiz veya çelişkili bir kural varsa varsayımda bulunma, kullanıcıya sor.";

/** Bölümden sorumlu asistan rolü (referans 9; 3.3 “ilgili asistan”) */
export function assistantFor(key: string, approach?: string | null): { name: string; duty: string } {
  const A = (name: string, duty: string) => ({ name, duty });
  if (["topic", "problem", "purpose", "questions", "scope_limits"].includes(key)) return A("Konu ve problem asistanı", "Konuyu daraltma, araştırılabilirlik, problem ve amaç tutarlılığı");
  if (["concepts", "theory", "literature", "gaps", "review_protocol", "search_strategy", "source_screening", "data_extraction", "review_synthesis", "source_matrix", "grant_literature", "introduction", "article_body"].includes(key)) return A("Literatür asistanı", "Kaynak keşfi, doğrulama, tematik sentez ve araştırma boşluğu");
  if (["method", "methods_article", "trustworthiness"].includes(key)) return A("Yöntem asistanı", "Yaklaşım/desen seçimi, yöntemsel gerekçe ve tasarım tutarlılığı");
  if (["sample", "participants", "instruments"].includes(key)) return A("Örneklem/veri asistanı", "Örneklem veya katılımcı stratejisi, veri kaynakları ve süreç");
  if (key === "analysis" || key === "meta_analysis") return approach === "qualitative" ? A("Nitel analiz asistanı", "Kodlama, tema geliştirme, veri örnekleri ve refleksivite") : approach === "mixed" ? A("Karma yöntem asistanı", "Nicel-nitel entegrasyon ve meta-çıkarımlar") : A("Nicel analiz asistanı", "Analiz seçimi, varsayımlar, istatistiksel raporlama ve yorum");
  if (key === "integration") return A("Karma yöntem asistanı", "Nicel-nitel entegrasyon ve meta-çıkarımlar");
  if (["findings", "results_article", "discussion", "discussion_article", "conclusion", "conclusion_article"].includes(key)) return A("Bulgular/tartışma asistanı", "Bulguların uygun sunumu ve literatürle ilişkilendirilmesi");
  if (key === "references") return A("Kaynakça asistanı", "Atıf-kaynakça eşleşmesi ve bibliyografik doğrulama");
  if (["ethics", "declarations", "risks"].includes(key)) return A("Etik kontrol asistanı", "Etik gereklilikler, veri dürüstlüğü ve raporlama kontrolleri");
  return A("Akademik editör", "Dil, akış, terminoloji, tutarlılık ve biçim");
}

/**
 * D173: Şeffaflık (referans 1.1) — sistemin bir bölümü NEDEN göstermediğini açıklar. Aynı çalışma türünün diğer
 * yaklaşımlarında bulunan ama bu seçimde olmayan bölümler gerekçesiyle listelenir; kullanıcı isterse ekleyebilir.
 */
export function omittedSections(p: TemplateInput): { key: string; title: string; why: string }[] {
  const current = buildTemplate(p);
  const have = new Set(current.map((x) => x.key));
  const others = ["quantitative", "qualitative", "mixed", "theoretical", "systematic_review", "meta_analysis"]
    .flatMap((m) => buildTemplate({ ...p, methodology: m, design: null }))
    .concat(p.workType === "thesis" ? buildTemplate({ ...p, level: "doctorate" }) : []);
  const m = p.methodology ?? "";
  const reason = (key: string): string => {
    if (key === "sample" && m === "qualitative") return "Nitel araştırmada evren-örneklem yerine amaçlı seçilen çalışma grubu kullanılır.";
    if (key === "participants") return "Nicel bileşende katılımcılar evren ve örneklem bölümünde anlatılır.";
    if (key === "trustworthiness") return "Nicel araştırmada kalite, ölçme araçlarının geçerlik ve güvenirliğiyle gösterilir.";
    if (key === "integration") return "Entegrasyon ve meta-çıkarımlar yalnızca karma yöntemde gereklidir.";
    if (key === "meta_analysis") return "Meta-analiz, sistematik derlemede karşılaştırılabilir nicel veri bulunduğunda uygulanan ayrı bir istatistiksel sentezdir.";
    if (["review_protocol", "search_strategy", "source_screening", "data_extraction", "review_synthesis"].includes(key)) return "Protokol, tarama ve veri çıkarımı yalnızca sistematik derleme ve meta-analizde gerekir.";
    if (["theory", "gaps"].includes(key) && p.level === "bachelor") return "Lisans düzeyinde kuramsal dayanak ve boşluk literatür içinde kısaca verilir.";
    if (["findings", "results_article", "discussion", "discussion_article", "methods_article", "sample", "instruments", "analysis", "ethics"].includes(key))
      return p.workType === "research_proposal" ? "Araştırma önerisinde veri henüz toplanmadığından gerçek bulgu ve tamamlanmış tartışma yer almaz." : "Bu yaklaşımda kullanıcı verisi toplanmadığından veri toplama, analiz ve bulgu bölümleri eklenmez.";
    if (key === "article_body" || key === "conclusion_article") return "Veriye dayalı makalede konu bölümleri yerine Yöntem, Bulgular ve Tartışma kullanılır.";
    return "Bu çalışma türü ve yaklaşım için varsayılan olarak gerekmez; isterseniz ekleyebilirsiniz.";
  };
  const seen = new Set<string>();
  return others.filter((x) => !have.has(x.key) && !seen.has(x.key) && (seen.add(x.key), true)).map((x) => ({ key: x.key, title: x.title, why: reason(x.key) }));
}

/** D173: akademik düzeye göre beklenti (referans 1.1: düzey yalnızca başlık sayısını değil derinliği değiştirir) */
export function levelGuidance(level?: string | null): string {
  if (level === "bachelor") return "AKADEMİK DÜZEY (lisans): Temel kavramları doğru ve açık kullan; seçilmiş kuramsal dayanaklarla problemi gerekçelendir; aşırı iddialı özgünlük vurgusu yapma.";
  if (level === "master") return "AKADEMİK DÜZEY (yüksek lisans): Genişletilmiş kuramsal çerçeve, tematik sentez ve yöntemsel karşılaştırma; araştırma boşluğunu açıkça göster ve yöntem seçimlerini gerekçelendir.";
  if (level === "doctorate") return "AKADEMİK DÜZEY (doktora): Derin ve eleştirel sentez, kuramsal tartışma, alan içi çelişkilerin ve yöntemsel sınırlılıkların analizi; özgün katkıyı güçlü biçimde gerekçelendir.";
  if (level === "postdoc") return "AKADEMİK DÜZEY (akademisyen): Alanın güncel tartışmalarına konumlanan, yöntemsel olarak savunulabilir ve özgün katkısı net bir metin; yayın standartlarında yoğun anlatım.";
  return "";
}
