import { richToMarkdown, richToPlain } from "@/lib/citations";
import type { ExportDoc, Run } from "./model";

function mdRuns(runs: Run[], notes: string[]): string {
  return runs
    .map((r) => {
      if (r.footnote !== undefined) { notes.push(r.footnote); return `[^${notes.length}]`; }
      let t = r.text;
      if (!t.trim()) return t;
      if (r.sup) return `^${t}^`;
      if (r.bold) t = `**${t}**`;
      if (r.italic) t = `*${t}*`;
      return t;
    })
    .join("");
}

export function toMarkdown(d: ExportDoc): string {
  const notes: string[] = [];
  const out: string[] = [`# ${d.title}`, ""];
  if (d.subtitle) out.push(`*${d.subtitle}*`, "");
  out.push([d.author, d.institution, d.date].filter(Boolean).join(" · "), "");
  out.push(d.language === "tr" ? "## İçindekiler" : d.language === "de" ? "## Inhaltsverzeichnis" : "## Contents", "");
  for (const t of d.toc) out.push(`${"  ".repeat(t.level - 1)}- ${t.number ? `${t.number} ` : ""}${t.text}`);
  out.push("");
  for (const b of d.blocks) {
    if (b.kind === "heading") out.push(`${"#".repeat(Math.min(b.level + 1, 6))} ${b.number ? `${b.number} ` : ""}${mdRuns(b.runs, notes)}`, "");
    else if (b.kind === "paragraph") out.push(`${b.quote ? "> " : ""}${mdRuns(b.runs, notes)}`, "");
    else if (b.kind === "caption") out.push(b.lines.map((l) => mdRuns(l, notes)).join("  \n"), "");
    else if (b.kind === "image") out.push(`[${b.alt || "Şekil"}]`, "");
    else if (b.kind === "list") { b.items.forEach((it, k) => out.push(`${b.ordered ? `${k + 1}.` : "-"} ${mdRuns(it, notes)}`)); out.push(""); }
    else if (b.kind === "table") {
      b.rows.forEach((row, ri) => {
        out.push(`| ${row.map((c) => mdRuns(c, notes).replace(/\|/g, "\\|")).join(" | ")} |`);
        if (ri === 0) out.push(`| ${row.map(() => "---").join(" | ")} |`);
      });
      out.push("");
    }
  }
  if (d.bibliography.length) {
    out.push(`## ${d.bibliographyTitle}`, "");
    for (const e of d.bibliography) out.push(`${d.numericBibliography ? `${e.number}. ` : ""}${richToMarkdown(e.rich)}`, "");
  }
  if (notes.length) { out.push("---", ""); notes.forEach((n, i) => out.push(`[^${i + 1}]: ${n}`)); }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

export function toText(d: ExportDoc): string {
  const notes: string[] = [];
  const plain = (runs: Run[]) => runs.map((r) => { if (r.footnote !== undefined) { notes.push(r.footnote); return `[${notes.length}]`; } return r.text; }).join("");
  const out: string[] = [d.title.toLocaleUpperCase(d.language), [d.author, d.institution, d.date].filter(Boolean).join(" - "), ""];
  for (const b of d.blocks) {
    if (b.kind === "heading") out.push("", `${b.number ? `${b.number} ` : ""}${plain(b.runs)}${b.level === 1 ? "\n" + "=".repeat(40) : ""}`);
    else if (b.kind === "paragraph") out.push(`${b.quote ? "    " : ""}${plain(b.runs)}`, "");
    else if (b.kind === "caption") out.push(b.lines.map((l) => plain(l)).join("\n"), "");
    else if (b.kind === "image") out.push(`[${b.alt || "Şekil"}]`, "");
    else if (b.kind === "list") { b.items.forEach((it, k) => out.push(`${b.ordered ? `${k + 1}.` : "•"} ${plain(it)}`)); out.push(""); }
    else if (b.kind === "table") { b.rows.forEach((r) => out.push(r.map(plain).join("\t"))); out.push(""); }
  }
  if (d.bibliography.length) {
    out.push("", d.bibliographyTitle.toLocaleUpperCase(d.language), "");
    for (const e of d.bibliography) out.push(`${d.numericBibliography ? `[${e.number}] ` : ""}${richToPlain(e.rich)}`, "");
  }
  if (notes.length) { out.push("", "----"); notes.forEach((n, i) => out.push(`[${i + 1}] ${n}`)); }
  return out.join("\n");
}
