"use client";
/**
 * D231: fatura bilgisi alanları (bireysel / ticari). Ödeme formunda (yükseltme penceresi) ve yönetici ödeme testinde ortak.
 * Bireysel: ad, soyad, telefon, e-posta. Ticari: şirket unvanı, vergi numarası, vergi dairesi, açık adres, telefon, e-posta.
 */
import { useId } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { invoiceErrors, type InvoiceField, type InvoiceForm, type InvoiceType } from "@/lib/payments/invoice";

export function InvoiceFields({ value, onChange, showErrors }: { value: InvoiceForm; onChange: (v: InvoiceForm) => void; showErrors?: boolean }) {
  const { t } = useT();
  const id = useId();
  const bad = showErrors ? invoiceErrors(value) : [];
  const set = (k: keyof InvoiceForm, v: string) => onChange({ ...value, [k]: v });
  const cls = (f: InvoiceField) => cn("input", bad.includes(f) && "border-rose-400");
  const Field = ({ f, label, children, wide }: { f: InvoiceField; label: string; children: React.ReactNode; wide?: boolean }) => (
    <label htmlFor={`${id}-${f}`} className={cn("block", wide && "sm:col-span-2")}><span className="label">{label}</span>{children}{bad.includes(f) && <span className="mt-1 block text-[12px] text-rose-700">{f === "taxNo" ? t("Geçerli bir vergi numarası yazın (10 haneli vergi kimlik no veya 11 haneli T.C. kimlik no).") : t("Bu alanı doğru doldurun.")}</span>}</label>
  );
  const types: [InvoiceType, string][] = [["individual", "Bireysel fatura"], ["commercial", "Ticari fatura (şirket)"]];
  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="label">{t("Fatura türü")}</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2" role="radiogroup">
          {types.map(([k, label]) => (
            <label key={k} className={cn("flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm", value.type === k ? "border-brand-500 bg-white font-semibold text-ink-900" : "border-ink-200 text-ink-600")}>
              <input type="radio" name={`${id}-type`} checked={value.type === k} onChange={() => onChange({ ...value, type: k })} className="h-4 w-4 border-ink-300 text-brand-600" />{t(label)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        {value.type === "individual" ? (<>
          <Field f="firstName" label={t("Ad")}><input id={`${id}-firstName`} className={cls("firstName")} autoComplete="given-name" maxLength={40} value={value.firstName} onChange={(e) => set("firstName", e.target.value)} /></Field>
          <Field f="lastName" label={t("Soyad")}><input id={`${id}-lastName`} className={cls("lastName")} autoComplete="family-name" maxLength={40} value={value.lastName} onChange={(e) => set("lastName", e.target.value)} /></Field>
        </>) : (<>
          <Field f="company" label={t("Şirket unvanı")} wide><input id={`${id}-company`} className={cls("company")} autoComplete="organization" maxLength={150} value={value.company} onChange={(e) => set("company", e.target.value)} /></Field>
          <Field f="taxNo" label={t("Vergi numarası")}><input id={`${id}-taxNo`} className={cls("taxNo")} inputMode="numeric" maxLength={11} placeholder="1234567890" value={value.taxNo} onChange={(e) => set("taxNo", e.target.value.replace(/\D/g, ""))} /></Field>
          <Field f="taxOffice" label={t("Vergi dairesi")}><input id={`${id}-taxOffice`} className={cls("taxOffice")} maxLength={60} value={value.taxOffice} onChange={(e) => set("taxOffice", e.target.value)} /></Field>
          <Field f="address" label={t("Açık adres")} wide><textarea id={`${id}-address`} className={cn(cls("address"), "min-h-[72px]")} autoComplete="street-address" maxLength={400} value={value.address} onChange={(e) => set("address", e.target.value)} /></Field>
        </>)}
        <Field f="phone" label={t("Telefon")}><input id={`${id}-phone`} className={cls("phone")} type="tel" autoComplete="tel" maxLength={20} placeholder="05xx xxx xx xx" value={value.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field f="email" label={t("E-posta")}><input id={`${id}-email`} className={cls("email")} type="email" autoComplete="email" maxLength={254} value={value.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </div>
    </div>
  );
}
