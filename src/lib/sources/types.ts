import type { ItemType, Person } from "@/lib/citations/types";

export type SourceProviderId =
  | "openalex" | "crossref" | "semantic_scholar" | "europepmc" | "arxiv"
  | "doaj" | "core" | "openaire" | "google_books" | "unpaywall";

export type AccessLevel = "metadata" | "abstract" | "full_text";

/** Tüm sağlayıcılardan gelen kayıtların ortak biçimi. */
export interface SourceRecord {
  type: ItemType;
  title: string;
  authors: Person[];
  year: number | null;
  month?: number | null;
  containerTitle?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  publisher?: string | null;
  doi?: string | null;
  pmid?: string | null;
  pmcid?: string | null;
  arxivId?: string | null;
  isbn?: string | null;
  openalexId?: string | null;
  url?: string | null;
  /** Açık erişimli tam metin bağlantısı (varsa). Bu, tam metnin OKUNDUĞU anlamına gelmez. */
  oaUrl?: string | null;
  license?: string | null;
  abstract?: string | null;
  language?: string | null;
  citedByCount?: number | null;
  /** Tam metin sağlayıcıdan doğrudan geldiyse (ör. CORE fullText) */
  fullText?: string | null;
  origins: SourceProviderId[];
  /** Erişim seviyesi: künye / özet / tam metin */
  accessLevel: AccessLevel;
  score?: number;
}

export interface SearchQuery {
  query: string;
  yearFrom?: number;
  yearTo?: number;
  author?: string;
  openAccessOnly?: boolean;
  limit?: number;
  /** Yalnızca belirli sağlayıcılar */
  providers?: SourceProviderId[];
}

export interface ProviderResult {
  provider: SourceProviderId;
  ok: boolean;
  count: number;
  error?: string;
  ms: number;
}

export interface SearchResponse {
  results: SourceRecord[];
  providers: ProviderResult[];
}

export interface ProviderConfig {
  contactEmail?: string;
  semanticScholarKey?: string;
  coreKey?: string;
  openalexKey?: string;
  googleBooksKey?: string;
}

export interface SourceProvider {
  id: SourceProviderId;
  label: string;
  /** Arama desteği (Unpaywall yalnızca DOI zenginleştirmesi yapar) */
  search?: (q: SearchQuery, cfg: ProviderConfig, signal: AbortSignal) => Promise<SourceRecord[]>;
  /** Yapılandırma eksikse neden kullanılamadığını döndürür */
  unavailableReason?: (cfg: ProviderConfig) => string | null;
}
