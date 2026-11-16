import "server-only";
/**
 * D213: Mizan doğruluk ölçümü. Gerçek açık erişimli makalelerin (Europe PMC tam metni, CC BY) ürünün kendi parçalama
 * motoruyla hazırlanmış parçaları ve elle etiketlenmiş iddialar, canlıdaki iddia denetimi motoruna (auditSources)
 * kullanıcıların gördüğü ayarlarla verilir; kararlar etiketlerle karşılaştırılır.
 */
import data from "./mizan-bench-data.json";
import { auditSources, type PairInput, type SourceInput } from "@/lib/claim-audit";
import { scoreBench, type BenchLabel, type BenchScore } from "./mizan-score";

export interface BenchRun {
  at: string; model: string; provider: string; costUsd: number; calls: number; durationMs: number; part?: number; parts?: number;
  score: BenchScore;
  rows: { id: string; article: string; sentence: string; label: BenchLabel; predicted: string; explanation: string; quote: string | null }[];
  articles: { pmcid: string; doi: string | null; title: string; year: string | null }[];
}

/** D221: 200 iddia tek istekte sunucu süre sınırını aşabileceği için ölçüm makale gruplarıyla parça parça yapılır */
export const BENCH_PARTS = 4;

export async function runMizanBench(planId: string, part = 0, prev: BenchRun | null = null): Promise<BenchRun & { usage: { input: number; output: number } }> {
  const t0 = Date.now();
  const size = Math.ceil(data.articles.length / BENCH_PARTS);
  const articles = data.articles.slice(part * size, (part + 1) * size);
  const groups = articles.map((a) => ({
    source: { id: a.pmcid, title: a.title, abstract: a.abstract, access_level: "full_text", chunks: a.chunks.map((c) => ({ content: c.content, page_hint: c.page_hint ?? null })) } as SourceInput,
    pairs: a.claims.map((c) => ({ claimId: c.id, sentence: c.sentence, locator: null })) as PairInput[],
  }));
  const out = await auditSources({ planId, lang: "tr", groups });
  const byId = new Map(out.results.map((r) => [r.claimId, r]));
  const fresh = articles.flatMap((a) => a.claims.map((c) => {
    const r = byId.get(c.id);
    return { id: c.id, article: a.pmcid, sentence: c.sentence, label: c.label as BenchLabel, predicted: r?.verdict ?? "no_answer", explanation: r?.explanation ?? "", quote: r?.quote ?? null };
  }));
  const base = part > 0 && prev ? prev : null;
  const rows = [...(base?.rows ?? []), ...fresh];
  return {
    at: new Date().toISOString(), model: out.model, provider: out.provider, costUsd: (base?.costUsd ?? 0) + out.cost, calls: (base?.calls ?? 0) + out.calls,
    durationMs: (base?.durationMs ?? 0) + Date.now() - t0, usage: out.usage, part, parts: BENCH_PARTS,
    score: scoreBench(rows), rows,
    articles: data.articles.map((a) => ({ pmcid: a.pmcid, doi: a.doi, title: a.title, year: a.year })),
  };
}
