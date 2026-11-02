"use client";
import { Check, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

interface Idea { title: string; note: string }

/** Adım 1: çalışma başlığının seçimi (öneriler + kendi başlığı) */
export function TitleChooser({ open, onClose, projectId, currentTitle, onChoose }: { open: boolean; onClose: () => void; projectId: string; currentTitle: string; onChoose: (title: string) => Promise<void> }) {
  const { t } = useT();
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState<string>(currentTitle);
  const [hint, setHint] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(h?: string) {
    setBusy(true); setError(null);
    try { const r = await api<{ titles: Idea[] }>(`/api/projects/${projectId}/titles`, { method: "POST", json: { hint: h || undefined } }); setIdeas(r.titles); if (r.titles[0]) setPick(r.titles[0].title); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  useEffect(() => { if (open && !ideas && !busy) load(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function choose() {
    if (!pick.trim()) return;
    setSaving(true);
    try { await onChoose(pick.trim()); onClose(); } finally { setSaving(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Adım 1: Çalışmanızın başlığını seçin")} wide footer={<>
      <Button variant="ghost" onClick={onClose}>{t("Sonra seçeceğim")}</Button>
      <Button onClick={choose} loading={saving} disabled={!pick.trim()}><Check className="h-4 w-4" /> {t("Bu başlıkla devam et")}</Button>
    </>}>
      <div className="space-y-4">
        <p className="text-[13.5px] text-ink-600">{t("Başlık, çalışmanın neyi, kimde ve nasıl incelediğini gösterir; sonraki bütün bölümler buna göre yazılır. Konunuza göre hazırlanan önerilerden birini seçin veya düzenleyin. Başlığı daha sonra da değiştirebilirsiniz.")}</p>
        {busy && !ideas && <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Başlık önerileri hazırlanıyor…")}</p>}
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {ideas && (
          <ul className="space-y-2">
            {ideas.map((i) => (
              <li key={i.title}>
                <button type="button" onClick={() => setPick(i.title)} className={cn("flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition", pick === i.title ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-100" : "border-ink-100 hover:border-ink-200")}>
                  <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", pick === i.title ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300")}>{pick === i.title && <Check className="h-3 w-3" />}</span>
                  <span><span className="block font-serif text-[16.5px] font-medium leading-snug text-ink-950">{i.title}</span>{i.note && <span className="mt-0.5 block text-[12.5px] text-ink-500">{i.note}</span>}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="block"><span className="label">{t("Seçilen başlık (dilediğiniz gibi düzenleyebilirsiniz)")}</span><textarea className="input min-h-[64px] font-serif !text-[15.5px]" value={pick} onChange={(e) => setPick(e.target.value)} maxLength={300} /></label>
        <div className="flex flex-wrap gap-2">
          <input className="input min-w-0 flex-1" value={hint} onChange={(e) => setHint(e.target.value)} placeholder={t("İsteğinizi yazın (ör. daha kısa olsun, ortaokul öğrencileriyle sınırla)")} />
          <Button variant="secondary" onClick={() => load(hint)} loading={busy}>{ideas ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />} {ideas ? t("Yeni öneriler") : t("Öneri al")}</Button>
        </div>
      </div>
    </Modal>
  );
}
