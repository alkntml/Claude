import { describe, expect, it } from "vitest";
import { sanitizeSuggestion } from "@/lib/autocomplete";
import { roleAllows } from "@/lib/project-access";

describe("otomatik tamamlama önerisi (D113)", () => {
  it("tek cümleye kısaltır ve gerekirse başa boşluk koyar", () => {
    expect(sanitizeSuggestion("bu durum öğrencilerin motivasyonunu etkileyebilir. İkinci cümle.", "Öğretmen desteği arttıkça")).toBe(" bu durum öğrencilerin motivasyonunu etkileyebilir.");
    expect(sanitizeSuggestion(", ancak bu ilişki bağlama göre değişebilir.", "Destek önemlidir")).toBe(", ancak bu ilişki bağlama göre değişebilir.");
  });
  it("kaynak gerektirebilecek öneriler gösterilmez (sayı, yıl, atıf, yüzde, bağlantı)", () => {
    for (const x of ["%45’i bu görüşe katılmaktadır.", "Yılmaz (2020) bunu göstermiştir.", "2019 verilerine göre artmıştır.", "[[kaynak:S1]] ile desteklenir.", "bkz. https://ornek.com"]) {
      expect(sanitizeSuggestion(x, "Metin")).toBe("");
    }
  });
  it("tırnakları ve fazla boşlukları temizler", () => {
    expect(sanitizeSuggestion("  “ve  bu  yaklaşım benimsenmiştir.”  ", "Metin ")).toBe("ve bu yaklaşım benimsenmiştir.");
  });
});

describe("ortak yazım rolleri (D115)", () => {
  it("yorumcu okur ve yorum yazar, düzenleyemez; ortak yazar düzenler ama sahip işlemlerini yapamaz", () => {
    expect(roleAllows("commenter", "read")).toBe(true);
    expect(roleAllows("commenter", "comment")).toBe(true);
    expect(roleAllows("commenter", "edit")).toBe(false);
    expect(roleAllows("editor", "edit")).toBe(true);
    expect(roleAllows("editor", "owner")).toBe(false);
    expect(roleAllows("owner", "owner")).toBe(true);
  });
});
