import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { adminClient } from "@/lib/supabase/admin";

/** Cihaz kimliği (D101): çerezdeki rastgele değerin SHA-256 özeti (istemcideki deviceHash ile aynı) */
export async function deviceFromCookie(): Promise<string | null> {
  try {
    const raw = (await cookies()).get("acd_did")?.value ?? "";
    return /^[0-9a-f-]{36}$/.test(raw) ? createHash("sha256").update(raw).digest("hex") : null;
  } catch {
    return null;
  }
}

/** Kullanıcının bu cihazı kullandığını kaydeder (tablo yoksa sessizce atlanır) */
export async function recordDevice(userId: string, device: string | null | undefined): Promise<void> {
  if (!device || !/^[0-9a-f]{64}$/.test(device)) return;
  await adminClient().from("user_devices").upsert({ user_id: userId, device, last_seen: new Date().toISOString() }, { onConflict: "user_id,device" }).then(() => undefined, () => undefined);
}

/** Davet edilen kişinin cihazlarından biri davet edenin cihazlarıyla aynı mı? */
export async function sharesDevice(inviterId: string, inviteeId: string, extra?: string | null): Promise<boolean> {
  const db = adminClient();
  const { data: mine } = await db.from("user_devices").select("device").eq("user_id", inviteeId);
  const set = new Set([...(mine ?? []).map((d) => d.device as string), ...(extra ? [extra] : [])]);
  const { data: p } = await db.from("profiles").select("signup_device").eq("id", inviteeId).maybeSingle();
  if (p?.signup_device) set.add(p.signup_device as string);
  if (!set.size) return false;
  const { data } = await db.from("user_devices").select("device").eq("user_id", inviterId).in("device", [...set]).limit(1);
  return !!data?.length;
}
