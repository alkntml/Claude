import { logError } from "@/lib/api";
import { PAYMENT_PROVIDERS, type SubscriptionEvent } from "@/lib/payments";
import { adminClient } from "@/lib/supabase/admin";

async function apply(ev: SubscriptionEvent) {
  const db = adminClient();
  let userId = ev.userId;
  let planId = ev.planId;
  const { data: existing } = await db.from("subscriptions").select("*").eq("provider", ev.provider).eq("provider_subscription_id", ev.subscriptionId).maybeSingle();
  userId ??= existing?.user_id;
  planId ??= existing?.plan_id;
  if (!userId || !planId) return;
  const row = {
    user_id: userId, plan_id: planId, status: ev.status, provider: ev.provider, provider_customer_id: ev.customerId ?? existing?.provider_customer_id ?? null,
    provider_subscription_id: ev.subscriptionId, current_period_start: ev.periodStart ?? null, current_period_end: ev.periodEnd ?? null,
    cancel_at_period_end: ev.cancelAtPeriodEnd ?? false, billing_interval: ev.interval ?? existing?.billing_interval ?? "monthly",
  };
  if (existing) await db.from("subscriptions").update(row).eq("id", existing.id);
  else await db.from("subscriptions").insert(row);
  const active = ev.status === "active" || ev.status === "trialing";
  await db.from("profiles").update({ plan_id: active ? planId : "free" }).eq("id", userId);
}

export async function POST(req: Request) {
  const provider = new URL(req.url).searchParams.get("provider") === "iyzico" ? PAYMENT_PROVIDERS.iyzico : PAYMENT_PROVIDERS.stripe;
  const raw = await req.text();
  try {
    const ev = await provider.parseWebhook(raw, req.headers);
    if (ev) await apply(ev);
    return Response.json({ received: true });
  } catch (e) {
    await logError("billing.webhook", e);
    return Response.json({ error: "webhook reddedildi" }, { status: 400 });
  }
}
