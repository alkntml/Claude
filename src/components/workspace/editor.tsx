"use client";
import { useT } from "@/i18n/client";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import type { Transaction } from "@tiptap/pm/state";
import type { AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import {
  WandSparkles, Search, Bold, Heading2, Heading3, Heading4, Italic, List, ListOrdered, Minus, Quote, Redo2, Rows3, StickyNote, Table2, Underline as U, Undo2, Columns3, Trash2, ImageIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/components/ui/cn";
import type { JSONNode } from "@/lib/editor/doc";
import { Citation, Figure, Footnote } from "./nodes";

/** Çalışma alanı editörünün düğüm ve biçim uzantıları (önizleme editörleri de aynısını kullanır) */
export function academicExtensions(placeholder?: () => string) {
  return [
    // TipTap 3: bağlantı ve altı çizili StarterKit’e dahil; sona otomatik boş paragraf eklenmez (kayıtlı belgeler değişmesin)
    StarterKit.configure({
      heading: { levels: [2, 3, 4] },
      link: { openOnClick: false, autolink: true, protocols: ["https"], HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" } },
      trailingNode: false,
    }),
    ...(placeholder ? [Placeholder.configure({ placeholder })] : []),
    Table.configure({ resizable: false }),
    TableRow,
    TableHeader,
    TableCell,
    Citation,
    Footnote,
    Figure,
  ];
}

/** Salt okunur belge önizlemesi (çeviri sonucu vb.); atıflar çalışma alanındaki stile göre görünür */
export function DocPreview({ doc, className }: { doc: JSONNode; className?: string }) {
  const key = JSON.stringify(doc);
  // TipTap 3: ayarlar her çizimde aynı nesne olmalı; aksi hâlde editör her çizimde yeniden ayarlanır
  const options = useMemo(() => ({ immediatelyRender: false, editable: false, extensions: academicExtensions(), content: JSON.parse(key) as object, editorProps: { attributes: { class: cn("prose-academic", className) } } }), [key, className]);
  const editor = useEditor(options, [key]);
  return <EditorContent editor={editor} />;
}

export function useAcademicEditor(opts: { content: JSONNode | null; placeholder: string; onUpdate: (doc: JSONNode, editor: Editor, tr: Transaction) => void; onSelection?: (text: string) => void; extensions?: AnyExtension[] }) {
  const cb = useRef(opts);
  cb.current = opts;
  // TipTap 3 ayarları her çizimde karşılaştırır; uzantılar, içerik ve editorProps ilk çizimde bir kez oluşturulur.
  // (İçerik sonradan setContent ile değişir; yer tutucu metni cb üzerinden güncel okunur.)
  const stable = useRef<{ extensions: AnyExtension[]; content: object; editorProps: { attributes: Record<string, string> } } | null>(null);
  if (!stable.current) {
    stable.current = {
      extensions: [...academicExtensions(() => cb.current.placeholder), ...(opts.extensions ?? [])],
      content: (opts.content as object) ?? { type: "doc", content: [{ type: "paragraph" }] },
      editorProps: { attributes: { class: "prose-academic numbered min-h-[45vh] pb-24 sm:min-h-[55vh] sm:pb-40", spellcheck: "true" } },
    };
  }
  return useEditor({
    immediatelyRender: false,
    // Araç çubuğundaki etkin düğmeler her işlemde güncellensin (TipTap 3’te varsayılan kapalı)
    shouldRerenderOnTransaction: true,
    ...stable.current,
    onUpdate: ({ editor, transaction }) => cb.current.onUpdate(editor.getJSON() as JSONNode, editor, transaction),
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      cb.current.onSelection?.(from === to ? "" : editor.state.doc.textBetween(from, to, "\n"));
    },
  });
}

function TB({ on, active, label, children, disabled }: { on: () => void; active?: boolean; label: string; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={on} disabled={disabled} title={label} aria-label={label} aria-pressed={active}
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition duration-150 hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30", active && "bg-ink-900 text-white hover:bg-ink-800 hover:text-white")}>
      {children}
    </button>
  );
}

export function Toolbar({ editor, onFootnote, suggestOn, onToggleSuggest, onFind, findOn }: { editor: Editor | null; onFootnote: () => void; suggestOn?: boolean; onToggleSuggest?: () => void; onFind?: () => void; findOn?: boolean }) {
  const { t } = useT();
  if (!editor) return <div className="h-11" />;
  const c = () => editor.chain().focus();
  const inTable = editor.isActive("table");
  return (
    <div className="no-scrollbar flex flex-nowrap items-center gap-0.5 overflow-x-auto rounded-2xl border border-ink-100 bg-white/90 p-1 shadow-soft backdrop-blur sm:flex-wrap sm:p-1.5">
      <TB label={t("Geri al")} on={() => c().undo().run()} disabled={!editor.can().undo()}><Undo2 className="h-4 w-4" /></TB>
      <TB label={t("Yinele")} on={() => c().redo().run()} disabled={!editor.can().redo()}><Redo2 className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
      <TB label={t("Alt başlık")} active={editor.isActive("heading", { level: 2 })} on={() => c().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></TB>
      <TB label={t("Alt başlık 2")} active={editor.isActive("heading", { level: 3 })} on={() => c().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></TB>
      <TB label={t("Alt başlık 3")} active={editor.isActive("heading", { level: 4 })} on={() => c().toggleHeading({ level: 4 }).run()}><Heading4 className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
      <TB label={t("Kalın")} active={editor.isActive("bold")} on={() => c().toggleBold().run()}><Bold className="h-4 w-4" /></TB>
      <TB label={t("İtalik")} active={editor.isActive("italic")} on={() => c().toggleItalic().run()}><Italic className="h-4 w-4" /></TB>
      <TB label={t("Altı çizili")} active={editor.isActive("underline")} on={() => c().toggleUnderline().run()}><U className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
      <TB label={t("Madde listesi")} active={editor.isActive("bulletList")} on={() => c().toggleBulletList().run()}><List className="h-4 w-4" /></TB>
      <TB label={t("Numaralı liste")} active={editor.isActive("orderedList")} on={() => c().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></TB>
      <TB label={t("Blok alıntı")} active={editor.isActive("blockquote")} on={() => c().toggleBlockquote().run()}><Quote className="h-4 w-4" /></TB>
      <TB label={t("Ayırıcı")} on={() => c().setHorizontalRule().run()}><Minus className="h-4 w-4" /></TB>
      <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
      <TB label={t("Dipnot ekle")} on={onFootnote}><StickyNote className="h-4 w-4" /></TB>
      <TB label={t("Tablo ekle")} on={() => c().insertContent([{ type: "paragraph", content: [{ type: "text", text: t("Tablo 1. Başlık"), marks: [{ type: "italic" }] }] }]).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="h-4 w-4" /></TB>
      <TB label={t("Şekil başlığı ekle")} on={() => c().insertContent({ type: "paragraph", content: [{ type: "text", text: t("Şekil 1. Açıklama"), marks: [{ type: "italic" }] }] }).run()}><ImageIcon className="h-4 w-4" /></TB>
      {onFind && (
        <>
          <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
          <TB label={t("Bul ve değiştir (Ctrl+F)")} active={!!findOn} on={onFind}><Search className="h-4 w-4" /></TB>
        </>
      )}
      {onToggleSuggest && (
        <>
          <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
          <TB label={suggestOn ? t("Otomatik tamamlama açık (kapat)") : t("Otomatik tamamlama kapalı (aç)")} active={!!suggestOn} on={onToggleSuggest}><WandSparkles className="h-4 w-4" /></TB>
        </>
      )}
      {inTable && (
        <>
          <span className="mx-1 h-5 w-px shrink-0 bg-ink-100" />
          <TB label={t("Satır ekle")} on={() => c().addRowAfter().run()}><Rows3 className="h-4 w-4" /></TB>
          <TB label={t("Sütun ekle")} on={() => c().addColumnAfter().run()}><Columns3 className="h-4 w-4" /></TB>
          <TB label={t("Tabloyu sil")} on={() => c().deleteTable().run()}><Trash2 className="h-4 w-4" /></TB>
        </>
      )}
    </div>
  );
}

export function AcademicEditor({ editor, chapter }: { editor: Editor | null; chapter: string }) {
  useEffect(() => {
    // Bölüm numara önekini başlık numaralandırması için CSS değişkenine aktar (numarasız kısımda numara gösterilmez)
    const el = editor?.view.dom as HTMLElement | undefined;
    el?.style.setProperty("--chapter", `"${chapter}"`);
    el?.classList.toggle("unnumbered", !chapter);
  }, [editor, chapter]);
  return <EditorContent editor={editor} />;
}
