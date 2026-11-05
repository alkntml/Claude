/**
 * Akademik belge yapısı (D76): aşamalar (çalışma adımları) belgede doğrudan ana bölüm olmaz.
 * Tez ve benzeri çalışmalarda ardışık aşamalar usule uygun ana bölümlerde toplanır:
 * GİRİŞ (problem, amaç, önem, sorular) · KURAMSAL ÇERÇEVE VE İLGİLİ ARAŞTIRMALAR · YÖNTEM · BULGULAR · TARTIŞMA · SONUÇ.
 * Aşama adları (“Araştırma probleminin tanımlanması” gibi iş adları) belgeye akademik başlık olarak geçer
 * (“Problem Durumu”). Ayrıca alt başlık bütçesi ve yinelenen başlık tespiti burada. Saf modül.
 */
type L2 = { tr: string; en: string };

export interface ChapterGroup { id: string; title: L2 }

const G = {
  intro: { id: "intro", title: { tr: "GİRİŞ", en: "INTRODUCTION" } },
  theory: { id: "theory", title: { tr: "KURAMSAL ÇERÇEVE VE İLGİLİ ARAŞTIRMALAR", en: "THEORETICAL FRAMEWORK AND RELATED RESEARCH" } },
  method: { id: "method", title: { tr: "YÖNTEM", en: "METHOD" } },
} satisfies Record<string, ChapterGroup>;

/** Aşama → ana bölüm grubu. Listede olmayan aşamalar kendi başına ana bölümdür. */
const GROUP_OF: Record<string, ChapterGroup> = {
  topic: G.intro, problem: G.intro, purpose: G.intro, questions: G.intro,
  concepts: G.theory, theory: G.theory, literature: G.theory, gaps: G.theory,
  method: G.method, sample: G.method, participants: G.method, instruments: G.method, analysis: G.method,
  design_development: G.method, testing: G.method,
  review_protocol: G.method, search_strategy: G.method, source_screening: G.method,
};

/** Belgede kullanılan akademik başlıklar (kullanıcı aşamanın adını değiştirmediyse) */
const DOC_TITLE: Record<string, L2> = {
  topic: { tr: "", en: "" }, // Giriş’in açılış metni: ayrı başlık almaz
  problem: { tr: "Problem Durumu", en: "Problem Statement" },
  purpose: { tr: "Araştırmanın Amacı ve Önemi", en: "Purpose and Significance of the Study" },
  questions: { tr: "Araştırma Soruları ve Hipotezler", en: "Research Questions and Hypotheses" },
  concepts: { tr: "Temel Kavramlar", en: "Key Concepts" },
  theory: { tr: "Kuramsal Çerçeve", en: "Theoretical Framework" },
  literature: { tr: "İlgili Araştırmalar", en: "Related Research" },
  gaps: { tr: "Alanyazındaki Boşluk", en: "Gap in the Literature" },
  method: { tr: "Araştırma Modeli", en: "Research Design" },
  sample: { tr: "Evren ve Örneklem", en: "Population and Sample" },
  participants: { tr: "Çalışma Grubu", en: "Participants" },
  instruments: { tr: "Veri Toplama Araçları", en: "Data Collection Instruments" },
  analysis: { tr: "Verilerin Analizi", en: "Data Analysis" },
  design_development: { tr: "Tasarım ve Geliştirme Süreci", en: "Design and Development" },
  testing: { tr: "Test ve Değerlendirme", en: "Testing and Evaluation" },
  findings: { tr: "BULGULAR", en: "FINDINGS" },
  discussion: { tr: "TARTIŞMA", en: "DISCUSSION" },
  conclusion: { tr: "SONUÇ VE ÖNERİLER", en: "CONCLUSION AND RECOMMENDATIONS" },
  appendices: { tr: "EKLER", en: "APPENDICES" },
  review_protocol: { tr: "Tarama Protokolü", en: "Review Protocol" },
  search_strategy: { tr: "Arama Stratejisi", en: "Search Strategy" },
  source_screening: { tr: "Kaynakların Taranması ve Seçimi", en: "Screening and Selection" },
};

/** Numarasız ön/son kısımlar (bölüm numarası almaz) */
export const UNNUMBERED = new Set(["title_abstract", "declarations", "appendices"]);

export function chapterGroup(stageKey: string): ChapterGroup | null {
  return GROUP_OF[stageKey] ?? null;
}

/**
 * Aşamanın belgedeki başlığı: kullanıcı aşama adını değiştirmediyse akademik karşılığı, değiştirdiyse kendi adı.
 * Boş dize: başlıksız (ör. Giriş’in açılış metni).
 */
export function sectionTitle(stageKey: string, stageTitle: string, defaultTitle: string | undefined, locale: "tr" | "en"): string {
  const renamed = defaultTitle && norm(stageTitle) !== norm(defaultTitle);
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
const SHORT = new Set(["topic", "problem", "purpose", "questions", "gaps", "sample", "participants", "analysis", "instruments", "conclusion", "declarations", "grant_summary", "grant_budget"]);

/**
 * Önerilen en fazla alt başlık sayısı: kısa bölümlerde 0 (gerekirse en fazla 2), uzun bölümlerde
 * yaklaşık her 900–1000 kelimeye bir alt başlık (en fazla 6). Hedef yoksa bölüm türüne göre.
 */
export function subheadingBudget(stageKey: string, targetWords = 0): number {
  if (SHORT.has(stageKey)) return targetWords >= 2500 ? 2 : 0;
  if (!targetWords) return 4;
  return Math.max(0, Math.min(6, Math.round(targetWords / 950)));
}

/** Yapay zekâya verilen yapı kuralı (bölüm bağlamı) */
export function structureRule(stageKey: string, stageTitle: string, targetWords = 0): string {
  const n = subheadingBudget(stageKey, targetWords);
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

export function stagePrefixes(stages: { id: string; key: string; title: string; position?: number; content?: unknown }[], defaults: Record<string, string | undefined> = {}): Record<string, string> {
  const out: Record<string, string> = {};
  let chapter = 0, section = 0;
  let current: string | null = null;
  for (const st of [...stages].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))) {
    if (st.key === "references") continue;
    const group = chapterGroup(st.key);
    if (group) {
      if (current !== group.id) { chapter++; section = 0; current = group.id; }
      const titled = !!sectionTitle(st.key, st.title, defaults[st.key], "tr");
      if (titled) { section++; out[st.id] = `${chapter}.${section}`; }
      else { out[st.id] = String(chapter); section += topLevelHeadings(st.content); }
    } else {
      current = null;
      if (UNNUMBERED.has(st.key)) { out[st.id] = ""; continue; }
      chapter++;
      out[st.id] = String(chapter);
    }
  }
  return out;
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
