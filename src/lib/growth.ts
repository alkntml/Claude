import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSetting } from "@/lib/settings";
import { adminClient } from "@/lib/supabase/admin";

/* Kurumsal lisans, kullanım kredileri ve davet ödülü (sunucu) */

export interface OrgInfo { id: string; name: string; plan_id: string; role: "admin" | "member"; seats: number; active: boolean; expires_at: string | null }

/** Kullanıcının etkin kurum üyeliği (kurum pasif veya süresi dolmuşsa null). Tablo yoksa (migration çalıştırılmadıysa) null. */
export async function activeOrg(db: SupabaseClient, userId: string): Promise<OrgInfo | null> {
  try {
    const { data, error } = await db.from("organization_members").select("role, organizations(id, name, plan_id, seats, active, expires_at)").eq("user_id", userId).maybeSingle();
    if (error || !data) return null;
    const o = (Array.isArray(data.organizations) ? data.organizations[0] : data.organizations) as Omit<OrgInfo, "role"> | null;
    if (!o || !o.active || (o.expires_at && new Date(o.expires_at) < new Date())) return null;
    return { ...o, role: data.role as OrgInfo["role"] };
  } catch {
    return null;
  }
}

/** Süresi dolmamış kredilerin toplamı (aylık limite eklenir) */
export async function activeCredits(userId: string): Promise<{ ai_requests: number; source_searches: number }> {
  const out = { ai_requests: 0, source_searches: 0 };
  try {
    const { data } = await adminClient().from("usage_credits").select("kind, amount, expires_at").eq("user_id", userId);
    const now = Date.now();
    for (const c of data ?? []) {
      if (c.expires_at && new Date(c.expires_at).getTime() < now) continue;
      if (c.kind === "ai_requests") out.ai_requests += c.amount;
      if (c.kind === "source_searches") out.source_searches += c.amount;
    }
  } catch { /* tablo yoksa kredi yok */ }
  return out;
}

/**
 * Davet ödülü: davet edilen kullanıcı e-postasını doğruladığında (bir kez) her iki tarafa kredi verilir.
 * Kötüye kullanıma karşı: davet edenin aylık ödül sayısı sınırlı, kendi kendini davet geçersiz.
 */
export async function grantReferralReward(userId: string, emailConfirmed: boolean): Promise<boolean> {
  if (!emailConfirmed) return false;
  const cfg = await getSetting("referral");
  if (!cfg.enabled) return false;
  const db = adminClient();
  try {
    const { data: p } = await db.from("profiles").select("id, referred_by, referral_rewarded_at").eq("id", userId).maybeSingle();
    if (!p?.referred_by || p.referral_rewarded_at || p.referred_by === userId) return false;
    // Önce işaretle (eşzamanlı isteklerde çift ödül olmasın)
    const { data: claimed } = await db.from("profiles").update({ referral_rewarded_at: new Date().toISOString() }).eq("id", userId).is("referral_rewarded_at", null).select("id");
    if (!claimed?.length) return false;
    const monthStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString();
    const { count } = await db.from("usage_credits").select("id", { count: "exact", head: true }).eq("user_id", p.referred_by).eq("reason", "referral_inviter").gte("created_at", monthStart);
    const expires = new Date(Date.now() + cfg.valid_days * 86_400_000).toISOString();
    const rows: { user_id: string; kind: string; amount: number; reason: string; expires_at: string }[] = [
      { user_id: userId, kind: "ai_requests", amount: cfg.ai_requests, reason: "referral_invitee", expires_at: expires },
      { user_id: userId, kind: "source_searches", amount: cfg.source_searches, reason: "referral_invitee", expires_at: expires },
    ];
    if ((count ?? 0) < cfg.monthly_cap * 2) {
      rows.push(
        { user_id: p.referred_by, kind: "ai_requests", amount: cfg.ai_requests, reason: "referral_inviter", expires_at: expires },
        { user_id: p.referred_by, kind: "source_searches", amount: cfg.source_searches, reason: "referral_inviter", expires_at: expires },
      );
    }
    await db.from("usage_credits").insert(rows);
    return true;
  } catch {
    return false;
  }
}
