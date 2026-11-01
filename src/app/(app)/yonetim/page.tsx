import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/admin/admin-panel";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Yönetim" };

export default async function Page() {
  const s = await getSession();
  if (s?.profile.role !== "admin") redirect("/panel");
  return <AdminPanel selfId={s.user.id} />;
}
