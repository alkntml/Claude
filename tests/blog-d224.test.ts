/**
 * D224 — yeni istatistik testleri ve meta-analiz yazıları: üç dilde var, kaynaklı, sınırlar içinde, tablolar düzgün;
 * yazılardaki sayılar sitenin istatistik motorunun çıktısıyla aynı (aynı örnek verilerle yeniden hesaplanır).
 */
import { describe, expect, it } from "vitest";
import { DE_POSTS, EN_POSTS, getPost, parseBody, plainText } from "@/lib/blog";
import { metaAnalysis } from "@/lib/meta";
import { logisticRegression, repeatedAnova, friedmanTest, wilcoxonSignedRank } from "@/lib/stats/tests2";

const nz = (x: number) => x.toFixed(2).replace(/^(-?)0\./, "$1.");
const np = (x: number) => x.toFixed(3).replace(/^0\./, ".");
const SLUGS = [
  "shapiro-wilk-testi-nasil-yapilir-ve-yorumlanir", "tukey-hsd-games-howell-post-hoc-testleri", "fisher-kesin-testi-yates-duzeltmesi",
  "parametrik-olmayan-testler-wilcoxon-friedman-dunn", "iki-yonlu-anova-nasil-yapilir-ve-yorumlanir", "tekrarli-olcumler-anova-kuresellik-mauchly",
  "lojistik-regresyon-nasil-yapilir-ve-raporlanir", "meta-analiz-nasil-yapilir-birlesik-etki-i2",
];
const both = (slug: string) => [getPost(slug)!.body, EN_POSTS[slug].body, DE_POSTS[slug].body];

describe("D224 yazıları", () => {
  it("üç dilde var, kaynaklı, sınırlarda, tablolar düzgün, NaN yok", () => {
    for (const slug of SLUGS) {
      const p = getPost(slug)!;
      expect(p, slug).toBeTruthy();
      expect(p.sources!.length, slug).toBeGreaterThanOrEqual(3);
      expect(plainText(p.body).split(/\s+/).length, slug).toBeGreaterThanOrEqual(350);
      for (const e of [p, EN_POSTS[slug], DE_POSTS[slug]]) {
        expect(e, slug).toBeTruthy();
        expect((e.seoTitle ?? e.title).length, slug).toBeLessThanOrEqual(60);
        expect(e.description.length, slug).toBeLessThanOrEqual(160);
      }
      for (const b of both(slug)) {
        expect(b, slug).not.toMatch(/NaN|undefined|Infinity/);
        let tables = 0;
        for (const t of parseBody(b)) if (t.t === "table") { tables++; for (const r of t.rows) expect(r.length).toBe(t.head.length); }
        expect(tables, slug).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("lojistik regresyon yazısındaki değerler motorla aynı", () => {
    const hrs = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 12, 13, 14, 15];
    const pass = [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1];
    const l = logisticRegression(pass, hrs.map((h) => [h]), ["Saat"]);
    const c = l.coefficients[1];
    const vals = [c.b.toFixed(2), c.or.toFixed(2), c.orCi[0].toFixed(2), c.orCi[1].toFixed(2), l.chi2.toFixed(2), nz(l.nagelkerke), nz(l.auc)];
    for (const b of both("lojistik-regresyon-nasil-yapilir-ve-raporlanir")) for (const v of vals) expect(b, v).toContain(v);
  });

  it("meta-analiz yazısındaki değerler motorla aynı", () => {
    const rows = [[30, 25.5, 6.2, 30, 21.0, 6.0], [45, 22.2, 7.1, 44, 21.2, 7.4], [28, 23.8, 5.8, 27, 20.8, 6.1], [60, 26.0, 6.9, 61, 21.5, 7.0], [22, 25.4, 5.5, 22, 20.9, 5.9], [38, 22.4, 6.6, 40, 21.4, 6.4]];
    const m = metaAnalysis("smd", "random", rows.map((v, i) => ({ id: "s" + i, label: "S" + (i + 1), v: { n1: v[0], m1: v[1], sd1: v[2], n2: v[3], m2: v[4], sd2: v[5] } })));
    const vals = [m.random.est.toFixed(2), m.random.ci[0].toFixed(2), m.random.ci[1].toFixed(2), m.Q.toFixed(2), m.I2.toFixed(1), m.tau2.toFixed(3), np(m.pQ), np(m.egger!.p)];
    for (const b of both("meta-analiz-nasil-yapilir-birlesik-etki-i2")) for (const v of vals) expect(b, v).toContain(v);
    expect(m.k).toBe(6);
  });

  it("tekrarlı ölçümler, Wilcoxon ve Friedman yazıları motorla aynı", () => {
    const rm = [[22, 25, 29], [19, 24, 26], [25, 26, 33], [21, 27, 28], [24, 25, 31], [20, 26, 27], [23, 28, 32], [18, 23, 26], [26, 27, 34], [22, 26, 30]];
    const r = repeatedAnova(rm);
    for (const b of both("tekrarli-olcumler-anova-kuresellik-mauchly")) for (const v of [r.F.toFixed(2), nz(r.epsGG).replace(/^/, "")]) expect(b, v).toContain(v.replace(/^\./, ".") );
    const fr = friedmanTest([[12, 14, 17], [15, 13, 18], [11, 13, 16], [14, 16, 15], [13, 15, 17], [16, 18, 20], [12, 14, 15], [15, 16, 19], [14, 12, 18], [13, 15, 17]]);
    for (const b of both("parametrik-olmayan-testler-wilcoxon-friedman-dunn")) expect(b).toContain(fr.chi2.toFixed(1));
    expect(wilcoxonSignedRank([18, 22, 15, 27, 20, 24, 16, 29, 21, 19, 25, 17], [21, 26, 14, 32, 26, 26, 23, 37, 12, 29, 36, 29]).n).toBe(12);
  });
});
