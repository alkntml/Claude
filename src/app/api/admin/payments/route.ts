import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { paytrCreds } from "@/lib/payments/paytr";

/** D225: Yönetim → Ödemeler: kartla ödeme siparişleri (son 200) ve PayTR yapılandırma durumu */
export const GET = route("admin.payments", async () => {
  await requireAdmin();
  const db = adminClient();
  const { data, error } = await db.from("payment_orders")
    .select("merchant_oid, user_id, plan_id, period, amount_try, list_price_try, discount_code, status, payer_name, payer_phone, test_mode, paid_amount_try, payment_type, failed_reason, applied_at, created_at")
    .order("created_at", { ascending: false }).limit(200);
  const ids = [...new Set((data ?? []).map((r) => r.user_id))];
  const { data: users } = ids.length ? await db.from("profiles").select("id, email").in("id", ids) : { data: [] as { id: string; email: string | null }[] };
  const email = new Map((users ?? []).map((u) => [u.id, u.email]));
  const c = paytrCreds();
  return json({
    configured: !!c, testMode: c?.testMode ?? null, tableMissing: !!error,
    orders: (data ?? []).map((r) => ({ ...r, email: email.get(r.user_id) ?? null })),
  });
});
