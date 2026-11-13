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
export const TEMPLATE_VERSION = 2;

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
export const designsFor = (approach?: string | null) => DESIGNS.filter((d) => d.approach === approach);

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
export function reportingStandards(p: { workType?: string; approach?: string | null; design?: string | null }): string[] {
  const d = designById(p.design);
  if (d) return d.standards;
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
    it("methods_article", { critical: true, title: m === "qualitative" ? "Yöntem (bağlam, katılımcılar, veri üretimi ve analiz)" : m === "mixed" ? "Yöntem (karma desen, aşamalar ve entegrasyon)" : undefined }),
    it("results_article", { critical: true, title: m === "qualitative" ? "Bulgular (temalar)" : undefined }),
    ...(m === "mixed" ? [it("integration", { critical: true, why: "Karma yöntem makalesinde entegrasyon ve meta-çıkarımlar görünür olmalıdır." })] : []),
    it("discussion_article", { critical: true }),
    it("declarations", { req: "conditional", why: "Derginin istediği etik, çıkar çatışması, fon ve yazar katkısı beyanları." }), it("references", { critical: true }),
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
  const SHORT = new Set(["topic", "purpose", "questions", "scope_limits", "declarations", "appendices", "cover_letter", "expected_contribution", "proposal_timeline", "grant_summary", "title_abstract", "ethics"]);
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
  if (p.level === "doctorate") return "Derin ve eleştirel sentez, kuramsal tartışma, alan içi çelişkilerin analizi, metodolojik değerlendirme ve özgün katkının güçlü gerekçesi.";
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
};
