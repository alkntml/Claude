"use client";
/**
 * Bul ve değiştir (D140): editörde (açık bölüm / alt başlık) metin arar, eşleşmeleri vurgular, tek tek veya toplu değiştirir.
 * Biçimli metinde (ör. kelimenin bir kısmı kalın) de bulur: arama paragraf metni üzerinde yapılır, konumlar eşlenir.
 * Türkçe büyük/küçük harf duyarsız (İ/ı doğru eşleşir). Atıf ve dipnot gibi satır içi düğümler arama dışıdır.
 */
import { Extension, type Editor } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface FindState { query: string; caseSensitive: boolean; wholeWord: boolean; current: number }
export interface Hit { from: number; to: number }
export const findKey = new PluginKey<FindState>("findReplace");
const EMPTY: FindState = { query: "", caseSensitive: false, wholeWord: false, current: 0 };

const lower = (s: string) => { const l = s.toLocaleLowerCase("tr"); return l.length === s.length ? l : s.toLowerCase().length === s.length ? s.toLowerCase() : s; };
const isWordChar = (c: string | undefined) => !!c && /[\p{L}\p{N}_]/u.test(c);

/** Belgedeki tüm eşleşmeler (belge sırasıyla) */
export function findHits(doc: PMNode, st: Pick<FindState, "query" | "caseSensitive" | "wholeWord">): Hit[] {
  const q = st.caseSensitive ? st.query : lower(st.query);
  if (!q) return [];
  const hits: Hit[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    let text = "";
    const map: number[] = [];
    node.forEach((child, offset) => {
      if (child.isText) { for (let i = 0; i < child.text!.length; i++) { text += child.text![i]; map.push(pos + 1 + offset + i); } }
      else { text += "￼"; map.push(pos + 1 + offset); }
    });
    const hay = st.caseSensitive ? text : lower(text);
    let i = hay.indexOf(q);
    while (i >= 0) {
      const end = i + q.length;
      const ok = !st.wholeWord || (!isWordChar(text[i - 1]) && !isWordChar(text[end]));
      if (ok && !hay.slice(i, end).includes("￼")) hits.push({ from: map[i], to: map[end - 1] + 1 });
      i = hay.indexOf(q, i + Math.max(1, q.length));
    }
    return false;
  });
  return hits;
}

export const FindReplace = Extension.create({
  name: "findReplace",
  addProseMirrorPlugins() {
    return [new Plugin<FindState>({
      key: findKey,
      state: {
        init: () => EMPTY,
        apply: (tr, value) => { const m = tr.getMeta(findKey) as Partial<FindState> | undefined; return m ? { ...value, ...m } : value; },
      },
      props: {
        decorations(state) {
          const st = findKey.getState(state);
          if (!st?.query) return null;
          const hits = findHits(state.doc, st);
          if (!hits.length) return null;
          const cur = ((st.current % hits.length) + hits.length) % hits.length;
          return DecorationSet.create(state.doc, hits.map((h, i) => Decoration.inline(h.from, h.to, { class: i === cur ? "find-hit find-hit-current" : "find-hit" })));
        },
      },
    })];
  },
});

export function setFind(editor: Editor | null, patch: Partial<FindState>) {
  if (!editor || editor.isDestroyed) return;
  editor.view.dispatch(editor.state.tr.setMeta(findKey, patch).setMeta("addToHistory", false));
}
export function getFind(editor: Editor | null): FindState { return (editor && !editor.isDestroyed && findKey.getState(editor.state)) || EMPTY; }

/** n’inci eşleşmeye gider (görünür yapar); eşleşme sayısını döndürür */
export function gotoHit(editor: Editor | null, n: number): number {
  if (!editor) return 0;
  const st = getFind(editor);
  const hits = findHits(editor.state.doc, st);
  if (!hits.length) { setFind(editor, { current: 0 }); return 0; }
  const cur = ((n % hits.length) + hits.length) % hits.length;
  setFind(editor, { current: cur });
  const h = hits[cur];
  editor.chain().setTextSelection({ from: h.from, to: h.to }).scrollIntoView().run();
  return hits.length;
}

export function replaceCurrent(editor: Editor | null, replacement: string): boolean {
  if (!editor) return false;
  const st = getFind(editor);
  const hits = findHits(editor.state.doc, st);
  if (!hits.length) return false;
  const cur = ((st.current % hits.length) + hits.length) % hits.length;
  const h = hits[cur];
  editor.view.dispatch(editor.state.tr.insertText(replacement, h.from, h.to));
  gotoHit(editor, cur);
  return true;
}

export function replaceAll(editor: Editor | null, replacement: string): number {
  if (!editor) return 0;
  const hits = findHits(editor.state.doc, getFind(editor));
  if (!hits.length) return 0;
  const tr = editor.state.tr;
  for (const h of [...hits].reverse()) tr.insertText(replacement, h.from, h.to);
  editor.view.dispatch(tr);
  setFind(editor, { current: 0 });
  return hits.length;
}
