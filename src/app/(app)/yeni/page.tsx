import { Suspense } from "react";
import { NewProjectWizard } from "@/components/dashboard/new-project";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Yeni çalışma" };

export default async function Page() {
  const s = await getSession();
  return <Suspense><NewProjectWizard defaultStyle={s?.profile.default_citation_style ?? "apa7"} /></Suspense>;
}
