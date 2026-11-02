import { describe, expect, it } from "vitest";
import { combine, ruleIssues } from "@/lib/quality/stage-review";

const T = (s: string) => s;
const bundle = { project: { language: "tr", title: "X" }, sources: [] as unknown[], stages: [] as unknown[] };
const stage = (text: string) => ({ id: "a", key: "introduction", title: "Giriş", content_text: text, content: { type: "doc", content: [] } });

describe("bölüm kontrolü", () => {
  it("kaynak ve veri yer tutucuları hata olarak yakalanır", () => {
    const r = ruleIssues(bundle, stage("Bu bir iddia [KAYNAK GEREKLİ]. Ortalama [VERİ GİRİLECEK] bulundu. ".repeat(10)), "tr");
    expect(r.filter((i) => i.severity === "error").map((i) => i.title)).toEqual(expect.arrayContaining(["Kaynak bekleyen iddialar", "Doldurulmamış veri alanları"]));
  });
  it("karar: kural hatası yapay zekâ “ok” dese bile düşürülmez", () => {
    const rules = [{ severity: "error" as const, title: "x", detail: "y", source: "rule" as const }];
    expect(combine(rules, { verdict: "ok", summary: "iyi", strengths: [], issues: [] }, T).verdict).toBe("major");
    expect(combine([], { verdict: "minor", summary: "s", strengths: ["a"], issues: [] }, T).verdict).toBe("minor");
    expect(combine([], null, T)).toMatchObject({ verdict: "ok", aiRan: false });
  });
});
