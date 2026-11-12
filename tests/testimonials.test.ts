import { describe, expect, it } from "vitest";
import { initials, TESTIMONIALS } from "@/lib/testimonials";
import * as ld from "@/lib/structured-data";

describe("ana sayfa görüşleri (D147)", () => {
  it("baş harfler unvansız", () => {
    expect(initials("Prof. Dr. Murat Karahan")).toBe("MK");
    expect(initials("Doç. Dr. Emre Aksoy")).toBe("EA");
    expect(initials("Elif Aydın")).toBe("EA");
  });
  it("7 görüş; yapılandırılmış veride yorum/puan şeması yok", () => {
    expect(TESTIMONIALS).toHaveLength(7);
    expect(JSON.stringify(Object.keys(ld))).not.toMatch(/review|rating/i);
  });
});
