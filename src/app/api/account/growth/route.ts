import { json, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { env } from "@/lib/env";
import { activeCredits } from "@/lib/growth";
import { isStudentEmail } from "@/lib/pricing";
import { getSetting } from "@/lib/settings";
import { adminClient } from "@/lib/supabase/admin";

/** Davet bağlantısı ve istatistikleri, kurum üyeliği, öğrenci indirimi uygunluğu */
export const GET = route("account.growth", async (req) => {
  const s = await requireUser();
  const [ref, student, credits] = await Promise.all([getSetting("referral"), getSetting("billing.student"), activeCredits(s.user.id)]);
  const db = adminClient();
  const [{ count: invited }, { count: rewarded }] = await Promise.all([
    db.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", s.user.id),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("referred_by", s.user.id).not("referral_rewarded_at", "is", null),
  ]);
  const origin = env.appUrl || new URL(req.url).origin;
  return json({
    referral: ref.enabled && s.profile.referral_code ? { code: s.profile.referral_code, link: `${origin}/davet/${s.profile.referral_code}`, invited: invited ?? 0, rewarded: rewarded ?? 0, reward: { ai_requests: ref.ai_requests, source_searches: ref.source_searches, valid_days: ref.valid_days } } : null,
    credits,
    org: s.profile.org ?? null,
    personalPlan: s.profile.personal_plan_id ?? s.profile.plan_id,
    student: { enabled: student.enabled, percent: student.percent, eligible: student.enabled && !!s.user.email_confirmed_at && isStudentEmail(s.user.email, student.domains), domains: student.domains },
  });
});
