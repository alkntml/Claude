import { describe, expect, it } from "vitest";
import { costByFeature, featureLabel, lastDays, trafficSummary } from "@/lib/insights";
import { normalizePath, referrerHost, deviceOf } from "@/lib/analytics";

describe("yönetim ölçümleri (D90)", () => {
  it("maliyeti özelliğe göre toplar ve okunur ad verir", () => {
    const r = costByFeature([
      { cost_usd: 0.05, meta: { action: "draft" } }, { cost_usd: "0.03", meta: { action: "draft" } },
      { cost_usd: 0.2, meta: { action: "quality_review" } }, { cost_usd: 0, meta: { action: "chat" } },
    ]);
    expect(r[0]).toEqual({ label: "Kalite kontrol (yapay zekâ jürisi)", value: 0.2, calls: 1 });
    expect(r[1]).toEqual({ label: "Asistan: Bölümü yaz", value: 0.08, calls: 2 });
    expect(featureLabel("survey_revise")).toBe("Anket: yapay zekâ");
  });
  it("ziyaret özetinde günlük tekil ziyaretçi ve boş günler", () => {
    const days = lastDays(3, new Date("2026-11-05T12:00:00Z"));
    expect(days).toEqual(["2026-11-03", "2026-11-04", "2026-11-05"]);
    const t = trafficSummary([
      { path: "/", visitor: "a", referrer: "google.com", utm_source: null, device: "mobile", created_at: "2026-11-05T10:00:00Z" },
      { path: "/fiyatlar", visitor: "a", referrer: null, utm_source: "instagram", device: "mobile", created_at: "2026-11-05T10:01:00Z" },
      { path: "/", visitor: "b", referrer: null, utm_source: null, device: "desktop", created_at: "2026-11-04T10:00:00Z" },
    ], days);
    expect(t.byDay).toEqual([{ day: "2026-11-03", views: 0, visitors: 0 }, { day: "2026-11-04", views: 1, visitors: 1 }, { day: "2026-11-05", views: 2, visitors: 1 }]);
    expect(t.visitors).toBe(2);
    expect(t.sources.map((s) => s.label)).toContain("instagram (kampanya)");
    expect(t.devices[0]).toEqual({ label: "Telefon", value: 2 });
  });
  it("kimlik içeren yolları gruplar, yönlendirenin yalnızca alan adını tutar", () => {
    expect(normalizePath("/proje/1b2c3d4e-aaaa-bbbb-cccc-1234567890ab?bolum=x")).toBe("/proje/:id");
    expect(normalizePath("/en/a/abcdef123")).toBe("/en/a/:token");
    expect(referrerHost("https://www.google.com/search?q=tez", "www.academiana.com.tr")).toBe("google.com");
    expect(referrerHost("https://www.academiana.com.tr/fiyatlar", "www.academiana.com.tr")).toBeNull();
    expect(deviceOf("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
  });
});
