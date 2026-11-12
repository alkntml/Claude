"use client";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ArrowDownRight, ArrowUpRight, ChevronDown, ChevronRight, Clock3, FlaskConical, GraduationCap, Languages, List, ListOrdered, Maximize2, Minimize2, PenLine, RefreshCw, Sparkles, SpellCheck2, Swords, Table2, TrendingUp, WandSparkles, AlignLeft } from "lucide-react";
import { useState } from "react";
import { useT } from "@/i18n/client";
import type { AssistantAction } from "@/lib/ai/prompts";

/**
 * Seçili metin balonu (D111, D149): metin seçilince hemen üstünde açılır. Çeviri, dil denetimi, kısalt/genişlet ve
 * “Yapay zekâ ile düzenle” menüsü (yazıyı güçlendir, akademik üslup, dönüştür). Atıf düğümü seçiliyken ve tek kelimeden
 * kısa seçimde görünmez. Sonuç asistan panelinde önizlenir; “Seçimin yerine koy” ile uygulanır.
 */
// TipTap 3: bu iki değer her çizimde aynı nesne olmalı; yeni nesne verilirse balon her çizimde güncellenir ve sonsuz döngü oluşur
const BUBBLE_OPTIONS = { placement: "top" as const, offset: 8, flip: true, shift: { padding: 12 } };
const shouldShow = ({ editor: e, from, to }: { editor: Editor; from: number; to: number }) => {
  if (!e.isEditable || from === to) return false;
  if (e.isActive("citation") || e.isActive("figure")) return false;
  return e.state.doc.textBetween(from, to, " ").trim().length >= 3;
};

type Item = { action: AssistantAction; label: string; icon: React.ComponentType<{ className?: string }> };
export const AI_MENU: { group: string; items: Item[] }[] = [
  { group: "Yazıyı güçlendir", items: [
    { action: "fluency", label: "Akıcılığı artır", icon: WandSparkles },
    { action: "rephrase", label: "Yeniden ifade et", icon: RefreshCw },
    { action: "simplify", label: "Basitleştir", icon: Sparkles },
    { action: "strengthen_argument", label: "Argümanı güçlendir", icon: TrendingUp },
    { action: "counter_argument", label: "Karşı argüman ekle", icon: Swords },
  ] },
  { group: "Akademik üslup", items: [
    { action: "formal", label: "Resmiliği artır", icon: GraduationCap },
    { action: "technical", label: "Teknik hassasiyet", icon: FlaskConical },
    { action: "assertive", label: "İddia güvenini artır", icon: ArrowUpRight },
    { action: "hedge", label: "İddia güvenini yumuşat", icon: ArrowDownRight },
  ] },
  { group: "Dönüştür", items: [
    { action: "tense_past", label: "Geçmiş zamana çevir", icon: Clock3 },
    { action: "tense_present", label: "Şimdiki/geniş zamana çevir", icon: Clock3 },
    { action: "to_bullets", label: "Madde listesine dönüştür", icon: List },
    { action: "to_numbered", label: "Numaralı listeye dönüştür", icon: ListOrdered },
    { action: "to_table", label: "Tabloya dönüştür", icon: Table2 },
    { action: "to_prose", label: "Düzyazıya dönüştür", icon: AlignLeft },
  ] },
];

export function SelectionBubble({ editor, onLanguage, onAssistant }: {
  editor: Editor;
  onLanguage: (tab: "translate" | "proofread", range: { from: number; to: number }) => void;
  onAssistant: (action: AssistantAction, text: string) => void;
}) {
  const { t } = useT();
  const [menu, setMenu] = useState(false);
  const sel = () => { const { from, to } = editor.state.selection; return { from, to, text: editor.state.doc.textBetween(from, to, "\n") }; };
  const btn = "flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-ink-700 transition hover:bg-ink-100 hover:text-ink-950";
  const run = (a: AssistantAction) => { setMenu(false); onAssistant(a, sel().text); };
  return (
    <BubbleMenu editor={editor} options={BUBBLE_OPTIONS} shouldShow={shouldShow}>
      <div className="relative" onMouseDown={(e) => e.preventDefault()}>
        <div className="no-scrollbar flex max-w-[calc(100vw-24px)] items-center gap-0.5 overflow-x-auto rounded-xl border border-ink-200/80 bg-white p-1 shadow-xl">
          <button type="button" className={btn} onClick={() => setMenu((v) => !v)} aria-expanded={menu}><PenLine className="h-4 w-4 text-brand-600" /> {t("Yapay zekâ ile düzenle")} <ChevronDown className="h-3.5 w-3.5 text-ink-400" /></button>
          <span className="mx-0.5 h-5 w-px shrink-0 bg-ink-100" />
          <button type="button" className={btn} onClick={() => { const s = sel(); onLanguage("translate", s); }}><Languages className="h-4 w-4 text-ink-500" /> {t("Çevir")}</button>
          <button type="button" className={btn} onClick={() => { const s = sel(); onLanguage("proofread", s); }}><SpellCheck2 className="h-4 w-4 text-ink-500" /><span className="hidden sm:inline">{t("Dil denetimi")}</span></button>
          <button type="button" className={btn} onClick={() => run("shorten")} title={t("Kısalt")}><Minimize2 className="h-4 w-4 text-ink-500" /><span className="hidden sm:inline">{t("Kısalt")}</span></button>
          <button type="button" className={btn} onClick={() => run("expand")} title={t("Genişlet")}><Maximize2 className="h-4 w-4 text-ink-500" /><span className="hidden sm:inline">{t("Genişlet")}</span></button>
          <button type="button" className={btn} onClick={() => run("chat")} title={t("Asistana sor")}><Sparkles className="h-4 w-4 text-ink-500" /><span className="hidden md:inline">{t("Asistana sor")}</span></button>
        </div>
        {menu && (
          <div className="absolute left-0 top-full z-50 mt-1.5 max-h-[60vh] w-72 overflow-y-auto rounded-xl border border-ink-200/80 bg-white p-1.5 shadow-xl">
            {AI_MENU.map((g) => (
              <div key={g.group} className="pb-1">
                <p className="px-2.5 pb-1 pt-2 text-[12px] font-medium text-ink-400">{t(g.group)}</p>
                {g.items.map((it) => (
                  <button key={it.action} type="button" onClick={() => run(it.action)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[14px] text-ink-800 transition hover:bg-ink-50">
                    <it.icon className="h-4 w-4 shrink-0 text-brand-600" /> <span className="flex-1">{t(it.label)}</span><ChevronRight className="h-3.5 w-3.5 text-ink-300" />
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </BubbleMenu>
  );
}
