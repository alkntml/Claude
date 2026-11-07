"use client";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

/** Ortak yazar davetini kabul düğmesi (D115) */
export function AcceptInvite({ token }: { token: string }) {
  const { t } = useT();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function accept() {
    setBusy(true);
    try {
      const { projectId } = await api<{ projectId: string }>(`/api/coauthor/${token}`, { method: "POST" });
      toast({ tone: "success", title: t("Davet kabul edildi"), detail: t("Çalışma panelinizde “Benimle paylaşılanlar” altında da görünür.") });
      router.push(`/proje/${projectId}`);
    } catch (e) { toast({ tone: "error", title: t("Kabul edilemedi"), detail: (e as Error).message }); setBusy(false); }
  }
  return <Button className="w-full" onClick={accept} loading={busy}><Check className="h-4 w-4" /> {t("Daveti kabul et")}</Button>;
}
