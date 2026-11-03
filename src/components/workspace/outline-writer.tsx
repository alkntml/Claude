"use client";
import { AlertTriangle, CheckCircle2, Circle, ListOrdered, Loader2, Sparkles, Square, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/primitives";
import { useT } from "@/i18n/client";
import { subheadingBudget } from "@/lib/workflows/structure";
import { analyzeRepetition, isRepetitive } from "@/lib/quality/repetition";
import { streamChat, type ChatPhase } from "@/lib/ai/chat-client";
import { parseAnswer } from "./markdown";
import { PhaseSteps } from "./assistant";

/* eslint-disable @typescript-eslint/no-explicit-any */
type ItemState = "waiting" | "running" | "done" | "failed" | "stopped";
interface Item { title: string; state: ItemState; phase?: ChatPhase; seen?: ChatPhase[]; added: number; read: number; words: number; gaps: string[]; error?: string }

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: string;
  stage: { id: string; title: string; key?: string } | null;
  /** Kurgudaki bölüm hedefi (kelime); alt başlıklara eşit pay edilir (D67) */
  targetWords?: number;
  existingHeadings: string[];
  onInsert: (markdown: string, sourceMap: Record<string, string>) => void;
  onSourcesAdded: (rows: any[]) => void;
}

/**
 * Bölümü alt başlıklarla yazar: her alt başlık için ayrı istek gönderilir; asistan o alt konu için
 * kaynak tarar, açık erişimli tam metinleri okur ve yazar. Bitince özet gösterilir.
 */
export function OutlineWriter({ open, onClose, projectId, stage, targetWords = 0, existingHeadings, onInsert, onSourcesAdded }: Props) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [repetitive, setRepetitive] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [autoInsert, setAutoInsert] = useState(true);
  const abort = useRef<AbortController | null>(null);
  const stopped = useRef(false);
  const pendingDrafts = useRef<{ md: string; map: Record<string, string> }[]>([]);

  const finished = items.length > 0 && !running;
  const update = (i: number, fn: (x: Item) => Item) => setItems((l) => l.map((x, k) => (k === i ? fn(x) : x)));

  async function suggest() {
    if (!stage) return;
    setSuggesting(true);
    let answer = "";
    try {
      const ctrl = new AbortController();
      await streamChat({ projectId, stageId: stage.id, conversationId: null, action: "chat",
        message: t("Bu bölüm için akademik usule uygun alt başlıklar öner: en fazla {n} tane; yalnızca birbirinden belirgin biçimde ayrı alt konular için başlık aç, bölüm adını tekrar eden başlık önerme. Mevcut alt başlıkları tekrar etme. Yalnızca bir :::taslak bloğu içinde her satıra bir alt başlık yaz; numara veya açıklama ekleme.", { n: Math.max(2, subheadingBudget(stage.key ?? "", targetWords) || 3) }) + (existingHeadings.length ? `\n${t("Mevcut alt başlıklar:")} ${existingHeadings.join(" | ")}` : ""),
      }, ctrl.signal, (ev, data) => { if (ev === "text") answer += data.text; }, t("Hata"));
      const draft = parseAnswer(answer).parts.find((p) => p.kind === "draft")?.text ?? "";
      const lines = draft.split("\n").map((l) => l.replace(/^[#\-*\d.)\s]+/, "").trim()).filter((l) => l.length > 2 && l.length < 140);
      if (lines.length) setText(lines.join("\n"));
    } catch { /* öneri alınamazsa kullanıcı elle yazar */ } finally { setSuggesting(false); }
  }

  async function run() {
    if (!stage) return;
    const titles = text.split("\n").map((l) => l.replace(/^[#\-*\d.)\s]+/, "").trim()).filter(Boolean).slice(0, 12);
    if (!titles.length) return;
    const list: Item[] = titles.map((title) => ({ title, state: "waiting", added: 0, read: 0, words: 0, gaps: [] }));
    setItems(list);
    setRepetitive(false);
    setRunning(true);
    stopped.current = false;
    pendingDrafts.current = [];
    let conversationId: string | null = null;
    const written: string[] = [];
    for (let i = 0; i < titles.length; i++) {
      if (stopped.current) { update(i, (x) => ({ ...x, state: "stopped" })); continue; }
      update(i, (x) => ({ ...x, state: "running" }));
      abort.current = new AbortController();
      let answer = "";
      let map: Record<string, string> = {};
      let gapAdded = 0;
      try {
        await streamChat({
          projectId, stageId: stage.id, conversationId, action: "draft",
          message: t("Bu bölümün yalnızca “{h}” alt başlığını yaz. Taslağı “## {h}” başlığıyla başlat; diğer alt başlıkları yazma. Bu alt konu için mevcut kaynaklar yetersizse yeni kaynak ara; tam metni okunan kaynaklardan aktarımlarda sayfa numarası ver. Önceki alt başlıklarda yazılanları tekrar etme, konuya yeniden giriş yapma ve alt başlığı özet cümlesiyle bitirme; yalnızca bu alt başlığa özgü yeni bilgiyi yaz.", { h: titles[i] }) + (targetWords > 0 ? ` ${t("Uzunluk: bu alt başlık yaklaşık {n} kelime olsun (bölüm hedefi ~{total} kelime, {k} alt başlığa bölünüyor).", { n: Math.max(100, Math.round(targetWords / titles.length / 10) * 10), total: targetWords, k: titles.length })}` : ""),
        }, abort.current.signal, (ev, data) => {
          if (ev === "phase") update(i, (x) => ({ ...x, phase: data.phase, seen: [...new Set([...(x.seen ?? []), data.phase as ChatPhase])] }));
          else if (ev === "meta") { conversationId = data.conversationId; map = data.sourceMap; }
          else if (ev === "text") answer += data.text;
          else if (ev === "sources_added" || ev === "gap_sources") { onSourcesAdded(data.sources); update(i, (x) => ({ ...x, added: x.added + data.sources.length })); }
          else if (ev === "fulltext_read") { onSourcesAdded(data.sources); update(i, (x) => ({ ...x, read: x.read + data.sources.length })); }
          else if (ev === "done") gapAdded = data.gapAdded ?? 0;
        }, t("Hata"));
        const parsed = parseAnswer(answer);
        let md = parsed.parts.filter((p) => p.kind === "draft").map((p) => p.text).join("\n\n").trim();
        if (md && !/^#{1,4}\s/.test(md)) md = `## ${titles[i]}\n\n${md}`;
        const words = (md.match(/[\p{L}\p{N}]+/gu) ?? []).length;
        if (md) written.push(md);
        if (md) { if (autoInsert) onInsert(md, map); else pendingDrafts.current.push({ md, map }); }
        update(i, (x) => ({ ...x, state: md ? "done" : "failed", phase: undefined, words, gaps: gapAdded ? [] : parsed.gaps, error: md ? undefined : t("Taslak üretilemedi") }));
      } catch (e) {
        const aborted = (e as Error).name === "AbortError";
        update(i, (x) => ({ ...x, state: aborted ? "stopped" : "failed", phase: undefined, error: aborted ? undefined : (e as Error).message }));
      }
    }
    abort.current = null;
    // Alt başlıklar ayrı ayrı yazıldığı için aralarındaki tekrarlar bütün üzerinde kontrol edilir
    setRepetitive(written.length > 1 && isRepetitive(analyzeRepetition(written.join("\n\n"), { minCount: 3 })));
    setRunning(false);
  }

  function stop() { stopped.current = true; abort.current?.abort(); }
  function insertPending() { for (const d of pendingDrafts.current) onInsert(d.md, d.map); pendingDrafts.current = []; onClose(); }
  function reset() { setItems([]); }

  const done = items.filter((x) => x.state === "done");
  const totals = { added: items.reduce((a, x) => a + x.added, 0), read: items.reduce((a, x) => a + x.read, 0), words: done.reduce((a, x) => a + x.words, 0) };
  const withGaps = items.filter((x) => x.gaps.length);

  return (
    <Modal open={open} onClose={() => { if (!running) { reset(); onClose(); } }} title={t("Alt başlıklarla yaz")} wide
      footer={running
        ? <Button variant="secondary" onClick={stop}><Square className="h-3.5 w-3.5" /> {t("Durdur")}</Button>
        : finished
          ? <>{!autoInsert && pendingDrafts.current.length > 0 && <Button onClick={insertPending}>{t("Taslakları belgeye ekle")}</Button>}<Button variant="ghost" onClick={reset}>{t("Yeni liste")}</Button><Button variant="dark" onClick={() => { reset(); onClose(); }}>{t("Kapat")}</Button></>
          : <><Button variant="ghost" onClick={onClose}>{t("Vazgeç")}</Button><Button onClick={run} disabled={!text.trim() || !stage}><Sparkles className="h-4 w-4" /> {t("Yazmaya başla")}</Button></>}>
      {items.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-ink-500">{t("Her satıra bir alt başlık yazın. Asistan her alt başlık için ayrı ayrı kaynak tarar, açık erişimli tam metinleri okur ve o alt başlığı yazar. Bitince hangi alt başlıklarda kaynak bulunamadığını gösterir.")}</p>
          <textarea className="input min-h-[150px] text-[15px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={t("ör.\nBağlanma kuramı\nİlişki odaklı OKB\nEbeveyn tutumları ve kişilik")} aria-label={t("Alt başlıklar")} />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="soft" loading={suggesting} onClick={suggest}><ListOrdered className="h-3.5 w-3.5" /> {t("Alt başlık öner")}</Button>
            {existingHeadings.length > 0 && <Button size="sm" variant="ghost" onClick={() => setText(existingHeadings.join("\n"))}>{t("Mevcut başlıkları kullan")}</Button>}
            <label className="ml-auto flex items-center gap-2 text-[13px] text-ink-600"><input type="checkbox" checked={autoInsert} onChange={(e) => setAutoInsert(e.target.checked)} /> {t("Her alt başlık bitince belgeye ekle")}</label>
          </div>
          <p className="text-xs text-ink-400">{t("Her alt başlık bir yapay zekâ isteği sayılır; kaynak taramaları ayrıca sayılır. En fazla 12 alt başlık.")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((x, i) => (
            <div key={i} className={cn("rounded-2xl border px-3.5 py-3", x.state === "running" ? "border-brand-200 bg-brand-50/40" : "border-ink-100")}>
              <div className="flex items-center gap-2">
                {x.state === "done" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : x.state === "running" ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-600" /> : x.state === "failed" ? <XCircle className="h-4 w-4 shrink-0 text-rose-500" /> : <Circle className="h-4 w-4 shrink-0 text-ink-300" />}
                <p className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink-800">{x.title}</p>
                {x.state === "done" && <span className="shrink-0 text-xs text-ink-400">{t("{n} kelime", { n: x.words })}</span>}
                {x.state === "stopped" && <span className="shrink-0 text-xs text-ink-400">{t("Durduruldu")}</span>}
              </div>
              {x.state === "running" && <div className="mt-2"><PhaseSteps phase={x.phase ?? "plan"} seen={x.seen} /></div>}
              {(x.added > 0 || x.read > 0) && <p className="mt-1.5 text-xs text-ink-500">{t("{a} yeni kaynak eklendi · {r} tam metin okundu", { a: x.added, r: x.read })}</p>}
              {x.gaps.length > 0 && <p className="mt-1.5 flex gap-1.5 text-xs text-amber-700"><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {t("Kaynak bulunamayan konular:")} {x.gaps.join(" · ")}</p>}
              {x.error && <p className="mt-1.5 text-xs text-rose-600">{x.error}</p>}
            </div>
          ))}
          {finished && (
            <div className="rounded-2xl bg-ink-50 p-4 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">{t("Özet")}</p>
              <p className="mt-1">{t("{d}/{n} alt başlık yazıldı · toplam {w} kelime · {a} yeni kaynak · {r} tam metin okundu", { d: done.length, n: items.length, w: totals.words, a: totals.added, r: totals.read })}</p>
              {withGaps.length > 0
                ? <p className="mt-1 text-amber-800">{t("{n} alt başlıkta bazı konular için kaynak bulunamadı; bu konular kesin iddia olarak yazılmadı.", { n: withGaps.length })}</p>
                : done.length > 0 && <p className="mt-1 text-emerald-700">{t("Tüm alt başlıklar kaynaklarla desteklendi.")}</p>}
              {repetitive && <p className="mt-1 text-amber-800">{t("Alt başlıklar arasında tekrar eden ifadeler bulundu. Bölüm metnini seçip asistanda “Tekrarları azalt”a basarak tek seferde düzeltebilirsiniz.")}</p>}
              {autoInsert && done.length > 0 && <p className="mt-1 text-ink-500">{t("Taslaklar belgeye eklendi; önceki hâl sürüm geçmişinde saklandı.")}</p>}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
