/**
 * D231: fatura bilgisi (bireysel / ticari). İstemci ve sunucu ortak, saf fonksiyonlar.
 * Bireysel: ad, soyad, telefon, e-posta. Ticari: şirket unvanı, vergi numarası, vergi dairesi, açık adres, telefon, e-posta.
 */
import { z } from "zod";
import { isValidPhone } from "@/lib/payments/order";

export type InvoiceType = "individual" | "commercial";
export interface InvoiceForm {
  type: InvoiceType;
  firstName: string; lastName: string;
  company: string; taxNo: string; taxOffice: string; address: string;
  phone: string; email: string;
}
export const emptyInvoice = (email = ""): InvoiceForm => ({ type: "individual", firstName: "", lastName: "", company: "", taxNo: "", taxOffice: "", address: "", phone: "", email });

export const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()) && s.trim().length <= 254;
const digits = (s: string) => String(s ?? "").replace(/\D/g, "");

/** Vergi kimlik numarası (VKN, 10 hane) sağlama basamağı */
export function isValidVkn(v: string): boolean {
  const d = digits(v);
  if (d.length !== 10 || digits(v) !== v.replace(/\s/g, "")) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (Number(d[i]) + (9 - i)) % 10;
    let x = (tmp * 2 ** (9 - i)) % 9;
    if (tmp !== 0 && x === 0) x = 9;
    sum += x;
  }
  return (10 - (sum % 10)) % 10 === Number(d[9]);
}
/** T.C. kimlik numarası (11 hane; şahıs işletmelerinde vergi numarası yerine kullanılabilir) sağlama basamakları */
export function isValidTckn(v: string): boolean {
  const d = digits(v);
  if (d.length !== 11 || d !== v.replace(/\s/g, "") || d[0] === "0") return false;
  const n = d.split("").map(Number);
  const odd = n[0] + n[2] + n[4] + n[6] + n[8], even = n[1] + n[3] + n[5] + n[7];
  const c10 = (((odd * 7 - even) % 10) + 10) % 10;
  const c11 = n.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  return n[9] === c10 && n[10] === c11;
}
export const isValidTaxNo = (v: string) => isValidVkn(v) || isValidTckn(v);

export type InvoiceField = "firstName" | "lastName" | "company" | "taxNo" | "taxOffice" | "address" | "phone" | "email";
/** Eksik/hatalı alanlar (boşsa fatura bilgisi geçerli) */
export function invoiceErrors(f: InvoiceForm): InvoiceField[] {
  const bad: InvoiceField[] = [];
  const len = (s: string, n: number) => s.trim().length >= n;
  if (f.type === "individual") {
    if (!len(f.firstName, 2)) bad.push("firstName");
    if (!len(f.lastName, 2)) bad.push("lastName");
  } else {
    if (!len(f.company, 3)) bad.push("company");
    if (!isValidTaxNo(f.taxNo)) bad.push("taxNo");
    if (!len(f.taxOffice, 3)) bad.push("taxOffice");
    if (!len(f.address, 10)) bad.push("address");
  }
  if (!isValidPhone(f.phone)) bad.push("phone");
  if (!isValidEmail(f.email)) bad.push("email");
  return bad;
}

/** Sunucu gövdesi (checkout) */
export const InvoiceBody = z.discriminatedUnion("type", [
  z.object({ type: z.literal("individual"), firstName: z.string().trim().min(2).max(40), lastName: z.string().trim().min(2).max(40), phone: z.string().trim().min(10).max(20), email: z.string().trim().max(254) }),
  z.object({ type: z.literal("commercial"), company: z.string().trim().min(3).max(150), taxNo: z.string().trim().min(10).max(11), taxOffice: z.string().trim().min(3).max(60), address: z.string().trim().min(10).max(400), phone: z.string().trim().min(10).max(20), email: z.string().trim().max(254) }),
]);
export type InvoiceInput = z.infer<typeof InvoiceBody>;

/** Formdan sunucu gövdesine (yalnızca seçili türün alanları gider) */
export function invoiceBody(f: InvoiceForm): InvoiceInput {
  return f.type === "individual"
    ? { type: "individual", firstName: f.firstName.trim(), lastName: f.lastName.trim(), phone: f.phone.trim(), email: f.email.trim() }
    : { type: "commercial", company: f.company.trim(), taxNo: digits(f.taxNo), taxOffice: f.taxOffice.trim(), address: f.address.trim(), phone: f.phone.trim(), email: f.email.trim() };
}

/** PayTR’ye giden ad/adres ve siparişe yazılan fatura alanları */
export function invoiceRecord(i: InvoiceInput) {
  const common = { invoice_type: i.type, payer_phone: i.phone.replace(/[^\d+]/g, "").slice(0, 20), buyer_email: i.email.trim().toLowerCase().slice(0, 254) };
  return i.type === "individual"
    ? { ...common, payer_name: `${i.firstName} ${i.lastName}`.slice(0, 80), payer_address: "", buyer_first_name: i.firstName, buyer_last_name: i.lastName, company_title: null, tax_number: null, tax_office: null }
    : { ...common, payer_name: i.company.slice(0, 150), payer_address: i.address, buyer_first_name: null, buyer_last_name: null, company_title: i.company, tax_number: digits(i.taxNo), tax_office: i.taxOffice };
}
/** Bireysel faturada adres istenmez; PayTR adres alanını zorunlu tuttuğu için sabit bir değer gönderilir */
export const INDIVIDUAL_PAYTR_ADDRESS = "Türkiye (bireysel fatura)";
