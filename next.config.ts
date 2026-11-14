import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * D168: Tanıtım sayfaları giriş yapmamış ziyaretçiye Vercel CDN’inden sunulur (5 dk taze, süresi dolunca 1 gün boyunca eskisi
 * gösterilirken arka planda yenilenir; her yayında önbellek sıfırlanır). Sayfa HTML’i kişiye özel değildir (giriş durumuna bağlı
 * düğmeler tarayıcıda düzeltilir: useSignedIn). Oturum çerezi olan isteklere başlık eklenmez.
 */
function publicCacheHeaders() {
  const seo = fs.readFileSync(path.join(process.cwd(), "src/lib/seo.ts"), "utf8");
  const list = seo.match(/export const PUBLIC_PATHS = \[([^\]]+)\]/);
  const paths = list ? [...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : [];
  const all = [...paths, "/blog/:slug"];
  let ref = "";
  try { ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host.split(".")[0]; } catch { /* yapılandırılmamış */ }
  const missing = ref ? [{ type: "cookie" as const, key: `sb-${ref}-auth-token` }, { type: "cookie" as const, key: `sb-${ref}-auth-token.0` }] : [];
  const value = [{ key: "Vercel-CDN-Cache-Control", value: "s-maxage=300, stale-while-revalidate=86400" }];
  const out: { source: string; headers: typeof value; missing?: typeof missing }[] = [];
  for (const p of all) for (const pre of ["", "/en", "/de"]) {
    const source = p === "/" ? (pre || "/") : `${pre}${p}`;
    out.push({ source, headers: value, ...(missing.length ? { missing } : {}) });
  }
  return out;
}

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
  // SEO (D164): arama motoru ve sosyal önizleme botlarına başlık/açıklama/canonical/hreflang <head> içinde,
  // JavaScript çalıştırmadan okunacak biçimde gönderilir (Next’in akıtılan meta verisi yerine engelleyen işleme).
  // Next’in varsayılan listesine Googlebot, Bingbot ve genel tarayıcılar eklendi; insan ziyaretçiler etkilenmez.
  // D164/D168: meta veriler herkese <head> içinde gönderilir (akış yok). Sayfalar CDN önbelleğinden sunulduğundan
  // botlara ve insanlara aynı HTML gider; böylece önbellekteki sayfa arama motoru için de doğru olur.
  htmlLimitedBots: /.*/,
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
      ...publicCacheHeaders(),
      // D193: kendi sunucumuzdaki yazı tipleri (dosya adı sürümlü: -v1) uzun süre önbelleklenir
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Servis çalışanı her zaman güncel sürümüyle yüklensin
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

export default nextConfig;
