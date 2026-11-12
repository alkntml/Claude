import { describe, expect, it } from "vitest";
import { filterByPrefs, isPreprint, promptStrength, readResearchPrefs } from "@/lib/research-prefs";

/** D149: araştırma tercihleri ve istem gücü */
describe("araştırma tercihleri", () => {
  it("varsayılan ve geçersiz değerler", () => {
    expect(readResearchPrefs(null)).toEqual({ mode: "auto", yearFrom: null, minCitations: 0, preprints: true });
    expect(readResearchPrefs({ research: { mode: "ask", yearFrom: 2021, minCitations: 20, preprints: false } })).toEqual({ mode: "ask", yearFrom: 2021, minCitations: 20, preprints: false });
    expect(readResearchPrefs({ research: { mode: "x", yearFrom: 50, minCitations: -3 } })).toMatchObject({ mode: "auto", yearFrom: null, minCitations: 0 });
  });
  it("yıl, atıf ve ön baskı filtresi; atıf sayısı bilinmeyen elenmez", () => {
    const base = { type: "article-journal" as const, origins: [], arxivId: null, publisher: null };
    const rs = [
      { ...base, title: "a", year: 2023, citedByCount: 50, containerTitle: "J" },
      { ...base, title: "b", year: 2015, citedByCount: 500, containerTitle: "J" },
      { ...base, title: "c", year: 2024, citedByCount: 2, containerTitle: "J" },
      { ...base, title: "d", year: 2024, citedByCount: null, containerTitle: "DergiPark" },
      { ...base, title: "e", year: 2024, citedByCount: 90, containerTitle: "arXiv" },
    ];
    const out = filterByPrefs(rs, { mode: "auto", yearFrom: 2020, minCitations: 20, preprints: false }).map((r) => r.title);
    expect(out).toEqual(["a", "d"]);
    expect(isPreprint({ ...base, containerTitle: "bioRxiv" })).toBe(true);
    expect(isPreprint({ ...base, containerTitle: "Journal of Psychology" })).toBe(false);
  });
  it("istem gücü", () => {
    expect(promptStrength("").level).toBe("empty");
    expect(promptStrength("elektrikli araçlar").level).toBe("weak");
    expect(promptStrength("Üniversite öğrencilerinde sosyal medya kullanımı ile benlik saygısı arasındaki ilişki üzerine anket ile nicel bir araştırma").level).toBe("strong");
  });
});
