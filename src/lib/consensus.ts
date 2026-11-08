import "server-only";
import { AI_LANGUAGE, type Locale } from "@/i18n/core";
/**
 * Araştırmalar ne diyor? (D114): bir araştırma sorusuna, akademik veri tabanlarından bulunan GERÇEK makalelerin özetlerine
 * dayanan kısa cevap ve “uzlaşı göstergesi” (çalışmaların ne kadarı aynı yönde). Yalnızca özetler okunur ve bu açıkça yazılır;
 * cevaptaki her bilgi numaralı bir makaleye bağlıdır, makale dışı bilgi ve uydurma kaynak yoktur.
 */
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { providerConfig } from "@/lib/env";
import { enabledProviders } from "@/lib/settings";
import { searchAll } from "@/lib/sources/aggregate";
import type { SourceProviderId, SourceRecord } from "@/lib/sources/types";

export type Stance = "yes" | "possibly" | "mixed" | "no";
export type StudyType = "meta_analysis" | "review" | "experimental" | "observational" | "qualitative" | "other";
export interface ConsensusPaper {
  n: number;
  record: SourceRecord;
  relevant: boolean;
  stance: Stance | null;
  finding: string;
  studyType: StudyType;
}
export interface ConsensusResult {
  question: string;
  answer: string;
  yesNo: boolean;
  meter: { yes: number; possibly: number; mixed: number; no: number; total: number } | null;
  papers: ConsensusPaper[];
  caveats: string[];
  searched: number;
}
type Usage = { input: number; output: number; cacheRead?: number; cacheWrite?: number };

const PLAN_SCHEMA = {
  type: "object", additionalProperties: false, required: ["english_query", "turkish_query", "yes_no"],
  properties: { english_query: { type: "string" }, turkish_query: { type: "string" }, yes_no: { type: "boolean" } },
};
const SYN_SCHEMA = {
  type: "object", additionalProperties: false, required: ["answer", "papers", "caveats"],
  properties: {
    answer: { type: "string" },
    caveats: { type: "array", items: { type: "string" } },
    papers: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["n", "relevant", "stance", "finding", "study_type"],
        properties: {
          n: { type: "integer" }, relevant: { type: "boolean" },
          stance: { type: "string", enum: ["yes", "possibly", "mixed", "no", "none"] },
          finding: { type: "string" },
          study_type: { type: "string", enum: ["meta_analysis", "review", "experimental", "observational", "qualitative", "other"] },
        },
      },
    },
  },
};

const SEARCH_PROVIDERS: SourceProviderId[] = ["openalex", "europepmc", "eric", "crossref", "turkiye", "plos", "hal", "springer", "ieee", "ads"];
const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}]+/gu, " ").trim();

export async function researchConsensus(o: { planId: string; question: string; lang: Locale }): Promise<ConsensusResult & { usage: Usage; cost: number; model: string; provider: string }> {
  const fast = await resolveModel(o.planId, "fast");
  const usage: Usage = { input: 0, output: 0 };
  let cost = 0;
  const track = async (r: { usage: Usage; model: string }) => { usage.input += r.usage.input; usage.output += r.usage.output; cost += await estimateCost(r.model, r.usage.input, r.usage.output, r.usage); };

  // 1) Soru → arama ifadeleri (İngilizce literatür çoğunlukta; Türkçe ifade Türkiye kaynakları için)
  const plan = await complete(fast, {
    system: "Bir araştırma sorusunu akademik veri tabanında aranacak kısa anahtar kelime ifadelerine çevir (3–7 kelime, soru eki ve gereksiz kelime yok). Soru evet/hayır biçiminde bir etki/ilişki sorusuysa yes_no=true. Yalnızca JSON.",
    messages: [{ role: "user", content: o.question }], maxTokens: 200, effort: "low", jsonSchema: PLAN_SCHEMA,
  });
  await track(plan);
  let q = { english_query: o.question, turkish_query: o.question, yes_no: true };
  try { q = { ...q, ...JSON.parse(plan.text) }; } catch { /* soru olduğu gibi aranır */ }

  // 2) Gerçek makaleler (özeti olanlar)
  const enabled = (await enabledProviders()).filter((p) => SEARCH_PROVIDERS.includes(p));
  const cfg = providerConfig();
  const [en, tr] = await Promise.all([
    searchAll({ query: q.english_query, limit: 20 }, enabled.filter((p) => p !== "turkiye"), cfg).catch(() => ({ results: [] as SourceRecord[] })),
    enabled.includes("turkiye") ? searchAll({ query: q.turkish_query, limit: 8, turkishOnly: true }, enabled, cfg).catch(() => ({ results: [] as SourceRecord[] })) : Promise.resolve({ results: [] as SourceRecord[] }),
  ]);
  const seen = new Set<string>();
  const papers = [...en.results, ...tr.results].filter((r) => {
    if (!r.abstract || r.abstract.length < 200) return false;
    const k = r.doi ? `d:${r.doi.toLowerCase()}` : `t:${norm(r.title)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 14);
  if (papers.length < 2) {
    return { question: o.question, answer: "", yesNo: q.yes_no, meter: null, papers: [], caveats: [], searched: en.results.length + tr.results.length, usage, cost, model: fast.model, provider: fast.provider };
  }

  // 3) Özetlerden sentez (her makale numarasıyla)
  const model = await resolveModel(o.planId, "balanced");
  const system = `Sen kanıta dayalı çalışan bir araştırma asistanısın. Aşağıdaki NUMARALI makale özetleri gerçek veri tabanı kayıtlarıdır. Soruya YALNIZCA bu özetlere dayanarak cevap ver.
KURALLAR:
- Özetlerde olmayan hiçbir bilgiyi, sayıyı veya kaynağı yazma. Her iddianın sonuna dayandığı makale numarasını [3] veya [2, 5] biçiminde yaz.
- “answer”: ${AI_LANGUAGE[o.lang]}, 3–5 cümle; ne bulunduğunu, kanıtın gücünü (çalışma türleri, tutarlılık) ve önemli koşulları özetle. Kanıt yetersiz veya çelişkiliyse bunu açıkça söyle.
- Her makale için: relevant (soruyla doğrudan ilgili mi), stance (soru evet/hayır ise: yes = destekliyor, possibly = kısmen/koşullu, mixed = karışık sonuç, no = desteklemiyor; ilgisiz veya evet/hayır sorusu değilse none), finding (özetteki ana bulgu, ${AI_LANGUAGE[o.lang]}, tek cümle, yalnızca özetten), study_type.
- “caveats”: en fazla 3 kısa uyarı (ör. yalnızca özetler okundu, çalışmalar kesitsel, örneklemler küçük). ${AI_LANGUAGE[o.lang]}.`;
  const material = papers.map((p, i) => `[${i + 1}] ${p.title} (${p.year ?? "t.y."}${p.containerTitle ? `, ${p.containerTitle}` : ""})\nÖZET: ${p.abstract!.slice(0, 1300)}`).join("\n\n");
  const syn = await complete(model, { system, messages: [{ role: "user", content: `SORU: ${o.question}\n\nMAKALELER:\n${material}` }], maxTokens: 3500, effort: "low", jsonSchema: SYN_SCHEMA });
  await track(syn);
  let parsed: { answer: string; caveats: string[]; papers: { n: number; relevant: boolean; stance: Stance | "none"; finding: string; study_type: StudyType }[] };
  try { parsed = JSON.parse(syn.text); } catch { throw await spentError("Cevap oluşturulamadı, lütfen tekrar deneyin", { usage, model: syn.model }, model.provider, "consensus"); }

  const byN = new Map(parsed.papers.map((p) => [p.n, p]));
  const out: ConsensusPaper[] = papers.map((record, i) => {
    const p = byN.get(i + 1);
    return { n: i + 1, record, relevant: !!p?.relevant, stance: p && p.stance !== "none" && p.relevant ? p.stance : null, finding: (p?.finding ?? "").slice(0, 400), studyType: p?.study_type ?? "other" };
  });
  // Cevaptaki numaralar yalnızca var olan makaleleri gösterebilir
  const answer = parsed.answer.replace(/\[(\d+(?:\s*,\s*\d+)*)\]/g, (m, g: string) => (g.split(",").every((x) => Number(x) >= 1 && Number(x) <= papers.length) ? m : ""));
  const stances = out.filter((p) => p.stance);
  const meter = q.yes_no && stances.length >= 3 ? {
    yes: stances.filter((p) => p.stance === "yes").length, possibly: stances.filter((p) => p.stance === "possibly").length,
    mixed: stances.filter((p) => p.stance === "mixed").length, no: stances.filter((p) => p.stance === "no").length, total: stances.length,
  } : null;
  // İlgili makaleler önce
  out.sort((a, b) => Number(b.relevant) - Number(a.relevant) || a.n - b.n);
  return { question: o.question, answer, yesNo: q.yes_no, meter, papers: out, caveats: (parsed.caveats ?? []).slice(0, 3), searched: en.results.length + tr.results.length, usage, cost, model: syn.model, provider: model.provider };
}
