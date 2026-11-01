import { getT } from "@/i18n/server";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { enabledOAuthProviders } from "@/lib/auth-providers";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Giriş yap") };
}
export default async function Page() {
  const providers = await enabledOAuthProviders();
  return <Suspense><AuthForm mode="login" providers={providers} /></Suspense>;
}
