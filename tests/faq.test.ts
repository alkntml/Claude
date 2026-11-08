import { describe, expect, it } from "vitest";
import { FAQ, FAQ_HIGHLIGHTS, faqText } from "@/lib/faq";
import { FAQ_DE, FAQ_GROUP_DE } from "@/lib/faq-de";

describe("SSS", () => {
  const items = FAQ.flatMap((g) => g.items);
  it("kimlikler benzersiz, öne çıkanlar mevcut", () => {
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const h of FAQ_HIGHLIGHTS) expect(ids).toContain(h);
  });
  it("her soru ve cevap iki dilde dolu, kalın işaretleri eşli", () => {
    for (const i of items) for (const l of ["tr", "en"] as const) {
      expect(i.q[l].trim().length).toBeGreaterThan(5);
      expect(i.a[l].trim().length).toBeGreaterThan(20);
      expect((i.a[l].match(/\*\*/g) ?? []).length % 2).toBe(0);
    }
    expect(faqText("en")).toHaveLength(items.length);
  });
  it("Almanca: her soru ve grup çevrilmiş, fazlalık yok, kalın işaretleri eşli", () => {
    const ids = items.map((i) => i.id);
    expect(Object.keys(FAQ_DE).sort()).toEqual([...ids].sort());
    for (const g of FAQ) expect(FAQ_GROUP_DE[g.id]).toBeTruthy();
    for (const id of ids) {
      const d = FAQ_DE[id];
      expect(d.q.trim().length).toBeGreaterThan(5);
      expect(d.a.trim().length).toBeGreaterThan(20);
      expect((d.a.match(/\*\*/g) ?? []).length % 2).toBe(0);
    }
    expect(faqText("de")[0].q).toBe(FAQ_DE[ids[0]].q);
  });
});
