import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { activeCredits, referralReward } from "@/lib/growth";
import { planLimits } from "@/lib/usage";
import { getSetting } from "@/lib/settings";
import { adminClient } from "@/lib/supabase/admin";

/** Davet bağlantısı ve istatistikleri, kurum üyeliği */
export const GET = route("account.growth", async (req) => {
  const s = await requireUser();
  const [ref, reward, limits] = await Promise.all([getSetting("referral"), referralReward(), planLimits(s.profile.plan_id)]);
  const credits = await activeCredits(s.user.id, { ai: limits.ai_requests_month, search: limits.source_searches_month, pages: limits.pages_month });
  const db = adminClient();
  const [{ count: invited }, { count: rewarded }] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", s.user.id),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", s.user.id).not("referral_rewarded_at", "is", null),
  ]);
  const origin = env.appUrl || new URL(req.url).origin;
  return json({
    referral: ref.enabled && s.profile.referral_code ? { code: s.profile.referral_code, link: `${origin}/davet/${s.profile.referral_code}`, invited: invited ?? 0, rewarded: rewarded ?? 0, reward: { ai_requests: reward.ai_requests, source_searches: reward.source_searches, pages: reward.pages, valid_days: ref.valid_days } } : null,
    credits,
    org: s.profile.org ?? null,
    personalPlan: s.profile.personal_plan_id ?? s.profile.plan_id,
  });
});
