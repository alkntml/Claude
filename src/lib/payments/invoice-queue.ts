import "server-only";
import { adminClient } from "@/lib/supabase/admin";

/** D232: fatura kesilecekler listesi — ticari fatura isteyen, ödenmiş siparişler */
export interface InvoiceRow {
  merchant_oid: string; created_at: string; plan_id: string; period: string; amount_try: number; paid_amount_try: number | null; test_mode: boolean;
  company_title: string | null; payer_name: string; tax_number: string | null; tax_office: string | null; payer_address: string; payer_phone: string; buyer_email: string | null;
  invoiced_at: string | null; invoice_no: string | null; plan_name?: string;
}
const COLS = "merchant_oid, created_at, plan_id, period, amount_try, paid_amount_try, test_mode, company_title, payer_name, tax_number, tax_office, payer_address, payer_phone, buyer_email, invoiced_at, invoice_no";

/** Kesilmesi beklenen (gerçek ödemeli, henüz kesilmemiş) ticari fatura sayısı */
export async function pendingInvoiceCount(): Promise<number> {
  const { count, error } = await adminClient().from("payment_orders").select("merchant_oid", { count: "exact", head: true })
    .eq("invoice_type", "commercial").eq("status", "paid").eq("test_mode", false).is("invoiced_at", null);
  return error ? 0 : count ?? 0;
}

export async function invoiceQueue(): Promise<{ orders: InvoiceRow[]; pending: number; migrationMissing: boolean }> {
  const db = adminClient();
  const { data, error } = await db.from("payment_orders").select(COLS).eq("invoice_type", "commercial").eq("status", "paid").order("created_at", { ascending: false }).limit(500);
  if (error) return { orders: [], pending: 0, migrationMissing: true };
  const rows = (data ?? []) as InvoiceRow[];
  const ids = [...new Set(rows.map((r) => r.plan_id))];
  const { data: plans } = ids.length ? await db.from("plans").select("id, name").in("id", ids) : { data: [] as { id: string; name: string }[] };
  const name = new Map((plans ?? []).map((p) => [p.id, p.name]));
  const orders = rows.map((r) => ({ ...r, plan_name: name.get(r.plan_id) ?? r.plan_id }));
  return { orders, pending: orders.filter((o) => !o.test_mode && !o.invoiced_at).length, migrationMissing: false };
}
