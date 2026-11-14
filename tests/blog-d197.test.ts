/**
 * D197 — ANOVA, regresyon ve literatür matrisi yazıları: üç dilde var, kaynak listesi içeriyor, tablolar ayrıştırılıyor;
 * ANOVA ve regresyon yazılarındaki her sayı sitenin istatistik motorunun çıktısıyla aynı.
 */
import { describe, expect, it } from "vitest";
import { DE_POSTS, EN_POSTS, getPost, parseBody, plainText } from "@/lib/blog";
import { bonferroniPosthoc, leveneTest, linearRegression, oneWayAnova, pearson } from "@/lib/stats/tests";

const f2 = (x: number) => x.toFixed(2);
const nz = (x: number) => x.toFixed(2).replace(/^(-?)0\./, "$1.");
const np = (x: number) => x.toFixed(3).replace(/^0\./, ".");
const SLUGS = ["tek-yonlu-anova-nasil-yapilir-ve-raporlanir", "regresyon-analizi-apa-7-raporlama", "literatur-matrisi-nasil-hazirlanir"];
const bodies = (slug: string) => [getPost(slug)!.body, EN_POSTS[slug].body, DE_POSTS[slug].body];

describe("D197 yazıları", () => {
  it("üç dilde var, kaynaklı, en az bir tablo içeriyor; başlık ve açıklama sınırlarında", () => {
    for (const slug of SLUGS) {
      const p = getPost(slug)!;
      expect(p, slug).toBeTruthy();
      expect(p.sources!.length).toBeGreaterThanOrEqual(3);
      expect((p.seoTitle ?? p.title).length).toBeLessThanOrEqual(60);
      expect(p.description.length).toBeLessThanOrEqual(160);
      for (const e of [EN_POSTS[slug], DE_POSTS[slug]]) {
        expect(e, slug).toBeTruthy();
        expect((e.seoTitle ?? e.title).length).toBeLessThanOrEqual(60);
        expect(e.description.length).toBeLessThanOrEqual(160);
      }
      for (const b of bodies(slug)) {
        const tables = parseBody(b).filter((x) => x.t === "table");
        expect(tables.length).toBeGreaterThanOrEqual(1);
        for (const t of tables) if (t.t === "table") for (const r of t.rows) expect(r.length).toBe(t.head.length);
        expect(plainText(b)).not.toContain("|");
      }
    }
  });

  it("ANOVA yazısındaki değerler motorla aynı", () => {
    const g = [[62, 70, 75, 58, 68, 73, 66, 79, 64, 71], [70, 66, 78, 74, 81, 69, 72, 85, 63, 76], [75, 82, 71, 88, 79, 84, 69, 90, 77, 80]];
    const a = oneWayAnova(g), lev = leveneTest(g), ph = bonferroniPosthoc(g, ["A", "B", "C"], a);
    const vals = [...a.groups.flatMap((x) => [f2(x.mean), f2(x.sd)]), f2(a.ssBetween), f2(a.ssWithin), f2(a.ssBetween + a.ssWithin), f2(a.msBetween), f2(a.msWithin),
      `F(2, 27) = ${f2(a.F)}`, np(a.p), nz(a.etaSquared), nz(a.omegaSquared), `F(2, 27) = ${f2(lev.F)}`, np(lev.p), ...ph.flatMap((x) => [f2(Math.abs(x.diff)), np(x.p)])];
    for (const b of bodies(SLUGS[0])) for (const v of vals) expect(b, v).toContain(v);
    expect(lev.p).toBeGreaterThan(0.05);
    expect(ph.filter((x) => x.p < 0.05).length).toBe(1);
  });

  it("regresyon yazısındaki değerler motorla aynı", () => {
    const H = [2, 4, 3, 6, 5, 8, 7, 1, 9, 6, 4, 5, 7, 3, 8, 6, 2, 5, 7, 4];
    const S = [6, 7, 5, 8, 6, 7, 8, 5, 7, 6, 8, 7, 6, 5, 8, 7, 6, 6, 7, 5];
    const Y = [64, 61, 62, 70, 75, 71, 79, 58, 75, 74, 65, 76, 65, 60, 83, 70, 52, 71, 80, 57];
    const m = linearRegression(Y, H.map((h, i) => [h, S[i]]), ["H", "S"]);
    const s1 = linearRegression(Y, H.map((h) => [h]), ["H"]);
    const vals = [`F(2, 17) = ${f2(m.F)}`, nz(m.r2), nz(m.adjR2), `F(1, 18) = ${f2(s1.F)}`, nz(s1.r2), nz(s1.adjR2),
      ...m.coefficients.flatMap((c) => [f2(c.b), f2(c.se), f2(Math.abs(c.t))]), ...s1.coefficients.map((c) => f2(c.b)),
      nz(pearson(H, Y).r), nz(pearson(S, Y).r), nz(pearson(H, S).r)];
    for (const b of bodies(SLUGS[1])) for (const v of vals) expect(b, v).toContain(v);
  });
});
