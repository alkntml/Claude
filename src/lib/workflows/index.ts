import { STAGE_LIBRARY, type StageDef } from "./stages";
import { buildTemplate, type Requirement, type Scope } from "./templates";
export * from "./templates";

export type WorkType =
  | "thesis" | "research_article" | "journal_article" | "capstone"
  | "literature_review" | "research_proposal" | "grant_proposal" | "text_editing" | "source_research";

export type AcademicLevel = "bachelor" | "master" | "doctorate" | "postdoc" | "other";
export type Methodology = "quantitative" | "qualitative" | "mixed" | "theoretical" | "systematic_review" | "meta_analysis";

export interface WorkTypeMeta {
  id: WorkType;
  title: string;
  short: string;
  description: string;
  icon: string; // lucide ikon adı
  levels: AcademicLevel[];
}

export const WORK_TYPES: WorkTypeMeta[] = [
  { id: "thesis", title: "Tez hazırlama", short: "Lisans / yüksek lisans / doktora", description: "Konu seçiminden kaynakçaya kadar tezinizin tüm bölümlerini yönetin.", icon: "GraduationCap", levels: ["bachelor", "master", "doctorate"] },
  { id: "research_article", title: "Araştırma makalesi", short: "Özgün araştırma", description: "Giriş–Yöntem–Bulgular–Tartışma yapısında özgün araştırma makalesi.", icon: "FlaskConical", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "journal_article", title: "Bilimsel dergi makalesi", short: "Hedef dergiye uygun", description: "Kaynaklara dayalı; Giriş, içeriğe özgü konu bölümleri ve Sonuçtan oluşan, hedef derginin yazım kurallarına uygun makale.", icon: "BookOpenText", levels: ["master", "doctorate", "postdoc", "other"] },
  { id: "capstone", title: "Bitirme projesi", short: "Proje ve rapor", description: "Tasarım, uygulama ve değerlendirme süreçleriyle bitirme projesi raporu.", icon: "Rocket", levels: ["bachelor", "master"] },
  { id: "literature_review", title: "Literatür taraması", short: "Sistematik / anlatı derleme", description: "Arama stratejisi, tarama ve tematik sentez ile derleme çalışması.", icon: "Library", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "research_proposal", title: "Araştırma önerisi", short: "Research proposal", description: "Tez önerisi, proje başvurusu veya burs için araştırma önerisi.", icon: "Lightbulb", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "grant_proposal", title: "TÜBİTAK / BAP proje önerisi", short: "2209-A, 2209-B, 1001, 1002-A, 3005, 3501, 2204-A, 2242, BAP, burs", description: "Özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümleriyle proje başvurusu hazırlayın.", icon: "Landmark", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "text_editing", title: "Akademik metin düzenleme", short: "Dil, yapı ve atıf", description: "Mevcut metninizin dilini, yapısını ve atıflarını geliştirin.", icon: "PenLine", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "source_research", title: "Kaynak ve literatür araştırması", short: "Gerçek veri tabanları", description: "OpenAlex, Crossref, PubMed ve diğer veri tabanlarında doğrulanmış kaynak bulun.", icon: "SearchCheck", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
];

export const LEVEL_LABELS: Record<AcademicLevel, string> = {
  bachelor: "Lisans", master: "Yüksek lisans", doctorate: "Doktora", postdoc: "Doktora sonrası", other: "Diğer",
};

export const METHODOLOGY_LABELS: Record<Methodology, string> = {
  quantitative: "Nicel", qualitative: "Nitel", mixed: "Karma yöntem", theoretical: "Kuramsal / kavramsal", systematic_review: "Sistematik derleme", meta_analysis: "Meta-analiz",
};


/** Proje önerisi programları (başvuru formunun güncel hâli çağrı duyurusundan kontrol edilmelidir) */
export const GRANT_PROGRAMS = [
  { id: "tubitak_2209a", label: "TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri" },
  { id: "tubitak_2209b", label: "TÜBİTAK 2209-B Sanayiye Yönelik Bitirme Projeleri" },
  { id: "tubitak_1001", label: "TÜBİTAK 1001 Araştırma Projeleri" },
  { id: "tubitak_1002a", label: "TÜBİTAK 1002-A Hızlı Destek Modülü" },
  { id: "tubitak_3005", label: "TÜBİTAK 3005 Sosyal ve Beşeri Bilimlerde Yenilikçi Çözümler" },
  { id: "tubitak_2204a", label: "TÜBİTAK 2204-A Lise Öğrencileri Araştırma Projeleri Yarışması" },
  { id: "tubitak_2242", label: "TÜBİTAK 2242 Üniversite Öğrencileri Araştırma Proje Yarışmaları" },
  { id: "tubitak_3501", label: "TÜBİTAK 3501 Kariyer Geliştirme Programı" },
  { id: "bap", label: "Üniversite BAP projesi" },
  { id: "scholarship", label: "Burs başvurusu için araştırma önerisi (ör. 2211, 2214)" },
  { id: "other", label: "Diğer kurum / fon" },
] as const;
export type GrantProgram = (typeof GRANT_PROGRAMS)[number]["id"];

/**
 * Programa özel yazım notları (D153): yapay zekâ bağlamına girer. Yalnızca programın genel niteliği; tutar, süre,
 * puanlama gibi her çağrıda değişebilen ayrıntılar yazılmaz (kullanıcıya çağrı duyurusunu kontrol etmesi söylenir).
 */
export const PROGRAM_NOTES: Partial<Record<GrantProgram, string>> = {
  tubitak_2209a: "Lisans öğrencisi araştırma projesi; danışman eşliğinde, öğrenci düzeyine uygun, gerçekçi ve ölçülebilir hedefler.",
  tubitak_1001: "ARDEB araştırma projesi; özgün değer, yöntem, proje yönetimi (iş paketleri, risk), yaygın etki ve gerekçeli bütçe düzeni.",
  tubitak_1002a: "ARDEB Hızlı Destek: kısa süreli, sınırlı bütçeli, odaklı bir araştırma (ör. ön çalışma, fizibilite, acil ihtiyaç). Kapsamı dar tut; iş paketleri az ve kısa, hedefler kısa sürede ulaşılabilir olsun; neden hızlı destek gerektiğini gerekçelendir.",
  tubitak_3005: "Sosyal ve beşeri bilimlerde toplumsal bir soruna yenilikçi çözüm önerisi. Sorunu ve etkilenen kesimi verilerle tanımla; çözümün yenilikçi yönünü, uygulanabilirliğini ve toplumsal/kamu politikasına katkısını öne çıkar; nitel/nicel/karma yöntemi soruna göre gerekçelendir.",
  tubitak_2204a: "Lise öğrencileri araştırma projesi yarışması; danışman öğretmen eşliğinde. Proje raporu sade ve anlaşılır olmalı: problem, amaç, yöntem, bulgular, sonuç ve öneriler; bilimsel yöntem ve etik kurallar (insan/hayvan deneyleri, izinler) vurgulanır. Yaş düzeyine uygun, kendi yapılmış deney/gözlem.",
  tubitak_2242: "Üniversite öğrencileri araştırma proje yarışması (tematik alanlar); fikir ya da tamamlanmış proje. Problem, özgünlük, yöntem, uygulanabilirlik ve yaygın etki; sergi/sunum için kısa ve görsel anlatım.",
  bap: "Üniversite BAP projesi; üniversitenin kendi BAP yönergesi ve form şablonu esas alınır.",
};

export interface RoadmapInput {
  workType: WorkType;
  level: AcademicLevel;
  methodology?: Methodology;
  program?: GrantProgram;
  /** D171: araştırma deseni (DESIGNS) ve alt tür (bitirme projesi türü) */
  design?: string | null;
  variant?: string | null;
}

export interface RoadmapStage {
  key: string;
  title: string;
  description: string;
  /** D171: zorunlu / koşullu / isteğe bağlı, gerekçe, kritiklik ve önerilen kapsam */
  requirement?: Requirement;
  why?: string;
  critical?: boolean;
  scope?: Scope;
}

/**
 * Çalışma türü, alt tür, akademik seviye, yaklaşım ve desene göre yol haritası üretir (D171: templates.ts motoru).
 * Kullanıcı daha sonra aşama ekleyebilir, silebilir, yeniden adlandırabilir, sıralayabilir ve gizleyebilir;
 * üniversite kılavuzu yüklendiğinde AI yeni bir düzen önerebilir (bkz. /api/projects/[id]/stages/suggest).
 */
export function buildRoadmap({ workType, level, methodology = "quantitative", program, design, variant }: RoadmapInput): RoadmapStage[] {
  return buildTemplate({ workType, level, methodology, program, design, variant });
}

export const EMPIRICAL_METHODS = new Set<string>(["quantitative", "qualitative", "mixed"]);
/** Kullanıcının kendi topladığı veriye dayanan (alan araştırması içeren) çalışma türleri */
const DATA_WORKS = new Set<string>(["thesis", "research_article", "capstone"]);

/**
 * D170: Bu bölüm bu çalışmada kullanıcının gerçek araştırma verisini gerektiriyor mu? Bölüm tanımındaki işaret yalnızca
 * alan araştırması içeren çalışmalarda (tez, araştırma makalesi, bitirme projesi) ve nicel/nitel/karma yöntemde geçerlidir.
 * Dergi makalesi, derleme, kuramsal çalışma ve özet veri gerektirmez (yapay zekâ kaynaklarla yazar; [VERİ GİRİLECEK] kullanılmaz).
 */
export function stageNeedsData(key: string, project?: { work_type?: string | null; context?: { methodology?: string | null } | null } | null): boolean {
  const def = STAGE_LIBRARY[key];
  if (!def?.requiresUserData) return false;
  if (key === "grant_budget") return true;
  const wt = project?.work_type ?? "";
  if (!DATA_WORKS.has(wt)) return false;
  const m = project?.context?.methodology;
  if (m && !EMPIRICAL_METHODS.has(m)) return false;
  return true;
}

export function stageDef(key: string): StageDef | undefined {
  return STAGE_LIBRARY[key];
}

export function customStageDef(key: string, title: string, description: string): StageDef {
  return { key, title, purpose: description || "Kullanıcı tanımlı bölüm.", steps: [], rules: [], questions: [] };
}

export { STAGE_LIBRARY };
export type { StageDef };
