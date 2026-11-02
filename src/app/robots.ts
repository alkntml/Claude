import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Arama motorları: herkese açık tanıtım sayfaları taranır; kullanıcı alanları ve API taranmaz */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/proje/", "/paylasim/", "/a/", "/panel", "/yeni", "/kaynaklar", "/dosyalar", "/anketler", "/konu-bul", "/hesap", "/kurum", "/yonetim", "/davet/", "/offline"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
