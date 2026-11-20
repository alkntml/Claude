import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { memberCode } from "@/lib/member";
import { userDiscount } from "@/lib/discount-server";
import { canPayByCard, paytrCreds } from "@/lib/payments/paytr";
import { recurringEnabled } from "@/lib/payments/paytr-recurring";

/**
 * Yükseltme penceresi için paketler ve sınırları (D49). Kullanım sınırları tanıtım sayfalarında
 * gösterilmez; yalnızca giriş yapmış kullanıcı paket yükseltirken görür.
 */
export const GET = route("account.plans", async () => {
  const s = await requireUser();
  const { data: active } = await s.supabase.from("plans").select("id, name, description, features, price_monthly, limits, sort_order").eq("is_active", true).order("sort_order");
  const who = { role: s.profile.role, email: s.profile.email ?? s.user.email };
  const creds = paytrCreds();
  const data = active;
  const plans = (data ?? []).map((p) => {
    const l = (p.limits ?? {}) as Record<string, unknown>;
    return {
      id: p.id as string, name: p.name as string, description: (p.description as string | null) ?? null, features: ((p.features as string[] | null) ?? []), price_monthly: Number(p.price_monthly),
      limits: { pages_month: l.pages_month ?? null, ai_requests_month: l.ai_requests_month ?? null, source_searches_month: l.source_searches_month ?? null, projects: l.projects ?? null, storage_mb: l.storage_mb ?? null, export_formats: l.export_formats ?? null },
    };
  });
  // D145: kayıtta bağlanan indirim kodu (indirimli fiyat gösterilir)
  const discount = await userDiscount(s.profile);
  return json({ cardPayments: canPayByCard(creds, who), autoRenewAvailable: !!creds && canPayByCard(creds, who) && recurringEnabled(), current: s.profile.plan_id, currentPeriod: s.profile.plan_period === "yearly" ? "yearly" : "monthly", currentExpiresAt: s.profile.personal_plan_id && s.profile.personal_plan_id !== "free" ? s.profile.plan_expires_at ?? null : null, currentPlanId: s.profile.personal_plan_id ?? s.profile.plan_id, email: s.profile.email ?? s.user.email ?? "", memberNo: memberCode(s.profile.member_no), plans, discount });
});
