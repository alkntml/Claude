import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  if (!s) redirect("/giris");
  return (
    <AppShell user={{ name: s.profile.full_name ?? "", email: s.profile.email ?? s.user.email ?? "", plan: s.profile.plan_id, isAdmin: s.profile.role === "admin" }}>
      {children}
    </AppShell>
  );
}
