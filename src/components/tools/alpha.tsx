"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { cronbachAlpha } from "@/lib/stats/tests";
import { alphaVerdict, parseNumericTable, reverseScore } from "@/lib/tools/table-parse";
import { CopyButton, useToolPing } from "./shared";

const EXAMPLE = "M1\tM2\tM3\tM4\tM5\n4\t5\t4\t4\t2\n3\t3\t4\t3\t3\n5\t5\t5\t4\t1\n2\t2\t3\t2\t4\n4\t4\t4\t5\t2\n1\t2\t1\t2\t5\n3\t4\t3\t3\t3\n5\t4\t5\t5\t1";
const f2 = (v: number) => v.toFixed(2).replace(/^(-?)0\./, "$1.");

/** Cronbach alfa hesaplayıcı (D90): veriler tarayıcıdan çıkmaz, yapay zekâ yok */
export function AlphaTool() {
  const { t } = useT();
  const ping = useToolPing("alpha");
  const [text, setText] = useState("");
  const [rev, setRev] = useState<number[]>([]);
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(5);
  const table = useMemo(() => parseNumericTable(text), [text]);
  const result = useMemo(() => {
    if (table.names.length < 2 || table.rows.length < 3) return null;
    try { return cronbachAlpha(reverseScore(table.rows, rev, min, max), table.names); } catch (e) { return { error: (e as Error).message } as const; }
  }, [table, rev, min, max]);
  const ok = result && !("error" in result) ? result : null;
  const sentence = ok ? t("Ölçeğin iç tutarlılık katsayısı Cronbach α = {a} olarak bulunmuştur (k = {k}, n = {n}).", { a: f2(ok.alpha), k: ok.k, n: ok.n }) : "";
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="card space-y-4 p-5">
        <label className="block">
          <span className="label">{t("Verileri yapıştırın")}</span>
          <textarea className="input min-h-[220px] font-mono text-[13px]" value={text} onChange={(e) => { setText(e.target.value); setRev([]); ping(); }} placeholder={t("Excel veya SPSS’ten kopyalayın: her satır bir katılımcı, her sütun bir madde. İlk satır madde adları olabilir.")} />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <Button size="sm" variant="ghost" onClick={() => { setText(EXAMPLE); setRev([4]); ping(); }}>{t("Örnek veriyle dene")}</Button>
          {table.rows.length > 0 && <span>{t("{n} katılımcı, {k} madde okundu", { n: table.rows.length, k: table.names.length })}{table.dropped ? ` · ${t("{d} eksik verili satır çıkarıldı", { d: table.dropped })}` : ""}</span>}
        </div>
        {table.names.length >= 2 && (
          <div>
            <span className="label">{t("Ters puanlanan maddeler")}</span>
            <div className="flex flex-wrap gap-1.5">{table.names.map((n, j) => <button key={j} type="button" onClick={() => setRev((r) => (r.includes(j) ? r.filter((x) => x !== j) : [...r, j]))} className={cn("rounded-lg border px-2.5 py-1 text-[13px]", rev.includes(j) ? "border-brand-400 bg-brand-50 text-brand-800" : "border-ink-200 text-ink-600")}>{n}</button>)}</div>
            <div className="mt-2 flex items-center gap-2 text-sm text-ink-600">{t("Ölçek aralığı")} <input type="number" className="input !w-20 !py-1.5" value={min} onChange={(e) => setMin(Number(e.target.value))} /> – <input type="number" className="input !w-20 !py-1.5" value={max} onChange={(e) => setMax(Number(e.target.value))} /></div>
          </div>
        )}
        <p className="text-xs text-ink-400">{t("Verileriniz bilgisayarınızdan çıkmaz; hesaplama tarayıcınızda yapılır.")}</p>
      </div>
      <div className="space-y-4">
        {!result && <div className="card p-6 text-center text-sm text-ink-500">{t("En az 2 madde ve 3 katılımcı içeren veriyi yapıştırın.")}</div>}
        {result && "error" in result && <div className="card p-6 text-center text-rose-600">{t(result.error)}</div>}
        {ok && (
          <>
            <div className="card flex flex-wrap items-center justify-between gap-4 p-6">
              <div><p className="text-sm text-ink-500">Cronbach α</p><p className="font-serif text-6xl font-semibold tracking-tight text-ink-950">{f2(ok.alpha)}</p></div>
              <div className="text-right"><p className="text-lg font-semibold text-ink-900">{t(alphaVerdict(ok.alpha))}</p><p className="text-xs text-ink-400">{t("George ve Mallery (2003) eşikleri")}</p></div>
            </div>
            <div className="card overflow-x-auto p-5">
              <table className="apa">
                <thead><tr><th>{t("Madde")}</th><th>{t("Ort.")}</th><th>{t("SS")}</th><th>{t("Düzeltilmiş madde-toplam r")}</th><th>{t("Madde silinirse α")}</th></tr></thead>
                <tbody>{ok.items.map((it) => (
                  <tr key={it.name}><td>{it.name}{rev.includes(table.names.indexOf(it.name)) ? " (T)" : ""}</td><td>{it.mean.toFixed(2)}</td><td>{it.sd.toFixed(2)}</td>
                    <td className={it.itemTotal < 0.3 ? "font-semibold text-amber-700" : ""}>{f2(it.itemTotal)}</td>
                    <td className={it.alphaIfDeleted > ok.alpha ? "font-semibold text-amber-700" : ""}>{f2(it.alphaIfDeleted)}</td></tr>
                ))}</tbody>
              </table>
              <p className="mt-3 text-xs text-ink-500">{t("Madde-toplam korelasyonu .30’un altında olan veya silindiğinde alfayı yükselten maddeler vurgulanmıştır; çıkarma kararını kuramsal gerekçeyle verin.")}</p>
            </div>
            <div className="card p-5">
              <div className="mb-2 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-ink-900">{t("Bulgular için örnek cümle")}</p><CopyButton html={`<p>${sentence}</p>`} text={sentence} /></div>
              <p className="font-serif text-[15.5px] text-ink-800">{sentence}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
