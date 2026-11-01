import { redirect } from "next/navigation";
import { OrgAdminView } from "@/components/dashboard/org-admin";
import { getT } from "@/i18n/server";
import { getSession } from "@/lib/auth";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kurumum") };
}
export const dynamic = "force-dynamic";

export default async function OrgPage() {
  const s = await getSession();
  if (!s) redirect("/giris?next=/kurum");
  if (s.profile.org?.role !== "admin") redirect("/hesap");
  return <OrgAdminView />;
}
