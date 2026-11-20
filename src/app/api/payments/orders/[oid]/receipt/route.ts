import { ApiError, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { receiptHtml, type ReceiptOrder } from "@/lib/payments/receipt";

type Ctx = { params: Promise<{ oid: string }> };

/** D226: sipariş özetini indir (HTML; kalıcı veri saklayıcısı). Yalnızca kendi siparişi. */
export const GET = route<Ctx>("payments.receipt", async (_req, { params }) => {
  const s = await requireUser();
  const { oid } = await params;
  if (!/^[A-Za-z0-9]{8,64}$/.test(oid)) throw new ApiError(404, "Sipariş bulunamadı");
  const { data: o } = await s.supabase.from("payment_orders").select("*").eq("merchant_oid", oid).eq("user_id", s.user.id).maybeSingle();
  if (!o) throw new ApiError(404, "Sipariş bulunamadı");
  const { data: plan } = await s.supabase.from("plans").select("name").eq("id", o.plan_id).maybeSingle();
  const html = receiptHtml({ ...(o as ReceiptOrder), plan_name: plan?.name ?? o.plan_id, buyer_email: o.buyer_email ?? s.profile.email ?? s.user.email ?? null });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `attachment; filename="academiana-siparis-${oid}.html"`, "Cache-Control": "no-store" } });
});
