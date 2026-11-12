import { describe, expect, it } from "vitest";
import { scrubMeta, scrubPII } from "@/lib/pii";

describe("hata kayıtlarında kişisel veri maskeleme (D154)", () => {
  it("e-posta, telefon, IP ve belirteçleri maskeler; hata ayıklama bilgisini korur", () => {
    const msg = 'duplicate key value violates unique constraint "profiles_email_key": Key (email)=(ayse.yilmaz@ornek.edu.tr) already exists';
    expect(scrubPII(msg)).toBe('duplicate key value violates unique constraint "profiles_email_key": Key (email)=([e-posta]) already exists');
    expect(scrubPII("Telefon +90 542 123 45 67 geçersiz")).toBe("Telefon [telefon] geçersiz");
    expect(scrubPII("Bağlantı 192.168.1.20 reddedildi")).toBe("Bağlantı [ip] reddedildi");
    expect(scrubPII("token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U")).toBe("token [belirteç]");
    expect(scrubPII("anahtar sk-ant-api03-abcdefghijklmnopqrstuvwxyz")).toBe("anahtar [anahtar]");
    // Kısa sayılar, tarih ve kimlikler bozulmaz
    expect(scrubPII("Satır 42, 2026-11-13, proje 3f2a9c1e-1234-4abc-9def-0123456789ab, 500 hata")).toBe("Satır 42, 2026-11-13, proje 3f2a9c1e-1234-4abc-9def-0123456789ab, 500 hata");
    expect(scrubMeta({ note: "x@y.com", n: 5 })).toEqual({ note: "[e-posta]", n: 5 });
  });
});
