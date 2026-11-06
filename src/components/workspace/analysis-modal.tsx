"use client";
import { BarChart3, ClipboardCopy, FilePlus2, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { reportToMarkdown, type AnalysisReport } from "@/lib/stats/apa";
import { Markdown } from "./markdown";
import { expertUrl } from "@/lib/expert";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Kind = "describe" | "ttest_ind" | "ttest_paired" | "ttest_one" | "anova" | "mannwhitney" | "kruskal" | "correlation" | "regression" | "chisquare" | "alpha";
const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "describe", label: "Betimsel istatistikler ve normallik", hint: "Ortalama, standart sapma, çarpıklık, basıklık" },
  { id: "ttest_ind", label: "Bağımsız örneklemler t testi", hint: "İki grubun ortalamasını karşılaştırır (ör. kadın–erkek)" },
  { id: "mannwhitney", label: "Mann-Whitney U testi", hint: "İki grup; normal dağılım sağlanmadığında" },
  { id: "ttest_paired", label: "Eşleştirilmiş örneklemler t testi", hint: "Aynı kişilerde iki ölçüm (ön test–son test)" },
  { id: "ttest_one", label: "Tek örneklem t testi", hint: "Ortalamayı bir test değeriyle karşılaştırır" },
  { id: "anova", label: "Tek yönlü varyans analizi (ANOVA)", hint: "Üç ve daha fazla grubu karşılaştırır" },
  { id: "kruskal", label: "Kruskal-Wallis H testi", hint: "Üç ve daha fazla grup; normal dağılım sağlanmadığında" },
  { id: "correlation", label: "Korelasyon analizi", hint: "Değişkenler arasındaki ilişki (Pearson veya Spearman)" },
  { id: "regression", label: "Doğrusal regresyon", hint: "Yordayıcıların bağımlı değişkeni açıklama gücü" },
  { id: "chisquare", label: "Ki-kare bağımsızlık testi", hint: "İki kategorik değişken arasındaki ilişki" },
  { id: "alpha", label: "Güvenirlik (Cronbach alfa)", hint: "Ölçek maddelerinin iç tutarlılığı" },
];

export function AnalysisModal({ open, onClose, files, language, tableNo, style, onInsert }: { open: boolean; onClose: () => void; files: any[]; language: string; tableNo: number; style: string; onInsert?: (md: string) => void }) {
  const { t } = useT();
  const toast = useToast();
  const dataFiles = useMemo(() => files.filter((f) => /csv|sheet/.test(f.mime_type ?? "") || /\.(csv|xlsx)$/i.test(f.name)), [files]);
  const [fileId, setFileId] = useState<string>(dataFiles[0]?.id ?? "");
  const [cols, setCols] = useState<{ numeric: string[]; categorical: { name: string; levels: string[] }[] } | null>(null);
  const [kind, setKind] = useState<Kind>("describe");
  const [sel, setSel] = useState<Record<string, any>>({});
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const lang = language === "en" ? "en" : "tr";

  useEffect(() => {
    if (!open || !fileId) return;
    setCols(null); setReport(null);
    api<{ summary: any }>(`/api/files/${fileId}/stats`).then(({ summary }) => setCols({
      numeric: summary.columns.filter((c: any) => c.kind === "numeric").map((c: any) => c.name),
      // Az düzeyli sayısal sütunlar da (ör. 1/2 kodlu cinsiyet) gruplama değişkeni olabilir
      categorical: summary.columns.filter((c: any) => c.kind === "categorical" || (c.kind === "numeric" && c.max - c.min <= 10 && Number.isInteger(c.min))).map((c: any) => ({ name: c.name, levels: (c.levels ?? []).map((x: any) => x.value) })),
    })).catch((e) => toast({ tone: "error", title: t("Veri okunamadı"), detail: (e as Error).message }));
  }, [open, fileId, t, toast]);

  useEffect(() => { setSel({}); setReport(null); }, [kind]);

  const num = cols?.numeric ?? [];
  const cat = cols?.categorical ?? [];
  const one = (key: string, label: string, options: string[]) => (
    <label className="block"><span className="label">{label}</span>
      <select className="input" value={sel[key] ?? ""} onChange={(e) => setSel((s) => ({ ...s, [key]: e.target.value }))}>
        <option value="">{t("Seçin…")}</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  const many = (key: string, label: string, options: string[]) => (
    <div><span className="label">{label}</span>
      <div className="flex max-h-44 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-ink-100 p-2">
        {options.map((o) => { const on = (sel[key] ?? []).includes(o); return <button key={o} type="button" onClick={() => setSel((s) => ({ ...s, [key]: on ? (s[key] ?? []).filter((x: string) => x !== o) : [...(s[key] ?? []), o] }))} className={`rounded-full border px-2.5 py-1 text-[12.5px] ${on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"}`}>{o}</button>; })}
      </div>
    </div>
  );

  function spec(): any {
    switch (kind) {
      case "describe": return { kind, vars: sel.vars ?? [] };
      case "ttest_ind": case "mannwhitney": case "anova": case "kruskal": return { kind, dv: sel.dv, group: sel.group };
      case "ttest_paired": return { kind, a: sel.a, b: sel.b };
      case "ttest_one": return { kind, dv: sel.dv, mu: Number(String(sel.mu ?? "").replace(",", ".")) };
      case "correlation": return { kind, vars: sel.vars ?? [], method: sel.method ?? "pearson" };
      case "regression": return { kind, dv: sel.dv, ivs: sel.ivs ?? [] };
      case "chisquare": return { kind, a: sel.a, b: sel.b };
      case "alpha": return { kind, items: sel.items ?? [], scale: sel.scale || undefined };
    }
  }
  async function run() {
    setBusy(true); setReport(null);
    try { setReport((await api<{ report: AnalysisReport }>(`/api/files/${fileId}/analyze`, { method: "POST", json: { spec: spec(), language: lang } })).report); }
    catch (e) { toast({ tone: "error", title: t("Analiz yapılamadı"), detail: (e as Error).message }); }
    finally { setBusy(false); }
  }
  // D106: tablo başlığı, not etiketi ve tablo göndermesi çalışmanın atıf stiline göre (tablo başlığı her stilde üstte)
  const md = report ? reportToMarkdown(report, tableNo, lang === "en" ? "en" : "tr", style) : "";

  return (
    <Modal open={open} onClose={onClose} title={t("İstatistik analizi")} wide footer={report ? <>
      <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(md); toast({ tone: "success", title: t("Kopyalandı") }); }}><ClipboardCopy className="h-4 w-4" /> {t("Kopyala")}</Button>
      {onInsert && <Button onClick={() => { onInsert(md); onClose(); }}><FilePlus2 className="h-4 w-4" /> {t("Belgeye ekle")}</Button>}
    </> : undefined}>
      {!dataFiles.length ? (
        <p className="text-sm text-ink-500">{t("Bu projeye yüklenmiş veri dosyası (CSV/XLSX) yok. “Dosyalarım” sayfasından verinizi projeye bağlayarak yükleyin; ilk satır değişken adları olmalıdır.")}</p>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] text-ink-500">{t("Analizler sunucuda gerçek hesaplamayla yapılır (SPSS ile aynı formüller); yapay zekâ hiçbir sayı üretmez. Sonuç APA 7 biçiminde tablo ve cümle olarak hazırlanır.")}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block"><span className="label">{t("Veri dosyası")}</span><select className="input" value={fileId} onChange={(e) => setFileId(e.target.value)}>{dataFiles.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
            <label className="block"><span className="label">{t("Analiz")}</span><select className="input" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>{KINDS.map((k) => <option key={k.id} value={k.id}>{t(k.label)}</option>)}</select></label>
          </div>
          <p className="-mt-2 text-xs text-ink-400">{t(KINDS.find((k) => k.id === kind)!.hint)}</p>
          {!cols ? <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Değişkenler okunuyor…")}</p> : (
            <div className="grid gap-3 md:grid-cols-2">
              {kind === "describe" && <div className="md:col-span-2">{many("vars", t("Değişkenler"), num)}</div>}
              {(kind === "ttest_ind" || kind === "mannwhitney" || kind === "anova" || kind === "kruskal") && <>{one("dv", t("Bağımlı değişken (sayısal)"), num)}{one("group", t("Gruplama değişkeni"), cat.map((c) => c.name))}</>}
              {kind === "ttest_paired" && <>{one("a", t("Birinci ölçüm (ör. ön test)"), num)}{one("b", t("İkinci ölçüm (ör. son test)"), num)}</>}
              {kind === "ttest_one" && <>{one("dv", t("Değişken"), num)}<label className="block"><span className="label">{t("Test değeri")}</span><input className="input" inputMode="decimal" value={sel.mu ?? ""} onChange={(e) => setSel((s) => ({ ...s, mu: e.target.value }))} placeholder="3" /></label></>}
              {kind === "correlation" && <><div className="md:col-span-2">{many("vars", t("Değişkenler (en az 2)"), num)}</div><label className="block"><span className="label">{t("Yöntem")}</span><select className="input" value={sel.method ?? "pearson"} onChange={(e) => setSel((s) => ({ ...s, method: e.target.value }))}><option value="pearson">Pearson</option><option value="spearman">Spearman</option></select></label></>}
              {kind === "regression" && <>{one("dv", t("Bağımlı değişken"), num)}<div className="md:col-span-2">{many("ivs", t("Yordayıcılar"), num.filter((n) => n !== sel.dv))}</div></>}
              {kind === "chisquare" && <>{one("a", t("Birinci kategorik değişken"), cat.map((c) => c.name))}{one("b", t("İkinci kategorik değişken"), cat.map((c) => c.name))}</>}
              {kind === "alpha" && <><div className="md:col-span-2">{many("items", t("Ölçek maddeleri"), num)}</div><label className="block md:col-span-2"><span className="label">{t("Ölçek adı (isteğe bağlı)")}</span><input className="input" value={sel.scale ?? ""} onChange={(e) => setSel((s) => ({ ...s, scale: e.target.value }))} /></label></>}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={run} loading={busy} disabled={!cols}><BarChart3 className="h-4 w-4" /> {t("Analizi çalıştır")}</Button>
            <a href={expertUrl("istatistik", "analysis")} target="_blank" rel="noopener noreferrer" className="text-[13px] text-ink-500 hover:text-brand-700">{t("Hangi analizi seçeceğinizden emin değil misiniz? İstatistik danışmanlığı →")}</a>
          </div>
          {report && (
            <div className="rounded-2xl border border-ink-100 bg-white p-4">
              <Markdown text={md} sourceMap={{}} serif />
              <p className="mt-2 text-xs text-ink-400">{t("n = {n} (eksik verili satırlar analizden çıkarıldı).", { n: report.n })}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
