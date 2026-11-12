import { json, route } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { referralReward } from "@/lib/growth";
import { adminClient } from "@/lib/supabase/admin";
import { monthStart } from "@/lib/usage";

type Ref = { id: string; email: string | null; referred_by: string; referral_rewarded_at: string | null; created_at: string };

/** Yönetim → Davetler (D55): davet sayaçları, ödüller, en çok davet edenler, son davetler */
export const GET = route("admin.referrals", async () => {
  await requireAdmin();
  const db = adminClient();
  const since = monthStart();
  const refs: Ref[] = [];
  for (let from = 0; from < 200000; from += 1000) {
    const { data } = await db.from("profiles").select("id, email, referred_by, referral_rewarded_at, created_at").not("referred_by", "is", null).order("created_at", { ascending: false }).range(from, from + 999);
    refs.push(...((data ?? []) as Ref[]));
    if (!data || data.length < 1000) break;
  }
  const [cfg, inviterMonth, inviteeMonth] = await Promise.all([
    getSetting("referral"),
    db.from("usage_credits").select("user_id, amount").eq("reason", "referral_inviter").eq("kind", "ai_requests").gte("created_at", since).limit(10000),
    db.from("usage_credits").select("user_id, amount").eq("reason", "referral_invitee").eq("kind", "ai_requests").gte("created_at", since).limit(10000),
  ]);
  const inviterIds = [...new Set(refs.map((r) => r.referred_by))];
  const emails: Record<string, string | null> = {};
  for (let i = 0; i < inviterIds.length; i += 200) {
    const { data } = await db.from("profiles").select("id, email").in("id", inviterIds.slice(i, i + 200));
    for (const p of data ?? []) emails[p.id] = p.email;
  }
  const by: Record<string, { invited: number; rewarded: number; month: number }> = {};
  for (const r of refs) {
    by[r.referred_by] ??= { invited: 0, rewarded: 0, month: 0 };
    by[r.referred_by].invited++;
    if (r.referral_rewarded_at) by[r.referred_by].rewarded++;
    if (r.referral_rewarded_at && r.referral_rewarded_at >= since) by[r.referred_by].month++;
  }
  // D99: ödül yalnızca davet edene verilir; bu ay ödüllenen davetler (doğrulama zamanı)
  const rewardedMonth = refs.filter((r) => r.referral_rewarded_at && r.referral_rewarded_at >= since).length;
  const reward = await referralReward();
  const inviterRewardsMonth = (inviterMonth.data ?? []).length;
  return json({
    settings: { ...cfg, ai_requests: reward.ai_requests, source_searches: reward.source_searches, pages: reward.pages },
    totals: {
      invited: refs.length,
      rewarded: refs.filter((r) => r.referral_rewarded_at).length,
      pending: refs.filter((r) => !r.referral_rewarded_at).length,
      rewardedMonth,
      inviterRewardsMonth,
      // Aylık sınıra takıldığı için davet edene ödül verilmeyenler
      cappedMonth: Math.max(0, rewardedMonth - inviterRewardsMonth),
      aiGrantedMonth: [...(inviterMonth.data ?? []), ...(inviteeMonth.data ?? [])].reduce((a, c) => a + c.amount, 0),
    },
    top: Object.entries(by).sort((a, b) => b[1].rewarded - a[1].rewarded || b[1].invited - a[1].invited).slice(0, 20)
      .map(([id, v]) => ({ id, email: emails[id] ?? null, ...v })),
    recent: refs.slice(0, 30).map((r) => ({ email: r.email, inviter: emails[r.referred_by] ?? null, created_at: r.created_at, rewarded_at: r.referral_rewarded_at })),
  });
});
