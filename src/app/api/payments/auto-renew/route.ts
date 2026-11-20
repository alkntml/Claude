import { z } from "zod";
import { ApiError, json, parseBody, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { paytrCreds } from "@/lib/payments/paytr";
import { recurringEnabled } from "@/lib/payments/paytr-recurring";
import { removeStoredCard, renewalState, setAutoRenew } from "@/lib/payments/renewal";
import { adminClient } from "@/lib/supabase/admin";

/** Kullanıcının kendi profil satırından yenileme alanları (RLS’siz okuma için açık user_id filtresi) */
async function myProfile(userId: string) {
  const { data } = await adminClient().from("profiles").select("plan_id, plan_period, plan_expires_at, discount_code, auto_renew").eq("id", userId).maybeSingle();
  return data ?? { plan_id: "free" };
}

/** D234: Hesap → Otomatik yenileme durumu */
export const GET = route("payments.autorenew", async () => {
  const s = await requireUser();
  const available = recurringEnabled() && !!paytrCreds();
  if (!available) return json({ available: false });
  const st = await renewalState(s.user.id, await myProfile(s.user.id));
  return json({ available: true, ...st });
});

const Body = z.object({ action: z.enum(["off", "on", "remove_card"]) });

/** İptal (her zaman serbest), yeniden açma (kayıtlı kart varsa) ve kayıtlı kartı silme */
export const POST = route("payments.autorenew.set", async (req) => {
  const s = await requireUser();
  const b = await parseBody(req, Body);
  let removedAtProvider = true;
  if (b.action === "remove_card") ({ removedAtProvider } = await removeStoredCard(paytrCreds(), s.user.id));
  else if (!(await setAutoRenew(s.user.id, b.action === "on"))) throw new ApiError(409, "Yeniden açmak için kayıtlı kart yok. Süreyi uzatırken kartınızın saklanmasını onaylayın.", "no_card");
  const st = await renewalState(s.user.id, await myProfile(s.user.id));
  return json({ ok: true, removedAtProvider, ...st });
});
