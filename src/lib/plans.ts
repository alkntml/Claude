import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient as createAnon } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { FALLBACK_PLANS, type PlanLike } from "./plans-fallback";

/**
 * Herkese açık paket listesi. Oturumdan bağımsızdır; 5 dakika önbellekte tutulur
 * (tanıtım sayfaları her ziyarette veritabanına gitmez). Yönetim panelinde paket değişince en geç 5 dk içinde yansır.
 */
const loadPlans = unstable_cache(async (): Promise<PlanLike[]> => {
  const db = createAnon(env.supabaseUrl, env.supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data } = await db.from("plans").select("id, name, description, price_monthly, price_yearly, currency, features").eq("is_active", true).order("sort_order");
  return data?.length ? (data as PlanLike[]) : FALLBACK_PLANS;
}, ["public-plans"], { revalidate: 300, tags: ["plans"] });

export async function publicPlans(): Promise<PlanLike[]> {
  if (!isSupabaseConfigured()) return FALLBACK_PLANS;
  try {
    return await loadPlans();
  } catch {
    return FALLBACK_PLANS;
  }
}
