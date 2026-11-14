import { getT } from "@/i18n/server";
import Link from "next/link";
import { Users } from "lucide-react";
import { Logo } from "@/components/icons";
import { AcceptInvite } from "@/components/workspace/accept-invite";
import { getSession } from "@/lib/auth";
import { inviteProblem, INVITE_PROBLEM_TEXT, maskEmail, ROLE_HINT, ROLE_LABEL } from "@/lib/coauthors";
import { isSupabaseConfigured } from "@/lib/env";
import { displayName } from "@/lib/project-access";
import { adminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Ortak yazar daveti"), robots: { index: false, follow: false } };
}

/** Ortak yazar daveti (D115): davet edilen kişi bağlantıyı açar, davetin gönderildiği e-postayla giriş yapıp kabul eder. */
export default async function CoauthorInvite({ params }: { params: Promise<{ token: string }> }) {
  const { t } = await getT();
  const { token } = await params;
  const valid = isSupabaseConfigured() && /^[A-Za-z0-9_-]{32,64}$/.test(token);
  const admin = valid ? adminClient() : null;
  const { data: inv } = admin ? await admin.from("project_invites").select("email, role, expires_at, accepted_at, accepted_by, project_id, invited_by").eq("token", token).maybeSingle() : { data: null };
  const [{ data: project }, { data: from }] = inv && admin
    ? await Promise.all([admin.from("projects").select("id, title, user_id").eq("id", inv.project_id).maybeSingle(), admin.from("profiles").select("full_name, email").eq("id", inv.invited_by).maybeSingle()])
    : [{ data: null }, { data: null }];
  const s = await getSession().catch(() => null);
  const member = s && project ? (await admin!.from("project_members").select("role").eq("project_id", project.id).eq("user_id", s.user.id).maybeSingle()).data : null;
  const problem = s ? inviteProblem(inv && project ? inv : null, { id: s.user.id, email: s.user.email ?? null }, project?.user_id ?? null)
    : !inv || !project ? "not_found" : inv.accepted_at ? "used" : new Date(inv.expires_at).getTime() < Date.now() ? "expired" : null;
  const next = encodeURIComponent(`/ortak/${token}`);

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link href="/" aria-label="Academiana"><Logo /></Link></div>
        <div className="card space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Users className="h-5 w-5" /></span>
            <div><h1 className="font-display text-xl font-semibold text-ink-900">{t("Ortak yazar daveti")}</h1>{inv && project && <p className="text-[13px] text-ink-500">{t("{name} sizi çalışmasına davet etti", { name: displayName(from) })}</p>}</div>
          </div>
          {inv && project && (
            <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
              <p className="text-[12px] uppercase tracking-wide text-ink-400">{t("Çalışma")}</p>
              <p className="mt-0.5 font-semibold text-ink-900">{project.title}</p>
              <p className="mt-3 text-[12px] uppercase tracking-wide text-ink-400">{t("Rolünüz")}</p>
              <p className="mt-0.5 text-[14px] font-medium text-ink-800">{t(ROLE_LABEL[inv.role as "editor" | "commenter" | "advisor"])}</p>
              <p className="text-[13px] text-ink-500">{t(ROLE_HINT[inv.role as "editor" | "commenter" | "advisor"])}</p>
              <p className="mt-3 text-[12px] text-ink-400">{t("Davet edilen adres: {e}", { e: maskEmail(inv.email) })}</p>
            </div>
          )}
          {member && project ? (
            <Link href={`/proje/${project.id}`} className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-[14px] font-medium text-white hover:to-brand-700">{t("Çalışmayı aç")}</Link>
          ) : problem && !(problem === "wrong_email" && !s) ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-[14px] text-amber-800">{t(INVITE_PROBLEM_TEXT[problem])}{problem === "wrong_email" && s?.user.email ? ` ${t("Şu an {e} ile giriş yaptınız.", { e: s.user.email })}` : ""}</p>
          ) : !s ? (
            <div className="space-y-2">
              <p className="text-[14px] text-ink-600">{t("Daveti kabul etmek için davetin gönderildiği e-posta adresiyle giriş yapın. Hesabınız yoksa aynı adresle ücretsiz kaydolun.")}</p>
              <Link href={`/giris?next=${next}`} className="flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-b from-brand-500 to-brand-600 text-[14px] font-medium text-white hover:to-brand-700">{t("Giriş yap")}</Link>
              <Link href={`/kayit?next=${next}`} className="flex h-11 w-full items-center justify-center rounded-xl border border-ink-200 text-[14px] font-medium text-ink-700 hover:border-ink-300">{t("Ücretsiz kaydol")}</Link>
            </div>
          ) : (
            <AcceptInvite token={token} />
          )}
          <p className="text-[12px] leading-relaxed text-ink-400">{t("Ortak yazar olarak yapay zekâ özelliklerini kendi paketinizle kullanırsınız; çalışmanın sahibinin haklarından düşmez. Dosyalarınız ve asistan sohbetleriniz size özel kalır.")}</p>
        </div>
      </div>
    </main>
  );
}
