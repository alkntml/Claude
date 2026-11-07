/** Arama sonucundaki kaydı projeye ekleme gövdesine çevirir (istemci ve sunucu) */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function toSourceInput(r: any) {
  return {
    type: r.type, title: r.title, authors: r.authors, year: r.year, month: r.month ?? null, containerTitle: r.containerTitle ?? null, volume: r.volume ?? null,
    issue: r.issue ?? null, pages: r.pages ?? null, publisher: r.publisher ?? null, doi: r.doi ?? null, pmid: r.pmid ?? null, pmcid: r.pmcid ?? null,
    arxivId: r.arxivId ?? null, isbn: r.isbn ?? null, openalexId: r.openalexId ?? null, url: r.url ?? null, oaUrl: r.oaUrl ?? null,
    abstract: r.abstract ?? null, license: r.license ?? null, language: r.language ?? null, origins: r.origins,
  };
}
