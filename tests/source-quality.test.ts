import { describe, expect, it } from "vitest";
import { pickForAutoAdd, sameWork, completeRecord } from "@/lib/research";
import { citationPriority } from "@/lib/ai/context";
import { runQualityChecks } from "@/lib/quality/checks";
import type { SourceRecord } from "@/lib/sources/types";

const rec = (o: Partial<SourceRecord>): SourceRecord => ({
  type: "article-journal", title: "Örnek başlık", authors: [{ family: "Kaya", given: "E." }], year: 2021, containerTitle: "Dergi", volume: "3", pages: "1-10",
  origins: ["openalex"], score: 0.5, ...o,
} as SourceRecord);

describe("kaynak seçimi ve kullanımı (D169)", () => {
  it("otomatik seçim: tam metni okunabilecek, doğrulanabilir ve künyesi eksiksiz kaynak önce gelir", () => {
    const meta = rec({ title: "Social media and procrastination one", doi: "10.1/a", score: 0.6 });
    const full = rec({ title: "Sleep quality and screen time two", doi: "10.1/b", oaUrl: "https://x.org/b.pdf", abstract: "x".repeat(60), score: 0.5 });
    const noId = rec({ title: "Academic stress in students three", score: 0.9 });
    const picks = pickForAutoAdd([meta, noId, full], new Set(), 2);
    // D177: tam metni olmayan kaynak, eklenenlerin %40’ını geçemez (1 tam metin → 0 diğer)
    expect(picks.map((p) => p.doi)).toEqual(["10.1/b"]);
    const full2 = rec({ title: "Screen time and attention four", doi: "10.1/c", pmcid: "PMC1", score: 0.4 });
    const full3 = rec({ title: "Smartphone use and memory five", doi: "10.1/d", arxivId: "2101.1", score: 0.3 });
    const five = pickForAutoAdd([meta, noId, full, full2, full3], new Set(), 5);
    expect(five).toHaveLength(5); // 3 tam metin + 2 diğer = %60
    expect(five.filter((p) => p.oaUrl || p.pmcid || p.arxivId).length / five.length).toBeGreaterThanOrEqual(0.6);
  });

  it("projede olan eser (benzer başlık) ve sonuçlar içindeki tekrarlar eklenmez", () => {
    const a = rec({ title: "The effect of feedback timing on self regulation in online learning", doi: "10.1/x", oaUrl: "https://x.org/a.pdf" });
    const b = rec({ title: "The effect of feedback timing on self-regulation in online learning", doi: null });
    const c = rec({ title: "Completely different study about sleep", doi: "10.1/y" });
    expect(sameWork(a, b)).toBe(true);
    const picks = pickForAutoAdd([a, b, c], new Set(), 5, [{ title: "Completely different study about sleep", year: 2021 }]);
    expect(picks.length).toBe(1);
    expect(picks[0].doi).toBe("10.1/x");
  });

  it("künye eksiksiz kontrolü kalite kontrolündeki kuralla aynı", () => {
    expect(completeRecord(rec({ doi: "10.1/a" }))).toBe(true);
    expect(completeRecord(rec({ doi: "10.1/a", volume: null }))).toBe(false);
    expect(completeRecord(rec({ doi: null, url: null }))).toBe(false);
  });

  it("atıf önceliği: tam metin > özet > künye eksik > okunmamış/doğrulanmamış", () => {
    const base = { type: "article-journal", title: "T", authors: [{ family: "A" }], year: 2020, container_title: "J", volume: "1", pages: "1-2", doi: "10.1/z", verified: true };
    expect(citationPriority({ ...base, access_level: "full_text" })).toBe(1);
    expect(citationPriority({ ...base, access_level: "abstract" })).toBe(2);
    expect(citationPriority({ ...base, access_level: "abstract", volume: null })).toBe(3);
    expect(citationPriority({ ...base, access_level: "metadata" })).toBe(4);
    expect(citationPriority({ ...base, access_level: "full_text", verified: false })).toBe(4);
  });

  it("öncelik 1–2 kaynaklar kalite kontrolünde kaynak bulgusu üretmez (yazılım değişmedi)", () => {
    const src = { id: "s1", type: "article-journal" as const, title: "T", authors: [{ family: "A" }], year: 2020, containerTitle: "J", volume: "1", pages: "1-2", doi: "10.1/z", verified: true, accessLevel: "full_text" };
    const r = runQualityChecks([{ key: "lit", title: "Literatür", text: "Metin ".repeat(100), citedIds: ["s1"], needsLiterature: true } as never], [src as never]);
    expect(r.issues.filter((i) => i.category === "sources" || i.category === "citations")).toEqual([]);
  });
});
