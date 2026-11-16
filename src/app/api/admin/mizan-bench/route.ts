import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { runMizanBench } from "@/lib/quality/mizan-bench";
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
export const POST = route("admin.mizan_bench", async () => {
  const s = await requireAdmin();
  const run = await runMizanBench(s.profile.plan_id);
  const { usage, ...result } = run;
  await recordUsage(s.user.id, "ai_request", { quantity: Math.max(1, Math.ceil(run.calls / 2)), usage, costUsd: run.costUsd, provider: run.provider, model: run.model, meta: { action: "mizan_bench" } });
  await adminClient().from("app_settings").upsert({ key: KEY, value: result, updated_by: s.user.id, updated_at: new Date().toISOString() });
  return json({ last: result });
});
