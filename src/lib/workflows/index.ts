import { STAGE_LIBRARY, type StageDef } from "./stages";

export type WorkType =
  | "thesis" | "research_article" | "journal_article" | "capstone"
  | "literature_review" | "research_proposal" | "grant_proposal" | "text_editing" | "source_research";

export type AcademicLevel = "bachelor" | "master" | "doctorate" | "postdoc" | "other";
export type Methodology = "quantitative" | "qualitative" | "mixed" | "theoretical" | "systematic_review";

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
  { id: "journal_article", title: "Bilimsel dergi makalesi", short: "Hedef dergiye uygun", description: "Hedef derginin yazım kurallarına ve raporlama kılavuzlarına uygun makale.", icon: "BookOpenText", levels: ["master", "doctorate", "postdoc", "other"] },
  { id: "capstone", title: "Bitirme projesi", short: "Proje ve rapor", description: "Tasarım, uygulama ve değerlendirme süreçleriyle bitirme projesi raporu.", icon: "Rocket", levels: ["bachelor", "master"] },
  { id: "literature_review", title: "Literatür taraması", short: "Sistematik / anlatı derleme", description: "Arama stratejisi, tarama ve tematik sentez ile derleme çalışması.", icon: "Library", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "research_proposal", title: "Araştırma önerisi", short: "Research proposal", description: "Tez önerisi, proje başvurusu veya burs için araştırma önerisi.", icon: "Lightbulb", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "grant_proposal", title: "TÜBİTAK / BAP proje önerisi", short: "2209-A, 2209-B, 1001, 3501, BAP, burs", description: "Özgün değer, yöntem, proje yönetimi, yaygın etki ve bütçe bölümleriyle proje başvurusu hazırlayın.", icon: "Landmark", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "text_editing", title: "Akademik metin düzenleme", short: "Dil, yapı ve atıf", description: "Mevcut metninizin dilini, yapısını ve atıflarını geliştirin.", icon: "PenLine", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
  { id: "source_research", title: "Kaynak ve literatür araştırması", short: "Gerçek veri tabanları", description: "OpenAlex, Crossref, PubMed ve diğer veri tabanlarında doğrulanmış kaynak bulun.", icon: "SearchCheck", levels: ["bachelor", "master", "doctorate", "postdoc", "other"] },
];

export const LEVEL_LABELS: Record<AcademicLevel, string> = {
  bachelor: "Lisans", master: "Yüksek lisans", doctorate: "Doktora", postdoc: "Doktora sonrası", other: "Diğer",
};

export const METHODOLOGY_LABELS: Record<Methodology, string> = {
  quantitative: "Nicel", qualitative: "Nitel", mixed: "Karma yöntem", theoretical: "Kuramsal / kavramsal", systematic_review: "Sistematik derleme",
};

const BASE: Record<WorkType, string[]> = {
  thesis: ["topic", "problem", "purpose", "questions", "concepts", "literature", "theory", "method", "sample", "instruments", "analysis", "findings", "discussion", "conclusion", "references", "appendices"],
  research_article: ["title_abstract", "introduction", "methods_article", "results_article", "discussion_article", "declarations", "references"],
  journal_article: ["title_abstract", "introduction", "methods_article", "results_article", "discussion_article", "declarations", "references"],
  capstone: ["topic", "problem", "purpose", "literature", "method", "design_development", "testing", "conclusion", "references", "appendices"],
  literature_review: ["topic", "review_protocol", "literature", "review_synthesis", "gaps", "conclusion", "references"],
  research_proposal: ["topic", "problem", "purpose", "questions", "literature", "theory", "method", "sample", "instruments", "analysis", "proposal_timeline", "risks", "references"],
  grant_proposal: ["grant_summary", "grant_originality", "grant_method", "grant_management", "grant_impact", "grant_budget", "references"],
  text_editing: ["editing_input", "editing_language", "editing_structure", "editing_citations", "references"],
  source_research: ["search_strategy", "source_screening", "annotated_notes", "references"],
};

/** Proje önerisi programları (başvuru formunun güncel hâli çağrı duyurusundan kontrol edilmelidir) */
export const GRANT_PROGRAMS = [
  { id: "tubitak_2209a", label: "TÜBİTAK 2209-A Üniversite Öğrencileri Araştırma Projeleri" },
  { id: "tubitak_2209b", label: "TÜBİTAK 2209-B Sanayiye Yönelik Bitirme Projeleri" },
  { id: "tubitak_1001", label: "TÜBİTAK 1001 Araştırma Projeleri" },
  { id: "tubitak_3501", label: "TÜBİTAK 3501 Kariyer Geliştirme Programı" },
  { id: "bap", label: "Üniversite BAP projesi" },
  { id: "scholarship", label: "Burs başvurusu için araştırma önerisi (ör. 2211, 2214)" },
  { id: "other", label: "Diğer kurum / fon" },
] as const;
export type GrantProgram = (typeof GRANT_PROGRAMS)[number]["id"];

export interface RoadmapInput {
  workType: WorkType;
  level: AcademicLevel;
  methodology?: Methodology;
  program?: GrantProgram;
}

export interface RoadmapStage {
  key: string;
  title: string;
  description: string;
}

/**
 * Çalışma türü, akademik seviye ve yönteme göre yol haritası üretir.
 * Kullanıcı daha sonra aşama ekleyebilir, silebilir, yeniden adlandırabilir ve sıralayabilir;
 * üniversite kılavuzu yüklendiğinde AI yeni bir düzen önerebilir (bkz. /api/projects/[id]/stages/suggest).
 */
export function buildRoadmap({ workType, level, methodology = "quantitative", program }: RoadmapInput): RoadmapStage[] {
  let keys = [...BASE[workType]];
  // Burs başvurusu araştırma önerilerinde bütçe bölümü bulunmaz
  if (workType === "grant_proposal" && program === "scholarship") keys = keys.filter((k) => k !== "grant_budget");

  if (workType === "thesis" || workType === "research_proposal") {
    if (methodology === "qualitative") {
      keys = keys.map((k) => (k === "sample" ? "participants" : k));
    }
    if (methodology === "theoretical") {
      keys = keys.filter((k) => !["sample", "instruments", "analysis", "findings"].includes(k));
    }
    if (methodology === "systematic_review") {
      keys = keys.flatMap((k) => (k === "sample" ? ["review_protocol"] : k === "instruments" ? [] : [k]));
    }
    // Lisans tezlerinde kuramsal çerçeve kavramsal çerçeveyle birleştirilir.
    if (level === "bachelor") keys = keys.filter((k) => k !== "theory");
  }

  const rename: Record<string, string> = {};
  if (methodology === "qualitative") {
    rename.questions = "Araştırma soruları";
    rename.instruments = "Veri toplama araçları (görüşme / gözlem)";
    rename.analysis = "Veri analizi (nitel)";
  }

  return keys.map((k) => {
    const def = STAGE_LIBRARY[k];
    return { key: k, title: rename[k] ?? def.title, description: def.purpose };
  });
}

export function stageDef(key: string): StageDef | undefined {
  return STAGE_LIBRARY[key];
}

export function customStageDef(key: string, title: string, description: string): StageDef {
  return { key, title, purpose: description || "Kullanıcı tanımlı bölüm.", steps: [], rules: [], questions: [] };
}

export { STAGE_LIBRARY };
export type { StageDef };
