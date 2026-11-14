/**
 * D198 — Dizine alınmayan iki yazı genişletildi (kaynakça, literatür taraması). Kaynakça yazısındaki yedi stil örneği
 * atıf motorunun çıktısıyla üç dilde birebir aynı olmalı; örnek kaynak kurgusaldır ve uydurma DOI içermez.
 */
import { describe, expect, it } from "vitest";
import { CitationEngine, type CitationItem } from "@/lib/citations";
import { richToPlain } from "@/lib/citations/util";
import { DE_POSTS, EN_POSTS, getPost, parseBody } from "@/lib/blog";

const items: CitationItem[] = [
  { id: "m", type: "article-journal", title: "Üniversite öğrencilerinde sosyal medya kullanımı ve akademik erteleme", authors: [{ family: "Demir", given: "Mehmet" }, { family: "Kaya", given: "Elif" }], year: 2022, containerTitle: "Örnek Eğitim Dergisi", volume: "12", issue: "3", pages: "45-62" },
];
const STYLES = ["apa7", "mla", "chicago", "ieee", "vancouver", "isnad", "isnad_note"] as const;
const body = (slug: string, loc: "tr" | "en" | "de") => (loc === "tr" ? getPost(slug)!.body : loc === "en" ? EN_POSTS[slug].body : DE_POSTS[slug].body);

describe("D198 genişletilen yazılar", () => {
  it("kaynakça yazısındaki örnekler atıf motoruyla aynı (üç dil)", () => {
    for (const loc of ["tr", "en", "de"] as const) {
      const b = body("kaynakca-nasil-hazirlanir", loc);
      for (const st of STYLES) {
        const e = new CitationEngine(st, items, { locale: loc });
        const outs = st === "isnad_note" ? [e.note(["m"], { locator: "50" }, true), e.note(["m"], { locator: "52" }, false)] : [e.cite(["m"], { locator: "50" })];
        for (const o of outs) expect(b, `${loc} ${st}`).toContain(richToPlain(o));
        expect(b, `${loc} ${st} kaynakça`).toContain(richToPlain(e.bibliography()[0].rich));
      }
      expect(b).not.toMatch(/doi\.org\/10\.0000/);
    }
  });
  it("iki yazı uzun, güncel, kaynaklı ve tablolu", () => {
    for (const slug of ["kaynakca-nasil-hazirlanir", "literatur-taramasi-nasil-yapilir"]) {
      const p = getPost(slug)!;
      expect(p.updated).toBe("2026-11-14");
      expect(p.sources!.length).toBeGreaterThanOrEqual(5);
      for (const loc of ["tr", "en", "de"] as const) {
        const b = body(slug, loc);
        expect(b.split(/\s+/).length, `${slug} ${loc}`).toBeGreaterThan(1100);
        expect(parseBody(b).some((x) => x.t === "table")).toBe(true);
        expect(b).not.toContain("ISNAD 2. edisyonun metin içi (yazar-tarih) biçimini destekler");
      }
    }
  });
});
