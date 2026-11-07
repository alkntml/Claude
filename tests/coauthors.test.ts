import { describe, expect, it } from "vitest";
import { coauthorEmailOk, inviteProblem, maskEmail } from "@/lib/coauthors";

const user = { id: "u1", email: "Ayse@Uni.edu.tr" };
const future = new Date(Date.now() + 86400_000).toISOString();
const past = new Date(Date.now() - 1000).toISOString();

describe("ortak yazar daveti (D115)", () => {
  it("doğru e-posta ile geçerli davet kabul edilir (büyük/küçük harf duyarsız)", () => {
    expect(inviteProblem({ email: "ayse@uni.edu.tr", expires_at: future, accepted_at: null }, user, "owner")).toBeNull();
  });
  it("başka e-posta, süresi dolmuş, kullanılmış ve kendi çalışması reddedilir", () => {
    expect(inviteProblem({ email: "baska@uni.edu.tr", expires_at: future, accepted_at: null }, user, "owner")).toBe("wrong_email");
    expect(inviteProblem({ email: "ayse@uni.edu.tr", expires_at: past, accepted_at: null }, user, "owner")).toBe("expired");
    expect(inviteProblem({ email: "ayse@uni.edu.tr", expires_at: future, accepted_at: past, accepted_by: "u2" }, user, "owner")).toBe("used");
    expect(inviteProblem({ email: "ayse@uni.edu.tr", expires_at: future, accepted_at: null }, user, "u1")).toBe("own_project");
    expect(inviteProblem(null, user, null)).toBe("not_found");
  });
  it("aynı kişi daveti yeniden açarsa sorun yok (zaten kabul etmiş)", () => {
    expect(inviteProblem({ email: "ayse@uni.edu.tr", expires_at: past, accepted_at: past, accepted_by: "u1" }, user, "owner")).toBeNull();
  });
  it("geçici e-posta adreslerine davet gönderilmez; e-posta gizlenir", () => {
    expect(coauthorEmailOk("ogrenci@universite.edu.tr")).toBe(true);
    expect(coauthorEmailOk("x@mailinator.com")).toBe(false);
    expect(coauthorEmailOk("gecersiz")).toBe(false);
    expect(maskEmail("ayse.yilmaz@uni.edu.tr")).toBe("ay****@uni.edu.tr");
  });
});
