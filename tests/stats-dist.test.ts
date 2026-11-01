import { describe, expect, it } from "vitest";
import { chi2RightTail, fRightTail, normalCdf, tCritical, tTwoTailed, zCritical } from "@/lib/stats/dist";

describe("dağılım fonksiyonları (bilinen tablo değerleri)", () => {
  it("t dağılımı", () => {
    expect(tTwoTailed(2.228, 10)).toBeCloseTo(0.05, 3);
    expect(tTwoTailed(2.0, 10)).toBeCloseTo(0.0734, 4);
    expect(tTwoTailed(1.96, 1e6)).toBeCloseTo(0.05, 3);
    expect(tTwoTailed(0, 5)).toBeCloseTo(1, 6);
    expect(tCritical(10)).toBeCloseTo(2.228, 3);
    expect(tCritical(30)).toBeCloseTo(2.042, 3);
  });
  it("F dağılımı", () => {
    expect(fRightTail(3.098, 3, 20)).toBeCloseTo(0.05, 3);
    expect(fRightTail(27, 2, 6)).toBeCloseTo(0.001, 3);
    expect(fRightTail(4.965, 1, 10)).toBeCloseTo(0.05, 3);
  });
  it("ki-kare ve normal", () => {
    expect(chi2RightTail(3.841, 1)).toBeCloseTo(0.05, 3);
    expect(chi2RightTail(5.991, 2)).toBeCloseTo(0.05, 3);
    expect(chi2RightTail(18.307, 10)).toBeCloseTo(0.05, 3);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 4);
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 4);
    expect(zCritical()).toBeCloseTo(1.96, 2);
  });
});
