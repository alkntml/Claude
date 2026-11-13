import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getWorkLock } from "@/lib/lock";
import { memberCode } from "@/lib/member";
import { grantReferralReward } from "@/lib/growth";
import { deviceFromCookie, recordDevice } from "@/lib/devices";
import { watchDevices } from "@/lib/single-watch";
import { requireLegalAcceptance } from "@/lib/legal/server";

export const dynamic = "force-dynamic";

/** Oturum gerektiren uygulama sayfaları arama motorlarında listelenmez (D107) */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  if (!s) redirect("/giris");
  // D154: zorunlu hukuki belgenin güncel sürümü kabul edilmediyse (Google/Apple ile ilk giriş, yeni sürüm) onay sayfasına
  await requireLegalAcceptance(s);
  // Davet ödülü (D55): davet edilen kişi e-postasını doğruladıysa, hangi sayfayı açarsa açsın ikisine de otomatik tanımlanır
  const pr = s.profile as { referred_by?: string | null; referral_rewarded_at?: string | null };
  if (pr.referred_by && !pr.referral_rewarded_at) {
    // D101: bekleyen davet ödülünde önce bu cihaz kaydedilir, davet edenin cihazıyla aynıysa ödül verilmez
    const device = await deviceFromCookie();
    await recordDevice(s.user.id, device);
    await grantReferralReward(s.user.id, device).catch(() => false);
  }
  // D109: Tek Proje — hesap paylaşımı işareti için cihazlar kaydedilir (yalnızca bu pakette; engellemez)
  if (s.profile.plan_id === "single" && s.profile.role !== "admin") await watchDevices(s.user.id, s.profile, await deviceFromCookie()).catch(() => {});
  // D155: sayfa/yapay zekâ hakkı dolunca salt okunur (görüntüle + indir); yalnızca tarama dolduysa bilgi şeridi
  const { reasons, locked } = await getWorkLock();
  return (
    <AppShell user={{ name: s.profile.full_name ?? "", email: s.profile.email ?? s.user.email ?? "", plan: s.profile.plan_id, isAdmin: s.profile.role === "admin", isOrgAdmin: s.profile.org?.role === "admin", orgName: s.profile.org?.name ?? null, memberNo: memberCode(s.profile.member_no) }} limitReached={reasons.length > 0} readOnly={locked} expiresAt={s.profile.plan_id !== "free" && s.profile.role !== "admin" ? s.profile.plan_expires_at ?? null : null}>
      {children}
    </AppShell>
  );
}
