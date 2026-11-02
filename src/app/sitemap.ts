import type { MetadataRoute } from "next";
import { POSTS, postPath } from "@/lib/blog";
import { absoluteUrl, localizedPath } from "@/lib/seo";

/** Site haritası: her sayfa Türkçe ve İngilizce adresleriyle, hreflang eşleştirmeleri dahil */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString().slice(0, 10);
  const pages: [string, number, "daily" | "weekly" | "monthly" | "yearly"][] = [
    ["/", 1, "weekly"], ["/fiyatlar", 0.9, "weekly"], ["/blog", 0.9, "weekly"], ["/sss", 0.8, "monthly"], ["/kurumlar", 0.7, "monthly"],
    ["/uzman-destegi", 0.6, "monthly"], ["/akademik-durustluk", 0.6, "monthly"], ["/kayit", 0.6, "monthly"], ["/yardim", 0.5, "monthly"],
    ["/gizlilik", 0.3, "yearly"], ["/kosullar", 0.3, "yearly"],
  ];
  const pair = (tr: string, en: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly", lastModified: string): MetadataRoute.Sitemap => {
    const alternates = { languages: { tr: absoluteUrl(tr), en: absoluteUrl(en), "x-default": absoluteUrl(tr) } };
    return [
      { url: absoluteUrl(tr), lastModified, changeFrequency, priority, alternates },
      { url: absoluteUrl(en), lastModified, changeFrequency, priority: Math.max(0.1, +(priority - 0.1).toFixed(1)), alternates },
    ];
  };
  return [
    ...pages.flatMap(([p, pr, cf]) => pair(p, localizedPath(p, "en"), pr, cf, now)),
    ...POSTS.flatMap((p) => pair(postPath(p, "tr"), postPath(p, "en"), 0.7, "monthly", p.date)),
  ];
}
