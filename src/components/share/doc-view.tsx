import { useT } from "@/i18n/client";
import { richToHtml } from "@/lib/citations/util";
import type { ExportDoc, Run } from "@/lib/export/model";

function Runs({ runs, notes }: { runs: Run[]; notes: string[] }) {
  return (
    <>
      {runs.map((r, i) => {
        if (r.footnote !== undefined) { notes.push(r.footnote); return <sup key={i} className="text-brand-600">{notes.length}</sup>; }
        let el: React.ReactNode = r.text;
        if (r.sup) el = <sup>{el}</sup>;
        if (r.italic) el = <em>{el}</em>;
        if (r.bold) el = <strong>{el}</strong>;
        if (r.underline) el = <u>{el}</u>;
        return <span key={i}>{el}</span>;
      })}
    </>
  );
}

/** Dışa aktarma modelini salt okunur HTML olarak gösterir (danışman paylaşımı). */
export function DocView({ doc, stageIds }: { doc: ExportDoc; stageIds: Record<string, string> }) {
  const { t } = useT();
  const notes: string[] = [];
  return (
    <article className="prose-academic">
      {doc.blocks.map((b, i) => {
        if (b.kind === "heading") {
          const text = b.runs.map((r) => r.text).join("");
          const Tag = (b.level === 1 ? "h2" : b.level === 2 ? "h3" : "h4") as "h2";
          return <Tag key={i} id={b.level === 1 ? stageIds[text] : undefined} className={b.level === 1 ? "!mt-14 !text-[1.6em] font-serif" : ""}>{b.number && <span className="mr-2 text-ink-400">{b.number}</span>}{text}</Tag>;
        }
        if (b.kind === "paragraph") return b.quote ? <blockquote key={i}><p><Runs runs={b.runs} notes={notes} /></p></blockquote> : <p key={i}><Runs runs={b.runs} notes={notes} /></p>;
        if (b.kind === "caption") return <p key={i} className="!text-left text-[15px] italic text-ink-600"><Runs runs={b.runs} notes={notes} /></p>;
        // eslint-disable-next-line @next/next/no-img-element
        if (b.kind === "image") return <figure key={i} className="my-6 text-center"><img src={b.src} alt={b.alt} className="mx-auto h-auto max-w-full" style={{ width: Math.min(b.width, 640) }} /></figure>;
        if (b.kind === "list") { const L = b.ordered ? "ol" : "ul"; return <L key={i}>{b.items.map((it, k) => <li key={k}><Runs runs={it} notes={notes} /></li>)}</L>; }
        return (
          <table key={i}><tbody>{b.rows.map((row, ri) => <tr key={ri}>{row.map((c, ci) => (ri === 0 && b.header ? <th key={ci}><Runs runs={c} notes={notes} /></th> : <td key={ci}><Runs runs={c} notes={notes} /></td>))}</tr>)}</tbody></table>
        );
      })}
      {notes.length > 0 && <><h4>{t("Notlar")}</h4><ol className="text-[14px]">{notes.map((n, i) => <li key={i}>{n}</li>)}</ol></>}
      {doc.bibliography.length > 0 && (
        <>
          <h2 className="!mt-14 font-serif !text-[1.6em]">{doc.bibliographyTitle}</h2>
          <ol className={doc.numericBibliography ? "" : "!list-none !pl-0"}>
            {doc.bibliography.map((e, i) => <li key={i} className={doc.numericBibliography ? "" : "pl-8 -indent-8"} dangerouslySetInnerHTML={{ __html: richToHtml(e.rich) }} />)}
          </ol>
        </>
      )}
    </article>
  );
}
