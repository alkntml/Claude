"use client";
import { Download, FilePlus2, Loader2, Sparkles, Table2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import type { JSONNode } from "@/lib/editor/doc";

/* eslint-disable @typescript-eslint/no-explicit-any */
const COLS = [["purpose", "Amaç"], ["method", "Yöntem"], ["sample", "Örneklem"], ["findings", "Bulgular"], ["relevance", "Çalışmamızla ilişkisi"]] as const;

function authorYear(s: any, nd: string) {
  const fam = (s.authors ?? []).map((a: any) => a.literal ?? a.family).filter(Boolean);
  const who = fam.length > 2 ? `${fam[0]} et al.` : fam.join(" & ") || "—";
  return `${who} (${s.year ?? nd})`;
}

/** Literatür matrisi: her kaynak için amaç, yöntem, örneklem, bulgular. CSV indirme ve belgeye tablo ekleme. */
export function MatrixModal({ open, onClose, projectId, sources, setSources, language, onInsertTable }: {
  open: boolean; onClose: () => void; projectId: string; sources: any[]; setSources: (fn: (s: any[]) => any[]) => void; language: string;
  onInsertTable?: (node: JSONNode) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const missing = sources.filter((s) => !s.summary);
  const empty = (s: any) => s.summary?.basedOn === "metadata";

  async function generate() {
    setBusy(true);
    setProgress(0);
    try {
      for (let i = 0; i < missing.length; i += 4) {
        const ids = missing.slice(i, i + 4).map((s) => s.id);
        const r = await api<{ sources: any[] }>(`/api/projects/${projectId}/matrix`, { method: "POST", json: { sourceIds: ids } });
        setSources((l) => l.map((x) => r.sources.find((y) => y.id === x.id) ?? x));
        setProgress(Math.min(missing.length, i + 4));
      }
    } catch (e) {
      toast({ tone: "error", title: t("Matris oluşturulamadı"), detail: (e as Error).message });
    } finally { setBusy(false); }
  }

  function csv() {
    const sep = language === "en" ? "," : ";";
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const head = [t("Kaynak"), t("Başlık"), ...COLS.map(([, l]) => t(l)), t("Erişim")];
    const rows = sources.map((s) => [authorYear(s, t("t.y.")), s.title, ...COLS.map(([k]) => s.summary?.[k] ?? ""), t(s.access_level === "full_text" ? "Tam metin okundu" : s.access_level === "abstract" ? "Özet okundu" : "Yalnızca künye")]);
    const body = "﻿" + [head, ...rows].map((r) => r.map(esc).join(sep)).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
    a.download = "literatur-matrisi.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /** Belgeye eklenecek tablo: ilk sütunda canlı atıf düğümü */
  function insert() {
    const cell = (content: JSONNode[], header = false): JSONNode => ({ type: header ? "tableHeader" : "tableCell", content: [{ type: "paragraph", content }] });
    const txt = (s: string): JSONNode[] => (s ? [{ type: "text", text: s }] : []);
    const rows: JSONNode[] = [
      { type: "tableRow", content: [cell(txt(t("Kaynak")), true), ...COLS.slice(0, 4).map(([, l]) => cell(txt(t(l)), true))] },
      ...sources.filter((s) => s.summary && !empty(s)).map((s) => ({ type: "tableRow", content: [cell([{ type: "citation", attrs: { ids: [s.id], locator: null, narrative: true } }]), ...COLS.slice(0, 4).map(([k]) => cell(txt(s.summary?.[k] ?? "")))] })),
    ];
    onInsertTable?.({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: t("Tablo 1. Literatür özeti"), marks: [{ type: "italic" }] }] }, { type: "table", content: rows }] });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Literatür matrisi")} wide
      footer={<>
        <Button variant="ghost" onClick={csv} disabled={!sources.length}><Download className="h-4 w-4" /> {t("Excel için indir (CSV)")}</Button>
        {onInsertTable && <Button variant="secondary" onClick={insert} disabled={!sources.some((s) => s.summary && !empty(s))}><FilePlus2 className="h-4 w-4" /> {t("Belgeye tablo olarak ekle")}</Button>}
        {missing.length > 0 && <Button onClick={generate} loading={busy}><Sparkles className="h-4 w-4" /> {t("Eksik {n} kaynağı özetle", { n: missing.length })}</Button>}
      </>}>
      <p className="mb-3 text-sm text-ink-500">{t("Her kaynağın amacı, yöntemi, örneklemi ve bulguları yalnızca okunan özet veya tam metinden çıkarılır; metinde olmayan bilgi boş bırakılır. Yalnızca künyesi bilinen kaynaklar için içerik yazılmaz.")}</p>
      {busy && <p className="mb-3 flex items-center gap-2 text-sm text-brand-700"><Loader2 className="h-4 w-4 animate-spin" /> {t("{d}/{n} kaynak özetlendi…", { d: progress, n: missing.length })}</p>}
      {sources.length === 0 ? <p className="text-sm text-ink-400">{t("Henüz kaynak yok")}</p> : (
        <div className="max-h-[60vh] overflow-auto rounded-xl border border-ink-100">
          <table className="w-full min-w-[760px] border-collapse text-left text-[12.5px]">
            <thead className="sticky top-0 bg-ink-50 text-[11px] uppercase tracking-wide text-ink-500"><tr><th className="px-2.5 py-2">{t("Kaynak")}</th>{COLS.map(([k, l]) => <th key={k} className="px-2.5 py-2">{t(l)}</th>)}</tr></thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} className="border-t border-ink-100 align-top">
                  <td className="w-44 px-2.5 py-2"><p className="font-medium text-ink-800">{authorYear(s, t("t.y."))}</p><p className="line-clamp-2 text-ink-500">{s.title}</p></td>
                  {empty(s) ? <td colSpan={COLS.length} className="px-2.5 py-2 italic text-ink-400">{t("Yalnızca künye — içerik okunmadı; özet veya PDF eklenirse doldurulabilir.")}</td>
                    : COLS.map(([k]) => <td key={k} className="px-2.5 py-2 text-ink-700">{s.summary ? (s.summary[k] || <span className="text-ink-300">—</span>) : <span className="text-ink-300">…</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export function MatrixButton({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return <Button size="sm" variant="soft" onClick={onClick}><Table2 className="h-3.5 w-3.5" /> {t("Literatür matrisi")}</Button>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
