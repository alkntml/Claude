import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { activationFunnel, aiReliability } from "@/lib/insights";
import { adminClient } from "@/lib/supabase/admin";

/* eslint-disable @typescript-eslint/no-explicit-any */
async function allRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error?: unknown }>, max = 100000): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < max; from += 1000) {
    const { data, error } = await fetchPage(from, from + 999);
    if (error) break;
    out.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return out;
}
async function inChunks<T>(ids: string[], fn: (chunk: string[]) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += 200) out.push(...(((await fn(ids.slice(i, i + 200))).data) ?? []));
  return out;
}

/**
 * Yönetim → Genel bakış: ürün analitiği (D125). Aktivasyon hunisi (dönemde kaydolanlar) ve yapay zekâ güvenilirliği
 * (çağrı süresi, hata oranı). Yeni özelliklerin benimsenmesi kullanım kayıtlarındaki eylem adlarından sayılır.
 */
export const GET = route("admin.product", async (req) => {
  await requireAdmin();
  const db = adminClient();
  const n = Math.min(90, Math.max(7, Number(new URL(req.url).searchParams.get("days") ?? 30)));
  const since = new Date(Date.now() - n * 86400_000).toISOString();
  const users = (await allRows<{ id: string }>((a, b) => db.from("profiles").select("id").gte("created_at", since).neq("role", "admin").order("id").range(a, b))).map((u) => u.id);
  const [projects, stages, events, calls, adoption] = await Promise.all([
    inChunks<{ user_id: string }>(users, (c) => db.from("projects").select("user_id").in("user_id", c)),
    inChunks<{ user_id: string; word_count: number }>(users, (c) => db.from("project_stages").select("user_id, word_count").in("user_id", c).gt("word_count", 0)),
    inChunks<{ user_id: string; kind: string; created_at: string }>(users, (c) => db.from("usage_events").select("user_id, kind, created_at").in("user_id", c).gte("created_at", since).limit(20000)),
    allRows<any>((a, b) => db.from("ai_calls").select("model, ms, ttft_ms, ok, error").gte("created_at", since).order("id").range(a, b), 50000).catch(() => []),
    allRows<{ meta: any }>((a, b) => db.from("usage_events").select("meta").gte("created_at", since).in("kind", ["ai_request", "source_search"]).order("id").range(a, b), 50000),
  ]);
  const words = new Map<string, number>();
  for (const s of stages) words.set(s.user_id, (words.get(s.user_id) ?? 0) + (s.word_count ?? 0));
  const activeDays = new Map<string, Set<string>>();
  for (const e of events) { if (!activeDays.has(e.user_id)) activeDays.set(e.user_id, new Set()); activeDays.get(e.user_id)!.add(e.created_at.slice(0, 10)); }
  const funnel = activationFunnel({
    users, projectUsers: new Set(projects.map((p) => p.user_id)), words,
    aiUsers: new Set(events.filter((e) => e.kind === "ai_request").map((e) => e.user_id)),
    exportUsers: new Set(events.filter((e) => e.kind === "export").map((e) => e.user_id)), activeDays,
  });
  // Yeni modüllerin benimsenmesi (D111–D125)
  const FEATURES: [string, (m: any) => boolean][] = [
    ["İddia denetimi", (m) => m?.action === "claim_audit"], ["PRISMA tarama önerisi", (m) => m?.action === "review_screen"], ["Literatür haritası", (m) => m?.kind === "litmap"],
    ["Kaynağa sor", (m) => m?.action === "source_ask"], ["Çeviri", (m) => String(m?.action ?? "").startsWith("translate_")], ["Dil denetimi", (m) => String(m?.action ?? "").startsWith("proofread_")],
  ];
  const features = FEATURES.map(([label, f]) => ({ label, value: adoption.filter((r) => f(r.meta)).length }));
  return json({ days: n, funnel, reliability: aiReliability(calls), features });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
