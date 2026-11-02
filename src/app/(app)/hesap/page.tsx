import { getT } from "@/i18n/server";
import { Suspense } from "react";
import { AccountView } from "@/components/dashboard/account";
import { getSession } from "@/lib/auth";
import { publicPlans } from "@/lib/plans";
import { effectiveLimits, usageSummary } from "@/lib/usage";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Hesap ve abonelik") };
}

export default async function Page() {
  const s = (await getSession())!;
  const [usage, limits, plans] = await Promise.all([
    usageSummary(s.user.id).catch(() => null),
    effectiveLimits(s.user.id, s.profile.plan_id).catch(() => ({})),
    publicPlans(),
  ]);
  return <Suspense><AccountView profile={s.profile} usage={usage} limits={limits} plans={plans} /></Suspense>;
}
