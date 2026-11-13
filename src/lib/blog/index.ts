import { POSTS_1 } from "./posts-1";
import { POSTS_2 } from "./posts-2";
import { POSTS_3 } from "./posts-3";
import { POSTS_4 } from "./posts-4";
import { POSTS_5 } from "./posts-5";
import { POSTS_6 } from "./posts-6";
import { POSTS_7 } from "./posts-7";
import { EN_1 } from "./en-1";
import { EN_2 } from "./en-2";
import { EN_3 } from "./en-3";
import { EN_4 } from "./en-4";
import { EN_5 } from "./en-5";
import { EN_6 } from "./en-6";
import { EN_7 } from "./en-7";
import { DE_POSTS as DE_ALL } from "./de";
import type { BlogPost, BlogPostEn } from "./types";
import type { Locale } from "@/i18n";

export type { BlogPost, BlogPostEn } from "./types";

export const POSTS: BlogPost[] = [...POSTS_1, ...POSTS_2, ...POSTS_3, ...POSTS_4, ...POSTS_5, ...POSTS_6, ...POSTS_7];
export const CATEGORIES = [...new Set(POSTS.map((p) => p.category))];

/** İngilizce sürümler (anahtar: Türkçe adres) */
export const EN_POSTS: Record<string, BlogPostEn> = { ...EN_1, ...EN_2, ...EN_3, ...EN_4, ...EN_5, ...EN_6, ...EN_7 };
/** Almanca sürümler (anahtar: Türkçe adres; D143). Almancası olmayan yazı Almanca sitede İngilizce gösterilir. */
export const DE_POSTS: Record<string, BlogPostEn> = DE_ALL;
const TRANSLATED: Record<"en" | "de", Record<string, BlogPostEn>> = { en: EN_POSTS, de: DE_POSTS };

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

/** Adres hangi dilde olursa olsun yazıyı bulur */
export function findPost(slug: string): { post: BlogPost; lang: Locale } | null {
  const tr = POSTS.find((p) => p.slug === slug);
  if (tr) return { post: tr, lang: "tr" };
  for (const l of ["de", "en"] as const) {
    const x = POSTS.find((p) => TRANSLATED[l][p.slug]?.slug === slug);
    if (x) return { post: x, lang: l };
  }
  return null;
}

/** Yazının bu dilde gösterilecek sürümünün dili: Almancası yoksa İngilizce, İngilizcesi yoksa Türkçe */
export function postLang(p: BlogPost, locale: Locale): Locale {
  if (locale === "de" && DE_POSTS[p.slug]) return "de";
  if (locale !== "tr" && EN_POSTS[p.slug]) return "en";
  return "tr";
}

/** Yazının istenen dildeki içeriği (yoksa yukarıdaki sırayla) */
export function localizePost(p: BlogPost, locale: Locale): BlogPost & { lang: Locale } {
  const l = postLang(p, locale);
  if (l === "tr") return { ...p, lang: "tr" };
  const e = TRANSLATED[l][p.slug];
  return { ...p, slug: e.slug, title: e.title, seoTitle: e.seoTitle, description: e.description, keywords: e.keywords, body: e.body, cta: { ...p.cta, text: e.cta.text, label: e.cta.label }, lang: l };
}

/** Yazının dildeki tam yolu: /blog/<tr>, /en/blog/<en> veya /de/blog/<de> */
export function postPath(p: BlogPost, locale: Locale): string {
  const l = postLang(p, locale);
  return l === "tr" ? `/blog/${p.slug}` : `/${l}/blog/${TRANSLATED[l][p.slug].slug}`;
}

/** Okuma süresi (dakika): ortalama 200 kelime/dakika */
export function readingMinutes(p: BlogPost): number {
  return Math.max(2, Math.ceil(p.body.split(/\s+/).length / 180));
}

/** Aynı kategoriden (yetmezse diğerlerinden) ilgili yazılar */
/**
 * İlgili yazılar (D164): önce aynı kategoride, yazının kategori içindeki komşuları (döngüsel: sonraki, önceki, …),
 * sonra ortak anahtar kelimesi en çok olan diğer yazılar. Böylece her yazı en az iki yazıdan bağlantı alır
 * (eskiden kategorinin ilk üç yazısı hep seçiliyor, sonrakiler hiç bağlantı almıyordu).
 */
export function relatedPosts(p: BlogPost, n = 3): BlogPost[] {
  const cat = POSTS.filter((x) => x.category === p.category);
  const i = cat.findIndex((x) => x.slug === p.slug);
  const ring: BlogPost[] = [];
  for (let k = 1; k < cat.length && ring.length < n; k++) {
    for (const j of [i + k, i - k]) {
      const x = cat[((j % cat.length) + cat.length) % cat.length];
      if (x.slug !== p.slug && !ring.includes(x) && ring.length < n) ring.push(x);
    }
  }
  if (ring.length >= n) return ring;
  const kw = new Set(p.keywords.map((k) => k.toLocaleLowerCase("tr")));
  const score = (x: BlogPost) => x.keywords.filter((k) => kw.has(k.toLocaleLowerCase("tr"))).length;
  const other = POSTS.filter((x) => x.category !== p.category).map((x, idx) => ({ x, s: score(x), idx })).sort((a, b) => b.s - a.s || a.idx - b.idx).map((o) => o.x);
  return [...ring, ...other].slice(0, n);
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
