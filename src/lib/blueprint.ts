/**
 * Çalışmanın kurgusu (D67): çalışmaya başlamadan önce öğrencinin tek ekranda gördüğü, düzenleyip
 * onayladığı araştırma planı. `projects.context.blueprint` içinde saklanır; aşamalar değişmez, kurgu
 * her aşama için “bu bölümde ne yazılacak” planını tutar ve sonraki tüm yazımlarda bağlam olarak kullanılır.
 * İstemci + sunucu ortak modül.
 */
import { z } from "zod";

export const BLUEPRINT_FIELDS = [
  { key: "problem", label: "Araştırma problemi", hint: "Hangi boşluğu veya sorunu ele alıyorsunuz? Neden önemli?" },
  { key: "aim", label: "Amaç", hint: "Çalışma sonunda neyi ortaya koymak istiyorsunuz?" },
  { key: "method", label: "Yöntem ve desen", hint: "Nicel / nitel / karma; desen (ör. ilişkisel tarama, durum çalışması, sistematik derleme)" },
  { key: "sample", label: "Katılımcılar / kapsam", hint: "Evren ve örneklem, çalışma grubu ya da derlemeye alınacak çalışmaların ölçütleri" },
  { key: "data", label: "Veri toplama / kaynak tarama", hint: "Ölçekler, görüşme formu, belge, veri tabanları ve arama stratejisi" },
  { key: "analysis", label: "Analiz / sentez", hint: "Hangi analizler yapılacak; bulgular nasıl sentezlenecek?" },
  { key: "contribution", label: "Özgün değer ve katkı", hint: "Alana ve uygulamaya ne katacak?" },
] as const;
export type BlueprintFieldKey = (typeof BLUEPRINT_FIELDS)[number]["key"];

const Text = (max: number) => z.string().max(max).default("");

/** A4, 12 punto, 1,5 satır aralığında akademik metin için ortalama sayfa başına kelime */
export const WORDS_PER_PAGE = 275;

/**
 * Bölümlerin varsayılan uzunluk ağırlıkları (kurgu ilk kez dağıtılırken veya yapay zekâ önermezse).
 * Kaynakça ve ekler uzunluk hesabına katılmaz.
 */
const STAGE_WEIGHT: Record<string, number> = {
  topic: 2, problem: 3, purpose: 2, questions: 1.5, concepts: 3, theory: 10, literature: 14, gaps: 3,
  method: 3, design_development: 3, sample: 2, participants: 2, instruments: 3, analysis: 2.5, testing: 2,
  findings: 12, results_article: 10, discussion: 10, discussion_article: 8, conclusion: 4,
  introduction: 6, methods_article: 6, title_abstract: 1, declarations: 0.5, annotated_notes: 6,
  review_protocol: 4, search_strategy: 3, source_screening: 3, review_synthesis: 14,
  grant_summary: 2, grant_originality: 6, grant_method: 8, grant_management: 5, grant_risks: 3, risks: 3, grant_impact: 5, grant_budget: 2, proposal_timeline: 2,
};
const NO_LENGTH = new Set(["references", "appendices"]);
export const countsForLength = (key: string) => !NO_LENGTH.has(key);

const roundTo = (n: number, step: number) => Math.max(0, Math.round(n / step) * step);

/**
 * Toplam kelimeyi bölümlere dağıtır. `weights` verilmezse mevcut bölüm kelimeleri (toplamı > 0 ise) oran olarak
 * korunur, yoksa varsayılan ağırlıklar kullanılır. Sonuç yuvarlanır ve toplam hedefe tam eşitlenir.
 */
export function distributeWords<T extends { key: string; words?: number }>(chapters: T[], total: number, weights?: number[]): (T & { words: number })[] {
  const elig = chapters.map((c) => countsForLength(c.key));
  const own = chapters.map((c, i) => (elig[i] ? Math.max(0, c.words ?? 0) : 0));
  const base = weights?.length === chapters.length && weights.some((w, i) => elig[i] && w > 0)
    ? weights.map((w, i) => (elig[i] ? Math.max(0, w) : 0))
    : own.some((w) => w > 0) ? own : chapters.map((c, i) => (elig[i] ? STAGE_WEIGHT[c.key] ?? 3 : 0));
  const sum = base.reduce((a, b) => a + b, 0);
  if (!total || total <= 0 || !sum) return chapters.map((c) => ({ ...c, words: 0 }));
  const step = total >= 4000 ? 50 : 10;
  const out = base.map((w) => roundTo((w / sum) * total, step));
  // Yuvarlama farkını en uzun bölüme ekle/çıkar
  const diff = total - out.reduce((a, b) => a + b, 0);
  if (diff) { const k = out.indexOf(Math.max(...out)); out[k] = Math.max(0, out[k] + diff); }
  return chapters.map((c, i) => ({ ...c, words: out[i] }));
}

export const pagesFor = (words: number, wpp = WORDS_PER_PAGE) => (words > 0 ? Math.max(1, Math.round(words / wpp)) : 0);

export const BlueprintSchema = z.object({
  problem: Text(2000), aim: Text(2000), method: Text(2000), sample: Text(2000), data: Text(2000), analysis: Text(2000), contribution: Text(2000),
  /** Araştırma soruları / hipotezler (her biri ayrı) */
  questions: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  /** Bölüm bölüm plan: aşamaların kendisi değişmez, yalnızca her aşamada ne yazılacağı tutulur */
  chapters: z.array(z.object({ stageId: z.string().max(64), key: z.string().max(64), title: z.string().max(300), plan: Text(1200), words: z.number().int().min(0).max(200000).default(0) })).max(40).default([]),
  /** Hedef uzunluk: toplam kelime ve sayfa başına kelime (sayfa = kelime / wordsPerPage) */
  targetWords: z.number().int().min(0).max(500000).default(0),
  wordsPerPage: z.number().int().min(150).max(600).default(WORDS_PER_PAGE),
  /** Öğrencinin kendi girişi (kurgunun hangi fikirden üretildiği) */
  input: Text(2000),
  approvedAt: z.string().max(40).nullable().default(null),
  updatedAt: z.string().max(40).nullable().default(null),
});
export type Blueprint = z.infer<typeof BlueprintSchema>;

export const emptyBlueprint = (): Blueprint => BlueprintSchema.parse({});

/** Kaydedilmiş kurgu (bozuk/eski biçimli olabilir) → güvenli kurgu; yoksa null */
export function readBlueprint(raw: unknown): Blueprint | null {
  if (!raw || typeof raw !== "object") return null;
  const r = BlueprintSchema.safeParse(raw);
  return r.success ? r.data : null;
}

/** Bölüm planlarını güncel aşama listesiyle hizalar (aşama eklendi/silindi/yeniden adlandırıldıysa) */
export function alignChapters(bp: Blueprint, stages: { id: string; key: string; title: string }[]): Blueprint["chapters"] {
  return stages.filter((s) => s.key !== "references").map((s) => {
    const old = bp.chapters.find((c) => c.stageId === s.id) ?? bp.chapters.find((c) => c.key === s.key && !stages.some((x) => x.id === c.stageId));
    return { stageId: s.id, key: s.key, title: s.title, plan: old?.plan ?? "", words: old?.words ?? 0 };
  });
}

/** Kurgunun doluluğu: boş alan sayısı (onay öncesi uyarı için) */
export function blueprintGaps(bp: Blueprint): string[] {
  const gaps: string[] = BLUEPRINT_FIELDS.filter((f) => !bp[f.key].trim()).map((f) => f.label);
  if (!bp.questions.length) gaps.push("Araştırma soruları / hipotezler");
  if (!bp.targetWords) gaps.push("Hedef uzunluk (toplam kelime)");
  return gaps;
}

/** Yapay zekâ bağlamına eklenen metin: genel kurgu + (verilirse) üzerinde çalışılan bölümün planı */
export function blueprintContext(bp: Blueprint | null, stage?: { id: string; key: string } | null): string {
  if (!bp) return "";
  const lines: string[] = [];
  for (const f of BLUEPRINT_FIELDS) if (bp[f.key].trim()) lines.push(`- ${f.label}: ${bp[f.key].trim()}`);
  if (bp.questions.length) lines.push(`- Araştırma soruları / hipotezler:\n${bp.questions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}`);
  if (bp.targetWords) lines.push(`- Hedef uzunluk: toplam yaklaşık ${bp.targetWords} kelime`);
  if (!lines.length && !bp.chapters.some((c) => c.plan.trim())) return "";
  const out = [`## ÇALIŞMANIN KURGUSU (öğrencinin ${bp.approvedAt ? "onayladığı" : "taslak"} planı; yazımı buna uygun sürdür, plan bir kaynak veya bulgu değildir)`, ...lines];
  const plans = bp.chapters.filter((c) => c.plan.trim() || c.words);
  if (plans.length) out.push("Bölüm planı:", ...plans.map((c) => `- ${c.title}${c.words ? ` (~${c.words} kelime)` : ""}${c.plan.trim() ? `: ${c.plan.trim()}` : ""}`));
  const mine = stage ? bp.chapters.find((c) => c.stageId === stage.id) ?? bp.chapters.find((c) => c.key === stage.key) : null;
  if (mine?.plan.trim()) out.push(`\nBU BÖLÜMÜN KURGUDAKİ PLANI: ${mine.plan.trim()}`);
  if (mine?.words) out.push(`BU BÖLÜMÜN HEDEF UZUNLUĞU: bölümün tamamı yaklaşık ${mine.words} kelime olmalı (±%15). Bölümü alt başlıklara bölerken bu uzunluğu alt başlıklara dengeli dağıt; tek bir alt başlık yazıyorsan yalnızca ona düşen payı yaz. Bölümün mevcut metnini de hesaba kat ve hedefi aşma.`);
  return out.join("\n");
}
