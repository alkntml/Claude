"use client";
import { ExternalLink, FileText, ListChecks, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import type { JournalSuggestion } from "@/lib/sources/journals";

/** Konuya uygun gerçek dergiler (OpenAlex), ön yazı ve dergi kılavuzuna uygunluk kontrolü */
export function JournalModal({ open, onClose, projectId, hasGuideline, onCoverLetter, onChecklist, onUploadGuideline }: {
  open: boolean; onClose: () => void; projectId: string; hasGuideline: boolean;
  onCoverLetter: (j: JournalSuggestion) => void; onChecklist: () => void; onUploadGuideline: () => void;
}) {
  const { t } = useT();
  const [q, setQ] = useState("");
  const [data, setData] = useState<{ query: string; journals: JournalSuggestion[]; ownVenues: { name: string; count: number }[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(query?: string) {
    setBusy(true); setError(null);
    try {
      const r = await api<typeof data & object>(`/api/projects/${projectId}/journals${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      setData(r); setQ(r.query);
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  useEffect(() => { if (open && !data && !busy) load(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal open={open} onClose={onClose} title={t("Dergi önerisi ve gönderime hazırlık")} wide>
      <div className="space-y-4">
        <p className="text-[13px] text-ink-500">{t("Liste, konunuza benzer makalelerin son 6 yılda OpenAlex’te gerçekten yayımlandığı dergilerden oluşur; yapay zekâ dergi adı üretmez. Göndermeden önce derginin dizinlendiği yerleri (TR Dizin, Web of Science, Scopus, DOAJ) ve yayın ücretini mutlaka kontrol edin.")}</p>
        <form onSubmit={(e) => { e.preventDefault(); load(q); }} className="flex gap-2">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Anahtar kelimeler (tercihen İngilizce)")} />
          <Button type="submit" loading={busy}><Search className="h-4 w-4" /> {t("Ara")}</Button>
        </form>
        <div className="flex flex-wrap gap-2 rounded-2xl bg-ink-50 p-3 text-[13px]">
          <span className="w-full font-medium text-ink-800">{t("Dergiyi seçtikten sonra:")}</span>
          {!hasGuideline
            ? <Button size="sm" variant="secondary" onClick={onUploadGuideline}><FileText className="h-3.5 w-3.5" /> {t("Derginin yazar kılavuzunu yükle")}</Button>
            : <Button size="sm" variant="secondary" onClick={onChecklist}><ListChecks className="h-3.5 w-3.5" /> {t("Kılavuza uygunluk kontrol listesi")}</Button>}
          <span className="self-center text-xs text-ink-500">{t("Kılavuzu yükleyince asistan çalışmanızı kurallarla karşılaştırır.")}</span>
        </div>
        {busy && !data && <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Dergiler aranıyor…")}</p>}
        {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        {data && (
          <>
            {data.journals.length === 0 && <p className="text-sm text-ink-500">{t("Bu anahtar kelimelerle dergi bulunamadı. İngilizce ve daha genel kelimeler deneyin.")}</p>}
            <ul className="space-y-2">
              {data.journals.map((j) => (
                <li key={j.id} className="rounded-2xl border border-ink-100 p-3.5">
                  <div className="flex flex-wrap items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink-900">{j.name}</p>
                      <p className="text-xs text-ink-500">{[j.publisher, j.issn ? `ISSN ${j.issn}` : null].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone="brand">{t("Bu konuda {n} makale", { n: j.count })}</Badge>
                      {j.isOa && <Badge tone="green">{t("Açık erişim")}</Badge>}
                      {j.inDoaj && <Badge tone="green">DOAJ</Badge>}
                      {j.hIndex ? <Badge>h-{t("endeksi")} {j.hIndex}</Badge> : null}
                      {j.fromProjectSources ? <Badge tone="violet">{t("{n} kaynağınız bu dergide", { n: j.fromProjectSources })}</Badge> : null}
                    </div>
                  </div>
                  {j.examples.length > 0 && <p className="mt-1.5 line-clamp-2 text-xs text-ink-400">{t("Örnek:")} {j.examples.map((e) => `${e.title} (${e.year ?? "t.y."})`).join(" · ")}</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onCoverLetter(j)}>{t("Bu dergi için ön yazı hazırla")}</Button>
                    <a href={j.homepage || `https://openalex.org/${j.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1 rounded-[10px] px-2.5 text-[13px] font-medium text-brand-700 hover:bg-brand-50">{t("Dergiyi aç")} <ExternalLink className="h-3.5 w-3.5" /></a>
                  </div>
                </li>
              ))}
            </ul>
            {data.ownVenues.length > 0 && (
              <div className="rounded-2xl border border-ink-100 p-3.5 text-[13px]">
                <p className="font-medium text-ink-800">{t("Kaynaklarınızın yayımlandığı dergiler")}</p>
                <p className="mt-1 text-ink-600">{data.ownVenues.map((v) => `${v.name} (${v.count})`).join(" · ")}</p>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
