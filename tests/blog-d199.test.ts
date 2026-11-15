/**
 * D199 — korelasyon, etki büyüklüğü, ki-kare, DOI ve yapay zekâ beyanı yazıları: TR+EN var, kaynaklı, sınırlar içinde;
 * korelasyon ve ki-kare yazılarındaki sayılar sitenin istatistik motorunun çıktısıyla aynı.
 */
import { describe, expect, it } from "vitest";
import { DE_POSTS, EN_POSTS, getPost, parseBody, plainText } from "@/lib/blog";
import { chiSquareIndependence, pearson, spearman } from "@/lib/stats/tests";

const nz = (x: number) => x.toFixed(2).replace(/^(-?)0\./, "$1.").replace(/^-/, "−");
const np = (x: number) => x.toFixed(3).replace(/^0\./, ".");
const SLUGS = ["korelasyon-analizi-pearson-spearman", "etki-buyuklugu-rehberi-cohen-d-eta-kare", "ki-kare-bagimsizlik-testi-nasil-yapilir", "doi-nedir-nasil-bulunur", "yapay-zeka-kullanim-beyani-nasil-yazilir"];
const both = (slug: string) => [getPost(slug)!.body, EN_POSTS[slug].body, DE_POSTS[slug].body];

describe("D199 yazıları", () => {
  it("TR ve EN var, kaynaklı, başlık/açıklama sınırlarında, tablolar düzgün", () => {
    for (const slug of SLUGS) {
      const p = getPost(slug)!;
      expect(p, slug).toBeTruthy();
      expect(p.sources!.length, slug).toBeGreaterThanOrEqual(2);
      expect(plainText(p.body).split(/\s+/).length, slug).toBeGreaterThanOrEqual(600);
      for (const e of [p, EN_POSTS[slug], DE_POSTS[slug]]) {
        expect(e, slug).toBeTruthy();
        expect((e.seoTitle ?? e.title).length, slug).toBeLessThanOrEqual(60);
        expect(e.description.length, slug).toBeLessThanOrEqual(160);
      }
      for (const b of both(slug)) for (const t of parseBody(b)) if (t.t === "table") for (const r of t.rows) expect(r.length).toBe(t.head.length);
    }
  });

  it("korelasyon yazısındaki değerler motorla aynı", () => {
    const X = [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 20], Y = [52, 61, 54, 57, 58, 66, 60, 70, 62, 65, 73, 59];
    const p12 = pearson(X, Y), s12 = spearman(X, Y), p11 = pearson(X.slice(0, 11), Y.slice(0, 11)), s11 = spearman(X.slice(0, 11), Y.slice(0, 11));
    const vals = [nz(p12.r), np(p12.p), nz(p12.ci[0]), nz(p12.ci[1]), nz(s12.r), np(s12.p), nz(p11.r), np(p11.p), nz(p11.ci[0]), nz(p11.ci[1]), nz(s11.r), np(s11.p), nz(p11.r ** 2)];
    for (const b of both("korelasyon-analizi-pearson-spearman")) for (const v of vals) expect(b, v).toContain(v);
    expect(p12.df).toBe(10);
    expect(p11.df).toBe(9);
  });

  it("ki-kare yazısındaki değerler motorla aynı", () => {
    const g: string[] = [], m: string[] = [];
    const add = (sex: string, counts: number[]) => ["Yüz yüze", "Çevrim içi", "Karma"].forEach((k, i) => { for (let j = 0; j < counts[i]; j++) { g.push(sex); m.push(k); } });
    add("Kadın", [18, 10, 32]); add("Erkek", [28, 18, 14]);
    const r = chiSquareIndependence(g, m);
    expect(r.n).toBe(120);
    expect(r.df).toBe(2);
    expect(r.lowExpectedShare).toBe(0);
    for (const b of both("ki-kare-bagimsizlik-testi-nasil-yapilir")) for (const v of [r.chi2.toFixed(2), np(r.p), nz(r.cramersV)]) expect(b, v).toContain(v);
  });

  it("etki büyüklüğü yazısı diğer yazılardaki değerlerle tutarlı", () => {
    for (const b of both("etki-buyuklugu-rehberi-cohen-d-eta-kare")) for (const v of ["1.46", "2.79", ".33", ".28", ".84", ".65", ".60", ".31"]) expect(b, v).toContain(v);
    expect(getPost("t-testi-nasil-yapilir-ve-yorumlanir")!.body).toContain("1.46");
  });
});
