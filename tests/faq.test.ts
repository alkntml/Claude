import { describe, expect, it } from "vitest";
import { FAQ, FAQ_HIGHLIGHTS, faqText } from "@/lib/faq";

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
});
