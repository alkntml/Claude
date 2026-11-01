import { getT } from "@/i18n/server";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Giriş yap") };
}
export default function Page() {
  return <Suspense><AuthForm mode="login" /></Suspense>;
}
