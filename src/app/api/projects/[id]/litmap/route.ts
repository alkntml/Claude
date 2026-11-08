import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { buildLiteratureMap } from "@/lib/litmap";
import { simpleHash } from "@/lib/litmap-graph";
import { projectAccess } from "@/lib/project-access";
import { assertFeature, assertWithinLimits, recordUsage } from "@/lib/usage";

type Ctx = { params: Promise<{ id: string }> };
export const maxDuration = 60;
const TTL_MS = 24 * 3600_000;

/** Literatür haritası (D123). Sonuç 24 saat çalışmada saklanır; kaynak listesi değişince veya “Yenile” ile yeniden kurulur. */
export const POST = route<Ctx>("project.litmap", async (req, { params }) => {
  const s = await requireUser();
  assertFeature(s.profile.plan_id, "litmap");
  const { id } = await params;
  const acc = await projectAccess(s, id, "edit");
  const { refresh } = await parseBody(req, z.object({ refresh: z.boolean().default(false) }));
  const { data: sources } = await acc.db.from("sources").select("id, doi, openalex_id").eq("project_id", id).eq("user_id", acc.ownerId);
  const list = sources ?? [];
  // İmza: kaynak kümesi (kimlik + DOI) ve veri sürümü; kaynak eklenip çıkınca veya yöntem değişince yeniden kurulur
  const sig = "v2:" + list.length + ":" + simpleHash(list.map((x) => `${x.id}:${x.doi ?? ""}:${x.openalex_id ?? ""}`).sort().join(","));
  const cached = acc.project.context?.litmap as { at: number; sig: string; data: { version?: number } } | undefined;
  if (!refresh && cached && cached.sig === sig && cached.data?.version === 2 && Date.now() - cached.at < TTL_MS) return json({ ...(cached.data as object), cachedAt: cached.at });
  await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
  const data = await buildLiteratureMap(list, providerConfig().contactEmail);
  await recordUsage(s.user.id, "source_search", { meta: { kind: "litmap", projectId: id, mapped: data.mapped } });
  const ctx = { ...(acc.project.context ?? {}), litmap: { at: Date.now(), sig, data } };
  await acc.db.from("projects").update({ context: ctx }).eq("id", id).eq("user_id", acc.ownerId);
  return json({ ...data, cachedAt: Date.now() });
});
