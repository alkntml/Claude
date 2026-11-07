"use client";
/**
 * Çoklu belge analizi (D132): 2–8 kaynağı seçip birlikte soru sorma veya karşılaştırmalı sentez (uyuşmalar,
 * ayrışmalar, boşluklar). Cevaptaki atıflar canlı atıf olarak belgeye eklenebilir; karşılaştırma tablo olarak eklenir.
 */
import { BookOpenCheck, ClipboardCopy, Download, FilePlus2, GitCompare, Layers, Loader2, MessagesSquare, Quote } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import type { JSONNode } from "@/lib/editor/doc";
import { Markdown } from "./markdown";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Compare = { rows: { label: string; aim: string; design: string; sample: string; findings: string; limitations: string }[]; agreements: { point: string; labels: string[] }[]; disagreements: { point: string; labels: string[]; why: string }[]; gaps: string[] };
type Result = { mode: "ask" | "compare"; answer: string | null; compare: Compare | null; labels: { label: string; id: string; access: string; evidence: number }[] };
const COLS = [["aim", "Amaç"], ["design", "Yöntem / desen"], ["sample", "Örneklem"], ["findings", "Temel bulgular"], ["limitations", "Sınırlılıklar"]] as const;

export function MultiAnalyzeButton({ onClick }: { onClick: () => void }) {
  const { t } = useT();
  return <Button size="sm" variant="soft" onClick={onClick}><Layers className="h-3.5 w-3.5" /> {t("Birlikte analiz et")}</Button>;
}

export function MultiAnalyzeModal({ open, onClose, projectId, sources, canInsert, onInsertMarkdown, onInsertTable }: {
  open: boolean; onClose: () => void; projectId: string; sources: any[]; canInsert: boolean;
  onInsertMarkdown?: (md: string, sourceMap: Record<string, string>) => void; onInsertTable?: (node: JSONNode) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const readable = useMemo(() => sources.filter((s) => s.access_level !== "metadata"), [sources]);
  const [picked, setPicked] = useState<string[]>(() => readable.filter((s) => s.access_level === "full_text").slice(0, 4).map((s) => s.id));
  const [mode, setMode] = useState<"ask" | "compare">("compare");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const byId = useMemo(() => new Map(sources.map((s) => [s.id, s])), [sources]);
  const map = useMemo(() => Object.fromEntries((res?.labels ?? []).map((l) => [l.label, l.id])), [res]);
  const nameOf = (label: string) => { const s = byId.get(map[label]); if (!s) return label; const a = (s.authors ?? [])[0]; return `${a?.family ?? a?.literal ?? "—"}${(s.authors?.length ?? 0) > 1 ? " vd." : ""} (${s.year ?? "t.y."})`; };

  function toggle(id: string) {
    setPicked((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length >= 8 ? l : [...l, id]));
  }
  async function run() {
    setBusy(true); setRes(null);
    try { setRes(await api<Result>(`/api/projects/${projectId}/sources/analyze`, { method: "POST", json: { sourceIds: picked, mode, question: q } })); }
    catch (e) { toast({ tone: "error", title: t("Analiz yapılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }

  function compareMarkdown(c: Compare): string {
    const lines: string[] = [];
    if (c.agreements.length) lines.push(`**${t("Kaynakların uyuştuğu noktalar")}**`, ...c.agreements.map((a) => `- ${a.point} [[kaynak:${a.labels.join(",")}]]`), "");
    if (c.disagreements.length) lines.push(`**${t("Ayrışan bulgular")}**`, ...c.disagreements.map((a) => `- ${a.point} [[kaynak:${a.labels.join(",")}]] — ${a.why}`), "");
    if (c.gaps.length) lines.push(`**${t("Araştırma boşlukları")}**`, ...c.gaps.map((g) => `- ${g}`));
    return lines.join("\n");
  }
  function insertTable(c: Compare) {
    const cell = (content: JSONNode[], header = false): JSONNode => ({ type: header ? "tableHeader" : "tableCell", content: [{ type: "paragraph", content }] });
    const txt = (s: string): JSONNode[] => (s ? [{ type: "text", text: s }] : []);
    const rows: JSONNode[] = [
      { type: "tableRow", content: [cell(txt(t("Çalışma")), true), ...COLS.map(([, l]) => cell(txt(t(l)), true))] },
      ...c.rows.filter((r) => map[r.label]).map((r) => ({ type: "tableRow", content: [cell([{ type: "citation", attrs: { ids: [map[r.label]], locator: null, narrative: true } }]), ...COLS.map(([k]) => cell(txt(r[k])))] })),
    ];
    onInsertTable?.({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: t("Tablo. Çalışmaların karşılaştırması"), marks: [{ type: "italic" }] }] }, { type: "table", content: rows }] });
    toast({ tone: "success", title: t("Tablo belgeye eklendi") });
  }
  function csv(c: Compare) {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = "﻿" + [[t("Çalışma"), ...COLS.map(([, l]) => t(l))], ...c.rows.map((r) => [nameOf(r.label), ...COLS.map(([k]) => r[k])])].map((r) => r.map(esc).join(";")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" })); a.download = "kaynak-karsilastirma.csv"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Kaynakları birlikte analiz et")} wide>
      <div className="space-y-4">
        <p className="text-[13px] text-ink-600">{t("2–8 kaynak seçin. Yapay zekâ yalnızca okunan metinlerden (tam metin parçaları ve özetler) yararlanır; her bilgi kaynağına ve sayfasına bağlanır. Yalnızca künyesi bilinen kaynaklar seçilemez.")}</p>
        <div className="flex gap-1.5">
          {([["compare", GitCompare, "Karşılaştır (uyuşma, ayrışma, boşluk)"], ["ask", MessagesSquare, "Hepsine birlikte sor"]] as const).map(([m, Icon, l]) => (
            <button key={m} onClick={() => setMode(m)} className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium", mode === m ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-600 hover:bg-ink-200")}><Icon className="h-4 w-4" /> {t(l)}</button>
          ))}
        </div>
        <div className="max-h-48 overflow-y-auto rounded-xl border border-ink-100">
          {readable.length === 0 && <p className="p-3 text-[13px] text-ink-500">{t("Özeti veya tam metni okunmuş kaynak yok.")}</p>}
          {readable.map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2.5 border-b border-ink-50 px-3 py-2 text-[13px] last:border-0 hover:bg-ink-50">
              <input type="checkbox" className="h-4 w-4" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px]", s.access_level === "full_text" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>{s.access_level === "full_text" ? t("Tam metin") : t("Özet")}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="input flex-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder={mode === "ask" ? t("Ör. Bu çalışmalar öz düzenlemeyi nasıl ölçmüş?") : t("İsteğe bağlı odak: ör. çevrim içi öğrenmede geri bildirimin etkisi")} />
          <Button onClick={run} loading={busy} disabled={picked.length < 2 || (mode === "ask" && q.trim().length < 3)}><BookOpenCheck className="h-4 w-4" /> {mode === "ask" ? t("Sor") : t("Karşılaştır")} ({picked.length})</Button>
        </div>
        {busy && <p className="flex items-center gap-2 text-[13px] text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Kaynaklar okunuyor…")}</p>}

        {res?.answer && (
          <div className="rounded-2xl border border-ink-100 bg-white p-4">
            <Markdown text={res.answer} sourceMap={map} />
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-ink-50 pt-2.5">
              {onInsertMarkdown && <Button size="sm" variant="soft" disabled={!canInsert} title={canInsert ? undefined : t("Önce editörde bir bölüm açın")} onClick={() => onInsertMarkdown(res.answer!, map)}><Quote className="h-3.5 w-3.5" /> {t("Atıflarla metne ekle")}</Button>}
              <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(res.answer!).then(() => toast({ tone: "success", title: t("Kopyalandı") }), () => {})}><ClipboardCopy className="h-3.5 w-3.5" /> {t("Kopyala")}</Button>
            </div>
          </div>
        )}

        {res?.compare && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-2xl border border-ink-100">
              <table className="w-full min-w-[720px] text-left text-[12.5px]">
                <thead className="bg-ink-50 text-ink-600"><tr><th className="px-3 py-2">{t("Çalışma")}</th>{COLS.map(([k, l]) => <th key={k} className="px-3 py-2">{t(l)}</th>)}</tr></thead>
                <tbody>{res.compare.rows.map((r) => <tr key={r.label} className="border-t border-ink-100 align-top"><td className="px-3 py-2 font-medium text-ink-900">{r.label} · {nameOf(r.label)}</td>{COLS.map(([k]) => <td key={k} className="px-3 py-2 text-ink-700">{r[k]}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Box tone="emerald" title={t("Uyuşan noktalar")} items={res.compare.agreements.map((a) => ({ text: a.point, who: a.labels.map(nameOf).join(", ") }))} empty={t("Belirgin bir uyuşma bulunmadı.")} />
              <Box tone="rose" title={t("Ayrışan / çelişen bulgular")} items={res.compare.disagreements.map((a) => ({ text: a.point, who: a.labels.map(nameOf).join(", "), why: a.why }))} empty={t("Belirgin bir çelişki bulunmadı.")} />
              <Box tone="amber" title={t("Araştırma boşlukları")} items={res.compare.gaps.map((g) => ({ text: g }))} empty={t("Boşluk belirtilmedi.")} />
            </div>
            <div className="flex flex-wrap gap-2">
              {onInsertTable && <Button size="sm" variant="secondary" disabled={!canInsert} onClick={() => insertTable(res.compare!)}><FilePlus2 className="h-4 w-4" /> {t("Tabloyu belgeye ekle")}</Button>}
              {onInsertMarkdown && <Button size="sm" variant="secondary" disabled={!canInsert} onClick={() => onInsertMarkdown(compareMarkdown(res.compare!), map)}><Quote className="h-4 w-4" /> {t("Sentezi atıflarla metne ekle")}</Button>}
              <Button size="sm" variant="ghost" onClick={() => csv(res.compare!)}><Download className="h-4 w-4" /> CSV</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Box({ tone, title, items, empty }: { tone: "emerald" | "rose" | "amber"; title: string; items: { text: string; who?: string; why?: string }[]; empty: string }) {
  const c = { emerald: "border-emerald-200 bg-emerald-50/60", rose: "border-rose-200 bg-rose-50/60", amber: "border-amber-200 bg-amber-50/60" }[tone];
  return (
    <div className={cn("rounded-2xl border p-3", c)}>
      <p className="mb-1.5 text-[13px] font-semibold text-ink-900">{title}</p>
      {items.length ? <ul className="space-y-1.5 text-[12.5px] text-ink-700">{items.map((x, i) => <li key={i}>{x.text}{x.who && <span className="block text-[11.5px] text-ink-500">{x.who}</span>}{x.why && <span className="block text-[11.5px] italic text-ink-500">{x.why}</span>}</li>)}</ul> : <p className="text-[12.5px] text-ink-500">{empty}</p>}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
