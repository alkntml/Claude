"use client";
import { CheckCircle2, FileUp, Loader2, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { handlePlanError } from "@/lib/client";
import type { JSONNode } from "@/lib/editor/doc";

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ImportResult {
  nodes: JSONNode[];
  sources: any[];
  report: { refsTotal: number; refsAdded: number; refsReused: number; refsUnverified: string[]; linked: number; unmatched: string[]; images: number; headings: number };
}

/**
 * Word’den içe aktar (D87): belge metni yeniden yazılmadan bölüme yerleşir; kaynakça doğrulanıp kaynaklara
 * eklenir, metin içi atıflar gerçek atıflara dönüşür. Sonuç raporu gösterilir.
 */
export function ImportDocModal({ open, onClose, projectId, target, base, max, dropTitle, onImported }: {
  open: boolean;
  onClose: () => void;
  projectId: string;
  /** Kullanıcıya gösterilen hedef (ör. “3.1 Araştırmanın yöntemi” veya “3.1.2 Ölçekler”) */
  target: string;
  base: number;
  max: number;
  dropTitle: string | null;
  onImported: (r: ImportResult) => Promise<void> | void;
}) {
  const { t } = useT();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<ImportResult["report"] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setFile(null); setError(""); setDone(null); } }, [open]);

  async function run() {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("base", String(base));
      fd.append("max", String(max));
      if (dropTitle) fd.append("dropTitle", dropTitle);
      const res = await fetch(`/api/projects/${projectId}/import-doc`, { method: "POST", body: fd });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { handlePlanError(res.status, j); throw new Error(j.error ?? t("Belge içe aktarılamadı")); }
      await onImported(j as ImportResult);
      setDone((j as ImportResult).report);
    } catch (e) {
      setError((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={t("Word’den içe aktar")} footer={done
      ? <Button onClick={onClose}>{t("Tamam")}</Button>
      : <><Button variant="ghost" onClick={onClose} disabled={busy}>{t("Vazgeç")}</Button><Button onClick={run} disabled={!file || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} {busy ? t("Aktarılıyor…") : t("İçe aktar")}</Button></>}>
      {!done ? (
        <div className="space-y-4 text-[13.5px] text-ink-700">
          <p>{t("Belge “{target}” içine yerleştirilir. Metin yeniden yazılmaz; başlıklar, tablolar ve biçimlendirme korunur.", { target })}</p>
          <ul className="list-disc space-y-1 pl-5 text-ink-600">
            <li>{t("Başlıklardaki elle yazılmış numaralar silinir; numaraları sistem seçtiğiniz kurala göre verir.")}</li>
            <li>{t("Belgenin “Kaynakça” bölümündeki kaynaklar doğrulanıp kaynak listenize eklenir (DOI varsa kayıt otoritesinden).")}</li>
            <li>{t("Metindeki “Yazar (Yıl)” ve “(Yazar, Yıl)” atıfları bu kaynaklara bağlanır ve atıf stilinize göre biçimlenir. Kaynakçada karşılığı olmayan atıflar olduğu gibi bırakılır ve size gösterilir.")}</li>
          </ul>
          <input ref={input} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-white px-4 py-4 text-left transition hover:border-brand-400 hover:bg-brand-50/40">
            <FileUp className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="min-w-0 flex-1 truncate font-medium text-ink-800">{file ? file.name : t("Word belgesi seçin (.docx)")}</span>
          </button>
          {busy && <p className="text-xs text-ink-500">{t("Kaynaklar doğrulanıyor; bu 1 dakika kadar sürebilir.")}</p>}
          {error && <p className="text-[13px] text-rose-600">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3 text-[13.5px] text-ink-700">
          <p className="flex items-center gap-2 font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> {t("Belge çalışmaya eklendi.")}</p>
          <ul className="space-y-1">
            <li>{t("{n} alt başlık", { n: done.headings })}</li>
            <li>{t("Kaynakçada {n} kaynak: {a} yeni eklendi, {r} zaten listenizdeydi", { n: done.refsTotal, a: done.refsAdded, r: done.refsReused })}</li>
            <li>{t("{n} atıf kaynaklara bağlandı", { n: done.linked })}</li>
          </ul>
          {done.refsUnverified.length > 0 && (
            <div className="rounded-xl bg-amber-50 p-3 text-amber-900">
              <p className="flex items-center gap-1.5 font-medium"><TriangleAlert className="h-4 w-4" /> {t("Doğrulanamayan kaynaklar ({n})", { n: done.refsUnverified.length })}</p>
              <p className="mt-0.5 text-xs">{t("Eklendi ama kayıt otoritesinde bulunamadı; Kaynaklar sekmesinden künyesini kontrol edin.")}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs">{done.refsUnverified.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
          {done.unmatched.length > 0 && (
            <div className="rounded-xl bg-ink-50 p-3">
              <p className="font-medium text-ink-800">{t("Kaynakçada karşılığı olmayan atıflar ({n})", { n: done.unmatched.length })}</p>
              <p className="mt-0.5 text-xs text-ink-500">{t("Metinde olduğu gibi bırakıldı. Bunlar çoğunlukla “akt.” ile verilen ikincil kaynaklardır; değilse kaynağı ekleyip atfı elle bağlayın.")}</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-600">{done.unmatched.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          )}
          {done.images > 0 && <p className="text-xs text-ink-500">{t("Belgedeki {n} görsel aktarılmadı; gerekiyorsa Araçlar → Grafik ile ya da şekil olarak ekleyin.", { n: done.images })}</p>}
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
