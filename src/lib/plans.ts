import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { FALLBACK_PLANS, type PlanLike } from "./plans-fallback";

export async function publicPlans(): Promise<PlanLike[]> {
  if (!isSupabaseConfigured()) return FALLBACK_PLANS;
  try {
    const db = await createClient();
    const { data } = await db.from("plans").select("id, name, description, price_monthly, price_yearly, currency, features").eq("is_active", true).order("sort_order");
    return data?.length ? (data as PlanLike[]) : FALLBACK_PLANS;
  } catch {
    return FALLBACK_PLANS;
  }
}
