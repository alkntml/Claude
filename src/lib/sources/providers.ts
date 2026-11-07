/**
 * Akademik veri kaynağı adaptörleri.
 * Her adaptör, API yanıtını `parseX` fonksiyonu ile ortak `SourceRecord` biçimine dönüştürür;
 * parse fonksiyonları ağdan bağımsızdır ve birim testleriyle doğrulanır.
 *
 * Kullanım koşulları:
 *  - OpenAlex / Crossref: "polite pool" için `mailto` parametresi gönderilir.
 *  - CORE: API anahtarı zorunludur.
 *  - Google Books: yalnızca kitap künyesi için; açıklama metni akademik özet olarak KULLANILMAZ.
 *  - Unpaywall: yalnızca DOI bazlı açık erişim zenginleştirmesi, e-posta zorunlu.
 *  - NASA ADS, Springer Nature, IEEE Xplore: ücretsiz API anahtarı gerekir; anahtar yoksa arama atlanır (D129).
 */
import type { ItemType, Person } from "@/lib/citations/types";
import { normalizeDoi } from "@/lib/citations/util";
import { getJson, getJsonRetry, getText, stripTags } from "./http";
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

/** OpenAlex arama adresi (extra: ek filtreler, ör. Türkçe yayınlar) */
export function openAlexUrl(q: SearchQuery, cfg: ProviderConfig, extra: string[] = []): string {
  const filters: string[] = [...extra];
  const [from, to] = yearRange(q);
  if (from) filters.push(`from_publication_date:${from}-01-01`);
  if (to) filters.push(`to_publication_date:${to}-12-31`);
  if (q.openAccessOnly) filters.push("is_oa:true");
  if (q.author) filters.push(`raw_author_name.search:${q.author.replace(/[,|]/g, " ")}`);
  const p = new URLSearchParams({ search: q.query, "per-page": String(q.limit ?? 20) });
  if (filters.length) p.set("filter", filters.join(","));
  if (cfg.contactEmail) p.set("mailto", cfg.contactEmail);
  if (cfg.openalexKey) p.set("api_key", cfg.openalexKey);
  return `https://api.openalex.org/works?${p}`;
}

const openalex: SourceProvider = {
  id: "openalex",
  label: "OpenAlex",
  async search(q, cfg, signal) {
    return parseOpenAlex(await getJson(openAlexUrl(q, cfg), { signal }));
  },
};

/**
 * Türkiye kaynakları: OpenAlex'te Türkçe yayınlar ve Türkiye adresli yazarların yayınları.
 * DergiPark ve TR Dizin dergilerinin büyük bölümü OpenAlex'te dizinlidir; kayıtlar gerçek ve doğrulanabilirdir.
 */
const turkiye: SourceProvider = {
  id: "turkiye",
  label: "Türkiye (Türkçe ve Türkiye adresli yayınlar)",
  async search(q, cfg, signal) {
    const half = { ...q, limit: Math.max(5, Math.ceil((q.limit ?? 20) / 2)) };
    const [tr, inst] = await Promise.all([
      getJson(openAlexUrl(half, cfg, ["language:tr"]), { signal }).then(parseOpenAlex).catch(() => [] as SourceRecord[]),
      getJson(openAlexUrl(half, cfg, ["institutions.country_code:tr"]), { signal }).then(parseOpenAlex).catch(() => [] as SourceRecord[]),
    ]);
    return [...tr, ...inst].map((r) => ({ ...r, origins: ["turkiye" as const] }));
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


// ---------------------------------------------------------------------------
// ERIC — ABD Eğitim Bakanlığı eğitim araştırmaları dizini (D92; anahtar gerekmez)
// ---------------------------------------------------------------------------

export function parseEric(json: any): SourceRecord[] {
  return (json?.response?.docs ?? []).map((d: any) => {
    const doi = typeof d.url === "string" ? d.url.match(/10\.\d{4,9}\/\S+/)?.[0] ?? null : null;
    const types: string[] = Array.isArray(d.publicationtype) ? d.publicationtype : [];
    const isBook = types.some((t) => /book/i.test(t));
    const isThesis = types.some((t) => /dissertation|thesis/i.test(t));
    const full = d.e_fulltextauth === 1 || d.e_fulltextauth === "1" || d.e_fulltextauth === true;
    return finalize({
      type: isThesis ? "thesis" : isBook ? "book" : "article-journal",
      title: d.title ?? "",
      authors: (Array.isArray(d.author) ? d.author : d.author ? [d.author] : []).map((a: string) => splitName(a)),
      year: d.publicationdateyear ? Number(d.publicationdateyear) : null,
      containerTitle: typeof d.source === "string" ? d.source.replace(/,?\s*v\d+.*$/i, "").trim() || null : null,
      publisher: d.publisher ?? null,
      doi,
      url: `https://eric.ed.gov/?id=${d.id}`,
      oaUrl: full ? `https://files.eric.ed.gov/fulltext/${d.id}.pdf` : null,
      abstract: d.description ?? null,
      language: Array.isArray(d.language) ? (d.language[0] ?? null) : d.language ?? null,
      origins: ["eric"],
    });
  });
}

const eric: SourceProvider = {
  id: "eric",
  label: "ERIC",
  async search(q, _cfg, signal) {
    let search = q.query;
    if (q.yearFrom || q.yearTo) search += ` publicationdateyear:[${q.yearFrom ?? 1900} TO ${q.yearTo ?? 2100}]`;
    if (q.openAccessOnly) search += " e_fulltextauth:1";
    const p = new URLSearchParams({ search, format: "json", rows: String(Math.min(q.limit ?? 20, 50)), fields: "id,title,author,publicationdateyear,description,source,publisher,url,e_fulltextauth,publicationtype,language" });
    return parseEric(await getJsonRetry(`https://api.ies.ed.gov/eric/?${p}`, { signal }, { retries: 1 }));
  },
};

// ---------------------------------------------------------------------------
// DBLP — bilgisayar bilimleri bibliyografyası (D92; anahtar gerekmez)
// ---------------------------------------------------------------------------

export function parseDblp(json: any): SourceRecord[] {
  const hits = json?.result?.hits?.hit ?? [];
  return (Array.isArray(hits) ? hits : [hits]).map((h: any) => {
    const i = h.info ?? {};
    const raw = i.authors?.author ?? [];
    const list = Array.isArray(raw) ? raw : [raw];
    const type = String(i.type ?? "");
    return finalize({
      type: /conference|workshop/i.test(type) ? "paper-conference" : /book|monograph/i.test(type) ? "book" : /informal|preprint/i.test(type) ? "preprint" : "article-journal",
      title: String(i.title ?? ""),
      // DBLP aynı adlı yazarları “Ad Soyad 0001” biçiminde ayırır; numara atılır
      authors: list.map((a: any) => splitName(String(typeof a === "string" ? a : a?.text ?? "").replace(/\s+\d{4}$/, ""))),
      year: i.year ? Number(i.year) : null,
      containerTitle: i.venue ? (Array.isArray(i.venue) ? i.venue[0] : i.venue) : null,
      volume: i.volume ?? null,
      issue: i.number ?? null,
      pages: i.pages ?? null,
      doi: i.doi ?? null,
      url: i.ee ? (Array.isArray(i.ee) ? i.ee[0] : i.ee) : i.url ?? null,
      oaUrl: i.access === "open" && i.ee ? (Array.isArray(i.ee) ? i.ee[0] : i.ee) : null,
      origins: ["dblp"],
    });
  });
}

const dblp: SourceProvider = {
  id: "dblp",
  label: "DBLP",
  async search(q, _cfg, signal) {
    const p = new URLSearchParams({ q: q.query, format: "json", h: String(Math.min(q.limit ?? 20, 50)) });
    return parseDblp(await getJsonRetry(`https://dblp.org/search/publ/api?${p}`, { signal }, { retries: 1 }));
  },
};

// ---------------------------------------------------------------------------
// DataCite — tez, veri seti, rapor, ön baskı DOI’leri (D92; anahtar gerekmez)
// ---------------------------------------------------------------------------

const DC_TYPE: Record<string, SourceRecord["type"]> = { Dissertation: "thesis", Dataset: "dataset", Preprint: "preprint", Report: "report", Book: "book", BookChapter: "chapter", ConferencePaper: "paper-conference", JournalArticle: "article-journal", Text: "article-journal" };

export function parseDatacite(json: any): SourceRecord[] {
  return (json?.data ?? []).map((d: any) => {
    const a = d.attributes ?? {};
    const rt = a.types?.resourceTypeGeneral ?? "Text";
    return finalize({
      type: DC_TYPE[rt] ?? "other",
      title: a.titles?.[0]?.title ?? "",
      authors: (a.creators ?? []).map((c: any) => (c.familyName ? { family: c.familyName, given: c.givenName ?? undefined } : c.nameType === "Organizational" ? { literal: c.name } : splitName(c.name ?? ""))),
      year: a.publicationYear ? Number(a.publicationYear) : null,
      containerTitle: a.container?.title ?? null,
      publisher: typeof a.publisher === "string" ? a.publisher : a.publisher?.name ?? null,
      doi: a.doi ?? d.id ?? null,
      url: a.url ?? null,
      abstract: a.descriptions?.find((x: any) => x.descriptionType === "Abstract")?.description ?? null,
      license: a.rightsList?.[0]?.rights ?? null,
      language: a.language ?? null,
      origins: ["datacite"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const datacite: SourceProvider = {
  id: "datacite",
  label: "DataCite",
  async search(q, _cfg, signal) {
    const parts = [q.query];
    if (q.yearFrom || q.yearTo) parts.push(`publicationYear:[${q.yearFrom ?? 1900} TO ${q.yearTo ?? 2100}]`);
    // Yazılım ve görsel gibi akademik kaynak olmayan türler dışarıda bırakılır
    const p = new URLSearchParams({ query: parts.join(" AND "), "page[size]": String(Math.min(q.limit ?? 20, 50)), "resource-type-id": "text,dataset,dissertation,preprint,report,book,book-chapter,journal-article,conference-paper" });
    return parseDatacite(await getJsonRetry(`https://api.datacite.org/dois?${p}`, { signal }, { retries: 1 }));
  },
};
// ---------------------------------------------------------------------------
// D129: kapsam genişletme — PLOS, Zenodo, HAL, Open Library, INSPIRE-HEP (anahtarsız);
// NASA ADS, Springer Nature, IEEE Xplore (ücretsiz anahtarla; anahtar yoksa atlanır)
// ---------------------------------------------------------------------------

/** Solr/Lucene sorgu dilindeki özel karakterleri etkisizleştirir (kullanıcı metni sorgu sözdizimi olarak yorumlanmasın). */
export function solrEscape(s: string): string {
  return s.replace(/([+\-!(){}[\]^"~*?:\\/]|&&|\|\|)/g, " ").replace(/\s+/g, " ").trim();
}

const first = (v: any): string | null => (Array.isArray(v) ? (v[0] ?? null) : v ?? null);

// PLOS — tamamı açık erişim (CC BY) biyomedikal ve bilim dergileri
export function parsePlos(json: any): SourceRecord[] {
  return (json?.response?.docs ?? []).map((d: any) => {
    const doi = typeof d.id === "string" ? d.id : null;
    const abs = first(d.abstract);
    return finalize({
      type: "article-journal",
      title: first(d.title_display) ?? first(d.title) ?? "",
      authors: (d.author_display ?? []).map((a: string) => splitName(a)),
      year: d.publication_date ? Number(String(d.publication_date).slice(0, 4)) : null,
      month: d.publication_date ? Number(String(d.publication_date).slice(5, 7)) || null : null,
      containerTitle: d.journal ?? null,
      volume: d.volume != null ? String(d.volume) : null,
      issue: d.issue != null ? String(d.issue) : null,
      publisher: "Public Library of Science",
      doi,
      url: doi ? `https://doi.org/${doi}` : null,
      oaUrl: doi ? `https://doi.org/${doi}` : null,
      license: "CC BY 4.0",
      abstract: abs ? String(abs).trim() : null,
      origins: ["plos"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const plos: SourceProvider = {
  id: "plos",
  label: "PLOS",
  async search(q, _cfg, signal) {
    const p = new URLSearchParams({ q: solrEscape(q.query) || "*", wt: "json", rows: String(Math.min(q.limit ?? 20, 50)), fl: "id,title_display,author_display,journal,publication_date,abstract,volume,issue" });
    p.append("fq", "doc_type:full");
    if (q.yearFrom || q.yearTo) p.append("fq", `publication_date:[${q.yearFrom ?? 1900}-01-01T00:00:00Z TO ${q.yearTo ?? 2100}-12-31T23:59:59Z]`);
    return parsePlos(await getJsonRetry(`https://api.plos.org/search?${p}`, { signal }, { retries: 1 }));
  },
};

// Zenodo — CERN’in açık arşivi: makale, tez, rapor, ön baskı, kitap bölümü (yalnız “publication” türü)
const ZENODO_TYPE: Record<string, SourceRecord["type"]> = { article: "article-journal", thesis: "thesis", book: "book", section: "chapter", conferencepaper: "paper-conference", preprint: "preprint", report: "report", workingpaper: "report", technicalnote: "report", deliverable: "report", proposal: "report" };

export function parseZenodo(json: any): SourceRecord[] {
  return (json?.hits?.hits ?? []).map((h: any) => {
    const m = h.metadata ?? {};
    if (m.resource_type?.type && m.resource_type.type !== "publication") return null;
    const sub = String(m.resource_type?.subtype ?? "article");
    const date = String(m.publication_date ?? "");
    const open = m.access_right === "open" || h.access?.record === "public" && h.access?.files === "public";
    const page = h.links?.self_html ?? h.links?.html ?? (h.id ? `https://zenodo.org/records/${h.id}` : null);
    return finalize({
      type: ZENODO_TYPE[sub] ?? "other",
      title: m.title ?? "",
      authors: (m.creators ?? []).map((c: any) => splitName(String(c.name ?? ""))),
      year: /^\d{4}/.test(date) ? Number(date.slice(0, 4)) : null,
      containerTitle: m.journal?.title ?? m.imprint?.title ?? null,
      volume: m.journal?.volume ?? null,
      issue: m.journal?.issue ?? null,
      pages: m.journal?.pages ?? null,
      publisher: m.imprint?.publisher ?? null,
      doi: h.doi ?? m.doi ?? null,
      url: page,
      oaUrl: open ? page : null,
      license: m.license?.id ?? null,
      abstract: m.description ?? null,
      language: m.language ?? null,
      origins: ["zenodo"],
    });
  }).filter((r: SourceRecord | null): r is SourceRecord => !!r && !!r.title);
}

const zenodo: SourceProvider = {
  id: "zenodo",
  label: "Zenodo",
  async search(q, _cfg, signal) {
    let query = solrEscape(q.query);
    if (q.yearFrom || q.yearTo) query += ` AND publication_date:[${q.yearFrom ?? 1900}-01-01 TO ${q.yearTo ?? 2100}-12-31]`;
    if (q.openAccessOnly) query += " AND access_right:open";
    const p = new URLSearchParams({ q: query, size: String(Math.min(q.limit ?? 20, 50)), sort: "bestmatch", type: "publication" });
    return parseZenodo(await getJsonRetry(`https://zenodo.org/api/records?${p}`, { signal }, { retries: 1 }));
  },
};

// HAL — Fransa’nın ulusal açık arşivi (her alandan makale, bildiri, tez; çok dilli)
const HAL_TYPE: Record<string, SourceRecord["type"]> = { ART: "article-journal", COMM: "paper-conference", THESE: "thesis", HDR: "thesis", OUV: "book", COUV: "chapter", REPORT: "report", UNDEFINED: "preprint", PREPRINT: "preprint" };

export function parseHal(json: any): SourceRecord[] {
  return (json?.response?.docs ?? []).map((d: any) => {
    const files: string[] = Array.isArray(d.files_s) ? d.files_s : [];
    return finalize({
      type: HAL_TYPE[String(d.docType_s ?? "")] ?? "other",
      title: first(d.title_s) ?? "",
      authors: (d.authFullName_s ?? []).map((a: string) => splitName(a)),
      year: d.producedDateY_i ? Number(d.producedDateY_i) : null,
      containerTitle: d.journalTitle_s ?? d.conferenceTitle_s ?? null,
      volume: d.volume_s ?? null,
      issue: first(d.issue_s),
      pages: d.page_s ?? null,
      publisher: first(d.publisher_s),
      doi: d.doiId_s ?? null,
      url: d.uri_s ?? null,
      oaUrl: files[0] ?? null,
      abstract: first(d.abstract_s),
      language: first(d.language_s),
      origins: ["hal"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const hal: SourceProvider = {
  id: "hal",
  label: "HAL",
  async search(q, _cfg, signal) {
    const p = new URLSearchParams({ q: solrEscape(q.query) || "*", wt: "json", rows: String(Math.min(q.limit ?? 20, 50)), fl: "title_s,authFullName_s,producedDateY_i,doiId_s,uri_s,abstract_s,journalTitle_s,conferenceTitle_s,docType_s,volume_s,issue_s,page_s,files_s,language_s,publisher_s" });
    if (q.yearFrom || q.yearTo) p.append("fq", `producedDateY_i:[${q.yearFrom ?? 1900} TO ${q.yearTo ?? 2100}]`);
    if (q.openAccessOnly) p.append("fq", "openAccess_bool:true");
    return parseHal(await getJsonRetry(`https://api.archives-ouvertes.fr/search/?${p}`, { signal }, { retries: 1 }));
  },
};

// Open Library — Internet Archive’ın kitap kataloğu (kitap künyesi; okunabilir e-kitap varsa bağlantı)
export function parseOpenLibrary(json: any): SourceRecord[] {
  return (json?.docs ?? []).map((d: any) => finalize({
    type: "book",
    title: [d.title, d.subtitle].filter(Boolean).join(": "),
    authors: (d.author_name ?? []).map((a: string) => splitName(a)),
    year: d.first_publish_year ? Number(d.first_publish_year) : null,
    publisher: first(d.publisher),
    isbn: first(d.isbn),
    url: d.key ? `https://openlibrary.org${d.key}` : null,
    oaUrl: d.ebook_access === "public" && d.key ? `https://openlibrary.org${d.key}` : null,
    language: first(d.language),
    origins: ["openlibrary"],
  })).filter((r: SourceRecord) => r.title);
}

const openlibrary: SourceProvider = {
  id: "openlibrary",
  label: "Open Library",
  async search(q, _cfg, signal) {
    let query = solrEscape(q.query);
    if (q.yearFrom || q.yearTo) query += ` first_publish_year:[${q.yearFrom ?? 1000} TO ${q.yearTo ?? 2100}]`;
    if (q.author) query += ` author:(${solrEscape(q.author)})`;
    const p = new URLSearchParams({ q: query, limit: String(Math.min(q.limit ?? 20, 40)), fields: "key,title,subtitle,author_name,first_publish_year,publisher,isbn,ebook_access,language" });
    return parseOpenLibrary(await getJsonRetry(`https://openlibrary.org/search.json?${p}`, { signal }, { retries: 1 }));
  },
};

// INSPIRE-HEP — yüksek enerji fiziği ve ilgili alanlar
export function parseInspire(json: any): SourceRecord[] {
  return (json?.hits?.hits ?? []).map((h: any) => {
    const m = h.metadata ?? {};
    const pub = (m.publication_info ?? []).find((p: any) => p.journal_title) ?? m.publication_info?.[0] ?? {};
    const docType = String(first(m.document_type) ?? "article");
    const arxiv = m.arxiv_eprints?.[0]?.value ?? null;
    return finalize({
      type: /conference/.test(docType) ? "paper-conference" : /thesis/.test(docType) ? "thesis" : /book chapter/.test(docType) ? "chapter" : /book/.test(docType) ? "book" : /report/.test(docType) ? "report" : pub.journal_title ? "article-journal" : arxiv ? "preprint" : "article-journal",
      title: m.titles?.[0]?.title ?? "",
      authors: (m.authors ?? []).slice(0, 50).map((a: any) => splitName(String(a.full_name ?? ""))),
      year: pub.year ? Number(pub.year) : m.preprint_date ? Number(String(m.preprint_date).slice(0, 4)) : null,
      containerTitle: pub.journal_title ?? null,
      volume: pub.journal_volume ?? null,
      issue: pub.journal_issue ?? null,
      pages: pages(pub.page_start, pub.page_end),
      doi: m.dois?.[0]?.value ?? null,
      arxivId: arxiv,
      url: h.id ? `https://inspirehep.net/literature/${h.id}` : null,
      oaUrl: arxiv ? `https://arxiv.org/abs/${arxiv}` : null,
      abstract: m.abstracts?.[0]?.value ?? null,
      citedByCount: typeof m.citation_count === "number" ? m.citation_count : null,
      origins: ["inspire"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const inspire: SourceProvider = {
  id: "inspire",
  label: "INSPIRE-HEP",
  async search(q, _cfg, signal) {
    let query = q.query.replace(/[()"]/g, " ").trim();
    if (q.yearFrom || q.yearTo) query += ` and date ${q.yearFrom ?? 1900}->${q.yearTo ?? 2100}`;
    // Sıralama verilmez: sorgu varken INSPIRE varsayılan olarak ilgiye göre sıralar
    const p = new URLSearchParams({ q: query, size: String(Math.min(q.limit ?? 20, 50)), fields: "titles,authors.full_name,abstracts,dois,arxiv_eprints,publication_info,document_type,citation_count,preprint_date" });
    return parseInspire(await getJsonRetry(`https://inspirehep.net/api/literature?${p}`, { signal }, { retries: 1 }));
  },
};

// NASA ADS — astronomi, astrofizik, yer bilimleri (ücretsiz anahtar: ADS_API_KEY)
export function parseAds(json: any): SourceRecord[] {
  return (json?.response?.docs ?? []).map((d: any) => {
    const arxiv = (d.identifier ?? []).find((x: string) => /^arXiv:/i.test(x))?.replace(/^arXiv:/i, "") ?? null;
    return finalize({
      type: d.doctype === "phdthesis" || d.doctype === "mastersthesis" ? "thesis" : d.doctype === "inproceedings" ? "paper-conference" : d.doctype === "book" ? "book" : d.doctype === "eprint" ? "preprint" : "article-journal",
      title: first(d.title) ?? "",
      authors: (d.author ?? []).slice(0, 50).map((a: string) => splitName(a)),
      year: d.year ? Number(d.year) : null,
      containerTitle: d.pub ?? null,
      volume: d.volume ?? null,
      issue: d.issue ?? null,
      pages: first(d.page),
      doi: first(d.doi),
      arxivId: arxiv,
      url: d.bibcode ? `https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(d.bibcode)}` : null,
      oaUrl: arxiv ? `https://arxiv.org/abs/${arxiv}` : null,
      abstract: d.abstract ?? null,
      citedByCount: typeof d.citation_count === "number" ? d.citation_count : null,
      origins: ["ads"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const ads: SourceProvider = {
  id: "ads",
  label: "NASA ADS",
  unavailableReason: (cfg) => (cfg.adsKey ? null : "ADS_API_KEY tanımlı değil"),
  silentWhenUnavailable: true,
  async search(q, cfg, signal) {
    let query = q.query.replace(/[()"]/g, " ").trim();
    if (q.yearFrom || q.yearTo) query += ` year:${q.yearFrom ?? 1900}-${q.yearTo ?? 2100}`;
    const p = new URLSearchParams({ q: query, rows: String(Math.min(q.limit ?? 20, 50)), fl: "title,author,year,doi,abstract,pub,volume,issue,page,bibcode,identifier,doctype,citation_count" });
    return parseAds(await getJsonRetry(`https://api.adsabs.harvard.edu/v1/search/query?${p}`, { signal, headers: { Authorization: `Bearer ${cfg.adsKey}` } }, { retries: 1 }));
  },
};

// Springer Nature — Springer, Nature, BMC dergileri ve kitapları (ücretsiz anahtar: SPRINGER_API_KEY)
export function parseSpringer(json: any): SourceRecord[] {
  return (json?.records ?? []).map((r: any) => {
    const abs = typeof r.abstract === "string" ? r.abstract : r.abstract?.p ?? null;
    const html = (r.url ?? []).find((u: any) => u.format === "html")?.value ?? (r.url ?? [])[0]?.value ?? null;
    const ct = String(r.contentType ?? "");
    const open = r.openaccess === "true" || r.openaccess === true;
    return finalize({
      type: /chapter/i.test(ct) ? "chapter" : /book/i.test(ct) ? "book" : /conference/i.test(ct) ? "paper-conference" : "article-journal",
      title: r.title ?? "",
      authors: (r.creators ?? []).map((c: any) => splitName(String(c.creator ?? ""))),
      year: r.publicationDate ? Number(String(r.publicationDate).slice(0, 4)) : null,
      containerTitle: r.publicationName ?? null,
      volume: r.volume ?? null,
      issue: r.number ?? null,
      pages: pages(r.startingPage, r.endingPage),
      publisher: r.publisher ?? "Springer Nature",
      doi: r.doi ?? null,
      isbn: r.isbn ?? r.printIsbn ?? null,
      url: html ?? (r.doi ? `https://doi.org/${r.doi}` : null),
      oaUrl: open ? html ?? (r.doi ? `https://doi.org/${r.doi}` : null) : null,
      abstract: abs,
      language: r.language ?? null,
      origins: ["springer"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const springer: SourceProvider = {
  id: "springer",
  label: "Springer Nature",
  unavailableReason: (cfg) => (cfg.springerKey ? null : "SPRINGER_API_KEY tanımlı değil"),
  silentWhenUnavailable: true,
  async search(q, cfg, signal) {
    let query = q.query.replace(/[()"]/g, " ").trim();
    if (q.openAccessOnly) query += " openaccess:true";
    const p = new URLSearchParams({ q: query, p: String(Math.min(q.limit ?? 20, 50)), api_key: cfg.springerKey! });
    return parseSpringer(await getJsonRetry(`https://api.springernature.com/meta/v2/json?${p}`, { signal }, { retries: 1 }));
  },
};

// IEEE Xplore — mühendislik, elektrik-elektronik, bilgisayar (ücretsiz anahtar: IEEE_API_KEY)
export function parseIeee(json: any): SourceRecord[] {
  return (json?.articles ?? []).map((a: any) => {
    const ct = String(a.content_type ?? "");
    const open = a.access_type === "OPEN_ACCESS" || a.access_type === "Open Access";
    return finalize({
      type: /conference/i.test(ct) ? "paper-conference" : /book/i.test(ct) ? "book" : /standard/i.test(ct) ? "report" : "article-journal",
      title: a.title ?? "",
      authors: (a.authors?.authors ?? []).map((x: any) => splitName(String(x.full_name ?? ""))),
      year: a.publication_year ? Number(a.publication_year) : null,
      containerTitle: a.publication_title ?? null,
      volume: a.volume ?? null,
      issue: a.issue ?? null,
      pages: pages(a.start_page, a.end_page),
      publisher: a.publisher ?? "IEEE",
      doi: a.doi ?? null,
      url: a.html_url ?? (a.doi ? `https://doi.org/${a.doi}` : null),
      oaUrl: open ? a.pdf_url ?? a.html_url ?? null : null,
      abstract: a.abstract ?? null,
      citedByCount: typeof a.citing_paper_count === "number" ? a.citing_paper_count : null,
      origins: ["ieee"],
    });
  }).filter((r: SourceRecord) => r.title);
}

const ieee: SourceProvider = {
  id: "ieee",
  label: "IEEE Xplore",
  unavailableReason: (cfg) => (cfg.ieeeKey ? null : "IEEE_API_KEY tanımlı değil"),
  silentWhenUnavailable: true,
  async search(q, cfg, signal) {
    const p = new URLSearchParams({ querytext: q.query.replace(/[()"]/g, " ").trim(), max_records: String(Math.min(q.limit ?? 20, 50)), apikey: cfg.ieeeKey!, format: "json" });
    if (q.yearFrom) p.set("start_year", String(q.yearFrom));
    if (q.yearTo) p.set("end_year", String(q.yearTo));
    if (q.openAccessOnly) p.set("open_access", "true");
    return parseIeee(await getJsonRetry(`https://ieeexploreapi.ieee.org/api/v1/search/articles?${p}`, { signal }, { retries: 1 }));
  },
};

/* eslint-enable @typescript-eslint/no-explicit-any */

export const PROVIDERS: Record<SourceProviderId, SourceProvider> = {
  openalex, crossref, europepmc, arxiv, doaj, core, openaire, google_books: googleBooks, unpaywall, turkiye,
  eric, dblp, datacite,
  plos, zenodo, hal, openlibrary, inspire, ads, springer, ieee,
};

export const PROVIDER_LABELS: Record<SourceProviderId, string> = Object.fromEntries(
  Object.values(PROVIDERS).map((p) => [p.id, p.label]),
) as Record<SourceProviderId, string>;
