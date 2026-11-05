"use client";
import { AlertTriangle, ArrowDown, ArrowUp, Globe, Lightbulb, Plus, Printer, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { estimateMinutes, LIKERT_PRESETS, newId, surveyLint, type Question } from "@/lib/surveys";
import { useToolPing } from "./shared";

export const TOOL_SURVEY_KEY = "academiana:tool-survey";
type QType = "single" | "multi" | "likert" | "number" | "text";
const TYPES: { id: QType; label: string }[] = [
  { id: "single", label: "Tek seçimli" }, { id: "multi", label: "Çoklu seçim" }, { id: "likert", label: "Likert ölçeği" }, { id: "number", label: "Sayı" }, { id: "text", label: "Açık uçlu metin" },
];

function blank(type: QType, n: number): Question {
  const base = { id: newId(), code: type === "likert" ? `L${n}_` : `S${n}`, title: "", help: "", required: true };
  if (type === "single" || type === "multi") return { ...base, type, options: ["Seçenek 1", "Seçenek 2"] } as Question;
  if (type === "likert") return { ...base, type, items: ["Madde 1"], points: 5, labels: [...LIKERT_PRESETS.tr[5]], reverse: [] } as Question;
  if (type === "number") return { ...base, type, min: null, max: null } as Question;
  return { ...base, type: "text", long: false } as Question;
}

/** Ücretsiz anket oluşturucu (D90): tarayıcıda hazırlanır, yapay zekâ yok; yazdırılır veya hesap açılınca yayınlanır */
export function SurveyBuilderTool() {
  const { t } = useT();
  const ping = useToolPing("survey_builder");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [qs, setQs] = useState<Question[]>([]);
  const [preview, setPreview] = useState(false);
  // Sayfa yenilense de taslak kaybolmasın (yalnızca bu tarayıcıda)
  useEffect(() => { try { const v = localStorage.getItem(TOOL_SURVEY_KEY); if (v) { const d = JSON.parse(v); setTitle(d.title ?? ""); setDescription(d.description ?? ""); setQs(d.questions ?? []); } } catch { /* yok */ } }, []);
  useEffect(() => { try { if (title || qs.length) localStorage.setItem(TOOL_SURVEY_KEY, JSON.stringify({ title, description, questions: qs })); } catch { /* yok */ } }, [title, description, qs]);
  const set = (i: number, patch: Partial<Question>) => { ping(); setQs((l) => l.map((q, k) => (k === i ? ({ ...q, ...patch } as Question) : q))); };
  const move = (i: number, d: -1 | 1) => setQs((l) => { const n = [...l]; const j = i + d; if (j < 0 || j >= n.length) return l; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const lint = useMemo(() => surveyLint(qs.filter((q) => q.title.trim()), { description }), [qs, description]);
  const minutes = useMemo(() => estimateMinutes(qs), [qs]);
  const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="card space-y-3 p-5 print:hidden">
        <label className="block"><span className="label">{t("Anketin adı")}</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("ör. Üniversite öğrencilerinde dijital okuryazarlık anketi")} /></label>
        <label className="block"><span className="label">{t("Açıklama (katılımcıya)")}</span><textarea className="input min-h-[70px]" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-500">{t("Soru ekle:")}</span>
          {TYPES.map((x) => <button key={x.id} type="button" onClick={() => { ping(); setQs((l) => [...l, blank(x.id, l.length + 1)]); }} className="inline-flex items-center gap-1 rounded-lg border border-ink-200 px-2.5 py-1 text-[13px] text-ink-700 hover:border-brand-300 hover:bg-brand-50"><Plus className="h-3.5 w-3.5" /> {t(x.label)}</button>)}
          <label className="ml-auto flex items-center gap-2 text-[13px] text-ink-600"><input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} /> {t("Önizleme")}</label>
        </div>
      </div>

      {!preview ? (
        <ol className="space-y-3 print:hidden">
          {qs.map((q, i) => (
            <li key={q.id} className="card space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">{i + 1}</span>
                <span className="text-xs text-ink-500">{t(TYPES.find((x) => x.id === q.type)?.label ?? "")}</span>
                <label className="ml-auto flex items-center gap-1.5 text-xs text-ink-600"><input type="checkbox" checked={q.required} onChange={(e) => set(i, { required: e.target.checked })} /> {t("Zorunlu")}</label>
                <button type="button" onClick={() => move(i, -1)} className="rounded p-1 text-ink-400 hover:bg-ink-100" aria-label={t("Yukarı taşı")}><ArrowUp className="h-4 w-4" /></button>
                <button type="button" onClick={() => move(i, 1)} className="rounded p-1 text-ink-400 hover:bg-ink-100" aria-label={t("Aşağı taşı")}><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => setQs((l) => l.filter((_, k) => k !== i))} className="rounded p-1 text-ink-400 hover:bg-rose-50 hover:text-rose-600" aria-label={t("Soruyu sil")}><Trash2 className="h-4 w-4" /></button>
              </div>
              <input className="input" value={q.title} placeholder={q.type === "likert" ? t("Yönerge (ör. Aşağıdaki ifadelere ne ölçüde katılıyorsunuz?)") : t("Soru metni")} onChange={(e) => set(i, { title: e.target.value })} />
              {(q.type === "single" || q.type === "multi") && <textarea className="input min-h-[80px]" value={q.options.join("\n")} onChange={(e) => set(i, { options: lines(e.target.value) } as Partial<Question>)} placeholder={t("Her satıra bir seçenek")} />}
              {q.type === "likert" && (
                <>
                  <textarea className="input min-h-[90px]" value={q.items.join("\n")} onChange={(e) => set(i, { items: lines(e.target.value) } as Partial<Question>)} placeholder={t("Her satıra bir madde")} />
                  <div className="flex items-center gap-2 text-[13px] text-ink-600">{t("Derece")} {[5, 7].map((p) => <button key={p} type="button" onClick={() => set(i, { points: p, labels: [...LIKERT_PRESETS.tr[p as 5 | 7]] } as Partial<Question>)} className={cn("rounded-lg border px-2.5 py-0.5", q.points === p ? "border-brand-400 bg-brand-50 text-brand-800" : "border-ink-200")}>{p}</button>)}</div>
                </>
              )}
            </li>
          ))}
          {qs.length === 0 && <li className="card p-8 text-center text-sm text-ink-500">{t("Yukarıdan bir soru türü seçerek başlayın.")}</li>}
        </ol>
      ) : (
        <div id="survey-print" className="card space-y-5 p-6">
          <div><p className="font-serif text-2xl font-semibold text-ink-950">{title || t("Adsız anket")}</p>{description && <p className="mt-1 whitespace-pre-line text-[14px] text-ink-600">{description}</p>}</div>
          {qs.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <p className="font-medium text-ink-900">{i + 1}. {q.title}{q.required && <span className="text-rose-500"> *</span>}</p>
              {(q.type === "single" || q.type === "multi") && <ul className="space-y-1">{q.options.map((o) => <li key={o} className="flex items-center gap-2 text-[14px] text-ink-700"><span className={cn("inline-block h-4 w-4 border border-ink-300", q.type === "single" ? "rounded-full" : "rounded")} />{o}</li>)}</ul>}
              {q.type === "likert" && (
                <table className="w-full text-[13px]"><thead><tr><th className="text-left" />{q.labels.map((l) => <th key={l} className="px-1 text-center font-normal text-ink-500">{l}</th>)}</tr></thead>
                  <tbody>{q.items.map((it) => <tr key={it} className="border-t border-ink-100"><td className="py-1.5 pr-2 text-ink-800">{it}</td>{q.labels.map((l) => <td key={l} className="text-center"><span className="inline-block h-4 w-4 rounded-full border border-ink-300" /></td>)}</tr>)}</tbody></table>
              )}
              {(q.type === "text" || q.type === "number") && <div className="h-9 rounded-lg border border-dashed border-ink-200" />}
            </div>
          ))}
          <p className="pt-4 text-center text-xs text-ink-400">{t("Academiana ile oluşturuldu · academiana.com.tr")}</p>
        </div>
      )}

      {qs.length > 0 && (
        <div className="grid gap-4 print:hidden lg:grid-cols-[1fr_auto]">
          <div className="card p-4">
            <p className="mb-2 text-sm font-semibold text-ink-900">{t("Hızlı kontrol")} · {t("yaklaşık {m} dakika", { m: minutes })}</p>
            {lint.length === 0 ? <p className="text-[13px] text-ink-500">{t("Belirgin bir sorun görünmüyor.")}</p> : (
              <ul className="space-y-1.5">{lint.map((x, i) => <li key={i} className="flex items-start gap-2 text-[13px] text-ink-700">{x.level === "warning" ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /> : <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" />}<span>{t(x.message, x.params)}</span></li>)}</ul>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="secondary" onClick={() => { setPreview(true); setTimeout(() => window.print(), 300); }}><Printer className="h-4 w-4" /> {t("Yazdır / PDF")}</Button>
            <a href="/kayit?next=/anketler" className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800"><Globe className="h-4 w-4" /> {t("Çevrim içi yayınla")}</a>
            <p className="max-w-[220px] text-xs text-ink-500">{t("Ücretsiz hesap açın; bu anket hesabınıza aktarılır, bağlantıyla cevap toplayıp analiz edebilirsiniz.")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
