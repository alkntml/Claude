/**
 * Akademik veri kaynağı adaptörleri.
 * Her adaptör, API yanıtını `parseX` fonksiyonu ile ortak `SourceRecord` biçimine dönüştürür;
 * parse fonksiyonları ağdan bağımsızdır ve birim testleriyle doğrulanır.
 *
 * Kullanım koşulları:
 *  - OpenAlex / Crossref: "polite pool" için `mailto` parametresi gönderilir.
 *  - Semantic Scholar: anahtarsız kullanım düşük limitlidir; SEMANTIC_SCHOLAR_API_KEY önerilir.
 *  - CORE: API anahtarı zorunludur.
 *  - Google Books: yalnızca kitap künyesi için; açıklama metni akademik özet olarak KULLANILMAZ.
 *  - Unpaywall: yalnızca DOI bazlı açık erişim zenginleştirmesi, e-posta zorunlu.
 */
import type { ItemType, Person } from "@/lib/citations/types";
import { normalizeDoi } from "@/lib/citations/util";
import { getJson, getText, stripTags } from "./http";
import type { ProviderConfig, SearchQuery, SourceProvider, SourceProviderId, SourceRecord } from "./types";

// ---------------------------------------------------------------------------
// Ortak yardımcılar
// ---------------------------------------------------------------------------

/** "Ayşe Nur Yılmaz" -> {given: "Ayşe Nur", family: "Yılmaz"}; "Yılmaz, Ayşe" -> {...} */
export function splitName(full: string): Person {
  const s = full.replace(/\s+/g, " ").trim();
  if (!s) return { literal: "" };
  if (s.includes(",")) {
    const [family, given] = s.split(",", 2).map((x) => x.trim());
    return { family, given: given || undefined };
  }
  const parts = s.split(" ");
  if (parts.length === 1) return { family: parts[0] };
  // Soyadı önekleri: van, von, de, da, di, du, le, la, bin, al
  const particles = new Set(["van", "von", "de", "da", "di", "du", "le", "la", "der", "den", "bin", "al", "el", "dos", "del"]);
  let k = parts.length - 1;
  while (k > 1 && particles.has(parts[k - 1].toLowerCase())) k--;
  return { given: parts.slice(0, k).join(" "), family: parts.slice(k).join(" ") };
}

function accessOf(r: { abstract?: string | null; fullText?: string | null }) {
  if (r.fullText && r.fullText.length > 2000) return "full_text" as const;
  if (r.abstract && r.abstract.trim().length > 40) return "abstract" as const;
  return "metadata" as const;
}

function finalize(r: Omit<SourceRecord, "accessLevel">): SourceRecord {
  const title = stripTags(r.title ?? "").replace(/\.$/, "");
  const abstract = r.abstract ? stripTags(r.abstract) : null;
  return { ...r, title, abstract, doi: normalizeDoi(r.doi), accessLevel: accessOf({ abstract, fullText: r.fullText }) };
}

function pages(first?: string | null, last?: string | null): string | null {
  if (!first) return null;
  return last && last !== first ? `${first}-${last}` : first;
}

function yearRange(q: SearchQuery): [number | undefined, number | undefined] {
  return [q.yearFrom, q.yearTo];
}

// ---------------------------------------------------------------------------
// OpenAlex
// ---------------------------------------------------------------------------

const OPENALEX_TYPES: Record<string, ItemType> = {
  article: "article-journal", "journal-article": "article-journal", book: "book", "book-chapter": "chapter",
  dissertation: "thesis", preprint: "preprint", "posted-content": "preprint", report: "report", dataset: "dataset",
  "proceedings-article": "paper-conference", review: "article-journal",
};

/** OpenAlex özetleri ters indeks olarak verir: {"word": [0, 5], ...} */
export function invertedIndexToText(idx: Record<string, number[]> | null | undefined): string | null {
  if (!idx) return null;
  const words: string[] = [];
  for (const [w, positions] of Object.entries(idx)) for (const p of positions) words[p] = w;
  const text = words.filter((w) => w !== undefined).join(" ");
  return text || null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function parseOpenAlex(json: any): SourceRecord[] {
  return (json?.results ?? []).map((w: any) => {
    const loc = w.primary_location ?? {};
    const oa = w.best_oa_location ?? {};
    return finalize({
      type: OPENALEX_TYPES[w.type] ?? "article-journal",
      title: w.display_name ?? w.title ?? "",
      authors: (w.authorships ?? []).map((a: any) => splitName(a?.author?.display_name ?? a?.raw_author_name ?? "")),
      year: w.publication_year ?? null,
      month: w.publication_date ? Number(String(w.publication_date).slice(5, 7)) || null : null,
      containerTitle: loc?.source?.display_name ?? null,
      volume: w.biblio?.volume ?? null,
      issue: w.biblio?.issue ?? null,
      pages: pages(w.biblio?.first_page, w.biblio?.last_page),
      publisher: loc?.source?.host_organization_name ?? null,
      doi: w.doi ?? null,
      pmid: w.ids?.pmid ? String(w.ids.pmid).replace(/\D/g, "") : null,
      openalexId: w.id ? String(w.id).replace("https://openalex.org/", "") : null,
      url: loc?.landing_page_url ?? w.doi ?? null,
      oaUrl: oa?.pdf_url ?? w.open_access?.oa_url ?? null,
      license: oa?.license ?? null,
      abstract: invertedIndexToText(w.abstract_inverted_index),
      language: w.language ?? null,
      citedByCount: w.cited_by_count ?? null,
      origins: ["openalex"],
    });
  });
}

const openalex: SourceProvider = {
  id: "openalex",
  label: "OpenAlex",
  async search(q, cfg, signal) {
    const filters: string[] = [];
    const [from, to] = yearRange(q);
    if (from) filters.push(`from_publication_date:${from}-01-01`);
    if (to) filters.push(`to_publication_date:${to}-12-31`);
    if (q.openAccessOnly) filters.push("is_oa:true");
    if (q.author) filters.push(`raw_author_name.search:${q.author.replace(/[,|]/g, " ")}`);
    const p = new URLSearchParams({ search: q.query, "per-page": String(q.limit ?? 20) });
    if (filters.length) p.set("filter", filters.join(","));
    if (cfg.contactEmail) p.set("mailto", cfg.contactEmail);
    if (cfg.openalexKey) p.set("api_key", cfg.openalexKey);
    return parseOpenAlex(await getJson(`https://api.openalex.org/works?${p}`, { signal }));
  },
};

// ---------------------------------------------------------------------------
// Crossref
// ---------------------------------------------------------------------------

const CROSSREF_TYPES: Record<string, ItemType> = {
  "journal-article": "article-journal", book: "book", monograph: "book", "edited-book": "book", "book-chapter": "chapter",
  "proceedings-article": "paper-conference", dissertation: "thesis", "posted-content": "preprint", report: "report", dataset: "dataset",
};

export function parseCrossrefItem(it: any): SourceRecord {
  const parts: number[] = it?.issued?.["date-parts"]?.[0] ?? it?.published?.["date-parts"]?.[0] ?? [];
  return finalize({
    type: CROSSREF_TYPES[it.type] ?? "article-journal",
    title: [...(it.title ?? []), ...(it.subtitle?.length ? [it.subtitle[0]] : [])].join(": "),
    authors: (it.author ?? []).map((a: any) => (a.family ? { family: a.family, given: a.given } : { literal: a.name ?? "" })),
    year: parts[0] ?? null,
    month: parts[1] ?? null,
    containerTitle: it["container-title"]?.[0] ?? null,
    volume: it.volume ?? null,
    issue: it.issue ?? null,
    pages: it.page ?? null,
    publisher: it.publisher ?? null,
    doi: it.DOI ?? null,
    isbn: it.ISBN?.[0] ?? null,
    url: it.URL ?? null,
    license: it.license?.[0]?.URL ?? null,
    abstract: it.abstract ?? null,
    language: it.language ?? null,
    citedByCount: it["is-referenced-by-count"] ?? null,
    origins: ["crossref"],
  });
}

export function parseCrossref(json: any): SourceRecord[] {
  return (json?.message?.items ?? []).map(parseCrossrefItem);
}

const crossref: SourceProvider = {
  id: "crossref",
  label: "Crossref",
  async search(q, cfg, signal) {
    const p = new URLSearchParams({ "query.bibliographic": q.query, rows: String(q.limit ?? 20) });
    const filters: string[] = [];
    if (q.yearFrom) filters.push(`from-pub-date:${q.yearFrom}`);
    if (q.yearTo) filters.push(`until-pub-date:${q.yearTo}`);
    if (filters.length) p.set("filter", filters.join(","));
    if (q.author) p.set("query.author", q.author);
    if (cfg.contactEmail) p.set("mailto", cfg.contactEmail);
    return parseCrossref(await getJson(`https://api.crossref.org/works?${p}`, { signal }));
  },
};

// ---------------------------------------------------------------------------
// Semantic Scholar
// ---------------------------------------------------------------------------

export function parseSemanticScholar(json: any): SourceRecord[] {
  return (json?.data ?? []).map((p: any) => {
    const types: string[] = p.publicationTypes ?? [];
    return finalize({
      type: types.includes("Book") ? "book" : types.includes("Conference") ? "paper-conference" : "article-journal",
      title: p.title ?? "",
      authors: (p.authors ?? []).map((a: any) => splitName(a.name ?? "")),
      year: p.year ?? null,
      containerTitle: p.journal?.name ?? p.venue ?? null,
      volume: p.journal?.volume ?? null,
      pages: p.journal?.pages?.replace(/\s/g, "") ?? null,
      doi: p.externalIds?.DOI ?? null,
      pmid: p.externalIds?.PubMed ?? null,
      arxivId: p.externalIds?.ArXiv ?? null,
      url: p.url ?? null,
      oaUrl: p.openAccessPdf?.url || null,
      abstract: p.abstract ?? null,
      citedByCount: p.citationCount ?? null,
      origins: ["semantic_scholar"],
    });
  });
}

const semanticScholar: SourceProvider = {
  id: "semantic_scholar",
  label: "Semantic Scholar",
  async search(q, cfg, signal) {
    const p = new URLSearchParams({
      query: q.query,
      limit: String(Math.min(q.limit ?? 20, 100)),
      fields: "title,abstract,year,authors,venue,journal,externalIds,openAccessPdf,publicationTypes,citationCount,url",
    });
    if (q.yearFrom || q.yearTo) p.set("year", `${q.yearFrom ?? ""}-${q.yearTo ?? ""}`);
    if (q.openAccessOnly) p.set("openAccessPdf", "");
    const headers: Record<string, string> = cfg.semanticScholarKey ? { "x-api-key": cfg.semanticScholarKey } : {};
    return parseSemanticScholar(await getJson(`https://api.semanticscholar.org/graph/v1/paper/search?${p}`, { signal, headers }));
  },
};

// ---------------------------------------------------------------------------
// Europe PMC (PubMed dahil)
// ---------------------------------------------------------------------------

export function parseEuropePmc(json: any): SourceRecord[] {
  return (json?.resultList?.result ?? []).map((r: any) => {
    const oa = (r.fullTextUrlList?.fullTextUrl ?? []).find((u: any) => u.availabilityCode === "OA" && u.documentStyle === "pdf");
    return finalize({
      type: r.pubType?.toLowerCase?.().includes("preprint") || r.source === "PPR" ? "preprint" : "article-journal",
      title: r.title ?? "",
      authors: (r.authorList?.author ?? []).map((a: any) =>
        a.lastName ? { family: a.lastName, given: a.firstName ?? a.initials } : { literal: a.collectiveName ?? a.fullName ?? "" },
      ),
      year: r.pubYear ? Number(r.pubYear) : null,
      containerTitle: r.journalInfo?.journal?.title ?? r.bookOrReportDetails?.publisher ?? null,
      volume: r.journalInfo?.volume ?? null,
      issue: r.journalInfo?.issue ?? null,
      pages: r.pageInfo ?? null,
      doi: r.doi ?? null,
      pmid: r.pmid ?? null,
      pmcid: r.pmcid ?? null,
      url: r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : r.doi ? `https://doi.org/${r.doi}` : null,
      oaUrl: oa?.url ?? (r.isOpenAccess === "Y" && r.pmcid ? `https://europepmc.org/article/PMC/${r.pmcid}` : null),
      license: r.license ?? null,
      abstract: r.abstractText ?? null,
      language: r.language ?? null,
      citedByCount: r.citedByCount ?? null,
      origins: ["europepmc"],
    });
  });
}

const europepmc: SourceProvider = {
  id: "europepmc",
  label: "PubMed / Europe PMC",
  async search(q, _cfg, signal) {
    let query = q.query;
    if (q.yearFrom || q.yearTo) query += ` AND PUB_YEAR:[${q.yearFrom ?? 1800} TO ${q.yearTo ?? 2100}]`;
    if (q.author) query += ` AND AUTH:"${q.author.replace(/"/g, "")}"`;
    if (q.openAccessOnly) query += " AND OPEN_ACCESS:y";
    const p = new URLSearchParams({ query, format: "json", resultType: "core", pageSize: String(q.limit ?? 20) });
    return parseEuropePmc(await getJson(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?${p}`, { signal }));
  },
};

// ---------------------------------------------------------------------------
// arXiv (Atom XML)
// ---------------------------------------------------------------------------

function xmlTag(block: string, tag: string): string | null {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? stripTags(m[1]) : null;
}

export function parseArxiv(xml: string): SourceRecord[] {
  const entries = xml.split("<entry>").slice(1).map((e) => e.split("</entry>")[0]);
  return entries.map((e) => {
    const idUrl = xmlTag(e, "id") ?? "";
    const arxivId = idUrl.replace(/^https?:\/\/arxiv\.org\/abs\//, "").replace(/v\d+$/, "");
    const authors = [...e.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => splitName(stripTags(m[1])));
    const published = xmlTag(e, "published");
    const pdf = e.match(/<link[^>]*title="pdf"[^>]*href="([^"]+)"/)?.[1] ?? e.match(/<link[^>]*href="([^"]+)"[^>]*title="pdf"/)?.[1];
    const doi = xmlTag(e, "arxiv:doi");
    const journalRef = xmlTag(e, "arxiv:journal_ref");
    return finalize({
      type: doi || journalRef ? "article-journal" : "preprint",
      title: xmlTag(e, "title") ?? "",
      authors,
      year: published ? Number(published.slice(0, 4)) : null,
      month: published ? Number(published.slice(5, 7)) : null,
      containerTitle: journalRef ?? "arXiv",
      doi: doi ?? `10.48550/arXiv.${arxivId}`,
      arxivId,
      url: `https://arxiv.org/abs/${arxivId}`,
      oaUrl: pdf ?? `https://arxiv.org/pdf/${arxivId}`,
      license: "arXiv",
      abstract: xmlTag(e, "summary"),
      origins: ["arxiv"],
    });
  });
}

const arxiv: SourceProvider = {
  id: "arxiv",
  label: "arXiv",
  async search(q, _cfg, signal) {
    const terms = q.query.split(/\s+/).filter(Boolean).map((w) => `all:${w.replace(/[^\p{L}\p{N}-]/gu, "")}`).join("+AND+");
    let sq = terms;
    if (q.author) sq += `+AND+au:${encodeURIComponent(q.author.split(" ").pop() ?? "")}`;
    const url = `https://export.arxiv.org/api/query?search_query=${sq}&max_results=${q.limit ?? 20}&sortBy=relevance`;
    let recs = parseArxiv(await getText(url, { signal }));
    if (q.yearFrom) recs = recs.filter((r) => (r.year ?? 0) >= q.yearFrom!);
    if (q.yearTo) recs = recs.filter((r) => (r.year ?? 9999) <= q.yearTo!);
    return recs;
  },
};

// ---------------------------------------------------------------------------
// DOAJ
// ---------------------------------------------------------------------------

export function parseDoaj(json: any): SourceRecord[] {
  return (json?.results ?? []).map((r: any) => {
    const b = r.bibjson ?? {};
    const doi = (b.identifier ?? []).find((x: any) => String(x.type).toLowerCase() === "doi")?.id ?? null;
    const full = (b.link ?? []).find((l: any) => l.type === "fulltext")?.url ?? null;
    return finalize({
      type: "article-journal",
      title: b.title ?? "",
      authors: (b.author ?? []).map((a: any) => splitName(a.name ?? "")),
      year: b.year ? Number(b.year) : null,
      month: b.month ? Number(b.month) : null,
      containerTitle: b.journal?.title ?? null,
      volume: b.journal?.volume ?? null,
      issue: b.journal?.number ?? null,
      pages: pages(b.start_page, b.end_page),
      publisher: b.journal?.publisher ?? null,
      doi,
      url: full ?? (doi ? `https://doi.org/${doi}` : null),
      oaUrl: full,
      license: b.journal?.license?.[0]?.type ?? null,
      abstract: b.abstract ?? null,
      language: b.journal?.language?.[0] ?? null,
      origins: ["doaj"],
    });
  });
}

const doaj: SourceProvider = {
  id: "doaj",
  label: "DOAJ",
  async search(q, _cfg, signal) {
    let query = q.query;
    if (q.yearFrom || q.yearTo) query += ` AND bibjson.year:[${q.yearFrom ?? 1900} TO ${q.yearTo ?? 2100}]`;
    const url = `https://doaj.org/api/search/articles/${encodeURIComponent(query)}?pageSize=${q.limit ?? 20}`;
    return parseDoaj(await getJson(url, { signal }));
  },
};

// ---------------------------------------------------------------------------
// CORE
// ---------------------------------------------------------------------------

export function parseCore(json: any): SourceRecord[] {
  return (json?.results ?? []).map((r: any) =>
    finalize({
      type: r.documentType === "thesis" ? "thesis" : "article-journal",
      title: r.title ?? "",
      authors: (r.authors ?? []).map((a: any) => splitName(a.name ?? "")),
      year: r.yearPublished ?? null,
      containerTitle: r.journals?.[0]?.title ?? null,
      publisher: r.publisher ?? null,
      doi: r.doi ?? null,
      url: r.links?.find((l: any) => l.type === "display")?.url ?? (r.id ? `https://core.ac.uk/works/${r.id}` : null),
      oaUrl: r.downloadUrl ?? null,
      abstract: r.abstract ?? null,
      fullText: typeof r.fullText === "string" ? r.fullText : null,
      language: r.language?.code ?? null,
      citedByCount: r.citationCount ?? null,
      origins: ["core"],
    }),
  );
}

const core: SourceProvider = {
  id: "core",
  label: "CORE",
  unavailableReason: (cfg) => (cfg.coreKey ? null : "CORE_API_KEY tanımlı değil"),
  async search(q, cfg, signal) {
    let query = q.query;
    if (q.yearFrom) query += ` AND yearPublished>=${q.yearFrom}`;
    if (q.yearTo) query += ` AND yearPublished<=${q.yearTo}`;
    const p = new URLSearchParams({ q: query, limit: String(q.limit ?? 20) });
    return parseCore(await getJson(`https://api.core.ac.uk/v3/search/works?${p}`, { signal, headers: { Authorization: `Bearer ${cfg.coreKey}` } }));
  },
};

// ---------------------------------------------------------------------------
// OpenAIRE Graph API
// ---------------------------------------------------------------------------

export function parseOpenAire(json: any): SourceRecord[] {
  return (json?.results ?? []).map((r: any) => {
    const doi = (r.pids ?? []).find((p: any) => p.scheme === "doi")?.value ?? null;
    const url = r.instances?.[0]?.urls?.[0] ?? null;
    const c = r.container ?? {};
    return finalize({
      type: r.type === "publication" ? "article-journal" : r.type === "dataset" ? "dataset" : "other",
      title: r.mainTitle ?? "",
      authors: (r.authors ?? []).map((a: any) => (a.surname ? { family: a.surname, given: a.name } : splitName(a.fullName ?? ""))),
      year: r.publicationDate ? Number(String(r.publicationDate).slice(0, 4)) : null,
      containerTitle: c.name ?? null,
      volume: c.vol ?? null,
      issue: c.iss ?? null,
      pages: pages(c.sp, c.ep),
      publisher: r.publisher ?? null,
      doi,
      url: doi ? `https://doi.org/${doi}` : url,
      oaUrl: r.bestAccessRight?.code === "c_abf2" ? url : null,
      abstract: r.descriptions?.[0] ?? null,
      language: r.language?.code ?? null,
      origins: ["openaire"],
    });
  });
}

const openaire: SourceProvider = {
  id: "openaire",
  label: "OpenAIRE",
  async search(q, _cfg, signal) {
    const p = new URLSearchParams({ search: q.query, pageSize: String(q.limit ?? 20), type: "publication" });
    if (q.yearFrom) p.set("fromPublicationDate", `${q.yearFrom}-01-01`);
    if (q.yearTo) p.set("toPublicationDate", `${q.yearTo}-12-31`);
    if (q.openAccessOnly) p.set("bestOpenAccessRightLabel", "OPEN SOURCE");
    return parseOpenAire(await getJson(`https://api.openaire.eu/graph/v1/researchProducts?${p}`, { signal }));
  },
};

// ---------------------------------------------------------------------------
// Google Books (yalnızca kitap künyesi)
// ---------------------------------------------------------------------------

export function parseGoogleBooks(json: any): SourceRecord[] {
  return (json?.items ?? []).map((it: any) => {
    const v = it.volumeInfo ?? {};
    const isbn = (v.industryIdentifiers ?? []).find((x: any) => x.type === "ISBN_13")?.identifier
      ?? (v.industryIdentifiers ?? []).find((x: any) => x.type === "ISBN_10")?.identifier ?? null;
    const rec = finalize({
      type: "book",
      title: v.subtitle ? `${v.title}: ${v.subtitle}` : v.title ?? "",
      authors: (v.authors ?? []).map(splitName),
      year: v.publishedDate ? Number(String(v.publishedDate).slice(0, 4)) : null,
      publisher: v.publisher ?? null,
      isbn,
      url: v.infoLink ?? null,
      // Yayıncı tanıtım metni akademik özet değildir; erişim seviyesi "künye" kalır.
      abstract: null,
      language: v.language ?? null,
      origins: ["google_books"],
    });
    return rec;
  });
}

const googleBooks: SourceProvider = {
  id: "google_books",
  label: "Google Books",
  async search(q, cfg, signal) {
    let query = q.query;
    if (q.author) query += `+inauthor:${q.author}`;
    const p = new URLSearchParams({ q: query, maxResults: String(Math.min(q.limit ?? 20, 40)), printType: "books" });
    if (cfg.googleBooksKey) p.set("key", cfg.googleBooksKey);
    return parseGoogleBooks(await getJson(`https://www.googleapis.com/books/v1/volumes?${p}`, { signal }));
  },
};

// ---------------------------------------------------------------------------
// Unpaywall (DOI zenginleştirme)
// ---------------------------------------------------------------------------

export interface UnpaywallInfo {
  isOa: boolean;
  pdfUrl: string | null;
  landingUrl: string | null;
  license: string | null;
}

export function parseUnpaywall(json: any): UnpaywallInfo {
  const best = json?.best_oa_location ?? null;
  return {
    isOa: !!json?.is_oa,
    pdfUrl: best?.url_for_pdf ?? null,
    landingUrl: best?.url ?? null,
    license: best?.license ?? null,
  };
}

export async function unpaywallLookup(doi: string, cfg: ProviderConfig, signal: AbortSignal): Promise<UnpaywallInfo | null> {
  if (!cfg.contactEmail) return null;
  const d = normalizeDoi(doi);
  if (!d) return null;
  return parseUnpaywall(await getJson(`https://api.unpaywall.org/v2/${encodeURIComponent(d)}?email=${encodeURIComponent(cfg.contactEmail)}`, { signal }));
}

const unpaywall: SourceProvider = {
  id: "unpaywall",
  label: "Unpaywall",
  unavailableReason: (cfg) => (cfg.contactEmail ? null : "ACADEMIC_CONTACT_EMAIL tanımlı değil"),
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export const PROVIDERS: Record<SourceProviderId, SourceProvider> = {
  openalex, crossref, semantic_scholar: semanticScholar, europepmc, arxiv, doaj, core, openaire, google_books: googleBooks, unpaywall,
};

export const PROVIDER_LABELS: Record<SourceProviderId, string> = Object.fromEntries(
  Object.values(PROVIDERS).map((p) => [p.id, p.label]),
) as Record<SourceProviderId, string>;
