import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import type { SourceProviderId } from "@/lib/sources/types";

export interface ModelRef {
  provider: "anthropic" | "openai";
  model: string;
}

export interface AiModelsSetting {
  default: ModelRef;
  balanced?: ModelRef;
  fast: ModelRef;
  premium: ModelRef;
  pricing_per_mtok: Record<string, { in: number; out: number }>;
  max_output_tokens: number;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
}

export const DEFAULTS = {
  "ai.models": {
    default: { provider: "anthropic", model: "claude-opus-5-5" },
    balanced: { provider: "anthropic", model: "claude-sonnet-5-5" },
    fast: { provider: "anthropic", model: "claude-haiku-5-5" },
    premium: { provider: "anthropic", model: "claude-opus-5-5" },
    pricing_per_mtok: { "claude-haiku-5-5": { in: 0.1, out: 0.5 }, "claude-sonnet-5-5": { in: 2, out: 10 }, "claude-opus-5-5": { in: 4, out: 20 } },
    max_output_tokens: 16000,
    effort: "medium",
  } as AiModelsSetting,
  "ai.system_prompt": { text: "Sen titiz ve dürüst bir akademik danışmansın. Asla kaynak, veri veya bulgu uydurma. Yalnızca KAYNAKLAR listesindeki eserlere atıf yap; listede olmayan hiçbir yazar veya eser adını notlarda bile anma, bunun yerine Literatür araştır özelliğini öner." },
  "ai.stage_prompts": {} as Record<string, string>,
  "sources.enabled": { openalex: true, crossref: true, europepmc: true, arxiv: true, doaj: true, core: false, openaire: true, google_books: false, unpaywall: true, turkiye: true, eric: true, dblp: true, datacite: true } as Record<SourceProviderId, boolean>,
  "limits.rate": { ai_per_minute: 12, search_per_minute: 30 },
  /** Davet programı: davet edilen e-postasını doğrulayınca her iki tarafa kredi */
  /** Kârlılık (D52): API maliyeti KDV hariç gelirin en fazla cost_share’i; dolar kuru güncel tutulmalı */
  "billing.margin": { usd_try: 48, vat_rate: 0.2, cost_share: 0.3333, avg_request_usd: 0.09 },
  "referral": { enabled: true, ai_requests: 50, source_searches: 50, valid_days: 60, monthly_cap: 20 },
  /** Site iletişim ve dış hizmetler */
  "site.contact": { email: "" },
};

type Key = keyof typeof DEFAULTS;
const cache = new Map<string, { at: number; value: unknown }>();
const TTL = 30_000;

/** Yönetici panelinden değiştirilebilen ayarlar (30 sn önbellekli). */
export async function getSetting<K extends Key>(key: K): Promise<(typeof DEFAULTS)[K]> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as (typeof DEFAULTS)[K];
  let value: unknown = DEFAULTS[key];
  try {
    const { data } = await adminClient().from("app_settings").select("value").eq("key", key).maybeSingle();
    if (data?.value) value = typeof DEFAULTS[key] === "object" ? { ...DEFAULTS[key], ...(data.value as object) } : data.value;
  } catch {
    // Service role yoksa varsayılanlar kullanılır.
  }
  cache.set(key, { at: Date.now(), value });
  return value as (typeof DEFAULTS)[K];
}

export function invalidateSettings() {
  cache.clear();
}

export async function enabledProviders(): Promise<SourceProviderId[]> {
  const s = await getSetting("sources.enabled");
  return (Object.entries(s) as [SourceProviderId, boolean][]).filter(([, v]) => v).map(([k]) => k);
}
