"use client";
import { useT } from "@/i18n/client";
import { Fragment } from "react";
import { richToPlain } from "@/lib/citations/util";
import { useCitations } from "./citation-context";

export interface ParsedAnswer {
  parts: ({ kind: "text"; text: string } | { kind: "draft"; text: string; complete: boolean })[];
  memory: string[];
  gaps: string[];
}

/** :::taslak ... ::: ve :::hafiza ... ::: bloklarını ayrıştırır (akış sırasında yarım bloklar da desteklenir). */
export function parseAnswer(src: string): ParsedAnswer {
  const parts: ParsedAnswer["parts"] = [];
  const memory: string[] = [];
  const gaps: string[] = [];
  const re = /:::(taslak|hafiza|eksik)\s*\n([\s\S]*?)(\n:::\s*(?:\n|$)|$)/g;
  let last = 0;
  for (const m of src.matchAll(re)) {
    const before = src.slice(last, m.index);
    if (before.trim()) parts.push({ kind: "text", text: before });
    if (m[1] === "taslak") parts.push({ kind: "draft", text: m[2], complete: !!m[3] });
    else (m[1] === "eksik" ? gaps : memory).push(...m[2].split("\n").map((l) => l.replace(/^[-*]\s*/, "").trim()).filter(Boolean));
    last = (m.index ?? 0) + m[0].length;
  }
  const rest = src.slice(last);
  if (rest.trim()) parts.push({ kind: "text", text: rest.replace(/:::\w*\s*$/, "") });
  return { parts, memory, gaps };
}

function Inline({ text, sourceMap }: { text: string; sourceMap: Record<string, string> }) {
  const ctx = useCitations();
  const { t } = useT();
  const out: React.ReactNode[] = [];
  const re = /(\[\[kaynak:([A-Za-z0-9,\s-]+)(?:\|([^\]]+))?\]\]|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[KAYNAK GEREKLİ\]|\[VERİ GİRİLECEK[^\]]*\])/g;
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(re)) {
    out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("[[kaynak:")) {
      const ids = m[2].split(",").map((x) => sourceMap[x.trim()]).filter(Boolean);
      const narrative = /^(anlatı|narrative)$/i.test((m[3] ?? "").trim());
      const locator = !narrative && m[3] ? m[3].replace(/^(s|ss|p|pp)\.\s*/i, "") : null;
      const label = ctx && ids.length ? richToPlain(ctx.engine.cite(ids, { locator, narrative })) : t("[kaynak doğrulanamadı]");
      out.push(<span key={k++} className={`mx-0.5 rounded-md border px-1.5 py-px font-sans text-[12px] ${ids.length ? "border-brand-100 bg-brand-50 text-brand-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{label}</span>);
    } else if (tok.startsWith("**")) out.push(<strong key={k++}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("[KAYNAK") || tok.startsWith("[VERİ")) out.push(<mark key={k++} className="rounded bg-amber-100 px-1 text-[12px] text-amber-800">{tok}</mark>);
    else out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = (m.index ?? 0) + tok.length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

export function Markdown({ text, sourceMap, serif }: { text: string; sourceMap: Record<string, string>; serif?: boolean }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className={`space-y-2.5 ${serif ? "font-serif text-[15px] leading-7" : "text-[14px] leading-relaxed"}`}>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter((l) => l.trim());
        if (!lines.length) return null;
        const h = lines[0].match(/^(#{1,4})\s+(.*)$/);
        if (h && lines.length === 1) return <p key={i} className="font-sans font-semibold text-ink-900"><Inline text={h[2]} sourceMap={sourceMap} /></p>;
        if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const Tag = ordered ? "ol" : "ul";
          return <Tag key={i} className={`${ordered ? "list-decimal" : "list-disc"} space-y-1 pl-5`}>{lines.map((l, j) => <li key={j}><Inline text={l.replace(/^\s*([-*•]|\d+[.)])\s+/, "")} sourceMap={sourceMap} /></li>)}</Tag>;
        }
        if (lines.every((l) => /^\s*\|.*\|\s*$/.test(l))) {
          const rows = lines.filter((l) => !/^\s*\|[\s:|-]+\|\s*$/.test(l)).map((l) => l.trim().slice(1, -1).split("|"));
          return (
            <div key={i} className="overflow-x-auto"><table className="w-full border-collapse font-sans text-[12.5px]"><tbody>{rows.map((r, ri) => <tr key={ri} className={ri === 0 ? "bg-ink-50 font-semibold" : ""}>{r.map((c, ci) => <td key={ci} className="border-y border-ink-100 px-2 py-1"><Inline text={c.trim()} sourceMap={sourceMap} /></td>)}</tr>)}</tbody></table></div>
          );
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}<Inline text={l.replace(/^#{1,4}\s+/, "")} sourceMap={sourceMap} /></Fragment>)}</p>;
      })}
    </div>
  );
}
