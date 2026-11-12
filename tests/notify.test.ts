import { describe, expect, it } from "vitest";
import { isSafeInternalLink } from "@/lib/notify";

describe("yönetici mesajı bağlantısı (D146)", () => {
  it("yalnızca site içi yol", () => {
    for (const ok of ["/hesap", "/fiyatlar#paketler", "/proje/abc?x=1", "/"]) expect(isSafeInternalLink(ok)).toBe(true);
    for (const bad of ["https://kotu.com", "//kotu.com", "/\\kotu.com", "javascript:alert(1)", "hesap", "/a b", ""]) expect(isSafeInternalLink(bad)).toBe(false);
  });
});
