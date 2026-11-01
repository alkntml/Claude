import { getT } from "@/i18n/server";
import { CheckCircle2, CircleDashed } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/icons";
import { integrationStatus } from "@/lib/env";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Kurulum durumu") };
}
export const dynamic = "force-dynamic";

export default async function Setup() {
  const { t } = await getT();
  const s = integrationStatus();
  const rows: [string, boolean, string, boolean][] = [
    [t("Supabase (veritabanı, kimlik doğrulama, depolama)"), s.supabase, "NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY", true],
    [t("Supabase service role (kullanım kayıtları, yönetim)"), s.supabaseServiceRole, "SUPABASE_SERVICE_ROLE_KEY", true],
    [t("Anthropic Claude (yapay zekâ)"), s.anthropic, "ANTHROPIC_API_KEY", true],
    [t("OpenAI (isteğe bağlı ikinci sağlayıcı)"), s.openai, "OPENAI_API_KEY", false],
    [t("Akademik API iletişim e-postası (OpenAlex/Crossref/Unpaywall)"), s.contactEmail, "ACADEMIC_CONTACT_EMAIL", true],
    [t("Semantic Scholar API anahtarı"), s.semanticScholarKey, "SEMANTIC_SCHOLAR_API_KEY", false],
    [t("CORE API anahtarı"), s.coreKey, "CORE_API_KEY", false],
    [t("Stripe ödemeleri"), s.stripe, "STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET", false],
  ];
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/"><Logo /></Link>
      <h1 className="mt-10 text-3xl font-semibold tracking-tight">{t("Kurulum durumu")}</h1>
      <p className="mt-2 text-ink-500">{t("Platformun çalışması için aşağıdaki ortam değişkenlerinin sunucuda tanımlanması gerekir. Ayrıntılı adımlar README.md dosyasındadır.")}</p>
      <div className="card mt-8 divide-y divide-ink-100">
        {rows.map(([label, ok, vars, req]) => (
          <div key={label} className="flex items-start gap-3 p-4">
            {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" /> : <CircleDashed className={`mt-0.5 h-5 w-5 ${req ? "text-rose-400" : "text-ink-300"}`} />}
            <div>
              <p className="font-medium text-ink-800">{label} {!req && <span className="text-xs font-normal text-ink-400">({t("isteğe bağlı")})</span>}</p>
              <p className="mt-0.5 font-mono text-xs text-ink-500">{vars}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
