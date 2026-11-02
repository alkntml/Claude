import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

export interface CheckoutInput {
  userId: string;
  email: string;
  plan: { id: string; name: string; price_monthly: number; price_yearly: number; currency: string };
  interval: "monthly" | "yearly";
  successUrl: string;
  cancelUrl: string;
}

export interface SubscriptionEvent {
  provider: "stripe" | "iyzico";
  type: "activated" | "updated" | "canceled";
  userId?: string;
  planId?: string;
  customerId?: string;
  subscriptionId: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  periodStart?: string;
  periodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  interval?: "monthly" | "yearly";
}

export interface PaymentProvider {
  id: "stripe" | "iyzico";
  label: string;
  configured(): boolean;
  /** true ise uçtan uca uygulanmıştır; false ise yalnızca arayüz iskeleti vardır */
  implemented: boolean;
  createCheckout(input: CheckoutInput): Promise<{ url: string }>;
  parseWebhook(rawBody: string, headers: Headers): Promise<SubscriptionEvent | null>;
}

// ---------------------------------------------------------------------------
// Stripe (REST, SDK bağımlılığı olmadan)
// ---------------------------------------------------------------------------

function form(obj: Record<string, string | number | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) p.append(k, String(v));
  return p;
}

async function stripe<T>(path: string, body?: URLSearchParams, method = "POST"): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, { method, headers: { Authorization: `Bearer ${env.stripeSecret}`, ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) }, body });
  const j = await res.json();
  if (!res.ok) throw new Error(`Stripe: ${j?.error?.message ?? res.status}`);
  return j as T;
}

/** Stripe müşteri portalı: kullanıcı aboneliğini iptal eder, kartını değiştirir, faturalarını indirir. */
export async function stripePortalUrl(customerId: string, returnUrl: string): Promise<string> {
  const r = await stripe<{ url: string }>("billing_portal/sessions", form({ customer: customerId, return_url: returnUrl }));
  return r.url;
}

/** Stripe-Signature başlığını doğrular (t=..., v1=...), 5 dk tolerans. */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSec = 300): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = Number(parts.t);
  const sigs = header.split(",").filter((x) => x.startsWith("v1=")).map((x) => x.slice(3));
  if (!t || !sigs.length || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return sigs.some((s) => s.length === expected.length && crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected)));
}

const STATUS: Record<string, SubscriptionEvent["status"]> = { trialing: "trialing", active: "active", past_due: "past_due", unpaid: "past_due", canceled: "canceled", incomplete: "incomplete", incomplete_expired: "canceled" };

/* eslint-disable @typescript-eslint/no-explicit-any */
const stripeProvider: PaymentProvider = {
  id: "stripe",
  label: "Stripe (uluslararası kartlar)",
  implemented: true,
  configured: () => !!(env.stripeSecret && env.stripeWebhookSecret),
  async createCheckout(i) {
    const amount = Math.round((i.interval === "yearly" ? i.plan.price_yearly : i.plan.price_monthly) * 100);
    const session = await stripe<{ url: string }>("checkout/sessions", form({
      mode: "subscription",
      customer_email: i.email,
      client_reference_id: i.userId,
      success_url: i.successUrl,
      cancel_url: i.cancelUrl,
      "line_items[0][quantity]": 1,
      "line_items[0][price_data][currency]": i.plan.currency.toLowerCase(),
      "line_items[0][price_data][unit_amount]": amount,
      "line_items[0][price_data][recurring][interval]": i.interval === "yearly" ? "year" : "month",
      "line_items[0][price_data][product_data][name]": `Academiana ${i.plan.name}`,
      "metadata[user_id]": i.userId,
      "metadata[plan_id]": i.plan.id,
      "metadata[interval]": i.interval,
      "subscription_data[metadata][user_id]": i.userId,
      "subscription_data[metadata][plan_id]": i.plan.id,
      "subscription_data[metadata][interval]": i.interval,
    }));
    return { url: session.url };
  },
  async parseWebhook(raw, headers) {
    if (!verifyStripeSignature(raw, headers.get("stripe-signature"), env.stripeWebhookSecret)) throw new Error("Geçersiz imza");
    const ev = JSON.parse(raw);
    const obj = ev.data?.object ?? {};
    if (ev.type === "checkout.session.completed" && obj.mode === "subscription") {
      const sub = await stripe<any>(`subscriptions/${obj.subscription}`, undefined, "GET");
      return { provider: "stripe", type: "activated", userId: obj.metadata?.user_id, planId: obj.metadata?.plan_id, customerId: obj.customer, subscriptionId: sub.id, status: STATUS[sub.status] ?? "incomplete", periodStart: sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : undefined, periodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined, cancelAtPeriodEnd: !!sub.cancel_at_period_end, interval: obj.metadata?.interval };
    }
    if (ev.type === "customer.subscription.updated" || ev.type === "customer.subscription.deleted") {
      return { provider: "stripe", type: ev.type.endsWith("deleted") ? "canceled" : "updated", userId: obj.metadata?.user_id, planId: obj.metadata?.plan_id, customerId: obj.customer, subscriptionId: obj.id, status: ev.type.endsWith("deleted") ? "canceled" : STATUS[obj.status] ?? "incomplete", periodStart: obj.current_period_start ? new Date(obj.current_period_start * 1000).toISOString() : undefined, periodEnd: obj.current_period_end ? new Date(obj.current_period_end * 1000).toISOString() : undefined, cancelAtPeriodEnd: !!obj.cancel_at_period_end };
    }
    return null;
  },
};
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// iyzico — Türkiye pazarı. Abonelik ürünü/fiyat planı referansları iyzico panelinde oluşturulmalıdır.
// Bu sağlayıcı yalnızca arayüz iskeletidir; uçtan uca uygulanmamıştır (bkz. docs/ARCHITECTURE.md).
// ---------------------------------------------------------------------------
const iyzicoProvider: PaymentProvider = {
  id: "iyzico",
  label: "iyzico (Türkiye)",
  implemented: false,
  configured: () => !!(env.iyzicoKey && env.iyzicoSecret),
  async createCheckout() {
    throw new Error("iyzico entegrasyonu henüz uygulanmadı");
  },
  async parseWebhook() {
    throw new Error("iyzico entegrasyonu henüz uygulanmadı");
  },
};

export const PAYMENT_PROVIDERS = { stripe: stripeProvider, iyzico: iyzicoProvider };

export function availableProviders() {
  return Object.values(PAYMENT_PROVIDERS).map((p) => ({ id: p.id, label: p.label, configured: p.configured(), implemented: p.implemented, usable: p.configured() && p.implemented }));
}
