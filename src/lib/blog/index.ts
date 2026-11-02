import { POSTS_1 } from "./posts-1";
import { POSTS_2 } from "./posts-2";
import { POSTS_3 } from "./posts-3";
import type { BlogPost } from "./types";

export type { BlogPost } from "./types";

export const POSTS: BlogPost[] = [...POSTS_1, ...POSTS_2, ...POSTS_3];
export const CATEGORIES = [...new Set(POSTS.map((p) => p.category))];

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug);

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
