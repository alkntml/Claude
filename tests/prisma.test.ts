import { describe, expect, it } from "vitest";
import { canMove, prismaCounts, prismaSvg, recordKey, reviewCsv, type ReviewRecord } from "@/lib/prisma";

const R = (stage: ReviewRecord["stage"], origin = "OpenAlex", reason: string | null = null): ReviewRecord => ({ id: Math.random().toString(36), key: "k", origin, stage, reason, record: { title: "T" } });

describe("PRISMA 2020 modülü (D122)", () => {
  it("yinelenen anahtarı DOI’yi veya başlık+yılı sadeleştirir", () => {
    expect(recordKey({ doi: "https://doi.org/10.1/ABC", title: "x" })).toBe("doi:10.1/abc");
    expect(recordKey({ title: "Öğretmen  Öz-yeterliği!", year: 2020 })).toBe(recordKey({ title: "ogretmen oz yeterligi", year: 2020 }));
  });
  it("akış şeması sayılarını PRISMA 2020 tanımlarına göre hesaplar", () => {
    const recs = [R("identified"), R("duplicate", "Crossref"), R("excluded_screening"), R("sought"), R("not_retrieved"), R("excluded_eligibility", "OpenAlex", "Yanlış örneklem"), R("excluded_eligibility", "OpenAlex", "Yanlış örneklem"), R("included"), R("included", "DergiPark")];
    const c = prismaCounts(recs);
    expect(c).toMatchObject({ identified: 9, duplicates: 1, screened: 8, excludedScreening: 1, pendingScreening: 1, sought: 6, notRetrieved: 1, assessed: 5, pendingEligibility: 1, excludedEligibilityTotal: 2, included: 2 });
    expect(c.byOrigin).toEqual({ OpenAlex: 7, Crossref: 1, DergiPark: 1 });
    expect(c.excludedEligibility).toEqual({ "Yanlış örneklem": 2 });
  });
  it("aşama atlamayı engeller; şema ve CSV üretilir", () => {
    expect(canMove("identified", "included")).toBe(false);
    expect(canMove("sought", "included")).toBe(true);
    const { svg, height } = prismaSvg(prismaCounts([R("included")]), "tr");
    expect(svg).toContain("Derlemeye dahil edilen çalışmalar (n = 1)");
    expect(height).toBeGreaterThan(300);
    expect(reviewCsv([R("included")], (s) => s)).toContain("\"included\"");
  });
});
