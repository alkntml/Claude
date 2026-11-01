import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

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
}

export interface Session {
  supabase: SupabaseClient;
  user: User;
  profile: Profile;
}

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return null;
  return { supabase, user, profile: profile as Profile };
}

export async function requireUser(): Promise<Session> {
  if (!isSupabaseConfigured()) throw new ApiError(503, "Veritabanı yapılandırılmamış (Supabase ortam değişkenleri eksik)", "not_configured");
  const s = await getSession();
  if (!s) throw new ApiError(401, "Oturum açmanız gerekiyor", "unauthenticated");
  if (s.profile.is_suspended) throw new ApiError(403, "Hesabınız askıya alınmış", "suspended");
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
