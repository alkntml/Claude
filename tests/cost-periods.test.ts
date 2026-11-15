import { describe, expect, it } from "vitest";
import { costByPeriod, costPeriodStarts } from "@/lib/insights";

describe("D203: API maliyeti dönemleri", () => {
  // 2026-11-18 Çarşamba 10:00 TR (07:00 UTC)
  const now = new Date("2026-11-18T07:00:00Z");
  it("Türkiye saatine göre dönem başları", () => {
    const s = costPeriodStarts(now);
    expect(s.day).toBe("2026-11-17T21:00:00.000Z");
    expect(s.week).toBe("2026-11-15T21:00:00.000Z"); // Pazartesi 16 Kasım 00:00 TR
    expect(s.month).toBe("2026-10-31T21:00:00.000Z");
    expect(s.year).toBe("2025-12-31T21:00:00.000Z");
  });
  it("yönetici maliyeti ayrı tutulur, toplama katılmaz", () => {
    const admin = new Set(["a"]);
    const rows = [
      { cost_usd: 1, created_at: "2026-11-18T06:00:00Z", user_id: "u" }, // bugün
      { cost_usd: 2, created_at: "2026-11-16T10:00:00Z", user_id: "u" }, // bu hafta
      { cost_usd: 4, created_at: "2026-11-02T10:00:00Z", user_id: null }, // bu ay (ziyaretçi aracı)
      { cost_usd: 8, created_at: "2026-03-01T10:00:00Z", user_id: "u" }, // bu yıl
      { cost_usd: 16, created_at: "2026-11-18T05:00:00Z", user_id: "a" }, // yönetici, bugün
      { cost_usd: 32, created_at: "2025-12-31T22:00:00Z", user_id: "u" }, // 1 Ocak 01:00 TR → bu yıl
    ];
    const r = costByPeriod(rows, admin, now);
    expect(r.users).toEqual({ day: 1, week: 3, month: 7, year: 47 });
    expect(r.admin).toEqual({ day: 16, week: 16, month: 16, year: 16 });
  });
});
