import type { NextConfig } from "next";

/**
 * İçerik Güvenlik Politikası (CSP, D106): betik, stil, bağlantı ve çerçeve kaynakları kendi alan adımızla sınırlı.
 * Tarayıcıdan dışarıya giden tek bağlantı Supabase (giriş/oturum). Yazı tipleri next/font ile kendi alan adımızdan gelir.
 * Next.js’in sayfa içi başlatma betikleri için 'unsafe-inline' gerekir; geliştirmede hızlı yenileme için 'unsafe-eval'.
 */
function contentSecurityPolicy(): string {
  let supabase = "https://*.supabase.co";
  try {
    const u = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    supabase = `${u.origin} wss://${u.host}`;
  } catch { /* yapılandırılmamış: genel Supabase alan adı */ }
  const dev = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' ${supabase} https://*.supabase.co wss://*.supabase.co${dev ? " ws:" : ""}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Mikrofon yalnızca kendi alan adımızda (sesle yazma ve savunma provası); kamera ve konum kapalı
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit", "unpdf", "mammoth", "read-excel-file", "unzipper"],
  outputFileTracingIncludes: { "/api/projects/[id]/export": ["./assets/fonts/**"], "/api/og": ["./assets/fonts/**", "./public/brand/**"] },
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  // Kaldırılan sayfalar: eski bağlantılar ve arama motoru kayıtları ana sayfaya kalıcı yönlenir
  async redirects() {
    return [
      { source: "/uzman-destegi", destination: "/", permanent: true },
      // D154: eski “Güvenlik ve Gizlilik” sayfası KVKK Aydınlatma Metni’ne taşındı; eski bağlantılar boşa çıkmaz
      { source: "/gizlilik", destination: "/kvkk", permanent: true },
      { source: "/en/gizlilik", destination: "/en/kvkk", permanent: true },
      { source: "/de/gizlilik", destination: "/de/kvkk", permanent: true },
      { source: "/en/uzman-destegi", destination: "/en", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Servis çalışanı her zaman güncel sürümüyle yüklensin
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

export default nextConfig;
