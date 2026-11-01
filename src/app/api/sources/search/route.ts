import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { providerConfig } from "@/lib/env";
import { enabledProviders } from "@/lib/settings";
import { searchAll } from "@/lib/sources/aggregate";
import { assertWithinLimits, recordUsage } from "@/lib/usage";

const Schema = z.object({
  query: z.string().trim().min(2).max(500),
  yearFrom: z.number().int().min(1500).max(2100).optional(),
  yearTo: z.number().int().min(1500).max(2100).optional(),
  author: z.string().max(200).optional(),
  openAccessOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(50).default(15),
  providers: z.array(z.string()).max(12).optional(),
  turkishOnly: z.boolean().optional(),
});

export const POST = route("sources.search", async (req) => {
  const s = await requireUser();
  const q = await parseBody(req, Schema);
  await assertWithinLimits(s.user.id, s.profile.plan_id, "source_search");
  const enabled = await enabledProviders();
  const res = await searchAll(q as Parameters<typeof searchAll>[0], enabled, providerConfig());
  await recordUsage(s.user.id, "source_search", { meta: { query: q.query, providers: res.providers.map((p) => ({ p: p.provider, ok: p.ok, n: p.count })) } });
  return json(res);
});
