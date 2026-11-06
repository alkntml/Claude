import { describe, expect, it } from "vitest";
import { EN_POSTS, POSTS } from "@/lib/blog";
import { fitTitle, PUBLIC_PATHS } from "@/lib/seo";
import { PAGE_SEO } from "@/lib/seo-pages";
import { TOOLS } from "@/lib/tools";
import { TOOL_GUIDES } from "@/lib/tools/guides";

const allTitles = () => [
  ...POSTS.map((p) => p.seoTitle ?? p.title),
  ...Object.values(EN_POSTS).map((e) => e.seoTitle ?? e.title),
  ...Object.values(PAGE_SEO).flatMap((s) => [s.title.tr, s.title.en]),
];

describe("SEO kalitesi (D107)", () => {
  it("arama sonucu başlıkları 60 karakteri aşmaz ve yarım kelimeyle bitmez", () => {
    for (const t of allTitles()) {
      const f = fitTitle(t);
      expect(f.length, f).toBeLessThanOrEqual(60);
      expect(f.length, f).toBeGreaterThan(15);
      expect(f, t).not.toMatch(/\s(ve|ile|and|with|for|the|of|in|on|to|a|bir)$/i);
    }
    expect(fitTitle("Tez Nasıl Yazılır? Konu Seçiminden Savunmaya Adım Adım Kapsamlı Bir Rehber")).toBe("Tez Nasıl Yazılır? | Academiana");
    expect(fitTitle("Kısa Başlık | Academiana")).toBe("Kısa Başlık | Academiana");
  });
  it("meta açıklamalar 160 karakteri aşmaz (arama sonucunda kesilmez)", () => {
    for (const p of POSTS) expect(p.description.length, p.slug).toBeLessThanOrEqual(160);
    for (const [k, e] of Object.entries(EN_POSTS)) expect(e.description.length, k).toBeLessThanOrEqual(160);
    for (const [k, s] of Object.entries(PAGE_SEO)) for (const l of ["tr", "en"] as const) {
      if (s.noindex) continue;
      expect(s.description[l].length, `${k} ${l}`).toBeLessThanOrEqual(160);
      expect(s.description[l].length, `${k} ${l}`).toBeGreaterThan(70);
    }
  });
  it("her herkese açık sayfanın arama metni var", () => {
    for (const p of PUBLIC_PATHS) expect(PAGE_SEO[p], p).toBeTruthy();
  });
  it("her ücretsiz aracın iki dilde rehberi ve en az 3 sık sorulan sorusu var; bağlantılar site içi", () => {
    for (const tool of TOOLS) {
      const g = TOOL_GUIDES[tool.path];
      expect(g, tool.path).toBeTruthy();
      for (const l of ["tr", "en"] as const) {
        expect(g[l].sections.length).toBeGreaterThanOrEqual(2);
        expect(g[l].faq.length).toBeGreaterThanOrEqual(3);
        const text = JSON.stringify(g[l]);
        for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
          expect(m[1].startsWith("/"), m[1]).toBe(true);
          expect(m[1].startsWith("/en/") || l === "tr", `${tool.path} ${l} ${m[1]}`).toBe(true);
        }
      }
    }
  });
  it("araç rehberlerindeki blog bağlantıları var olan yazılara gider", () => {
    const tr = new Set(POSTS.map((p) => p.slug)), en = new Set(Object.values(EN_POSTS).map((e) => e.slug));
    for (const g of Object.values(TOOL_GUIDES)) for (const l of ["tr", "en"] as const)
      for (const m of JSON.stringify(g[l]).matchAll(/\]\((\/(?:en\/)?blog\/[^)]+)\)/g)) {
        const u = m[1];
        expect(u.startsWith("/en/") ? en.has(u.slice(9)) : tr.has(u.slice(6)), u).toBe(true);
      }
  });
});
