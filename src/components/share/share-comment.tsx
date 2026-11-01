"use client";
import { useT } from "@/i18n/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";

export function ShareComment({ token, stages }: { token: string; stages: { id: string; title: string }[] }) {
  const { t } = useT();
  const toast = useToast();
  const [stageId, setStageId] = useState(stages[0]?.id ?? "");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  async function send() {
    setBusy(true);
    try {
      await api(`/api/share/${token}/comments`, { method: "POST", json: { stageId, name, body } });
      setBody("");
      toast({ tone: "success", title: t("Yorumunuz iletildi"), detail: t("Yazar, ilgili bölümün yorumlarında görecek.") });
    } catch (e) { toast({ tone: "error", title: t("Gönderilemedi"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
      <p className="font-semibold text-ink-800">{t("Danışman yorumu")}</p>
      <div className="mt-3 space-y-2">
        <select className="input !py-2 text-sm" value={stageId} onChange={(e) => setStageId(e.target.value)}>{stages.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select>
        <input className="input !py-2 text-sm" placeholder={t("Adınız")} value={name} onChange={(e) => setName(e.target.value)} />
        <textarea className="input min-h-[100px] text-sm" placeholder={t("Geri bildiriminiz…")} value={body} onChange={(e) => setBody(e.target.value)} />
        <Button size="sm" className="w-full" onClick={send} loading={busy} disabled={name.trim().length < 2 || body.trim().length < 2}>{t("Gönder")}</Button>
      </div>
    </div>
  );
}
