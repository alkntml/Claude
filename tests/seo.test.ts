import { describe, expect, it } from "vitest";
import { BOT_UA, isPublicPath, localizedPath, splitLocale } from "@/lib/seo";
import { EN_POSTS, findPost, localizePost, parseBody, POSTS, postPath } from "@/lib/blog";
import { PAGE_SEO } from "@/lib/seo-pages";
import sitemap from "@/app/sitemap";

describe("dil bazlı adresler", () => {
  it("herkese açık yollar /en önekiyle eşleşir, uygulama yolları dokunulmaz", () => {
    expect(localizedPath("/", "en")).toBe("/en");
    expect(localizedPath("/fiyatlar?paket=pro", "en")).toBe("/en/fiyatlar?paket=pro");
    expect(localizedPath("/#ozellikler", "en")).toBe("/en#ozellikler");
    expect(localizedPath("/en/sss", "tr")).toBe("/sss");
    expect(localizedPath("/en/blog/x", "en")).toBe("/en/blog/x");
    expect(localizedPath("/panel", "en")).toBe("/panel");
    expect(localizedPath("https://x.com/a", "en")).toBe("https://x.com/a");
    expect(splitLocale("/en/blog/a")).toEqual({ locale: "en", path: "/blog/a" });
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/english")).toEqual({ locale: null, path: "/english" });
    expect(isPublicPath("/blog/abc")).toBe(true);
    expect(isPublicPath("/proje/1")).toBe(false);
  });
  it("arama motoru botları tanınır, insan tarayıcıları tanınmaz", () => {
    expect(BOT_UA.test("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(BOT_UA.test("Mozilla/5.0 (compatible; YandexBot/3.0)")).toBe(true);
    expect(BOT_UA.test("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1")).toBe(false);
  });
});

describe("sayfa meta metinleri", () => {
  it("her sayfanın iki dilde başlığı ve uygun uzunlukta açıklaması var", () => {
    for (const [path, s] of Object.entries(PAGE_SEO)) {
      for (const l of ["tr", "en"] as const) {
        expect(s.title[l].length, `${path} ${l}`).toBeGreaterThan(10);
        expect(s.title[l].length, `${path} ${l} başlık`).toBeLessThanOrEqual(75);
        expect(s.description[l].length, `${path} ${l} açıklama`).toBeLessThanOrEqual(170);
      }
    }
  });
});

describe("blog İngilizce sürümleri", () => {
  it("her yazının İngilizcesi var; adresler benzersiz ve Türkçe adreslerle çakışmıyor", () => {
    for (const p of POSTS) expect(EN_POSTS[p.slug], p.slug).toBeTruthy();
    const en = Object.values(EN_POSTS).map((e) => e.slug);
    expect(new Set(en).size).toBe(en.length);
    for (const s of en) { expect(s).toMatch(/^[a-z0-9-]+$/); expect(POSTS.some((p) => p.slug === s)).toBe(false); }
  });
  it("İngilizce içerik eksiksiz ve yapısal olarak tam", () => {
    for (const p of POSTS) {
      const e = localizePost(p, "en");
      expect(e.lang).toBe("en");
      expect(e.description.length).toBeLessThanOrEqual(200);
      expect(parseBody(e.body).filter((b) => b.t === "h2").length).toBeGreaterThanOrEqual(3);
      expect(e.body).not.toMatch(/[ğışĞİŞ]{3,}/); // Türkçe metin kalmamış (özel adlar hariç)
    }
  });
  it("adres iki dilde de çözülür ve doğru yola eşlenir", () => {
    expect(findPost("how-to-write-a-thesis")).toMatchObject({ lang: "en" });
    expect(findPost("tez-nasil-yazilir")).toMatchObject({ lang: "tr" });
    const p = findPost("tez-nasil-yazilir")!.post;
    expect(postPath(p, "en")).toBe("/en/blog/how-to-write-a-thesis");
    expect(postPath(p, "tr")).toBe("/blog/tez-nasil-yazilir");
  });
});

describe("site haritası", () => {
  it("her sayfa TR ve EN adresiyle, hreflang eşleşmeleriyle yer alır", () => {
    const sm = sitemap();
    expect(sm.length).toBe((12 + POSTS.length) * 2);
    const urls = sm.map((x) => x.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://www.academiana.com.tr/en/blog/apa-7-citation-guide");
    expect(sm[0].alternates?.languages).toMatchObject({ tr: "https://www.academiana.com.tr", en: "https://www.academiana.com.tr/en" });
  });
});
