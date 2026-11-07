"use client";
/**
 * Satır içi otomatik tamamlama (D113): öğrenci paragrafın sonunda yazmayı bırakınca (≈1 sn) gri renkte en fazla bir cümlelik
 * öneri görünür. Tab tümünü, Ctrl/⌘+→ bir kelimeyi kabul eder; Esc veya farklı yazmaya devam etmek öneriyi kaldırır.
 * Yazılan harfler önerinin başıyla aynıysa öneri kısalarak kalır. Dokunmatik ekranda öneriye dokunmak kabul eder.
 */
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, type EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet, type EditorView } from "@tiptap/pm/view";

export interface SuggestOptions {
  /** Öneri isteği; boş dize = öneri yok. Hata fırlatırsa öneri gösterilmez. */
  fetch: (before: string, signal: AbortSignal) => Promise<string>;
  enabled: () => boolean;
}
interface SState { text: string; pos: number }
const KEY = new PluginKey<SState>("inlineSuggest");
const EMPTY: SState = { text: "", pos: -1 };

/** İmleç paragrafın sonunda mı ve yeterince metin var mı? Öyleyse önceki bağlam (önceki paragraf + bu paragraf) döner. */
function contextAtCursor(state: EditorState): { before: string; pos: number } | null {
  const sel = state.selection;
  if (!sel.empty) return null;
  const $p = sel.$from;
  const parent = $p.parent;
  if (parent.type.name !== "paragraph") return null;
  if ($p.parentOffset !== parent.content.size) return null;
  // Tablo ve liste içinde öneri yok (kısa hücre/madde metinleri)
  for (let d = $p.depth; d > 0; d--) { const n = $p.node(d).type.name; if (n === "tableCell" || n === "tableHeader" || n === "listItem") return null; }
  const text = parent.textContent;
  if (text.trim().length < 20 || /[\n]$/.test(text)) return null;
  // Önceki paragrafın sonu da bağlama eklenir
  let prev = "";
  const idx = $p.index($p.depth - 1);
  if (idx > 0) prev = $p.node($p.depth - 1).child(idx - 1).textContent.slice(-700);
  return { before: `${prev ? `${prev}\n\n` : ""}${text}`.slice(-1500), pos: sel.from };
}

export function createInlineSuggest(opts: SuggestOptions) {
  return Extension.create({
    name: "inlineSuggest",
    addKeyboardShortcuts() {
      const accept = (part: "all" | "word") => {
        const st = KEY.getState(this.editor.state);
        if (!st?.text || st.pos !== this.editor.state.selection.from) return false;
        const piece = part === "all" ? st.text : (st.text.match(/^\s*\S+/)?.[0] ?? st.text);
        this.editor.view.dispatch(this.editor.state.tr.insertText(piece, st.pos).setMeta(KEY, { accepted: piece }));
        return true;
      };
      return {
        Tab: () => accept("all"),
        "Mod-ArrowRight": () => accept("word"),
        Escape: () => { const st = KEY.getState(this.editor.state); if (!st?.text) return false; this.editor.view.dispatch(this.editor.state.tr.setMeta(KEY, { clear: true })); return true; },
      };
    },
    addProseMirrorPlugins() {
      let timer: ReturnType<typeof setTimeout> | null = null;
      let ctrl: AbortController | null = null;
      const schedule = (view: EditorView) => {
        if (timer) clearTimeout(timer);
        ctrl?.abort();
        if (!opts.enabled() || !view.hasFocus() || !view.editable) return;
        timer = setTimeout(async () => {
          const ctx = contextAtCursor(view.state);
          if (!ctx) return;
          ctrl = new AbortController();
          try {
            const text = await opts.fetch(ctx.before, ctrl.signal);
            // Bu arada imleç veya metin değiştiyse öneri gösterilmez
            const now = contextAtCursor(view.state);
            if (text && now && now.pos === ctx.pos && now.before === ctx.before) view.dispatch(view.state.tr.setMeta(KEY, { text, pos: ctx.pos }));
          } catch { /* iptal veya hata: öneri yok */ }
        }, 1000);
      };
      return [
        new Plugin<SState>({
          key: KEY,
          state: {
            init: () => EMPTY,
            apply(tr, value) {
              const meta = tr.getMeta(KEY) as { text?: string; pos?: number; clear?: boolean; accepted?: string } | undefined;
              if (meta?.clear) return EMPTY;
              if (meta?.text != null && meta.pos != null) return { text: meta.text, pos: meta.pos };
              if (meta?.accepted != null) {
                const rest = value.text.slice(meta.accepted.length);
                return rest.trim() ? { text: rest, pos: value.pos + meta.accepted.length } : EMPTY;
              }
              if (!value.text) return value;
              if (tr.docChanged) {
                // Yazılan metin önerinin başıyla aynıysa öneri kısalarak sürer
                const typed = tr.doc.textBetween(value.pos, Math.min(tr.selection.from, tr.doc.content.size), "");
                if (tr.selection.from > value.pos && value.text.startsWith(typed) && typed.length < value.text.length) return { text: value.text.slice(typed.length), pos: tr.selection.from };
                return EMPTY;
              }
              if (tr.selectionSet && tr.selection.from !== value.pos) return EMPTY;
              return value;
            },
          },
          props: {
            decorations(state) {
              const st = KEY.getState(state);
              if (!st?.text || st.pos < 0 || st.pos > state.doc.content.size) return null;
              return DecorationSet.create(state.doc, [Decoration.widget(st.pos, (view) => {
                const span = document.createElement("span");
                span.className = "inline-suggest";
                span.textContent = st.text;
                span.setAttribute("aria-hidden", "true");
                const kbd = document.createElement("kbd");
                kbd.className = "inline-suggest-key";
                kbd.textContent = "Tab";
                span.appendChild(kbd);
                // Dokunmatik ve fare: öneriye tıklamak kabul eder
                span.addEventListener("mousedown", (e) => { e.preventDefault(); const cur = KEY.getState(view.state); if (cur?.text) view.dispatch(view.state.tr.insertText(cur.text, cur.pos).setMeta(KEY, { accepted: cur.text })); });
                return span;
              }, { side: 1, key: `s-${st.pos}-${st.text.length}` })]);
            },
            handleDOMEvents: { blur: (view) => { if (timer) clearTimeout(timer); ctrl?.abort(); if (KEY.getState(view.state)?.text) view.dispatch(view.state.tr.setMeta(KEY, { clear: true })); return false; } },
          },
          view: () => ({
            update(view, prev) {
              // Yalnızca kullanıcı yazdığında (metin değiştiğinde) yeni öneri planlanır
              if (!prev.doc.eq(view.state.doc) && !KEY.getState(view.state)?.text) schedule(view);
            },
            destroy() { if (timer) clearTimeout(timer); ctrl?.abort(); },
          }),
        }),
      ];
    },
  });
}
