"use client";
import { MessageSquareReply } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";

/** Dergiden gelen editör/hakem yorumlarını alır; cevap mektubu asistan panelinde hazırlanır. */
export function ReviewerModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (comments: string) => void }) {
  const { t } = useT();
  const [text, setText] = useState("");
  const tooLong = text.length > 30000;
  return (
    <Modal open={open} onClose={onClose} title={t("Hakem yorumlarına cevap")} wide footer={<>
      <Button variant="ghost" onClick={onClose}>{t("Vazgeç")}</Button>
      <Button disabled={text.trim().length < 20 || tooLong} onClick={() => { onSubmit(text.trim()); onClose(); }}><MessageSquareReply className="h-4 w-4" /> {t("Cevap mektubu hazırla")}</Button>
    </>}>
      <div className="space-y-3">
        <p className="text-[13.5px] text-ink-600">{t("Dergiden gelen editör kararını ve hakem yorumlarını olduğu gibi yapıştırın. Asistan çalışmanızın mevcut hâlini okuyarak her yoruma madde madde cevap veren bir mektup hazırlar ve metinde yapmanız gereken değişiklikleri sıralar.")}</p>
        <textarea className="input min-h-[260px] font-mono !text-[13px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Reviewer 1:\n1. The sample size is small…\n2. …\n\nReviewer 2:\n…")} />
        <div className="flex flex-wrap justify-between gap-2 text-xs text-ink-400">
          <span>{t("Henüz yapmadığınız değişiklikler mektupta [YAPILACAK: …] olarak işaretlenir; sayfa numaraları sizin doldurmanız için boş bırakılır.")}</span>
          <span className={tooLong ? "text-rose-600" : ""}>{text.length.toLocaleString()} / 30.000</span>
        </div>
      </div>
    </Modal>
  );
}
