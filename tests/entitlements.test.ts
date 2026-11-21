/** D236: her paketin hangi özellikleri açtığı (satın alan kişiye doğru hakların tanımlandığından emin olmak için) */
import { describe, expect, it } from "vitest";
import { FEATURE_MIN_PLAN, hasFeature, PLAN_EXTRA_FEATURES, type FeatureId } from "@/lib/features";
import { hasYearlyOption, PLAN_RANK } from "@/lib/pricing";

const ALL = Object.keys(FEATURE_MIN_PLAN) as FeatureId[];
const BASIC: FeatureId[] = ["quality_ai", "stats", "surveys", "bib_io", "topics"];

describe("paket → özellik tablosu", () => {
  const expected: Record<string, FeatureId[]> = {
    free: [],
    istatistik: ["stats"],
    basic: BASIC,
    pro: ALL, premium: ALL, single: ALL,
  };
  for (const [plan, feats] of Object.entries(expected)) {
    it(`${plan}: yalnızca beklenen özellikler açık`, () => {
      for (const f of ALL) expect(hasFeature(plan, f), `${plan} / ${f}`).toBe(feats.includes(f));
    });
  }
  it("istatistik paketi yalnızca istatistik analizlerini ve grafiklerini açar", () => {
    expect(PLAN_EXTRA_FEATURES.istatistik).toEqual(["stats"]);
    expect(hasFeature("istatistik", "stats")).toBe(true);
    for (const f of ALL.filter((x) => x !== "stats")) expect(hasFeature("istatistik", f)).toBe(false);
  });
  it("bilinmeyen veya boş paket kimliği ücretsiz sayılır (hiçbir özellik açılmaz)", () => {
    for (const f of ALL) { expect(hasFeature(undefined, f)).toBe(false); expect(hasFeature("yok", f)).toBe(false); }
  });
  it("sıra: ücretsiz < istatistik < basic < pro < premium < sınırsız proje; istatistik yalnızca aylık", () => {
    const order = ["free", "istatistik", "basic", "pro", "premium", "single"].map((p) => PLAN_RANK[p]);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(new Set(order).size).toBe(order.length);
    expect(hasYearlyOption("istatistik", 1)).toBe(false);
    expect(hasYearlyOption("basic", 749)).toBe(true);
  });
});
