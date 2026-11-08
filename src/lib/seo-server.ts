import "server-only";
import type { Metadata } from "next";
import { getLocale } from "@/i18n/server";
import { pick, type Locale } from "@/i18n";
import { PAGE_SEO } from "./seo-pages";
import { absoluteUrl, fitTitle, localizedPath } from "./seo";
import { SITE_NAME } from "./site";

export interface MetaInput {
  /** Türkçe (öneksiz) yol */
  path: string;
  /** de verilmezse sayfanın Almanca sürümü yok sayılır (hreflang’e girmez; Almanca istekte İngilizce gösterilir) */
  title: { tr: string; en: string; de?: string };
  description: { tr: string; en: string; de?: string };
  keywords?: { tr: string[]; en: string[]; de?: string[] };
  tagline?: { tr: string; en: string; de?: string };
  /** Dillerde farklı yol (ör. blog yazısının İngilizce/Almanca adresi) */
  paths?: { tr: string; en: string; de?: string };
  type?: "website" | "article";
  publishedTime?: string;
  section?: string;
  noindex?: boolean;
}

export const ogImage = (title: string, sub: string, locale: Locale) => `/api/og?${new URLSearchParams({ t: title.slice(0, 120), s: sub.slice(0, 90), l: locale })}`;

/** Sayfa meta verisi: başlık, açıklama, anahtar kelimeler, canonical, hreflang, Open Graph, Twitter */
export function buildMeta(m: MetaInput, locale: Locale): Metadata {
  const hasDe = m.title.de != null;
  const trPath = m.paths?.tr ?? m.path;
  const enPath = m.paths?.en ?? localizedPath(m.path, "en");
  const dePath = m.paths?.de ?? localizedPath(m.path, "de");
  const self = locale === "en" ? enPath : locale === "de" && hasDe ? dePath : locale === "de" ? enPath : trPath;
  const title = pick(m.title, locale);
  const description = pick(m.description, locale);
  const img = ogImage(title.replace(/\s*\|\s*Academiana$/, ""), m.tagline ? pick(m.tagline, locale) : "academiana.com.tr", locale);
  const og: Record<Locale, string> = { tr: "tr_TR", en: "en_US", de: "de_DE" };
  const langs: Locale[] = hasDe ? ["tr", "en", "de"] : ["tr", "en"];
  return {
    // <title> arama sonucunda kesilmeyecek uzunlukta; paylaşım kartlarında (OG/Twitter) tam başlık
    title: { absolute: fitTitle(title) },
    description,
    keywords: m.keywords ? pick(m.keywords, locale) : undefined,
    alternates: {
      canonical: self, languages: { tr: trPath, en: enPath, ...(hasDe ? { de: dePath } : {}), "x-default": trPath },
      // Blog sayfalarında RSS beslemesi (D107)
      ...(trPath.startsWith("/blog") ? { types: { "application/rss+xml": [{ url: locale === "tr" ? "/blog/rss.xml" : `/${locale === "de" && hasDe ? "de" : "en"}/blog/rss.xml`, title: `${SITE_NAME} Blog` }] } } : {}),
    },
    robots: m.noindex ? { index: false, follow: true } : { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    openGraph: {
      type: m.type ?? "website",
      siteName: SITE_NAME,
      url: absoluteUrl(self),
      title,
      description,
      locale: og[locale],
      alternateLocale: langs.filter((l) => l !== locale).map((l) => og[l]),
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
