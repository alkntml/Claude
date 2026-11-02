import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { integrationStatus } from "@/lib/env";
import { availableProviders } from "@/lib/payments";
import { adminClient } from "@/lib/supabase/admin";

export const GET = route("admin.stats", async (req) => {
  await requireAdmin();
  const db = adminClient();
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 30)));
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const [users, newUsers, projects, events, errors, openFeedback, plans] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("projects").select("id", { count: "exact", head: true }),
    db.from("usage_events").select("kind, quantity, tokens_in, tokens_out, cost_usd, model, created_at, meta").gte("created_at", since).limit(50000),
    db.from("error_logs").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("feedback").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("profiles").select("plan_id").limit(100000),
  ]);

  const byDay: Record<string, { ai: number; search: number; cost: number; tokens: number }> = {};
  const byModel: Record<string, { requests: number; tokens: number; cost: number }> = {};
  const providerHealth: Record<string, { ok: number; fail: number }> = {};
  const totals = { ai: 0, search: 0, exports: 0, uploads: 0, tokens: 0, cost: 0 };
  for (const e of events.data ?? []) {
    const day = e.created_at.slice(0, 10);
    byDay[day] ??= { ai: 0, search: 0, cost: 0, tokens: 0 };
    if (e.kind === "ai_request") { totals.ai += e.quantity; byDay[day].ai += e.quantity; }
    // Model maliyeti: kullanıcı hakkından düşmeyen yapay zekâ işlemleri (ör. bölüm kontrolü) dahil
    if (e.kind === "ai_request" || (e.model && (Number(e.cost_usd) > 0 || e.tokens_in + e.tokens_out > 0))) {
      totals.tokens += e.tokens_in + e.tokens_out; totals.cost += Number(e.cost_usd);
      byDay[day].tokens += e.tokens_in + e.tokens_out; byDay[day].cost += Number(e.cost_usd);
      const m = e.model ?? "?";
      byModel[m] ??= { requests: 0, tokens: 0, cost: 0 };
      byModel[m].requests++; byModel[m].tokens += e.tokens_in + e.tokens_out; byModel[m].cost += Number(e.cost_usd);
    }
    if (e.kind === "source_search") {
      totals.search += e.quantity; byDay[day].search += e.quantity;
      for (const p of ((e.meta as { providers?: { p: string; ok: boolean }[] })?.providers ?? [])) {
        providerHealth[p.p] ??= { ok: 0, fail: 0 };
        if (p.ok) providerHealth[p.p].ok++; else providerHealth[p.p].fail++;
      }
    }
    if (e.kind === "export") totals.exports += e.quantity;
    if (e.kind === "upload") totals.uploads += e.quantity;
  }
  const planDist: Record<string, number> = {};
  for (const p of plans.data ?? []) planDist[p.plan_id] = (planDist[p.plan_id] ?? 0) + 1;

  return json({
    days,
    users: users.count ?? 0,
    newUsers: newUsers.count ?? 0,
    projects: projects.count ?? 0,
    errors: errors.count ?? 0,
    openFeedback: openFeedback.count ?? 0,
    totals: { ...totals, cost: Math.round(totals.cost * 100) / 100 },
    byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([day, v]) => ({ day, ...v, cost: Math.round(v.cost * 1000) / 1000 })),
    byModel,
    providerHealth,
    planDist,
    integrations: integrationStatus(),
    payments: availableProviders(),
  });
});
