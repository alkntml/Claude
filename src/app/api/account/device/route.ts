import { z } from "zod";
import { json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { recordDevice } from "@/lib/devices";

const Body = z.object({ d: z.string().regex(/^[0-9a-f]{64}$/) });

/** Oturum açmış kullanıcının cihaz özetini kaydeder (davet ödülü kötüye kullanım önlemi, D101) */
export const POST = route("account.device", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, Body);
  await recordDevice(s.user.id, b.d);
  return json({ ok: true });
});
