import type { CitationItem } from "@/lib/citations/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Veritabanı satırı -> atıf motoru öğesi (istemci tarafı; lib/projects.ts ile aynı eşleme). */
export function sourceRowToItemClient(r: any): CitationItem {
  return {
    id: r.id, type: r.type ?? "article-journal", title: r.title ?? "", authors: Array.isArray(r.authors) ? r.authors : [],
    editors: Array.isArray(r.verification?.editors) ? r.verification.editors : undefined, year: r.year, month: r.month,
    containerTitle: r.container_title, volume: r.volume, issue: r.issue, pages: r.pages, publisher: r.publisher, publisherPlace: r.publisher_place,
    edition: r.edition, doi: r.doi, url: r.url, isbn: r.isbn, pmid: r.pmid, arxivId: r.arxiv_id, institution: r.type === "thesis" ? r.publisher : null,
  };
}
