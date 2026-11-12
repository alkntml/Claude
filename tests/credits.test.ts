import { describe, expect, it } from "vitest";
import { creditPool, trMonth, type CreditRow } from "@/lib/growth";

const base = { ai: 10, search: 7 };
const c = (kind: string, amount: number, created: string, expires: string | null = null): CreditRow => ({ kind, amount, created_at: created, expires_at: expires });

describe("davet kredisi tek seferlik bakiye (D98)", () => {
  it("bu ay verilen kredi tamamen kullanılabilir", () => {
    const r = creditPool([c("ai_requests", 10, "2026-11-20T10:00:00Z", "2027-01-19T10:00:00Z"), c("source_searches", 7, "2026-11-20T10:00:00Z", "2027-01-19T10:00:00Z")], {}, base, new Date("2026-11-25T10:00:00Z"));
    expect(r).toEqual({ ai_requests: 10, source_searches: 7, pages: 0 });
  });
  it("önceki ayda aylık hakkı aşan kullanım krediden düşer; ertesi ay kalan eklenir (yeniden 10 değil)", () => {
    const credits = [c("ai_requests", 10, "2026-11-20T10:00:00Z", "2027-01-19T10:00:00Z")];
    // Kasım: 10 temel + 6 krediden = 16 istek → aralıkta kalan 4
    expect(creditPool(credits, { "2026-11": { ai: 16, search: 0 } }, base, new Date("2026-12-05T10:00:00Z")).ai_requests).toBe(4);
    // Kasım’da krediyi hiç kullanmadıysa aralıkta 10 kalır, ama ocakta aralıkta harcanan düşer
    expect(creditPool(credits, { "2026-11": { ai: 5, search: 0 }, "2026-12": { ai: 20, search: 0 } }, base, new Date("2027-01-10T10:00:00Z")).ai_requests).toBe(0);
  });
  it("süresi dolan kredinin kalanı kullanılamaz; sınırsız pakette kredi gerekmez", () => {
    const credits = [c("ai_requests", 10, "2026-09-01T10:00:00Z", "2026-10-31T10:00:00Z")];
    expect(creditPool(credits, {}, base, new Date("2026-11-05T10:00:00Z")).ai_requests).toBe(0);
    expect(creditPool([c("ai_requests", 10, "2026-11-01T10:00:00Z")], {}, { ai: null, search: null }, new Date("2026-11-05T10:00:00Z")).ai_requests).toBe(0);
  });
  it("sayfa kredisi (D145): aylık sayfa hakkını aşan yazım krediden düşer", () => {
    const credits = [c("pages", 5, "2026-11-20T10:00:00Z", "2027-01-19T10:00:00Z")];
    const b = { ai: 10, search: 7, pages: 5 };
    expect(creditPool(credits, {}, b, new Date("2026-11-25T10:00:00Z")).pages).toBe(5);
    // Kasım: 5 temel + 3 krediden = 8 sayfa → aralıkta kalan 2
    expect(creditPool(credits, { "2026-11": { ai: 0, search: 0, pages: 8 } }, b, new Date("2026-12-05T10:00:00Z")).pages).toBe(2);
    // Pakette sayfa sınırı yoksa (Tek Proje) kredi gerekmez
    expect(creditPool(credits, {}, { ai: 10, search: 7, pages: null }, new Date("2026-11-25T10:00:00Z")).pages).toBe(0);
  });
  it("ay anahtarı Türkiye saatine göre", () => {
    expect(trMonth("2026-11-30T22:30:00Z")).toBe("2026-12");
    expect(trMonth("2026-11-30T20:00:00Z")).toBe("2026-11");
  });
});
