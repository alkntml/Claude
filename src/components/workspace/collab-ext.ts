"use client";
/**
 * Ortak yazım için editör yardımcıları (D140):
 * - RemotePeers: diğer yazarların bulunduğu paragrafı renkli çizgi ve ad etiketiyle gösterir.
 * - applyDocPatch: gelen belgeyi editöre yalnızca değişen kısmı değiştirerek uygular; imleç ve seçim korunur,
 *   geri alma geçmişine girmez ve “remote” işaretlidir (yeniden yayınlanmaz).
 */
import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { JSONNode } from "@/lib/editor/doc";

export interface PeerMark { userId: string; name: string; block: number; typing: boolean }
export const remotePeersKey = new PluginKey<PeerMark[]>("remotePeers");
export const REMOTE_META = "academianaRemote";

export function peerColor(id: string): number { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 6; }

export const RemotePeers = Extension.create({
  name: "remotePeers",
  addProseMirrorPlugins() {
    return [new Plugin<PeerMark[]>({
      key: remotePeersKey,
      state: {
        init: () => [],
        apply: (tr, value) => (tr.getMeta(remotePeersKey) as PeerMark[] | undefined) ?? value,
      },
      props: {
        decorations(state) {
          const peers = remotePeersKey.getState(state) ?? [];
          if (!peers.length) return null;
          const decos: Decoration[] = [];
          const starts: number[] = [];
          state.doc.forEach((_n, offset) => { starts.push(offset); });
          const byBlock = new Map<number, PeerMark[]>();
          for (const p of peers) if (p.block >= 0 && p.block < starts.length) byBlock.set(p.block, [...(byBlock.get(p.block) ?? []), p]);
          for (const [block, list] of byBlock) {
            const from = starts[block];
            const node = state.doc.child(block);
            const c = peerColor(list[0].userId);
            decos.push(Decoration.node(from, from + node.nodeSize, { class: `peer-block peer-c${c}` }));
            decos.push(Decoration.widget(from + (node.isTextblock ? 1 : 0), () => {
              const el = document.createElement("span");
              el.className = `peer-flag peer-c${c}`;
              el.contentEditable = "false";
              el.textContent = list.map((p) => p.name.split(" ")[0]).join(", ") + (list.some((p) => p.typing) ? " ✎" : "");
              return el;
            }, { side: -1, key: `peer-${block}-${list.map((p) => p.userId + p.typing).join()}`, ignoreSelection: true }));
          }
          return DecorationSet.create(state.doc, decos);
        },
      },
    })];
  },
});

export function setPeerMarks(editor: Editor | null, peers: PeerMark[]) {
  if (!editor || editor.isDestroyed) return;
  editor.view.dispatch(editor.state.tr.setMeta(remotePeersKey, peers).setMeta("addToHistory", false));
}

/** Editördeki belgeyi yalnızca farklı kısmı değiştirerek “next” yapar. Değişiklik yoksa false. */
export function applyDocPatch(editor: Editor | null, next: JSONNode): boolean {
  if (!editor || editor.isDestroyed) return false;
  let node;
  try { node = editor.schema.nodeFromJSON(next); } catch { return false; }
  const cur = editor.state.doc;
  const start = cur.content.findDiffStart(node.content);
  if (start == null) return false;
  const end = cur.content.findDiffEnd(node.content);
  let endA = end ? end.a : cur.content.size, endB = end ? end.b : node.content.size;
  const overlap = start - Math.min(endA, endB);
  if (overlap > 0) { endA += overlap; endB += overlap; }
  const tr = editor.state.tr.replace(start, endA, node.slice(start, endB));
  tr.setMeta("addToHistory", false).setMeta(REMOTE_META, true);
  editor.view.dispatch(tr);
  return true;
}

/** İmlecin bulunduğu üst düzey bloğun sırası (editör belgesinde) */
export function cursorBlock(editor: Editor | null): number | null {
  if (!editor || editor.isDestroyed) return null;
  const pos = editor.state.selection.from;
  let idx = 0, found: number | null = null;
  editor.state.doc.forEach((n, offset) => { if (found == null && pos >= offset && pos <= offset + n.nodeSize) found = idx; idx++; });
  return found;
}
