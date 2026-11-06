import { POSTS_1 } from "./posts-1";
import { POSTS_2 } from "./posts-2";
import { POSTS_3 } from "./posts-3";
import { POSTS_4 } from "./posts-4";
import { POSTS_5 } from "./posts-5";
import { EN_1 } from "./en-1";
import { EN_2 } from "./en-2";
import { EN_3 } from "./en-3";
import { EN_4 } from "./en-4";
import { EN_5 } from "./en-5";
import type { BlogPost, BlogPostEn } from "./types";
import type { Locale } from "@/i18n";

export type { BlogPost, BlogPostEn } from "./types";

export const POSTS: BlogPost[] = [...POSTS_1, ...POSTS_2, ...POSTS_3, ...POSTS_4, ...POSTS_5];
export const CATEGORIES = [...new Set(POSTS.map((p) => p.category))];

/** İngilizce sürümler (anahtar: Türkçe adres) */
export const EN_POSTS: Record<string, BlogPostEn> = { ...EN_1, ...EN_2, ...EN_3, ...EN_4, ...EN_5 };

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

/** Adres hangi dilde olursa olsun yazıyı bulur */
export function findPost(slug: string): { post: BlogPost; lang: Locale } | null {
  const tr = POSTS.find((p) => p.slug === slug);
  if (tr) return { post: tr, lang: "tr" };
  const en = POSTS.find((p) => EN_POSTS[p.slug]?.slug === slug);
  return en ? { post: en, lang: "en" } : null;
}

/** Yazının istenen dildeki içeriği (İngilizcesi yoksa Türkçesi) */
export function localizePost(p: BlogPost, locale: Locale): BlogPost & { lang: Locale } {
  const e = locale === "en" ? EN_POSTS[p.slug] : undefined;
  if (!e) return { ...p, lang: "tr" };
  return { ...p, slug: e.slug, title: e.title, seoTitle: e.seoTitle, description: e.description, keywords: e.keywords, body: e.body, cta: { ...p.cta, text: e.cta.text, label: e.cta.label }, lang: "en" };
}

/** Yazının dildeki tam yolu: /blog/<tr> veya /en/blog/<en> */
export function postPath(p: BlogPost, locale: Locale): string {
  const e = EN_POSTS[p.slug];
  return locale === "en" && e ? `/en/blog/${e.slug}` : `/blog/${p.slug}`;
}

/** Okuma süresi (dakika): ortalama 200 kelime/dakika */
export function readingMinutes(p: BlogPost): number {
  return Math.max(2, Math.ceil(p.body.split(/\s+/).length / 180));
}

/** Aynı kategoriden (yetmezse diğerlerinden) ilgili yazılar */
export function relatedPosts(p: BlogPost, n = 3): BlogPost[] {
  const same = POSTS.filter((x) => x.slug !== p.slug && x.category === p.category);
  const other = POSTS.filter((x) => x.slug !== p.slug && x.category !== p.category);
  return [...same, ...other].slice(0, n);
}

export type Block =
  | { t: "h2" | "h3" | "p" | "quote"; text: string }
  | { t: "ul" | "ol"; items: string[] };

/** Yazı gövdesini bloklara ayırır (basit Markdown alt kümesi) */
export function parseBody(md: string): Block[] {
  const out: Block[] = [];
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length) {
    const l = lines[i].trimEnd();
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("### ")) { out.push({ t: "h3", text: l.slice(4) }); i++; continue; }
    if (l.startsWith("## ")) { out.push({ t: "h2", text: l.slice(3) }); i++; continue; }
    if (l.startsWith("> ")) { out.push({ t: "quote", text: l.slice(2) }); i++; continue; }
    if (/^\s*- /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*- /.test(lines[i])) { items.push(lines[i].replace(/^\s*- /, "")); i++; }
      out.push({ t: "ul", items });
      continue;
    }
    if (/^\d+\. /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && (/^\d+\. /.test(lines[i]) || /^\s{2,}- /.test(lines[i]))) {
        if (/^\s{2,}- /.test(lines[i])) items[items.length - 1] += `\n• ${lines[i].replace(/^\s+- /, "")}`;
        else items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      out.push({ t: "ol", items });
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |> |\s*- |\d+\. )/.test(lines[i])) { para.push(lines[i].trim()); i++; }
    out.push({ t: "p", text: para.join(" ") });
  }
  return out;
}

/** Yazının düz metni (arama ve yapılandırılmış veri için) */
export const plainText = (md: string) => md.replace(/[#*>]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
