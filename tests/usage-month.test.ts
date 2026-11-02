import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ adminClient: () => ({}) }));
vi.mock("@/lib/settings", () => ({ getSetting: async () => ({}) }));
vi.mock("@/lib/growth", () => ({ activeCredits: async () => ({ ai_requests: 0, source_searches: 0 }) }));
import { costCapUsd, lockReasons, monthStart } from "@/lib/usage";

describe("sayaç dönemi ve kilit nedenleri", () => {
  it("ay başı Türkiye saatine göre (1’i 00:00 TR = önceki gün 21:00 UTC)", () => {
    expect(monthStart(new Date("2026-11-15T10:00:00Z"))).toBe("2026-10-31T21:00:00.000Z");
    // 1 Aralık 01:00 TR (= 30 Kasım 22:00 UTC) artık Aralık dönemidir
    expect(monthStart(new Date("2026-11-30T22:00:00Z"))).toBe("2026-11-30T21:00:00.000Z");
    // 30 Kasım 23:30 TR (= 20:30 UTC) hâlâ Kasım
    expect(monthStart(new Date("2026-11-30T20:30:00Z"))).toBe("2026-10-31T21:00:00.000Z");
  });
  it("limit tam dolunca kilitlenir, sınırsızda (null) kilitlenmez", () => {
    const usage = { ai_requests: 20, tokens: 100, source_searches: 6, exports: 0, projects: 1, storage_mb: 0, cost_usd: 1.2 };
    expect(lockReasons({ ai_requests_month: 20, source_searches_month: 7, tokens_month: null }, usage)).toEqual(["ai_requests"]);
    expect(lockReasons({ ai_requests_month: 21, source_searches_month: 7 }, usage)).toEqual([]);
    expect(lockReasons({ ai_requests_month: null, source_searches_month: 6 }, usage, "basic")).toEqual(["source_searches"]);
    // Ücretsiz pakette tarama hakkı dolsa da çalışma kilitlenmez (yalnızca tarama kapanır; D55)
    expect(lockReasons({ ai_requests_month: null, source_searches_month: 6 }, usage, "free")).toEqual([]);
  });
  it("maliyet tavanı: gelirin 1/3’ü (KDV hariç, dolara çevrilmiş); aşılınca kilit", () => {
    const m = { usd_try: 48, vat_rate: 0.2, cost_share: 1 / 3 };
    expect(costCapUsd(499, m)).toBeCloseTo(2.89, 2); // 499/1,2/48/3
    expect(costCapUsd(1499, m)).toBeCloseTo(8.67, 2);
    const usage = { ai_requests: 5, tokens: 0, source_searches: 0, exports: 0, projects: 1, storage_mb: 0, cost_usd: 2.9 };
    expect(lockReasons({ ai_requests_month: 40, cost_usd_month: 2.89 }, usage)).toEqual(["cost"]);
    expect(lockReasons({ ai_requests_month: 40, cost_usd_month: null }, usage)).toEqual([]);
  });
});

import { memberCode, parseMemberCode } from "@/lib/member";
describe("üye numarası", () => {
  it("biçimlendirme ve arama", () => {
    expect(memberCode(1234)).toBe("AC001234");
    expect(parseMemberCode("AC001234")).toBe(1234);
    expect(parseMemberCode("ac-1234")).toBe(1234);
    expect(parseMemberCode("1234")).toBe(1234);
    expect(parseMemberCode("ali@x.com")).toBeNull();
  });
});

import { formatPrice, usdFromTry } from "@/lib/pricing";
describe("dolar fiyatı (İngilizce sayfalar)", () => {
  it("TL’den yukarı yuvarlanmış dolar fiyatı", () => {
    expect(usdFromTry(499, 48)).toBeCloseTo(10.99, 2);
    expect(usdFromTry(899, 48)).toBeCloseTo(18.99, 2);
    expect(usdFromTry(1499, 48)).toBeCloseTo(31.99, 2);
    expect(formatPrice(499, "en", 48)).toBe("$10.99");
    expect(formatPrice(0, "en", 48)).toBe("$0");
    expect(formatPrice(1499, "tr", 48)).toBe("₺1.499");
  });
});
