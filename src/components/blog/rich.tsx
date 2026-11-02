import Link from "next/link";
import { Fragment } from "react";
import type { Block } from "@/lib/blog";

/** Satır içi: **kalın**, *italik*, [bağlantı](/iç-yol). Dış bağlantılar düz metin olarak gösterilir. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-ink-900">{p.slice(2, -2)}</strong>;
        if (p.startsWith("*") && p.endsWith("*") && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>;
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (m) return m[2].startsWith("/") ? <Link key={i} href={m[2]} className="font-medium text-brand-700 underline-offset-2 hover:underline">{m[1]}</Link> : <Fragment key={i}>{m[1]}</Fragment>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

export function BlogBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5 text-[17px] leading-[1.8] text-ink-700">
      {blocks.map((b, i) => {
        if (b.t === "h2") return <h2 key={i} id={`b${i}`} className="!mt-10 scroll-mt-24 font-serif text-[26px] font-semibold leading-snug tracking-tight text-ink-950">{b.text}</h2>;
        if (b.t === "h3") return <h3 key={i} className="!mt-7 text-[19px] font-semibold text-ink-900">{b.text}</h3>;
        if (b.t === "quote") return <blockquote key={i} className="rounded-r-xl border-l-4 border-brand-400 bg-brand-50/60 px-4 py-3 text-ink-700"><Inline text={b.text} /></blockquote>;
        if (b.t === "ul") return <ul key={i} className="ml-5 list-disc space-y-2 marker:text-brand-500">{b.items.map((it, k) => <li key={k} className="pl-1"><Inline text={it} /></li>)}</ul>;
        if (b.t === "ol") return <ol key={i} className="ml-5 list-decimal space-y-2 marker:font-semibold marker:text-brand-600">{b.items.map((it, k) => <li key={k} className="whitespace-pre-line pl-1"><Inline text={it} /></li>)}</ol>;
        return <p key={i}><Inline text={(b as { text: string }).text} /></p>;
      })}
    </div>
  );
}
