"use client";
import { useT } from "@/i18n/client";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { richToPlain } from "@/lib/citations/util";
import { useCitations } from "./citation-context";

function CitationView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { t } = useT();
  const ctx = useCitations();
  const [open, setOpen] = useState(false);
  const ids: string[] = node.attrs.ids ?? [];
  const missing = !ctx || ids.some((id) => !ctx.sources[id]);
  const label = ctx && !missing ? richToPlain(ctx.engine.cite(ids, { locator: node.attrs.locator, narrative: node.attrs.narrative })) : t("[kaynak bulunamadı]");
  const sup = ctx?.engine.style === "ama";
  return (
    <NodeViewWrapper as="span" className="relative">
      <span contentEditable={false} onClick={() => setOpen((o) => !o)} className={`citation-node ${missing ? "missing" : ""} ${selected ? "ring-2 ring-brand-300" : ""}`} data-citation>
        {sup ? <sup>{label}</sup> : label}
      </span>
      <AnimatePresence>
        {open && (
          <motion.span contentEditable={false} initial={{ opacity: 0, y: 4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }} className="absolute left-0 top-7 z-30 block w-80 rounded-2xl border border-ink-100 bg-white p-3 font-sans text-[13px] leading-snug shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
            {ids.map((id) => {
              const s = ctx?.sources[id];
              return (
                <span key={id} className="mb-2 block rounded-lg bg-ink-50 p-2 text-ink-700">
                  {s ? <><b className="block text-ink-900">{s.title}</b><span className="text-ink-500">{s.year ?? "t.y."} · {s.container_title ?? s.publisher ?? ""}</span></> : <span className="text-rose-600">{t("Bu kaynak kütüphaneden silinmiş.")}</span>}
                  {s && ctx?.onOpenSource && <button type="button" onClick={() => ctx.onOpenSource!(id)} className="mt-1 block text-brand-600">{t("Kaynağı göster")}</button>}
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
