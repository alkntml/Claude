import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DE_POSTS, EN_POSTS, getPost, POSTS, relatedPosts } from "@/lib/blog";
import { CitationEngine, richToPlain, type CitationItem } from "@/lib/citations";
import { describe as describeStats, independentT, pairedT } from "@/lib/stats/tests";

const root = path.resolve(__dirname, "..");

describe("SEO teknik düzeltmeler (D164)", () => {
  it("arama motoru botlarına meta veriler <head> içinde gönderilir (htmlLimitedBots)", () => {
    const cfg = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");
    const m = cfg.match(/htmlLimitedBots:\s*(\/.+\/i),/);
    expect(m).toBeTruthy();
    const re = eval(m![1]) as RegExp;
    for (const ua of ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Mozilla/5.0 (compatible; bingbot/2.0)", "Mozilla/5.0 (Linux; Android 6.0.1) Chrome-Lighthouse", "facebookexternalhit/1.1", "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Google-InspectionTool/1.0)"]) expect(re.test(ua), ua).toBe(true);
    expect(re.test("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36")).toBe(false);
  });

  it("arayüz sözlüğü her sayfanın HTML’ine gömülmez (EN/DE sayfa boyutu); istemci ayrı parçadan yükler", () => {
    const layout = fs.readFileSync(path.join(root, "src/app/layout.tsx"), "utf8");
    expect(layout).not.toMatch(/dict=\{/);
    expect(layout).not.toContain("dictFor");
    const client = fs.readFileSync(path.join(root, "src/i18n/client.tsx"), "utf8");
    expect(client).toContain('import("./en")');
    expect(client).toContain('import("./de")');
    expect(client).not.toMatch(/^import .* from "\.\/(en|de)";/m);
  });

  it("logo gösterim boyutuna uygun küçük görselden yüklenir", () => {
    for (const f of ["academiana-logo-web.png", "academiana-emblem-web.png"]) expect(fs.statSync(path.join(root, "public/brand", f)).size).toBeLessThan(20_000);
    const icons = fs.readFileSync(path.join(root, "src/components/icons.tsx"), "utf8");
    expect(icons).not.toContain("academiana-logo-transparent.png");
  });

  it("ilgili yazılar: her yazı en az iki başka yazıdan bağlantı alır, kendine bağlanmaz, tekrar yok", () => {
    const inbound = new Map(POSTS.map((p) => [p.slug, 0]));
    for (const p of POSTS) {
      const r = relatedPosts(p);
      expect(r.length).toBe(3);
      expect(r.map((x) => x.slug)).not.toContain(p.slug);
      expect(new Set(r.map((x) => x.slug)).size).toBe(3);
      for (const x of r) inbound.set(x.slug, inbound.get(x.slug)! + 1);
    }
    for (const [slug, n] of inbound) expect(n, slug).toBeGreaterThanOrEqual(2);
  });

  it("güncelleme tarihi ve kaynaklar: geçerli tarih, yayın tarihinden önce değil; kaynak adresleri https", () => {
    for (const p of POSTS) {
      if (p.updated) { expect(p.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(p.updated >= p.date, p.slug).toBe(true); }
      for (const s of p.sources ?? []) { expect(s.text.length).toBeGreaterThan(20); if (s.url) expect(s.url).toMatch(/^https:\/\//); }
    }
  });
});

describe("yeni rehberler (D164): sayılar ve atıf örnekleri ürünün motoruyla aynı", () => {
  const A = [72, 85, 78, 90, 66, 81, 77, 88, 74, 83, 79, 86], B = [68, 74, 70, 79, 62, 71, 73, 76, 65, 72, 69, 75];
  const pre = [12, 15, 11, 14, 10, 13, 16, 12, 14, 11], post = [14, 18, 13, 15, 13, 15, 19, 14, 17, 12];
  const skewed = [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 12, 15, 21];
  const f2 = (x: number) => x.toFixed(2).replace("-", "−");

  it("üç yazı üç dilde var ve kaynak listesi içeriyor", () => {
    for (const slug of ["t-testi-nasil-yapilir-ve-yorumlanir", "normallik-testi-carpiklik-basiklik", "isnad-atif-sistemi-rehberi"]) {
      const p = getPost(slug)!;
      expect(p, slug).toBeTruthy();
      expect(p.sources?.length, slug).toBeGreaterThanOrEqual(2);
      expect(EN_POSTS[slug], slug).toBeTruthy();
      expect(DE_POSTS[slug], slug).toBeTruthy();
    }
  });

  it("t testi yazısındaki değerler", () => {
    const body = getPost("t-testi-nasil-yapilir-ve-yorumlanir")!.body;
    const r = independentT(A, B);
    for (const v of [f2(r.groups[0].mean), f2(r.groups[0].sd), f2(r.groups[1].mean), f2(r.groups[1].sd), f2(r.student.t), f2(r.welch.df), f2(r.cohensD), f2(r.levene.F), f2(r.student.ci[0]), f2(r.student.ci[1])]) expect(body, v).toContain(v);
    expect(r.levene.p).toBeGreaterThan(0.05);
    const pr = pairedT(pre, post);
    for (const v of [f2(pr.t), f2(pr.diffMean), f2(pr.diffSd), f2(pr.ci[0]), f2(pr.ci[1]), f2(Math.abs(pr.cohensDz))]) expect(body, v).toContain(v);
    expect(pr.p).toBeLessThan(0.001);
  });

  it("normallik yazısındaki çarpıklık/basıklık değerleri", () => {
    const body = getPost("normallik-testi-carpiklik-basiklik")!.body;
    for (const d of [describeStats(A), describeStats(skewed)]) for (const v of [d.skewness, d.skewZ, d.kurtosis, d.kurtZ]) expect(body, f2(v)).toContain(f2(v));
  });

  it("ISNAD yazısındaki örnekler atıf motorunun çıktısıyla aynı", () => {
    const items: CitationItem[] = [
      { id: "k", type: "book", title: "örnek eğitim araştırmaları", authors: [{ family: "Yılmaz", given: "Ayşe" }], year: 2021, publisher: "Örnek Yayınları", publisherPlace: "Ankara" },
      { id: "m", type: "article-journal", title: "öğretmen öz yeterliği ve tükenmişlik: bir örnek çalışma", authors: [{ family: "Demir", given: "Mehmet" }, { family: "Kaya", given: "Elif" }], year: 2022, containerTitle: "Örnek Eğitim Dergisi", volume: "14", issue: "2", pages: "45-67", doi: "10.0000/ornek.2022.002" },
      { id: "u", type: "article-journal", title: "an example study", authors: [{ family: "Smith", given: "John" }, { family: "Brown", given: "Anna" }, { family: "Lee", given: "Min" }, { family: "Garcia", given: "Luis" }], year: 2020, containerTitle: "Example Journal", volume: "8", issue: "1", pages: "1-20" },
    ];
    const plain = (s: string) => s.replace(/\*/g, "");
    const tr = plain(getPost("isnad-atif-sistemi-rehberi")!.body), en = plain(EN_POSTS["isnad-atif-sistemi-rehberi"].body);
    for (const [loc, body] of [["tr", tr], ["en", en]] as const) {
      const e = new CitationEngine("isnad", items, { locale: loc });
      for (const c of [e.cite(["k"], { locator: "45" }), e.cite(["m"]), e.cite(["u"]), e.cite(["k", "m"])]) expect(body, loc).toContain(richToPlain(c));
      for (const b of e.bibliography()) expect(body, loc).toContain(richToPlain(b.rich));
    }
  });
});
