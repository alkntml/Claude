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

export const BlueprintSchema = z.object({
  problem: Text(2000), aim: Text(2000), method: Text(2000), sample: Text(2000), data: Text(2000), analysis: Text(2000), contribution: Text(2000),
  /** Araştırma soruları / hipotezler (her biri ayrı) */
  questions: z.array(z.string().trim().min(1).max(500)).max(12).default([]),
  /** Bölüm bölüm plan: aşamaların kendisi değişmez, yalnızca her aşamada ne yazılacağı tutulur */
  chapters: z.array(z.object({ stageId: z.string().max(64), key: z.string().max(64), title: z.string().max(300), plan: Text(1200) })).max(40).default([]),
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
    return { stageId: s.id, key: s.key, title: s.title, plan: old?.plan ?? "" };
  });
}

/** Kurgunun doluluğu: boş alan sayısı (onay öncesi uyarı için) */
export function blueprintGaps(bp: Blueprint): string[] {
  const gaps: string[] = BLUEPRINT_FIELDS.filter((f) => !bp[f.key].trim()).map((f) => f.label);
  if (!bp.questions.length) gaps.push("Araştırma soruları / hipotezler");
  return gaps;
}

/** Yapay zekâ bağlamına eklenen metin: genel kurgu + (verilirse) üzerinde çalışılan bölümün planı */
export function blueprintContext(bp: Blueprint | null, stage?: { id: string; key: string } | null): string {
  if (!bp) return "";
  const lines: string[] = [];
  for (const f of BLUEPRINT_FIELDS) if (bp[f.key].trim()) lines.push(`- ${f.label}: ${bp[f.key].trim()}`);
  if (bp.questions.length) lines.push(`- Araştırma soruları / hipotezler:\n${bp.questions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}`);
  if (!lines.length && !bp.chapters.some((c) => c.plan.trim())) return "";
  const out = [`## ÇALIŞMANIN KURGUSU (öğrencinin ${bp.approvedAt ? "onayladığı" : "taslak"} planı; yazımı buna uygun sürdür, plan bir kaynak veya bulgu değildir)`, ...lines];
  const plans = bp.chapters.filter((c) => c.plan.trim());
  if (plans.length) out.push("Bölüm planı:", ...plans.map((c) => `- ${c.title}: ${c.plan.trim()}`));
  const mine = stage ? bp.chapters.find((c) => c.stageId === stage.id) ?? bp.chapters.find((c) => c.key === stage.key) : null;
  if (mine?.plan.trim()) out.push(`\nBU BÖLÜMÜN KURGUDAKİ PLANI: ${mine.plan.trim()}`);
  return out.join("\n");
}
