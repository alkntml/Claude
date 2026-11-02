import { describe, expect, it } from "vitest";
import { getPost, parseBody, POSTS, readingMinutes } from "@/lib/blog";

describe("blog", () => {
  it("en az 20 yazı; adresler benzersiz ve düzgün", () => {
    expect(POSTS.length).toBeGreaterThanOrEqual(20);
    const slugs = POSTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });
  it("her yazının başlığı, açıklaması, anahtar kelimesi ve en az 3 ara başlığı var", () => {
    for (const p of POSTS) {
      expect(p.title.length).toBeGreaterThan(20);
      expect(p.description.length).toBeGreaterThan(80);
      expect(p.description.length).toBeLessThanOrEqual(200);
      expect(p.keywords.length).toBeGreaterThanOrEqual(3);
      expect(parseBody(p.body).filter((b) => b.t === "h2").length).toBeGreaterThanOrEqual(3);
      expect(readingMinutes(p)).toBeGreaterThanOrEqual(2);
      expect(p.cta.href.startsWith("/")).toBe(true);
    }
  });
  it("iç bağlantılar yalnızca site içi yollara gider", () => {
    for (const p of POSTS) for (const m of p.body.matchAll(/\]\(([^)]+)\)/g)) expect(m[1].startsWith("/")).toBe(true);
  });
  it("ayrıştırıcı başlık, liste ve paragrafları tanır", () => {
    const b = parseBody("## A\n\nmetin **kalın**\n\n- x\n- y\n\n1. bir\n2. iki\n   - alt");
    expect(b.map((x) => x.t)).toEqual(["h2", "p", "ul", "ol"]);
    expect(getPost("tez-nasil-yazilir")).toBeTruthy();
  });
});
