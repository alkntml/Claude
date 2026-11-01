"use client";
import { useT } from "@/i18n/client";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { richToPlain } from "@/lib/citations/util";
import { useCitations } from "./citation-context";
import { EvidenceDialog } from "./evidence-dialog";

/** Atfın geçtiği cümle (paragraf içinde atıftan önceki ve sonraki cümle parçaları) */
function sentenceAround(editor: NodeViewProps["editor"], pos: number): string {
  try {
    const $p = editor.state.doc.resolve(pos);
    const parent = $p.parent;
    const off = pos - $p.start();
    const before = parent.textBetween(0, off, " ", " ").split(/(?<=[.!?])\s+/).pop() ?? "";
    const after = parent.textBetween(Math.min(off + 1, parent.content.size), parent.content.size, " ", " ").split(/(?<=[.!?])\s+/)[0] ?? "";
    return `${before.trim()} ${after.trim()}`.replace(/\s+/g, " ").trim() || parent.textContent;
  } catch { return ""; }
}

function CitationView({ node, updateAttributes, deleteNode, selected, editor, getPos }: NodeViewProps) {
  const { t } = useT();
  const ctx = useCitations();
  const [open, setOpen] = useState(false);
  const [check, setCheck] = useState<{ id: string; sentence: string } | null>(null);
  // Pencere ekranın dışına taşmasın: atfın konumuna göre sola kaydırılır
  const [shift, setShift] = useState(0);
  const ids: string[] = node.attrs.ids ?? [];
  const missing = !ctx || ids.some((id) => !ctx.sources[id]);
  const label = ctx && !missing ? richToPlain(ctx.engine.cite(ids, { locator: node.attrs.locator, narrative: node.attrs.narrative })) : t("[kaynak bulunamadı]");
  const sup = ctx?.engine.style === "ama";
  return (
    <NodeViewWrapper as="span" className="relative">
      <span contentEditable={false} onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const w = Math.min(320, window.innerWidth - 32); setShift(Math.min(0, window.innerWidth - 16 - (r.left + w))); setOpen((o) => !o); }} className={`citation-node ${missing ? "missing" : ""} ${selected ? "ring-2 ring-brand-300" : ""}`} data-citation data-ids={ids.join(",")}>
        {sup ? <sup>{label}</sup> : label}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span contentEditable={false} initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} style={{ left: shift }} className="absolute top-7 z-30 block w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink-100 bg-white p-3 font-sans text-[13px] leading-snug shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            {ids.map((id) => {
              const s = ctx?.sources[id];
              return (
                <span key={id} className="mb-2 block rounded-lg bg-ink-50 p-2 text-ink-700">
                  {s ? <><b className="block text-ink-900">{s.title}</b><span className="text-ink-500">{s.year ?? "t.y."} · {s.container_title ?? s.publisher ?? ""}</span></> : <span className="text-rose-600">{t("Bu kaynak kütüphaneden silinmiş.")}</span>}
                  <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {s && ctx?.onOpenSource && <button type="button" onClick={() => ctx.onOpenSource!(id)} className="text-brand-600">{t("Kaynağı göster")}</button>}
                    {s && <button type="button" onClick={() => { const pos = typeof getPos === "function" ? getPos() : undefined; setCheck({ id, sentence: pos != null ? sentenceAround(editor, pos) : "" }); setOpen(false); }} className="flex items-center gap-1 font-medium text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> {t("Kaynakta doğrula")}</button>}
                  </span>
                </span>
              );
            })}
            <span className="flex items-center gap-2">
              <input className="input !py-1.5 !text-[13px]" placeholder={t("Sayfa (doğrudan alıntı)")} defaultValue={node.attrs.locator ?? ""} onBlur={(e) => updateAttributes({ locator: e.target.value.trim() || null })} />
            </span>
            <label className="mt-2 flex items-center gap-2 text-ink-600"><input type="checkbox" checked={!!node.attrs.narrative} onChange={(e) => updateAttributes({ narrative: e.target.checked })} /> {t("Anlatı atfı: Yazar (Yıl)")}</label>
            <span className="mt-2 flex justify-between">
              <button type="button" onClick={() => setOpen(false)} className="text-ink-500 hover:text-ink-800">{t("Kapat")}</button>
              <button type="button" onClick={deleteNode} className="flex items-center gap-1 text-rose-600"><Trash2 className="h-3.5 w-3.5" /> {t("Atfı kaldır")}</button>
            </span>
          </motion.span>
        )}
      </AnimatePresence>
      {check && <EvidenceDialog sourceId={check.id} source={ctx?.sources[check.id]} sentence={check.sentence || t("(cümle bulunamadı)")} locator={node.attrs.locator ?? null} onClose={() => setCheck(null)} />}
    </NodeViewWrapper>
  );
}

export const Citation = Node.create({
  name: "citation",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      ids: { default: [], parseHTML: (el) => (el.getAttribute("data-ids") ?? "").split(",").filter(Boolean), renderHTML: (a) => ({ "data-ids": (a.ids ?? []).join(",") }) },
      locator: { default: null, parseHTML: (el) => el.getAttribute("data-locator"), renderHTML: (a) => (a.locator ? { "data-locator": a.locator } : {}) },
      narrative: { default: false, parseHTML: (el) => el.getAttribute("data-narrative") === "true", renderHTML: (a) => ({ "data-narrative": String(!!a.narrative) }) },
    };
  },
  parseHTML() { return [{ tag: "span[data-citation]" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", mergeAttributes(HTMLAttributes, { "data-citation": "" }), "[atıf]"]; },
  addNodeView() { return ReactNodeViewRenderer(CitationView); },
});

function FootnoteView({ node, updateAttributes, deleteNode, getPos, editor }: NodeViewProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  let index = 1;
  const pos = typeof getPos === "function" ? getPos() : 0;
  editor.state.doc.descendants((n, p) => { if (n.type.name === "footnote" && p < (pos ?? 0)) index++; });
  return (
    <NodeViewWrapper as="span" className="relative">
      <span contentEditable={false} className="footnote-node" title={node.attrs.text} onClick={() => setOpen((o) => !o)}>{index}</span>
      {open && (
        <span contentEditable={false} className="absolute left-0 top-6 z-30 block w-72 rounded-2xl border border-ink-100 bg-white p-3 font-sans text-[13px] shadow-xl">
          <textarea className="input min-h-[80px] !text-[13px]" defaultValue={node.attrs.text} onBlur={(e) => updateAttributes({ text: e.target.value })} placeholder={t("Dipnot metni")} />
          <span className="mt-2 flex justify-between"><button type="button" onClick={() => setOpen(false)} className="text-ink-500">{t("Kapat")}</button><button type="button" onClick={deleteNode} className="text-rose-600">{t("Dipnotu sil")}</button></span>
        </span>
      )}
    </NodeViewWrapper>
  );
}

export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() { return { text: { default: "" } }; },
  parseHTML() { return [{ tag: "span[data-footnote]" }]; },
  renderHTML({ HTMLAttributes }) { return ["span", mergeAttributes(HTMLAttributes, { "data-footnote": "" })]; },
  addNodeView() { return ReactNodeViewRenderer(FootnoteView); },
});
