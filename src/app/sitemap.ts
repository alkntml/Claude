import type { MetadataRoute } from "next";
import { DE_POSTS, POSTS, postPath } from "@/lib/blog";
import { absoluteUrl, localizedPath, SITE_CONTENT_UPDATED } from "@/lib/seo";

/** Site haritası: her sayfa Türkçe, İngilizce ve Almanca adresleriyle, hreflang eşleştirmeleri dahil */
export default function sitemap(): MetadataRoute.Sitemap {
  // D107: gerçek içerik güncelleme tarihi (her istekte “bugün” demek Google’ın lastmod sinyaline güvenini azaltır).
  // Herkese açık sayfaların içeriği değişince bu tarihi güncelleyin.
  const updated = SITE_CONTENT_UPDATED;
  const pages: [string, number, "daily" | "weekly" | "monthly" | "yearly"][] = [
    ["/", 1, "weekly"], ["/fiyatlar", 0.9, "weekly"], ["/ornekler", 0.8, "monthly"], ["/blog", 0.9, "weekly"], ["/sss", 0.8, "monthly"], ["/kurumlar", 0.7, "monthly"],
    ["/akademik-durustluk", 0.6, "monthly"], ["/hakkimizda", 0.6, "monthly"], ["/yontem", 0.7, "monthly"], ["/kayit", 0.6, "monthly"], ["/yardim", 0.5, "monthly"],
    ["/kvkk", 0.3, "yearly"], ["/kosullar", 0.3, "yearly"], ["/adil-kullanim", 0.3, "yearly"], ["/cerez-politikasi", 0.3, "yearly"], ["/mesafeli-sozlesmeler", 0.3, "yearly"], ["/gdpr", 0.3, "yearly"],
    ["/araclar", 0.9, "weekly"], ["/araclar/arastirmalar-ne-diyor", 0.9, "monthly"], ["/araclar/uydurma-kaynak-kontrolu", 0.9, "monthly"], ["/araclar/kaynakca-olusturucu", 0.9, "monthly"], ["/araclar/atif-donusturucu", 0.8, "monthly"],
    ["/araclar/orneklem-hesaplayici", 0.8, "monthly"], ["/araclar/cronbach-alfa", 0.8, "monthly"], ["/araclar/anket-olusturucu", 0.8, "monthly"],
  ];
  // Her sayfa için dil sürümleri (Almancası olmayan blog yazısı Almanca listeye girmez)
  const group = (urls: { tr: string; en: string; de?: string }, priority: number, changeFrequency: "daily" | "weekly" | "monthly" | "yearly", lastModified: string): MetadataRoute.Sitemap => {
    const languages: Record<string, string> = { tr: absoluteUrl(urls.tr), en: absoluteUrl(urls.en), ...(urls.de ? { de: absoluteUrl(urls.de) } : {}), "x-default": absoluteUrl(urls.en) };
    const alternates = { languages };
    const lower = Math.max(0.1, +(priority - 0.1).toFixed(1));
    return [
      { url: absoluteUrl(urls.tr), lastModified, changeFrequency, priority, alternates },
      { url: absoluteUrl(urls.en), lastModified, changeFrequency, priority: lower, alternates },
      ...(urls.de ? [{ url: absoluteUrl(urls.de), lastModified, changeFrequency, priority: lower, alternates }] : []),
    ];
  };
  return [
    ...pages.flatMap(([p, pr, cf]) => group({ tr: p, en: localizedPath(p, "en"), de: localizedPath(p, "de") }, pr, cf, updated)),
    ...POSTS.flatMap((p) => group({ tr: postPath(p, "tr"), en: postPath(p, "en"), de: DE_POSTS[p.slug] ? postPath(p, "de") : undefined }, 0.7, "monthly", p.date)),
  ];
}
