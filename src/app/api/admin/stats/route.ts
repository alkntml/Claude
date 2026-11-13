import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { integrationStatus } from "@/lib/env";
import { availableProviders } from "@/lib/payments";
import { adminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/settings";
import { monthStart } from "@/lib/usage";
import { costHealth, lastDays, monthProjection, type CostEvent } from "@/lib/insights";

/** API satır sınırına (1000) takılmadan tüm satırları sayfalı okur */
async function allRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null }>, max = 200000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < max; from += 1000) {
    const { data } = await fetchPage(from, from + 999);
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export const GET = route("admin.stats", async (req) => {
  await requireAdmin();
  const db = adminClient();
  const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days") ?? 30)));
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const now = new Date().toISOString();
  const week = new Date(Date.now() + 7 * 86400_000).toISOString();
  const [users, newUsers, projects, events, errors, openFeedback, plans, paid, priceRows, margin, monthCost, expiring, lockedCount] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("projects").select("id", { count: "exact", head: true }),
    allRows((a, b) => db.from("usage_events").select("kind, quantity, tokens_in, tokens_out, cost_usd, model, created_at, meta").gte("created_at", since).order("id").range(a, b)),
    db.from("error_logs").select("id", { count: "exact", head: true }).gte("created_at", since),
    db.from("feedback").select("id", { count: "exact", head: true }).eq("status", "open"),
    allRows<{ plan_id: string }>((a, b) => db.from("profiles").select("plan_id").order("id").range(a, b)),
    // Gelir (D52/D53): süresi geçerli ücretli kullanıcılar
    allRows<{ plan_id: string; plan_expires_at: string | null }>((a, b) => db.from("profiles").select("plan_id, plan_expires_at").neq("plan_id", "free").neq("role", "admin").order("id").range(a, b)),
    db.from("plans").select("id, price_monthly"),
    getSetting("billing.margin"),
    allRows<{ cost_usd: number; user_id: string }>((a, b) => db.from("usage_events").select("cost_usd, user_id").gte("created_at", monthStart()).gt("cost_usd", 0).order("id").range(a, b)),
    db.from("profiles").select("id, email, full_name, plan_id, plan_expires_at").neq("plan_id", "free").gte("plan_expires_at", now).lte("plan_expires_at", week).order("plan_expires_at").limit(20),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("work_locked", true),
  ]);
  // Ücretsiz araçların yapay zekâ maliyeti (D90) de gerçek harcamadır: toplamlara ve kâr hesabına katılır (D94).
  // Tablo henüz kurulmadıysa (migration 21) boş kabul edilir.
  const [toolRows, toolMonth, models, fxRow] = await Promise.all([
    allRows<{ cost_usd: number; tokens_in: number; tokens_out: number; model: string | null; created_at: string }>((a, b) => db.from("tool_usage").select("cost_usd, tokens_in, tokens_out, model, created_at").gte("created_at", since).gt("cost_usd", 0).order("id").range(a, b)),
    allRows<{ cost_usd: number }>((a, b) => db.from("tool_usage").select("cost_usd").gte("created_at", monthStart()).gt("cost_usd", 0).order("id").range(a, b)),
    getSetting("ai.models"),
    // Kur hatırlatıcısı (D96): bütçe ve sayfa vaadi kura bağlı; ayar 30 günden eskiyse uyarı
    db.from("app_settings").select("updated_at").eq("key", "billing.margin").maybeSingle(),
  ]);
  const fxUpdatedAt = (fxRow.data?.updated_at as string | undefined) ?? null;
  const fxAgeDays = fxUpdatedAt ? Math.floor((Date.now() - new Date(fxUpdatedAt).getTime()) / 86400_000) : null;

  const byDay: Record<string, { ai: number; search: number; cost: number; tokens: number }> = {};
  const byModel: Record<string, { requests: number; tokens: number; cost: number }> = {};
  const providerHealth: Record<string, { ok: number; fail: number; lastError?: string }> = {};
  const totals = { ai: 0, search: 0, exports: 0, uploads: 0, tokens: 0, cost: 0 };
  for (const e of events) {
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
      for (const p of ((e.meta as { providers?: { p: string; ok: boolean; e?: string }[] })?.providers ?? [])) {
        providerHealth[p.p] ??= { ok: 0, fail: 0 };
        if (p.ok) providerHealth[p.p].ok++; else { providerHealth[p.p].fail++; if (p.e) providerHealth[p.p].lastError = p.e; }
      }
    }
    if (e.kind === "export") totals.exports += e.quantity;
    if (e.kind === "upload") totals.uploads += e.quantity;
  }
  for (const t of toolRows) {
    const day = t.created_at.slice(0, 10);
    byDay[day] ??= { ai: 0, search: 0, cost: 0, tokens: 0 };
    const c = Number(t.cost_usd) || 0, tk = (t.tokens_in ?? 0) + (t.tokens_out ?? 0);
    totals.cost += c; totals.tokens += tk; byDay[day].cost += c; byDay[day].tokens += tk;
    const m = t.model ?? "?";
    byModel[m] ??= { requests: 0, tokens: 0, cost: 0 };
    byModel[m].requests++; byModel[m].tokens += tk; byModel[m].cost += c;
  }
  const health = costHealth(events as unknown as CostEvent[], models.pricing_per_mtok ?? {});
  // Bu ay: toplam, ay sonu tahmini, en çok maliyet oluşturan kullanıcılar
  const monthUsd = monthCost.reduce((a, r) => a + Number(r.cost_usd), 0) + toolMonth.reduce((a, r) => a + Number(r.cost_usd), 0);
  const perUser = new Map<string, number>();
  for (const r of monthCost) perUser.set(r.user_id, (perUser.get(r.user_id) ?? 0) + Number(r.cost_usd));
  const top = [...perUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const { data: topProfiles } = top.length ? await db.from("profiles").select("id, email, full_name, plan_id").in("id", top.map(([id]) => id)) : { data: [] as { id: string; email: string; full_name: string | null; plan_id: string }[] };
  const prof = new Map((topProfiles ?? []).map((p) => [p.id, p]));
  const planDist: Record<string, number> = {};
  for (const p of plans) planDist[p.plan_id] = (planDist[p.plan_id] ?? 0) + 1;
  // Aylık gelir (KDV hariç, TL) ve bu ayki API maliyeti → kâr
  const price = Object.fromEntries((priceRows.data ?? []).map((p) => [p.id, Number(p.price_monthly)]));
  const activePaid = paid.filter((p) => !p.plan_expires_at || p.plan_expires_at > now);
  // Tek ödemeli paket (D103) aylık gelire eklenmez; ödeme alındığı ay elle değerlendirilir
  const revenueTry = Math.round(activePaid.reduce((a, p) => a + (price[p.plan_id] ?? 0), 0) / (1 + margin.vat_rate));
  const costTry = Math.round(monthUsd * margin.usd_try);

  return json({
    days,
    users: users.count ?? 0,
    newUsers: newUsers.count ?? 0,
    projects: projects.count ?? 0,
    errors: errors.count ?? 0,
    openFeedback: openFeedback.count ?? 0,
    totals: { ...totals, cost: Math.round(totals.cost * 100) / 100 },
    // Boş günler de sıfırla gösterilir (grafikte boşluk sıkışmasın)
    byDay: lastDays(days).map((day) => { const v = byDay[day] ?? { ai: 0, search: 0, cost: 0, tokens: 0 }; return { day, ...v, cost: Math.round(v.cost * 1000) / 1000 }; }),
    byModel,
    costHealth: {
      ...health,
      toolCost: Math.round(toolRows.reduce((a, t) => a + Number(t.cost_usd), 0) * 10000) / 10000,
      assumedAvgRequestUsd: margin.avg_request_usd,
      fx: { usdTry: margin.usd_try, updatedAt: fxUpdatedAt, ageDays: fxAgeDays, stale: fxAgeDays == null || fxAgeDays > 30 },
      monthUsd: Math.round(monthUsd * 100) / 100,
      monthProjectionUsd: monthProjection(monthUsd),
      topUsers: top.map(([id, cost]) => ({ id, cost: Math.round(cost * 1000) / 1000, name: prof.get(id)?.full_name || prof.get(id)?.email || id.slice(0, 8), plan: prof.get(id)?.plan_id ?? "?" })),
    },
    providerHealth,
    planDist,
    money: { paidUsers: activePaid.length, revenueTry, costTry, profitTry: revenueTry - costTry, costShare: revenueTry ? Math.round((costTry / revenueTry) * 100) : null, usdTry: margin.usd_try },
    expiring: expiring.data ?? [],
    locked: lockedCount.count ?? 0,
    integrations: integrationStatus(),
    payments: availableProviders(),
  });
});
