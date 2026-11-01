/**
 * Kural tabanlı akademik kalite kontrolü. Bu modül deterministiktir ve ücretsiz çalışır;
 * mantıksal bütünlük gibi yargı gerektiren kontroller ayrıca yapay zekâ incelemesiyle yapılır
 * (bkz. /api/projects/[id]/quality). İntihal kontrolü YAPMAZ.
 */
import { checkConsistency, findDuplicates, missingFields, type CitationItem } from "@/lib/citations";
import { wordCount } from "@/lib/editor/doc";

export type Severity = "info" | "warning" | "error";

export interface QualityIssue {
  id: string;
  category: "language" | "consistency" | "citations" | "sources" | "structure" | "repetition" | "alignment" | "data";
  severity: Severity;
  title: string;
  detail: string;
  stageKey?: string;
  excerpt?: string;
}

export interface StageInput {
  key: string;
  title: string;
  text: string;
  citedIds: string[];
  requiresUserData?: boolean;
  needsLiterature?: boolean;
  generated?: boolean;
}

export interface SourceInput extends CitationItem {
  verified: boolean;
  accessLevel: "metadata" | "abstract" | "full_text";
}

export interface QualityReport {
  score: number;
  issues: QualityIssue[];
  stats: { words: number; citations: number; sources: number; verifiedSources: number; stagesFilled: number; stagesTotal: number };
  generatedAt: string;
  plagiarism: { available: false; note: string };
}

const INFORMAL_TR = ["bence", "sanırım", "galiba", "çok çok", "süper", "harika", "berbat", "kesinlikle herkes", "hiç kimse", "aslında", "yani", "falan", "filan", "baya", "bayağı", "şey"];
const INFORMAL_EN = ["i think", "i believe", "a lot of", "lots of", "really", "very very", "stuff", "things like", "kind of", "sort of", "obviously", "everybody knows"];
const OVERCLAIM = ["kanıtlamıştır", "kesin olarak", "şüphesiz", "tartışmasız", "proves that", "undoubtedly", "it is certain"];

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=[\p{Lu}"“(])/u).map((s) => s.trim()).filter(Boolean);
}

function ngrams(words: string[], n: number): string[] {
  const out: string[] = [];
  for (let k = 0; k + n <= words.length; k++) out.push(words.slice(k, k + n).join(" "));
  return out;
}

let counter = 0;
const nid = (p: string) => `${p}-${++counter}`;

export function runQualityChecks(stages: StageInput[], sources: SourceInput[], opts: { language?: "tr" | "en" } = {}): QualityReport {
  counter = 0;
  const issues: QualityIssue[] = [];
  const informal = opts.language === "en" ? INFORMAL_EN : [...INFORMAL_TR, ...INFORMAL_EN];
  const writable = stages.filter((s) => !s.generated);

  // --- Yapı: eksik / çok kısa bölümler
  for (const s of writable) {
    const wc = wordCount(s.text);
    if (wc === 0) issues.push({ id: nid("structure"), category: "structure", severity: "warning", title: "Boş bölüm", detail: `“${s.title}” bölümü henüz yazılmamış.`, stageKey: s.key });
    else if (wc < 80) issues.push({ id: nid("structure"), category: "structure", severity: "info", title: "Kısa bölüm", detail: `“${s.title}” yalnızca ${wc} kelime içeriyor.`, stageKey: s.key });
  }

  // --- Dil ve anlatım
  for (const s of writable) {
    const lower = s.text.toLocaleLowerCase("tr");
    for (const w of informal) {
      const re = new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "u");
      if (re.test(lower)) issues.push({ id: nid("lang"), category: "language", severity: "warning", title: "Günlük / öznel ifade", detail: `“${w}” ifadesi akademik dile uygun değildir.`, stageKey: s.key, excerpt: w });
    }
    for (const w of OVERCLAIM) {
      if (lower.includes(w)) issues.push({ id: nid("lang"), category: "language", severity: "warning", title: "Aşırı kesin iddia", detail: `“${w}” ifadesi bilimsel temkin ilkesine aykırı olabilir; “göstermektedir”, “işaret etmektedir” gibi ifadeler tercih edin.`, stageKey: s.key, excerpt: w });
    }
    for (const sent of sentences(s.text)) {
      const wc = wordCount(sent);
      if (wc > 45) issues.push({ id: nid("lang"), category: "language", severity: "info", title: "Çok uzun cümle", detail: `${wc} kelimelik cümle okunabilirliği düşürür; bölmeyi düşünün.`, stageKey: s.key, excerpt: sent.slice(0, 160) + (sent.length > 160 ? "…" : "") });
    }
    if (/\s{2,}|\s[,.;:]/.test(s.text.replace(/\n/g, " "))) {
      issues.push({ id: nid("lang"), category: "language", severity: "info", title: "Boşluk / noktalama", detail: "Noktalama işaretlerinden önce boşluk veya çift boşluk bulundu.", stageKey: s.key });
    }
  }

  // --- Yer tutucular (AI'nin bilinçli olarak boş bıraktığı alanlar)
  for (const s of writable) {
    const missingRef = (s.text.match(/\[KAYNAK GEREKLİ\]|\[KAYNAK DOĞRULANAMADI\]/g) ?? []).length;
    const missingData = (s.text.match(/\[VERİ GİRİLECEK[^\]]*\]/g) ?? []).length;
    if (missingRef) issues.push({ id: nid("cit"), category: "citations", severity: "error", title: "Kaynak gerektiren iddia", detail: `${missingRef} iddia için henüz kaynak gösterilmemiş.`, stageKey: s.key });
    if (missingData) issues.push({ id: nid("data"), category: "data", severity: "error", title: "Veri girilmesi gereken alan", detail: `${missingData} alanda sizin araştırma verinizin girilmesi gerekiyor.`, stageKey: s.key });
  }

  // --- Literatür gerektiren bölümlerde atıfsız paragraflar
  for (const s of writable.filter((x) => x.needsLiterature && wordCount(x.text) > 0)) {
    if (s.citedIds.length === 0) {
      issues.push({ id: nid("cit"), category: "citations", severity: "warning", title: "Atıf içermeyen bölüm", detail: `“${s.title}” literatüre dayanması gereken bir bölüm olduğu hâlde hiç atıf içermiyor.`, stageKey: s.key });
    }
  }

  // --- Tekrarlanan ifadeler (6-gram, bölümler arası)
  const seen = new Map<string, string>();
  const repeated = new Map<string, Set<string>>();
  for (const s of writable) {
    const words = s.text.toLocaleLowerCase("tr").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
    for (const g of new Set(ngrams(words, 6))) {
      const prev = seen.get(g);
      if (prev && prev !== s.key) repeated.set(g, new Set([prev, s.key, ...(repeated.get(g) ?? [])]));
      else if (!prev) seen.set(g, s.key);
    }
  }
  if (repeated.size) {
    const examples = [...repeated.keys()].slice(0, 5);
    issues.push({ id: nid("rep"), category: "repetition", severity: "info", title: "Bölümler arası tekrar eden ifadeler", detail: `${repeated.size} ifade birden fazla bölümde aynen geçiyor. Örnek: “${examples[0]}”.`, excerpt: examples.join(" · ") });
  }

  // --- Hipotez – analiz – bulgu uyumu
  const qStage = stages.find((s) => s.key === "questions");
  const hyps = [...new Set((qStage?.text.match(/\bH\d+[a-z]?\b/g) ?? []))];
  const analysis = stages.filter((s) => ["analysis", "findings", "results_article"].includes(s.key)).map((s) => s.text).join("\n");
  if (hyps.length && analysis.trim()) {
    const missing = hyps.filter((h) => !new RegExp(`\\b${h}\\b`).test(analysis));
    if (missing.length) issues.push({ id: nid("align"), category: "alignment", severity: "warning", title: "Test edilmeyen hipotez", detail: `${missing.join(", ")} hipotez(ler)i analiz veya bulgular bölümünde ele alınmıyor.`, stageKey: "analysis" });
  }

  // --- Kaynaklar ve atıf tutarlılığı
  const allCited = [...new Set(stages.flatMap((s) => s.citedIds))];
  const consistency = checkConsistency({ citedIds: allCited, sources, plainText: writable.map((s) => s.text).join("\n") });
  if (consistency.danglingCitations.length) issues.push({ id: nid("cit"), category: "citations", severity: "error", title: "Kaynakçada olmayan atıf", detail: `${consistency.danglingCitations.length} atıf, kütüphaneden silinmiş bir kaynağa işaret ediyor.` });
  if (consistency.uncitedSources.length) issues.push({ id: nid("cit"), category: "citations", severity: "info", title: "Kullanılmayan kaynak", detail: `${consistency.uncitedSources.length} kaynak kütüphanede var ama metinde atıf almıyor; kaynakçaya eklenmez.` });
  for (const m of consistency.unmatchedManualCitations.slice(0, 10)) {
    issues.push({ id: nid("cit"), category: "citations", severity: "warning", title: "Eşleşmeyen elle yazılmış atıf", detail: "Bu atıf kaynak kütüphanenizdeki hiçbir kaynakla eşleşmiyor ve kaynakçaya eklenmeyecek.", excerpt: m });
  }
  for (const g of findDuplicates(sources)) {
    issues.push({ id: nid("src"), category: "sources", severity: "warning", title: "Yinelenen kaynak", detail: `${g.ids.length} kayıt aynı eser olabilir (${g.reason === "doi" ? "aynı DOI" : "benzer başlık"}).` });
  }
  const citedSet = new Set(allCited);
  for (const s of sources.filter((x) => citedSet.has(x.id))) {
    const miss = missingFields(s);
    if (miss.length) issues.push({ id: nid("src"), category: "sources", severity: "warning", title: "Eksik künye", detail: `“${s.title.slice(0, 80)}”: ${miss.join(", ")} eksik.` });
    if (!s.verified) issues.push({ id: nid("src"), category: "sources", severity: "warning", title: "Doğrulanmamış kaynak", detail: `“${s.title.slice(0, 80)}” kalıcı bir tanımlayıcıyla doğrulanmadı.` });
  }
  const metaOnly = sources.filter((x) => citedSet.has(x.id) && x.accessLevel === "metadata").length;
  if (metaOnly) issues.push({ id: nid("src"), category: "sources", severity: "info", title: "Yalnızca künyesi bilinen kaynaklar", detail: `${metaOnly} atıf yapılan kaynağın ne özeti ne tam metni okundu. Bu kaynaklara dayalı iddiaları kontrol edin.` });

  // --- Puan
  const weights: Record<Severity, number> = { error: 6, warning: 2.5, info: 0.6 };
  const penalty = issues.reduce((acc, it) => acc + weights[it.severity], 0);
  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  const words = writable.reduce((a, s) => a + wordCount(s.text), 0);
  return {
    score,
    issues,
    stats: {
      words,
      citations: stages.reduce((a, s) => a + s.citedIds.length, 0),
      sources: sources.length,
      verifiedSources: sources.filter((s) => s.verified).length,
      stagesFilled: writable.filter((s) => wordCount(s.text) > 0).length,
      stagesTotal: writable.length,
    },
    generatedAt: new Date().toISOString(),
    plagiarism: { available: false, note: "Lisanslı bir intihal servisi entegre edilmediği için intihal oranı hesaplanmaz." },
  };
}
