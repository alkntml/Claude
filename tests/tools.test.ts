import { describe, expect, it } from "vitest";
import { cochran, meanSample, toReach, yamane } from "@/lib/tools/sample-size";
import { alphaVerdict, parseNumericTable, reverseScore } from "@/lib/tools/table-parse";
import { cronbachAlpha } from "@/lib/stats/tests";

describe("ücretsiz araçlar: hesaplamalar (D90)", () => {
  it("örneklem: Cochran, sonlu evren düzeltmesi, Yamane, ortalama ve yanıt oranı", () => {
    expect(cochran({ population: null, confidence: 95, margin: 5 }).n).toBe(385);
    expect(cochran({ population: 1000, confidence: 95, margin: 5 }).n).toBe(278);
    expect(cochran({ population: 10000, confidence: 99, margin: 5 }).n).toBe(623);
    expect(yamane(1000, 5)).toBe(286);
    expect(meanSample(15, 2, 95)).toBe(217);
    expect(toReach(278, 40)).toBe(695);
    expect(() => cochran({ population: null, confidence: 95, margin: 0 })).toThrow();
  });
  it("tablo: başlık, ondalık virgül, sekme/noktalı virgül, eksik satır", () => {
    const t = parseNumericTable("M1\tM2\tM3\n4\t5\t4\n3\t3\t\n2,5\t2\t3\n5\t4\t5");
    expect(t.names).toEqual(["M1", "M2", "M3"]);
    expect(t.rows).toEqual([[4, 5, 4], [2.5, 2, 3], [5, 4, 5]]);
    expect(t.dropped).toBe(1);
    expect(parseNumericTable("1;2\n3;4").names).toEqual(["M1", "M2"]);
    expect(reverseScore([[1, 5]], [1], 1, 5)).toEqual([[1, 1]]);
  });
  it("alfa: bilinen veriyle hesap ve yorum", () => {
    const rows = [[4, 4, 5], [3, 3, 3], [5, 5, 4], [2, 3, 2], [4, 5, 5], [1, 2, 1]];
    const r = cronbachAlpha(rows, ["a", "b", "c"]);
    expect(r.alpha).toBeGreaterThan(0.9);
    expect(alphaVerdict(r.alpha)).toBe("Mükemmel");
    expect(alphaVerdict(0.72)).toBe("Kabul edilebilir");
  });
});

import { isnadTitleCase } from "@/lib/citations/styles";
describe("ISNAD büyük harf kuralı başlığın diline göre (D90)", () => {
  it("İngilizce başlıkta i → I, Türkçe başlıkta i → İ", () => {
    expect(isnadTitleCase("A study of employee acceptance of artificial intelligence technology", "tr")).toBe("A Study of Employee Acceptance of Artificial Intelligence Technology");
    expect(isnadTitleCase("yapay zekâ ve iletişim üzerine bir inceleme", "tr")).toBe("Yapay Zekâ ve İletişim Üzerine Bir İnceleme");
  });
});
