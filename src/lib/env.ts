import "server-only";
import { SITE_URL } from "./site";

/** Sunucu tarafı yapılandırma. Gizli anahtarlar yalnızca burada okunur; istemci paketine girmez. */
export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "production" ? SITE_URL : "http://localhost:3000"),
  // Supabase/Vercel entegrasyonu anahtarları eski (anon/service_role) veya yeni (publishable/secret) adlarla verebilir
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "",
  anthropicKey: process.env.ANTHROPIC_API_KEY ?? "",
  openaiKey: process.env.OPENAI_API_KEY ?? "",
  contactEmail: process.env.ACADEMIC_CONTACT_EMAIL ?? "",
  semanticScholarKey: process.env.SEMANTIC_SCHOLAR_API_KEY ?? "",
  coreKey: process.env.CORE_API_KEY ?? "",
  openalexKey: process.env.OPENALEX_API_KEY ?? "",
  googleBooksKey: process.env.GOOGLE_BOOKS_API_KEY ?? "",
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  iyzicoKey: process.env.IYZICO_API_KEY ?? "",
  iyzicoSecret: process.env.IYZICO_SECRET_KEY ?? "",
};

export function isSupabaseConfigured() {
  return !!(env.supabaseUrl && env.supabaseAnonKey);
}

/** Yönetici paneli ve "Sistem durumu" ekranı için hangi entegrasyonların hazır olduğunu döndürür. */
export function integrationStatus() {
  return {
    supabase: isSupabaseConfigured(),
    supabaseServiceRole: !!env.supabaseServiceKey,
    anthropic: !!env.anthropicKey,
    openai: !!env.openaiKey,
    contactEmail: !!env.contactEmail,
    semanticScholarKey: !!env.semanticScholarKey,
    coreKey: !!env.coreKey,
    stripe: !!(env.stripeSecret && env.stripeWebhookSecret),
    iyzico: !!(env.iyzicoKey && env.iyzicoSecret),
  };
}

export function providerConfig() {
  return {
    contactEmail: env.contactEmail || undefined,
    semanticScholarKey: env.semanticScholarKey || undefined,
    coreKey: env.coreKey || undefined,
    openalexKey: env.openalexKey || undefined,
    googleBooksKey: env.googleBooksKey || undefined,
  };
}
