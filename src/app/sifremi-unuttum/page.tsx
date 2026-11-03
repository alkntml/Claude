import { Suspense } from "react";
import { getT } from "@/i18n/server";
import { ForgotPasswordForm } from "@/components/auth/password-forms";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Şifremi unuttum"), robots: { index: false, follow: true } };
}

export default function Page() {
  return <Suspense><ForgotPasswordForm /></Suspense>;
}
