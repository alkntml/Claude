import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

/** D226: Hesap → Siparişlerim (kullanıcının kendi kartla ödeme siparişleri; RLS + açık user_id filtresi) */
export const GET = route("payments.orders", async () => {
  const s = await requireUser();
  const { data } = await s.supabase.from("payment_orders").select("merchant_oid, plan_id, period, amount_try, status, applied_at, test_mode, created_at")
    .eq("user_id", s.user.id).neq("status", "pending").order("created_at", { ascending: false }).limit(50);
  const ids = [...new Set((data ?? []).map((o) => o.plan_id))];
  const { data: plans } = ids.length ? await s.supabase.from("plans").select("id, name").in("id", ids) : { data: [] as { id: string; name: string }[] };
  const name = new Map((plans ?? []).map((p) => [p.id, p.name]));
  return json({ orders: (data ?? []).map((o) => ({ ...o, plan_name: name.get(o.plan_id) ?? o.plan_id })) });
});
