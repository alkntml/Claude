import { getT } from "@/i18n/server";
import { Suspense } from "react";
import { AccountView } from "@/components/dashboard/account";
import { getSession } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";
import { effectiveLimits, forClient, usageSummary } from "@/lib/usage";
import { getWorkLock } from "@/lib/lock";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Hesap ve abonelik") };
}

export default async function Page() {
  const s = (await getSession())!;
  const [usage, limits, plans, lock] = await Promise.all([
    usageSummary(s.user.id).catch(() => null),
    effectiveLimits(s.user.id, s.profile.plan_id).catch(() => ({})),
    publicPlans(),
    getWorkLock(),
  ]);
  return <Suspense><AccountView profile={s.profile} usage={forClient(usage, limits).usage} limits={forClient(usage, limits).limits} plans={plans} locked={lock.locked} /></Suspense>;
}
