import type { SourceProviderId } from "./types";

export const PROVIDER_LABELS: Record<SourceProviderId, string> = {
  openalex: "OpenAlex", crossref: "Crossref", semantic_scholar: "Semantic Scholar", europepmc: "PubMed / Europe PMC", arxiv: "arXiv",
  doaj: "DOAJ", core: "CORE", openaire: "OpenAIRE", google_books: "Google Books", unpaywall: "Unpaywall",
};
