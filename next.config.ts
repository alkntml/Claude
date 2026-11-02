import type { NextConfig } from "next";

const securityHeaders = [
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
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Servis çalışanı her zaman güncel sürümüyle yüklensin
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
    ];
  },
};

export default nextConfig;
