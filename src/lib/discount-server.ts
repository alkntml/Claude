import "server-only";
import { adminClient } from "@/lib/supabase/admin";
import { normalizeCode, type DiscountCode } from "@/lib/discount";

/** Kullanıcıya bağlı indirim kodu (D145). Kod tablosu yoksa (migration 38 çalıştırılmadıysa) veya kod silindiyse null. */
export async function userDiscount(codeOrUser: { discount_code?: string | null } | null | undefined): Promise<DiscountCode | null> {
  const code = codeOrUser?.discount_code;
  if (!code) return null;
  try {
    const { data } = await adminClient().from("discount_codes").select("code, kind, value, plans").eq("code", code).maybeSingle();
    return data ? { code: data.code, kind: data.kind, value: Number(data.value), plans: (data.plans ?? []) as string[] } : null;
  } catch {
    return null;
  }
}

/**
 * Sosyal girişle (Google/Apple) yeni açılan hesaba indirim kodunu bağlar (kayıt formundaki gibi meta veri taşınamaz).
 * Yalnızca yeni hesaplarda (15 dk) ve henüz kod yoksa; kuralları veritabanı fonksiyonu uygular (tek seferlik, sınırlar).
 */
export async function attachDiscount(userId: string, raw: string, createdAt: string | undefined): Promise<void> {
  const code = normalizeCode(raw);
  if (!code || !createdAt || Date.now() - new Date(createdAt).getTime() > 15 * 60_000) return;
  await adminClient().rpc("claim_discount_code", { p_user: userId, p_code: code }).then(() => undefined, () => undefined);
}
