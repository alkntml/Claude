"use client";
import { Download, FileUp, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Zotero / Mendeley / EndNote ile kaynak alışverişi: BibTeX, RIS, CSL-JSON içe aktarma; BibTeX/RIS dışa aktarma */
export function RefsImportExport({ projectId, onAdded }: { projectId: string; onAdded: (rows: any[]) => void }) {
  const { t } = useT();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function importFile(file: File) {
    if (file.size > 4_000_000) { toast({ tone: "error", title: t("Dosya çok büyük"), detail: t("En fazla 4 MB’lık kaynak dosyası yükleyin.") }); return; }
    setBusy(true);
    try {
      const text = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase();
      const format = ext === "bib" ? "bibtex" : ext === "ris" ? "ris" : ext === "json" ? "csljson" : null;
      const r = await api<{ format: string; found: number; truncated: number; added: any[]; duplicates: number; invalid: number }>(`/api/projects/${projectId}/sources/import`, { method: "POST", json: { text, format } });
      onAdded(r.added);
      const verified = r.added.filter((x) => x.verified).length;
      toast({
        tone: r.added.length ? "success" : "info",
        title: t("{n} kaynak içe aktarıldı", { n: r.added.length }),
        detail: [
          t("{n} tanesi DOI ile doğrulandı", { n: verified }),
          r.duplicates ? t("{n} tanesi zaten projedeydi", { n: r.duplicates }) : "",
          r.invalid ? t("{n} kayıt eksik bilgi nedeniyle atlandı", { n: r.invalid }) : "",
          r.truncated ? t("Tek seferde en fazla 300 kayıt aktarılır; {n} kayıt aktarılmadı.", { n: r.truncated }) : "",
        ].filter(Boolean).join(" · "),
      });
    } catch (e) {
      toast({ tone: "error", title: t("İçe aktarılamadı"), detail: (e as Error).message });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const btn = "inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-ink-200 bg-white px-2.5 text-[12.5px] font-medium text-ink-700 transition hover:bg-ink-50";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <label className={cn(btn, "cursor-pointer")} title={t("Zotero, Mendeley veya EndNote’tan dışa aktardığınız .bib, .ris ya da .json dosyası")}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileUp className="h-3.5 w-3.5" />} {t("İçe aktar")}
        <input ref={input} type="file" accept=".bib,.ris,.json,.txt" className="hidden" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); }} />
      </label>
      <div className="relative">
        <button type="button" onClick={() => setOpen((o) => !o)} className={btn}><Download className="h-3.5 w-3.5" /> {t("Dışa aktar")}</button>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <div className="absolute left-0 top-9 z-40 w-64 rounded-xl border border-ink-100 bg-white p-1.5 text-[13px] shadow-xl">
              {[["bib", "all", "BibTeX (.bib) — tüm kaynaklar"], ["bib", "cited", "BibTeX (.bib) — yalnızca atıf yapılanlar"], ["ris", "all", "RIS (.ris) — tüm kaynaklar"], ["ris", "cited", "RIS (.ris) — yalnızca atıf yapılanlar"]].map(([f, sc, l]) => (
                <a key={f + sc} href={`/api/projects/${projectId}/sources/export?format=${f}&scope=${sc}`} onClick={() => setOpen(false)} className="block rounded-lg px-2.5 py-1.5 text-ink-700 hover:bg-ink-50">{t(l)}</a>
              ))}
              <p className="px-2.5 pb-1 pt-1 text-[11px] text-ink-400">{t("Zotero, Mendeley ve EndNote bu dosyaları doğrudan içe aktarır.")}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
