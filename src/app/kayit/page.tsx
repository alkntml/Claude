import { pageMeta } from "@/lib/seo-server";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { enabledOAuthProviders } from "@/lib/auth-providers";
export async function generateMetadata() {
  return pageMeta("/kayit");
}
export default async function Page() {
  const providers = await enabledOAuthProviders();
  return <Suspense><AuthForm mode="signup" providers={providers} /></Suspense>;
}
