import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { isBot, recordTool } from "@/lib/analytics";

/** Tarayıcıda çalışan ücretsiz araçların (örneklem, alfa, anket) kullanım sayacı (D90). Maliyet yok. */
export const POST = route("public.tools.use", async (req) => {
  const b = await parseBody(req, z.object({ tool: z.enum(["sample_size", "alpha", "survey_builder", "convert", "bibliography"]) }));
  if (!isBot(req)) await recordTool(req, b.tool).catch(() => {});
  return json({ ok: true });
});
