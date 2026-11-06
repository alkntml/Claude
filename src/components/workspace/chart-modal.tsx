"use client";
import { CaptionPreview } from "./caption-preview";
import { formatCaption, noteLabel } from "@/lib/citations/captions";
import { FilePlus2, LineChart, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { renderChartSvg } from "@/lib/charts/svg";
import type { ChartData, ErrorKind } from "@/lib/stats/charts";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Kind = "bar_means" | "bar_freq" | "line_means" | "histogram" | "scatter" | "box";
const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "bar_means", label: "Gruplara göre ortalama (sütun grafiği)", hint: "Ör. batarya kimyasına göre ortalama döngü ömrü; hata çubuklu" },
  { id: "bar_freq", label: "Sıklık / yüzde (sütun grafiği)", hint: "Kategorik bir değişkenin dağılımı" },
  { id: "line_means", label: "Ölçümlere göre ortalama (çizgi grafiği)", hint: "Ön test–ara–son test gibi tekrarlı ölçümler; isteğe bağlı gruplara göre" },
  { id: "histogram", label: "Histogram", hint: "Sayısal bir değişkenin dağılımı" },
  { id: "scatter", label: "Saçılım grafiği", hint: "İki sayısal değişken arasındaki ilişki; regresyon doğrusu ile" },
  { id: "box", label: "Kutu grafiği", hint: "Medyan, çeyrekler ve uç değerler; isteğe bağlı gruplara göre" },
];
const ERRORS: { id: ErrorKind; label: string }[] = [{ id: "ci95", label: "%95 güven aralığı" }, { id: "se", label: "Standart hata" }, { id: "sd", label: "Standart sapma" }, { id: "none", label: "Hata çubuğu yok" }];

/** SVG → PNG veri adresi (2 kat çözünürlük; Word/PDF'te keskin görünür) */
async function svgToPng(svg: string, w = 900, h = 560, scale = 2): Promise<string> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("svg")); img.src = url; });
    const c = document.createElement("canvas");
    c.width = w * scale; c.height = h * scale;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  } finally { URL.revokeObjectURL(url); }
}

export function ChartModal({ open, onClose, files, language, figureNo, style, onInsert }: {
  open: boolean; onClose: () => void; files: any[]; language: string; figureNo: number; style: string;
  onInsert?: (nodes: { title: string; src: string; alt: string; note: string }) => void;
}) {
  const { t } = useT();
  const toast = useToast();
  const dataFiles = useMemo(() => files.filter((f) => /csv|sheet/.test(f.mime_type ?? "") || /\.(csv|xlsx)$/i.test(f.name)), [files]);
  const [fileId, setFileId] = useState<string>(dataFiles[0]?.id ?? "");
  const [cols, setCols] = useState<{ numeric: string[]; categorical: string[] } | null>(null);
  const [kind, setKind] = useState<Kind>("bar_means");
  const [sel, setSel] = useState<Record<string, any>>({ error: "ci95", fit: true, percent: false });
  const [busy, setBusy] = useState(false);
  const [chart, setChart] = useState<ChartData | null>(null);
  const [title, setTitle] = useState("");
  const [inserting, setInserting] = useState(false);
  const lang = language === "en" ? "en" : "tr";

  useEffect(() => {
    if (!open || !fileId) return;
    setCols(null); setChart(null);
    api<{ summary: any }>(`/api/files/${fileId}/stats`).then(({ summary }) => setCols({
      numeric: summary.columns.filter((c: any) => c.kind === "numeric").map((c: any) => c.name),
      categorical: summary.columns.filter((c: any) => c.kind === "categorical" || (c.kind === "numeric" && c.max - c.min <= 10 && Number.isInteger(c.min))).map((c: any) => c.name),
    })).catch((e) => toast({ tone: "error", title: t("Veri okunamadı"), detail: (e as Error).message }));
  }, [open, fileId, t, toast]);
  useEffect(() => { setChart(null); }, [kind]);

  const svg = useMemo(() => (chart ? renderChartSvg(chart, { locale: lang }) : ""), [chart, lang]);
  const num = cols?.numeric ?? [];
  const cat = cols?.categorical ?? [];
  const one = (key: string, label: string, options: string[], optional = false) => (
    <label className="block"><span className="label">{label}</span>
      <select className="input" value={sel[key] ?? ""} onChange={(e) => setSel((s) => ({ ...s, [key]: e.target.value || undefined }))}>
        <option value="">{optional ? t("Yok (tüm katılımcılar)") : t("Seçin…")}</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  const errSel = (
    <label className="block"><span className="label">{t("Hata çubuğu")}</span>
      <select className="input" value={sel.error} onChange={(e) => setSel((s) => ({ ...s, error: e.target.value }))}>{ERRORS.map((x) => <option key={x.id} value={x.id}>{t(x.label)}</option>)}</select>
    </label>
  );

  function spec(): any {
    switch (kind) {
      case "bar_means": return { kind, dv: sel.dv, group: sel.group, error: sel.error };
      case "bar_freq": return { kind, variable: sel.variable, percent: !!sel.percent };
      case "line_means": return { kind, vars: sel.vars ?? [], group: sel.group || undefined, error: sel.error };
      case "histogram": return { kind, variable: sel.numvar };
      case "scatter": return { kind, x: sel.x, y: sel.y, fit: !!sel.fit };
      case "box": return { kind, dv: sel.dv, group: sel.group || undefined };
    }
  }
  async function run() {
    setBusy(true); setChart(null);
    try {
      const r = await api<{ chart: ChartData }>(`/api/files/${fileId}/chart`, { method: "POST", json: { spec: spec(), language: lang } });
      setChart(r.chart); setTitle(r.chart.title);
    } catch (e) { toast({ tone: "error", title: t("Grafik oluşturulamadı"), detail: (e as Error).message }); } finally { setBusy(false); }
  }
  async function insert() {
    if (!chart || !onInsert) return;
    setInserting(true);
    try {
      const src = await svgToPng(svg);
      onInsert({ title: title.trim() || chart.title, src, alt: title.trim() || chart.title, note: chart.note });
      onClose();
    } catch { toast({ tone: "error", title: t("Grafik belgeye eklenemedi") }); } finally { setInserting(false); }
  }

  return (
    <Modal open={open} onClose={onClose} title={t("Grafik oluştur")} wide footer={chart ? <>
      <Button variant="ghost" onClick={() => setChart(null)}>{t("Ayarlara dön")}</Button>
      {onInsert && <Button onClick={insert} loading={inserting}><FilePlus2 className="h-4 w-4" /> {t("Belgeye ekle")}</Button>}
    </> : undefined}>
      {!dataFiles.length ? (
        <p className="text-sm text-ink-500">{t("Bu projeye yüklenmiş veri dosyası (CSV/XLSX) yok. “Dosyalarım” sayfasından verinizi projeye bağlayarak yükleyin veya anket cevaplarınızı projeye aktarın; ilk satır değişken adları olmalıdır.")}</p>
      ) : chart ? (
        <div className="space-y-3">
          <label className="block"><span className="label">{t("Şekil başlığı")}</span><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <CaptionPreview fmt={formatCaption(style, "figure", figureNo, title, lang === "en" ? "en" : "tr")} />
          <div className="overflow-hidden rounded-xl border border-ink-100 bg-white" dangerouslySetInnerHTML={{ __html: svg.replace(/width="900" height="560"/, 'width="100%" style="height:auto;display:block"') }} />
          <p className="text-[12.5px] text-ink-500">{(() => { const nl = noteLabel(style, lang === "en" ? "en" : "tr"); return nl.italic ? <i>{nl.text}</i> : nl.text; })()} {chart.note}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] text-ink-500">{t("Grafik, verinizden gerçek hesaplamayla, siyah-beyaz ve eksen başlıklı çizilir; şekil numarası, başlığı ve yeri çalışmanızın atıf stiline göre yazılır. Word ve PDF çıktısına görsel olarak eklenir.")}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block"><span className="label">{t("Veri dosyası")}</span><select className="input" value={fileId} onChange={(e) => setFileId(e.target.value)}>{dataFiles.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
            <label className="block"><span className="label">{t("Grafik türü")}</span><select className="input" value={kind} onChange={(e) => setKind(e.target.value as Kind)}>{KINDS.map((k) => <option key={k.id} value={k.id}>{t(k.label)}</option>)}</select></label>
          </div>
          <p className="-mt-2 text-xs text-ink-400">{t(KINDS.find((k) => k.id === kind)!.hint)}</p>
          {!cols ? <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Değişkenler okunuyor…")}</p> : (
            <div className="grid gap-3 md:grid-cols-2">
              {kind === "bar_means" && <>{one("dv", t("Bağımlı değişken (sayısal)"), num)}{one("group", t("Gruplama değişkeni"), cat)}{errSel}</>}
              {kind === "bar_freq" && <>{one("variable", t("Değişken"), [...new Set([...cat, ...num])])}<label className="flex items-center gap-2 self-end pb-2 text-sm text-ink-700"><input type="checkbox" checked={!!sel.percent} onChange={(e) => setSel((s) => ({ ...s, percent: e.target.checked }))} /> {t("Yüzde olarak göster")}</label></>}
              {kind === "line_means" && <>
                <div className="md:col-span-2"><span className="label">{t("Ölçümler (sırasıyla seçin, en az 2)")}</span>
                  <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-ink-100 p-2">
                    {num.map((o) => { const list: string[] = sel.vars ?? []; const k = list.indexOf(o); return <button key={o} type="button" onClick={() => setSel((s) => ({ ...s, vars: k >= 0 ? list.filter((x) => x !== o) : [...list, o] }))} className={`rounded-full border px-2.5 py-1 text-[12.5px] ${k >= 0 ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"}`}>{k >= 0 ? `${k + 1}. ` : ""}{o}</button>; })}
                  </div>
                </div>
                {one("group", t("Gruplama değişkeni (isteğe bağlı)"), cat, true)}{errSel}
              </>}
              {kind === "histogram" && one("numvar", t("Değişken"), num)}
              {kind === "scatter" && <>{one("x", t("Yatay eksen (X)"), num)}{one("y", t("Dikey eksen (Y)"), num)}<label className="flex items-center gap-2 text-sm text-ink-700"><input type="checkbox" checked={!!sel.fit} onChange={(e) => setSel((s) => ({ ...s, fit: e.target.checked }))} /> {t("Regresyon doğrusu çiz")}</label></>}
              {kind === "box" && <>{one("dv", t("Değişken (sayısal)"), num)}{one("group", t("Gruplama değişkeni (isteğe bağlı)"), cat, true)}</>}
            </div>
          )}
          <Button onClick={run} loading={busy} disabled={!cols}><LineChart className="h-4 w-4" /> {t("Grafiği oluştur")}</Button>
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
