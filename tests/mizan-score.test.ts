import { describe, expect, it } from "vitest";
import { scoreBench } from "@/lib/quality/mizan-score";
import data from "@/lib/quality/mizan-bench-data.json";

describe("Mizan doğruluk ölçümü puanlaması (D213)", () => {
  it("isabet, sorun yakalama, yanlış alarm ve tehlikeli kaçırmayı hesaplar", () => {
    const s = scoreBench([
      { id: "a", label: "supports", predicted: "supports" },
      { id: "b", label: "supports", predicted: "partial" },
      { id: "c", label: "contradicts", predicted: "contradicts" },
      { id: "d", label: "contradicts", predicted: "supports" },
      { id: "e", label: "partial", predicted: "not_supported" },
    ]);
    expect(s.exactPct).toBe(40);
    expect(s.detectionPct).toBe(66.7);
    expect(s.falseAlarmPct).toBe(50);
    expect(s.dangerousIds).toEqual(["d"]);
    const sup = s.perClass.find((c) => c.label === "supports")!;
    expect([sup.tp, sup.fp, sup.fn]).toEqual([1, 1, 1]);
    expect(sup.precision).toBe(0.5); expect(sup.recall).toBe(0.5); expect(sup.f1).toBe(0.5);
    expect(sup.fpIds).toEqual(["d"]); expect(sup.fnIds).toEqual(["b"]);
    expect(s.issue.fpIds).toEqual(["b"]); expect(s.issue.fnIds).toEqual(["d"]);
    expect(s.issue.precision).toBe(0.667); expect(s.issue.recall).toBe(0.667);
  });
  it("test seti gerçek makalelerden oluşur ve her iddianın etiketi geçerlidir", () => {
    expect(data.articles.length).toBe(20);
    const claims = data.articles.flatMap((a) => a.claims);
    expect(claims.length).toBe(200);
    expect(new Set(claims.map((c) => c.id)).size).toBe(200);
    for (const l of ["supports", "partial", "not_supported", "contradicts"]) expect(claims.filter((c) => c.label === l).length).toBe(50);
    for (const a of data.articles) { expect(a.pmcid).toMatch(/^PMC\d+$/); expect(a.chunks.length).toBeGreaterThan(15); expect(a.doi).toBeTruthy(); }
    for (const c of claims) expect(["supports", "partial", "not_supported", "contradicts"]).toContain(c.label);
  });
});
