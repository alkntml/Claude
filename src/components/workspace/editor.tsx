"use client";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Heading2, Heading3, Heading4, Italic, List, ListOrdered, Minus, Quote, Redo2, Rows3, StickyNote, Table2, Underline as U, Undo2, Columns3, Trash2, ImageIcon,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/components/ui/cn";
import type { JSONNode } from "@/lib/editor/doc";
import { Citation, Footnote } from "./nodes";

export function useAcademicEditor(opts: { content: JSONNode | null; placeholder: string; onUpdate: (doc: JSONNode, editor: Editor) => void; onSelection?: (text: string) => void }) {
  const cb = useRef(opts);
  cb.current = opts;
  return useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, protocols: ["https"], HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } }),
      Placeholder.configure({ placeholder: opts.placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Citation,
      Footnote,
    ],
    content: (opts.content as object) ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: { attributes: { class: "prose-academic numbered min-h-[55vh] pb-40", spellcheck: "true" } },
    onUpdate: ({ editor }) => cb.current.onUpdate(editor.getJSON() as JSONNode, editor),
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      cb.current.onSelection?.(from === to ? "" : editor.state.doc.textBetween(from, to, "\n"));
    },
  });
}

function TB({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={on} disabled={disabled} title={label} aria-label={label} aria-pressed={active}
      className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition duration-150 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30", active && "bg-ink-900 text-white hover:bg-ink-800 hover:text-white")}>
      {children}
    </button>
  );
}

export function Toolbar({ editor, onFootnote }: { editor: Editor | null; onFootnote: () => void }) {
  if (!editor) return <div className="h-11" />;
  const c = () => editor.chain().focus();
  const inTable = editor.isActive("table");
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-2xl border border-ink-100 bg-white/90 p-1.5 shadow-soft backdrop-blur">
      <TB label="Geri al" on={() => c().undo().run()} disabled={!editor.can().undo()}><Undo2 className="h-4 w-4" /></TB>
      <TB label="Yinele" on={() => c().redo().run()} disabled={!editor.can().redo()}><Redo2 className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px bg-ink-100" />
      <TB label="Alt başlık" active={editor.isActive("heading", { level: 2 })} on={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></TB>
      <TB label="Alt başlık 2" active={editor.isActive("heading", { level: 3 })} on={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></TB>
      <TB label="Alt başlık 3" active={editor.isActive("heading", { level: 4 })} on={() => c().toggleHeading({ level: 4 }).run()}><Heading4 className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px bg-ink-100" />
      <TB label="Kalın" active={editor.isActive("bold")} on={() => c().toggleBold().run()}><Bold className="h-4 w-4" /></TB>
      <TB label="İtalik" active={editor.isActive("italic")} on={() => c().toggleItalic().run()}><Italic className="h-4 w-4" /></TB>
      <TB label="Altı çizili" active={editor.isActive("underline")} on={() => c().toggleUnderline().run()}><U className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px bg-ink-100" />
      <TB label="Madde listesi" active={editor.isActive("bulletList")} on={() => c().toggleBulletList().run()}><List className="h-4 w-4" /></TB>
      <TB label="Numaralı liste" active={editor.isActive("orderedList")} on={() => c().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></TB>
      <TB label="Blok alıntı" active={editor.isActive("blockquote")} on={() => c().toggleBlockquote().run()}><Quote className="h-4 w-4" /></TB>
      <TB label="Ayırıcı" on={() => c().setHorizontalRule().run()}><Minus className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px bg-ink-100" />
      <TB label="Dipnot ekle" on={onFootnote}><StickyNote className="h-4 w-4" /></TB>
      <TB label="Tablo ekle" on={() => c().insertContent([{ type: "paragraph", content: [{ type: "text", text: "Tablo 1. Başlık", marks: [{ type: "italic" }] }] }]).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="h-4 w-4" /></TB>
      <TB label="Şekil başlığı ekle" on={() => c().insertContent({ type: "paragraph", content: [{ type: "text", text: "Şekil 1. Açıklama", marks: [{ type: "italic" }] }] }).run()}><ImageIcon className="h-4 w-4" /></TB>
      {inTable && (
        <>
          <span className="mx-1 h-5 w-px bg-ink-100" />
          <TB label="Satır ekle" on={() => c().addRowAfter().run()}><Rows3 className="h-4 w-4" /></TB>
          <TB label="Sütun ekle" on={() => c().addColumnAfter().run()}><Columns3 className="h-4 w-4" /></TB>
          <TB label="Tabloyu sil" on={() => c().deleteTable().run()}><Trash2 className="h-4 w-4" /></TB>
        </>
      )}
    </div>
  );
}

export function AcademicEditor({ editor, chapter }: { editor: Editor | null; chapter: number }) {
  useEffect(() => {
    // Bölüm numarasını başlık numaralandırması için CSS değişkenine aktar
    const el = editor?.view.dom as HTMLElement | undefined;
    el?.style.setProperty("--chapter", `"${chapter}"`);
  }, [editor, chapter]);
  return <EditorContent editor={editor} />;
}
