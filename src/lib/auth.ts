import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ApiError, requestCtx } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { activeOrg, type OrgInfo } from "@/lib/growth";
import { higherPlan } from "@/lib/pricing";
import { adminClient } from "@/lib/supabase/admin";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  institution: string | null;
  role: "user" | "admin";
  plan_id: string;
  locale: string;
  default_citation_style: string;
  is_suspended: boolean;
  created_at: string;
  /** Kişisel paket (kurum paketi uygulanmadan önce) */
  personal_plan_id?: string;
  /** Etkin kurum üyeliği (kurumsal lisans) */
  org?: OrgInfo | null;
  referral_code?: string | null;
  /** D145: kayıtta bağlanan indirim kodu */
  discount_code?: string | null;
  /** Çalışma kilidi bayrağı (D50); sunucu yönetir */
  work_locked?: boolean;
  /** Ücretli paketin bitiş tarihi (D53); null = süresiz */
  plan_expires_at?: string | null;
  /** Üye numarası (D56) */
  member_no?: number | null;
}

export interface Session {
  supabase: SupabaseClient;
  user: User;
  profile: Profile;
}

/**
 * Oturum + profil. Aynı istek içinde (düzen, sayfa, meta veri) tek kez çalışır (React cache).
 * Profil ve kurum üyeliği paralel sorgulanır.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: profile }, org] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    activeOrg(supabase, user.id),
  ]);
  if (!profile) return null;
  const p = profile as Profile;
  // Paket süresi dolduysa ücretsiz pakete düşer (D53); tarih bilgi için saklanır
  // Tek Proje süresizdir (D103): yanlışlıkla yazılmış bir bitiş tarihi paketi düşürmez (D109)
  if (p.plan_id !== "free" && p.plan_id !== "single" && p.plan_expires_at && new Date(p.plan_expires_at).getTime() < Date.now()) {
    p.plan_id = "free";
    try { await adminClient().from("profiles").update({ plan_id: "free" }).eq("id", p.id); } catch { /* service role yoksa yalnızca bu istekte düşer */ }
  }
  // Kurumsal lisans: kurum paketi kişisel paketten yüksekse o geçerlidir
  p.personal_plan_id = p.plan_id;
  p.org = org;
  if (org) p.plan_id = higherPlan(p.plan_id, org.plan_id);
  // Yönetici tüm özellikleri kullanır (otomatik çalışma modülü dahil; D77)
  if (p.role === "admin") p.plan_id = "premium";
  return { supabase, user, profile: p };
});

/**
 * Tanıtım sayfaları için hızlı kontrol: oturum çerezi var mı? (ağ isteği yapmaz)
 * Yalnızca “Giriş yap / Çalışma alanım” düğmesini seçmek için; yetki kontrolü değildir.
 */
export async function hasAuthCookie(): Promise<boolean> {
  try {
    return (await cookies()).getAll().some((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name) && c.value.length > 0);
  } catch {
    return false;
  }
}

export async function requireUser(): Promise<Session> {
  if (!isSupabaseConfigured()) throw new ApiError(503, "Veritabanı yapılandırılmamış (Supabase ortam değişkenleri eksik)", "not_configured");
  const s = await getSession();
  if (!s) throw new ApiError(401, "Oturum açmanız gerekiyor", "unauthenticated");
  if (s.profile.is_suspended) throw new ApiError(403, "Hesabınız askıya alınmış", "suspended");
  const ctx = requestCtx.getStore();
  if (ctx) ctx.userId = s.user.id;
  return s;
}

export async function requireAdmin(): Promise<Session> {
  const s = await requireUser();
  if (s.profile.role !== "admin") throw new ApiError(403, "Yönetici yetkisi gerekiyor", "forbidden");
  return s;
}

/** Projenin oturumdaki kullanıcıya ait olduğunu doğrular (RLS'e ek olarak açık kontrol). */
export async function requireProject(s: Session, projectId: string) {
  const { data } = await s.supabase.from("projects").select("*").eq("id", projectId).eq("user_id", s.user.id).maybeSingle();
  if (!data) throw new ApiError(404, "Proje bulunamadı");
  return data;
}
