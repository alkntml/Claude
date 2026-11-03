import { getT } from "@/i18n/server";
import { ResetPasswordForm } from "@/components/auth/password-forms";

export async function generateMetadata() {
  const { t } = await getT();
  return { title: t("Yeni şifre belirleyin"), robots: { index: false, follow: false } };
}

export default function Page() {
  return <ResetPasswordForm />;
}
