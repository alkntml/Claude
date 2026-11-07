"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowUp, Brain, ChevronDown, ClipboardCopy, FileText, FileUp, Loader2, MessageCircleQuestion, Quote, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/client";
import { api } from "@/lib/client";
import { Markdown } from "./markdown";

type Preset = "summary" | "method" | "sample" | "findings" | "limitations" | "relation" | "quotes" | "definitions";
const PRESETS: { id: Preset; label: string; q: string }[] = [
  { id: "summary", label: "Kısa özet", q: "Bu çalışmayı amaç, yöntem, temel bulgular ve sonuç başlıklarıyla kısaca özetle." },
  { id: "method", label: "Yöntem", q: "Araştırmanın deseni, veri toplama araçları ve analiz yöntemi neydi?" },
  { id: "sample", label: "Örneklem", q: "Örneklem kimlerden oluşuyor, kaç kişi ve nasıl seçilmiş?" },
  { id: "findings", label: "Temel bulgular", q: "Temel bulgular nelerdir? İstatistiksel sonuçları değerleriyle birlikte ver." },
  { id: "limitations", label: "Sınırlılıklar", q: "Yazarların belirttiği sınırlılıklar ve gelecek araştırma önerileri nelerdir?" },
  { id: "relation", label: "Çalışmamla ilişkisi", q: "Bu kaynak benim çalışmamda nerede ve nasıl kullanılabilir? Hangi bulgusu veya argümanı işime yarar?" },
  { id: "quotes", label: "Alıntılanabilir cümleler", q: "Tezimde doğrudan alıntı olarak kullanabileceğim en önemli 3–5 cümleyi sayfa numaralarıyla ver." },
  { id: "definitions", label: "Kavram tanımları", q: "Bu kaynakta hangi kavramlar nasıl tanımlanmış? Tanımları sayfa numaralarıyla ver." },
];
interface Turn { q: string; a?: string; evidence?: { content: string; page: string | null }[]; error?: boolean }

/** Kaynağa sor (D112): tek kaynakla sohbet, sayfa numaralı cevap; erişim seviyesi açıkça gösterilir */
export function SourceAskModal({ source, projectId, onClose, onInsert, onUploadPdf, onFetchFulltext, canInsert }: {
  source: any; projectId: string; onClose: () => void;
  /** Cevabı atıfla birlikte metne ekler */
  onInsert?: (markdown: string, sourceMap: Record<string, string>) => void;
  onUploadPdf: (file: File) => void;
  onFetchFulltext?: () => void;
  canInsert: boolean;
}) {
  const { t } = useT();
  const toast = useToast();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [openEv, setOpenEv] = useState<number | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [turns]);
  const access: "metadata" | "abstract" | "full_text" = source.access_level;
  const pending = source.fulltext_status === "queued" || source.fulltext_status === "processing";

  async function ask(q: string, preset?: Preset) {
    if (!q.trim() || busy) return;
    const history = turns.filter((x) => x.a).map((x) => ({ q: x.q, a: x.a! }));
    setTurns((l) => [...l, { q }]); setInput(""); setBusy(true);
    try {
      const r = await api<{ answer: string; evidence: Turn["evidence"] }>(`/api/sources/${source.id}/ask`, { method: "POST", json: { question: q, preset, history } });
      setTurns((l) => l.map((x, i) => (i === l.length - 1 ? { ...x, a: r.answer, evidence: r.evidence } : x)));
    } catch (e) {
      setTurns((l) => l.map((x, i) => (i === l.length - 1 ? { ...x, a: (e as Error).message, error: true } : x)));
    } finally { setBusy(false); }
  }
  async function toMemory(text: string) {
    try {
      await api(`/api/projects/${projectId}/memory`, { method: "POST", json: { kind: "note", content: `${source.title.slice(0, 120)}: ${text.replace(/\s+/g, " ").slice(0, 3800)}` } });
      toast({ tone: "success", title: t("Proje hafızasına eklendi"), detail: t("Asistan yazarken bu notu dikkate alır.") });
    } catch (e) { toast({ tone: "error", title: t("Eklenemedi"), detail: (e as Error).message }); }
  }
  /** Cevaptaki sayfa numaraları atfa sayfa bilgisi olarak eklenir (tek sayfa ise) */
  function insert(text: string) {
    if (!onInsert) return;
    const pages = [...new Set([...text.matchAll(/\(s\.\s*(\d+(?:[-–]\d+)?)\)/g)].map((m) => m[1]))];
    const clean = text.replace(/\s*\((?:s\.\s*\d+(?:[-–]\d+)?|tam metin|özet|abstract|full text|p\.\s*\d+)\)/gi, "").trim();
    const cite = `[[kaynak:S1${pages.length === 1 ? `|s. ${pages[0]}` : ""}]]`;
    // Her paragrafın sonuna atıf eklenir; başlık ve liste satırları korunur
    const md = clean.split(/\n{2,}/).map((p) => (/^#|^\s*[-*\d]/.test(p) ? p : `${p.replace(/\.\s*$/, "")} ${cite}.`)).join("\n\n");
    onInsert(md, { S1: source.id });
    toast({ tone: "success", title: t("Metne eklendi"), detail: t("Kendi cümlelerinizle düzenlemeyi unutmayın; doğrudan alıntılarda sayfa numarası gerekir.") });
  }

  const accessBox = access === "full_text"
    ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700"><FileText className="h-3.5 w-3.5" /> {t("Tam metin okundu · cevaplar sayfa numaralı")}</span>
    : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[12px] font-medium text-amber-800">{access === "abstract" ? t("Yalnızca özet okundu") : t("Yalnızca künye bilgisi var")}</span>;

  return (
    <Modal open onClose={onClose} title={t("Kaynağa sor")} wide>
      <div className="flex max-h-[75vh] flex-col">
        <div className="space-y-2 border-b border-ink-100 pb-3">
          <p className="line-clamp-2 font-serif text-[16px] font-semibold text-ink-950">{source.title}</p>
          <div className="flex flex-wrap items-center gap-2">{accessBox}{pending && <span className="inline-flex items-center gap-1 text-[12px] text-ink-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {t("Tam metin arka planda okunuyor")}</span>}</div>
          {access !== "full_text" && !pending && (
            <div className="rounded-xl bg-ink-50 p-3 text-[12.5px] text-ink-600">
              {access === "abstract" ? t("Cevaplar yalnızca özete dayanır; yöntem ayrıntıları ve sayfa numarası için tam metin gerekir.") : t("Bu kaynağın özeti ve tam metni yok; cevap verilebilmesi için tam metin gerekir.")}
              <div className="mt-2 flex flex-wrap gap-2">
                {onFetchFulltext && <Button size="sm" variant="secondary" onClick={onFetchFulltext}>{t("Açık erişim tam metni getir")}</Button>}
                <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] border border-ink-200 bg-white px-3 text-[13px] font-medium text-ink-800 hover:border-ink-300"><FileUp className="h-3.5 w-3.5" /> {t("PDF’ini yükle")}<input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadPdf(f); e.target.value = ""; }} /></label>
              </div>
            </div>
          )}
        </div>

        <div className="min-h-[200px] flex-1 space-y-4 overflow-y-auto py-4">
          {turns.length === 0 && (
            <div>
              <p className="mb-2 text-[13px] text-ink-500">{t("Hazır sorulardan birini seçin veya kendi sorunuzu yazın:")}</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => <button key={p.id} disabled={busy || access === "metadata"} onClick={() => ask(t(p.q), p.id)} className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 text-[12.5px] font-medium text-brand-700 transition hover:bg-brand-100 disabled:opacity-40">{t(p.label)}</button>)}
              </div>
            </div>
          )}
          {turns.map((x, i) => (
            <div key={i} className="space-y-2">
              <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-ink-900 px-3.5 py-2.5 text-[13.5px] text-white">{x.q}</div>
              {!x.a ? <p className="flex items-center gap-2 text-[13px] text-ink-500"><Loader2 className="h-4 w-4 animate-spin" /> {t("Kaynak okunuyor…")}</p> : (
                <div className={cn("rounded-2xl border p-3.5", x.error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-ink-100 bg-white")}>
                  {x.error ? <p className="text-[13.5px]">{x.a}</p> : <Markdown text={x.a} sourceMap={{}} />}
                  {!x.error && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-ink-50 pt-2.5">
                      {onInsert && <Button size="sm" variant="soft" disabled={!canInsert} title={canInsert ? undefined : t("Önce editörde bir bölüm açın")} onClick={() => insert(x.a!)}><Quote className="h-3.5 w-3.5" /> {t("Atıfla metne ekle")}</Button>}
                      <Button size="sm" variant="ghost" onClick={() => toMemory(x.a!)}><Brain className="h-3.5 w-3.5" /> {t("Hafızaya ekle")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(x.a!).then(() => toast({ tone: "success", title: t("Kopyalandı") }), () => {}); }}><ClipboardCopy className="h-3.5 w-3.5" /> {t("Kopyala")}</Button>
                      {!!x.evidence?.length && <button type="button" onClick={() => setOpenEv(openEv === i ? null : i)} className="ml-auto inline-flex items-center gap-1 text-[12px] text-ink-500 hover:text-ink-800">{t("Dayandığı yerler ({n})", { n: x.evidence.length })} <ChevronDown className={cn("h-3.5 w-3.5 transition", openEv === i && "rotate-180")} /></button>}
                    </div>
                  )}
                  {openEv === i && x.evidence && (
                    <div className="mt-2 space-y-1.5">
                      {x.evidence.map((ev, k) => <p key={k} className="rounded-lg bg-ink-50 p-2 text-[12px] leading-relaxed text-ink-600"><b className="text-ink-800">{ev.page ? t("s. {p}", { p: ev.page }) : t("Tam metin")}</b> · {ev.content.slice(0, 420)}{ev.content.length > 420 ? "…" : ""}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {turns.length > 0 && !busy && (
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.filter((p) => !turns.some((x) => x.q === t(p.q))).slice(0, 4).map((p) => <button key={p.id} onClick={() => ask(t(p.q), p.id)} className="rounded-full border border-ink-200 bg-white px-2.5 py-1 text-[12px] text-ink-600 hover:border-ink-300"><Sparkles className="mr-1 inline h-3 w-3 text-brand-500" />{t(p.label)}</button>)}
            </div>
          )}
          <div ref={end} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex items-end gap-1.5 rounded-2xl border border-ink-200 bg-white p-1.5 focus-within:border-brand-300 focus-within:ring-4 focus-within:ring-brand-100">
          <MessageCircleQuestion className="mb-2 ml-2 h-4 w-4 shrink-0 text-ink-400" />
          <textarea rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }} placeholder={access === "metadata" ? t("Soru sormak için önce tam metni ekleyin") : t("Bu kaynağa sorun… (ör. Kaygı nasıl ölçülmüş?)")} disabled={access === "metadata"} className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-1 py-2 text-[14px] outline-none" />
          <Button size="sm" className="!h-9 !w-9 !px-0" disabled={!input.trim() || busy || access === "metadata"} aria-label={t("Gönder")}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}</Button>
        </form>
        <p className="mt-1.5 text-[11.5px] text-ink-400">{t("Cevaplar yalnızca bu kaynağın okunan metnine dayanır; her soru bir yapay zekâ isteği sayılır.")}</p>
      </div>
    </Modal>
  );
}
