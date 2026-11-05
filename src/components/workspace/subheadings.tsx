"use client";
import { ListTree, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { streamChat } from "@/lib/ai/chat-client";
import { parseHeadingLines } from "@/lib/autopilot";
import { sameHeading } from "@/lib/workflows/structure";
import { parseAnswer } from "./markdown";

export interface SubheadingParent { index: number; title: string; number: string; level: number }

/**
 * Alt başlık oluştur (D83): önce kaç alt başlık istendiği sorulur, yapay zekâ o sayıda başlık önerir,
 * kullanıcı düzenler ve onaylar. Bölümün kendisi için ## düzeyinde, seçili bir alt başlık için bir alt düzeyde.
 */
export function SubheadingModal({ open, onClose, projectId, stage, parent, suggested, existing, onCreate }: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  stage: { id: string; title: string };
  parent: SubheadingParent | null;
  suggested: number;
  existing: string[];
  onCreate: (titles: string[]) => void;
}) {
  const { t } = useT();
  const [count, setCount] = useState(suggested);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (open) { setCount(Math.min(8, Math.max(1, suggested))); setText(""); setError(""); } }, [open, suggested]);

  const target = parent ? `${parent.number ? `${parent.number} ` : ""}${parent.title}` : stage.title;
  const lines = text.split("\n").map((l) => l.replace(/^[#\-*•\d.)\s]+/, "").trim()).filter((l) => l.length > 1).slice(0, 8);

  async function suggest() {
    setBusy(true);
    setError("");
    let answer = "";
    try {
      const msg = parent
        ? t("“{p}” alt başlığının altına tam olarak {n} adet daha dar kapsamlı alt başlık öner. Her biri üst başlığın ayrı bir yönünü ele alsın; üst başlığı veya bölüm adını tekrar etme.", { p: target, n: count })
        : t("Bu bölüm için tam olarak {n} adet alt başlık öner. Her biri bölümün birbirinden belirgin biçimde ayrı bir alt konusunu ele alsın; bölüm adını tekrar etme. Kurgudaki bölüm planına uy.", { n: count });
      const rules = t("Akademik başlık yazım kurallarına uy (kısa, açık, soru cümlesi değil). Yalnızca bir :::taslak bloğu içinde her satıra bir başlık yaz; numara veya açıklama ekleme.");
      const ex = existing.length ? `\n${t("Mevcut alt başlıklar (tekrar etme):")} ${existing.join(" | ")}` : "";
      await streamChat({ projectId, stageId: stage.id, conversationId: null, action: "outline", message: `${msg}\n${rules}${ex}` }, new AbortController().signal, (ev, data) => { if (ev === "text") answer += data.text; }, t("Hata"));
      const draft = parseAnswer(answer).parts.find((p) => p.kind === "draft")?.text ?? answer;
      const heads = parseHeadingLines(draft, parent?.title ?? stage.title, count, sameHeading).filter((h) => !existing.some((x) => sameHeading(x, h)));
      if (!heads.length) setError(t("Öneri alınamadı. Başlıkları kendiniz yazabilir veya tekrar deneyebilirsiniz."));
      else setText(heads.join("\n"));
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Alt başlık oluştur")} footer={<>
      <Button variant="ghost" onClick={onClose}>{t("Vazgeç")}</Button>
      <Button disabled={!lines.length || busy} onClick={() => { onCreate(lines); onClose(); }}><ListTree className="h-4 w-4" /> {t("{n} alt başlık oluştur", { n: lines.length })}</Button>
    </>}>
      <div className="space-y-4">
        <p className="text-[13.5px] text-ink-600">{parent ? t("“{p}” başlığının altına bir alt düzeyde başlıklar eklenecek.", { p: target }) : t("“{p}” bölümüne alt başlıklar eklenecek.", { p: target })} {t("Her alt başlığa sol taraftaki listeden ayrı ayrı girip çalışabilirsiniz; indirirken çalışma tek belge olarak, kurallara uygun numaralarla aktarılır.")}</p>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="label">{t("Kaç alt başlık?")}</span>
            <input type="number" min={1} max={8} value={count} onChange={(e) => setCount(Math.min(8, Math.max(1, Number(e.target.value) || 1)))} className="input w-24" />
          </label>
          <Button variant="secondary" onClick={suggest} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {t("Başlıkları öner")}</Button>
        </div>
        <label className="block">
          <span className="label">{t("Alt başlıklar (her satıra bir tane; düzenleyebilirsiniz)")}</span>
          <textarea className="input min-h-[150px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Önerileri getirin ya da başlıkları kendiniz yazın…")} />
        </label>
        {error && <p className="text-[13px] text-rose-600">{error}</p>}
        <p className="text-xs text-ink-400">{t("Numaralar (ör. 3.1, 3.1.1) seçtiğiniz yazım kuralına göre belgede otomatik verilir; başlıklara numara yazmayın.")}</p>
      </div>
    </Modal>
  );
}
