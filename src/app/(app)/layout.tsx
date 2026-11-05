import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getWorkLock } from "@/lib/lock";
import { memberCode } from "@/lib/member";
import { grantReferralReward } from "@/lib/growth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  if (!s) redirect("/giris");
  // Davet ödülü (D55): davet edilen kişi e-postasını doğruladıysa, hangi sayfayı açarsa açsın ikisine de otomatik tanımlanır
  const pr = s.profile as { referred_by?: string | null; referral_rewarded_at?: string | null };
  if (pr.referred_by && !pr.referral_rewarded_at) await grantReferralReward(s.user.id, !!s.user.email_confirmed_at).catch(() => false);
  // D81: hak dolunca çalışma kilitlenmez; yalnızca bilgilendirme şeridi gösterilir
  const { reasons } = await getWorkLock();
  return (
    <AppShell user={{ name: s.profile.full_name ?? "", email: s.profile.email ?? s.user.email ?? "", plan: s.profile.plan_id, isAdmin: s.profile.role === "admin", isOrgAdmin: s.profile.org?.role === "admin", orgName: s.profile.org?.name ?? null, memberNo: memberCode(s.profile.member_no) }} limitReached={reasons.length > 0} expiresAt={s.profile.plan_id !== "free" && s.profile.role !== "admin" ? s.profile.plan_expires_at ?? null : null}>
      {children}
    </AppShell>
  );
}
