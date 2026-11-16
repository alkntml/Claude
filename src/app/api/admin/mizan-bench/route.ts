import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { BENCH_PARTS, runMizanBench, type BenchRun } from "@/lib/quality/mizan-bench";
import { adminClient } from "@/lib/supabase/admin";
import { recordUsage } from "@/lib/usage";

export const maxDuration = 300;
const KEY = "quality.mizan_bench";

/** D213: son Mizan doğruluk ölçümünün sonucu */
export const GET = route("admin.mizan_bench", async () => {
  await requireAdmin();
  const { data } = await adminClient().from("app_settings").select("value, updated_at").eq("key", KEY).maybeSingle();
  return json({ last: data?.value ?? null });
});

/** D213: ölçümü canlı iddia denetimi motoruyla çalıştırır; maliyet yöneticinin kullanımına yazılır (toplamlara girmez, D203) */
export const POST = route("admin.mizan_bench", async (req) => {
  const s = await requireAdmin();
  const { part } = await parseBody(req, z.object({ part: z.number().int().min(0).max(BENCH_PARTS - 1).default(0) }));
  const prev = part > 0 ? ((await adminClient().from("app_settings").select("value").eq("key", KEY).maybeSingle()).data?.value as BenchRun | null) ?? null : null;
  if (part > 0 && (prev?.part ?? -1) !== part - 1) return json({ error: "Ölçüm sırası bozuldu; baştan başlatın." }, 409);
  const run = await runMizanBench(s.profile.plan_id, part, prev);
  const { usage, ...result } = run;
  await recordUsage(s.user.id, "ai_request", { quantity: Math.max(1, Math.ceil(run.calls / 2)), usage, costUsd: run.costUsd, provider: run.provider, model: run.model, meta: { action: "mizan_bench" } });
  await adminClient().from("app_settings").upsert({ key: KEY, value: result, updated_by: s.user.id, updated_at: new Date().toISOString() });
  return json({ last: result });
});
