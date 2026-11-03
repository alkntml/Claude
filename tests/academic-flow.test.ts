import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: () => {} }));
import { asksForSources, focusOf, researchGate } from "@/lib/research";
import { quickActions, minSourcesFor } from "@/lib/workflows/quick-actions";
import { sameHeading, stagePrefixes, subheadingBudget, structureRule } from "@/lib/workflows/structure";
import { numberHeadings } from "@/lib/editor/doc";

describe("kaynak taraması kararı (D75)", () => {
  it("soru, plan ve dil düzeltmede tarama yapılmaz", () => {
    expect(researchGate({ action: "chat", message: "Bu paragraftaki argüman yeterince açık mı?", recentlySearchedFocus: false })).toBe("skip");
    expect(researchGate({ action: "chat", message: "Araştırma sorularım nasıl olmalı?", recentlySearchedFocus: false })).toBe("skip");
    expect(researchGate({ action: "plan", message: "Çalışma planı öner", recentlySearchedFocus: false })).toBe("skip");
    expect(researchGate({ action: "academic_tone", message: "x", recentlySearchedFocus: false })).toBe("skip");
  });
  it("açık istekte her eylemde tarama yapılır", () => {
    for (const m of ["Bu konuda yeni kaynak bul", "literatür tara", "kablo robotları hakkında makale ara", "daha fazla kaynak lazım", "find more papers on cable robots"]) {
      expect(asksForSources(m), m).toBe(true);
      expect(researchGate({ action: "chat", message: m, recentlySearchedFocus: true })).toBe("force");
    }
  });
  it("yazımda planlayıcı karar verir; aynı odak yakın zamanda tarandıysa atlanır", () => {
    expect(researchGate({ action: "draft", message: "Bölümü yaz", recentlySearchedFocus: false })).toBe("planner");
    expect(researchGate({ action: "draft", message: "Bölümü yaz", recentlySearchedFocus: true })).toBe("skip");
  });
  it("odak: toplu yazımda alt başlık, yoksa son alt başlık", () => {
    expect(focusOf("Bu bölümün yalnızca “İş gücü etkisi” alt başlığını yaz.", ["A", "B"])).toBe("İş gücü etkisi");
    expect(focusOf("Bölümü yaz", ["A", "Kayma ve sürtünme"])).toBe("Kayma ve sürtünme");
  });
  it("kapsam için asgari kaynak çalışma türüne göre", () => {
    expect(minSourcesFor("thesis", "master")).toBeGreaterThan(minSourcesFor("research_proposal", "master"));
  });
});

describe("aşamaya özel kısayollar (D75)", () => {
  const base = { lowSources: false, hasData: false, longSection: false };
  it("literatür araştırması yalnızca literatüre dayanan bölümlerde (veya kaynak azken)", () => {
    expect(quickActions("literature", { ...base, longSection: true })).toContain("research");
    expect(quickActions("purpose", base)).not.toContain("research");
    expect(quickActions("sample", base)).not.toContain("research");
    expect(quickActions("sample", { ...base, lowSources: true })).toContain("research");
  });
  it("“Bölümü yaz” her yerde; bölüme özgü kısayollar", () => {
    for (const k of ["topic", "problem", "purpose", "questions", "literature", "method", "sample", "findings", "discussion", "conclusion"]) expect(quickActions(k, base), k).toContain("draft");
    expect(quickActions("questions", base)[0]).toBe("research_questions");
    expect(quickActions("findings", base)).toContain("analysis");
    expect(quickActions("method", base)).toContain("ethics_docs");
    expect(quickActions("literature", base)).not.toContain("ethics_docs");
    expect(quickActions("conclusion", base)).toContain("abstract");
    expect(quickActions("problem", base)).not.toContain("abstract");
  });
  it("kısa bölümde alt başlıklarla yazım önerilmez", () => {
    expect(quickActions("purpose", base)).not.toContain("outline");
    expect(quickActions("literature", { ...base, longSection: true })).toContain("outline");
  });
});

describe("akademik yapı yardımcıları (D76)", () => {
  it("yinelenen başlık tespiti", () => {
    expect(sameHeading("Araştırma Konusunun Belirlenmesi", "Araştırma konusunun belirlenmesi")).toBe(true);
    expect(sameHeading("Araştırmanın Amacı ve Önemi", "Araştırmanın amacı ve önemi")).toBe(true);
    expect(sameHeading("Kayma ve sürtünme", "İş gücü etkisi")).toBe(false);
  });
  it("alt başlık bütçesi: kısa bölümde 0, uzun bölümde kelimeye göre", () => {
    expect(subheadingBudget("purpose", 1200)).toBe(0);
    expect(subheadingBudget("literature", 4800)).toBe(5);
    expect(subheadingBudget("literature", 20000)).toBe(6);
    expect(structureRule("purpose", "Araştırmanın amacı ve önemi")).toContain("ALT BAŞLIK AÇMA");
  });
  it("numaralandırmada düzey atlanmaz", () => {
    expect(numberHeadings([{ level: 1, text: "" }, { level: 3, text: "" }, { level: 3, text: "" }, { level: 2, text: "" }], 4)).toEqual(["4", "4.1", "4.1.1", "4.2"]);
  });
  it("editör numara önekleri belgeyle aynı", () => {
    const stages = [
      { id: "a", key: "topic", title: "Araştırma konusunun belirlenmesi", position: 0 },
      { id: "b", key: "problem", title: "Araştırma probleminin tanımlanması", position: 1 },
      { id: "c", key: "purpose", title: "Araştırmanın amacı ve önemi", position: 2 },
      { id: "d", key: "literature", title: "Literatür taraması", position: 3 },
      { id: "e", key: "findings", title: "Bulgular", position: 4 },
      { id: "f", key: "references", title: "Kaynakça", position: 5 },
    ];
    const defaults = { topic: "Araştırma konusunun belirlenmesi", problem: "Araştırma probleminin tanımlanması", purpose: "Araştırmanın amacı ve önemi", literature: "Literatür taraması", findings: "Bulgular" };
    expect(stagePrefixes(stages, defaults)).toEqual({ a: "1", b: "1.1", c: "1.2", d: "2.1", e: "3" });
  });
});
