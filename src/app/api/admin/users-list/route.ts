import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";

/** Yönetim → Kullanıcılar: filtreli liste (tümü / ücretli / süresi yaklaşan / süresi dolan / kilitli / askıda) */
export const GET = route("admin.users_list", async (req) => {
  await requireAdmin();
  const url = new URL(req.url);
  const filter = url.searchParams.get("filter") ?? "all";
  const q = url.searchParams.get("q")?.slice(0, 100).replace(/[%_,()]/g, "") ?? "";
  const page = Math.max(0, Number(url.searchParams.get("page") ?? 0));
  const now = new Date().toISOString();
  const week = new Date(Date.now() + 7 * 86400_000).toISOString();
  let query = adminClient().from("profiles")
    .select("id, email, full_name, institution, role, plan_id, plan_expires_at, work_locked, is_suspended, created_at", { count: "exact" });
  if (q) query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  if (filter === "paid") query = query.neq("plan_id", "free");
  if (filter === "expiring") query = query.neq("plan_id", "free").gte("plan_expires_at", now).lte("plan_expires_at", week);
  if (filter === "expired") query = query.lt("plan_expires_at", now);
  if (filter === "locked") query = query.eq("work_locked", true);
  if (filter === "suspended") query = query.eq("is_suspended", true);
  query = filter === "expiring" ? query.order("plan_expires_at", { ascending: true }) : query.order("created_at", { ascending: false });
  const { data, count, error } = await query.range(page * 50, page * 50 + 49);
  if (error) throw error;
  return json({ rows: data ?? [], count: count ?? 0, page });
});
