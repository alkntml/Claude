import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
export const metadata = { title: "Kayıt ol" };
export default function Page() {
  return <Suspense><AuthForm mode="signup" /></Suspense>;
}
