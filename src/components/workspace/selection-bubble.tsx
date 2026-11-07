"use client";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Languages, Maximize2, Minimize2, SpellCheck2, Sparkles, WandSparkles } from "lucide-react";
import { useT } from "@/i18n/client";

/**
 * Seçili metin balonu (D111): metin seçilince hemen üstünde açılır. Öğrencinin en sık yaptığı işler tek tıkla:
 * çeviri, dil denetimi, akademik üslup, kısaltma, genişletme. Atıf düğümü seçiliyken ve tek kelimeden kısa seçimde görünmez.
 */
// TipTap 3: bu iki değer her çizimde aynı nesne olmalı; yeni nesne verilirse balon her çizimde güncellenir ve sonsuz döngü oluşur
const BUBBLE_OPTIONS = { placement: "top" as const, offset: 8, flip: true, shift: { padding: 12 } };
const shouldShow = ({ editor: e, from, to }: { editor: Editor; from: number; to: number }) => {
  if (!e.isEditable || from === to) return false;
  if (e.isActive("citation") || e.isActive("figure")) return false;
  return e.state.doc.textBetween(from, to, " ").trim().length >= 3;
};

export function SelectionBubble({ editor, onLanguage, onAssistant }: {
  editor: Editor;
  onLanguage: (tab: "translate" | "proofread", range: { from: number; to: number }) => void;
  onAssistant: (action: "academic_tone" | "shorten" | "expand" | "chat", text: string) => void;
}) {
  const { t } = useT();
  const sel = () => { const { from, to } = editor.state.selection; return { from, to, text: editor.state.doc.textBetween(from, to, "\n") }; };
  const btn = "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium text-ink-700 transition hover:bg-ink-100 hover:text-ink-950";
  return (
    <BubbleMenu
      editor={editor}
      options={BUBBLE_OPTIONS}
      shouldShow={shouldShow}
    >
      <div className="no-scrollbar flex max-w-[calc(100vw-24px)] items-center gap-0.5 overflow-x-auto rounded-xl border border-ink-100 bg-white p-1 shadow-xl" onMouseDown={(e) => e.preventDefault()}>
        <button type="button" className={btn} onClick={() => { const s = sel(); onLanguage("translate", s); }}><Languages className="h-4 w-4 text-brand-600" /> {t("Çevir")}</button>
        <button type="button" className={btn} onClick={() => { const s = sel(); onLanguage("proofread", s); }}><SpellCheck2 className="h-4 w-4 text-brand-600" /> {t("Dil denetimi")}</button>
        <span className="mx-0.5 h-5 w-px shrink-0 bg-ink-100" />
        <button type="button" className={btn} onClick={() => onAssistant("academic_tone", sel().text)}><WandSparkles className="h-4 w-4 text-violet-600" /> {t("Akademikleştir")}</button>
        <button type="button" className={btn} onClick={() => onAssistant("shorten", sel().text)} title={t("Kısalt")}><Minimize2 className="h-4 w-4 text-violet-600" /><span className="hidden sm:inline">{t("Kısalt")}</span></button>
        <button type="button" className={btn} onClick={() => onAssistant("expand", sel().text)} title={t("Genişlet")}><Maximize2 className="h-4 w-4 text-violet-600" /><span className="hidden sm:inline">{t("Genişlet")}</span></button>
        <button type="button" className={btn} onClick={() => onAssistant("chat", sel().text)} title={t("Asistana sor")}><Sparkles className="h-4 w-4 text-violet-600" /><span className="hidden sm:inline">{t("Asistana sor")}</span></button>
      </div>
    </BubbleMenu>
  );
}
