import { Suspense } from "react";
import { AccountView } from "@/components/dashboard/account";
import { getSession } from "@/lib/auth";
import { availableProviders } from "@/lib/payments";
import { publicPlans } from "@/lib/plans";
import { planLimits, usageSummary } from "@/lib/usage";

export const metadata = { title: "Hesap ve abonelik" };

export default async function Page() {
  const s = (await getSession())!;
  const [usage, limits, plans, subs] = await Promise.all([
    usageSummary(s.user.id).catch(() => null),
    planLimits(s.profile.plan_id).catch(() => ({})),
    publicPlans(),
    s.supabase.from("subscriptions").select("*").eq("user_id", s.user.id).order("created_at", { ascending: false }).limit(3),
  ]);
  return <Suspense><AccountView profile={s.profile} usage={usage} limits={limits} plans={plans} subscriptions={subs.data ?? []} payments={availableProviders()} /></Suspense>;
}
