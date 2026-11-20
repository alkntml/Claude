import { logError } from "@/lib/api";
import { BadSignatureError, handlePaytrCallback } from "@/lib/payments/apply";
import { parseCallback, paytrCreds } from "@/lib/payments/paytr";

export const dynamic = "force-dynamic";

const text = (body: string, status = 200) => new Response(body, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });

/**
 * D225: PayTR “Bildirim URL” (PayTR panelinde https://www.academiana.com.tr/api/payments/paytr/callback olarak tanımlanır).
 * PayTR sunucusundan gelir; tarayıcı isteği olmadığı için `route()` sarmalayıcısının aynı köken (CSRF) denetimi
 * burada uygulanamaz — güvenliği imza doğrulaması sağlar. Yanıt düz metin “OK” olmalıdır; başka her yanıtta PayTR
 * bildirimi yeniden gönderir (paket yine yalnızca bir kez tanımlanır).
 */
export async function POST(req: Request) {
  const creds = paytrCreds();
  if (!creds) return text("PAYTR not configured", 503);
  let raw = "";
  try {
    raw = await req.text();
  } catch {
    return text("bad request", 400);
  }
  const cb = parseCallback(new URLSearchParams(raw));
  try {
    await handlePaytrCallback(creds, cb);
    return text("OK");
  } catch (e) {
    if (e instanceof BadSignatureError) {
      await logError("payments.paytr.callback", e, null, { oid: cb.merchantOid.slice(0, 64) });
      return text("PAYTR notification failed: bad hash", 400);
    }
    await logError("payments.paytr.callback", e, null, { oid: cb.merchantOid.slice(0, 64), status: cb.status });
    return text("error", 500);
  }
}
