import { ApiError, json, route } from "@/lib/api";
import { assertSingleProject } from "@/lib/single-project";
import { requireProject, requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { getJson } from "@/lib/sources/http";
import { aggregateVenues, enrichVenues, journalQuery } from "@/lib/sources/journals";
import { openAlexUrl } from "@/lib/sources/providers";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;

/** Konuya benzer makalelerin yayımlandığı gerçek dergiler (OpenAlex) + proje kaynaklarının dergileri */
export const GET = route<Ctx>("project.journals", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "journals");
  const { id } = await params;
  const project = await requireProject(s, id);
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || journalQuery(project)).slice(0, 200);
  if (q.trim().length < 3) throw new ApiError(422, "Dergi önerisi için projeye anahtar kelime veya konu ekleyin");
  await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
  await assertSingleProject(s, id);
  const cfg = providerConfig();
  const sig = AbortSignal.timeout(20_000);
  const since = new Date().getFullYear() - 6;
  const [intl, tr] = await Promise.all([
    getJson<{ results?: unknown[] }>(openAlexUrl({ query: q, yearFrom: since, limit: 50 }, cfg, ["type:article"]), { signal: sig }).catch(() => null),
    getJson<{ results?: unknown[] }>(openAlexUrl({ query: q, yearFrom: since, limit: 25 }, cfg, ["type:article", "language:tr"]), { signal: sig }).catch(() => null),
  ]);
  if (!intl && !tr) throw new ApiError(502, "Dergi veri tabanına şu an ulaşılamadı");
  let list = aggregateVenues([...(intl?.results ?? []), ...(tr?.results ?? [])]).slice(0, 15);
  if (list.length) {
    const ids = list.map((j) => j.id).join("|");
    const srcJson = await getJson(`https://api.openalex.org/sources?filter=openalex:${ids}&per-page=25${cfg.contactEmail ? `&mailto=${encodeURIComponent(cfg.contactEmail)}` : ""}`, { signal: sig }).catch(() => null);
    if (srcJson) list = enrichVenues(list, srcJson);
  }
  // Projedeki kaynakların yayımlandığı dergiler (atıf verdiğiniz dergiler çoğu zaman iyi adaydır)
  const { data: rows } = await s.supabase.from("sources").select("container_title").eq("project_id", id).eq("user_id", s.user.id).eq("type", "article-journal");
  const own = new Map<string, number>();
  for (const r of rows ?? []) if (r.container_title) own.set(r.container_title, (own.get(r.container_title) ?? 0) + 1);
  list = list.map((j) => ({ ...j, fromProjectSources: [...own.entries()].find(([n]) => n.toLowerCase() === j.name.toLowerCase())?.[1] ?? 0 }));
  await recordUsage(s.user.id, "source_search", { meta: { kind: "journals", query: q } });
  return json({ query: q, journals: list, ownVenues: [...own.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count })) });
});
