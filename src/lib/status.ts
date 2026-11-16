import "server-only";
/**
 * Sistem durumu (D213): herkese açık, kişisel veri içermeyen anlık kontroller. Sonuç 60 sn önbelleklenir; dış servis
 * kontrolleri 4 sn zaman aşımıyla yapılır. Yapay zekâ sağlayıcısının durumu Anthropic’in kendi durum sayfasından okunur.
 */
import { env } from "@/lib/env";
import { adminClient } from "@/lib/supabase/admin";

export type StatusLevel = "ok" | "degraded" | "down" | "unknown";
export interface StatusItem { id: string; level: StatusLevel; ms: number | null }
export interface StatusReport { at: string; overall: StatusLevel; items: StatusItem[] }

async function timed(fn: () => Promise<boolean>, slowMs: number): Promise<{ level: StatusLevel; ms: number | null }> {
  const t0 = Date.now();
  try {
    const ok = await Promise.race([fn(), new Promise<boolean>((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000))]);
    const ms = Date.now() - t0;
    return { level: ok ? (ms > slowMs ? "degraded" : "ok") : "down", ms };
  } catch {
    return { level: "down", ms: null };
  }
}
const probe = (url: string) => async () => (await fetch(url, { headers: { "user-agent": "Academiana-status/1.0" }, cache: "no-store" })).ok;

let cached: { at: number; report: StatusReport } | null = null;

export async function systemStatus(): Promise<StatusReport> {
  if (cached && Date.now() - cached.at < 60_000) return cached.report;
  const [db, ai, crossref, epmc, arxiv] = await Promise.all([
    timed(async () => { const { error } = await adminClient().from("app_settings").select("key").eq("key", "site.contact").limit(1); return !error; }, 1500),
    (async (): Promise<{ level: StatusLevel; ms: number | null }> => {
      if (!env.anthropicKey) return { level: "down", ms: null };
      try {
        const r = await Promise.race([fetch("https://status.anthropic.com/api/v2/status.json", { cache: "no-store" }), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000))]);
        const ind = (await r.json())?.status?.indicator as string | undefined;
        return { level: ind === "none" ? "ok" : ind === "minor" ? "degraded" : ind === "major" || ind === "critical" ? "down" : "unknown", ms: null };
      } catch { return { level: "unknown", ms: null }; }
    })(),
    timed(probe("https://api.crossref.org/works?rows=0"), 2500),
    timed(probe("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=test&pageSize=1&format=json"), 2500),
    timed(probe("https://export.arxiv.org/api/query?search_query=all:test&max_results=1"), 2500),
  ]);
  const items: StatusItem[] = [
    { id: "app", level: "ok", ms: null },
    { id: "db", ...db },
    { id: "ai", ...ai },
    { id: "crossref", ...crossref },
    { id: "europepmc", ...epmc },
    { id: "arxiv", ...arxiv },
  ];
  // Genel durum: uygulama, veritabanı ve yapay zekâ esas alınır; tek bir veri tabanının yavaşlığı “kısmi” sayılır
  const core = items.filter((i) => ["app", "db", "ai"].includes(i.id));
  const overall: StatusLevel = core.some((i) => i.level === "down") ? "down" : items.some((i) => i.level === "down" || i.level === "degraded") ? "degraded" : "ok";
  const report = { at: new Date().toISOString(), overall, items };
  cached = { at: Date.now(), report };
  return report;
}
