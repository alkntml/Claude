import { describe, expect, it } from "vitest";
import { countsAsRevenue } from "@/lib/pricing";

describe("gelir başlangıcı (D219)", () => {
  it("16 Kasım 2026 öncesi başlayan ve başlangıcı bilinmeyen paketler gelire girmez, sonrakiler girer", () => {
    expect(countsAsRevenue(null)).toBe(false);
    expect(countsAsRevenue("2026-11-10T09:00:00+00:00")).toBe(false);
    expect(countsAsRevenue("2026-11-16 14:00:00+00")).toBe(false);
    expect(countsAsRevenue("2026-11-16T15:00:00.123+00:00")).toBe(true);
    expect(countsAsRevenue("2026-12-01T00:00:00Z")).toBe(true);
  });
});
