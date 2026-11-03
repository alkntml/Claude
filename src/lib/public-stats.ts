import "server-only";
import { unstable_cache } from "next/cache";
import { adminClient } from "@/lib/supabase/admin";

/** Gerçek kayıtlı kullanıcı sayısı (tanıtım sayfası için, 1 saat önbellekli; D62). Hata olursa 0. */
export const publicUserCount = unstable_cache(async (): Promise<number> => {
  try {
    const { count } = await adminClient().from("profiles").select("id", { count: "exact", head: true });
    return count ?? 0;
  } catch { return 0; }
}, ["public-user-count"], { revalidate: 3600 });

/** Gösterim için aşağı yuvarlama: 137 → 130, 1.284 → 1.200, 12.840 → 12.000. Eşik altında null (sayı gösterilmez). */
export function roundedUsers(n: number, threshold = 100): number | null {
  if (n < threshold) return null;
  const step = n < 1000 ? 10 : n < 10000 ? 100 : 1000;
  return Math.floor(n / step) * step;
}
