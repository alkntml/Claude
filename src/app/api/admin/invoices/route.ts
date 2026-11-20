import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { invoiceQueue, pendingInvoiceCount } from "@/lib/payments/invoice-queue";

/** D232: Yönetim → Faturalar. `?sayi=1` yalnızca bekleyen sayıyı döner (menüdeki bildirim ışığı). */
export const GET = route("admin.invoices", async (req) => {
  await requireAdmin();
  if (new URL(req.url).searchParams.get("sayi")) return json({ pending: await pendingInvoiceCount() });
  return json(await invoiceQueue());
});

const Body = z.object({ oid: z.string().regex(/^[A-Za-z0-9]{8,64}$/), done: z.boolean(), invoiceNo: z.string().trim().max(60).optional() });

/** Faturayı “kesildi” olarak işaretle / geri al (isteğe bağlı fatura numarası) */
export const POST = route("admin.invoices.mark", async (req) => {
  await requireAdmin();
  const b = await parseBody(req, Body);
  const { data, error } = await adminClient().from("payment_orders")
    .update({ invoiced_at: b.done ? new Date().toISOString() : null, invoice_no: b.done ? b.invoiceNo || null : null, updated_at: new Date().toISOString() })
    .eq("merchant_oid", b.oid).eq("invoice_type", "commercial").eq("status", "paid").select("merchant_oid");
  if (error) throw new ApiError(500, "Kaydedilemedi (migration 51 çalıştırıldı mı?)");
  if (!data?.length) throw new ApiError(404, "Sipariş bulunamadı");
  return json({ ok: true, pending: await pendingInvoiceCount() });
});
