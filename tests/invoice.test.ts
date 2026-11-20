/** D231: fatura bilgisi (bireysel / ticari) doğrulaması */
import { describe, expect, it } from "vitest";
import { emptyInvoice, InvoiceBody, invoiceBody, invoiceErrors, invoiceRecord, isValidEmail, isValidTaxNo, isValidTckn, isValidVkn } from "@/lib/payments/invoice";
import { SELLER } from "@/lib/site";

describe("vergi numarası", () => {
  it("VKN sağlama basamağı: satıcının gerçek vergi numarası geçer, bir hane değişince geçmez", () => {
    expect(isValidVkn(SELLER.taxNo)).toBe(true);
    expect(isValidVkn("8370931188")).toBe(false);
    expect(isValidVkn("123")).toBe(false);
    expect(isValidVkn("83709311ab")).toBe(false);
  });
  it("T.C. kimlik numarası (şahıs işletmesi) sağlama basamakları", () => {
    expect(isValidTckn("10000000146")).toBe(true);
    expect(isValidTckn("10000000147")).toBe(false);
    expect(isValidTckn("01234567890")).toBe(false);
    expect(isValidTaxNo("10000000146")).toBe(true);
  });
});

describe("fatura formu", () => {
  const ind = { ...emptyInvoice("ali@example.com"), firstName: "Ali", lastName: "Veli", phone: "0532 111 22 33" };
  const com = { ...emptyInvoice("muhasebe@sirket.com"), type: "commercial" as const, company: "Örnek Yazılım Ltd. Şti.", taxNo: SELLER.taxNo, taxOffice: "Gölbaşı", address: "Örencik Mah. 3803 Cad. No: 17 Gölbaşı/Ankara", phone: "+90 312 111 22 33" };
  it("bireysel: ad, soyad, telefon, e-posta yeterli (adres istenmez)", () => {
    expect(invoiceErrors(ind)).toEqual([]);
    expect(invoiceErrors({ ...ind, lastName: "" })).toEqual(["lastName"]);
    expect(invoiceErrors({ ...ind, email: "yanlis" })).toEqual(["email"]);
    expect(invoiceErrors({ ...ind, phone: "123" })).toEqual(["phone"]);
  });
  it("ticari: unvan, vergi no, vergi dairesi, açık adres, telefon, e-posta zorunlu", () => {
    expect(invoiceErrors(com)).toEqual([]);
    expect(invoiceErrors({ ...com, company: "", taxNo: "1234567891", taxOffice: "", address: "kısa", phone: "", email: "" }).sort()).toEqual(["address", "company", "email", "phone", "taxNo", "taxOffice"]);
  });
  it("sunucu gövdesi türüne göre alan ister; kayıt doğru sütunlara yazılır", () => {
    expect(InvoiceBody.safeParse(invoiceBody(ind)).success).toBe(true);
    expect(InvoiceBody.safeParse(invoiceBody(com)).success).toBe(true);
    expect(InvoiceBody.safeParse({ type: "commercial", phone: "0532 111 22 33", email: "a@b.co" }).success).toBe(false);
    expect(invoiceRecord(invoiceBody(ind))).toMatchObject({ invoice_type: "individual", payer_name: "Ali Veli", buyer_first_name: "Ali", buyer_last_name: "Veli", company_title: null, tax_number: null, payer_address: "", payer_phone: "05321112233", buyer_email: "ali@example.com" });
    expect(invoiceRecord(invoiceBody(com))).toMatchObject({ invoice_type: "commercial", payer_name: "Örnek Yazılım Ltd. Şti.", company_title: "Örnek Yazılım Ltd. Şti.", tax_number: SELLER.taxNo, tax_office: "Gölbaşı", payer_address: com.address, buyer_first_name: null });
  });
  it("e-posta doğrulaması", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("a@b")).toBe(false);
    expect(isValidEmail("a b@c.com")).toBe(false);
  });
});
