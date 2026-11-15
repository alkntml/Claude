"use client";

/**
 * Kaynak okuyucu (D207): kaynağın yüklenmiş PDF’i sayfa sayfa gösterilir (pdf.js: görüntü + seçilebilir metin katmanı);
 * PDF yoksa okunan tam metin sayfa sayfa gösterilir. Seçilen metin, yayındaki sayfa numarasıyla atıflı doğrudan alıntı
 * olarak veya yalnızca sayfalı atıf olarak imlecin bulunduğu yere eklenir. Seçim kaynaktan birebir alınır.
 */
import { Copy, FileText, Loader2, Minus, Plus, Quote, TextQuote } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import type { JSONNode } from "@/lib/editor/doc";
import type { PDFDocumentProxy } from "pdfjs-dist";

type PdfHandle = { pdfjs: typeof import("pdfjs-dist"); doc: PDFDocumentProxy } | null;
import { pdfPageLabels } from "@/lib/sources/pages";
import { BLOCK_QUOTE_WORDS, buildQuoteNodes, cleanSelection, pageLocator, wordCount, type QuoteKind } from "@/lib/sources/quote";

interface ReaderData {
  source: { id: string; title: string; authors: unknown; year: number | null; pages: string | null; access_level: string };
  pdf: { url: string; name: string } | null;
  chunks: { page: string | null; section: string | null; content: string }[];
}
interface Sel { text: string; start: string | null; end: string | null; x: number; y: number }

const TEXT_LAYER_CSS = `
.acd-pdf .textLayer{position:absolute;text-align:initial;inset:0;overflow:clip;opacity:1;line-height:1;-webkit-text-size-adjust:none;text-size-adjust:none;forced-color-adjust:none;transform-origin:0 0;caret-color:CanvasText;z-index:0}
.acd-pdf .textLayer :is(span,br){color:transparent;position:absolute;white-space:pre;cursor:text;transform-origin:0% 0%}
.acd-pdf .textLayer > :not(.markedContent),.acd-pdf .textLayer .markedContent span:not(.markedContent){z-index:1}
.acd-pdf .textLayer span.markedContent{top:0;height:0}
.acd-pdf .textLayer ::selection{background:rgba(79,70,229,.32)}
.acd-pdf .textLayer br::selection{background:transparent}
.acd-pdf .textLayer .endOfContent{display:block;position:absolute;inset:100% 0 0;z-index:0;cursor:default;user-select:none}
.acd-pdf .textLayer.selecting .endOfContent{top:0}
`;

/** Seçimin başladığı/bittiği düğümün sayfa etiketi */
function labelOf(node: Node | null): string | null {
  let el: HTMLElement | null = node ? (node.nodeType === 1 ? (node as HTMLElement) : node.parentElement) : null;
  while (el && !el.dataset?.pageLabel && el.dataset?.pageLabel !== "") el = el.parentElement;
  const v = el?.dataset?.pageLabel;
  return v ? v : null;
}

export function SourceReaderModal({ sourceId, onClose, onInsert, canInsert }: {
  sourceId: string;
  onClose: () => void;
  /** Düğümleri imlecin bulunduğu yere ekler; ekleyemezse false */
  onInsert?: (nodes: JSONNode[]) => boolean | void;
  canInsert: boolean;
}) {
  const { t } = useT();
  const toast = useToast();
  const [data, setData] = useState<ReaderData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"pdf" | "text">("text");
  const [sel, setSel] = useState<Sel | null>(null);
  const [scale, setScale] = useState(1.25);
  const [pdfState, setPdfState] = useState<{ pages: number; labels: (string | null)[]; noText: boolean } | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PdfHandle>(null);

  useEffect(() => {
    api<ReaderData>(`/api/sources/${sourceId}/reader`).then((d) => { setData(d); setMode(d.pdf ? "pdf" : "text"); }).catch((e) => setErr((e as Error).message));
  }, [sourceId]);

  // PDF yükle (pdf.js yalnızca gerektiğinde indirilir)
  useEffect(() => {
    if (!data?.pdf || mode !== "pdf") return;
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const doc = await pdfjs.getDocument({ url: data.pdf!.url, isEvalSupported: false }).promise;
        if (cancelled) { doc.destroy(); return; }
        pdfRef.current = { pdfjs, doc };
        setPdfState({ pages: doc.numPages, labels: pdfPageLabels(data.source.pages, doc.numPages), noText: false });
      } catch (e) {
        if (!cancelled) setPdfError((e as Error).message || "PDF açılamadı");
      }
    })();
    return () => { cancelled = true; try { pdfRef.current?.doc?.destroy(); } catch { /* yok say */ } pdfRef.current = null; };
  }, [data, mode]);

  // Seçimi izle
  const readSelection = useCallback(() => {
    const s = window.getSelection();
    const box = scrollRef.current;
    if (!s || s.isCollapsed || !box || !s.rangeCount) { setSel(null); return; }
    const range = s.getRangeAt(0);
    if (!box.contains(range.commonAncestorContainer)) { setSel(null); return; }
    const text = s.toString();
    if (!cleanSelection(text)) { setSel(null); return; }
    const r = range.getBoundingClientRect(), b = box.getBoundingClientRect();
    setSel({ text, start: labelOf(range.startContainer), end: labelOf(range.endContainer), x: Math.min(Math.max(r.left - b.left + r.width / 2, 120), b.width - 120), y: r.top - b.top + box.scrollTop });
  }, []);
  useEffect(() => {
    const h = () => setTimeout(readSelection, 10);
    document.addEventListener("selectionchange", h);
    return () => document.removeEventListener("selectionchange", h);
  }, [readSelection]);

  const locator = sel ? pageLocator(sel.start, sel.end) : null;
  const words = sel ? wordCount(cleanSelection(sel.text)) : 0;

  function apply(kind: QuoteKind | "copy") {
    if (!sel || !data) return;
    const q = buildQuoteNodes({ text: sel.text, locator, kind: kind === "copy" ? "quote" : kind, sourceId: data.source.id });
    if (kind === "copy") {
      navigator.clipboard?.writeText(q.text).then(() => toast({ tone: "success", title: t("Kopyalandı") })).catch(() => {});
      return;
    }
    if (!onInsert || !canInsert) { toast({ tone: "info", title: t("Önce editörde alıntının gireceği yere tıklayın") }); return; }
    const ok = onInsert(q.nodes);
    if (ok === false) return;
    toast({
      tone: "success",
      title: kind === "cite" ? t("Sayfalı atıf eklendi") : q.block ? t("Blok alıntı eklendi") : t("Alıntı eklendi"),
      detail: locator ? t("Sayfa: {p}", { p: locator }) : t("Sayfa numarası belirlenemedi; atfa tıklayıp sayfayı elle ekleyin."),
    });
    window.getSelection()?.removeAllRanges();
    setSel(null);
  }

  // Metin görünümü: parçalar sayfaya göre gruplanır
  const textPages = useMemo(() => {
    const out: { label: string | null; parts: { section: string | null; content: string }[] }[] = [];
    for (const c of data?.chunks ?? []) {
      const label = c.page ? c.page.replace(/^s\.\s*/i, "") : null;
      const last = out[out.length - 1];
      if (last && last.label === label) last.parts.push({ section: c.section, content: c.content });
      else out.push({ label, parts: [{ section: c.section, content: c.content }] });
    }
    return out;
  }, [data]);

  const title = data?.source.title ?? t("Kaynak");
  return (
    <Modal open onClose={onClose} title={t("Rasat · Oku ve alıntıla")} wide>
      <style>{TEXT_LAYER_CSS}</style>
      {err ? <p className="text-sm text-rose-600">{err}</p> : !data ? <p className="flex items-center gap-2 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Kaynak açılıyor…")}</p> : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 truncate font-serif text-[15px] text-ink-800" title={title}>{title}</p>
            {data.pdf && data.chunks.length > 0 && (
              <div className="flex rounded-lg border border-ink-100 p-0.5 text-[12.5px]">
                <button type="button" className={`rounded-md px-2.5 py-1 ${mode === "pdf" ? "bg-brand-600 text-white" : "text-ink-600"}`} onClick={() => { setSel(null); setMode("pdf"); }}>PDF</button>
                <button type="button" className={`rounded-md px-2.5 py-1 ${mode === "text" ? "bg-brand-600 text-white" : "text-ink-600"}`} onClick={() => { setSel(null); setMode("text"); }}>{t("Metin")}</button>
              </div>
            )}
            {mode === "pdf" && pdfState && (
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => setScale((x) => Math.max(0.75, +(x - 0.25).toFixed(2)))} aria-label={t("Küçült")}><Minus className="h-3.5 w-3.5" /></Button>
                <span className="w-12 text-center text-[12px] text-ink-500">%{Math.round(scale * 100)}</span>
                <Button size="sm" variant="ghost" onClick={() => setScale((x) => Math.min(2.5, +(x + 0.25).toFixed(2)))} aria-label={t("Büyüt")}><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            )}
          </div>
          <p className="rounded-xl bg-brand-50/60 px-3 py-2 text-[12.5px] text-ink-600"><TextQuote className="mr-1 inline h-3.5 w-3.5 text-brand-600" />{t("Metni fareyle seçin; seçimin üstünde çıkan düğmeyle yayındaki sayfa numarasıyla birlikte alıntı veya atıf olarak çalışmanıza ekleyin. {n} kelime ve üzeri alıntılar blok alıntı olur.", { n: BLOCK_QUOTE_WORDS })}</p>

          <div ref={scrollRef} className="acd-pdf relative h-[62vh] overflow-auto rounded-2xl border border-ink-100 bg-ink-50 p-3" onMouseUp={() => setTimeout(readSelection, 10)} onTouchEnd={() => setTimeout(readSelection, 50)}>
            {mode === "pdf" ? (
              pdfError ? <p className="p-4 text-sm text-rose-600">{t("PDF açılamadı.")} {data.chunks.length > 0 && <button type="button" className="font-medium underline" onClick={() => setMode("text")}>{t("Metin görünümüne geç")}</button>}</p>
                : !pdfState ? <p className="flex items-center gap-2 p-4 text-sm text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("PDF yükleniyor…")}</p>
                  : <div className="flex flex-col items-center gap-4">{Array.from({ length: pdfState.pages }, (_, i) => <PdfPage key={`${i}-${scale}`} index={i} label={pdfState.labels[i]} scale={scale} pdfRef={pdfRef} scrollRef={scrollRef} t={t} />)}</div>
            ) : textPages.length === 0 ? (
              <div className="p-4 text-sm text-ink-500"><FileText className="mb-2 h-5 w-5 text-ink-300" />{t("Bu kaynağın tam metni okunmadı. Kaynaklar sekmesinden açık erişim tam metnini getirin veya PDF’ini yükleyin.")}</div>
            ) : (
              <div className="mx-auto max-w-[720px] space-y-4">
                {textPages.map((p, i) => (
                  <section key={i} data-page-label={p.label ?? ""} className="rounded-xl bg-white px-6 py-5 shadow-sm ring-1 ring-ink-100">
                    <p className="mb-2 select-none text-[11px] font-semibold uppercase tracking-wider text-ink-400">{p.label ? t("Sayfa {p}", { p: p.label }) : t("Sayfa bilgisi yok")}</p>
                    {p.parts.map((x, k) => <div key={k}>{x.section && (k === 0 || p.parts[k - 1].section !== x.section) && <p className="mb-1 mt-3 select-none text-[12px] font-semibold text-brand-700">{x.section}</p>}<p className="whitespace-pre-wrap font-serif text-[14.5px] leading-7 text-ink-800">{x.content}</p></div>)}
                  </section>
                ))}
              </div>
            )}

            {sel && (
              <div className="absolute z-20 flex -translate-x-1/2 -translate-y-full gap-1 rounded-xl bg-ink-900 p-1 shadow-xl" style={{ left: sel.x, top: Math.max(sel.y - 8, 8) }} onMouseDown={(e) => e.preventDefault()}>
                <button type="button" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-white/10" onClick={() => apply("quote")}><Quote className="h-3.5 w-3.5" />{words >= BLOCK_QUOTE_WORDS ? t("Blok alıntı ekle") : t("Alıntı olarak ekle")}</button>
                <button type="button" className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-white hover:bg-white/10" onClick={() => apply("cite")}>{t("Yalnızca atıf")}</button>
                <button type="button" className="rounded-lg px-2 py-1.5 text-white hover:bg-white/10" onClick={() => apply("copy")} aria-label={t("Kopyala")}><Copy className="h-3.5 w-3.5" /></button>
              </div>
            )}
          </div>
          {/* Seçim varken her zaman görünen işlem çubuğu (uzun/iki sayfalık seçimde ve telefonda seçimin üstündeki düğmeler görünmeyebilir) */}
          <div data-reader-bar className="flex min-h-[40px] flex-wrap items-center justify-between gap-2 text-[12px] text-ink-500">
            <span>{sel ? `${t("{n} kelime seçildi", { n: words })} · ${locator ? t("Sayfa: {p}", { p: locator }) : t("sayfa numarası belirlenemedi")}` : mode === "pdf" && pdfState ? t("{n} sayfa", { n: pdfState.pages }) : ""}</span>
            {sel ? (
              <div className="flex flex-wrap gap-1.5" onMouseDown={(e) => e.preventDefault()}>
                <Button size="sm" onClick={() => apply("quote")}><Quote className="h-3.5 w-3.5" /> {words >= BLOCK_QUOTE_WORDS ? t("Blok alıntı ekle") : t("Alıntı olarak ekle")}</Button>
                <Button size="sm" variant="secondary" onClick={() => apply("cite")}>{t("Yalnızca atıf")}</Button>
                <Button size="sm" variant="ghost" onClick={() => apply("copy")}><Copy className="h-3.5 w-3.5" /> {t("Kopyala")}</Button>
              </div>
            ) : !canInsert && <span className="text-amber-700">{t("Eklemek için önce editörde alıntının gireceği yere tıklayın.")}</span>}
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Tek PDF sayfası: görünür olunca çizilir (görüntü + seçilebilir metin katmanı) */
function PdfPage({ index, label, scale, pdfRef, scrollRef, t }: { index: number; label: string | null; scale: number; pdfRef: React.MutableRefObject<PdfHandle>; scrollRef: React.RefObject<HTMLDivElement | null>; t: ReturnType<typeof useT>["t"] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 612 * scale, h: 792 * scale });
  const [state, setState] = useState<"idle" | "done" | "notext">("idle");
  const started = useRef(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting) || started.current) return;
      started.current = true;
      (async () => {
        const ref = pdfRef.current;
        if (!ref) return;
        const page = await ref.doc.getPage(index + 1);
        const viewport = page.getViewport({ scale });
        setSize({ w: viewport.width, h: viewport.height });
        const c = canvas.current!, ratio = window.devicePixelRatio || 1;
        c.width = Math.floor(viewport.width * ratio); c.height = Math.floor(viewport.height * ratio);
        c.style.width = `${viewport.width}px`; c.style.height = `${viewport.height}px`;
        const ctx = c.getContext("2d")!;
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const box = layer.current!;
        box.style.setProperty("--scale-factor", String(viewport.scale));
        box.replaceChildren();
        const tc = await page.getTextContent();
        if (!tc.items.length) { setState("notext"); return; }
        await new ref.pdfjs.TextLayer({ textContentSource: tc, container: box, viewport }).render();
        setState("done");
      })().catch(() => setState("notext"));
    }, { root: scrollRef.current, rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [index, scale, pdfRef, scrollRef]);

  return (
    <div ref={wrap} data-page-label={label ?? ""} className="relative shrink-0 bg-white shadow-sm ring-1 ring-ink-200" style={{ width: size.w, height: size.h }}>
      <canvas ref={canvas} className="absolute left-0 top-0" />
      <div ref={layer} className="textLayer" />
      <span aria-hidden className="pointer-events-none absolute -top-0 right-1 select-none rounded-b-md bg-ink-900/70 px-1.5 py-0.5 text-[10.5px] text-white">{label ? t("s. {p}", { p: label }) : t("PDF s. {p}", { p: index + 1 })}</span>
      {state === "notext" && <p className="absolute inset-x-3 bottom-3 select-none rounded-lg bg-amber-50 px-2 py-1.5 text-[11.5px] text-amber-900">{t("Bu sayfada seçilebilir metin yok (taranmış görüntü olabilir).")}</p>}
    </div>
  );
}
