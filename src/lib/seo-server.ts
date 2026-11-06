import "server-only";
import type { Metadata } from "next";
import { getLocale } from "@/i18n/server";
import type { Locale } from "@/i18n";
import { PAGE_SEO } from "./seo-pages";
import { absoluteUrl, fitTitle, localizedPath } from "./seo";
import { SITE_NAME } from "./site";

export interface MetaInput {
  /** Türkçe (öneksiz) yol */
  path: string;
  title: { tr: string; en: string };
  description: { tr: string; en: string };
  keywords?: { tr: string[]; en: string[] };
  tagline?: { tr: string; en: string };
  /** Dillerde farklı yol (ör. blog yazısının İngilizce adresi) */
  paths?: { tr: string; en: string };
  type?: "website" | "article";
  publishedTime?: string;
  section?: string;
  noindex?: boolean;
}

export const ogImage = (title: string, sub: string, locale: Locale) => `/api/og?${new URLSearchParams({ t: title.slice(0, 120), s: sub.slice(0, 90), l: locale })}`;

/** Sayfa meta verisi: başlık, açıklama, anahtar kelimeler, canonical, hreflang, Open Graph, Twitter */
export function buildMeta(m: MetaInput, locale: Locale): Metadata {
  const trPath = m.paths?.tr ?? m.path;
  const enPath = m.paths?.en ?? localizedPath(m.path, "en");
  const self = locale === "en" ? enPath : trPath;
  const title = m.title[locale];
  const description = m.description[locale];
  const img = ogImage(title.replace(/\s*\|\s*Academiana$/, ""), (m.tagline ?? { tr: "academiana.com.tr", en: "academiana.com.tr" })[locale], locale);
  return {
    // <title> arama sonucunda kesilmeyecek uzunlukta; paylaşım kartlarında (OG/Twitter) tam başlık
    title: { absolute: fitTitle(title) },
    description,
    keywords: m.keywords?.[locale],
    alternates: {
      canonical: self, languages: { tr: trPath, en: enPath, "x-default": trPath },
      // Blog sayfalarında RSS beslemesi (D107)
      ...(trPath.startsWith("/blog") ? { types: { "application/rss+xml": [{ url: locale === "en" ? "/en/blog/rss.xml" : "/blog/rss.xml", title: `${SITE_NAME} Blog` }] } } : {}),
    },
    robots: m.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      type: m.type ?? "website",
      siteName: SITE_NAME,
      url: absoluteUrl(self),
      title,
      description,
      locale: locale === "en" ? "en_US" : "tr_TR",
      alternateLocale: locale === "en" ? ["tr_TR"] : ["en_US"],
      images: [{ url: img, width: 1200, height: 630, alt: title }],
      ...(m.type === "article" ? { publishedTime: m.publishedTime, modifiedTime: m.publishedTime, section: m.section, authors: [`${SITE_NAME}`] } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [img] },
  };
}

/** Kayıtlı herkese açık sayfa için meta (PAGE_SEO) */
export async function pageMeta(path: keyof typeof PAGE_SEO | string): Promise<Metadata> {
  const s = PAGE_SEO[path];
  const locale = await getLocale();
  return buildMeta({ path, ...s }, locale);
}
