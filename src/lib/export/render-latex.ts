/**
 * LaTeX / Overleaf çıktısı (D136). Dışa aktarma modelinden (buildExportDoc, latexCitations) şu dosyaları üretir:
 *  - main.tex: başlık sayfası, içindekiler, bölümler, tablolar, şekiller, dipnotlar; atıflar biblatex \parencite/\textcite
 *  - references.bib: çalışmanın kaynakları (anahtarlar bibKeyMap ile metindeki atıflarla aynı)
 *  - figures/*.png ve README.txt (derleme talimatı)
 * pdfLaTeX + biber ile derlenir (Overleaf varsayılanı). Atıf stili biblatex stiline eşlenir; karşılığı olmayan stiller
 * (ör. ISNAD) için en yakın stil seçilir ve dosyada not olarak belirtilir.
 */
import type { CitationItem, CitationStyleId } from "@/lib/citations";
import { bibKeyMap, toBibTeX } from "@/lib/sources/bib";
import { figurePng, type Block, type ExportDoc, type Run } from "./model";

/** Atıf stili → biblatex stili (Overleaf/TeX Live’da hazır gelen paketler) */
export const BIBLATEX_STYLE: Record<CitationStyleId, { style: string; note?: string }> = {
  apa7: { style: "apa" },
  apa6: { style: "apa", note: "APA 6 için biblatex stili yok; APA 7 (biblatex-apa) kullanıldı." },
  isnad: { style: "authoryear", note: "ISNAD 2 için biblatex stili yok; yazar–yıl (authoryear) kullanıldı. Dipnotlu ISNAD için \\footcite kullanabilirsiniz." },
  chicago: { style: "authoryear", note: "Chicago yazar–yıl için biblatex-chicago paketini (style=chicago-authordate) seçebilirsiniz." },
  mla: { style: "mla" },
  harvard: { style: "authoryear" },
  vancouver: { style: "vancouver" },
  ieee: { style: "ieee" },
  ama: { style: "nature", note: "AMA için biblatex stili yok; numaralı (nature) stil kullanıldı." },
  turabian: { style: "authoryear", note: "Turabian yazar–yıl için biblatex-chicago (style=chicago-authordate) kullanılabilir." },
};

/** LaTeX özel karakterlerini kaçırır; Unicode Türkçe karakterler pdfLaTeX (utf8 + T1) ile doğrudan çalışır */
export function texEscape(s: string): string {
  return s
    .replace(/\\/g, "\u0000")
    .replace(/([#$%&_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/\u0000/g, "\\textbackslash{}")
    .replace(/[“”]/g, (m) => (m === "“" ? "``" : "''"))
    .replace(/…/g, "\\ldots{}")
    .replace(/–/g, "--")
    .replace(/—/g, "---")
    .replace(/ /g, "~")
    .replace(/[​‌‍﻿]/g, "");
}

/** “s. 12”, “ss. 12-14”, “p. 5” → “12”, “12--14”, “5” (biblatex sayfa kısaltmasını dile göre kendisi ekler) */
export function texLocator(loc: string | null | undefined): string {
  if (!loc) return "";
  const m = loc.trim().match(/^(?:ss|sf|pp|s|p)\.\s*(.+)$/i);
  const v = (m ? m[1] : loc).trim().replace(/\s*[-–]\s*/g, "--");
  return texEscape(v).replace(/\\-\\-/g, "--");
}

function cite(c: NonNullable<Run["cite"]>, keys: Map<string, string>): string {
  const ks = c.ids.map((id) => keys.get(id)).filter(Boolean) as string[];
  if (!ks.length) return "";
  const cmd = c.narrative ? "\\textcite" : c.suppressAuthor ? "\\parencite*" : "\\parencite";
  const post = texLocator(c.locator);
  const pre = c.prefix ? texEscape(c.prefix) : "";
  const opt = pre ? `[${pre}][${post}]` : post ? `[${post}]` : "";
  return `${cmd}${opt}{${ks.join(",")}}${c.suffix ? ` ${texEscape(c.suffix)}` : ""}`;
}

export function runsToTex(runs: Run[], keys: Map<string, string>): string {
  let out = "";
  for (const r of runs) {
    if (r.cite) {
      const c = cite(r.cite, keys);
      // Parantez içi atıf önceki kelimeye bölünmez boşlukla bağlanır (satır başına tek başına düşmesin)
      out = !r.cite.narrative && / $/.test(out) && !/[.!?:] $/.test(out) ? `${out.trimEnd()}~${c}` : out + c;
      continue;
    }
    if (r.footnote !== undefined && r.footnote !== null && !r.text) { out += `\\footnote{${texEscape(r.footnote)}}`; continue; }
    if (r.text === "\n") { out += "\\\\\n"; continue; }
    let t = texEscape(r.text);
    if (!t) continue;
    if (r.sup) t = `\\textsuperscript{${t}}`;
    if (r.underline) t = `\\underline{${t}}`;
    if (r.italic) t = `\\emph{${t}}`;
    if (r.bold) t = `\\textbf{${t}}`;
    out += t;
  }
  return out;
}

const SECTION = ["section", "subsection", "subsubsection", "paragraph"];

function blockTex(b: Block, keys: Map<string, string>, figure: (b: Extract<Block, { kind: "image" }>) => string): string {
  switch (b.kind) {
    case "heading": {
      const cmd = SECTION[Math.min(3, Math.max(0, b.level - 1))];
      const text = runsToTex(b.runs, keys);
      return b.number ? `\\${cmd}{${text}}` : `\\${cmd}*{${text}}\n\\addcontentsline{toc}{${cmd}}{${text}}`;
    }
    case "paragraph": {
      const t = runsToTex(b.runs, keys);
      return b.quote ? `\\begin{quote}\n${t}\n\\end{quote}` : t;
    }
    case "list": {
      const env = b.ordered ? "enumerate" : "itemize";
      return `\\begin{${env}}\n${b.items.map((it) => `  \\item ${runsToTex(it, keys)}`).join("\n")}\n\\end{${env}}`;
    }
    case "caption":
      return `\\begin{${b.align === "center" ? "center" : "flushleft"}}\n${b.lines.map((l) => runsToTex(l, keys)).join("\\\\\n")}\n\\end{${b.align === "center" ? "center" : "flushleft"}}`;
    case "table": {
      const cols = Math.max(1, ...b.rows.map((r) => r.length));
      const spec = `@{}${`>{\\raggedright\\arraybackslash}p{\\dimexpr(\\linewidth-${cols * 2}\\tabcolsep)/${cols}\\relax}`.repeat(cols)}@{}`;
      const row = (r: Run[][]) => Array.from({ length: cols }, (_, i) => runsToTex(r[i] ?? [], keys)).join(" & ") + " \\\\";
      const [head, ...body] = b.rows;
      const lines = b.header && head ? ["\\toprule", row(head), "\\midrule", ...body.map(row), "\\bottomrule"] : ["\\toprule", ...b.rows.map(row), "\\bottomrule"];
      return `\\begin{center}\n\\small\n\\begin{tabular}{${spec}}\n${lines.join("\n")}\n\\end{tabular}\n\\end{center}`;
    }
    case "image":
      return figure(b);
  }
}

export interface LatexFile { name: string; data: string | Buffer }

/** Türkçe kaynakça kısaltmaları (biblatex dil dosyası yerine; ve, vd., s., ss., Ed., bs., t.y.) */
function trStrings(lang: string): string {
  return String.raw`\DefineBibliographyStrings{${lang}}{%
  and = {ve},
  andothers = {vd\adddot},
  andmore = {vd\adddot},
  page = {s\adddot},
  pages = {ss\adddot},
  editor = {Ed\adddot},
  editors = {Ed\adddot},
  edition = {bs\adddot},
  volume = {C\adddot},
  volumes = {C\adddot},
  number = {S\adddot},
  nodate = {t\adddot y\adddot},
  in = {İçinde},
  bibliography = {Kaynakça},
  references = {Kaynakça},
}
`.replace("${lang}", lang);
}

/**
 * Türkçe belgede biblatex ayarı (D136). TeX Live sürümleri arasında Türkçe biblatex dil dosyaları sorunlu
 * (biblatex-apa’nın turkish-apa.lbx dosyası hata veriyor; yazar–yıl stillerinde Türkçe babel altında kaynakça
 * yazımı takılıyor). Bu yüzden:
 *  - APA: Türkçe dil APA’nın Amerikan dil dosyasına eşlenir, kısaltmalar Türkçeleştirilir.
 *  - Diğer stiller: kaynakça dili İngilizce dosyayla yazılır (kısaltmalar Türkçeleştirilir), kaynakça İngilizce
 *    dil ortamında basılır; belge gövdesi Türkçe kalır (heceleme, “İçindekiler” vb.).
 */
export function biblatexSetup(style: string, lang: boolean | "tr" | "en" | "de"): { babel: string; options: string; preamble: string; bibBegin: string; bibEnd: string } {
  const l = lang === true ? "tr" : lang === false ? "en" : lang;
  const max = style === "authoryear" ? ",maxcitenames=2" : "";
  // Almanca (D144): babel ngerman ve biblatex’in kararlı Almanca dil dosyaları (APA’da ngerman-apa)
  if (l === "de") return { babel: "ngerman", options: max, preamble: style === "apa" ? "\\DeclareLanguageMapping{ngerman}{ngerman-apa}\n" : "", bibBegin: "", bibEnd: "" };
  if (l === "en") return { babel: "english", options: max, preamble: "", bibBegin: "", bibEnd: "" };
  if (style === "apa") return { babel: "turkish,shorthands=:!", options: "", preamble: `${trStrings("turkish")}\\DeclareLanguageMapping{turkish}{american-apa}\n`, bibBegin: "", bibEnd: "" };
  return { babel: "english,turkish,shorthands=:!", options: `${max},language=english,autolang=none`, preamble: trStrings("english"), bibBegin: "\\begin{otherlanguage}{english}\n", bibEnd: "\n\\end{otherlanguage}" };
}

export function toLatexFiles(doc: ExportDoc, o: { style: CitationStyleId; items: CitationItem[] }): LatexFile[] {
  const keys = bibKeyMap(o.items);
  const tr = doc.language === "tr", de = doc.language === "de";
  const bl = BIBLATEX_STYLE[o.style] ?? { style: "authoryear" };
  const bs = biblatexSetup(bl.style, doc.language);
  const figures: LatexFile[] = [];
  const figure = (b: Extract<Block, { kind: "image" }>) => {
    const name = `figures/sekil-${figures.length + 1}.png`;
    figures.push({ name, data: figurePng(b.src) });
    const w = Math.min(1, b.width / 1400).toFixed(2);
    return `\\begin{center}\n\\includegraphics[width=${w === "0.00" ? "0.6" : w}\\linewidth]{${name}}\n\\end{center}`;
  };
  const body = doc.blocks.map((b) => blockTex(b, keys, figure)).filter(Boolean).join("\n\n");
  const meta = [doc.subtitle ? `\\\\[0.5em]\\large ${texEscape(doc.subtitle)}` : ""].join("");
  const tex = `%% ${tr ? "Academiana tarafından oluşturuldu" : de ? "Erstellt mit Academiana" : "Generated by Academiana"} — https://www.academiana.com.tr
%% ${tr ? "Derleme: pdfLaTeX + Biber (Overleaf’te varsayılan). Kaynakça için biber çalıştırılmalıdır." : de ? "Kompilieren mit pdfLaTeX + Biber (Overleaf-Standard). Für das Literaturverzeichnis Biber ausführen." : "Compile with pdfLaTeX + Biber (Overleaf default). Run biber for the bibliography."}
${bl.note ? `%% ${tr ? "Not" : de ? "Hinweis" : "Note"}: ${bl.note}\n` : ""}\\documentclass[12pt,a4paper]{article}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage[${bs.babel}]{babel}
\\usepackage[margin=2.5cm]{geometry}
\\usepackage{setspace}
\\onehalfspacing
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage[autostyle=false,style=${de ? "german" : "english"}]{csquotes}
\\usepackage[backend=biber,style=${bl.style}${bs.options}]{biblatex}
${bs.preamble}\\addbibresource{references.bib}
\\usepackage[hidelinks]{hyperref}

\\title{${texEscape(doc.title)}${meta}}
\\author{${texEscape(doc.author)}${doc.institution ? `\\\\ \\normalsize ${texEscape(doc.institution)}` : ""}}
\\date{${texEscape(doc.date)}}

\\begin{document}
\\maketitle
\\tableofcontents
\\clearpage

${body}

${bs.bibBegin}\\printbibliography[title={${texEscape(doc.bibliographyTitle)}}]${bs.bibEnd}
\\end{document}
`;
  const readme = de
    ? `Academiana LaTeX-Export\n\nDateien:\n- main.tex: Ihre Arbeit\n- references.bib: Ihre Quellen (Zitierschlüssel wie im Text)\n- figures/: Abbildungen\n\nOverleaf: „New Project → Upload Project“ und diese ZIP-Datei hochladen; Compiler pdfLaTeX, Literaturverzeichnis mit Biber.\nLokal: pdflatex main && biber main && pdflatex main && pdflatex main\nZitierstil: ${bl.style}${bl.note ? ` (${bl.note})` : ""}\n`
    : tr
    ? `Academiana LaTeX çıktısı\n\nDosyalar:\n- main.tex: çalışmanız\n- references.bib: kaynaklarınız (atıf anahtarları metindekiyle aynı)\n- figures/: şekiller\n\nOverleaf: “New Project → Upload Project” ile bu ZIP’i yükleyin; derleyici pdfLaTeX, kaynakça Biber ile oluşur.\nYerel derleme: pdflatex main && biber main && pdflatex main && pdflatex main\nAtıf stili: ${bl.style}${bl.note ? ` (${bl.note})` : ""}\n`
    : `Academiana LaTeX export\n\nFiles:\n- main.tex: your work\n- references.bib: your sources (citation keys match the text)\n- figures/: figures\n\nOverleaf: “New Project → Upload Project” and upload this ZIP; compiler pdfLaTeX, bibliography with Biber.\nLocal build: pdflatex main && biber main && pdflatex main && pdflatex main\nCitation style: ${bl.style}${bl.note ? ` (${bl.note})` : ""}\n`;
  return [{ name: "main.tex", data: tex }, { name: "references.bib", data: toBibTeX(o.items) }, ...figures, { name: "README.txt", data: readme }];
}

export async function toLatexZip(doc: ExportDoc, o: { style: CitationStyleId; items: CitationItem[] }): Promise<Buffer> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  for (const f of toLatexFiles(doc, o)) zip.file(f.name, f.data);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
