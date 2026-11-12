import { describe, expect, it } from "vitest";
import { appliesTo, discountAmount, discountedPrice, discountLabel, isClaimable, normalizeCode } from "@/lib/discount";

/** D145: indirim kodları */
describe("indirim kodu", () => {
  it("kod biçimi: büyük harf, Türkçe İ → I, boşluk ve geçersiz karakter atılır", () => {
    expect(normalizeCode(" ogrenci20 ")).toBe("OGRENCI20");
    expect(normalizeCode("bahar-2027")).toBe("BAHAR-2027");
    expect(normalizeCode("indirim")).toBe("INDIRIM");
    expect(normalizeCode(null)).toBe("");
  });
  it("yüzde ve TL indirim; tam TL’ye yuvarlanır, eksiye düşmez", () => {
    const pct = { kind: "percent" as const, value: 20, plans: [] };
    expect(discountedPrice(749, pct, "basic")).toBe(599);
    expect(discountAmount(749, pct, "basic")).toBe(150);
    const tl = { kind: "amount_try" as const, value: 250, plans: [] };
    expect(discountedPrice(1349, tl, "pro")).toBe(1099);
    expect(discountedPrice(200, tl, "x")).toBe(0);
  });
  it("paket kısıtı ve ücretsiz paket", () => {
    const d = { kind: "percent" as const, value: 30, plans: ["pro", "premium"] };
    expect(discountedPrice(749, d, "basic")).toBeNull();
    expect(discountedPrice(2249, d, "premium")).toBe(1574);
    expect(appliesTo({ plans: [] }, "free", 0)).toBe(false);
    expect(discountedPrice(749, null, "basic")).toBeNull();
  });
  it("yeni kayıtta geçerlilik: pasif, süresi dolmuş, kullanım sınırı", () => {
    const now = new Date("2026-12-01T10:00:00Z");
    const base = { code: "A1B", kind: "percent" as const, value: 10, plans: [] };
    expect(isClaimable({ ...base }, now)).toBe(true);
    expect(isClaimable({ ...base, active: false }, now)).toBe(false);
    expect(isClaimable({ ...base, expires_at: "2026-11-30T00:00:00Z" }, now)).toBe(false);
    expect(isClaimable({ ...base, max_uses: 5, uses: 5 }, now)).toBe(false);
    expect(isClaimable({ ...base, max_uses: 5, uses: 4 }, now)).toBe(true);
  });
  it("etiket", () => {
    expect(discountLabel({ kind: "percent", value: 20 })).toBe("%20");
    expect(discountLabel({ kind: "amount_try", value: 1500 })).toBe("1.500 TL");
  });
});
