import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: [string, number][] = [["", 1], ["/fiyatlar", 0.8], ["/sss", 0.8], ["/kurumlar", 0.6], ["/uzman-destegi", 0.6], ["/yardim", 0.5], ["/akademik-durustluk", 0.5], ["/gizlilik", 0.3], ["/kosullar", 0.3], ["/kayit", 0.7], ["/giris", 0.4]];
  return [
    ...pages.map(([path, priority]) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" as const, priority })),
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...POSTS.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.7 })),
  ];
}
