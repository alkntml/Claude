import { pageMeta } from "@/lib/seo-server";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { enabledOAuthProviders } from "@/lib/auth-providers";
export async function generateMetadata() {
  return pageMeta("/giris");
}
export default async function Page() {
  const providers = await enabledOAuthProviders();
  return <Suspense><AuthForm mode="login" providers={providers} /></Suspense>;
}
