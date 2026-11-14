/**
 * Akademik belge yapısı (D76): aşamalar (çalışma adımları) belgede doğrudan ana bölüm olmaz.
 * Tez ve benzeri çalışmalarda ardışık aşamalar usule uygun ana bölümlerde toplanır:
 * GİRİŞ (problem, amaç, önem, sorular) · KURAMSAL ÇERÇEVE VE İLGİLİ ARAŞTIRMALAR · YÖNTEM · BULGULAR · TARTIŞMA · SONUÇ.
 * Aşama adları (“Araştırma probleminin tanımlanması” gibi iş adları) belgeye akademik başlık olarak geçer
 * (“Problem Durumu”). Ayrıca alt başlık bütçesi ve yinelenen başlık tespiti burada. Saf modül.
 */
type L2 = { tr: string; en: string; de: string };

export interface ChapterGroup { id: string; title: L2 }

const G = {
  intro: { id: "intro", title: { tr: "GİRİŞ", en: "INTRODUCTION", de: "EINLEITUNG" } },
  theory: { id: "theory", title: { tr: "KURAMSAL ÇERÇEVE VE İLGİLİ ARAŞTIRMALAR", en: "THEORETICAL FRAMEWORK AND RELATED RESEARCH", de: "THEORETISCHER RAHMEN UND FORSCHUNGSSTAND" } },
  method: { id: "method", title: { tr: "YÖNTEM", en: "METHOD", de: "METHODE" } },
} satisfies Record<string, ChapterGroup>;

/** Aşama → ana bölüm grubu. Listede olmayan aşamalar kendi başına ana bölümdür. */
const GROUP_OF: Record<string, ChapterGroup> = {
  topic: G.intro, problem: G.intro, purpose: G.intro, questions: G.intro, scope_limits: G.intro,
  ethics: G.method, trustworthiness: G.method, data_extraction: G.method,
  concepts: G.theory, theory: G.theory, literature: G.theory, gaps: G.theory,
  method: G.method, sample: G.method, participants: G.method, instruments: G.method, analysis: G.method,
  design_development: G.method, testing: G.method,
  review_protocol: G.method, search_strategy: G.method, source_screening: G.method,
};

/** Belgede kullanılan akademik başlıklar (kullanıcı aşamanın adını değiştirmediyse) */
const DOC_TITLE: Record<string, L2> = {
  topic: { tr: "", en: "", de: "" }, // Giriş’in açılış metni: ayrı başlık almaz
  // D170: makale özeti belgede “Özet” başlığıyla başlar (“Başlık, özet ve anahtar kelimeler” bir iş adıdır, belgeye yazılmaz)
  title_abstract: { tr: "Özet", en: "Abstract", de: "Zusammenfassung" },
  // D173: ön sayfaların kendi başlığı yok; içindeki “Onay”, “Beyan”, “Önsöz” başlıkları numarasız basılır
  front_matter: { tr: "", en: "", de: "" },
  // Konu bölümleri kendi başlığını almaz: içindeki her ## başlık makalede ayrı numaralı ana bölümdür
  article_body: { tr: "", en: "", de: "" },
  conclusion_article: { tr: "Sonuç", en: "Conclusion", de: "Fazit" },
  problem: { tr: "Problem Durumu", en: "Problem Statement", de: "Problemstellung" },
  purpose: { tr: "Araştırmanın Amacı ve Önemi", en: "Purpose and Significance of the Study", de: "Zielsetzung und Relevanz der Studie" },
  questions: { tr: "Araştırma Soruları ve Hipotezler", en: "Research Questions and Hypotheses", de: "Forschungsfragen und Hypothesen" },
  concepts: { tr: "Temel Kavramlar", en: "Key Concepts", de: "Zentrale Begriffe" },
  theory: { tr: "Kuramsal Çerçeve", en: "Theoretical Framework", de: "Theoretischer Rahmen" },
  literature: { tr: "İlgili Araştırmalar", en: "Related Research", de: "Forschungsstand" },
  gaps: { tr: "Alanyazındaki Boşluk", en: "Gap in the Literature", de: "Forschungslücke" },
  method: { tr: "Araştırma Modeli", en: "Research Design", de: "Forschungsdesign" },
  sample: { tr: "Evren ve Örneklem", en: "Population and Sample", de: "Grundgesamtheit und Stichprobe" },
  participants: { tr: "Çalışma Grubu", en: "Participants", de: "Teilnehmende" },
  instruments: { tr: "Veri Toplama Araçları", en: "Data Collection Instruments", de: "Erhebungsinstrumente" },
  analysis: { tr: "Verilerin Analizi", en: "Data Analysis", de: "Datenauswertung" },
  design_development: { tr: "Tasarım ve Geliştirme Süreci", en: "Design and Development", de: "Gestaltungs- und Entwicklungsprozess" },
  testing: { tr: "Test ve Değerlendirme", en: "Testing and Evaluation", de: "Test und Evaluation" },
  findings: { tr: "BULGULAR", en: "FINDINGS", de: "ERGEBNISSE" },
  discussion: { tr: "TARTIŞMA", en: "DISCUSSION", de: "DISKUSSION" },
  conclusion: { tr: "SONUÇ VE ÖNERİLER", en: "CONCLUSION AND RECOMMENDATIONS", de: "FAZIT UND EMPFEHLUNGEN" },
  appendices: { tr: "EKLER", en: "APPENDICES", de: "ANHANG" },
  review_protocol: { tr: "Tarama Protokolü", en: "Review Protocol", de: "Review-Protokoll" },
  scope_limits: { tr: "Kapsam, Varsayımlar, Sınırlılıklar ve Tanımlar", en: "Scope, Assumptions, Limitations and Definitions", de: "Umfang, Annahmen, Grenzen und Begriffsbestimmungen" },
  ethics: { tr: "Etik İlkeler", en: "Ethical Considerations", de: "Ethische Aspekte" },
  trustworthiness: { tr: "Araştırmacının Rolü ve İnandırıcılık", en: "Researcher Role and Trustworthiness", de: "Rolle der Forschenden und Vertrauenswürdigkeit" },
  data_extraction: { tr: "Veri Çıkarımı ve Çalışma Kalitesi", en: "Data Extraction and Study Quality", de: "Datenextraktion und Studienqualität" },
  integration: { tr: "ENTEGRASYON VE META-ÇIKARIMLAR", en: "INTEGRATION AND META-INFERENCES", de: "INTEGRATION UND META-INFERENZEN" },
  meta_analysis: { tr: "META-ANALİZ", en: "META-ANALYSIS", de: "METAANALYSE" },
  search_strategy: { tr: "Arama Stratejisi", en: "Search Strategy", de: "Suchstrategie" },
  source_screening: { tr: "Kaynakların Taranması ve Seçimi", en: "Screening and Selection", de: "Screening und Auswahl der Quellen" },
};

/** Numarasız ön/son kısımlar (bölüm numarası almaz) */
// D178: Giriş numarasız yazılır (“1. GİRİŞ” değil “GİRİŞ”); numaralandırma ondan sonraki ana bölümle 1’den başlar
export const UNNUMBERED_GROUPS = new Set(["intro"]);
export const UNNUMBERED = new Set(["introduction", "front_matter", "title_abstract", "declarations", "appendices", "journal_requirements", "cover_letter"]);
/** D171: çalışma notu niteliğindeki aşamalar (dergi gereklilikleri, editöre mektup) makale metnine basılmaz */
export const NOT_IN_MANUSCRIPT = new Set(["journal_requirements", "cover_letter"]);

export function chapterGroup(stageKey: string): ChapterGroup | null {
  return GROUP_OF[stageKey] ?? null;
}

/**
 * Aşamanın belgedeki başlığı: kullanıcı aşama adını değiştirmediyse akademik karşılığı, değiştirdiyse kendi adı.
 * Boş dize: başlıksız (ör. Giriş’in açılış metni).
 */
/** Bölüm tanımında adı sonradan değişen aşamaların eski varsayılan adları (eski çalışmalarda “yeniden adlandırılmış” sayılmasın) */
const LEGACY_TITLES: Record<string, string[]> = { title_abstract: ["Başlık, özet ve anahtar kelimeler"] };

export function sectionTitle(stageKey: string, stageTitle: string, defaultTitle: string | undefined, locale: "tr" | "en" | "de"): string {
  const legacy = (LEGACY_TITLES[stageKey] ?? []).some((x) => norm(x) === norm(stageTitle));
  const renamed = !legacy && defaultTitle && norm(stageTitle) !== norm(defaultTitle);
  if (renamed) return stageTitle;
  const d = DOC_TITLE[stageKey];
  return d ? d[locale] : stageTitle;
}

/** Karşılaştırma için normalleştirme: küçük harf, Türkçe karakterler sadeleşir, noktalama atılır */
export function norm(s: string): string {
  return s.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
}

const STOP = new Set(["ve", "ile", "bir", "bu", "the", "and", "of", "in", "a", "an", "to", "for", "arastirma", "arastirmanin", "study"]);
/** İki başlık aynı şeyi mi söylüyor? (aynı ya da anlamlı kelimelerin çoğu ortak) */
export function sameHeading(a: string, b: string): boolean {
  const x = norm(a), y = norm(b);
  if (!x || !y) return false;
  if (x === y) return true;
  const wa = new Set(x.split(" ").filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 6)));
  const wb = new Set(y.split(" ").filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.slice(0, 6)));
  if (!wa.size || !wb.size) return false;
  let common = 0;
  for (const w of wa) if (wb.has(w)) common++;
  return common / Math.min(wa.size, wb.size) >= 0.75;
}

/** Kısa bölümler: alt başlık açılmaz (Giriş’in alt kısımları, örneklem, veri toplama vb.) */
const SHORT = new Set(["topic", "problem", "purpose", "questions", "gaps", "sample", "participants", "analysis", "instruments", "conclusion", "conclusion_article", "declarations", "grant_summary", "grant_budget", "title_abstract"]);

/**
 * Önerilen en fazla alt başlık sayısı: kısa bölümlerde 0 (gerekirse en fazla 2), uzun bölümlerde
 * yaklaşık her 900–1000 kelimeye bir alt başlık (en fazla 6). Hedef yoksa bölüm türüne göre.
 */
export function subheadingBudget(stageKey: string, targetWords = 0): number {
  // D170: makale girişi alt başlıklarla (ör. bağlam, problem, amaç) ilerler; konu bölümleri 3–6 ana başlıktan oluşur
  if (stageKey === "introduction") return targetWords && targetWords < 500 ? 0 : Math.min(4, Math.max(2, Math.round(targetWords / 700)));
  if (stageKey === "article_body") return Math.min(6, Math.max(3, Math.round((targetWords || 3000) / 1000)));
  if (SHORT.has(stageKey)) return targetWords >= 2500 ? 2 : 0;
  if (!targetWords) return 4;
  return Math.max(0, Math.min(6, Math.round(targetWords / 950)));
}

/** Yapay zekâya verilen yapı kuralı (bölüm bağlamı) */
export function structureRule(stageKey: string, stageTitle: string, targetWords = 0): string {
  const n = subheadingBudget(stageKey, targetWords);
  if (stageKey === "article_body") {
    return [
      "BÖLÜM YAPISI (makalenin ana gövdesi): Bu kısmın kendi başlığı yoktur; buraya yazdığın her ## başlık makalede Giriş’ten sonra gelen ayrı, numaralı bir ana bölüm olur (Giriş numarasızdır; konu bölümleri 1, 2, 3… diye numaralanır). Gerekirse alt kısımlar ### ile açılır.",
      `${n} kadar ## ana başlık kullan (en az 3). Başlıklar çalışmanın konusuna ÖZGÜ olmalı (ör. kavramlar, dönemler, kuramlar, tartışmalar); “Giriş”, “Yöntem”, “Bulgular”, “Tartışma”, “Sonuç”, “Literatür taraması” gibi genel başlıklar KULLANMA. Her ana başlığın altında en az 3–4 dolu, kaynaklı paragraf olmalı; başlıklar arasında konu tekrarı olmamalı.`,
      "Bu bir kaynaklara dayalı makaledir: veri toplanmaz, [VERİ GİRİLECEK] kullanılmaz; her olgusal cümle KAYNAKLAR’daki bir çalışmayla desteklenir.",
    ].join("\n");
  }
  const group = chapterGroup(stageKey);
  return [
    `BÖLÜM YAPISI: Bu metin belgede ${group ? `“${group.title.tr}” ana bölümünün bir alt kısmı olarak` : "kendi ana bölümü olarak"} yer alır. Aşama/bölüm adını (“${stageTitle}”) metnin başına başlık olarak YAZMA; sistem başlığı kendisi ekler.`,
    n === 0
      ? "Bu kısa bir bölümdür: ALT BAŞLIK AÇMA; metni düz paragraflarla yaz."
      : `Alt başlık yalnızca bölüm gerçekten farklı alt konular içeriyorsa açılır; en fazla ${n} alt başlık (## düzeyi). Her alt başlığın altında en az 2–3 dolu paragraf olmalı; tek paragraflık alt başlık, tek alt-alt başlık (###) veya başlık üstüne başlık açma. Mevcut alt başlıklar varsa yenisini açmak yerine onları sürdür.`,
  ].join("\n");
}

/**
 * Her aşamanın belgedeki numara öneki (editördeki başlık numaraları belgeyle aynı olsun):
 * gruplu aşamada “bölüm.kısım” (ör. 1.2), tek başına bölümde “bölüm” (ör. 3); numarasız kısımda boş.
 */
/**
 * Başlıksız açılış metninin (Giriş’in ilk kısmı) içindeki alt başlıklar belgede ana bölümün 2. düzeyine
 * numaralanır (1.1, 1.2…); sonraki kısımların numarası bunlardan sonra gelir (D89). Düzey atlama kuralı
 * dışa aktarmayla aynı: ilk başlık en fazla 2. düzeydir.
 */
function topLevelHeadings(content: unknown): number {
  const nodes = ((content as { content?: { type?: string; attrs?: { level?: number } }[] } | null)?.content ?? []);
  let last = 1, n = 0;
  for (const node of nodes) {
    if (node?.type !== "heading") continue;
    const lvl = Math.min(Math.max(Number(node.attrs?.level ?? 2), 2), 4, last + 1);
    last = lvl;
    if (lvl === 2) n++;
  }
  return n;
}

export function stagePrefixes(stages: { id: string; key: string; title: string; position?: number; content?: unknown; hidden?: boolean }[], defaults: Record<string, string | undefined> = {}): Record<string, string> {
  return numberStages(stages, defaults).prefixes;
}

/**
 * D181: makalenin “Konu bölümleri” aşamasında her ## başlık belgede ayrı numaralı ana bölümdür; sol menüde de aynı
 * numarayı göstermek için o aşamadaki ilk ana bölümün numarası (aşama kimliği → numara).
 */
export function articleBodyStarts(stages: { id: string; key: string; title: string; position?: number; content?: unknown; hidden?: boolean }[], defaults: Record<string, string | undefined> = {}): Record<string, number> {
  return numberStages(stages, defaults).bodyStart;
}

function numberStages(stages: { id: string; key: string; title: string; position?: number; content?: unknown; hidden?: boolean }[], defaults: Record<string, string | undefined> = {}): { prefixes: Record<string, string>; bodyStart: Record<string, number> } {
  const out: Record<string, string> = {};
  const bodyStart: Record<string, number> = {};
  let chapter = 0, section = 0;
  let current: string | null = null;
  for (const st of [...stages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))) {
    if (st.key === "references") continue;
    // D171: gizlenen bölüm numara almaz (belgeye de basılmaz)
    if (st.hidden) { out[st.id] = ""; continue; }
    const group = chapterGroup(st.key);
    if (group && UNNUMBERED_GROUPS.has(group.id)) { current = group.id; out[st.id] = ""; continue; }
    if (group) {
      if (current !== group.id) { chapter++; section = 0; current = group.id; }
      const titled = !!sectionTitle(st.key, st.title, defaults[st.key], "tr");
      if (titled) { section++; out[st.id] = `${chapter}.${section}`; }
      else { out[st.id] = String(chapter); section += topLevelHeadings(st.content); }
    } else {
      current = null;
      if (UNNUMBERED.has(st.key)) { out[st.id] = ""; continue; }
      // D170: konu bölümleri başlıksızdır; içindeki her ## başlık ayrı ana bölüm numarası alır
      if (st.key === "article_body") { out[st.id] = ""; bodyStart[st.id] = chapter + 1; chapter += topLevelHeadings(st.content); continue; }
      chapter++;
      out[st.id] = String(chapter);
    }
  }
  return { prefixes: out, bodyStart };
}

/**
 * Akademik sıra (D84): aynı ana bölüme ait aşamalar (ör. YÖNTEM’in alt kısımları) bitişik olmalı, kaynakça ve
 * ekler en sonda yer almalı. Aksi hâlde belgede aynı ana bölüm iki kez açılır (“3 YÖNTEM … 5 YÖNTEM”).
 * Kullanıcının diğer sıralaması korunur: ayrı düşmüş aşama, grubunun ilk aşamasının hemen arkasına alınır.
 * Değişiklik yoksa null döner.
 */
export function academicOrder<T extends { id: string; key: string }>(stages: T[]): T[] | null {
  const tail = (k: string) => (k === "references" ? 1 : k === "appendices" ? 2 : 0);
  const firstOfGroup = new Map<string, number>();
  stages.forEach((s, i) => { const g = chapterGroup(s.key); if (g && !firstOfGroup.has(g.id)) firstOfGroup.set(g.id, i); });
  const keyed = stages.map((s, i) => {
    const g = chapterGroup(s.key);
    return { s, i, anchor: g ? firstOfGroup.get(g.id)! : i, tail: tail(s.key) };
  });
  const sorted = [...keyed].sort((a, b) => a.tail - b.tail || a.anchor - b.anchor || a.i - b.i).map((x) => x.s);
  return sorted.every((s, i) => s.id === stages[i].id) ? null : sorted;
}
