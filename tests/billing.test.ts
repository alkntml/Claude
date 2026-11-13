import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ adminClient: () => { throw new Error("veritabanı yok"); } }));
import { hasYearlyOption, isOneTimePlan, PLAN_RANK, yearlyFeature, yearlyMonthlyPrice, yearlyTotalPrice, YEARLY_DISCOUNT_PERCENT, SINGLE_PLAN_DAYS, UNLIMITED_PLAN_PROJECTS, projectLimitFor, yearlyDescription } from "@/lib/pricing";
import { hasFeature, PLAN_NAME } from "@/lib/features";
import { monthStart, periodFor, scaleForPeriod } from "@/lib/usage";
import { isLegacySingle } from "@/lib/single-project";
import { FALLBACK_PLANS } from "@/lib/plans-fallback";

describe("aylık / yıllık ödeme ve Tek Proje (D157)", () => {
  it("yıllık fiyat: güncel aylık fiyata %20 indirim; aylık karşılık × 12 = yıllık toplam", () => {
    expect(YEARLY_DISCOUNT_PERCENT).toBe(20);
    expect(yearlyMonthlyPrice(749)).toBe(599);
    expect(yearlyTotalPrice(749)).toBe(7188);
    expect(yearlyMonthlyPrice(1349)).toBe(1079);
    expect(yearlyTotalPrice(2249)).toBe(1799 * 12);
    for (const p of [749, 1349, 2249]) expect(Math.abs(1 - yearlyMonthlyPrice(p) / p - 0.2)).toBeLessThan(0.002);
  });

  it("yıllık seçenek yalnızca ücretli aylık paketlerde (Ücretsiz ve Tek Proje hariç)", () => {
    expect(hasYearlyOption("basic", 749)).toBe(true);
    expect(hasYearlyOption("premium", 2249)).toBe(true);
    expect(hasYearlyOption("free", 0)).toBe(false);
    // D158: Sınırsız Proje (single) aylık/yıllık ödenir
    expect(hasYearlyOption("single", 3999)).toBe(true);
    expect(yearlyMonthlyPrice(3999)).toBe(3199);
    expect(yearlyTotalPrice(3999)).toBe(38388);
  });

  it("yıllık pakette haklar düşmez: aylık hakların 12 katı (proje ve depolama aynı); aylıkta değişmez", () => {
    const l = { pages_month: 25, ai_requests_month: 300, tokens_month: 800000, source_searches_month: 100, projects: 3, storage_mb: 500, cost_usd_month: 4.5 };
    expect(scaleForPeriod(l, false)).toEqual(l);
    expect(scaleForPeriod(l, true)).toEqual({ ...l, pages_month: 300, ai_requests_month: 3600, tokens_month: 9600000, source_searches_month: 1200, cost_usd_month: 54 });
    expect(scaleForPeriod({ ...l, pages_month: null, source_searches_month: null }, true)).toMatchObject({ pages_month: null, source_searches_month: null });
    // D159: proje sınırı yalnızca Sınırsız Proje’de ve yalnızca yıllıkta değişir (5 → 60)
    const unl = { pages_month: null, ai_requests_month: null, projects: 5 };
    expect(scaleForPeriod(unl, true, "single").projects).toBe(60);
    expect(scaleForPeriod(unl, false, "single").projects).toBe(5);
    expect(scaleForPeriod(l, true, "basic").projects).toBe(3);
    expect(projectLimitFor("single", 5, true)).toBe(60);
    expect(projectLimitFor("single", 5, false)).toBe(5);
    expect(projectLimitFor("premium", null, true)).toBeNull();
  });

  it("dönem: yıllık ve etkin pakette paket başından itibaren; aksi hâlde takvim ayı", () => {
    const now = new Date("2026-11-13T10:00:00Z");
    const y = periodFor({ plan_id: "pro", plan_period: "yearly", plan_started_at: "2026-03-01T00:00:00Z", plan_expires_at: "2027-03-01T00:00:00Z" }, now);
    expect(y).toEqual({ yearly: true, since: "2026-03-01T00:00:00.000Z", until: "2027-03-01T00:00:00Z" });
    // Süresi dolmuş yıllık, ücretsiz veya aylık → takvim ayı
    for (const p of [{ plan_id: "pro", plan_period: "yearly", plan_started_at: "2025-01-01T00:00:00Z", plan_expires_at: "2026-01-01T00:00:00Z" }, { plan_id: "free", plan_period: "yearly", plan_started_at: "2026-03-01T00:00:00Z" }, { plan_id: "pro", plan_period: "monthly", plan_started_at: "2026-11-01T00:00:00Z" }, null]) {
      const m = periodFor(p, now);
      expect(m.yearly).toBe(false);
      expect(m.since).toBe(monthStart(now));
    }
  });

  it("yıllık kartta aylık miktarlı satırlar 12 katına çevrilir, diğerleri aynı kalır", () => {
    expect(yearlyFeature("Ayda 25 sayfa yapay zekâ destekli akademik metin (ör. 1 makale veya tezin 2–3 bölümü)")).toMatchObject({ vars: { n: 300 } });
    expect(yearlyFeature("Aylık 100 kaynak taraması")).toMatchObject({ key: "Yılda {n} kaynak taraması", vars: { n: 1200 } });
    expect(yearlyFeature("Word dışa aktarma")).toEqual({ key: "Word dışa aktarma" });
    // D159: Sınırsız Proje yıllıkta 60 proje
    expect(yearlyFeature("En fazla 5 proje")).toEqual({ key: "En fazla {n} proje", vars: { n: 60 } });
    // D161: kart açıklaması da yıllıkta 60 proje der
    const desc = FALLBACK_PLANS.find((p) => p.id === "single")!.description;
    expect(yearlyDescription("single", desc)).toMatchObject({ vars: { n: 60 } });
    expect(yearlyDescription("pro", "Gelişmiş araştırma")).toEqual({ key: "Gelişmiş araştırma" });
  });

  it("Sınırsız Proje: 5 proje dışında her şey sınırsız, aylık 30 gün; tek çalışma kuralları yalnızca eski (süresiz) Tek Proje’de", () => {
    expect(SINGLE_PLAN_DAYS).toBe(30);
    expect(UNLIMITED_PLAN_PROJECTS).toBe(5);
    expect(isOneTimePlan("single")).toBe(false);
    expect(PLAN_RANK.single).toBeGreaterThan(PLAN_RANK.premium);
    expect(PLAN_NAME.single).toBe("Sınırsız Proje");
    expect(hasFeature("single", "coauthors")).toBe(true);
    const single = FALLBACK_PLANS.find((p) => p.id === "single")!;
    expect(single.name).toBe("Sınırsız Proje");
    expect(single.features).toContain("En fazla 5 proje");
    expect(single.features).toContain("Ortak yazarlarla birlikte yazım");
    expect(isLegacySingle({ plan_id: "single", plan_expires_at: null })).toBe(true);
    expect(isLegacySingle({ plan_id: "single", plan_expires_at: "2026-12-13T00:00:00Z" })).toBe(false);
    expect(isLegacySingle({ plan_id: "single", plan_expires_at: null, role: "admin" })).toBe(false);
    expect(isLegacySingle({ plan_id: "pro", plan_expires_at: null })).toBe(false);
  });
});
