import "server-only";
import { complete, estimateCost, resolveModel } from "@/lib/ai/registry";
import { spentError } from "@/lib/ai/spent";
import { providerConfig } from "@/lib/env";
import { getJson } from "@/lib/sources/http";
import { mergeSubtopics, parseGroupTopics, parseGroupYears, parseWorks, trendOf, type TopicExploration } from "./topics";

/* eslint-disable @typescript-eslint/no-explicit-any */
function url(params: Record<string, string>) {
  const cfg = providerConfig();
  const p = new URLSearchParams(params);
  if (cfg.contactEmail) p.set("mailto", cfg.contactEmail);
  if (cfg.openalexKey) p.set("api_key", cfg.openalexKey);
  return `https://api.openalex.org/works?${p}`;
}

/** OpenAlex'ten konu istatistikleri (paralel 6 istek, 12 sn sınır) */
export async function exploreTopic(query: string): Promise<TopicExploration> {
  const signal = AbortSignal.timeout(12_000);
  const now = new Date().getUTCFullYear();
  const lastFull = now - 1;
  const from = now - 12;
  const q = query.trim();
  const [yearsJ, recentJ, earlierJ, trJ, trLangJ, topJ] = await Promise.all([
    getJson<any>(url({ search: q, group_by: "publication_year", filter: `from_publication_date:${from}-01-01` }), { signal }),
    getJson<any>(url({ search: q, group_by: "topics.id", filter: `from_publication_date:${lastFull - 2}-01-01,to_publication_date:${lastFull}-12-31` }), { signal }),
    getJson<any>(url({ search: q, group_by: "topics.id", filter: `from_publication_date:${lastFull - 5}-01-01,to_publication_date:${lastFull - 3}-12-31` }), { signal }),
    getJson<any>(url({ search: q, filter: `institutions.country_code:tr,from_publication_date:${from}-01-01`, "per-page": "1", select: "id" }), { signal }).catch(() => null),
    getJson<any>(url({ search: q, filter: `language:tr,from_publication_date:${from}-01-01`, "per-page": "1", select: "id" }), { signal }).catch(() => null),
    getJson<any>(url({ search: q, filter: `from_publication_date:${now - 5}-01-01`, sort: "cited_by_count:desc", "per-page": "10", select: "display_name,publication_year,cited_by_count,doi,primary_location" }), { signal }).catch(() => null),
  ]);
  const years = parseGroupYears(yearsJ, from, now);
  const total = Number(yearsJ?.meta?.count) || years.reduce((a, y) => a + y.count, 0);
  const trTotal = Number(trJ?.meta?.count) || 0;
  const trLang = Number(trLangJ?.meta?.count) || 0;
  return {
    query: q,
    total,
    years,
    trend: trendOf(years, lastFull),
    subtopics: mergeSubtopics(parseGroupTopics(recentJ), parseGroupTopics(earlierJ)).slice(0, 15),
    turkey: { total: trTotal, turkish: trLang, share: total ? trTotal / total : null },
    topWorks: parseWorks(topJ),
  };
}

export interface TopicIdea { title: string; question: string; rationale: string; method: string; scope: string }

const SCHEMA = {
  type: "object", additionalProperties: false, required: ["ideas"],
  properties: { ideas: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "question", "rationale", "method", "scope"], properties: { title: { type: "string" }, question: { type: "string" }, rationale: { type: "string" }, method: { type: "string" }, scope: { type: "string" } } } } },
};

/** Verilere dayalı tez konusu önerileri; gerekçeler yalnızca verilen sayılara ve başlıklara dayanır */
export async function suggestTopics(params: { planId: string; data: TopicExploration; level: string; discipline: string; language: "tr" | "en" | "de" }) {
  const d = params.data;
  const facts = [
    `Arama: "${d.query}" · Toplam kayıt (son 12 yıl): ${d.total}`,
    `Yıllık yayın: ${d.years.map((y) => `${y.year}: ${y.count}`).join(", ")}`,
    `Son 3 tam yıl: ${d.trend.recent3}, önceki 3 yıl: ${d.trend.prev3}${d.trend.change !== null ? ` (değişim %${Math.round(d.trend.change * 100)})` : ""}`,
    `Türkiye adresli yayın: ${d.turkey.total}; Türkçe yayın: ${d.turkey.turkish}`,
    `Alt konular (son 3 yıl / önceki 3 yıl): ${d.subtopics.map((s) => `${s.name} (${s.recent}/${s.earlier})`).join("; ")}`,
    `Son 5 yılın çok atıf alan çalışmalarının başlıkları: ${d.topWorks.map((w) => `${w.title} (${w.year ?? "?"})`).join(" | ")}`,
  ].join("\n");
  const model = await resolveModel(params.planId, "balanced");
  const res = await complete(model, {
    system: `Akademik danışmansın; öğrenciye tez konusu öneriyorsun. Dil: ${params.language === "en" ? "English" : params.language === "de" ? "Deutsch" : "Türkçe"}.
KURALLAR:
- Yalnızca verilen VERİLERE dayan. Gerekçede yalnızca verilerdeki sayıları ve alt konu adlarını kullan; yeni sayı, istatistik, yazar, kaynak veya makale adı UYDURMA.
- 5 öneri ver. Her biri: "title" (tez başlığı taslağı), "question" (ana araştırma sorusu), "rationale" (verilere dayalı gerekçe: ör. hangi alt konu yükseliyor, Türkiye'de ne kadar çalışılmış), "method" (uygun yöntem önerisi), "scope" (örneklem/bağlam ve uygulanabilirlik notu).
- Öneriler ${params.level || "yüksek lisans"} düzeyine ve ${params.discipline || "kullanıcının"} alanına uygun, yönetilebilir kapsamda olsun.
- Verinin sınırlılığını unutma: arama sonuçları anahtar kelimeye bağlıdır; boşluk iddiasını kesin değil "veriler … düşündürüyor" biçiminde ifade et.`,
    messages: [{ role: "user", content: `VERİLER (OpenAlex):\n${facts}` }],
    maxTokens: 3000,
    effort: "low",
    jsonSchema: SCHEMA,
  });
  let ideas: TopicIdea[] = [];
  try { ideas = (JSON.parse(res.text).ideas ?? []).slice(0, 6); } catch { throw await spentError("Öneriler oluşturulamadı, lütfen tekrar deneyin", res, model.provider, "topic_ideas"); }
  const cost = await estimateCost(res.model, res.usage.input, res.usage.output, res.usage);
  return { ideas, usage: res.usage, model: res.model, provider: model.provider, cost };
}
/* eslint-enable @typescript-eslint/no-explicit-any */
