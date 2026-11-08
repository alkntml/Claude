import { localizePost, POSTS, postPath } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

/** Blog RSS beslemesi (D107): /blog/rss.xml (Türkçe), /en/blog/rss.xml (İngilizce; ara katman x-locale yazar) */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(req: Request) {
  const h = req.headers.get("x-locale");
  const locale = h === "en" || h === "de" ? h : "tr";
  const en = locale !== "tr";
  const de = locale === "de";
  const posts = [...POSTS].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const self = absoluteUrl(en ? `/${locale}/blog/rss.xml` : "/blog/rss.xml");
  const items = posts.map((p) => {
    const l = localizePost(p, locale);
    const url = absoluteUrl(postPath(p, locale));
    return `<item><title>${esc(l.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(`${p.date}T09:00:00+03:00`).toUTCString()}</pubDate><category>${esc(p.category)}</category><description>${esc(l.description)}</description></item>`;
  }).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(de ? `${SITE_NAME}-Blog — Leitfäden für Abschlussarbeiten und wissenschaftliches Schreiben` : en ? `${SITE_NAME} Blog — Thesis and academic writing guides` : `${SITE_NAME} Blog — Tez ve akademik yazım rehberleri`)}</title><link>${absoluteUrl(en ? `/${locale}/blog` : "/blog")}</link><atom:link href="${self}" rel="self" type="application/rss+xml"/><description>${esc(de ? "Praxisnahe Leitfäden zu Abschlussarbeiten, Fachartikeln, Forschungsmethoden und wissenschaftlichem Schreiben." : en ? "Practical guides on theses, research papers, methods and academic writing." : "Tez, makale, araştırma yöntemi ve akademik yazım üzerine uygulamalı rehberler.")}</description><language>${locale}</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=3600" } });
}
