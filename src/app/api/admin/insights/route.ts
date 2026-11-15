import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { costByFeature, lastDays, TOOL_LABEL, trafficSummary, type CostRow, type PageRow } from "@/lib/insights";
import { adminClient } from "@/lib/supabase/admin";

/** API satır sınırına (1000) takılmadan tüm satırları sayfalı okur */
async function allRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error?: unknown }>, max = 200000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < max; from += 1000) {
    const { data, error } = await fetchPage(from, from + 999);
    if (error) break;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}

/**
 * Yönetim → Genel bakış ve Ziyaretçiler (D90): özellik/araç bazında API maliyeti, ziyaret, kayıt ve dönüşüm.
 * Ölçüm tabloları henüz kurulmadıysa (migration 21) ilgili kısımlar boş döner.
 */
export const GET = route("admin.insights", async (req) => {
  await requireAdmin();
  const db = adminClient();
  const n = Math.min(90, Math.max(7, Number(new URL(req.url).searchParams.get("days") ?? 30)));
  const days = lastDays(n);
  const since = `${days[0]}T00:00:00Z`;
  const [costRowsAll, toolRows, pageRows, signups, paid, adminRows] = await Promise.all([
    allRows<CostRow & { created_at: string; user_id: string | null }>((a, b) => db.from("usage_events").select("cost_usd, tokens_in, tokens_out, meta, created_at, user_id").gte("created_at", since).gt("cost_usd", 0).order("id").range(a, b)),
    allRows<{ tool: string; items: number; cost_usd: number; created_at: string; visitor: string | null; user_id: string | null }>((a, b) => db.from("tool_usage").select("tool, items, cost_usd, created_at, visitor, user_id").gte("created_at", since).order("id").range(a, b)),
    allRows<PageRow>((a, b) => db.from("analytics_events").select("path, visitor, referrer, utm_source, device, created_at").eq("kind", "pageview").gte("created_at", since).order("id").range(a, b)),
    allRows<{ created_at: string; plan_id: string }>((a, b) => db.from("profiles").select("created_at, plan_id").gte("created_at", since).order("id").range(a, b)),
    db.from("profiles").select("id", { count: "exact", head: true }).neq("plan_id", "free").neq("role", "admin"),
    db.from("profiles").select("id").eq("role", "admin"),
  ]);
  // D203: yöneticinin kendi kullanımı toplam maliyete katılmaz; çizelgede ayrı seri olarak gösterilir
  const adminIds = new Set((adminRows.data ?? []).map((r: { id: string }) => r.id));
  const isAdm = (uid: string | null | undefined) => !!uid && adminIds.has(uid);

  // Özellik + ücretsiz araç maliyeti (günlük ve toplam)
  const costRows = costRowsAll.filter((r) => !isAdm(r.user_id));
  const features = costByFeature(costRows);
  const toolAgg = new Map<string, { uses: number; items: number; cost: number }>();
  const costDay = new Map(days.map((d) => [d, { features: 0, tools: 0, admin: 0 }]));
  for (const r of costRowsAll) { const d = costDay.get(r.created_at.slice(0, 10)); if (d) { if (isAdm(r.user_id)) d.admin += Number(r.cost_usd) || 0; else d.features += Number(r.cost_usd) || 0; } }
  let adminTotal = costRowsAll.filter((r) => isAdm(r.user_id)).reduce((a, r) => a + (Number(r.cost_usd) || 0), 0);
  for (const r of toolRows) {
    if (isAdm(r.user_id)) { adminTotal += Number(r.cost_usd) || 0; const d = costDay.get(r.created_at.slice(0, 10)); if (d) d.admin += Number(r.cost_usd) || 0; continue; }
    const t = toolAgg.get(r.tool) ?? { uses: 0, items: 0, cost: 0 };
    t.uses++; t.items += r.items ?? 1; t.cost += Number(r.cost_usd) || 0;
    toolAgg.set(r.tool, t);
    const d = costDay.get(r.created_at.slice(0, 10)); if (d) d.tools += Number(r.cost_usd) || 0;
  }
  const tools = [...toolAgg.entries()].map(([id, v]) => ({ id, label: TOOL_LABEL[id] ?? id, uses: v.uses, items: v.items, cost: Math.round(v.cost * 10000) / 10000 })).sort((a, b) => b.uses - a.uses);

  // Ziyaret ve dönüşüm
  const traffic = trafficSummary(pageRows, days);
  const signupDay = new Map(days.map((d) => [d, 0]));
  for (const s of signups) { const k = s.created_at.slice(0, 10); if (signupDay.has(k)) signupDay.set(k, (signupDay.get(k) ?? 0) + 1); }
  const toolUsers = new Set(toolRows.map((r) => `${r.created_at.slice(0, 10)}|${r.visitor}`)).size;

  return json({
    days: n,
    cost: {
      total: Math.round((features.reduce((a, f) => a + f.value, 0) + tools.reduce((a, t) => a + t.cost, 0)) * 10000) / 10000,
      features,
      tools,
      admin: Math.round(adminTotal * 10000) / 10000,
      byDay: [...costDay.entries()].map(([day, v]) => ({ day, features: Math.round(v.features * 1000) / 1000, tools: Math.round(v.tools * 1000) / 1000, admin: Math.round(v.admin * 1000) / 1000 })),
    },
    traffic: {
      ...traffic,
      byDay: traffic.byDay.map((d) => ({ ...d, signups: signupDay.get(d.day) ?? 0 })),
      signups: signups.length,
      paidSignups: signups.filter((s) => s.plan_id !== "free").length,
      paidTotal: paid.count ?? 0,
      toolUsers,
      conversion: traffic.visitors ? Math.round((signups.length / traffic.visitors) * 1000) / 10 : null,
    },
  });
});
