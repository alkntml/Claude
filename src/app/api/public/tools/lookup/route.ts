import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { recordTool, toolRateOk } from "@/lib/analytics";
import { getSession } from "@/lib/auth";
import { lookupRecord } from "@/lib/tools/server";
import { mapLimit } from "@/lib/research";

export const maxDuration = 60;

/**
 * Ücretsiz kaynakça oluşturucu ve atıf dönüştürücü için künye bulma (D90). Giriş gerektirmez; yapay zekâ
 * KULLANMAZ: DOI → Crossref/DataCite, başlık → Crossref/OpenAlex (yalnızca güçlü eşleşme).
 */
export const POST = route("public.tools.lookup", async (req) => {
  const b = await parseBody(req, z.object({ items: z.array(z.string().trim().min(3).max(600)).min(1).max(25), tool: z.enum(["bibliography", "convert"]).default("bibliography") }));
  if (!(await toolRateOk(req, b.tool, 60))) throw new ApiError(429, "Çok fazla istek gönderdiniz. Lütfen bir süre sonra tekrar deneyin.", "rate_limited");
  const records = await mapLimit(b.items, 5, (x) => lookupRecord(x).catch(() => null));
  const s = await getSession().catch(() => null);
  await recordTool(req, b.tool, { userId: s?.user.id ?? null, items: b.items.length }).catch(() => {});
  return json({ records });
});
