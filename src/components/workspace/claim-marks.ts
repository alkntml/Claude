"use client";
/**
 * İddia denetimi işaretleri (D119): denetlenen cümleler editörde renkli alt çizgiyle gösterilir
 * (desteklenmiyor: kırmızı, kısmen: amber, okunamadı: gri, atıfsız iddia: turuncu). Metin düzenlendikçe işaretler
 * konumlarıyla birlikte kayar; “Temizle” ile kalkar. Ayrıca cümleyi belgede bulup seçmek için yardımcı içerir.
 */
import { Extension } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export type MarkTone = "bad" | "partial" | "unknown" | "uncited" | "good";
export interface ClaimMark { text: string; tone: MarkTone; title?: string }
const KEY = new PluginKey<DecorationSet>("claimMarks");

const PUNCT = /[.,;:!?)]/;
/** Metni karşılaştırma için sadeleştirir: boşlukları tekler, noktalama öncesi boşluğu siler */
export function normalizeForMatch(s: string): string {
  return s.replace(/\s+/g, " ").replace(/ ([.,;:!?)])/g, "$1").trim().toLocaleLowerCase("tr");
}

/** Belgedeki metni (atıflar boşluk sayılır) sadeleştirilmiş hâliyle ve her karakterin belge konumuyla döndürür */
function indexDoc(doc: PMNode): { text: string; pos: number[] } {
  const chars: { ch: string; pos: number }[] = [];
  doc.descendants((n, pos) => {
    if (n.isText) { const t = n.text ?? ""; for (let i = 0; i < t.length; i++) chars.push({ ch: t[i], pos: pos + i }); return false; }
    if (n.type.name === "citation" || n.type.name === "footnote" || n.type.name === "hardBreak") { chars.push({ ch: " ", pos }); return false; }
    if (n.isBlock && chars.length) chars.push({ ch: "\n", pos });
    return true;
  });
  let text = ""; const out: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    let ch = chars[i].ch;
    if (/\s/.test(ch)) {
      if (ch === "\n") { text += "\n"; out.push(chars[i].pos); continue; }
      if (text.endsWith(" ") || text.endsWith("\n") || !text) continue;
      const next = chars.slice(i + 1).find((c) => !/[ \t]/.test(c.ch));
      if (next && PUNCT.test(next.ch)) continue;
      ch = " ";
    }
    text += ch.toLocaleLowerCase("tr"); out.push(chars[i].pos);
  }
  return { text, pos: out };
}

/** Cümlenin belgedeki aralığı (bulunamazsa null) */
export function findSentence(doc: PMNode, sentence: string): { from: number; to: number } | null {
  const { text, pos } = indexDoc(doc);
  const needle = normalizeForMatch(sentence);
  if (!needle) return null;
  let i = text.indexOf(needle);
  let len = needle.length;
  if (i < 0) {
    // Baş ve son kısımla dene (atıf etrafındaki küçük farklar için)
    const head = needle.slice(0, Math.min(40, needle.length));
    i = text.indexOf(head);
    if (i < 0) return null;
    const tail = needle.slice(-15);
    const j = text.indexOf(tail, i);
    len = j >= 0 && j - i < needle.length + 80 ? j - i + tail.length : head.length;
  }
  return { from: pos[i], to: pos[Math.min(i + len - 1, pos.length - 1)] + 1 };
}

function build(doc: PMNode, marks: ClaimMark[]): DecorationSet {
  const decos: Decoration[] = [];
  for (const m of marks) {
    const r = findSentence(doc, m.text);
    if (r && r.to > r.from) decos.push(Decoration.inline(r.from, r.to, { class: `claim-mark claim-${m.tone}`, ...(m.title ? { title: m.title } : {}) }));
  }
  return DecorationSet.create(doc, decos);
}

export const ClaimMarks = Extension.create({
  name: "claimMarks",
  addProseMirrorPlugins() {
    return [new Plugin<DecorationSet>({
      key: KEY,
      state: {
        init: () => DecorationSet.empty,
        apply(tr, set) {
          const meta = tr.getMeta(KEY) as { marks?: ClaimMark[]; clear?: boolean } | undefined;
          if (meta?.clear) return DecorationSet.empty;
          if (meta?.marks) return build(tr.doc, meta.marks);
          return set.map(tr.mapping, tr.doc);
        },
      },
      props: { decorations: (state) => KEY.getState(state) },
    })];
  },
});

/** İşaretleri editöre uygular (boş liste veya null: temizler) */
export function setClaimMarks(view: { state: { tr: import("@tiptap/pm/state").Transaction }; dispatch: (tr: import("@tiptap/pm/state").Transaction) => void }, marks: ClaimMark[] | null) {
  view.dispatch(view.state.tr.setMeta(KEY, marks && marks.length ? { marks } : { clear: true }).setMeta("addToHistory", false));
}
