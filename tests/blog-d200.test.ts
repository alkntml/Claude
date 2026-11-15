/**
 * D200 — başvuru rehberleri (TÜBİTAK 1001, BAP, 2214-A/2219, NSF GRFP, MSCA PF, Fulbright): üç dilde var, kaynaklı,
 * sınırlar içinde; çağrıdan çağrıya değişen tutar/tarih yazılmaz ve “güncel çağrı” uyarısı bulunur.
 */
import { describe, expect, it } from "vitest";
import { DE_POSTS, EN_POSTS, getPost, parseBody } from "@/lib/blog";

const SLUGS = ["tubitak-1001-arastirma-projesi-nasil-yazilir", "bap-projesi-nasil-hazirlanir", "tubitak-2214-a-2219-yurt-disi-arastirma-bursu", "nsf-grfp-basvurusu-nasil-yazilir", "marie-curie-msca-doktora-sonrasi-burs-basvurusu", "fulbright-bursu-basvurusu-nasil-yapilir"];
const CALL = [/Güncel çağrı belgesini esas alın/, /Always follow the current call document/, /Maßgeblich ist die aktuelle Ausschreibung/];

describe("D200 başvuru rehberleri", () => {
  it("üç dilde var, kaynaklı, başlık/açıklama sınırlarında", () => {
    for (const slug of SLUGS) {
      const p = getPost(slug)!;
      expect(p, slug).toBeTruthy();
      expect(p.category).toBe("Başvuru ve savunma");
      expect(p.sources!.length, slug).toBeGreaterThanOrEqual(1);
      [p, EN_POSTS[slug], DE_POSTS[slug]].forEach((e, i) => {
        expect(e, slug).toBeTruthy();
        expect((e.seoTitle ?? e.title).length, slug).toBeLessThanOrEqual(60);
        expect(e.description.length, slug).toBeLessThanOrEqual(160);
        expect(e.body, slug).toMatch(CALL[i]);
        for (const t of parseBody(e.body)) if (t.t === "table") for (const r of t.rows) expect(r.length).toBe(t.head.length);
      });
    }
  });

  it("tutar, para birimi veya tarih uydurmaz", () => {
    for (const slug of SLUGS) for (const b of [getPost(slug)!.body, EN_POSTS[slug].body, DE_POSTS[slug].body]) {
      expect(b, slug).not.toMatch(/\d[\d.,]*\s*(TL|₺|\$|€|USD|EUR|Euro|dolar|avro)\b|[₺$€]\s*\d/i);
      expect(b, slug).not.toMatch(/\b20\d\d\b/);
    }
  });
});
