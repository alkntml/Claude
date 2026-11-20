import { ApiError, json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ oid: string }> };

/** D225: ödeme sonucu ekranı siparişin durumunu sorar (yalnızca kendi siparişi; RLS + açık user_id filtresi) */
export const GET = route<Ctx>("payments.order", async (_req, { params }) => {
  const s = await requireUser();
  const { oid } = await params;
  if (!/^[A-Za-z0-9]{8,64}$/.test(oid)) throw new ApiError(404, "Sipariş bulunamadı");
  const { data } = await s.supabase.from("payment_orders").select("merchant_oid, plan_id, period, amount_try, status, applied_at, failed_reason, test_mode, created_at")
    .eq("merchant_oid", oid).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Sipariş bulunamadı");
  const { data: plan } = await s.supabase.from("plans").select("name").eq("id", data.plan_id).maybeSingle();
  return json({ ...data, plan_name: plan?.name ?? data.plan_id, done: data.status === "paid" && !!data.applied_at });
});
