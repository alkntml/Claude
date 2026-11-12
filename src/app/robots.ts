import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PRIVATE = ["/api/", "/proje/", "/paylasim/", "/a/", "/panel", "/yeni", "/kaynaklar", "/dosyalar", "/anketler", "/konu-bul", "/hesap", "/kurum", "/yonetim", "/davet/", "/ortak/", "/offline", "/kurulum"];

/** Arama motorları: tanıtım sayfaları (TR, /en ve /de) taranır; kullanıcı alanları ve API taranmaz. Paylaşım görselleri (/api/og) serbest. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/en/", "/de/", "/api/og"], disallow: [...PRIVATE, "/giris", "/en/giris", "/de/giris"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
