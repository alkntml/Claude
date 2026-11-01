import { describe, expect, it } from "vitest";
import { discounted, emailMatchesDomain, higherPlan, isStudentEmail } from "@/lib/pricing";
import { expertUrl } from "@/lib/expert";

describe("öğrenci indirimi ve kurum paketi", () => {
  it("üniversite e-postasını tanır", () => {
    const d = ["edu.tr", "edu"];
    expect(isStudentEmail("ali@ogr.hacettepe.edu.tr", d)).toBe(true);
    expect(isStudentEmail("ali@metu.edu.tr", d)).toBe(true);
    expect(isStudentEmail("x@mit.edu", d)).toBe(true);
    expect(isStudentEmail("ali@gmail.com", d)).toBe(false);
    expect(isStudentEmail("ali@edu.tr.evil.com", d)).toBe(false);
    expect(isStudentEmail("ali@notedu.tr", d)).toBe(false);
    expect(isStudentEmail(null, d)).toBe(false);
  });
  it("indirimli fiyat ve sınırlar", () => {
    expect(discounted(549, 30)).toBe(384.3);
    expect(discounted(100, 150)).toBe(10); // en fazla %90
  });
  it("kurum alan adı kısıtı", () => {
    expect(emailMatchesDomain("a@hacettepe.edu.tr", "hacettepe.edu.tr")).toBe(true);
    expect(emailMatchesDomain("a@ogr.hacettepe.edu.tr", "hacettepe.edu.tr")).toBe(true);
    expect(emailMatchesDomain("a@gmail.com", "hacettepe.edu.tr")).toBe(false);
    expect(emailMatchesDomain("a@gmail.com", null)).toBe(true);
  });
  it("yüksek paket geçerli", () => {
    expect(higherPlan("free", "premium")).toBe("premium");
    expect(higherPlan("premium", "pro")).toBe("premium");
    expect(higherPlan("basic", null)).toBe("basic");
  });
  it("uzman desteği bağlantısı dermanlik.com.tr'ye UTM ile gider", () => {
    const u = new URL(expertUrl("istatistik", "analysis"));
    expect(u.host).toBe("dermanlik.com.tr");
    expect(u.searchParams.get("utm_source")).toBe("akademi-ai");
    expect(u.searchParams.get("utm_campaign")).toBe("istatistik");
  });
});
