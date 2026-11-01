import "server-only";

export interface Extracted {
  text: string;
  /** Sayfa bazlı metin (PDF) — RAG parçalarında sayfa bilgisi için */
  pages?: string[];
  /** Tablo verisi (CSV/XLSX) */
  rows?: string[][];
  meta: Record<string, unknown>;
}

export const SUPPORTED_MIME: Record<string, "pdf" | "docx" | "xlsx" | "csv" | "txt"> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "text/csv": "csv",
  "application/csv": "csv",
  "text/plain": "txt",
  "text/markdown": "txt",
};

export function kindOf(mime: string, name: string) {
  const byMime = SUPPORTED_MIME[mime];
  if (byMime) return byMime;
  const ext = name.toLowerCase().split(".").pop();
  if (ext === "pdf" || ext === "docx" || ext === "xlsx" || ext === "csv" || ext === "txt") return ext;
  if (ext === "md") return "txt";
  return null;
}

/** Dosya imzası kontrolü: uzantısı değiştirilmiş dosyaları reddeder. */
export function checkMagic(kind: string, buf: Buffer): boolean {
  if (kind === "pdf") return buf.subarray(0, 5).toString("latin1") === "%PDF-";
  if (kind === "docx" || kind === "xlsx") return buf[0] === 0x50 && buf[1] === 0x4b; // ZIP
  return !buf.subarray(0, 4096).includes(0); // metin dosyalarında NUL baytı olmaz
}

export async function extract(kind: string, buf: Buffer): Promise<Extracted> {
  switch (kind) {
    case "pdf": {
      const { getDocumentProxy, extractText } = await import("unpdf");
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { totalPages, text } = await extractText(pdf, { mergePages: false });
      const pages = (Array.isArray(text) ? text : [text]).map((p) => p.replace(/\s+\n/g, "\n").trim());
      return { text: pages.join("\n\n"), pages, meta: { pages: totalPages } };
    }
    case "docx": {
      const mammoth = await import("mammoth");
      const r = await mammoth.extractRawText({ buffer: buf });
      return { text: r.value.trim(), meta: { warnings: r.messages.length } };
    }
    case "xlsx": {
      const { default: readXlsx } = await import("read-excel-file/node");
      const rows = (await readXlsx(buf)).map((r) => r.map((c) => (c === null || c === undefined ? "" : c instanceof Date ? c.toISOString().slice(0, 10) : String(c))));
      return { text: rows.slice(0, 2000).map((r) => r.join("\t")).join("\n"), rows, meta: { rows: rows.length } };
    }
    case "csv": {
      const Papa = (await import("papaparse")).default;
      const parsed = Papa.parse<string[]>(buf.toString("utf8").replace(/^﻿/, ""), { skipEmptyLines: true });
      const rows = parsed.data;
      return { text: rows.slice(0, 2000).map((r) => r.join("\t")).join("\n"), rows, meta: { rows: rows.length, delimiter: parsed.meta.delimiter } };
    }
    default:
      return { text: buf.toString("utf8").replace(/^﻿/, ""), meta: {} };
  }
}
