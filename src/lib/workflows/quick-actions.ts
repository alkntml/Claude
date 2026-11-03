/**
 * Asistan kısayolları aşamaya göre (D75): her bölümde o bölümün işini kolaylaştıran kısayollar görünür.
 * “Bölümü yaz” her yerde; “Literatür araştır” yalnızca literatüre dayanan bölümlerde veya projede
 * kapsam için yeterli kaynak yokken (her yerde görünmesi sürekli tarama gerekiyormuş izlenimi verir).
 */
export type QuickId =
  | "outline" | "analysis" | "research"
  | "draft" | "plan" | "synthesize" | "research_questions" | "hypotheses" | "methodology"
  | "interpret" | "discussion" | "consistency" | "abstract" | "ethics_docs";

const GROUPS: { keys: string[]; actions: QuickId[] }[] = [
  { keys: ["topic"], actions: ["draft", "plan"] },
  { keys: ["problem", "introduction"], actions: ["draft", "research", "plan"] },
  { keys: ["purpose"], actions: ["draft", "consistency"] },
  { keys: ["questions"], actions: ["research_questions", "hypotheses", "draft"] },
  { keys: ["concepts", "theory"], actions: ["outline", "draft", "research", "synthesize"] },
  { keys: ["literature", "gaps", "review_synthesis", "annotated_notes"], actions: ["outline", "synthesize", "research", "draft"] },
  { keys: ["method", "methods_article", "design_development", "review_protocol", "grant_method"], actions: ["methodology", "draft", "outline", "ethics_docs"] },
  { keys: ["sample", "participants", "instruments", "testing", "search_strategy", "source_screening"], actions: ["draft", "methodology", "ethics_docs"] },
  { keys: ["analysis"], actions: ["methodology", "draft"] },
  { keys: ["findings", "results_article"], actions: ["analysis", "interpret", "draft", "outline"] },
  { keys: ["discussion", "discussion_article"], actions: ["discussion", "outline", "draft", "consistency"] },
  { keys: ["conclusion"], actions: ["draft", "consistency", "abstract"] },
  { keys: ["title_abstract"], actions: ["abstract"] },
  { keys: ["declarations", "appendices", "risks", "grant_management", "grant_budget", "proposal_timeline"], actions: ["draft", "ethics_docs"] },
  { keys: ["grant_summary"], actions: ["draft", "abstract"] },
  { keys: ["grant_originality", "grant_impact"], actions: ["draft", "research", "consistency"] },
];

const ETHICS = new Set(["method", "sample", "participants", "instruments", "appendices", "methods_article", "declarations", "risks", "grant_method", "grant_management"]);

export function quickActions(stageKey: string | undefined, ctx: { lowSources: boolean; hasData: boolean; longSection: boolean }): QuickId[] {
  const g = GROUPS.find((x) => stageKey && x.keys.includes(stageKey));
  let list: QuickId[] = g ? [...g.actions] : ["draft", "plan"];
  // Etik kurul belgeleri yalnızca yöntem/katılımcı/ek bölümlerinde
  list = list.filter((a) => a !== "ethics_docs" || (stageKey && ETHICS.has(stageKey)));
  // Kapsam için kaynak azsa (yeni çalışma) literatür kısayolu her bölümde öne çıkmasın, ama erişilebilir olsun
  if (ctx.lowSources && !list.includes("research") && list.includes("draft")) list.push("research");
  // Veri yüklendiyse bulgu bölümleri dışında da istatistik kısayolu (yalnızca bulgu/analiz bölümlerinde öne alınır)
  if (ctx.hasData && !list.includes("analysis") && (stageKey === "analysis" || stageKey === "testing")) list.unshift("analysis");
  // Uzun bölümde alt başlıklarla yazım; kısa bölümde (giriş alt kısımları) gereksiz
  if (!ctx.longSection) list = list.filter((a) => a !== "outline");
  else if (!list.includes("outline") && list.includes("draft")) list.unshift("outline");
  // “Bölümü yaz” her yerde bulunur (özet bölümü hariç)
  if (!list.includes("draft") && stageKey !== "title_abstract") list.push("draft");
  return [...new Set(list)];
}

/** Çalışma türü ve seviyesine göre “kapsam için asgari kaynak” (bu sayının altında yazım tarama gerektirebilir) */
export function minSourcesFor(workType: string, level: string): number {
  if (workType === "literature_review") return 40;
  if (workType === "thesis") return level === "doctorate" ? 60 : level === "master" ? 35 : 20;
  if (workType === "research_article" || workType === "journal_article") return 20;
  if (workType === "research_proposal" || workType === "grant_proposal") return 12;
  if (workType === "capstone") return 12;
  return 10;
}

