import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getWorkLock } from "@/lib/lock";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  if (!s) redirect("/giris");
  const { locked } = await getWorkLock();
  return (
    <AppShell user={{ name: s.profile.full_name ?? "", email: s.profile.email ?? s.user.email ?? "", plan: s.profile.plan_id, isAdmin: s.profile.role === "admin", isOrgAdmin: s.profile.org?.role === "admin", orgName: s.profile.org?.name ?? null }} locked={locked} expiresAt={s.profile.plan_id !== "free" ? s.profile.plan_expires_at ?? null : null}>
      {children}
    </AppShell>
  );
}
