"use client";
/** Bul ve değiştir çubuğu (D140): Ctrl/⌘+F veya araç çubuğundaki büyüteç ile açılır; Enter sonraki, Shift+Enter önceki */
import type { Editor } from "@tiptap/react";
import { ChevronDown, ChevronUp, Replace, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { useT } from "@/i18n/client";
import { findHits, getFind, gotoHit, replaceAll, replaceCurrent, setFind } from "./find-replace";

export function FindBar({ editor, onClose, canEdit, scopeLabel }: { editor: Editor | null; onClose: () => void; canEdit: boolean; scopeLabel: string }) {
  const { t } = useT();
  const [q, setQ] = useState(() => { const sel = editor ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, " ") : ""; return sel.length < 80 ? sel : ""; });
  const [rep, setRep] = useState("");
  const [cs, setCs] = useState(false);
  const [ww, setWw] = useState(false);
  const [showRep, setShowRep] = useState(false);
  const [, force] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); input.current?.select(); }, []);
  useEffect(() => { setFind(editor, { query: q, caseSensitive: cs, wholeWord: ww, current: 0 }); if (q) gotoHit(editor, 0); force((x) => x + 1); }, [q, cs, ww, editor]);
  useEffect(() => () => setFind(editor, { query: "", current: 0 }), [editor]);
  useEffect(() => {
    if (!editor) return;
    const fn = () => force((x) => x + 1);
    editor.on("transaction", fn);
    return () => { editor.off("transaction", fn); };
  }, [editor]);

  const st = getFind(editor);
  const total = editor && q ? findHits(editor.state.doc, st).length : 0;
  const cur = total ? (((st.current % total) + total) % total) + 1 : 0;
  const go = (d: number) => gotoHit(editor, st.current + d);

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5 rounded-2xl border border-ink-100 bg-white/95 p-1.5 shadow-soft backdrop-blur" role="search" aria-label={t("Bul ve değiştir")}>
      <div className="flex min-w-[200px] flex-1 items-center gap-1 rounded-xl border border-ink-200 bg-white px-2">
        <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Bu bölümde bul…")} aria-label={t("Aranacak metin")}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); go(e.shiftKey ? -1 : 1); } if (e.key === "Escape") onClose(); }}
          className="h-8 min-w-0 flex-1 bg-transparent text-[13.5px] text-ink-900 outline-none" />
        <span className="shrink-0 text-[12px] tabular-nums text-ink-500">{q ? t("{a}/{b}", { a: cur, b: total }) : ""}</span>
      </div>
      <button type="button" onClick={() => go(-1)} disabled={!total} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={t("Önceki")}><ChevronUp className="h-4 w-4" /></button>
      <button type="button" onClick={() => go(1)} disabled={!total} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label={t("Sonraki")}><ChevronDown className="h-4 w-4" /></button>
      <button type="button" onClick={() => setCs((v) => !v)} aria-pressed={cs} title={t("Büyük/küçük harfe duyarlı")} className={cn("rounded-lg px-2 py-1 text-[12px] font-semibold", cs ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100")}>Aa</button>
      <button type="button" onClick={() => setWw((v) => !v)} aria-pressed={ww} title={t("Yalnızca tam kelime")} className={cn("rounded-lg px-2 py-1 text-[12px] font-semibold underline decoration-dotted", ww ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100")}>ab</button>
      {canEdit && <button type="button" onClick={() => setShowRep((v) => !v)} aria-pressed={showRep} title={t("Değiştir")} className={cn("rounded-lg p-1.5", showRep ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100")}><Replace className="h-4 w-4" /></button>}
      <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label={t("Kapat")}><X className="h-4 w-4" /></button>
      {showRep && canEdit && (
        <div className="flex w-full flex-wrap items-center gap-1.5">
          <input value={rep} onChange={(e) => setRep(e.target.value)} placeholder={t("Yerine yazılacak…")} aria-label={t("Yerine yazılacak metin")}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); replaceCurrent(editor, rep); } if (e.key === "Escape") onClose(); }}
            className="h-8 min-w-[200px] flex-1 rounded-xl border border-ink-200 bg-white px-2 text-[13.5px] text-ink-900 outline-none" />
          <button type="button" disabled={!total} onClick={() => replaceCurrent(editor, rep)} className="rounded-lg border border-ink-200 px-2.5 py-1 text-[12.5px] font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-40">{t("Değiştir")}</button>
          <button type="button" disabled={!total} onClick={() => replaceAll(editor, rep)} className="rounded-lg bg-ink-900 px-2.5 py-1 text-[12.5px] font-medium text-white hover:bg-ink-800 disabled:opacity-40">{t("Tümünü değiştir ({n})", { n: total })}</button>
        </div>
      )}
      <p className="w-full px-1 text-[11.5px] text-ink-400">{scopeLabel}</p>
    </div>
  );
}
