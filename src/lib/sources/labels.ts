import type { SourceProviderId } from "./types";

export const PROVIDER_LABELS: Record<SourceProviderId, string> = {
  openalex: "OpenAlex", crossref: "Crossref", semantic_scholar: "Semantic Scholar", europepmc: "PubMed / Europe PMC", arxiv: "arXiv",
  doaj: "DOAJ", core: "CORE", openaire: "OpenAIRE", google_books: "Google Books", unpaywall: "Unpaywall", turkiye: "Türkiye (TR)",
};

/** DergiPark'ta yayımlanan kayıt mı? (bağlantı adresinden) */
export function isDergiPark(r: { url?: string | null; oaUrl?: string | null; oa_url?: string | null }): boolean {
  return [r.url, r.oaUrl, r.oa_url].some((u) => !!u && /(^|\/\/|\.)dergipark\.org\.tr\//i.test(u));
}

/** Türk akademik veri tabanlarında aynı sorguyla arama bağlantıları (yeni sekmede açılır). */
export function turkishSearchLinks(query: string) {
  const q = encodeURIComponent(query.trim());
  return [
    { id: "dergipark", label: "DergiPark", url: `https://dergipark.org.tr/tr/search?q=${q}&section=articles` },
    { id: "trdizin", label: "TR Dizin", url: `https://search.trdizin.gov.tr/tr/yayin/ara?q=${q}&order=relevance-DESC` },
    // YÖK Ulusal Tez Merkezi sorgu parametresi kabul etmez: arama sayfası açılır, sorgu panoya kopyalanır
    { id: "yoktez", label: "YÖK Tez Merkezi", url: "https://tez.yok.gov.tr/UlusalTezMerkezi/" },
  ];
}
