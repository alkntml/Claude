import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ConsentForm } from "@/components/auth/consent-form";
import { getSession } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { pendingForSession, safeNext } from "@/lib/legal/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Sözleşme onayı (D154): Google/Apple ile ilk girişte ve zorunlu bir belgenin yeni sürümü yayımlandığında
 * uygulama sayfaları açılmadan önce gösterilir.
 */
export default async function ConsentPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!isSupabaseConfigured()) redirect("/kurulum");
  const s = await getSession();
  const { next } = await searchParams;
  const back = safeNext(next);
  if (!s) redirect(`/giris?next=${encodeURIComponent(`/sozlesme-onayi?next=${back}`)}`);
  const pending = await pendingForSession(s);
  if (!pending.length) redirect(back);
  return <ConsentForm next={back} docs={pending.map((d) => d.id)} email={s.profile.email ?? s.user.email ?? ""} />;
}
