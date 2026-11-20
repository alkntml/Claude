import crypto from "node:crypto";
import { logError } from "@/lib/api";
import { paytrCreds } from "@/lib/payments/paytr";
import { recurringEnabled } from "@/lib/payments/paytr-recurring";
import { runRenewals } from "@/lib/payments/renewal";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

/**
 * D234: günlük otomatik yenileme görevi (vercel.json → crons). Vercel, `CRON_SECRET` ortam değişkeni tanımlıysa isteğe
 * `Authorization: Bearer <CRON_SECRET>` ekler; başka çağrılar reddedilir. Tarayıcı isteği olmadığı için `route()` (CSRF) kullanılmaz.
 */
export async function GET(req: Request) {
  const secret = (process.env.CRON_SECRET ?? "").trim();
  if (!secret) return json({ error: "CRON_SECRET tanımlı değil" }, 503);
  const got = Buffer.from(req.headers.get("authorization") ?? ""), want = Buffer.from(`Bearer ${secret}`);
  if (got.length !== want.length || !crypto.timingSafeEqual(got, want)) return json({ error: "yetkisiz" }, 401);
  const creds = paytrCreds();
  if (!creds || !recurringEnabled()) return json({ skipped: "otomatik yenileme kapalı (PAYTR_RECURRING)" });
  try {
    return json(await runRenewals(creds));
  } catch (e) {
    await logError("payments.renewal.cron", e, null);
    return json({ error: "hata" }, 500);
  }
}
