import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Service role istemcisi RLS'i atlar. YALNIZCA sunucuda ve şu işlemler için kullanılır:
 * kullanım kayıtları, hata kayıtları, ayarların okunması, webhook'lar ve yönetici işlemleri.
 * Kullanıcı verisine erişirken her zaman açık user_id filtresi uygulanmalıdır.
 */
export function adminClient(): SupabaseClient {
  if (!env.supabaseServiceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY tanımlı değil");
  cached ??= createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return cached;
}
