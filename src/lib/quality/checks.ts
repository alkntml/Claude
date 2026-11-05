/**
 * Kural tabanlı akademik kalite kontrolü. Bu modül deterministiktir ve ücretsiz çalışır;
 * mantıksal bütünlük gibi yargı gerektiren kontroller ayrıca yapay zekâ incelemesiyle yapılır
 * (bkz. /api/projects/[id]/quality). İntihal kontrolü YAPMAZ.
 */
import { checkConsistency, findDuplicates, missingFields, FIELD_LABELS, type CitationItem } from "@/lib/citations";
import { makeT, type Locale } from "@/i18n";
import { wordCount } from "@/lib/editor/doc";
import { analyzeRepetition, isRepetitive } from "@/lib/quality/repetition";

export type Severity = "info" | "warning" | "error";

export interface QualityIssue {
  id: string;
  category: "language" | "consistency" | "citations" | "sources" | "structure" | "repetition" | "alignment" | "data";
  severity: Severity;
  title: string;
  detail: string;
  stageKey?: string;
  excerpt?: string;
  /** Puan etkisi çarpanı (varsayılan 1); ör. boşluk notları 1/7 ağırlıkla sayılır */
  weight?: number;
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

function ngrams(words: string[], n: number): string[] {
  const out: string[] = [];
  for (let k = 0; k + n <= words.length; k++) out.push(words.slice(k, k + n).join(" "));
  return out;
}

let counter = 0;
const nid = (p: string) => `${p}-${++counter}`;

export function runQualityChecks(stages: StageInput[], sources: SourceInput[], opts: { language?: "tr" | "en"; uiLocale?: Locale } = {}): QualityReport {
  counter = 0;
  const T = makeT(opts.uiLocale ?? "tr");
  const issues: QualityIssue[] = [];
  const informal = opts.language === "en" ? INFORMAL_EN : [...INFORMAL_TR, ...INFORMAL_EN];
  const writable = stages.filter((s) => !s.generated);

  // --- Yapı: eksik / çok kısa bölümler
  for (const s of writable) {
    const wc = wordCount(s.text);
    if (wc === 0) issues.push({ id: nid("structure"), category: "structure", severity: "warning", title: T("Boş bölüm"), detail: T("“{t}” bölümü henüz yazılmamış.", { t: s.title }), stageKey: s.key });
    else if (wc < 80) issues.push({ id: nid("structure"), category: "structure", severity: "info", title: T("Kısa bölüm"), detail: T("“{t}” yalnızca {n} kelime içeriyor.", { t: s.title, n: wc }), stageKey: s.key });
  }

  // --- Dil ve anlatım
  for (const s of writable) {
    const lower = s.text.toLocaleLowerCase("tr");
    for (const w of informal) {
      const re = new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}]|$)`, "u");
      if (re.test(lower)) issues.push({ id: nid("lang"), category: "language", severity: "warning", title: T("Günlük / öznel ifade"), detail: T("“{w}” ifadesi akademik dile uygun değildir.", { w }), stageKey: s.key, excerpt: w });
    }
    for (const w of OVERCLAIM) {
      if (lower.includes(w)) issues.push({ id: nid("lang"), category: "language", severity: "warning", title: T("Aşırı kesin iddia"), detail: T("“{w}” ifadesi bilimsel temkin ilkesine aykırı olabilir; “göstermektedir”, “işaret etmektedir” gibi ifadeler tercih edin.", { w }), stageKey: s.key, excerpt: w });
    }
    // Cümle uzunluğu ve noktalama kalite kontrolünde dikkate alınmaz (yönetici kararı, D80).
    // Çift boşluk yalnızca bilgi notu olarak gösterilir ve puanı normal bir notun 1/7’si kadar etkiler.
    if (/[^\S\n]{2,}/.test(s.text)) {
      issues.push({ id: nid("lang"), category: "language", severity: "info", title: T("Çift boşluk"), detail: T("Metinde art arda iki veya daha fazla boşluk bulundu."), stageKey: s.key, weight: 1 / 7 });
    }
  }

  // --- Yer tutucular (AI'nin bilinçli olarak boş bıraktığı alanlar)
  for (const s of writable) {
    const missingRef = (s.text.match(/\[KAYNAK GEREKLİ\]|\[KAYNAK DOĞRULANAMADI\]/g) ?? []).length;
    const missingData = (s.text.match(/\[VERİ GİRİLECEK[^\]]*\]/g) ?? []).length;
    if (missingRef) issues.push({ id: nid("cit"), category: "citations", severity: "error", title: T("Kaynak gerektiren iddia"), detail: T("{n} iddia için henüz kaynak gösterilmemiş.", { n: missingRef }), stageKey: s.key });
    if (missingData) issues.push({ id: nid("data"), category: "data", severity: "error", title: T("Veri girilmesi gereken alan"), detail: T("{n} alanda sizin araştırma verinizin girilmesi gerekiyor.", { n: missingData }), stageKey: s.key });
  }

  // --- Literatür gerektiren bölümlerde atıfsız paragraflar
  for (const s of writable.filter((x) => x.needsLiterature && wordCount(x.text) > 0)) {
    if (s.citedIds.length === 0) {
      issues.push({ id: nid("cit"), category: "citations", severity: "warning", title: T("Atıf içermeyen bölüm"), detail: T("“{t}” literatüre dayanması gereken bir bölüm olduğu hâlde hiç atıf içermiyor.", { t: s.title }), stageKey: s.key });
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
    issues.push({ id: nid("rep"), category: "repetition", severity: "info", title: T("Bölümler arası tekrar eden ifadeler"), detail: T("{n} ifade birden fazla bölümde aynen geçiyor. Örnek: “{e}”.", { n: repeated.size, e: examples[0] }), excerpt: examples.join(" · ") });
  }

  // --- Bölüm içi tekrar: kalıp ifadeler, aynı geçiş ifadesiyle başlayan cümleler, birbirine çok benzeyen cümleler
  for (const s of writable) {
    if (s.text.length < 600) continue;
    const r = analyzeRepetition(s.text, { minCount: 3 });
    if (!isRepetitive(r)) continue;
    const parts = [...r.openers.slice(0, 3).map((o) => `“${o.opener}…” ×${o.count}`), ...r.phrases.slice(0, 4).map((p) => `“${p.phrase}” ×${p.count}`)];
    issues.push({ id: nid("rep"), category: "repetition", severity: "warning", stageKey: s.key, title: T("Bölüm içinde tekrar eden ifadeler: {s}", { s: s.title }),
      detail: r.nearDuplicates.length ? T("Birbirine çok benzeyen {n} cümle çifti ve tekrar eden kalıplar var. Metni seçip asistanda “Tekrarları azalt”ı kullanın.", { n: r.nearDuplicates.length }) : T("Aynı kalıplar sık tekrar ediyor. Metni seçip asistanda “Tekrarları azalt”ı kullanın."),
      excerpt: parts.join(" · ") || r.nearDuplicates[0]?.a });
  }

  // --- Hipotez – analiz – bulgu uyumu
  const qStage = stages.find((s) => s.key === "questions");
  const hyps = [...new Set((qStage?.text.match(/\bH\d+[a-z]?\b/g) ?? []))];
  const analysis = stages.filter((s) => ["analysis", "findings", "results_article"].includes(s.key)).map((s) => s.text).join("\n");
  if (hyps.length && analysis.trim()) {
    const missing = hyps.filter((h) => !new RegExp(`\\b${h}\\b`).test(analysis));
    if (missing.length) issues.push({ id: nid("align"), category: "alignment", severity: "warning", title: T("Test edilmeyen hipotez"), detail: T("{h} hipotez(ler)i analiz veya bulgular bölümünde ele alınmıyor.", { h: missing.join(", ") }), stageKey: "analysis" });
  }

  // --- Kaynaklar ve atıf tutarlılığı
  const allCited = [...new Set(stages.flatMap((s) => s.citedIds))];
  const consistency = checkConsistency({ citedIds: allCited, sources, plainText: writable.map((s) => s.text).join("\n") });
  if (consistency.danglingCitations.length) issues.push({ id: nid("cit"), category: "citations", severity: "error", title: T("Kaynakçada olmayan atıf"), detail: T("{n} atıf, kütüphaneden silinmiş bir kaynağa işaret ediyor.", { n: consistency.danglingCitations.length }) });
  if (consistency.uncitedSources.length) issues.push({ id: nid("cit"), category: "citations", severity: "info", title: T("Kullanılmayan kaynak"), detail: T("{n} kaynak kütüphanede var ama metinde atıf almıyor; kaynakçaya eklenmez.", { n: consistency.uncitedSources.length }) });
  for (const m of consistency.unmatchedManualCitations.slice(0, 10)) {
    issues.push({ id: nid("cit"), category: "citations", severity: "warning", title: T("Eşleşmeyen elle yazılmış atıf"), detail: T("Bu atıf kaynak kütüphanenizdeki hiçbir kaynakla eşleşmiyor ve kaynakçaya eklenmeyecek."), excerpt: m });
  }
  for (const g of findDuplicates(sources)) {
    issues.push({ id: nid("src"), category: "sources", severity: "warning", title: T("Yinelenen kaynak"), detail: T("{n} kayıt aynı eser olabilir ({r}).", { n: g.ids.length, r: g.reason === "doi" ? T("aynı DOI") : T("benzer başlık") }) });
  }
  const citedSet = new Set(allCited);
  for (const s of sources.filter((x) => citedSet.has(x.id))) {
    const miss = missingFields(s);
    if (miss.length) issues.push({ id: nid("src"), category: "sources", severity: "warning", title: T("Eksik künye"), detail: T("“{t}”: {f} eksik.", { t: s.title.slice(0, 80), f: miss.map((m) => T(FIELD_LABELS[m] ?? String(m))).join(", ") }) });
    if (!s.verified) issues.push({ id: nid("src"), category: "sources", severity: "warning", title: T("Doğrulanmamış kaynak"), detail: T("“{t}” kalıcı bir tanımlayıcıyla doğrulanmadı.", { t: s.title.slice(0, 80) }) });
  }
  const metaOnly = sources.filter((x) => citedSet.has(x.id) && x.accessLevel === "metadata").length;
  if (metaOnly) issues.push({ id: nid("src"), category: "sources", severity: "info", title: T("Yalnızca künyesi bilinen kaynaklar"), detail: T("{n} atıf yapılan kaynağın ne özeti ne tam metni okundu. Bu kaynaklara dayalı iddiaları kontrol edin.", { n: metaOnly }) });

  // --- Puan
  const weights: Record<Severity, number> = { error: 6, warning: 2.5, info: 0.6 };
  const penalty = issues.reduce((acc, it) => acc + weights[it.severity] * (it.weight ?? 1), 0);
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
    plagiarism: { available: false, note: T("Lisanslı bir intihal servisi entegre edilmediği için intihal oranı hesaplanmaz.") },
  };
}
