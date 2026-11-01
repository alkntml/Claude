import "server-only";
import { env, isSupabaseConfigured } from "@/lib/env";

export type OAuthProvider = "google" | "apple";
const ALL: OAuthProvider[] = ["google", "apple"];

/**
 * Supabase'de etkin olan sosyal giriş sağlayıcıları. Düğmeler yalnızca sağlayıcı Supabase panelinde
 * açıldıysa gösterilir; böylece yapılandırılmamış bir sağlayıcı kullanıcıya hata vermez.
 */
export async function enabledOAuthProviders(): Promise<OAuthProvider[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const res = await fetch(`${env.supabaseUrl}/auth/v1/settings`, { headers: { apikey: env.supabaseAnonKey }, next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    const json = (await res.json()) as { external?: Record<string, boolean> };
    return ALL.filter((p) => json.external?.[p] === true);
  } catch {
    return [];
  }
}
